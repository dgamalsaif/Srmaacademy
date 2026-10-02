import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import router from "./routes";
import { logger } from "./lib/logger";
import { CLERK_PROXY_PATH, clerkProxyMiddleware, getClerkProxyHost } from "./middlewares/clerkProxyMiddleware";

const app: Express = express();
app.disable("x-powered-by");

const envOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const KNOWN_ALLOWED_HOST_SUFFIXES = [
  "srmaacademy.com",
  ".onrender.com",
  ".run.app",
  "localhost",
  "127.0.0.1",
];

function isOriginAllowed(origin: string): boolean {
  const clean = origin.trim().replace(/\/+$/, "");
  if (!clean || envOrigins.includes("*") || envOrigins.includes(clean)) return true;
  try {
    const parsed = new URL(clean);
    const hostname = parsed.hostname.toLowerCase();
    return KNOWN_ALLOWED_HOST_SUFFIXES.some(
      (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`) || hostname.endsWith(suffix)
    );
  } catch {
    return true;
  }
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin, Range, Cache-Control");
    res.setHeader("Access-Control-Expose-Headers", "Set-Cookie, Content-Disposition, Content-Length");
    res.setHeader("Access-Control-Max-Age", "86400");
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any legitimate web client or same-origin call with credentials
      if (!origin || isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        // Fallback: reflect requesting origin so browser preflight passes cleanly
        callback(null, true);
      }
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
  next();
});
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
