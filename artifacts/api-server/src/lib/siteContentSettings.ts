import { coordinatorPortalSettingsTable, db } from "@workspace/db";
import { eq } from "drizzle-orm";

export type Audience = "participant" | "coordinator";
type TitleLanguage = "arabic" | "english" | "both";
type OpportunityDisplayMode = "grid" | "scroll";
type FieldId = "fullName" | "specialization" | "email" | "affiliation" | "whatsapp" | "city" | "orcid" | "country";
export type OpportunityFieldId = "titleAr" | "titleEn" | "specialtyAr" | "specialtyEn" | "status" | "totalSeats" | "seatsLeft" | "descriptionAr" | "descriptionEn" | "journalTarget" | "journalIssn" | "journalPubmed" | "journalScopus" | "journalWos" | "duration" | "supervisor" | "indexedIn" | "benefits";
export interface SpecialtyOption { id: string; nameAr: string; nameEn: string; }
export interface JournalOption { id: string; nameAr: string; nameEn: string; issn: string; pubmed: string; scopus: string; wos: string; }
type FieldType = "text" | "email" | "tel";

export interface RegistrationFieldSetting {
  id: FieldId;
  label: string;
  labelEn: string;
  placeholder: string;
  placeholderEn: string;
  type: FieldType;
  requiredParticipant: boolean;
  requiredCoordinator: boolean;
  showParticipant: boolean;
  showCoordinator: boolean;
  color: string;
}

export interface SiteContentSettings {
  participantTitle: string;
  participantTitleEn: string;
  participantDescription: string;
  participantDescriptionEn: string;
  coordinatorFormTitle: string;
  coordinatorFormTitleEn: string;
  coordinatorFormDescription: string;
  coordinatorFormDescriptionEn: string;
  participantTitleLanguage: TitleLanguage;
  coordinatorTitleLanguage: TitleLanguage;
  primaryColor: string;
  accentColor: string;
  cardBackgroundColor: string;
  opportunityDisplayMode: OpportunityDisplayMode;
  participantCardOrder: string[];
  coordinatorCardOrder: string[];
  visibleParticipantCardParts: string[];
  visibleCoordinatorCardParts: string[];
  requiredOpportunityFields: OpportunityFieldId[];
  specialtyOptions: SpecialtyOption[];
  journalOptions: JournalOption[];
  registrationFields: RegistrationFieldSetting[];
}

export const SITE_CONTENT_KEY = "site-content";
const IDS: FieldId[] = ["fullName", "specialization", "email", "affiliation", "whatsapp", "city", "orcid", "country"];
const PARTS = ["description", "specialty", "seats", "duration", "supervisor", "journal", "benefits"];
const OPPORTUNITY_FIELD_IDS: OpportunityFieldId[] = ["titleAr", "titleEn", "specialtyAr", "specialtyEn", "status", "totalSeats", "seatsLeft", "descriptionAr", "descriptionEn", "journalTarget", "journalIssn", "journalPubmed", "journalScopus", "journalWos", "duration", "supervisor", "indexedIn", "benefits"];

export const DEFAULT_SITE_CONTENT_SETTINGS: SiteContentSettings = {
  participantTitle: "بوابة المشارك",
  participantTitleEn: "Participant Portal",
  participantDescription: "اكتشف الفرص البحثية المتاحة وسجل في البرنامج المناسب لتخصصك وأهدافك المهنية",
  participantDescriptionEn: "Explore available research opportunities and register for the program that fits your specialty and professional goals.",
  coordinatorFormTitle: "تسجيل طالب في الفرصة البحثية",
  coordinatorFormTitleEn: "Register a student for a research opportunity",
  coordinatorFormDescription: "أدخل بيانات الطالب كما تظهر في مستنداته الأكاديمية.",
  coordinatorFormDescriptionEn: "Enter the student's details exactly as they appear in their academic documents.",
  participantTitleLanguage: "english",
  coordinatorTitleLanguage: "arabic",
  primaryColor: "#0C3156",
  accentColor: "#117b59",
  cardBackgroundColor: "#ffffff",
  opportunityDisplayMode: "grid",
  participantCardOrder: [...PARTS],
  coordinatorCardOrder: ["specialty", "supervisor", "seats", "duration", "journal", "benefits", "description"],
  visibleParticipantCardParts: [...PARTS],
  visibleCoordinatorCardParts: [...PARTS],
  requiredOpportunityFields: [],
  specialtyOptions: [],
  journalOptions: [],
  registrationFields: [
    { id: "fullName", label: "الاسم الكامل", labelEn: "Full name", placeholder: "د. أحمد محمد", placeholderEn: "Dr. Ahmed Mohammed", type: "text", requiredParticipant: true, requiredCoordinator: true, showParticipant: true, showCoordinator: true, color: "#117b59" },
    { id: "specialization", label: "التخصص الدقيق", labelEn: "Specialization", placeholder: "مثال: طب القلب", placeholderEn: "e.g., Cardiology", type: "text", requiredParticipant: true, requiredCoordinator: true, showParticipant: true, showCoordinator: true, color: "#117b59" },
    { id: "email", label: "البريد الإلكتروني", labelEn: "Email address", placeholder: "doctor@example.com", placeholderEn: "doctor@example.com", type: "email", requiredParticipant: true, requiredCoordinator: true, showParticipant: true, showCoordinator: true, color: "#117b59" },
    { id: "affiliation", label: "جهة الانتساب", labelEn: "Affiliation", placeholder: "الجامعة أو المستشفى", placeholderEn: "University or hospital", type: "text", requiredParticipant: true, requiredCoordinator: true, showParticipant: true, showCoordinator: true, color: "#117b59" },
    { id: "whatsapp", label: "رقم واتساب", labelEn: "WhatsApp number", placeholder: "5X XXX XXXX", placeholderEn: "5X XXX XXXX", type: "tel", requiredParticipant: true, requiredCoordinator: false, showParticipant: true, showCoordinator: false, color: "#25D366" },
    { id: "city", label: "المدينة", labelEn: "City", placeholder: "الرياض", placeholderEn: "Riyadh", type: "text", requiredParticipant: true, requiredCoordinator: true, showParticipant: true, showCoordinator: true, color: "#117b59" },
    { id: "orcid", label: "ORCID", labelEn: "ORCID", placeholder: "0000-0000-0000-0000", placeholderEn: "0000-0000-0000-0000", type: "text", requiredParticipant: false, requiredCoordinator: false, showParticipant: true, showCoordinator: true, color: "#64748b" },
    { id: "country", label: "الدولة", labelEn: "Country", placeholder: "", placeholderEn: "", type: "text", requiredParticipant: true, requiredCoordinator: true, showParticipant: true, showCoordinator: true, color: "#117b59" },
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
  const translatedText = (englishKey: keyof SiteContentSettings, arabicKey: keyof SiteContentSettings, max = 600) => {
    if (typeof input[englishKey] === "string") return (input[englishKey] as string).trim().slice(0, max);
    if (typeof input[arabicKey] === "string") return (input[arabicKey] as string).trim().slice(0, max);
    return DEFAULT_SITE_CONTENT_SETTINGS[englishKey] as string;
  };
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
  const requiredOpportunityFields = Array.isArray(input.requiredOpportunityFields)
    ? [...new Set(input.requiredOpportunityFields.filter((field): field is OpportunityFieldId => typeof field === "string" && OPPORTUNITY_FIELD_IDS.includes(field as OpportunityFieldId)))]
    : DEFAULT_SITE_CONTENT_SETTINGS.requiredOpportunityFields;
  const specialtyOptions = Array.isArray(input.specialtyOptions)
    ? input.specialtyOptions.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const value = item as Record<string, unknown>;
      const nameAr = typeof value.nameAr === "string" ? value.nameAr.trim().slice(0, 120) : "";
      const nameEn = typeof value.nameEn === "string" ? value.nameEn.trim().slice(0, 120) : "";
      const id = typeof value.id === "string" && value.id.trim() ? value.id.trim().slice(0, 80) : `${nameAr}-${nameEn}`;
      return nameAr || nameEn ? [{ id, nameAr, nameEn }] : [];
    }).slice(0, 100)
    : DEFAULT_SITE_CONTENT_SETTINGS.specialtyOptions;
  const journalOptions = Array.isArray(input.journalOptions)
    ? input.journalOptions.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const value = item as Record<string, unknown>;
      const get = (key: string, max = 120) => typeof value[key] === "string" ? (value[key] as string).trim().slice(0, max) : "";
      const nameAr = get("nameAr");
      const nameEn = get("nameEn");
      const id = get("id", 80) || `${nameAr}-${nameEn}`;
      return nameAr || nameEn ? [{ id, nameAr, nameEn, issn: get("issn", 30), pubmed: get("pubmed", 40), scopus: get("scopus", 40), wos: get("wos", 40) }] : [];
    }).slice(0, 100)
    : DEFAULT_SITE_CONTENT_SETTINGS.journalOptions;
  const suppliedIds = rawFields
    .map((field) => field && typeof field === "object" ? (field as Record<string, unknown>).id : null)
    .filter((id): id is FieldId => typeof id === "string" && IDS.includes(id as FieldId));
  const orderedIds = [...new Set(suppliedIds), ...IDS.filter((id) => !suppliedIds.includes(id))];
  const fields = orderedIds.map((id) => {
    const base = DEFAULT_SITE_CONTENT_SETTINGS.registrationFields.find((field) => field.id === id)!;
    const supplied = rawFields.find((field) => field && typeof field === "object" && (field as Record<string, unknown>).id === id) as Record<string, unknown> | undefined;
    const fieldText = (key: "label" | "labelEn" | "placeholder" | "placeholderEn", max: number) => {
      if (typeof supplied?.[key] === "string") return supplied[key].trim().slice(0, max);
      const fallbackKey = key === "labelEn" ? "label" : key === "placeholderEn" ? "placeholder" : key;
      return typeof supplied?.[fallbackKey] === "string" ? supplied[fallbackKey].trim().slice(0, max) : base[key];
    };
    const fieldFlag = (key: "requiredParticipant" | "requiredCoordinator" | "showParticipant" | "showCoordinator") => typeof supplied?.[key] === "boolean" ? supplied[key] : base[key];
    const suppliedColor = typeof supplied?.color === "string" && /^#[0-9a-fA-F]{6}$/.test(supplied.color) ? supplied.color : base.color;
    const type = supplied?.type === "email" || supplied?.type === "tel" || supplied?.type === "text" ? supplied.type : base.type;
    return { id, label: fieldText("label", 80), labelEn: fieldText("labelEn", 80), placeholder: fieldText("placeholder", 120), placeholderEn: fieldText("placeholderEn", 120), type, requiredParticipant: fieldFlag("requiredParticipant"), requiredCoordinator: fieldFlag("requiredCoordinator"), showParticipant: fieldFlag("showParticipant"), showCoordinator: fieldFlag("showCoordinator"), color: suppliedColor };
  });
  return {
    participantTitle: text("participantTitle", 120),
    participantTitleEn: translatedText("participantTitleEn", "participantTitle", 120),
    participantDescription: text("participantDescription", 600),
    participantDescriptionEn: translatedText("participantDescriptionEn", "participantDescription", 600),
    coordinatorFormTitle: text("coordinatorFormTitle", 120),
    coordinatorFormTitleEn: translatedText("coordinatorFormTitleEn", "coordinatorFormTitle", 120),
    coordinatorFormDescription: text("coordinatorFormDescription", 600),
    coordinatorFormDescriptionEn: translatedText("coordinatorFormDescriptionEn", "coordinatorFormDescription", 600),
    participantTitleLanguage: input.participantTitleLanguage === "arabic" || input.participantTitleLanguage === "both" || input.participantTitleLanguage === "english" ? input.participantTitleLanguage : DEFAULT_SITE_CONTENT_SETTINGS.participantTitleLanguage,
    coordinatorTitleLanguage: input.coordinatorTitleLanguage === "arabic" || input.coordinatorTitleLanguage === "both" || input.coordinatorTitleLanguage === "english" ? input.coordinatorTitleLanguage : DEFAULT_SITE_CONTENT_SETTINGS.coordinatorTitleLanguage,
    primaryColor: color("primaryColor"),
    accentColor: color("accentColor"),
    cardBackgroundColor: color("cardBackgroundColor"),
    opportunityDisplayMode: input.opportunityDisplayMode === "scroll" || input.opportunityDisplayMode === "grid"
      ? input.opportunityDisplayMode
      : DEFAULT_SITE_CONTENT_SETTINGS.opportunityDisplayMode,
    participantCardOrder: parts("participantCardOrder"),
    coordinatorCardOrder: parts("coordinatorCardOrder"),
    visibleParticipantCardParts: parts("visibleParticipantCardParts"),
    visibleCoordinatorCardParts: parts("visibleCoordinatorCardParts"),
    requiredOpportunityFields,
    specialtyOptions,
    journalOptions,
    registrationFields: fields,
  };
}

export async function saveSiteContentSettings(settings: SiteContentSettings) {
  const value = settings as unknown as Record<string, unknown>;
  await db.insert(coordinatorPortalSettingsTable).values({ key: SITE_CONTENT_KEY, value })
    .onConflictDoUpdate({ target: coordinatorPortalSettingsTable.key, set: { value, updatedAt: new Date() } });
}