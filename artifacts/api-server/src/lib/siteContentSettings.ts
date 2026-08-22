import { coordinatorPortalSettingsTable, db } from "@workspace/db";
import { eq } from "drizzle-orm";

export type Audience = "participant" | "coordinator";
type FieldId = "fullName" | "specialization" | "email" | "affiliation" | "whatsapp" | "city" | "orcid" | "country";
type FieldType = "text" | "email" | "tel";

export interface RegistrationFieldSetting {
  id: FieldId;
  label: string;
  placeholder: string;
  type: FieldType;
  requiredParticipant: boolean;
  requiredCoordinator: boolean;
  showParticipant: boolean;
  showCoordinator: boolean;
  color: string;
}

export interface SiteContentSettings {
  participantTitle: string;
  participantDescription: string;
  coordinatorFormTitle: string;
  coordinatorFormDescription: string;
  primaryColor: string;
  accentColor: string;
  cardBackgroundColor: string;
  participantCardOrder: string[];
  coordinatorCardOrder: string[];
  visibleParticipantCardParts: string[];
  visibleCoordinatorCardParts: string[];
  registrationFields: RegistrationFieldSetting[];
}

export const SITE_CONTENT_KEY = "site-content";
const IDS: FieldId[] = ["fullName", "specialization", "email", "affiliation", "whatsapp", "city", "orcid", "country"];
const PARTS = ["description", "specialty", "seats", "duration", "supervisor", "journal", "benefits"];

export const DEFAULT_SITE_CONTENT_SETTINGS: SiteContentSettings = {
  participantTitle: "بوابة المشارك",
  participantDescription: "اكتشف الفرص البحثية المتاحة وسجل في البرنامج المناسب لتخصصك وأهدافك المهنية",
  coordinatorFormTitle: "تسجيل طالب في الفرصة البحثية",
  coordinatorFormDescription: "أدخل بيانات الطالب كما تظهر في مستنداته الأكاديمية.",
  primaryColor: "#0C3156",
  accentColor: "#117b59",
  cardBackgroundColor: "#ffffff",
  participantCardOrder: [...PARTS],
  coordinatorCardOrder: ["specialty", "supervisor", "seats", "duration", "journal", "benefits", "description"],
  visibleParticipantCardParts: [...PARTS],
  visibleCoordinatorCardParts: [...PARTS],
  registrationFields: [
    { id: "fullName", label: "الاسم الكامل / Full Name", placeholder: "د. أحمد محمد", type: "text", requiredParticipant: true, requiredCoordinator: true, showParticipant: true, showCoordinator: true, color: "#117b59" },
    { id: "specialization", label: "التخصص الدقيق / Specialization", placeholder: "مثال: طب القلب", type: "text", requiredParticipant: true, requiredCoordinator: true, showParticipant: true, showCoordinator: true, color: "#117b59" },
    { id: "email", label: "البريد الإلكتروني / Email", placeholder: "doctor@example.com", type: "email", requiredParticipant: true, requiredCoordinator: true, showParticipant: true, showCoordinator: true, color: "#117b59" },
    { id: "affiliation", label: "جهة الانتساب / Affiliation", placeholder: "الجامعة أو المستشفى", type: "text", requiredParticipant: true, requiredCoordinator: true, showParticipant: true, showCoordinator: true, color: "#117b59" },
    { id: "whatsapp", label: "رقم واتساب", placeholder: "5X XXX XXXX", type: "tel", requiredParticipant: true, requiredCoordinator: false, showParticipant: true, showCoordinator: false, color: "#25D366" },
    { id: "city", label: "المدينة / City", placeholder: "الرياض", type: "text", requiredParticipant: true, requiredCoordinator: true, showParticipant: true, showCoordinator: true, color: "#117b59" },
    { id: "orcid", label: "ORCID", placeholder: "0000-0000-0000-0000", type: "text", requiredParticipant: false, requiredCoordinator: false, showParticipant: true, showCoordinator: true, color: "#64748b" },
    { id: "country", label: "الدولة", placeholder: "", type: "text", requiredParticipant: true, requiredCoordinator: true, showParticipant: true, showCoordinator: true, color: "#117b59" },
  ],
};

export async function getSiteContentSettings(): Promise<SiteContentSettings> {
  const [record] = await db.select().from(coordinatorPortalSettingsTable)
    .where(eq(coordinatorPortalSettingsTable.key, SITE_CONTENT_KEY)).limit(1);
  return record ? sanitizeSiteContentSettings(record.value) : DEFAULT_SITE_CONTENT_SETTINGS;
}

export function sanitizeSiteContentSettings(value: unknown): SiteContentSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_SITE_CONTENT_SETTINGS;
  const input = value as Record<string, unknown>;
  const text = (key: keyof SiteContentSettings, max = 600) => typeof input[key] === "string"
    ? (input[key] as string).trim().slice(0, max)
    : DEFAULT_SITE_CONTENT_SETTINGS[key] as string;
  const color = (key: "primaryColor" | "accentColor" | "cardBackgroundColor") => {
    const candidate = text(key, 7);
    return /^#[0-9a-fA-F]{6}$/.test(candidate) ? candidate : DEFAULT_SITE_CONTENT_SETTINGS[key];
  };
  const parts = (key: "participantCardOrder" | "coordinatorCardOrder" | "visibleParticipantCardParts" | "visibleCoordinatorCardParts") => {
    const source = input[key];
    const items = Array.isArray(source) ? source.filter((part): part is string => typeof part === "string" && PARTS.includes(part)) : [];
    return [...new Set(items)].length ? [...new Set(items)] : DEFAULT_SITE_CONTENT_SETTINGS[key];
  };
  const rawFields = Array.isArray(input.registrationFields) ? input.registrationFields : [];
  const suppliedIds = rawFields
    .map((field) => field && typeof field === "object" ? (field as Record<string, unknown>).id : null)
    .filter((id): id is FieldId => typeof id === "string" && IDS.includes(id as FieldId));
  const orderedIds = [...new Set(suppliedIds), ...IDS.filter((id) => !suppliedIds.includes(id))];
  const fields = orderedIds.map((id) => {
    const base = DEFAULT_SITE_CONTENT_SETTINGS.registrationFields.find((field) => field.id === id)!;
    const supplied = rawFields.find((field) => field && typeof field === "object" && (field as Record<string, unknown>).id === id) as Record<string, unknown> | undefined;
    const fieldText = (key: "label" | "placeholder", max: number) => typeof supplied?.[key] === "string" ? supplied[key].trim().slice(0, max) : base[key];
    const fieldFlag = (key: "requiredParticipant" | "requiredCoordinator" | "showParticipant" | "showCoordinator") => typeof supplied?.[key] === "boolean" ? supplied[key] : base[key];
    const suppliedColor = typeof supplied?.color === "string" && /^#[0-9a-fA-F]{6}$/.test(supplied.color) ? supplied.color : base.color;
    const type = supplied?.type === "email" || supplied?.type === "tel" || supplied?.type === "text" ? supplied.type : base.type;
    return { id, label: fieldText("label", 80), placeholder: fieldText("placeholder", 120), type, requiredParticipant: fieldFlag("requiredParticipant"), requiredCoordinator: fieldFlag("requiredCoordinator"), showParticipant: fieldFlag("showParticipant"), showCoordinator: fieldFlag("showCoordinator"), color: suppliedColor };
  });
  return {
    participantTitle: text("participantTitle", 120),
    participantDescription: text("participantDescription", 600),
    coordinatorFormTitle: text("coordinatorFormTitle", 120),
    coordinatorFormDescription: text("coordinatorFormDescription", 600),
    primaryColor: color("primaryColor"),
    accentColor: color("accentColor"),
    cardBackgroundColor: color("cardBackgroundColor"),
    participantCardOrder: parts("participantCardOrder"),
    coordinatorCardOrder: parts("coordinatorCardOrder"),
    visibleParticipantCardParts: parts("visibleParticipantCardParts"),
    visibleCoordinatorCardParts: parts("visibleCoordinatorCardParts"),
    registrationFields: fields,
  };
}

export async function saveSiteContentSettings(settings: SiteContentSettings) {
  const value = settings as unknown as Record<string, unknown>;
  await db.insert(coordinatorPortalSettingsTable).values({ key: SITE_CONTENT_KEY, value })
    .onConflictDoUpdate({ target: coordinatorPortalSettingsTable.key, set: { value, updatedAt: new Date() } });
}