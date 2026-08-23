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

export function formatOpportunityMoney(sar: number, currency: OpportunityCurrency) {
  const amount = currency === "USD" ? sar / SAR_PER_USD : sar;
  const maximumFractionDigits = currency === "USD" && amount % 1 !== 0 ? 2 : 0;
  const value = new Intl.NumberFormat("ar-SA", { maximumFractionDigits, minimumFractionDigits: maximumFractionDigits }).format(amount);
  return currency === "USD" ? `$${value}` : `${value} ر.س`;
}

export function getDiscountPercentage(originalSar: number, discountedSar: number) {
  if (originalSar <= 0 || discountedSar >= originalSar) return 0;
  return ((originalSar - discountedSar) / originalSar) * 100;
}