import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import router from "./routes";
import { logger } from "./lib/logger";
import { CLERK_PROXY_PATH, clerkProxyMiddleware, getClerkProxyHost } from "./middlewares/clerkProxyMiddleware";
import { createPublicContentLimiter, isAllowedSiteOrigin } from "./middlewares/publicContentProtection";

const app: Express = express();
app.disable("x-powered-by");
// Render terminates requests at its reverse proxy. Do not trust arbitrary hop chains.
app.set("trust proxy", 1);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !isAllowedSiteOrigin(origin)) {
    res.status(403).json({ error: "هذا المصدر غير مسموح له باستخدام الموقع." });
    return;
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || isAllowedSiteOrigin(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Range",
      "Cache-Control",
      "Accept",
    ],
    exposedHeaders: ["Set-Cookie", "Content-Disposition", "Content-Length"],
    maxAge: 86400,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
app.use(createPublicContentLimiter());
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.CLERK_SECRET_KEY) {
  app.use(clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(getClerkProxyHost(req) ?? "", process.env.CLERK_PUBLISHABLE_KEY),
  })));
} else {
  app.use((req, _res, next) => {
    (req as any).auth = { userId: null };
    next();
  });
}

app.use("/api", router);

// Ensure any unmatched /api request returns JSON, never falling through to SPA HTML
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "المسار غير موجود في الواجهة البرمجية (API endpoint not found)" });
});

// Centralized safe error middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err: err?.message || err }, "Unhandled server error");
  if (res.headersSent) return;
  const isProd = process.env.NODE_ENV === "production";
  res.status(err?.status || err?.statusCode || 500).json({
    error: isProd ? "Internal Server Error" : (err?.message || "Internal Server Error"),
  });
});

export default app;
