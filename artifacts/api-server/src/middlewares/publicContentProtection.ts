import type { Request, Response, NextFunction } from "express";

/** Browser-origin restriction, not authentication: public content remains public. */
export function isAllowedSiteOrigin(origin: string, env: NodeJS.ProcessEnv = process.env): boolean {
  let parsed: URL;
  try { parsed = new URL(origin); } catch { return false; }
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password ||
      parsed.search || parsed.hash || (parsed.pathname !== "/" && parsed.pathname !== "")) return false;
  const allowed = new Set([
    "https://srmaacademy.com", "https://www.srmaacademy.com", "https://srma-api.onrender.com",
    ...(env.CORS_ORIGIN || "").split(",").map(value => value.trim().replace(/\/+$/, "")).filter(value => value && value !== "*"),
  ]);
  if (env.NODE_ENV !== "production") {
    for (const host of [env.REPLIT_DEV_DOMAIN, ...(env.REPLIT_DOMAINS || "").split(",")].filter(Boolean)) {
      allowed.add(`https://${host!.trim()}`);
    }
    if (["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)) return true;
  }
  return allowed.has(parsed.origin);
}

type Limits = { windowMs?: number; contentLimit?: number; imageLimit?: number; maxClients?: number; now?: () => number };

/** Per-instance limits on public reads only; never limit booking, login or readiness. */
export function createPublicContentLimiter(options: Limits = {}) {
  const windowMs = options.windowMs ?? 60_000;
  const contentLimit = options.contentLimit ?? 300;
  const imageLimit = options.imageLimit ?? 1200;
  const maxClients = options.maxClients ?? 10_000;
  const now = options.now ?? Date.now;
  const buckets = new Map<string, { count: number; resetAt: number }>();
  let lastSweep = 0;
  return (req: Request, res: Response, next: NextFunction) => {
    if (!["GET", "HEAD"].includes(req.method) ||
        !/^\/(?:api\/programs(?:\/|$)|(?:api\/)?share\/research\/)/.test(req.path)) return next();
    const image = /\/(?:image|poster\.svg)\/?$/.test(req.path);
    const limit = image ? imageLimit : contentLimit;
    // Express's trusted-proxy calculation is used; arbitrary CF/XFF headers are not read here.
    const key = `${req.ip || req.socket.remoteAddress || "unknown"}:${image ? "image" : "content"}`;
    const time = now();
    if (time - lastSweep >= windowMs) {
      for (const [key, bucket] of buckets) if (bucket.resetAt <= time) buckets.delete(key);
      lastSweep = time;
    }
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= time) {
      if (buckets.size >= maxClients) buckets.delete(buckets.keys().next().value!);
      bucket = { count: 0, resetAt: time + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    res.setHeader("RateLimit-Limit", limit);
    res.setHeader("RateLimit-Remaining", Math.max(0, limit - bucket.count));
    res.setHeader("RateLimit-Reset", Math.ceil((bucket.resetAt - time) / 1000));
    if (bucket.count > limit) {
      res.setHeader("Retry-After", Math.max(1, Math.ceil((bucket.resetAt - time) / 1000)));
      res.setHeader("Cache-Control", "no-store");
      res.status(429).json({ error: "طلبات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مجددًا." });
      return;
    }
    next();
  };
}