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

/** Copy the announcement together with the HTML preview link, never a raw image. */
export function getOpportunityShareText(
  opportunity: OpportunityTitle & { specialtyAr?: string | null; specialtyEn?: string | null; specialty?: string | null },
  origin: string,
  language = "ar",
): string {
  const english = language === "en";
  const specialty = (english ? opportunity.specialtyEn : opportunity.specialtyAr)
    || opportunity.specialtyEn || opportunity.specialtyAr || opportunity.specialty;
  return [
    english ? "New research opportunity" : "فرصة بحثية جديدة",
    getEnglishOpportunityTitle(opportunity),
    specialty?.trim() ? `${english ? "Specialty" : "التخصص"}: ${specialty.trim()}` : "",
    `${origin.replace(/\/+$/, "")}${getOpportunitySharePath(opportunity.id)}${english ? "?lang=en" : ""}`,
  ].filter(Boolean).join("\n");
}