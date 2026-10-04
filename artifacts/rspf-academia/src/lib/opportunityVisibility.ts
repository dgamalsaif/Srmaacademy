import type { ResearchOpportunity } from "@/lib/researchData";

export const OPPORTUNITY_DISPLAY_FIELDS = [
  { id: "image", label: "الصورة" },
  { id: "code", label: "رمز الفرصة" },
  { id: "specialty", label: "التخصص" },
  { id: "status", label: "الحالة" },
  { id: "description", label: "الوصف" },
  { id: "price", label: "السعر" },
  { id: "journal", label: "المجلة المستهدفة" },
  { id: "indexedIn", label: "الفهرسة وقواعد البيانات" },
  { id: "duration", label: "المدة" },
  { id: "supervisor", label: "المشرف" },
  { id: "createdAt", label: "تاريخ الإضافة" },
  { id: "seats", label: "المقاعد" },
  { id: "benefits", label: "المزايا" },
] as const;

export type OpportunityDisplayFieldId = (typeof OPPORTUNITY_DISPLAY_FIELDS)[number]["id"];
const ALLOWED = new Set<string>(OPPORTUNITY_DISPLAY_FIELDS.map((f) => f.id));

export function normalizeHiddenFields(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((v): v is string => typeof v === "string" && ALLOWED.has(v)))] : [];
}

type WithHidden = { hiddenFields?: string[] | null } | null | undefined;

/** True when the owner has not hidden this field for the public. */
export function isFieldVisible(opportunity: WithHidden, field: OpportunityDisplayFieldId): boolean {
  return !normalizeHiddenFields(opportunity?.hiddenFields).includes(field);
}

/** The image switch is independent; the API also applies visibility to generated poster metadata. */
export function getPublicImageUrl(opportunity: Pick<ResearchOpportunity, "imageUrl" | "hiddenFields">): string | undefined {
  const url = opportunity.imageUrl;
  if (!url) return undefined;
  if (!isFieldVisible(opportunity, "image")) return undefined;
  return url;
}
