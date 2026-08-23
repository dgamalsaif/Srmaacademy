import { raw, Router, type Request } from "express";
import { db, insertResearchProgramSchema, programCatalogBootstrapTable, researchProgramsTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { readSession, requireOwner } from "../middlewares/coordinatorAuth";
import { getSiteContentSettings, OpportunityFieldId } from "../lib/siteContentSettings";
import { importResearchOpportunities, PROGRAM_CATALOG_LOCK_ID, type ResearchOpportunityImportRow } from "../lib/researchOpportunityImport";
import { getResearchImageUrl, ResearchImageValidationError, resolveResearchImageUploadToken, uploadResearchImage } from "../lib/researchImageStorage";
import { ensureProgramCapacityModel } from "../lib/programCapacity";

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
    imageUrl: row.imagePath ? `/api/programs/${row.id}/image` : "",
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

router.get("/programs", async (req, res) => {
  const rows = await listPrograms();
  const isStaff = Boolean(readSession(req.cookies?.srma_coordinator_session));
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
  const isStaff = Boolean(readSession(req.cookies?.srma_coordinator_session));
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

router.get("/programs/:id/share", async (req, res) => {
  const id = Number(req.params["id"]);
  const [program] = await db.select().from(researchProgramsTable).where(eq(researchProgramsTable.id, id)).limit(1);
  const isStaff = Boolean(readSession(req.cookies?.srma_coordinator_session));
  if (!program || (!isStaff && !isPublicProgram(program))) {
    res.status(404).type("html").send("<!doctype html><title>Not found</title>");
    return;
  }

  const origin = requestOrigin(req);
  const destination = `${origin}/research/${program.id}`;
  const title = program.titleAr || program.titleEn || "فرصة بحثية من SRMA";
  const description = program.descriptionAr || program.descriptionEn || "اكتشف فرصة بحثية جديدة من SRMA Research Academy.";
  const image = program.imagePath ? `${origin}/api/programs/${program.id}/image` : `${origin}/srma-logo.jpg`;

  res.setHeader("Cache-Control", "no-store");
  res.type("html").send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)} | SRMA Research Academy</title>
  <meta name="description" content="${escapeHtml(description.slice(0, 180))}">
  <link rel="canonical" href="${escapeHtml(destination)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SRMA Research Academy">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description.slice(0, 180))}">
  <meta property="og:url" content="${escapeHtml(destination)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description.slice(0, 180))}">
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
  const rows: ResearchOpportunityImportRow[] = req.body.rows.flatMap((row: unknown) => {
    if (!row || typeof row !== "object") return [];
    const value = row as Record<string, unknown>;
    const totalSeats = Number(value.totalSeats);
    const seatsLeft = Number(value.seatsLeft);
    if (typeof value.specialtyAr !== "string" || typeof value.specialtyEn !== "string" || typeof value.title !== "string" || !Number.isFinite(totalSeats) || !Number.isFinite(seatsLeft)) return [];
    return [{ specialtyAr: value.specialtyAr, specialtyEn: value.specialtyEn, title: value.title, totalSeats, seatsLeft }];
  });
  if (!rows.length) {
    res.status(400).json({ error: "لم يتم العثور على صفوف صالحة للاستيراد." });
    return;
  }
  const result = await importResearchOpportunities(rows);
  res.status(201).json({ ...result, received: req.body.rows.length });
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
  const [current] = await db.select().from(researchProgramsTable).where(eq(researchProgramsTable.id, id)).limit(1);
  if (!current) {
    res.status(404).json({ error: "الفرصة غير موجودة" });
    return;
  }
  if (parsed.data.status && !isProgramStatus(parsed.data.status)) {
    res.status(400).json({ error: "حالة البحث غير معتمدة." });
    return;
  }
  const priceOriginalSar = parsed.data.priceOriginalSar ?? current.priceOriginalSar;
  const priceDiscountedSar = parsed.data.priceDiscountedSar ?? current.priceDiscountedSar;
  if (priceOriginalSar < priceDiscountedSar || priceDiscountedSar < 0) {
    res.status(400).json({ error: "يجب أن يكون السعر المخفض موجباً وأقل من السعر الأساسي." });
    return;
  }
  const missingFields = await validateRequiredProgramFields({ ...current, ...parsed.data });
  if (missingFields.length) {
    res.status(400).json({ error: "يرجى تعبئة الحقول الإلزامية للفرصة", fields: missingFields });
    return;
  }
  const [row] = await db.update(researchProgramsTable).set(parsed.data).where(eq(researchProgramsTable.id, id)).returning();
  res.json(toClient(row));
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