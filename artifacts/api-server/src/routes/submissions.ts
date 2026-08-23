import { Router, type Request, type Response } from "express";
import { db, coordinatorsTable, registrationsTable, researchProgramsTable, serviceRequestsTable, insertRegistrationSchema, insertServiceRequestSchema } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { sendServiceRequestEmail } from "../lib/mailer";
import { readSession, requireCoordinator, requireOwner } from "../middlewares/coordinatorAuth";
import { getSiteContentSettings } from "../lib/siteContentSettings";
import { ensureProgramCapacityModel } from "../lib/programCapacity";

const router = Router();
const REGISTRATION_LOCK_NAMESPACE = 4_219_000;
const AUTHOR_ROLES = new Set(["first_author", "co_author"]);

class RegistrationCapacityError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

async function createRegistration(req: Request, res: Response, coordinatorId: number | null) {
  const audience = coordinatorId ? "coordinator" : "participant";
  const settings = await getSiteContentSettings();
  const source = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
  const valueOf = (fieldId: string) => typeof source[fieldId] === "string" ? source[fieldId].trim() : "";

  for (const field of settings.registrationFields) {
    const visible = audience === "participant" ? field.showParticipant : field.showCoordinator;
    const required = audience === "participant" ? field.requiredParticipant : field.requiredCoordinator;
    if (visible && required && !valueOf(field.id)) {
      res.status(400).json({ error: `حقل «${field.label}» مطلوب لإتمام التسجيل.` });
      return;
    }
  }

  const customFields = source.customFields && typeof source.customFields === "object" && !Array.isArray(source.customFields)
    ? Object.fromEntries(Object.entries(source.customFields as Record<string, unknown>)
      .filter(([, value]) => typeof value === "string")
      .map(([key, value]) => [key.slice(0, 64), (value as string).trim().slice(0, 1000)]))
    : {};
  const parsed = insertRegistrationSchema.safeParse({
    ...source,
    fullName: valueOf("fullName"),
    specialization: valueOf("specialization"),
    email: valueOf("email"),
    whatsapp: valueOf("whatsapp"),
    affiliation: valueOf("affiliation"),
    country: valueOf("country") || "المملكة العربية السعودية",
    city: valueOf("city"),
    orcid: valueOf("orcid"),
    customFields,
  });
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة", details: parsed.error.issues });
    return;
  }

  const authorRole = typeof source.authorRole === "string" ? source.authorRole : "co_author";
  if (!AUTHOR_ROLES.has(authorRole)) {
    res.status(400).json({ error: "اختر دور تأليف صحيحاً." });
    return;
  }

  try {
    const row = await db.transaction(async (tx) => {
      await ensureProgramCapacityModel(tx);
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${REGISTRATION_LOCK_NAMESPACE + parsed.data.researchId})`);
      const [program] = await tx.select().from(researchProgramsTable).where(eq(researchProgramsTable.id, parsed.data.researchId)).limit(1);
      if (!program || program.status !== "open") {
        throw new RegistrationCapacityError("هذه الفرصة غير متاحة للتسجيل حالياً.");
      }

      const isFirstAuthor = authorRole === "first_author";
      const selectedSeatsLeft = isFirstAuthor ? program.firstAuthorSeatsLeft : program.coAuthorSeatsLeft;
      if (selectedSeatsLeft < 1 || program.seatsLeft < 1) {
        throw new RegistrationCapacityError(isFirstAuthor ? "مقعد الكاتب الأول غير متاح حالياً." : "مقاعد المؤلفين المشاركين اكتملت.");
      }

      const firstAuthorSeatsLeft = program.firstAuthorSeatsLeft - (isFirstAuthor ? 1 : 0);
      const coAuthorSeatsLeft = program.coAuthorSeatsLeft - (isFirstAuthor ? 0 : 1);
      const seatsLeft = firstAuthorSeatsLeft + coAuthorSeatsLeft;
      const researchTitle = program.titleAr || program.titleEn;
      const [registration] = await tx.insert(registrationsTable).values({
        ...parsed.data,
        authorRole,
        researchTitle,
        coordinatorId,
      }).returning();
      await tx.update(researchProgramsTable).set({
        firstAuthorSeatsLeft,
        coAuthorSeatsLeft,
        seatsLeft,
        status: seatsLeft === 0 ? "seats_full" : program.status,
        updatedAt: new Date(),
      }).where(eq(researchProgramsTable.id, program.id));
      return registration;
    });
    res.status(201).json(row);
  } catch (error) {
    if (error instanceof RegistrationCapacityError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    req.log.error({ err: error, researchId: parsed.data.researchId }, "Could not reserve a research opportunity seat");
    res.status(500).json({ error: "تعذر حجز المقعد الآن. يرجى المحاولة مرة أخرى." });
  }
}

/* ── POST /api/registrations ── */
router.post("/registrations", async (req, res) => {
  await createRegistration(req, res, null);
});

/* ── POST /api/coordinator/registrations ── */
router.post("/coordinator/registrations", requireCoordinator, async (req, res) => {
  const session = readSession(req.cookies?.srma_coordinator_session);
  const coordinatorId = session?.role === "coordinator" && session.coordinatorId ? session.coordinatorId : null;
  await createRegistration(req, res, coordinatorId);
});

/* ── GET /api/registrations ── */
router.get("/registrations", requireCoordinator, async (req, res) => {
  const session = readSession(req.cookies?.srma_coordinator_session);
  if (!session) {
    res.status(401).json({ error: "يلزم تسجيل دخول المنسق" });
    return;
  }

  const rows = session.role === "coordinator"
    ? await db.select().from(registrationsTable)
      .where(eq(registrationsTable.coordinatorId, session.coordinatorId))
      .orderBy(desc(registrationsTable.createdAt))
    : await db.select().from(registrationsTable).orderBy(desc(registrationsTable.createdAt));

  const coordinators = session.role === "owner"
    ? await db.select({ id: coordinatorsTable.id, fullName: coordinatorsTable.fullName }).from(coordinatorsTable)
    : [];
  const coordinatorNames = new Map(coordinators.map((coordinator) => [coordinator.id, coordinator.fullName]));
  const programs = await db.select({
    id: researchProgramsTable.id,
    titleAr: researchProgramsTable.titleAr,
    titleEn: researchProgramsTable.titleEn,
    status: researchProgramsTable.status,
    category: researchProgramsTable.category,
  }).from(researchProgramsTable);
  const programById = new Map(programs.map((program) => [program.id, program]));

  res.json(rows.map((registration) => ({
    ...registration,
    researchTitle: programById.get(registration.researchId)?.titleAr || programById.get(registration.researchId)?.titleEn || registration.researchTitle,
    researchStatus: programById.get(registration.researchId)?.status || "",
    researchCategory: programById.get(registration.researchId)?.category || "active",
    coordinatorName: session.role === "owner" && registration.coordinatorId
      ? coordinatorNames.get(registration.coordinatorId) || "منسق سابق"
      : null,
    registrationSource: registration.coordinatorId ? "coordinator" : "public",
  })));
});

/* ── PATCH /api/registrations/:id ──
 * Coordinators may edit only registrations they created. The owner is
 * intentionally kept on the status-only endpoint below.
 */
router.patch("/registrations/:id", requireCoordinator, async (req, res) => {
  const session = readSession(req.cookies?.srma_coordinator_session);
  if (!session) {
    res.status(401).json({ error: "يلزم تسجيل الدخول" });
    return;
  }

  const id = Number(req.params["id"]);
  const [current] = await db.select().from(registrationsTable).where(eq(registrationsTable.id, id)).limit(1);
  if (!current) {
    res.status(404).json({ error: "الطالب غير موجود" });
    return;
  }
  if (session.role === "coordinator" && current.coordinatorId !== session.coordinatorId) {
    res.status(403).json({ error: "لا يمكنك تعديل تسجيل لا يخصك" });
    return;
  }

  const source = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
  const editableKeys = ["fullName", "specialization", "email", "whatsapp", "affiliation", "country", "city", "orcid", "customFields"] as const;
  const updates = Object.fromEntries(editableKeys
    .filter((key) => key in source)
    .map((key) => [key, key === "customFields" ? source[key] : typeof source[key] === "string" ? source[key].trim() : source[key]]));
  const parsed = insertRegistrationSchema.partial().safeParse(updates);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات الطالب غير صحيحة", details: parsed.error.issues });
    return;
  }
  if (!Object.keys(parsed.data).length) {
    res.status(400).json({ error: "لم يتم إرسال أي بيانات للتعديل" });
    return;
  }

  const merged = { ...current, ...parsed.data };
  const requiredFields = ["fullName", "specialization", "email", "affiliation", "country"] as const;
  if (requiredFields.some((field) => typeof merged[field] !== "string" || !merged[field].trim())) {
    res.status(400).json({ error: "الاسم والتخصص والبريد والجهة والدولة حقول مطلوبة." });
    return;
  }

  const [row] = await db.update(registrationsTable).set(parsed.data).where(eq(registrationsTable.id, id)).returning();
  res.json({
    ...row,
    coordinatorName: session.role === "owner" ? null : null,
    registrationSource: row.coordinatorId ? "coordinator" : "public",
  });
});

/* ── DELETE /api/registrations/:id ── */
router.delete("/registrations/:id", requireCoordinator, async (req, res) => {
  const session = readSession(req.cookies?.srma_coordinator_session);
  if (!session) {
    res.status(401).json({ error: "يلزم تسجيل الدخول" });
    return;
  }
  const id = Number(req.params["id"]);
  try {
    await db.transaction(async (tx) => {
      const [candidate] = await tx.select().from(registrationsTable).where(eq(registrationsTable.id, id)).limit(1);
      if (!candidate) throw new RegistrationCapacityError("الطالب غير موجود", 404);
      await ensureProgramCapacityModel(tx);
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${REGISTRATION_LOCK_NAMESPACE + candidate.researchId})`);
      const [current] = await tx.select().from(registrationsTable).where(eq(registrationsTable.id, id)).limit(1);
      if (!current) throw new RegistrationCapacityError("الطالب غير موجود", 404);
      if (session.role === "coordinator" && current.coordinatorId !== session.coordinatorId) {
        throw new RegistrationCapacityError("لا يمكنك حذف تسجيل لا يخصك", 403);
      }

      const [program] = await tx.select().from(researchProgramsTable).where(eq(researchProgramsTable.id, current.researchId)).limit(1);
      await tx.delete(registrationsTable).where(eq(registrationsTable.id, id));
      if (!program) return;

      const firstAuthorSeatsLeft = Math.min(
        program.firstAuthorSeats,
        program.firstAuthorSeatsLeft + (current.authorRole === "first_author" ? 1 : 0),
      );
      const coAuthorSeatsLeft = Math.min(
        program.coAuthorSeats,
        program.coAuthorSeatsLeft + (current.authorRole === "first_author" ? 0 : 1),
      );
      await tx.update(researchProgramsTable).set({
        firstAuthorSeatsLeft,
        coAuthorSeatsLeft,
        seatsLeft: firstAuthorSeatsLeft + coAuthorSeatsLeft,
        status: program.status === "seats_full" && program.category === "active" ? "open" : program.status,
        updatedAt: new Date(),
      }).where(eq(researchProgramsTable.id, program.id));
    });
    res.status(204).end();
  } catch (error) {
    if (error instanceof RegistrationCapacityError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    req.log.error({ err: error, registrationId: id }, "Could not restore a research opportunity seat");
    res.status(500).json({ error: "تعذر حذف التسجيل الآن. يرجى المحاولة مرة أخرى." });
  }
});

/* ── PATCH /api/registrations/:id/status ── */
router.patch("/registrations/:id/status", requireOwner, async (req, res) => {
  const id = Number(req.params["id"]);
  const { status } = req.body as { status: string };
  if (!status) { res.status(400).json({ error: "status required" }); return; }

  const row = await db
    .update(registrationsTable)
    .set({ status })
    .where(eq(registrationsTable.id, id))
    .returning();

  if (!row.length) { res.status(404).json({ error: "not found" }); return; }
  res.json(row[0]);
});

/* ── POST /api/service-requests ── */
router.post("/service-requests", async (req, res) => {
  const parsed = insertServiceRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة", details: parsed.error.issues });
    return;
  }

  const row = await db.insert(serviceRequestsTable).values(parsed.data).returning();

  sendServiceRequestEmail({
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    email: parsed.data.email,
    serviceType: parsed.data.serviceType,
    details: parsed.data.details,
    fileLink: parsed.data.fileLink ?? "",
  }).catch(() => {});

  res.status(201).json(row[0]);
});

/* ── GET /api/service-requests ── */
router.get("/service-requests", requireOwner, async (_req, res) => {
  const rows = await db
    .select()
    .from(serviceRequestsTable)
    .orderBy(desc(serviceRequestsTable.createdAt));
  res.json(rows);
});

/* ── PATCH /api/service-requests/:id/status ── */
router.patch("/service-requests/:id/status", requireOwner, async (req, res) => {
  const id = Number(req.params["id"]);
  const { status } = req.body as { status: string };
  if (!status) { res.status(400).json({ error: "status required" }); return; }

  const row = await db
    .update(serviceRequestsTable)
    .set({ status })
    .where(eq(serviceRequestsTable.id, id))
    .returning();

  if (!row.length) { res.status(404).json({ error: "not found" }); return; }
  res.json(row[0]);
});

export default router;
