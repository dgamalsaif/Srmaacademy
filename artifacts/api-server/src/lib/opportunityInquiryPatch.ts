export const INQUIRY_KEYS = [
  "opportunityInquiryEnabled", "opportunityInquiryChannel", "opportunityInquiryChannels", "opportunityInquiryValue",
  "opportunityInquiryWhatsapp", "opportunityInquiryTelegram", "opportunityInquiryEmail",
  "opportunityInquiryPhone", "opportunityInquiryCustomUrl", "opportunityInquiryLabelAr",
  "opportunityInquiryLabelEn", "opportunityInquiryMessageAr", "opportunityInquiryMessageEn",
] as const;

export type InquiryPatch = Record<string, string | boolean | string[]>;
const CHANNELS = ["whatsapp", "email", "telegram", "phone", "custom_url"];

export function validateInquiryPatch(input: unknown): InquiryPatch {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("إعدادات الاستفسار غير صحيحة.");
  const patch: InquiryPatch = {};
  for (const [key, value] of Object.entries(input)) {
    if (!(INQUIRY_KEYS as readonly string[]).includes(key)) throw new Error("يمكن تعديل إعدادات زر الاستفسار فقط.");
    if (key === "opportunityInquiryEnabled") {
      if (typeof value !== "boolean") throw new Error("حالة تفعيل الزر غير صحيحة.");
      patch[key] = value;
    } else if (key === "opportunityInquiryChannels") {
      if (!Array.isArray(value) || value.length > CHANNELS.length ||
          value.some(channel => typeof channel !== "string" || !CHANNELS.includes(channel))) {
        throw new Error("اختر وسائل تواصل صحيحة.");
      }
      patch[key] = [...new Set(value as string[])];
    } else {
      const max = key.includes("Label") || key.includes("Telegram") ? 100
        : key.includes("Message") || key.endsWith("Value") ? 500
        : key.includes("Email") ? 254 : key.includes("CustomUrl") ? 1000 : 40;
      if (typeof value !== "string" || value.length > max) throw new Error("قيمة إعداد الاستفسار غير صحيحة أو أطول من الحد المسموح.");
      patch[key] = value.trim();
    }
  }
  if (!Object.keys(patch).length) throw new Error("لا توجد إعدادات للحفظ.");
  if (patch.opportunityInquiryChannel && !["whatsapp", "email", "telegram", "phone", "custom_url"].includes(String(patch.opportunityInquiryChannel))) {
    throw new Error("اختر وسيلة تواصل صحيحة.");
  }
  if (patch.opportunityInquiryEnabled !== false) {
    const selected = Array.isArray(patch.opportunityInquiryChannels)
      ? patch.opportunityInquiryChannels : [String(patch.opportunityInquiryChannel || "")];
    for (const channel of selected) {
    const key = ({whatsapp: "opportunityInquiryWhatsapp", email: "opportunityInquiryEmail",
      telegram: "opportunityInquiryTelegram", phone: "opportunityInquiryPhone", custom_url: "opportunityInquiryCustomUrl"} as Record<string, string>)[channel];
    if (key && key in patch && !patch[key]) throw new Error("أدخل بيانات التواصل الخاصة بالوسيلة المختارة.");
    if (channel === "email" && key && key in patch && !/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(String(patch[key]))) {
      throw new Error("أدخل بريدًا إلكترونيًا صحيحًا.");
    }
    if ((channel === "whatsapp" || channel === "phone") && key && key in patch) {
      const value = String(patch[key]);
      const digits = value.replace(/\D/g, "");
      if (!/^\+?[\d\s()-]+$/.test(value) || digits.length < 8 || digits.length > 15) throw new Error("أدخل رقمًا صحيحًا مع رمز الدولة.");
    }
    if (channel === "telegram" && key && key in patch &&
        !/^@?[a-zA-Z][\w]{2,63}$/.test(String(patch[key])) &&
        !/^\+?\d{8,15}$/.test(String(patch[key])) &&
        !/^https?:\/\/t\.me\/[a-zA-Z0-9_+/-]+\/?$/.test(String(patch[key]))) throw new Error("أدخل معرّف تيليجرام أو رقمه أو رابط t.me صحيحًا.");
    if (channel === "custom_url" && key && key in patch) {
      let url: URL;
      try { url = new URL(String(patch[key])); } catch { throw new Error("أدخل رابطًا كاملًا يبدأ بـ https:// أو http://."); }
      if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error("الرابط المخصص غير مسموح.");
    }
    }
  }
  return patch;
}