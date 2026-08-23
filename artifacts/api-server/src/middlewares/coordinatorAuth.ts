import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { getManagedOwner, requireManagedOwner } from "./ownerAuth";

const COOKIE_NAME = "srma_coordinator_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function secret() {
  return process.env["SESSION_SECRET"] || "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function validSignature(value: string, signature: string) {
  const expected = sign(value);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function createCoordinatorSession() {
  return createSession("coordinator");
}

export function createSession(role: "coordinator", coordinatorId?: number) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const value = `${role}:${coordinatorId ?? 0}:${expiresAt}`;
  return `${value}.${sign(value)}`;
}

export function readSession(value?: string) {
  if (!secret() || !value) return null;
  const [expiresAt, signature] = value.split(".");
  if (!expiresAt || !signature || !validSignature(expiresAt, signature)) return null;
  const [role, coordinatorId, expiry] = expiresAt.split(":");
  if (role !== "coordinator" || Number(expiry) < Math.floor(Date.now() / 1000)) return null;
  return { role, coordinatorId: Number(coordinatorId) };
}

export function isCoordinatorSession(value?: string) {
  return Boolean(readSession(value));
}

export type StaffSession =
  | { role: "owner"; coordinatorId: null }
  | { role: "coordinator"; coordinatorId: number };

export async function getStaffSession(req: Request): Promise<StaffSession | null> {
  const owner = await getManagedOwner(req);
  if (owner) return { role: "owner", coordinatorId: null };
  const session = readSession(req.cookies?.[COOKIE_NAME]);
  return session?.role === "coordinator" && session.coordinatorId
    ? { role: "coordinator", coordinatorId: session.coordinatorId }
    : null;
}

export async function requireCoordinator(req: Request, res: Response, next: NextFunction) {
  try {
    const staff = await getStaffSession(req);
    if (staff) {
      res.locals.staff = staff;
      next();
      return;
    }
    res.status(401).json({ error: "يلزم تسجيل دخول المنسق" });
  } catch (error) {
    req.log.error({ err: error }, "Could not authorize staff session");
    res.status(503).json({ error: "تعذر التحقق من الحساب حالياً." });
  }
}

export const requireOwner = requireManagedOwner;

export function setCoordinatorCookie(res: Response, value: string) {
  res.cookie(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    maxAge: SESSION_TTL_SECONDS * 1000,
    path: "/",
  });
}

export function clearCoordinatorCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax", path: "/" });
}

export { COOKIE_NAME };