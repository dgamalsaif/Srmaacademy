import type { SiteLanguage } from "@/lib/i18n";

export type OpportunityCurrency = "SAR" | "USD";

export const SAR_PER_USD = 3.75;

export const RESEARCH_STATUS_LABELS: Record<string, string> = {
  open: "مفتوحة للتسجيل",
  closed: "مغلقة",
  draft: "مسودة",
  upcoming: "قريباً",
  seats_full: "اكتملت المقاعد",
  ethics_approved: "موافقة أخلاقية / PROSPERO",
  submitted: "تم الرفع للمجلة",
  under_review: "قيد مراجعة المجلة",
  accepted: "مقبولة للنشر",
  published: "تم النشر",
};

export const RESEARCH_STATUS_LABELS_EN: Record<string, string> = {
  open: "Open for registration",
  closed: "Registration closed",
  draft: "Draft",
  upcoming: "Coming soon",
  seats_full: "Seats are full",
  ethics_approved: "Ethics approval / PROSPERO",
  submitted: "Submitted to journal",
  under_review: "Under journal review",
  accepted: "Accepted for publication",
  published: "Published",
};

export function getResearchStatusLabel(status: string, language: SiteLanguage) {
  return (language === "ar" ? RESEARCH_STATUS_LABELS : RESEARCH_STATUS_LABELS_EN)[status] || status;
}

export function formatOpportunityMoney(sar: number, currency: OpportunityCurrency, language: SiteLanguage) {
  const amount = currency === "USD" ? sar / SAR_PER_USD : sar;
  const maximumFractionDigits = currency === "USD" && amount % 1 !== 0 ? 2 : 0;
  return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency,
    currencyDisplay: language === "ar" ? "name" : "symbol",
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(amount);
}

export function getDiscountPercentage(originalSar: number, discountedSar: number) {
  if (originalSar <= 0 || discountedSar >= originalSar) return 0;
  return ((originalSar - discountedSar) / originalSar) * 100;
}