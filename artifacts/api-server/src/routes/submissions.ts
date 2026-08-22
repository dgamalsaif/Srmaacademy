import { Router } from "express";
import { db, registrationsTable, serviceRequestsTable, insertRegistrationSchema, insertServiceRequestSchema } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { sendRegistrationEmail, sendServiceRequestEmail } from "../lib/mailer";
import { requireCoordinator } from "../middlewares/coordinatorAuth";

const router = Router();

/* ── POST /api/registrations ── */
router.post("/registrations", async (req, res) => {
  const parsed = insertRegistrationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة", details: parsed.error.issues });
    return;
  }

  const row = await db.insert(registrationsTable).values(parsed.data).returning();

  sendRegistrationEmail({
    fullName: parsed.data.fullName,
    specialization: parsed.data.specialization,
    email: parsed.data.email,
    whatsapp: parsed.data.whatsapp,
    affiliation: parsed.data.affiliation,
    country: parsed.data.country ?? "",
    city: parsed.data.city ?? "",
    orcid: parsed.data.orcid ?? "",
    researchTitle: parsed.data.researchTitle,
  }).catch(() => {});

  res.status(201).json(row[0]);
});

/* ── GET /api/registrations ── */
router.get("/registrations", requireCoordinator, async (_req, res) => {
  const rows = await db
    .select()
    .from(registrationsTable)
    .orderBy(desc(registrationsTable.createdAt));
  res.json(rows);
});

/* ── PATCH /api/registrations/:id/status ── */
router.patch("/registrations/:id/status", requireCoordinator, async (req, res) => {
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
router.get("/service-requests", requireCoordinator, async (_req, res) => {
  const rows = await db
    .select()
    .from(serviceRequestsTable)
    .orderBy(desc(serviceRequestsTable.createdAt));
  res.json(rows);
});

/* ── PATCH /api/service-requests/:id/status ── */
router.patch("/service-requests/:id/status", requireCoordinator, async (req, res) => {
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
