import { Router } from "express";
import { requireOwner } from "../middlewares/coordinatorAuth";
import { getSiteContentSettings, sanitizeSiteContentSettings, saveSiteContentSettings } from "../lib/siteContentSettings";

const router = Router();

router.get("/site-content-settings", async (_req, res): Promise<void> => {
  res.setHeader("Cache-Control", "no-store");
  res.json(await getSiteContentSettings());
});

router.put("/site-content-settings", requireOwner, async (req, res): Promise<void> => {
  const settings = sanitizeSiteContentSettings(req.body);
  await saveSiteContentSettings(settings);
  res.json(settings);
});

export default router;