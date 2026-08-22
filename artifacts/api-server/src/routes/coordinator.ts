import { Router } from "express";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { db, coordinatorsTable, serviceRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  clearCoordinatorCookie, createSession, readSession, setCoordinatorCookie, requireCoordinator, requireOwner,
} from "../middlewares/coordinatorAuth";

const router = Router();

router.post("/coordinator/login", async (req, res) => {
  const rawPassword = typeof req.body?.password === "string" ? req.body.password.trim() : "";
  const accessCode = rawPassword.toUpperCase();
  const ownerPassword = process.env["OWNER_ADMIN_PASSWORD"] || "";
  const normalizedOwnerInput = rawPassword.replace(/\s+/g, "").toUpperCase();
  const normalizedOwnerPassword = ownerPassword.replace(/\s+/g, "").toUpperCase();
  if (!rawPassword) {
    res.status(401).json({ error: "رمز الدخول غير صحيح. يرجى التحقق والمحاولة مجدداً." });
    return;
  }

  if (normalizedOwnerPassword && normalizedOwnerInput === normalizedOwnerPassword) {
    setCoordinatorCookie(res, createSession("owner"));
    res.json({ authenticated: true, role: "owner" });
    return;
  }

  const coordinators = await db.select().from(coordinatorsTable).where(eq(coordinatorsTable.status, "active"));
  const hash = accessCodeHash(accessCode);
  const coordinator = coordinators.find((item) => {
    const actual = Buffer.from(item.accessCodeHash);
    const expected = Buffer.from(hash);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });
  if (!coordinator) {
    res.status(401).json({ error: "رمز الدخول غير صحيح أو غير معتمد." });
    return;
  }

  await db.update(coordinatorsTable).set({ lastLoginAt: new Date() }).where(eq(coordinatorsTable.id, coordinator.id));
  setCoordinatorCookie(res, createSession("coordinator", coordinator.id));
  res.json({ authenticated: true, role: "coordinator", coordinator: { fullName: coordinator.fullName } });
});

router.post("/coordinator/logout", (_req, res) => {
  clearCoordinatorCookie(res);
  res.json({ authenticated: false });
});

router.get("/coordinator/session", async (req, res) => {
  const session = readSession(req.cookies?.srma_coordinator_session);
  const [coordinator] = session?.role === "coordinator" && session.coordinatorId
    ? await db.select({ fullName: coordinatorsTable.fullName })
      .from(coordinatorsTable)
      .where(eq(coordinatorsTable.id, session.coordinatorId))
      .limit(1)
    : [];
  res.json({
    authenticated: Boolean(session),
    role: session?.role || null,
    coordinatorId: session?.coordinatorId || null,
    coordinatorName: coordinator?.fullName || null,
  });
});

router.post("/coordinator/change-name", requireCoordinator, async (req, res) => {
  const session = readSession(req.cookies?.srma_coordinator_session);
  if (!session || session.role !== "coordinator" || !session.coordinatorId) {
    res.status(403).json({ error: "تعديل اسم المالك يتم من إعدادات المنصة." });
    return;
  }
  const fullName = typeof req.body?.fullName === "string" ? req.body.fullName.trim().replace(/\s+/g, " ") : "";
  if (fullName.length < 3) {
    res.status(400).json({ error: "يرجى إدخال اسم صحيح من 3 أحرف على الأقل." });
    return;
  }
  const [coordinator] = await db.update(coordinatorsTable)
    .set({ fullName })
    .where(eq(coordinatorsTable.id, session.coordinatorId))
    .returning({ fullName: coordinatorsTable.fullName });
  if (!coordinator) {
    res.status(404).json({ error: "حساب المنسق غير موجود." });
    return;
  }
  res.json({ ok: true, fullName: coordinator.fullName });
});

router.post("/coordinator/change-access-code", requireCoordinator, async (req, res) => {
  const session = readSession(req.cookies?.srma_coordinator_session);
  if (!session || session.role !== "coordinator" || !session.coordinatorId) {
    res.status(403).json({ error: "تغيير رمز المالك يتم من إعدادات المنصة." });
    return;
  }
  const currentCode = typeof req.body?.currentCode === "string" ? req.body.currentCode.trim().toUpperCase() : "";
  const newCode = typeof req.body?.newCode === "string" ? req.body.newCode.trim().toUpperCase() : "";
  if (newCode.length < 8) {
    res.status(400).json({ error: "يجب ألا يقل رمز الدخول الجديد عن 8 أحرف." });
    return;
  }
  const [coordinator] = await db.select().from(coordinatorsTable).where(eq(coordinatorsTable.id, session.coordinatorId)).limit(1);
  if (!coordinator || !safeHashMatch(coordinator.accessCodeHash, accessCodeHash(currentCode))) {
    res.status(400).json({ error: "رمز الدخول الحالي غير صحيح." });
    return;
  }
  await db.update(coordinatorsTable).set({ accessCodeHash: accessCodeHash(newCode) }).where(eq(coordinatorsTable.id, coordinator.id));
  res.json({ ok: true });
});

router.post("/coordinator-accounts/approve", requireOwner, async (req, res) => {
  const requestId = Number(req.body?.requestId);
  if (!Number.isInteger(requestId) || requestId <= 0) {
    res.status(400).json({ error: "رقم الطلب غير صحيح" });
    return;
  }

  const [request] = await db.select().from(serviceRequestsTable).where(eq(serviceRequestsTable.id, requestId)).limit(1);
  if (!request || !request.serviceType.includes("منسق")) {
    res.status(404).json({ error: "طلب المنسق غير موجود" });
    return;
  }

  const code = `SRMA-${randomBytes(3).toString("hex").toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const [coordinator] = await db.insert(coordinatorsTable).values({
    fullName: request.fullName,
    phone: request.phone,
    email: request.email,
    affiliation: request.details.replace(/^.*جهة الانتساب:\s*/, "").trim(),
    accessCodeHash: accessCodeHash(code),
  }).returning();
  await db.update(serviceRequestsTable).set({ status: "approved" }).where(eq(serviceRequestsTable.id, requestId));
  res.status(201).json({ coordinator, accessCode: code });
});

function accessCodeHash(code: string) {
  return createHmac("sha256", process.env["SESSION_SECRET"] || "srma-development-secret").update(code).digest("hex");
}

function safeHashMatch(actualHash: string, expectedHash: string) {
  const actual = Buffer.from(actualHash);
  const expected = Buffer.from(expectedHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export default router;