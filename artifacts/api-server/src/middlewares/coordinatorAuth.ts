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
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const value = String(expiresAt);
  return `${value}.${sign(value)}`;
}

export function isCoordinatorSession(value?: string) {
  if (!secret() || !value) return false;
  const [expiresAt, signature] = value.split(".");
  if (!expiresAt || !signature || Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;
  return validSignature(expiresAt, signature);
}

export function requireCoordinator(req: Request, res: Response, next: NextFunction) {
  if (!isCoordinatorSession(req.cookies?.[COOKIE_NAME])) {
    res.status(401).json({ error: "يلزم تسجيل دخول المنسق" });
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