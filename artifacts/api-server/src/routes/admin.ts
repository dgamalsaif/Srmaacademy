import { createHmac, randomBytes } from "node:crypto";
import { Router } from "express";
import {
  coordinatorPortalSettingsTable,
  coordinatorsTable,
  db,
  ownerAccountsTable,
  paymentRecordsTable,
  registrationsTable,
  researchProgramsTable,
  serviceRequestsTable,
} from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireOwner } from "../middlewares/coordinatorAuth";

const router = Router();
const coordinatorStatuses = new Set(["active", "disabled"]);
const serviceStatuses = new Set(["pending", "contacted", "approved", "rejected"]);

function positiveId(raw: string | string[] | undefined) {
  if (Array.isArray(raw)) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function accessCodeHash(code: string) {
  return createHmac("sha256", process.env["SESSION_SECRET"] || "srma-development-secret")
    .update(code)
    .digest("hex");
}

router.get("/admin/coordinators", requireOwner, async (_req, res) => {
  const coordinators = await db.select().from(coordinatorsTable).orderBy(desc(coordinatorsTable.createdAt));
  const rows = await Promise.all(coordinators.map(async ({ accessCodeHash: _accessCodeHash, ...coordinator }) => {
    const registrations = await db.select({ id: registrationsTable.id })
      .from(registrationsTable)
      .where(eq(registrationsTable.coordinatorId, coordinator.id));
    return { ...coordinator, registrationCount: registrations.length };
  }));
  res.json(rows);
});

router.patch("/admin/coordinators/:id", requireOwner, async (req, res) => {
  const id = positiveId(req.params["id"]);
  if (!id) {
    res.status(400).json({ error: "رقم المنسق غير صحيح." });
    return;
  }

  const source = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
  const updates: Record<string, string> = {};
  for (const key of ["fullName", "phone", "email", "affiliation"] as const) {
    if (key in source && typeof source[key] === "string") updates[key] = source[key].trim();
  }
  if ("status" in source && typeof source.status === "string" && coordinatorStatuses.has(source.status)) {
    updates.status = source.status;
  }
  if (!Object.keys(updates).length) {
    res.status(400).json({ error: "لم يتم إرسال بيانات صالحة للتعديل." });
    return;
  }
  if (updates.fullName !== undefined && updates.fullName.length < 3) {
    res.status(400).json({ error: "اسم المنسق قصير جداً." });
    return;
  }
  if (updates.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
    res.status(400).json({ error: "البريد الإلكتروني غير صحيح." });
    return;
  }

  const [updated] = await db.update(coordinatorsTable).set(updates).where(eq(coordinatorsTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "حساب المنسق غير موجود." });
    return;
  }
  const { accessCodeHash: _accessCodeHash, ...safeCoordinator } = updated;
  res.json(safeCoordinator);
});

router.post("/admin/coordinators/:id/reset-access-code", requireOwner, async (req, res) => {
  const id = positiveId(req.params["id"]);
  if (!id) {
    res.status(400).json({ error: "رقم المنسق غير صحيح." });
    return;
  }
  const accessCode = `SRMA-${randomBytes(3).toString("hex").toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const [updated] = await db.update(coordinatorsTable)
    .set({ accessCodeHash: accessCodeHash(accessCode) })
    .where(eq(coordinatorsTable.id, id))
    .returning({ id: coordinatorsTable.id });
  if (!updated) {
    res.status(404).json({ error: "حساب المنسق غير موجود." });
    return;
  }
  res.json({ id: updated.id, accessCode });
});

router.delete("/admin/coordinators/:id", requireOwner, async (req, res) => {
  const id = positiveId(req.params["id"]);
  if (!id) {
    res.status(400).json({ error: "رقم المنسق غير صحيح." });
    return;
  }
  const [linkedRegistration] = await db.select({ id: registrationsTable.id })
    .from(registrationsTable)
    .where(eq(registrationsTable.coordinatorId, id))
    .limit(1);
  if (linkedRegistration) {
    res.status(409).json({ error: "لا يمكن حذف منسق لديه تسجيلات مرتبطة. عطّل الحساب للحفاظ على سجل البيانات." });
    return;
  }
  const [deleted] = await db.delete(coordinatorsTable).where(eq(coordinatorsTable.id, id)).returning({ id: coordinatorsTable.id });
  if (!deleted) {
    res.status(404).json({ error: "حساب المنسق غير موجود." });
    return;
  }
  res.status(204).end();
});

router.patch("/admin/service-requests/:id", requireOwner, async (req, res) => {
  const id = positiveId(req.params["id"]);
  if (!id) {
    res.status(400).json({ error: "رقم الطلب غير صحيح." });
    return;
  }
  const source = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
  const updates: Record<string, string> = {};
  for (const key of ["fullName", "phone", "email", "serviceType", "details", "fileLink"] as const) {
    if (key in source && typeof source[key] === "string") updates[key] = source[key].trim();
  }
  if ("status" in source) {
    if (typeof source.status !== "string" || !serviceStatuses.has(source.status)) {
      res.status(400).json({ error: "حالة طلب الخدمة غير صحيحة." });
      return;
    }
    updates.status = source.status;
  }
  if (!Object.keys(updates).length) {
    res.status(400).json({ error: "لم يتم إرسال بيانات صالحة للتعديل." });
    return;
  }
  const [updated] = await db.update(serviceRequestsTable).set(updates).where(eq(serviceRequestsTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "طلب الخدمة غير موجود." });
    return;
  }
  res.json(updated);
});

router.delete("/admin/service-requests/:id", requireOwner, async (req, res) => {
  const id = positiveId(req.params["id"]);
  if (!id) {
    res.status(400).json({ error: "رقم الطلب غير صحيح." });
    return;
  }
  const [deleted] = await db.delete(serviceRequestsTable).where(eq(serviceRequestsTable.id, id)).returning({ id: serviceRequestsTable.id });
  if (!deleted) {
    res.status(404).json({ error: "طلب الخدمة غير موجود." });
    return;
  }
  res.status(204).end();
});

router.delete("/admin/payments/:id", requireOwner, async (req, res) => {
  const id = positiveId(req.params["id"]);
  if (!id) {
    res.status(400).json({ error: "رقم السجل المالي غير صحيح." });
    return;
  }
  const [deleted] = await db.delete(paymentRecordsTable).where(eq(paymentRecordsTable.id, id)).returning({ id: paymentRecordsTable.id });
  if (!deleted) {
    res.status(404).json({ error: "السجل المالي غير موجود." });
    return;
  }
  res.status(204).end();
});

router.get("/admin/export", requireOwner, async (_req, res) => {
  const [programs, registrations, serviceRequests, payments, coordinators, portalSettings, owners] = await Promise.all([
    db.select().from(researchProgramsTable),
    db.select().from(registrationsTable),
    db.select().from(serviceRequestsTable),
    db.select().from(paymentRecordsTable),
    db.select().from(coordinatorsTable),
    db.select().from(coordinatorPortalSettingsTable),
    db.select().from(ownerAccountsTable),
  ]);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Disposition", `attachment; filename="srma-data-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json({
    exportedAt: new Date().toISOString(),
    programs,
    registrations,
    serviceRequests,
    payments,
    coordinators: coordinators.map(({ accessCodeHash: _accessCodeHash, ...coordinator }) => coordinator),
    portalSettings,
    owners: owners.map(({ clerkUserId: _clerkUserId, ...owner }) => owner),
  });
});

export default router;