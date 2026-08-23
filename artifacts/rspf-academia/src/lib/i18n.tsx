import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type SiteLanguage = "ar" | "en";

type TranslationKey =
  | "nav.home"
  | "nav.knowledge"
  | "nav.about"
  | "nav.participant"
  | "nav.coordinator"
  | "nav.requests"
  | "nav.faq"
  | "language.switch"
  | "language.ar"
  | "language.en"
  | "footer.contact"
  | "footer.quickLinks"
  | "footer.tagline"
  | "footer.telegram"
  | "common.whatsapp"
  | "common.telegram"
  | "common.learnMore"
  | "common.details"
  | "common.registerNow"
  | "common.loading"
  | "common.backToOpportunities";

const translations: Record<SiteLanguage, Record<TranslationKey, string>> = {
  ar: {
    "nav.home": "الرئيسية",
    "nav.knowledge": "مركز المعرفة",
    "nav.about": "عن المنصة",
    "nav.participant": "بوابة المشارك",
    "nav.coordinator": "بوابة المنسق",
    "nav.requests": "الطلبات الخاصة ⭐",
    "nav.faq": "الأسئلة الشائعة",
    "language.switch": "English",
    "language.ar": "العربية",
    "language.en": "English",
    "footer.contact": "تواصل معنا",
    "footer.quickLinks": "روابط سريعة",
    "footer.tagline": "منصة بحثية طبية ترافق الأطباء والباحثين من الفكرة إلى النشر العلمي.",
    "footer.telegram": "اشترك في قناة Telegram",
    "common.whatsapp": "واتساب",
    "common.telegram": "تيليجرام",
    "common.learnMore": "اعرف المزيد",
    "common.details": "التفاصيل",
    "common.registerNow": "سجل الآن",
    "common.loading": "جارٍ التحميل...",
    "common.backToOpportunities": "العودة للفرص البحثية",
  },
  en: {
    "nav.home": "Home",
    "nav.knowledge": "Knowledge Center",
    "nav.about": "About",
    "nav.participant": "Participant Portal",
    "nav.coordinator": "Coordinator Portal",
    "nav.requests": "Special Requests",
    "nav.faq": "FAQs",
    "language.switch": "العربية",
    "language.ar": "Arabic",
    "language.en": "English",
    "footer.contact": "Contact us",
    "footer.quickLinks": "Quick links",
    "footer.tagline": "A medical research platform supporting physicians and researchers from idea to publication.",
    "footer.telegram": "Join the Telegram channel",
    "common.whatsapp": "WhatsApp",
    "common.telegram": "Telegram",
    "common.learnMore": "Learn more",
    "common.details": "Details",
    "common.registerNow": "Register now",
    "common.loading": "Loading...",
    "common.backToOpportunities": "Back to research opportunities",
  },
};

interface LanguageContextValue {
  language: SiteLanguage;
  direction: "rtl" | "ltr";
  setLanguage: (language: SiteLanguage) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  localize: (arabic?: string, english?: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "srma-language";

function getInitialLanguage(): SiteLanguage {
  if (typeof window === "undefined") return "ar";
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (requested === "ar" || requested === "en") return requested;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "ar" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<SiteLanguage>(getInitialLanguage);
  const direction = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.body.dir = direction;
    document.body.dataset.language = language;
  }, [direction, language]);

  const setLanguage = (nextLanguage: SiteLanguage) => {
    updateLanguage(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("lang", nextLanguage);
    window.history.replaceState(window.history.state, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  };

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    direction,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "ar" ? "en" : "ar"),
    t: (key) => translations[language][key],
    localize: (arabic, english, fallback = "") => language === "ar"
      ? (arabic || english || fallback)
      : (english || arabic || fallback),
  }), [direction, language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider.");
  return context;
}