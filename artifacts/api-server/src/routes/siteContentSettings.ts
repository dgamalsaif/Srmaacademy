import { Router } from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { requireOwner } from "../middlewares/coordinatorAuth";
import { getSiteContentSettings, sanitizeSiteContentSettings, saveSiteContentSettings } from "../lib/siteContentSettings";

const router = Router();

router.get("/site-content-settings", async (_req, res): Promise<void> => {
  res.setHeader("Cache-Control", "no-store");
  res.json(await getSiteContentSettings());
});

router.get("/pwa-manifest", async (_req, res): Promise<void> => {
  const { brand } = await getSiteContentSettings();
  const name = brand.appNameAr || brand.appNameEn || brand.siteNameAr || "SRMA";
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.type("application/manifest+json").json({
    id: "/",
    name,
    short_name: brand.appShortName || "SRMA",
    description: name,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f8fafc",
    theme_color: brand.appThemeColor,
    lang: "ar",
    dir: "rtl",
    categories: ["education", "medical", "productivity"],
    icons: [
      { src: "/api/pwa-icon/192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/pwa-icon/512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  });
});

router.get("/pwa-icon/:size.png", async (req, res): Promise<void> => {
  const size = Number(req.params.size);
  if (size !== 192 && size !== 512) {
    res.status(404).end();
    return;
  }
  const { brand } = await getSiteContentSettings();
  const source = await loadPwaIconSource(brand.appIconUrl || "/srma-logo.jpg")
    .catch(() => loadPwaIconSource("/srma-logo.jpg"));
  const inset = Math.round(size * 0.72);
  const logo = await sharp(source).resize(inset, inset, { fit: "contain" }).png().toBuffer();
  const output = await sharp({
    create: { width: size, height: size, channels: 4, background: brand.appThemeColor },
  }).composite([{ input: logo, gravity: "center" }]).png().toBuffer();
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.type("image/png").send(output);
});

router.put("/site-content-settings", requireOwner, async (req, res): Promise<void> => {
  const settings = sanitizeSiteContentSettings(req.body);
  await saveSiteContentSettings(settings);
  res.json(settings);
});

export default router;

async function loadPwaIconSource(iconUrl: string): Promise<Buffer> {
  if (iconUrl.startsWith("/")) {
    const publicRoots = [
      path.resolve(process.cwd(), "artifacts/rspf-academia/public"),
      path.resolve(process.cwd(), "../rspf-academia/public"),
    ];
    for (const publicRoot of publicRoots) {
      const filePath = path.resolve(publicRoot, `.${iconUrl}`);
      if (!filePath.startsWith(`${publicRoot}${path.sep}`)) continue;
      try {
        return await readFile(filePath);
      } catch {
        // Try the other supported workspace/deployment layout.
      }
    }
    throw new Error("App icon file is unavailable");
  }
  const response = await fetch(iconUrl, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Could not load app icon");
  const length = Number(response.headers.get("content-length") || 0);
  if (length > 5_000_000) throw new Error("App icon is too large");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 5_000_000) throw new Error("App icon is too large");
  return bytes;
}