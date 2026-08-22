import { Router, type Request, type Response } from "express";
import { db, coordinatorsTable, registrationsTable, researchProgramsTable, serviceRequestsTable, insertRegistrationSchema, insertServiceRequestSchema } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { sendServiceRequestEmail } from "../lib/mailer";
import { readSession, requireCoordinator, requireOwner } from "../middlewares/coordinatorAuth";

const router = Router();

async function createRegistration(req: Request, res: Response, coordinatorId: number | null) {
  const parsed = insertRegistrationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة", details: parsed.error.issues });
    return;
  }

  const [program] = await db.select().from(researchProgramsTable).where(eq(researchProgramsTable.id, parsed.data.researchId)).limit(1);
  if (!program || program.status !== "open") {
    res.status(400).json({ error: "هذه الفرصة غير متاحة للتسجيل حالياً." });
    return;
  }

  const researchTitle = program.titleAr || program.titleEn;
  const row = await db.insert(registrationsTable).values({ ...parsed.data, researchTitle, coordinatorId }).returning();

  res.status(201).json(row[0]);
}

/* ── POST /api/registrations ── */
router.post("/registrations", async (req, res) => {
  const whatsapp = typeof req.body?.whatsapp === "string" ? req.body.whatsapp.trim() : "";
  if (!whatsapp) {
    res.status(400).json({ error: "رقم واتساب مطلوب للتسجيل العام." });
    return;
  }
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

  res.json(rows.map((registration) => ({
    ...registration,
    coordinatorName: session.role === "owner" && registration.coordinatorId
      ? coordinatorNames.get(registration.coordinatorId) || "منسق سابق"
      : null,
    registrationSource: registration.coordinatorId ? "coordinator" : "public",
  })));
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
