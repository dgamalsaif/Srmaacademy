export type Audience = "participant" | "coordinator";
export type TitleLanguage = "arabic" | "english" | "both";
export type RegistrationFieldId = "fullName" | "specialization" | "email" | "affiliation" | "whatsapp" | "city" | "orcid" | "country";

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