type OpportunityTitle = {
  id: number;
  title?: string;
  titleEn?: string | null;
  titleAr?: string | null;
};

/** Legacy records may store an English title in either title column. */
export function getEnglishOpportunityTitle(opportunity: OpportunityTitle): string {
  const title = [opportunity.titleEn, opportunity.title, opportunity.titleAr]
    .find((value) => value?.trim() && !/[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/u.test(value));
  return title?.trim() || `Research Opportunity RES-2026-${opportunity.id}`;
}

export function getOpportunityRegistrationPath(id: number): string {
  return `/survey?rid=RES-2026-${id}`;
}

/** Public HTML metadata for link previews; visitors continue to registration. */
export function getOpportunitySharePath(id: number): string {
  return `/share/research/${id}`;
}