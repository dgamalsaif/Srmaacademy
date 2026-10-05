import { createHash } from "node:crypto";

export function validateSocialShareImageUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 2000) throw new Error("رابط صورة المشاركة غير صحيح.");
  const url = value.trim();
  if (!url) return "";
  if (/^\/api\/site-share-(?:image|metadata)(?:[/?#]|$)/i.test(url)) throw new Error("اختر رابط ملف الصورة، وليس رابط معاينة المشاركة نفسه.");
  if (/\.(mp4|webm|mov|m4v)(?:$|[?#])/i.test(url)) throw new Error("اختر صورة أو GIF لمعاينة الرابط، وليس ملف فيديو.");
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\") &&
      !url.split(/[/?#]/).includes("..") && !/[\u0000-\u0020]/.test(url)) return url;
  try {
    const parsed = new URL(url);
    if (/^\/api\/site-share-(?:image|metadata)(?:[/?#]|$)/i.test(parsed.pathname)) throw new Error("recursive preview");
    if (parsed.protocol === "https:" && !parsed.username && !parsed.password) return parsed.toString();
  } catch {}
  throw new Error("استخدم رابط HTTPS عامًا أو مسار صورة داخل الموقع.");
}

export function siteShareImageSource(brand: { socialShareImageUrl?: string; logoUrl?: string }, userAgent = "") {
  if (brand.socialShareImageUrl) return validateSocialShareImageUrl(brand.socialShareImageUrl);
  const logo = brand.logoUrl || "/srma-logo.jpg";
  if (/\/srma-animated-logo\.mp4(?:$|[?#])/i.test(logo)) {
    // A real frame from the same video for apps that need a still thumbnail.
    return /whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|meta-externalagent/i.test(userAgent)
      ? "/srma-share-logo.jpg" : "/srma-share-logo.gif";
  }
  if (/\.(mp4|webm|mov|m4v)(?:$|[?#])/i.test(logo)) return "/srma-logo.jpg";
  return validateSocialShareImageUrl(logo);
}

export function siteShareImageVersion(brand: { socialShareImageUrl?: string; logoUrl?: string; socialShareImageVersion?: string }) {
  return createHash("sha256").update(`${siteShareImageSource(brand)}:${brand.socialShareImageVersion || ""}`).digest("hex").slice(0, 16);
}