import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { checkDatabaseReadiness } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/readyz", async (_req, res) => {
  try {
    const { ready, host } = await checkDatabaseReadiness();
    if (!ready) {
      res.status(503).json({
        status: "unavailable",
        database: "disconnected",
      });
      return;
    }

    res.json({
      status: "ready",
      database: "connected",
      safeHost: host,
    });
  } catch {
    res.status(503).json({
      status: "unavailable",
      database: "error",
    });
  }
});

export default router;
