import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";
import { db, researchProgramsTable } from "@workspace/db";
import { resolveResearchImageUploadToken, uploadResearchImage } from "../src/lib/researchImageStorage";

type CatalogRow = {
  number: number;
  specialtyAr: string;
  specialtyEn: string;
  title: string;
  totalSeats: number;
  seatsLeft: number;
};

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (character === "\"" && quoted && next === "\"") {
      value += "\"";
      index += 1;
    } else if (character === "\"") {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  if (value || row.length) rows.push([...row, value.trim()]);
  return rows;
}

function toCatalogRows(csv: string): CatalogRow[] {
  return parseCsv(csv).slice(1).map((columns) => {
    const [specialtyAr = "", specialtyEn = ""] = (columns[1] || "").split(/\s+[–-]\s+/);
    return {
      number: Number(columns[0]),
      specialtyAr: specialtyAr.trim(),
      specialtyEn: specialtyEn.trim() || specialtyAr.trim(),
      title: (columns[2] || "").trim(),
      totalSeats: Number.parseInt((columns[3] || "0").replace(/\D/g, ""), 10),
      seatsLeft: Number.parseInt((columns[4] || "0").replace(/\D/g, ""), 10),
    };
  }).filter((row) => row.number > 0 && row.title && row.specialtyAr && row.specialtyEn);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(scriptDir, "..");
const workspaceDir = path.resolve(apiDir, "../..");
const csvPath = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(workspaceDir, "attached_assets/table_20260823_(2)_1787501923273.csv");
const imageDirectory = process.argv[3]
  ? path.resolve(process.cwd(), process.argv[3])
  : path.join(workspaceDir, "attached_assets/generated_images/srma-opportunities-4x3");

async function main() {
  const catalog = toCatalogRows(await readFile(csvPath, "utf8"));
  if (catalog.length !== 45) {
    throw new Error(`Expected 45 valid catalog rows, received ${catalog.length}.`);
  }

  const programs = await db.select({
    id: researchProgramsTable.id,
    titleEn: researchProgramsTable.titleEn,
    imagePath: researchProgramsTable.imagePath,
  }).from(researchProgramsTable);
  const programsByTitle = new Map(programs.map((program) => [program.titleEn.trim().toLocaleLowerCase(), program]));
  const missing = catalog.filter((row) => !programsByTitle.has(row.title.toLocaleLowerCase()));
  if (missing.length) {
    throw new Error(`No matching program was found for: ${missing.map((row) => row.number).join(", ")}.`);
  }

  let uploaded = 0;
  for (const row of catalog) {
    const program = programsByTitle.get(row.title.toLocaleLowerCase())!;
    const imagePath = path.join(imageDirectory, `opportunity-${String(row.number).padStart(3, "0")}.jpg`);
    const imageData = await readFile(imagePath);
    const upload = await uploadResearchImage({ data: imageData, contentType: "image/jpeg" });
    const storedImagePath = resolveResearchImageUploadToken(upload.imageToken);
    const firstAuthorSeats = Math.min(1, row.totalSeats);
    const firstAuthorSeatsLeft = Math.min(firstAuthorSeats, row.seatsLeft);
    const coAuthorSeats = Math.max(0, row.totalSeats - firstAuthorSeats);
    const coAuthorSeatsLeft = Math.max(0, row.seatsLeft - firstAuthorSeatsLeft);

    await db.update(researchProgramsTable).set({
      titleAr: row.title,
      titleEn: row.title,
      specialtyAr: row.specialtyAr,
      specialtyEn: row.specialtyEn,
      totalSeats: row.totalSeats,
      seatsLeft: row.seatsLeft,
      firstAuthorSeats,
      firstAuthorSeatsLeft,
      coAuthorSeats,
      coAuthorSeatsLeft,
      status: row.seatsLeft === 0 ? "seats_full" : "open",
      imagePath: storedImagePath,
      updatedAt: new Date(),
    }).where(eq(researchProgramsTable.id, program.id));
    uploaded += 1;
    console.log(`Synced ${row.number}/45`);
  }

  console.log(JSON.stringify({ updated: catalog.length, imagesUploaded: uploaded }));
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});