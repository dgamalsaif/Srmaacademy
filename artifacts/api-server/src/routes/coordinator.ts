import { Router } from "express";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { db, coordinatorsTable, serviceRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  clearCoordinatorCookie, createSession, readSession, setCoordinatorCookie, requireOwner,
} from "../middlewares/coordinatorAuth";

const router = Router();

router.post("/coordinator/login", async (req, res) => {
  const accessCode = typeof req.body?.password === "string" ? req.body.password.trim().toUpperCase() : "";
  const ownerPassword = process.env["OWNER_ADMIN_PASSWORD"] || "";
  if (!accessCode) {
    res.status(401).json({ error: "رمز الدخول غير صحيح. يرجى التحقق والمحاولة مجدداً." });
    return;
  }

  if (ownerPassword && accessCode === ownerPassword) {
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

router.get("/coordinator/session", (req, res) => {
  const session = readSession(req.cookies?.srma_coordinator_session);
  res.json({ authenticated: Boolean(session), role: session?.role || null });
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

export default router;