import assert from "node:assert/strict";
import { test } from "node:test";
import type { Request, Response } from "express";
import { createPublicContentLimiter, isAllowedSiteOrigin } from "./publicContentProtection";

test("production allows only exact approved origins, not clones or misleading suffixes", () => {
  const env = { NODE_ENV: "production" };
  assert.equal(isAllowedSiteOrigin("https://srmaacademy.com", env), true);
  assert.equal(isAllowedSiteOrigin("https://www.srmaacademy.com", env), true);
  for (const origin of ["https://evil-srmaacademy.com", "https://srmaacademy.com.evil.com",
    "https://clone.onrender.com", "https://clone.replit.dev", "null", "not a URL",
    "https://srmaacademy.com/private", "https://user:secret@srmaacademy.com"]) {
    assert.equal(isAllowedSiteOrigin(origin, env), false, origin);
  }
  assert.equal(isAllowedSiteOrigin("http://localhost:3000", env), false);
  assert.equal(isAllowedSiteOrigin("https://clone.example", { ...env, CORS_ORIGIN: "*" }), false);
});
test("explicit deployment aliases and current development preview remain supported", () => {
  assert.equal(isAllowedSiteOrigin("https://academy.pages.dev", { NODE_ENV: "production", CORS_ORIGIN: "https://academy.pages.dev" }), true);
  assert.equal(isAllowedSiteOrigin("https://mine.replit.dev", { NODE_ENV: "development", REPLIT_DEV_DOMAIN: "mine.replit.dev" }), true);
  assert.equal(isAllowedSiteOrigin("http://localhost:3000", { NODE_ENV: "development" }), true);
});
function request(path: string, ip = "client-a", method = "GET") {
  return { path, ip, method, socket: {} } as Request;
}
function response() {
  const headers = new Map();
  const res = { setHeader(key: string, value: unknown) { headers.set(key, value); },
    status(code: number) { res.code = code; return res; }, json(body: unknown) { res.body = body; },
    code: 200, body: undefined as unknown };
  return { res: res as unknown as Response, state: res, headers };
}
test("public reads return 429 with retry guidance and recover after the window", () => {
  let time = 1000;
  const limiter = createPublicContentLimiter({ contentLimit: 2, windowMs: 1000, now: () => time });
  let passed = 0;
  for (let i = 0; i < 3; i++) {
    const result = response();
    limiter(request("/api/programs"), result.res, () => passed++);
    if (i === 2) { assert.equal(result.state.code, 429); assert.equal(result.headers.get("Retry-After"), 1); }
  }
  assert.equal(passed, 2);
  time = 2000;
  limiter(request("/api/programs"), response().res, () => passed++);
  assert.equal(passed, 3);
});
test("limits do not block another client, image loading, readiness or registration", () => {
  const limiter = createPublicContentLimiter({ contentLimit: 1, imageLimit: 3 });
  let passed = 0;
  const next = () => passed++;
  limiter(request("/api/programs"), response().res, next);
  limiter(request("/api/programs", "client-b"), response().res, next);
  limiter(request("/api/programs/1/image"), response().res, next);
  limiter(request("/api/readyz"), response().res, next);
  limiter(request("/api/registrations", "client-a", "POST"), response().res, next);
  limiter(request("/api/owner/session"), response().res, next);
  assert.equal(passed, 6);
});