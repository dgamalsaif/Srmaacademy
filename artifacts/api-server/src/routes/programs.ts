import { Router } from "express";
import { db, insertResearchProgramSchema, programCatalogBootstrapTable, researchProgramsTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { requireCoordinator, requireOwner } from "../middlewares/coordinatorAuth";
import { getSiteContentSettings, OpportunityFieldId } from "../lib/siteContentSettings";
import { importResearchOpportunities, PROGRAM_CATALOG_LOCK_ID, type ResearchOpportunityImportRow } from "../lib/researchOpportunityImport";

const router = Router();

const INITIAL_PROGRAMS = [
  {
    category: "active", specialtyAr: "طب الطوارئ", specialtyEn: "Emergency Medicine",
    titleAr: "Early Lactate-Guided vs. Standard Hemodynamic Resuscitation in Patients With Sepsis and Septic Shock",
    titleEn: "Early Lactate-Guided vs. Standard Hemodynamic Resuscitation in Patients With Sepsis and Septic Shock",
    descriptionAr: "دراسة مقارنة شاملة بين أسلوبَي الإنعاش الديناميكي الدموي في مرضى الإنتان والصدمة الإنتانية بالأقسام الطارئة.",
    descriptionEn: "", seatsLeft: 2, totalSeats: 12, status: "open", journalTarget: "Journal of Emergency Medicine (Q2)",
    indexedIn: "Scopus|PubMed", benefits: "نشر في مجلة Q2 مفهرسة في Scopus|5 نقاط SCFHS معتمدة|شهادة مشاركة رسمية", duration: "8 أشهر", supervisor: "د. محمد العمري — استشاري طب طوارئ",
  },
  {
    category: "active", specialtyAr: "جراحة التجميل", specialtyEn: "Plastic Surgery",
    titleAr: "Efficacy and Safety of Autologous Fat Grafting for Facial Rejuvenation: A Systematic Review and Meta-Analysis",
    titleEn: "Efficacy and Safety of Autologous Fat Grafting for Facial Rejuvenation: A Systematic Review and Meta-Analysis",
    descriptionAr: "مراجعة منهجية وتحليل شامل لأدلة فاعلية وسلامة حقن الدهون الذاتية لتجديد شباب الوجه.",
    descriptionEn: "", seatsLeft: 2, totalSeats: 12, status: "open", journalTarget: "Aesthetic Surgery Journal (Q1)",
    indexedIn: "PubMed|Scopus|WoS", benefits: "نشر في مجلة Q1 مفهرسة في PubMed|5 نقاط SCFHS معتمدة|تحليل إحصائي كامل مشمول", duration: "10 أشهر", supervisor: "د. سارة القحطاني — استشارية جراحة تجميل",
  },
  {
    category: "active", specialtyAr: "طب الأسنان التحفظي", specialtyEn: "Restorative Dentistry",
    titleAr: "Selective Caries Removal Versus Complete Caries Excavation in Permanent Teeth: A Systematic Review",
    titleEn: "Selective Caries Removal Versus Complete Caries Excavation in Permanent Teeth: A Systematic Review",
    descriptionAr: "مراجعة منهجية تقارن بين تقنية إزالة التسوس الانتقائية والإزالة الكاملة في الأسنان الدائمة.",
    descriptionEn: "", seatsLeft: 6, totalSeats: 12, status: "open", journalTarget: "Journal of Dentistry (Q1)",
    indexedIn: "Scopus|PubMed", benefits: "نشر في مجلة أسنان دولية محكمة|5 نقاط SCFHS معتمدة|دعم البحث المنهجي", duration: "9 أشهر", supervisor: "د. خالد الزهراني — استشاري طب الأسنان التحفظي",
  },
  {
    category: "active", specialtyAr: "طب أسنان الأطفال", specialtyEn: "Pedodontics",
    titleAr: "Bioactive Glass-Based Materials vs. Conventional Materials in Primary Tooth Restorations: A Systematic Review",
    titleEn: "Bioactive Glass-Based Materials vs. Conventional Materials in Primary Tooth Restorations: A Systematic Review",
    descriptionAr: "مراجعة منهجية تقارن مواد الزجاج الحيوي بالمواد التقليدية في حشوات أسنان الأطفال.",
    descriptionEn: "", seatsLeft: 5, totalSeats: 12, status: "open", journalTarget: "International Journal of Paediatric Dentistry (Q2)",
    indexedIn: "Scopus|PubMed", benefits: "نشر في مجلة أطفال دولية محكمة|5 نقاط SCFHS معتمدة|إشراف متخصص", duration: "8 أشهر", supervisor: "د. نورة الدوسري — استشارية أسنان أطفال",
  },
  {
    category: "active", specialtyAr: "جراحة القلب", specialtyEn: "Cardiac Surgery",
    titleAr: "Endoscopic aortic valve replacement with automated annular suture device versus conventional suturing",
    titleEn: "Endoscopic aortic valve replacement with automated annular suture device versus conventional suturing",
    descriptionAr: "دراسة مقارنة بين تقنية استبدال صمام الأبهر بالمنظار مع جهاز الخياطة الحلقية الآلي مقابل تقنية الخياطة التقليدية.",
    descriptionEn: "", seatsLeft: 4, totalSeats: 12, status: "open", journalTarget: "European Journal of Cardio-Thoracic Surgery (Q1)",
    indexedIn: "PubMed|Scopus|WoS", benefits: "نشر في مجلة قلب دولية عالية التصنيف|5 نقاط SCFHS معتمدة|إشراف من جراح قلب", duration: "12 أشهر", supervisor: "د. عبدالرحمن الغامدي — استشاري جراحة القلب والصدر",
  },
  {
    category: "active", specialtyAr: "الأشعة التداخلية", specialtyEn: "Interventional Radiology",
    titleAr: "Safety and Feasibility and Clinical Outcomes of Stenting vs. Angloplasty for critical limb Ischemia",
    titleEn: "Safety and Feasibility and Clinical Outcomes of Stenting vs. Angloplasty for critical limb Ischemia",
    descriptionAr: "دراسة تهدف لتقييم سلامة وجدوى وكفاءة الدعامات مقارنةً بتوسيع الأوعية بالبالون في علاج إقفار الطرف الحرج.",
    descriptionEn: "", seatsLeft: 3, totalSeats: 12, status: "open", journalTarget: "Cardiovascular and Interventional Radiology (Q2)",
    indexedIn: "Scopus|PubMed", benefits: "نشر في مجلة أشعة تداخلية محكمة|5 نقاط SCFHS معتمدة|إشراف متخصص", duration: "10 أشهر", supervisor: "د. فيصل العسيري — استشاري الأشعة التداخلية",
  },
];
const INITIAL_CATALOG_KEY = "initial-program-catalog-v1";

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
    return rows;
  });
}

function toClient(row: typeof researchProgramsTable.$inferSelect) {
  return {
    ...row,
    title: row.titleEn,
    specialty: row.specialtyEn,
    description: row.descriptionAr,
    indexedIn: row.indexedIn.split("|").map((item) => item.trim()).filter(Boolean),
    benefits: row.benefits.split("|").map((item) => item.trim()).filter(Boolean),
    specialtyColor: "bg-emerald-100 text-emerald-700",
    createdAt: row.createdAt.toISOString().slice(0, 10),
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

router.get("/programs", async (_req, res) => {
  const rows = await listPrograms();
  res.json(rows.map(toClient));
});

router.post("/programs", requireOwner, async (req, res) => {
  const body = {
    ...req.body,
    indexedIn: Array.isArray(req.body?.indexedIn) ? req.body.indexedIn.join("|") : req.body?.indexedIn || "",
    benefits: Array.isArray(req.body?.benefits) ? req.body.benefits.join("|") : req.body?.benefits || "",
  };
  const parsed = insertResearchProgramSchema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات الفرصة غير صحيحة", details: parsed.error.issues });
    return;
  }
  const missingFields = await validateRequiredProgramFields(parsed.data as Record<string, unknown>);
  if (missingFields.length) {
    res.status(400).json({ error: "يرجى تعبئة الحقول الإلزامية للفرصة", fields: missingFields });
    return;
  }
  const [row] = await db.insert(researchProgramsTable).values(parsed.data).returning();
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
  const body = {
    ...req.body,
    indexedIn: Array.isArray(req.body?.indexedIn) ? req.body.indexedIn.join("|") : req.body?.indexedIn || "",
    benefits: Array.isArray(req.body?.benefits) ? req.body.benefits.join("|") : req.body?.benefits || "",
    updatedAt: new Date(),
  };
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