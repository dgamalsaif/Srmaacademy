import type { SiteLanguage } from "@/lib/i18n";
export {
  SAR_PER_USD,
  formatOpportunityMoney,
  formatDualOpportunityMoney,
  getDiscountPercentage,
  CurrencyProvider,
  useCurrency,
  type OpportunityCurrency,
  type CurrencyContextValue,
} from "./currency";

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
