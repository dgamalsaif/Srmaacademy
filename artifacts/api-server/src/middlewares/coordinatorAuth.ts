import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

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

export function createSession(role: "owner" | "coordinator", coordinatorId?: number) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const value = `${role}:${coordinatorId ?? 0}:${expiresAt}`;
  return `${value}.${sign(value)}`;
}

export function readSession(value?: string) {
  if (!secret() || !value) return null;
  const [expiresAt, signature] = value.split(".");
  if (!expiresAt || !signature || !validSignature(expiresAt, signature)) return null;
  const [role, coordinatorId, expiry] = expiresAt.split(":");
  if ((role !== "owner" && role !== "coordinator") || Number(expiry) < Math.floor(Date.now() / 1000)) return null;
  return { role, coordinatorId: Number(coordinatorId) };
}

export function isCoordinatorSession(value?: string) {
  return Boolean(readSession(value));
}

export function requireCoordinator(req: Request, res: Response, next: NextFunction) {
  if (!readSession(req.cookies?.[COOKIE_NAME])) {
    res.status(401).json({ error: "يلزم تسجيل دخول المنسق" });
    return;
  }
  next();
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (readSession(req.cookies?.[COOKIE_NAME])?.role !== "owner") {
    res.status(403).json({ error: "هذا الإجراء مخصص للإدارة" });
    return;
  }
  next();
}

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