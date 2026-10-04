export const OPPORTUNITY_DISPLAY_FIELDS = [
  "image", "code", "specialty", "status", "description", "price", "journal",
  "indexedIn", "duration", "supervisor", "createdAt", "seats", "benefits",
] as const;

export function validateHiddenFields(input: unknown): string[] {
  if (!Array.isArray(input) || input.length > OPPORTUNITY_DISPLAY_FIELDS.length ||
      input.some(field => typeof field !== "string" ||
        !(OPPORTUNITY_DISPLAY_FIELDS as readonly string[]).includes(field))) {
    throw new Error("خيارات عرض معلومات الفرصة غير صحيحة.");
  }
  return [...new Set(input)];
}