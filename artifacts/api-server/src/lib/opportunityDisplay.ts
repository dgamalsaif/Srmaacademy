export function getEnglishOpportunityTitle(opportunity: {
  id: number;
  titleEn?: string | null;
  titleAr?: string | null;
}): string {
  const title = [opportunity.titleEn, opportunity.titleAr]
    .find((value) => value?.trim() && !/[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/u.test(value));
  return title?.trim() || `Research Opportunity RES-2026-${opportunity.id}`;
}