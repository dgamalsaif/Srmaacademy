import { Router } from "express";
import { eq } from "drizzle-orm";
import { coordinatorPortalSettingsTable, db } from "@workspace/db";
import { requireOwner } from "../middlewares/coordinatorAuth";

type PortalNavIcon = "home" | "book" | "info" | "graduation" | "users" | "file";

interface PortalNavItem {
  id: string;
  label: string;
  href: string;
  icon: PortalNavIcon;
  visible: boolean;
  accent: boolean;
}

interface CoordinatorPortalSettings {
  brandName: string;
  brandYear: string;
  brandSubtitle: string;
  pageTitle: string;
  loginTitle: string;
  loginDescription: string;
  codeLabel: string;
  codePlaceholder: string;
  loginLabel: string;
  registrationPrefix: string;
  registrationLabel: string;
  footnote: string;
  telegramUrl: string;
  whatsappUrl: string;
  showTelegram: boolean;
  showWhatsapp: boolean;
  showCookieBanner: boolean;
  cookieTitle: string;
  cookieDescription: string;
  cookieRejectLabel: string;
  cookieAcceptLabel: string;
  cookiePolicyUrl: string;
  showInstallPrompt: boolean;
  installTitle: string;
  installDescription: string;
  installActionLabel: string;
  installDismissLabel: string;
  navItems: PortalNavItem[];
}

const SETTINGS_KEY = "coordinator-portal";
const ICONS: PortalNavIcon[] = ["home", "book", "info", "graduation", "users", "file"];

const DEFAULT_SETTINGS: CoordinatorPortalSettings = {
  brandName: "SRMA",
  brandYear: "2026",
  brandSubtitle: "Research Academy",
  pageTitle: "SRMA Research Academy — بوابة المنسق",
  loginTitle: "بوابة المنسقين",
  loginDescription: "سجّل دخولك برمز الوصول الخاص بك",
  codeLabel: "رمز الدخول",
  codePlaceholder: "أدخل الرمز هنا...",
  loginLabel: "دخول",
  registrationPrefix: "لا تملك حساباً؟",
  registrationLabel: "سجّل الآن",
  footnote: "البوابة مخصصة للمنسقين المعتمدين فقط",
  telegramUrl: "https://t.me/SRMAAcademy",
  whatsappUrl: "https://wa.me/966562159258",
  showTelegram: true,
  showWhatsapp: true,
  showCookieBanner: true,
  cookieTitle: "نحن نستخدم ملفات تعريف الارتباط",
  cookieDescription: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وقياس أداء المنصة. يمكنك تغيير قرارك لاحقاً من صفحة السياسات والشروط.",
  cookieRejectLabel: "رفض غير الضروري",
  cookieAcceptLabel: "قبول الكل",
  cookiePolicyUrl: "/policies",
  showInstallPrompt: true,
  installTitle: "ثبّت تطبيق SRMA Research Academy",
  installDescription: "أضف المنصة إلى شاشتك الرئيسية للوصول السريع.",
  installActionLabel: "تثبيت",
  installDismissLabel: "ليس الآن",
  navItems: [
    { id: "home", label: "الرئيسية", href: "/", icon: "home", visible: true, accent: false },
    { id: "knowledge", label: "مركز المعرفة", href: "/knowledge-center", icon: "book", visible: true, accent: false },
    { id: "about", label: "عن المنصة", href: "/about", icon: "info", visible: true, accent: false },
    { id: "participant", label: "بوابة المشارك", href: "/participant-portal", icon: "graduation", visible: true, accent: true },
    { id: "coordinator", label: "بوابة المنسق", href: "/coordinator", icon: "users", visible: true, accent: true },
    { id: "requests", label: "الطلبات الخاصة", href: "/special-requests", icon: "file", visible: true, accent: false },
  ],
};

const router = Router();

router.get("/coordinator-portal-settings", async (_req, res): Promise<void> => {
  const settings = await readSettings();
  res.setHeader("Cache-Control", "no-store");
  res.json(settings);
});

router.put("/coordinator-portal-settings", requireOwner, async (req, res): Promise<void> => {
  const settings = sanitizeSettings(req.body);
  if (!settings) {
    res.status(400).json({ error: "تعذر حفظ الإعدادات. تحقق من الحقول والروابط المدخلة." });
    return;
  }

  const databaseValue = settings as unknown as Record<string, unknown>;
  await db.insert(coordinatorPortalSettingsTable)
    .values({ key: SETTINGS_KEY, value: databaseValue })
    .onConflictDoUpdate({
      target: coordinatorPortalSettingsTable.key,
      set: { value: databaseValue, updatedAt: new Date() },
    });

  res.json(settings);
});

async function readSettings(): Promise<CoordinatorPortalSettings> {
  const [record] = await db.select()
    .from(coordinatorPortalSettingsTable)
    .where(eq(coordinatorPortalSettingsTable.key, SETTINGS_KEY))
    .limit(1);

  return record ? sanitizeSettings(record.value) || DEFAULT_SETTINGS : DEFAULT_SETTINGS;
}

function sanitizeSettings(value: unknown): CoordinatorPortalSettings | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const text = (key: keyof CoordinatorPortalSettings, maxLength = 500) => {
    const candidate = input[key];
    if (typeof candidate !== "string") return DEFAULT_SETTINGS[key] as string;
    return candidate.trim().slice(0, maxLength);
  };
  const flag = (key: keyof CoordinatorPortalSettings) => typeof input[key] === "boolean"
    ? input[key] as boolean
    : DEFAULT_SETTINGS[key] as boolean;

  const navItems = sanitizeNavItems(input.navItems);
  const telegramUrl = text("telegramUrl", 300);
  const whatsappUrl = text("whatsappUrl", 300);
  const cookiePolicyUrl = text("cookiePolicyUrl", 300);
  if (![telegramUrl, whatsappUrl, cookiePolicyUrl].every(isSafeUrl)) return null;

  return {
    brandName: text("brandName", 40),
    brandYear: text("brandYear", 12),
    brandSubtitle: text("brandSubtitle", 80),
    pageTitle: text("pageTitle", 150),
    loginTitle: text("loginTitle", 100),
    loginDescription: text("loginDescription", 250),
    codeLabel: text("codeLabel", 60),
    codePlaceholder: text("codePlaceholder", 100),
    loginLabel: text("loginLabel", 50),
    registrationPrefix: text("registrationPrefix", 100),
    registrationLabel: text("registrationLabel", 80),
    footnote: text("footnote", 250),
    telegramUrl,
    whatsappUrl,
    showTelegram: flag("showTelegram"),
    showWhatsapp: flag("showWhatsapp"),
    showCookieBanner: flag("showCookieBanner"),
    cookieTitle: text("cookieTitle", 120),
    cookieDescription: text("cookieDescription", 800),
    cookieRejectLabel: text("cookieRejectLabel", 80),
    cookieAcceptLabel: text("cookieAcceptLabel", 80),
    cookiePolicyUrl,
    showInstallPrompt: flag("showInstallPrompt"),
    installTitle: text("installTitle", 120),
    installDescription: text("installDescription", 300),
    installActionLabel: text("installActionLabel", 60),
    installDismissLabel: text("installDismissLabel", 60),
    navItems,
  };
}

function sanitizeNavItems(value: unknown): PortalNavItem[] {
  if (!Array.isArray(value)) return DEFAULT_SETTINGS.navItems;
  const seen = new Set<string>();
  const result = value.slice(0, 12).flatMap((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const input = item as Record<string, unknown>;
    const label = typeof input.label === "string" ? input.label.trim().slice(0, 64) : "";
    const href = typeof input.href === "string" ? input.href.trim().slice(0, 300) : "";
    const suppliedId = typeof input.id === "string" ? input.id.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 36) : "";
    const id = suppliedId || `link-${index + 1}`;
    const icon = ICONS.includes(input.icon as PortalNavIcon) ? input.icon as PortalNavIcon : "file";
    if (!label || !isSafeUrl(href) || seen.has(id)) return [];
    seen.add(id);
    return [{
      id,
      label,
      href,
      icon,
      visible: typeof input.visible === "boolean" ? input.visible : true,
      accent: typeof input.accent === "boolean" ? input.accent : false,
    }];
  });
  return result.length ? result : DEFAULT_SETTINGS.navItems;
}

function isSafeUrl(value: string) {
  return /^https?:\/\/[^\s]+$/i.test(value) || /^\/(?!\/)[^\s]*$/.test(value);
}

export default router;