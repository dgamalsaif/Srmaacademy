import { db, researchProgramsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

export interface ResearchOpportunityImportRow {
  specialtyAr: string;
  specialtyEn: string;
  title: string;
  totalSeats: number;
  seatsLeft: number;
}

export const PROGRAM_CATALOG_LOCK_ID = 902173;

function importKey(title: string, specialtyEn: string) {
  return `${title.trim().toLocaleLowerCase()}::${specialtyEn.trim().toLocaleLowerCase()}`;
}

export async function importResearchOpportunities(rows: ResearchOpportunityImportRow[]) {
  return db.transaction(async (tx) => {
    // This is intentionally the same transaction lock used by catalog bootstrap.
    // It serializes the read-and-insert operation, including a first catalog read.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${PROGRAM_CATALOG_LOCK_ID})`);
    const existing = await tx.select({
      titleEn: researchProgramsTable.titleEn,
      specialtyEn: researchProgramsTable.specialtyEn,
    }).from(researchProgramsTable);
    const existingKeys = new Set(existing.map((row) => importKey(row.titleEn, row.specialtyEn)));
    const seenKeys = new Set<string>();
    const values = rows.flatMap((row) => {
      const title = row.title.trim();
      const specialtyAr = row.specialtyAr.trim();
      const specialtyEn = row.specialtyEn.trim();
      const key = importKey(title, specialtyEn);
      if (!title || !specialtyAr || !specialtyEn || existingKeys.has(key) || seenKeys.has(key)) return [];
      seenKeys.add(key);
      return [{
        category: "active",
        titleAr: title,
        titleEn: title,
        specialtyAr,
        specialtyEn,
        descriptionAr: "",
        descriptionEn: "",
        seatsLeft: Math.max(0, Math.min(Math.trunc(row.seatsLeft), Math.trunc(row.totalSeats))),
        totalSeats: Math.max(0, Math.trunc(row.totalSeats)),
        status: "open",
        journalTarget: "",
        journalIssn: "",
        journalPubmed: "",
        journalScopus: "",
        journalWos: "",
        indexedIn: "",
        benefits: "",
        duration: "",
        supervisor: "",
      }];
    });
    const inserted = values.length ? await tx.insert(researchProgramsTable).values(values).returning({ id: researchProgramsTable.id, titleEn: researchProgramsTable.titleEn }) : [];
    return { inserted, skipped: rows.length - values.length };
  });
}

export { importKey };