import { raw, Router, type Request } from "express";
import { db, insertResearchProgramSchema, programCatalogBootstrapTable, registrationsTable, researchProgramsTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { readSession, requireOwner } from "../middlewares/coordinatorAuth";
import { getManagedOwner } from "../middlewares/ownerAuth";
import { getSiteContentSettings, OpportunityFieldId } from "../lib/siteContentSettings";
import { addImportedSpecialties, importResearchOpportunities, PROGRAM_CATALOG_LOCK_ID, type ResearchOpportunityImportRow } from "../lib/researchOpportunityImport";
import { getResearchImageUrl, ResearchImageValidationError, resolveResearchImageUploadToken, uploadResearchImage } from "../lib/researchImageStorage";
import { ensureProgramCapacityModel, PROGRAM_CAPACITY_LOCK_NAMESPACE, type DatabaseTransaction } from "../lib/programCapacity";

const router = Router();

const INITIAL_PROGRAMS = [
  {
    category: "active", specialtyAr: "طب الطوارئ", specialtyEn: "Emergency Medicine",
    titleAr: "Early Lactate-Guided vs. Standard Hemodynamic Resuscitation in Patients With Sepsis and Septic Shock",
    titleEn: "Early Lactate-Guided vs. Standard Hemodynamic Resuscitation in Patients With Sepsis and Septic Shock",
    descriptionAr: "دراسة مقارنة شاملة بين أسلوبَي الإنعاش الديناميكي الدموي في مرضى الإنتان والصدمة الإنتانية بالأقسام الطارئة.",
    descriptionEn: "", seatsLeft: 15, totalSeats: 15, status: "open", journalTarget: "Journal of Emergency Medicine (Q2)",
    indexedIn: "Scopus|PubMed", benefits: "نشر في مجلة Q2 مفهرسة في Scopus|5 نقاط SCFHS معتمدة|شهادة مشاركة رسمية", duration: "8 أشهر", supervisor: "د. محمد العمري — استشاري طب طوارئ",
  },
  {
    category: "active", specialtyAr: "جراحة التجميل", specialtyEn: "Plastic Surgery",
    titleAr: "Efficacy and Safety of Autologous Fat Grafting for Facial Rejuvenation: A Systematic Review and Meta-Analysis",
    titleEn: "Efficacy and Safety of Autologous Fat Grafting for Facial Rejuvenation: A Systematic Review and Meta-Analysis",
    descriptionAr: "مراجعة منهجية وتحليل شامل لأدلة فاعلية وسلامة حقن الدهون الذاتية لتجديد شباب الوجه.",
    descriptionEn: "", seatsLeft: 15, totalSeats: 15, status: "open", journalTarget: "Aesthetic Surgery Journal (Q1)",
    indexedIn: "PubMed|Scopus|WoS", benefits: "نشر في مجلة Q1 مفهرسة في PubMed|5 نقاط SCFHS معتمدة|تحليل إحصائي كامل مشمول", duration: "10 أشهر", supervisor: "د. سارة القحطاني — استشارية جراحة تجميل",
  },
  {
    category: "active", specialtyAr: "طب الأسنان التحفظي", specialtyEn: "Restorative Dentistry",
    titleAr: "Selective Caries Removal Versus Complete Caries Excavation in Permanent Teeth: A Systematic Review",
    titleEn: "Selective Caries Removal Versus Complete Caries Excavation in Permanent Teeth: A Systematic Review",
    descriptionAr: "مراجعة منهجية تقارن بين تقنية إزالة التسوس الانتقائية والإزالة الكاملة في الأسنان الدائمة.",
    descriptionEn: "", seatsLeft: 15, totalSeats: 15, status: "open", journalTarget: "Journal of Dentistry (Q1)",
    indexedIn: "Scopus|PubMed", benefits: "نشر في مجلة أسنان دولية محكمة|5 نقاط SCFHS معتمدة|دعم البحث المنهجي", duration: "9 أشهر", supervisor: "د. خالد الزهراني — استشاري طب الأسنان التحفظي",
  },
  {
    category: "active", specialtyAr: "طب أسنان الأطفال", specialtyEn: "Pedodontics",
    titleAr: "Bioactive Glass-Based Materials vs. Conventional Materials in Primary Tooth Restorations: A Systematic Review",
    titleEn: "Bioactive Glass-Based Materials vs. Conventional Materials in Primary Tooth Restorations: A Systematic Review",
    descriptionAr: "مراجعة منهجية تقارن مواد الزجاج الحيوي بالمواد التقليدية في حشوات أسنان الأطفال.",
    descriptionEn: "", seatsLeft: 15, totalSeats: 15, status: "open", journalTarget: "International Journal of Paediatric Dentistry (Q2)",
    indexedIn: "Scopus|PubMed", benefits: "نشر في مجلة أطفال دولية محكمة|5 نقاط SCFHS معتمدة|إشراف متخصص", duration: "8 أشهر", supervisor: "د. نورة الدوسري — استشارية أسنان أطفال",
  },
  {
    category: "active", specialtyAr: "جراحة القلب", specialtyEn: "Cardiac Surgery",
    titleAr: "Endoscopic aortic valve replacement with automated annular suture device versus conventional suturing",
    titleEn: "Endoscopic aortic valve replacement with automated annular suture device versus conventional suturing",
    descriptionAr: "دراسة مقارنة بين تقنية استبدال صمام الأبهر بالمنظار مع جهاز الخياطة الحلقية الآلي مقابل تقنية الخياطة التقليدية.",
    descriptionEn: "", seatsLeft: 15, totalSeats: 15, status: "open", journalTarget: "European Journal of Cardio-Thoracic Surgery (Q1)",
    indexedIn: "PubMed|Scopus|WoS", benefits: "نشر في مجلة قلب دولية عالية التصنيف|5 نقاط SCFHS معتمدة|إشراف من جراح قلب", duration: "12 أشهر", supervisor: "د. عبدالرحمن الغامدي — استشاري جراحة القلب والصدر",
  },
  {
    category: "active", specialtyAr: "الأشعة التداخلية", specialtyEn: "Interventional Radiology",
    titleAr: "Safety and Feasibility and Clinical Outcomes of Stenting vs. Angloplasty for critical limb Ischemia",
    titleEn: "Safety and Feasibility and Clinical Outcomes of Stenting vs. Angloplasty for critical limb Ischemia",
    descriptionAr: "دراسة تهدف لتقييم سلامة وجدوى وكفاءة الدعامات مقارنةً بتوسيع الأوعية بالبالون في علاج إقفار الطرف الحرج.",
    descriptionEn: "", seatsLeft: 15, totalSeats: 15, status: "open", journalTarget: "Cardiovascular and Interventional Radiology (Q2)",
    indexedIn: "Scopus|PubMed", benefits: "نشر في مجلة أشعة تداخلية محكمة|5 نقاط SCFHS معتمدة|إشراف متخصص", duration: "10 أشهر", supervisor: "د. فيصل العسيري — استشاري الأشعة التداخلية",
  },
];
const INITIAL_CATALOG_KEY = "initial-program-catalog-v1";
const PROGRAM_STATUSES = new Set([
  "open", "closed", "draft", "upcoming", "seats_full", "ethics_approved",
  "submitted", "under_review", "accepted", "published",
]);

async function listPrograms() {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${PROGRAM_CATALOG_LOCK_ID})`);
    let rows = await tx.select().from(researchProgramsTable).orderBy(desc(researchProgramsTable.createdAt));
    const [bootstrap] = await tx
      .select()
      .from(programCatalogBootstrapTable)
      .where(eq(programCatalogBootstrapTable.key, INITIAL_CATALOG_KEY))
      .limit(1);

    if (!bootstrap) {
      if (rows.length === 0) {
        await tx.insert(researchProgramsTable).values(INITIAL_PROGRAMS);
        rows = await tx.select().from(researchProgramsTable).orderBy(desc(researchProgramsTable.createdAt));
      }
      await tx.insert(programCatalogBootstrapTable).values({ key: INITIAL_CATALOG_KEY });
    }
    await ensureProgramCapacityModel(tx);
    rows = await tx.select().from(researchProgramsTable).orderBy(desc(researchProgramsTable.createdAt));
    return rows;
  });
}

function toClient(row: typeof researchProgramsTable.$inferSelect) {
  return {
    id: row.id,
    category: row.category,
    title: row.titleEn,
    titleAr: row.titleAr,
    titleEn: row.titleEn,
    specialty: row.specialtyEn,
    specialtyAr: row.specialtyAr,
    specialtyEn: row.specialtyEn,
    description: row.descriptionAr,
    descriptionAr: row.descriptionAr,
    descriptionEn: row.descriptionEn,
    seatsLeft: row.seatsLeft,
    totalSeats: row.totalSeats,
    firstAuthorSeats: row.firstAuthorSeats,
    firstAuthorSeatsLeft: row.firstAuthorSeatsLeft,
    coAuthorSeats: row.coAuthorSeats,
    coAuthorSeatsLeft: row.coAuthorSeatsLeft,
    status: row.status,
    priceOriginalSar: row.priceOriginalSar,
    priceDiscountedSar: row.priceDiscountedSar,
    journalTarget: row.journalTarget,
    journalIssn: row.journalIssn,
    journalPubmed: row.journalPubmed,
    journalScopus: row.journalScopus,
    journalWos: row.journalWos,
    indexedIn: row.indexedIn.split("|").map((item) => item.trim()).filter(Boolean),
    benefits: row.benefits.split("|").map((item) => item.trim()).filter(Boolean),
    duration: row.duration,
    supervisor: row.supervisor,
    specialtyColor: "bg-emerald-100 text-emerald-700",
    createdAt: row.createdAt.toISOString().slice(0, 10),
    imageUrl: row.imagePath ? `/api/programs/${row.id}/image` : `/api/programs/${row.id}/poster.svg`,
  };
}

async function validateRequiredProgramFields(data: Record<string, unknown>): Promise<OpportunityFieldId[]> {
  const { requiredOpportunityFields } = await getSiteContentSettings();
  return requiredOpportunityFields.filter((field) => {
    const value = data[field];
    if (Array.isArray(value)) return value.length === 0;
    return typeof value === "string" ? value.trim().length === 0 : value === null || value === undefined;
  });
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  }[character] || character));
}

router.get("/sitemap.xml", async (_req, res) => {
  const rows = (await listPrograms()).filter(isPublicProgram);
  const siteUrl = "https://srmaacademy.com";
  const entries = rows.flatMap((program) => {
    const lastModified = program.updatedAt?.toISOString?.() || program.createdAt.toISOString();
    return ["ar", "en"].map((language) => (
      `  <url><loc>${siteUrl}/research/${program.id}?lang=${language}</loc><lastmod>${lastModified.slice(0, 10)}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
    ));
  }).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
  res.type("application/xml").set("Cache-Control", "public, max-age=3600").send(body);
});

router.get("/programs", async (req, res) => {
  const rows = await listPrograms();
  const isStaff = Boolean(readSession(req.cookies?.srma_coordinator_session)) || Boolean(await getManagedOwner(req));
  res.json((isStaff ? rows : rows.filter(isPublicProgram)).map(toClient));
});

router.post("/program-images/upload", requireOwner, raw({
  type: ["image/jpeg", "image/png", "image/webp"],
  limit: "5mb",
}), async (req, res) => {
  try {
    if (!Buffer.isBuffer(req.body)) {
      throw new ResearchImageValidationError("يرجى اختيار ملف صورة صالح.");
    }
    const upload = await uploadResearchImage({
      data: req.body,
      contentType: req.get("content-type"),
    });
    res.status(201).json(upload);
  } catch (error) {
    if (error instanceof ResearchImageValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    req.log.error({ err: error }, "Failed to create research image upload URL");
    res.status(500).json({ error: "تعذر تجهيز رفع الصورة. حاول مرة أخرى." });
  }
});

router.get("/programs/:id/image", async (req, res) => {
  const id = Number(req.params["id"]);
  const [program] = await db.select().from(researchProgramsTable).where(eq(researchProgramsTable.id, id)).limit(1);
  const isStaff = Boolean(readSession(req.cookies?.srma_coordinator_session)) || Boolean(await getManagedOwner(req));
  if (!program || !program.imagePath || (!isStaff && !isPublicProgram(program))) {
    res.status(404).end();
    return;
  }

  try {
    const imageUrl = await getResearchImageUrl(program.imagePath);
    const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(30_000) });
    if (!imageResponse.ok) throw new Error(`Failed to retrieve research image (status ${imageResponse.status}).`);
    const contentType = imageResponse.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
    if (!contentType || !["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
      throw new Error("Research image storage returned an unexpected content type.");
    }
    const imageBytes = Buffer.from(await imageResponse.arrayBuffer());

    res.setHeader("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Content-Disposition", 'inline; filename="srma-research-image"');
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", String(imageBytes.length));
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.status(200).send(imageBytes);
  } catch (error) {
    req.log.error({ err: error, programId: id }, "Failed to serve research image");
    res.status(404).end();
  }
});

router.get("/programs/:id/poster.svg", async (req, res) => {
  const id = Number(req.params["id"]);
  const [program] = await db.select().from(researchProgramsTable).where(eq(researchProgramsTable.id, id)).limit(1);
  const isStaff = Boolean(readSession(req.cookies?.srma_coordinator_session)) || Boolean(await getManagedOwner(req));
  if (!program || (!isStaff && !isPublicProgram(program))) {
    res.status(404).end();
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Disposition", "inline; filename=\"research-opportunity-poster.svg\"");
  res.type("image/svg+xml").send(buildOpportunityPoster(program));
});

router.get("/programs/:id/share", async (req, res) => {
  const id = Number(req.params["id"]);
  const [program] = await db.select().from(researchProgramsTable).where(eq(researchProgramsTable.id, id)).limit(1);
  const isStaff = Boolean(readSession(req.cookies?.srma_coordinator_session)) || Boolean(await getManagedOwner(req));
  if (!program || (!isStaff && !isPublicProgram(program))) {
    res.status(404).type("html").send("<!doctype html><title>Not found</title>");
    return;
  }

  const origin = requestOrigin(req);
  const english = req.query.lang === "en";
  const destination = `${origin}/research/${program.id}${english ? "?lang=en" : ""}`;
  const title = (english ? program.titleEn : program.titleAr) || program.titleEn || program.titleAr || "Research opportunity from SRMA";
  const specialty = (english ? program.specialtyEn : program.specialtyAr) || program.specialtyEn || program.specialtyAr;
  const description = (english ? program.descriptionEn : program.descriptionAr) || program.descriptionEn || program.descriptionAr || "Discover a new research opportunity from SRMA Research Academy.";
  const image = program.imagePath ? `${origin}/api/programs/${program.id}/image` : `${origin}/srma-logo.jpg`;

  res.setHeader("Cache-Control", "no-store");
  res.type("html").send(`<!doctype html>
<html lang="${english ? "en" : "ar"}" dir="${english ? "ltr" : "rtl"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}${specialty ? ` | ${escapeHtml(specialty)}` : ""} | SRMA Research Academy</title>
  <meta name="description" content="${escapeHtml(`${specialty ? `${specialty} — ` : ""}${description}`.slice(0, 180))}">
  <link rel="canonical" href="${escapeHtml(destination)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SRMA Research Academy">
  <meta property="og:locale" content="${english ? "en_US" : "ar_SA"}">
  <meta property="og:title" content="${escapeHtml(`${title}${specialty ? ` | ${specialty}` : ""}`)}">
  <meta property="og:description" content="${escapeHtml(`${specialty ? `${specialty} — ` : ""}${description}`.slice(0, 180))}">
  <meta property="og:url" content="${escapeHtml(destination)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(`${title}${specialty ? ` | ${specialty}` : ""}`)}">
  <meta name="twitter:description" content="${escapeHtml(`${specialty ? `${specialty} — ` : ""}${description}`.slice(0, 180))}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(destination)}">
</head>
<body><p>جارٍ فتح الفرصة… <a href="${escapeHtml(destination)}">اضغط هنا إن لم يتم التحويل</a></p></body>
</html>`);
});

router.post("/programs", requireOwner, async (req, res) => {
  const body = await normalizeProgramPayload({
    ...req.body,
    indexedIn: Array.isArray(req.body?.indexedIn) ? req.body.indexedIn.join("|") : req.body?.indexedIn || "",
    benefits: Array.isArray(req.body?.benefits) ? req.body.benefits.join("|") : req.body?.benefits || "",
  }, "create");
  const parsed = insertResearchProgramSchema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات الفرصة غير صحيحة", details: parsed.error.issues });
    return;
  }
  const programStatus = parsed.data.status || "open";
  const priceOriginalSar = parsed.data.priceOriginalSar ?? 1500;
  const priceDiscountedSar = parsed.data.priceDiscountedSar ?? 1000;
  if (!isProgramStatus(programStatus)) {
    res.status(400).json({ error: "حالة البحث غير معتمدة." });
    return;
  }
  if (priceOriginalSar < priceDiscountedSar || priceDiscountedSar < 0) {
    res.status(400).json({ error: "يجب أن يكون السعر المخفض موجباً وأقل من السعر الأساسي." });
    return;
  }
  const missingFields = await validateRequiredProgramFields(parsed.data as Record<string, unknown>);
  if (missingFields.length) {
    res.status(400).json({ error: "يرجى تعبئة الحقول الإلزامية للفرصة", fields: missingFields });
    return;
  }
  const [row] = await db.insert(researchProgramsTable).values({ ...parsed.data, status: programStatus, priceOriginalSar, priceDiscountedSar }).returning();
  res.status(201).json(toClient(row));
});

router.post("/programs/import", requireOwner, async (req, res) => {
  if (!Array.isArray(req.body?.rows)) {
    res.status(400).json({ error: "يرجى إرسال قائمة الفرص للاستيراد." });
    return;
  }
  const rows: ResearchOpportunityImportRow[] = req.body.rows.flatMap((row: unknown, index: number) => {
    if (!row || typeof row !== "object") return [];
    const value = row as Record<string, unknown>;
    return [{ ...value, sourceRow: Number(value.sourceRow) || index + 2 }];
  });
  if (!rows.length) {
    res.status(400).json({ error: "لم يتم العثور على صفوف صالحة للاستيراد." });
    return;
  }
  const result = await importResearchOpportunities(rows);
  const specialtyOptions = await addImportedSpecialties(result.insertedSpecialties);
  res.status(201).json({ ...result, inserted: result.inserted.map(toClient), specialtyOptions, received: req.body.rows.length });
});

router.patch("/programs/:id", requireOwner, async (req, res) => {
  const id = Number(req.params["id"]);
  const body = await normalizeProgramPayload({
    ...req.body,
    indexedIn: Array.isArray(req.body?.indexedIn) ? req.body.indexedIn.join("|") : req.body?.indexedIn || "",
    benefits: Array.isArray(req.body?.benefits) ? req.body.benefits.join("|") : req.body?.benefits || "",
    updatedAt: new Date(),
  }, "update");
  const parsed = insertResearchProgramSchema.partial().safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات الفرصة غير صحيحة", details: parsed.error.issues });
    return;
  }
  if (parsed.data.status && !isProgramStatus(parsed.data.status)) {
    res.status(400).json({ error: "حالة البحث غير معتمدة." });
    return;
  }
  try {
    const row = await db.transaction(async (tx) => {
      await ensureProgramCapacityModel(tx);
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${PROGRAM_CAPACITY_LOCK_NAMESPACE + id})`);
      const [current] = await tx.select().from(researchProgramsTable).where(eq(researchProgramsTable.id, id)).limit(1);
      if (!current) throw new ProgramUpdateError("الفرصة غير موجودة", 404);
      const priceOriginalSar = parsed.data.priceOriginalSar ?? current.priceOriginalSar;
      const priceDiscountedSar = parsed.data.priceDiscountedSar ?? current.priceDiscountedSar;
      if (priceOriginalSar < priceDiscountedSar || priceDiscountedSar < 0) {
        throw new ProgramUpdateError("يجب أن يكون السعر المخفض موجباً وأقل من السعر الأساسي.");
      }
      const seatOverride = await getSeatsLeftOverride(req.body?.seatsLeft, current, id, tx);
      if (seatOverride.error) throw new ProgramUpdateError(seatOverride.error);
      const missingFields = await validateRequiredProgramFields({ ...current, ...parsed.data });
      if (missingFields.length) {
        throw new ProgramUpdateError("يرجى تعبئة الحقول الإلزامية للفرصة", 400, missingFields);
      }
      const [row] = await tx.update(researchProgramsTable)
        .set({ ...parsed.data, ...seatOverride.value, totalSeats: 15, firstAuthorSeats: 1, coAuthorSeats: 14 })
        .where(eq(researchProgramsTable.id, id)).returning();
      return row;
    });
    res.json(toClient(row));
  } catch (error) {
    if (error instanceof ProgramUpdateError) {
      res.status(error.status).json({ error: error.message, ...(error.fields?.length ? { fields: error.fields } : {}) });
      return;
    }
    req.log.error({ err: error, programId: id }, "Could not safely update research opportunity");
    res.status(500).json({ error: "تعذر تحديث الفرصة الآن. يرجى المحاولة مرة أخرى." });
  }
});

router.delete("/programs/:id", requireOwner, async (req, res) => {
  const id = Number(req.params["id"]);
  const [row] = await db.delete(researchProgramsTable).where(eq(researchProgramsTable.id, id)).returning();
  if (!row) {
    res.status(404).json({ error: "الفرصة غير موجودة" });
    return;
  }
  res.status(204).end();
});

export default router;

function isPublicProgram(program: typeof researchProgramsTable.$inferSelect) {
  return ["active", "completed"].includes(program.category) && program.status !== "draft";
}

function isProgramStatus(status: string) {
  return PROGRAM_STATUSES.has(status);
}

async function normalizeProgramPayload(source: Record<string, unknown>, mode: "create" | "update") {
  const result: Record<string, unknown> = { ...source };
  const imageToken = source.imageToken;
  delete result.imageToken;
  delete result.imagePath;
  delete result.firstAuthorSeats;
  delete result.firstAuthorSeatsLeft;
  delete result.coAuthorSeats;
  delete result.coAuthorSeatsLeft;
  delete result.totalSeats;
  delete result.seatsLeft;

  if (mode === "create") {
    Object.assign(result, {
      totalSeats: 15,
      seatsLeft: 15,
      firstAuthorSeats: 1,
      firstAuthorSeatsLeft: 1,
      coAuthorSeats: 14,
      coAuthorSeatsLeft: 14,
      priceOriginalSar: numberOrDefault(source.priceOriginalSar, 1500),
      priceDiscountedSar: numberOrDefault(source.priceDiscountedSar, 1000),
    });
  } else {
    if ("priceOriginalSar" in source) result.priceOriginalSar = numberOrDefault(source.priceOriginalSar, 1500);
    if ("priceDiscountedSar" in source) result.priceDiscountedSar = numberOrDefault(source.priceDiscountedSar, 1000);
  }

  if (typeof imageToken === "string") {
    result.imagePath = imageToken ? resolveResearchImageUploadToken(imageToken) : "";
  }

  return result;
}

function numberOrDefault(value: unknown, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) && number >= 0 ? number : fallback;
}

class ProgramUpdateError extends Error {
  constructor(message: string, readonly status = 400, readonly fields?: OpportunityFieldId[]) {
    super(message);
  }
}

async function getSeatsLeftOverride(value: unknown, current: typeof researchProgramsTable.$inferSelect, programId: number, tx: DatabaseTransaction) {
  if (value === undefined || value === null || value === "") return { value: {} };
  const requested = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(requested) || requested < 0 || requested > 15) {
    return { error: "المقاعد المتبقية يجب أن تكون رقماً صحيحاً بين 0 و15." };
  }
  const registrations = await tx.select({ authorRole: registrationsTable.authorRole })
    .from(registrationsTable).where(eq(registrationsTable.researchId, programId));
  const firstAuthorUsed = registrations.filter((registration) => registration.authorRole === "first_author").length;
  const coAuthorUsed = registrations.length - firstAuthorUsed;
  const maximumRemaining = Math.max(0, 15 - registrations.length);
  if (requested > maximumRemaining) {
    return { error: `لا يمكن ضبط المقاعد المتبقية على ${requested}؛ يوجد ${registrations.length} تسجيل محجوز بالفعل.` };
  }
  const firstAuthorCapacity = Math.max(0, 1 - firstAuthorUsed);
  const firstAuthorSeatsLeft = Math.min(firstAuthorCapacity, requested);
  const coAuthorSeatsLeft = Math.min(Math.max(0, 14 - coAuthorUsed), requested - firstAuthorSeatsLeft);
  const seatsLeft = firstAuthorSeatsLeft + coAuthorSeatsLeft;
  return {
    value: {
      seatsLeft,
      firstAuthorSeatsLeft,
      coAuthorSeatsLeft,
      status: seatsLeft === 0 ? "seats_full" : current.status === "seats_full" && current.category !== "completed" ? "open" : current.status,
    },
  };
}

function buildOpportunityPoster(program: typeof researchProgramsTable.$inferSelect) {
  const title = program.titleEn || program.titleAr || "Research opportunity";
  const specialty = program.specialtyAr || program.specialtyEn || "SRMA Research Academy";
  const titleLines = splitPosterText(title, 39, 3);
  const specialtyLines = splitPosterText(specialty, 30, 2);
  const titleSvg = titleLines.map((line, index) => `<text x="90" y="${365 + index * 58}" fill="#ffffff" font-family="Arial, sans-serif" font-size="38" font-weight="700">${escapeXml(line)}</text>`).join("");
  const specialtySvg = specialtyLines.map((line, index) => `<text x="90" y="${245 + index * 42}" fill="#83e6c4" font-family="Arial, sans-serif" font-size="27" font-weight="700">${escapeXml(line)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${escapeXml(title)}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#061b31"/><stop offset=".55" stop-color="#0c3156"/><stop offset="1" stop-color="#092640"/></linearGradient>
      <radialGradient id="glow"><stop stop-color="#13a879" stop-opacity=".7"/><stop offset="1" stop-color="#13a879" stop-opacity="0"/></radialGradient>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="#8ee0c3" stroke-opacity=".12" stroke-width="1"/></pattern>
    </defs>
    <rect width="1200" height="900" fill="url(#bg)"/><rect width="1200" height="900" fill="url(#grid)"/>
    <circle cx="935" cy="330" r="300" fill="url(#glow)"/><circle cx="935" cy="330" r="190" fill="none" stroke="#8ee0c3" stroke-opacity=".45" stroke-width="3"/><circle cx="935" cy="330" r="132" fill="none" stroke="#8ee0c3" stroke-opacity=".26" stroke-width="2"/>
    <path d="M935 160v340M765 330h340M815 210l240 240M1055 210L815 450" stroke="#8ee0c3" stroke-opacity=".18" stroke-width="2"/>
    <rect x="70" y="70" width="430" height="74" rx="20" fill="#0f725a" fill-opacity=".88"/><text x="105" y="118" fill="#ffffff" font-family="Arial, sans-serif" font-size="30" font-weight="800">SRMA RESEARCH ACADEMY</text>
    <text x="90" y="195" fill="#d8f7ed" font-family="Arial, sans-serif" font-size="22" font-weight="700">RESEARCH OPPORTUNITY</text>
    ${specialtySvg}${titleSvg}
    <rect x="90" y="650" width="430" height="118" rx="24" fill="#0b503f" stroke="#8ee0c3" stroke-opacity=".65" stroke-width="2"/>
    <text x="126" y="699" fill="#c8f7e8" font-family="Arial, sans-serif" font-size="24" font-weight="700">AVAILABLE SEATS</text>
    <text x="126" y="747" fill="#ffffff" font-family="Arial, sans-serif" font-size="42" font-weight="800">${program.seatsLeft} / 15</text>
    <text x="90" y="840" fill="#8ee0c3" font-family="Arial, sans-serif" font-size="20">SRMA • Research Academy</text>
  </svg>`;
}

function splitPosterText(value: string, maxLength: number, maxLines: number) {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else line = next;
  }
  if (line && lines.length < maxLines) lines.push(line);
  const used = lines.join(" ").trim();
  if (used.length < value.trim().length && lines.length) lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, Math.max(1, maxLength - 1)).trim()}…`;
  return lines;
}

function requestOrigin(req: Request) {
  const forwardedProtocol = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || req.protocol || "https";
  return `${protocol}://${req.get("host")}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] || character);
}