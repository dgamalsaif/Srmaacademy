import { coordinatorPortalSettingsTable, db } from "@workspace/db";
import { eq } from "drizzle-orm";

export type Audience = "participant" | "coordinator";
type TitleLanguage = "arabic" | "english" | "both";
type OpportunityDisplayMode = "grid" | "scroll";
type FieldId = "fullName" | "specialization" | "email" | "affiliation" | "whatsapp" | "city" | "orcid" | "country";
export type OpportunityFieldId = "titleAr" | "titleEn" | "specialtyAr" | "specialtyEn" | "status" | "totalSeats" | "seatsLeft" | "descriptionAr" | "descriptionEn" | "journalTarget" | "journalIssn" | "journalPubmed" | "journalScopus" | "journalWos" | "duration" | "supervisor" | "indexedIn" | "benefits";
export interface SpecialtyOption { id: string; nameAr: string; nameEn: string; groupUrl?: string; }
export interface JournalOption { id: string; nameAr: string; nameEn: string; issn: string; pubmed: string; scopus: string; wos: string; specialty?: string; }
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

export type PublicPageId = "home" | "participant" | "knowledge" | "about" | "faq" | "specialRequests" | "researchDetail";
export interface PublicPageContent {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  contentAr: string;
  contentEn: string;
}

export type ContactUsType = "whatsapp" | "phone" | "email" | "telegram" | "instagram" | "custom_url";
export type ForwardingType = "whatsapp" | "whatsapp_direct_url" | "email" | "telegram" | "messenger" | "instagram" | "custom_url" | "none";

export interface BrandContactSettings {
  siteNameAr: string;
  siteNameEn: string;
  logoUrl: string;
  appNameAr: string;
  appNameEn: string;
  appShortName: string;
  appIconUrl: string;
  appThemeColor: string;
  phone: string;
  whatsapp: string;
  participantWhatsapp: string;
  coordinatorWhatsapp: string;
  whatsappChannelUrl: string;
  email: string;
  telegramUsername: string;
  instagramUsername: string;
  xUsername: string;
  linkedinUsername: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  snapchatUrl: string;
  publicSocialIcons: SocialIconId[];
  participantSocialIcons: SocialIconId[];
  coordinatorSocialIcons: SocialIconId[];
  publicIconPosition: FloatingIconPosition;
  participantIconPosition: FloatingIconPosition;
  coordinatorIconPosition: FloatingIconPosition;

  // New: Contact Us configuration
  contactUsType: ContactUsType;
  contactUsValue: string;
  contactUsLabelAr: string;
  contactUsLabelEn: string;

  // New: Post-Registration Forwarding for Participants
  participantForwardType: ForwardingType;
  participantForwardTarget: string;
  participantAutoRedirect: boolean;
  participantCustomMessage: string;

  // New: Post-Registration Forwarding for Coordinators
  coordinatorForwardType: ForwardingType;
  coordinatorForwardTarget: string;
  coordinatorAutoRedirect: boolean;
  coordinatorCustomMessage: string;
}
type SocialIconId = "whatsapp" | "telegram" | "instagram" | "x" | "linkedin" | "facebook" | "tiktok" | "youtube" | "snapchat" | "email" | "phone";
type FloatingIconPosition = "bottom-left" | "bottom-right" | "middle-left" | "middle-right";
const SOCIAL_ICON_IDS: SocialIconId[] = ["whatsapp", "telegram", "instagram", "x", "linkedin", "facebook", "tiktok", "youtube", "snapchat", "email", "phone"];
const ICON_POSITIONS: FloatingIconPosition[] = ["bottom-left", "bottom-right", "middle-left", "middle-right"];

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
  brand: BrandContactSettings;
  pages: Record<PublicPageId, PublicPageContent>;
}

export const SITE_CONTENT_KEY = "site-content";
const IDS: FieldId[] = ["fullName", "specialization", "email", "affiliation", "whatsapp", "city", "orcid", "country"];
const PARTS = ["description", "specialty", "seats", "duration", "supervisor", "journal", "benefits"];
const OPPORTUNITY_FIELD_IDS: OpportunityFieldId[] = ["titleAr", "titleEn", "specialtyAr", "specialtyEn", "status", "totalSeats", "seatsLeft", "descriptionAr", "descriptionEn", "journalTarget", "journalIssn", "journalPubmed", "journalScopus", "journalWos", "duration", "supervisor", "indexedIn", "benefits"];

export const DEFAULT_SPECIALTY_OPTIONS: SpecialtyOption[] = [
  { id: "cardiology", nameAr: "أمراض القلب والأوعية الدموية", nameEn: "Cardiology", groupUrl: "" },
  { id: "surgery", nameAr: "الجراحة العامة وجراحة الأوعية", nameEn: "Surgery", groupUrl: "" },
  { id: "internal-medicine", nameAr: "الباطنة العامة", nameEn: "Internal Medicine", groupUrl: "" },
  { id: "pediatrics", nameAr: "طب الأطفال", nameEn: "Pediatrics", groupUrl: "" },
  { id: "neurology", nameAr: "المخ والأعصاب", nameEn: "Neurology", groupUrl: "" },
  { id: "oncology", nameAr: "علم الأورام", nameEn: "Oncology", groupUrl: "" },
  { id: "orthopedics", nameAr: "جراحة العظام", nameEn: "Orthopedics", groupUrl: "" },
  { id: "obgyn", nameAr: "النساء والولادة", nameEn: "Obstetrics & Gynecology", groupUrl: "" },
  { id: "radiology", nameAr: "الأشعة والتصوير الطبي", nameEn: "Radiology", groupUrl: "" },
  { id: "psychiatry", nameAr: "الطب النفسي", nameEn: "Psychiatry", groupUrl: "" },
];

export const DEFAULT_JOURNAL_OPTIONS: JournalOption[] = [
  { id: "lancet", nameAr: "ذا لانسيت", nameEn: "The Lancet", issn: "0140-6736", pubmed: "Indexed", scopus: "Q1", wos: "Q1", specialty: "General Medicine / الطب العام" },
  { id: "nejm", nameAr: "نيو إنغلاند جورنال أوف ميديسين", nameEn: "New England Journal of Medicine (NEJM)", issn: "0028-4793", pubmed: "Indexed", scopus: "Q1", wos: "Q1", specialty: "General Medicine / الطب العام" },
  { id: "jama", nameAr: "جاما - الجمعية الطبية الأمريكية", nameEn: "JAMA", issn: "0098-7484", pubmed: "Indexed", scopus: "Q1", wos: "Q1", specialty: "General Medicine / الطب العام" },
  { id: "bmj", nameAr: "المجلة الطبية البريطانية", nameEn: "The BMJ", issn: "1756-1833", pubmed: "Indexed", scopus: "Q1", wos: "Q1", specialty: "General Medicine / الطب العام" },
  { id: "eur-heart-j", nameAr: "المجلة الأوروبية للقلب", nameEn: "European Heart Journal", issn: "0195-668X", pubmed: "Indexed", scopus: "Q1", wos: "Q1", specialty: "Cardiology / أمراض القلب" },
  { id: "annals-surgery", nameAr: "سجلات الجراحة", nameEn: "Annals of Surgery", issn: "0003-4932", pubmed: "Indexed", scopus: "Q1", wos: "Q1", specialty: "Surgery / الجراحة العامة" },
  { id: "lancet-oncology", nameAr: "لانسيت للأورام", nameEn: "The Lancet Oncology", issn: "1470-2045", pubmed: "Indexed", scopus: "Q1", wos: "Q1", specialty: "Oncology / علم الأورام" },
  { id: "pediatrics-j", nameAr: "طب الأطفال", nameEn: "Pediatrics", issn: "0031-4005", pubmed: "Indexed", scopus: "Q1", wos: "Q1", specialty: "Pediatrics / طب الأطفال" },
  { id: "neurology-j", nameAr: "مجلة الأعصاب", nameEn: "Neurology", issn: "0028-3878", pubmed: "Indexed", scopus: "Q1", wos: "Q1", specialty: "Neurology / طب المخ والأعصاب" },
  { id: "cureus", nameAr: "كيوريوس للعلوم الطبية", nameEn: "Cureus Journal of Medical Science", issn: "2168-8184", pubmed: "Indexed", scopus: "Q2", wos: "ESCI", specialty: "General Medicine / الطب العام" },
  { id: "plos-one", nameAr: "بلوس وان", nameEn: "PLOS ONE", issn: "1932-6203", pubmed: "Indexed", scopus: "Q1", wos: "Q2", specialty: "Multidisciplinary / متعدد التخصصات" },
  { id: "frontiers-med", nameAr: "فرونتيرز في الطب", nameEn: "Frontiers in Medicine", issn: "2296-858X", pubmed: "Indexed", scopus: "Q2", wos: "Q2", specialty: "General Medicine / الطب العام" },
];

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
  specialtyOptions: [...DEFAULT_SPECIALTY_OPTIONS],
  journalOptions: [...DEFAULT_JOURNAL_OPTIONS],
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
  brand: {
    siteNameAr: "أكاديمية SRMA للأبحاث",
    siteNameEn: "SRMA Research Academy",
    logoUrl: "/srma-logo.jpg",
    appNameAr: "أكاديمية SRMA للأبحاث",
    appNameEn: "SRMA Research Academy",
    appShortName: "SRMA",
    appIconUrl: "/srma-logo.jpg",
    appThemeColor: "#0d765c",
    phone: "",
    whatsapp: "966562159258",
    participantWhatsapp: "966562159258",
    coordinatorWhatsapp: "966562159258",
    whatsappChannelUrl: "",
    email: "",
    telegramUsername: "SRMAAcademy",
    instagramUsername: "",
    xUsername: "",
    linkedinUsername: "",
    facebookUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    snapchatUrl: "",
    publicSocialIcons: ["whatsapp", "telegram"],
    participantSocialIcons: ["whatsapp", "telegram"],
    coordinatorSocialIcons: ["whatsapp", "telegram"],
    publicIconPosition: "bottom-left",
    participantIconPosition: "bottom-left",
    coordinatorIconPosition: "bottom-left",
    contactUsType: "whatsapp",
    contactUsValue: "966562159258",
    contactUsLabelAr: "تواصل معنا",
    contactUsLabelEn: "Contact Us",
    participantForwardType: "whatsapp",
    participantForwardTarget: "966562159258",
    participantAutoRedirect: true,
    participantCustomMessage: "",
    coordinatorForwardType: "whatsapp",
    coordinatorForwardTarget: "966562159258",
    coordinatorAutoRedirect: false,
    coordinatorCustomMessage: "",
  },
  pages: {
    home: { titleAr: "أكاديمية SRMA للأبحاث", titleEn: "SRMA Research Academy", descriptionAr: "نحو مجتمع بحثي أكثر تأثيراً", descriptionEn: "Building a more impactful research community", contentAr: "", contentEn: "" },
    participant: { titleAr: "بوابة المشارك", titleEn: "Participant Portal", descriptionAr: "اكتشف الفرص البحثية المتاحة وسجل في البرنامج المناسب", descriptionEn: "Explore available research opportunities and register for the right program", contentAr: "", contentEn: "" },
    knowledge: { titleAr: "مركز المعرفة", titleEn: "Knowledge Center", descriptionAr: "محتوى وأدلة تساعدك في رحلتك البحثية", descriptionEn: "Resources and guides for your research journey", contentAr: "", contentEn: "" },
    about: { titleAr: "عن الأكاديمية", titleEn: "About the Academy", descriptionAr: "تعرف على رسالة وأهداف أكاديمية SRMA", descriptionEn: "Learn about SRMA Academy's mission and goals", contentAr: "", contentEn: "" },
    faq: { titleAr: "الأسئلة الشائعة", titleEn: "Frequently Asked Questions", descriptionAr: "إجابات عن أكثر الأسئلة تكراراً", descriptionEn: "Answers to the most common questions", contentAr: "", contentEn: "" },
    specialRequests: { titleAr: "الطلبات الخاصة", titleEn: "Special Requests", descriptionAr: "خدمات بحثية متخصصة ومتكاملة", descriptionEn: "Specialized and integrated research services", contentAr: "", contentEn: "" },
    researchDetail: { titleAr: "تفاصيل الفرصة البحثية", titleEn: "Research Opportunity Details", descriptionAr: "راجع تفاصيل الفرصة ثم أكمل التسجيل", descriptionEn: "Review the opportunity details and complete your registration", contentAr: "", contentEn: "" },
  },
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
  const specialtyOptions = Array.isArray(input.specialtyOptions) && input.specialtyOptions.length > 0
    ? input.specialtyOptions.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const value = item as Record<string, unknown>;
      const nameAr = typeof value.nameAr === "string" ? value.nameAr.trim().slice(0, 120) : "";
      const nameEn = typeof value.nameEn === "string" ? value.nameEn.trim().slice(0, 120) : "";
      const id = typeof value.id === "string" && value.id.trim() ? value.id.trim().slice(0, 80) : `${nameAr}-${nameEn}`;
      const groupUrl = typeof value.groupUrl === "string" && (value.groupUrl.trim().startsWith("https://") || value.groupUrl.trim().startsWith("http://")) ? value.groupUrl.trim().slice(0, 500) : "";
      return nameAr || nameEn ? [{ id, nameAr, nameEn, ...(groupUrl ? { groupUrl } : {}) }] : [];
    }).slice(0, 100)
    : DEFAULT_SITE_CONTENT_SETTINGS.specialtyOptions;
  const journalOptions = Array.isArray(input.journalOptions) && input.journalOptions.length > 0
    ? input.journalOptions.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const value = item as Record<string, unknown>;
      const get = (key: string, max = 120) => typeof value[key] === "string" ? (value[key] as string).trim().slice(0, max) : "";
      const nameAr = get("nameAr");
      const nameEn = get("nameEn");
      const id = get("id", 80) || `${nameAr}-${nameEn}`;
      const specialty = get("specialty", 120);
      return nameAr || nameEn ? [{ id, nameAr, nameEn, issn: get("issn", 30), pubmed: get("pubmed", 40), scopus: get("scopus", 40), wos: get("wos", 40), ...(specialty ? { specialty } : {}) }] : [];
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
  const object = (key: "brand" | "pages") => input[key] && typeof input[key] === "object" && !Array.isArray(input[key])
    ? input[key] as Record<string, unknown>
    : {};
  const brandInput = object("brand");
  type BrandTextKey = { [K in keyof BrandContactSettings]: BrandContactSettings[K] extends string ? K : never }[keyof BrandContactSettings];
  const brandText = (key: BrandTextKey, max = 200): string => typeof brandInput[key] === "string"
    ? (brandInput[key] as string).trim().slice(0, max)
    : DEFAULT_SITE_CONTENT_SETTINGS.brand[key] as string;
  const brandIcons = (key: "publicSocialIcons" | "participantSocialIcons" | "coordinatorSocialIcons") => {
    const candidate = brandInput[key];
    return Array.isArray(candidate)
      ? [...new Set(candidate.filter((id): id is SocialIconId => typeof id === "string" && SOCIAL_ICON_IDS.includes(id as SocialIconId)))]
      : DEFAULT_SITE_CONTENT_SETTINGS.brand[key];
  };
  const brandPosition = (key: "publicIconPosition" | "participantIconPosition" | "coordinatorIconPosition") => {
    const candidate = brandInput[key];
    return typeof candidate === "string" && ICON_POSITIONS.includes(candidate as FloatingIconPosition)
      ? candidate as FloatingIconPosition
      : DEFAULT_SITE_CONTENT_SETTINGS.brand[key];
  };
  const safeUrl = (candidate: string, fallback = "") => {
    if (candidate === "") return "";
    if (candidate.startsWith("/") && !candidate.startsWith("//") && !candidate.split("/").includes("..") && !/[\u0000-\u001f]/.test(candidate)) return candidate;
    try {
      const parsed = new URL(candidate);
      return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed.toString() : fallback;
    } catch {
      return fallback;
    }
  };
  const safeAppIcon = (candidate: string) => {
    const normalized = safeUrl(candidate, DEFAULT_SITE_CONTENT_SETTINGS.brand.appIconUrl);
    if (normalized.startsWith("/")) return normalized;
    try {
      const host = new URL(normalized).hostname.toLowerCase();
      return host === "srmaacademy.com" || host === "www.srmaacademy.com"
        ? normalized
        : DEFAULT_SITE_CONTENT_SETTINGS.brand.appIconUrl;
    } catch {
      return DEFAULT_SITE_CONTENT_SETTINGS.brand.appIconUrl;
    }
  };
  const pagesInput = object("pages");
  const pageIds = Object.keys(DEFAULT_SITE_CONTENT_SETTINGS.pages) as PublicPageId[];
  const pages = Object.fromEntries(pageIds.map((id) => {
    const candidate = pagesInput[id] && typeof pagesInput[id] === "object" && !Array.isArray(pagesInput[id])
      ? pagesInput[id] as Record<string, unknown>
      : {};
    const base = DEFAULT_SITE_CONTENT_SETTINGS.pages[id];
    const pageText = (key: keyof PublicPageContent, max: number) => typeof candidate[key] === "string"
      ? (candidate[key] as string).trim().slice(0, max)
      : base[key];
    return [id, {
      titleAr: pageText("titleAr", 160),
      titleEn: pageText("titleEn", 160),
      descriptionAr: pageText("descriptionAr", 1200),
      descriptionEn: pageText("descriptionEn", 1200),
      contentAr: pageText("contentAr", 12000),
      contentEn: pageText("contentEn", 12000),
    }];
  })) as Record<PublicPageId, PublicPageContent>;
  const globalWhatsapp = brandText("whatsapp", 40).replace(/[^\d+]/g, "");
  const audienceWhatsapp = (key: "participantWhatsapp" | "coordinatorWhatsapp") => {
    const supplied = brandInput[key];
    return (typeof supplied === "string" ? supplied : globalWhatsapp).replace(/[^\d+]/g, "").slice(0, 40);
  };
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
    brand: {
      siteNameAr: brandText("siteNameAr", 160),
      siteNameEn: brandText("siteNameEn", 160),
      logoUrl: safeUrl(brandText("logoUrl", 1000), DEFAULT_SITE_CONTENT_SETTINGS.brand.logoUrl),
      appNameAr: brandText("appNameAr", 160),
      appNameEn: brandText("appNameEn", 160),
      appShortName: brandText("appShortName", 30),
      appIconUrl: safeAppIcon(brandText("appIconUrl", 1000)),
      appThemeColor: /^#[0-9a-fA-F]{6}$/.test(brandText("appThemeColor", 7)) ? brandText("appThemeColor", 7) : DEFAULT_SITE_CONTENT_SETTINGS.brand.appThemeColor,
      phone: brandText("phone", 40).replace(/[^\d+]/g, ""),
      whatsapp: globalWhatsapp,
      participantWhatsapp: audienceWhatsapp("participantWhatsapp"),
      coordinatorWhatsapp: audienceWhatsapp("coordinatorWhatsapp"),
      whatsappChannelUrl: safeUrl(brandText("whatsappChannelUrl", 1000), ""),
      email: brandText("email", 254),
      telegramUsername: brandText("telegramUsername", 100).replace(/^@/, ""),
      instagramUsername: brandText("instagramUsername", 100).replace(/^@/, ""),
      xUsername: brandText("xUsername", 100).replace(/^@/, ""),
      linkedinUsername: brandText("linkedinUsername", 200).replace(/^@/, ""),
      facebookUrl: safeUrl(brandText("facebookUrl", 1000), ""),
      tiktokUrl: safeUrl(brandText("tiktokUrl", 1000), ""),
      youtubeUrl: safeUrl(brandText("youtubeUrl", 1000), ""),
      snapchatUrl: safeUrl(brandText("snapchatUrl", 1000), ""),
      publicSocialIcons: brandIcons("publicSocialIcons"),
      participantSocialIcons: brandIcons("participantSocialIcons"),
      coordinatorSocialIcons: brandIcons("coordinatorSocialIcons"),
      publicIconPosition: brandPosition("publicIconPosition"),
      participantIconPosition: brandPosition("participantIconPosition"),
      coordinatorIconPosition: brandPosition("coordinatorIconPosition"),
      contactUsType: (["whatsapp", "phone", "email", "telegram", "instagram", "custom_url"] as ContactUsType[]).includes(brandInput.contactUsType as ContactUsType)
        ? (brandInput.contactUsType as ContactUsType)
        : DEFAULT_SITE_CONTENT_SETTINGS.brand.contactUsType,
      contactUsValue: brandText("contactUsValue", 500) || globalWhatsapp,
      contactUsLabelAr: brandText("contactUsLabelAr", 80) || DEFAULT_SITE_CONTENT_SETTINGS.brand.contactUsLabelAr,
      contactUsLabelEn: brandText("contactUsLabelEn", 80) || DEFAULT_SITE_CONTENT_SETTINGS.brand.contactUsLabelEn,
      participantForwardType: (["whatsapp", "whatsapp_direct_url", "email", "telegram", "messenger", "instagram", "custom_url", "none"] as ForwardingType[]).includes(brandInput.participantForwardType as ForwardingType)
        ? (brandInput.participantForwardType as ForwardingType)
        : DEFAULT_SITE_CONTENT_SETTINGS.brand.participantForwardType,
      participantForwardTarget: brandText("participantForwardTarget", 500) || audienceWhatsapp("participantWhatsapp"),
      participantAutoRedirect: typeof brandInput.participantAutoRedirect === "boolean" ? brandInput.participantAutoRedirect : DEFAULT_SITE_CONTENT_SETTINGS.brand.participantAutoRedirect,
      participantCustomMessage: brandText("participantCustomMessage", 1000),
      coordinatorForwardType: (["whatsapp", "whatsapp_direct_url", "email", "telegram", "messenger", "instagram", "custom_url", "none"] as ForwardingType[]).includes(brandInput.coordinatorForwardType as ForwardingType)
        ? (brandInput.coordinatorForwardType as ForwardingType)
        : DEFAULT_SITE_CONTENT_SETTINGS.brand.coordinatorForwardType,
      coordinatorForwardTarget: brandText("coordinatorForwardTarget", 500) || audienceWhatsapp("coordinatorWhatsapp"),
      coordinatorAutoRedirect: typeof brandInput.coordinatorAutoRedirect === "boolean" ? brandInput.coordinatorAutoRedirect : DEFAULT_SITE_CONTENT_SETTINGS.brand.coordinatorAutoRedirect,
      coordinatorCustomMessage: brandText("coordinatorCustomMessage", 1000),
    },
    pages,
  };
}

export async function saveSiteContentSettings(settings: SiteContentSettings) {
  const value = settings as unknown as Record<string, unknown>;
  await db.insert(coordinatorPortalSettingsTable).values({ key: SITE_CONTENT_KEY, value })
    .onConflictDoUpdate({ target: coordinatorPortalSettingsTable.key, set: { value, updatedAt: new Date() } });
}