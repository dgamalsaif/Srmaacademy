import { validateHiddenFields } from "./opportunityVisibilityFields";

const TEXT_FIELDS = [
  "titleAr", "titleEn", "descriptionAr", "descriptionEn", "specialtyAr", "specialtyEn",
  "supervisor", "duration", "journalTarget", "journalIssn", "journalPubmed", "journalScopus",
  "journalWos", "status", "category", "researchGroupUrl", "imageToken",
] as const;
const NUMERIC_FIELDS = ["priceOriginalSar", "priceDiscountedSar", "seatsLeft"];
const LIST_FIELDS = ["indexedIn", "benefits"];
const ALLOWED = new Set<string>([...TEXT_FIELDS, ...NUMERIC_FIELDS, ...LIST_FIELDS, "hiddenFields"]);
export class BatchProgramValidationError extends Error {}

/** A bulk update never silently ignores a requested property or resets unspecified values. */
export function validateBatchProgramUpdates(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new BatchProgramValidationError("بيانات التحديث غير صالحة.");
  const entries = Object.entries(value);
  if (!entries.length) throw new BatchProgramValidationError("اختر خاصية واحدة على الأقل للتعديل.");
  const patch: Record<string, unknown> = {};
  for (const [key, field] of entries) {
    if (!ALLOWED.has(key)) throw new BatchProgramValidationError(`هذه الخاصية غير قابلة للتعديل الجماعي: ${key}`);
    if (key === "hiddenFields") {
      try { patch[key] = validateHiddenFields(field); }
      catch { throw new BatchProgramValidationError("خيارات عرض المعلومات غير صحيحة."); }
    } else if (NUMERIC_FIELDS.includes(key)) {
      if (typeof field !== "number" || !Number.isSafeInteger(field) || field < 0 ||
          (key === "seatsLeft" && field > 15)) throw new BatchProgramValidationError("السعر والمقاعد يجب أن تكون أرقاماً صحيحة ضمن الحدود المسموحة.");
      patch[key] = field;
    } else if (LIST_FIELDS.includes(key)) {
      if (Array.isArray(field) && field.every(item => typeof item === "string")) {
        patch[key] = field.map(item => item.trim()).filter(Boolean).join("|");
      } else if (typeof field === "string") patch[key] = field.trim();
      else throw new BatchProgramValidationError("الفهرسة والمزايا يجب أن تكون نصاً أو قائمة نصوص.");
    } else {
      if (typeof field !== "string" || field.length > 20000) throw new BatchProgramValidationError("محتوى الخاصية غير صحيح أو أطول من الحد المسموح.");
      patch[key] = field.trim();
      if ((key === "titleAr" || key === "titleEn") && !field.trim()) throw new BatchProgramValidationError("لا يمكن حذف عنوان الفرصة.");
    }
  }
  return patch;
}

export function validateBatchProgramScope(input: Record<string, unknown>) {
  const categories = ["active", "completed", "training", "cme"];
  if (input.category !== undefined && (typeof input.category !== "string" || !categories.includes(input.category))) {
    throw new BatchProgramValidationError("نوع الفرص المحدد غير صحيح.");
  }
  if (input.all === true) return { all: true as const, category: input.category as string | undefined, ids: [] as number[] };
  if (!Array.isArray(input.ids) || !input.ids.length || input.ids.some(id => !Number.isSafeInteger(id) || id <= 0)) {
    throw new BatchProgramValidationError("اختر الفرص المراد تعديلها أو اختر جميع الفرص.");
  }
  return { all: false as const, category: undefined, ids: [...new Set(input.ids as number[])].sort((a, b) => a - b) };
}