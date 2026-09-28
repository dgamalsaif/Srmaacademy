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

// Mount the API application (handles /api routes and middlewares)
app.use(apiApp);

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
