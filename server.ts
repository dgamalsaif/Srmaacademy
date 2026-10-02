import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import apiApp from "./artifacts/api-server/src/app";
import { logger } from "./artifacts/api-server/src/lib/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const isProd = process.env.NODE_ENV === "production";

// Top-level CORS & preflight options handler for all clients (including cross-origin from srmaacademy.com)
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

// Mount the API application (handles /api routes and middlewares)
app.use(apiApp);

// Social media crawlers & bot interception (WhatsApp, Telegram, Twitterbot, LinkedIn, Facebook, Slack, Discord, etc.)
const BOT_USER_AGENTS = /bot|crawl|spider|whatsapp|telegram|facebookexternalhit|facebot|twitterbot|linkedin|slack|discord|pinterest|skype|applebot|curl|wget|meta-externalagent/i;

app.get(["/research/:id", "/share/research/:id"], (req, res, next) => {
  const userAgent = req.get("user-agent") || "";
  const isBot = BOT_USER_AGENTS.test(userAgent) || req.query.crawler === "1" || req.query.preview === "1";
  const isSharePath = req.path.startsWith("/share/research/");

  if (isBot || isSharePath) {
    req.url = `/api/programs/${req.params.id}/share${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;
    return apiApp(req, res, next);
  }
  return next();
});

app.get(["/survey", "/register"], (req, res, next) => {
  const userAgent = req.get("user-agent") || "";
  const isBot = BOT_USER_AGENTS.test(userAgent) || req.query.crawler === "1" || req.query.preview === "1";
  const rawRid = String(req.query.rid || req.query.id || "").trim();
  const matchId = rawRid.match(/(\d+)$/);
  const numericId = matchId ? parseInt(matchId[1], 10) : parseInt(rawRid.replace(/\D/g, ""), 10);

  if (isBot && Number.isInteger(numericId) && numericId > 0) {
    (req as any).params = { id: String(numericId) };
    req.url = `/api/programs/${numericId}/share${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;
    return apiApp(req, res, next);
  }
  return next();
});

// Guard: prevent any /api request from falling through to the frontend SPA
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      configFile: path.resolve(__dirname, "artifacts/rspf-academia/vite.config.ts"),
      root: path.resolve(__dirname, "artifacts/rspf-academia"),
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "artifacts/rspf-academia/dist/public");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info({ port: PORT }, `Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  logger.error({ err }, "Fatal error starting server");
  process.exit(1);
});
