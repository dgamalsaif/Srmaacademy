import { Router } from "express";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { db, coordinatorsTable, ownerAccountsTable, serviceRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  clearCoordinatorCookie, createSession, readSession, setCoordinatorCookie, requireCoordinator, requireOwner,
} from "../middlewares/coordinatorAuth";
import { getManagedOwner } from "../middlewares/ownerAuth";

const router = Router();

router.post("/coordinator/login", async (req, res) => {
  const rawPassword = typeof req.body?.password === "string" ? req.body.password.trim() : "";
  const accessCode = rawPassword.toUpperCase();
  if (!rawPassword) {
    res.status(401).json({ error: "رمز الدخول غير صحيح. يرجى التحقق والمحاولة مجدداً." });
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

router.post("/owner/login", async (req, res) => {
  res.status(410).json({ error: "تم نقل دخول المالك إلى الحساب الموثّق بالبريد الإلكتروني." });
});

router.post("/owner/bootstrap", async (req, res) => {
  const configuredSecret = process.env["OWNER_BOOTSTRAP_SECRET"] || process.env["OWNER_ADMIN_PASSWORD"] || "";
  const submittedSecret = typeof req.body?.bootstrapSecret === "string" ? req.body.bootstrapSecret : "";
  const sameSecret = configuredSecret.length > 0
    && submittedSecret.length === configuredSecret.length
    && timingSafeEqual(Buffer.from(submittedSecret), Buffer.from(configuredSecret));
  if (!sameSecret) {
    res.status(401).json({ error: "تعذر تهيئة حساب المالك." });
    return;
  }

  const [existingOwner] = await db.select({ id: ownerAccountsTable.id }).from(ownerAccountsTable).limit(1);
  if (existingOwner) {
    res.status(409).json({ error: "تمت تهيئة حساب المالك مسبقاً." });
    return;
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const fullName = typeof req.body?.fullName === "string" ? req.body.fullName.trim().replace(/\s+/g, " ") : "";
  const phone = typeof req.body?.phone === "string" ? req.body.phone.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || fullName.length < 3 || phone.length < 7 || phone.length > 32) {
    res.status(400).json({ error: "يرجى إدخال بيانات مالك صحيحة." });
    return;
  }

  await db.insert(ownerAccountsTable).values({ email, fullName, phone, status: "active" });
  res.status(201).json({ initialized: true });
});

router.post("/coordinator/logout", (_req, res) => {
  clearCoordinatorCookie(res);
  res.json({ authenticated: false });
});

router.get("/coordinator/session", async (req, res) => {
  // Authentication state must never be served from a browser cache. A cached
  // anonymous response can otherwise survive a successful Clerk sign-in.
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Vary", "Cookie");

  const owner = await getManagedOwner(req);
  if (owner) {
    res.json({
      authenticated: true,
      role: "owner",
      coordinatorId: null,
      coordinatorName: owner.fullName,
    });
    return;
  }
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

router.get("/owner/profile", requireOwner, async (_req, res) => {
  const owner = res.locals.owner as { fullName: string; email: string; phone: string; clerkUserId: string };
  res.setHeader("Cache-Control", "no-store");
  res.json({ fullName: owner.fullName, email: owner.email, phone: owner.phone, verified: true, clerkUserId: owner.clerkUserId });
});

router.patch("/owner/profile", requireOwner, async (req, res) => {
  const owner = res.locals.owner as { id: number };
  const fullName = typeof req.body?.fullName === "string" ? req.body.fullName.trim().replace(/\s+/g, " ") : "";
  const phone = typeof req.body?.phone === "string" ? req.body.phone.trim() : "";
  if (fullName.length < 3 || phone.length < 7 || phone.length > 32) {
    res.status(400).json({ error: "يرجى إدخال اسم ورقم هاتف صحيحين." });
    return;
  }
  const [updated] = await db.update(ownerAccountsTable)
    .set({ fullName, phone, updatedAt: new Date() })
    .where(eq(ownerAccountsTable.id, owner.id))
    .returning({ fullName: ownerAccountsTable.fullName, email: ownerAccountsTable.email, phone: ownerAccountsTable.phone });
  res.json(updated);
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