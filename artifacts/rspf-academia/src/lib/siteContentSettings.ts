export type Audience = "participant" | "coordinator";
export type TitleLanguage = "arabic" | "english" | "both";
export type RegistrationFieldId = "fullName" | "specialization" | "email" | "affiliation" | "whatsapp" | "city" | "orcid" | "country";
export type OpportunityFieldId = "titleAr" | "titleEn" | "specialtyAr" | "specialtyEn" | "status" | "totalSeats" | "seatsLeft" | "descriptionAr" | "descriptionEn" | "journalTarget" | "journalIssn" | "journalPubmed" | "journalScopus" | "journalWos" | "duration" | "supervisor" | "indexedIn" | "benefits";

export interface SpecialtyOption {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface JournalOption {
  id: string;
  nameAr: string;
  nameEn: string;
  issn: string;
  pubmed: string;
  scopus: string;
  wos: string;
}

export interface RegistrationFieldSetting {
  id: RegistrationFieldId;
  label: string;
  placeholder: string;
  type: "text" | "email" | "tel";
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
  participantTitleLanguage: TitleLanguage;
  coordinatorTitleLanguage: TitleLanguage;
  primaryColor: string;
  accentColor: string;
  cardBackgroundColor: string;
  participantCardOrder: string[];
  coordinatorCardOrder: string[];
  visibleParticipantCardParts: string[];
  visibleCoordinatorCardParts: string[];
  requiredOpportunityFields: OpportunityFieldId[];
  specialtyOptions: SpecialtyOption[];
  journalOptions: JournalOption[];
  registrationFields: RegistrationFieldSetting[];
}

export const CARD_PARTS = [
  { id: "description", label: "الوصف" },
  { id: "specialty", label: "التخصص" },
  { id: "seats", label: "المقاعد" },
  { id: "duration", label: "المدة" },
  { id: "supervisor", label: "المشرف" },
  { id: "journal", label: "المجلة" },
  { id: "benefits", label: "المزايا" },
];

export const OPPORTUNITY_FIELDS: { id: OpportunityFieldId; label: string }[] = [
  { id: "titleAr", label: "العنوان بالعربية" },
  { id: "titleEn", label: "العنوان بالإنجليزية" },
  { id: "specialtyAr", label: "التخصص بالعربية" },
  { id: "specialtyEn", label: "التخصص بالإنجليزية" },
  { id: "status", label: "الحالة" },
  { id: "totalSeats", label: "المقاعد الإجمالية" },
  { id: "seatsLeft", label: "المقاعد المتبقية" },
  { id: "descriptionAr", label: "الوصف بالعربية" },
  { id: "descriptionEn", label: "الوصف بالإنجليزية" },
  { id: "journalTarget", label: "المجلة المستهدفة" },
  { id: "journalIssn", label: "ISSN المجلة" },
  { id: "journalPubmed", label: "تصنيف PubMed" },
  { id: "journalScopus", label: "تصنيف Scopus" },
  { id: "journalWos", label: "تصنيف WOS" },
  { id: "duration", label: "مدة الدراسة" },
  { id: "supervisor", label: "المشرف" },
  { id: "indexedIn", label: "قواعد البيانات" },
  { id: "benefits", label: "مزايا المشاركة" },
];

export const DEFAULT_SITE_CONTENT_SETTINGS: SiteContentSettings = {
  participantTitle: "بوابة المشارك",
  participantDescription: "اكتشف الفرص البحثية المتاحة وسجل في البرنامج المناسب لتخصصك وأهدافك المهنية",
  coordinatorFormTitle: "تسجيل طالب في الفرصة البحثية",
  coordinatorFormDescription: "أدخل بيانات الطالب كما تظهر في مستنداته الأكاديمية.",
  participantTitleLanguage: "english",
  coordinatorTitleLanguage: "arabic",
  primaryColor: "#0C3156",
  accentColor: "#117b59",
  cardBackgroundColor: "#ffffff",
  participantCardOrder: ["description", "specialty", "seats", "duration", "supervisor", "journal", "benefits"],
  coordinatorCardOrder: ["specialty", "supervisor", "seats", "duration", "journal", "benefits", "description"],
  visibleParticipantCardParts: ["description", "specialty", "seats", "duration", "supervisor", "journal", "benefits"],
  visibleCoordinatorCardParts: ["description", "specialty", "seats", "duration", "supervisor", "journal", "benefits"],
  requiredOpportunityFields: [],
  specialtyOptions: [],
  journalOptions: [],
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