export type Audience = "participant" | "coordinator";
export type TitleLanguage = "arabic" | "english" | "both";
export type OpportunityDisplayMode = "grid" | "scroll";
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
  labelEn: string;
  placeholder: string;
  placeholderEn: string;
  type: "text" | "email" | "tel";
  requiredParticipant: boolean;
  requiredCoordinator: boolean;
  showParticipant: boolean;
  showCoordinator: boolean;
  color: string;
}

export type PublicPageId = "home" | "participant" | "knowledge" | "about" | "faq" | "specialRequests" | "researchDetail";
export interface PublicPageContent { titleAr: string; titleEn: string; descriptionAr: string; descriptionEn: string; contentAr: string; contentEn: string; }
export interface BrandContactSettings {
  siteNameAr: string; siteNameEn: string; logoUrl: string;
  appNameAr: string; appNameEn: string; appShortName: string; appIconUrl: string; appThemeColor: string;
  whatsapp: string; whatsappChannelUrl: string; email: string;
  telegramUsername: string; instagramUsername: string; xUsername: string; linkedinUsername: string;
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
  brand: BrandContactSettings;
  pages: Record<PublicPageId, PublicPageContent>;
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
  participantCardOrder: ["description", "specialty", "seats", "duration", "supervisor", "journal", "benefits"],
  coordinatorCardOrder: ["specialty", "supervisor", "seats", "duration", "journal", "benefits", "description"],
  visibleParticipantCardParts: ["description", "specialty", "seats", "duration", "supervisor", "journal", "benefits"],
  visibleCoordinatorCardParts: ["description", "specialty", "seats", "duration", "supervisor", "journal", "benefits"],
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
  brand: {
    siteNameAr: "أكاديمية SRMA للأبحاث", siteNameEn: "SRMA Research Academy", logoUrl: "/srma-logo.jpg",
    appNameAr: "أكاديمية SRMA للأبحاث", appNameEn: "SRMA Research Academy", appShortName: "SRMA", appIconUrl: "/srma-logo.jpg", appThemeColor: "#0d765c",
    whatsapp: "966562159258", whatsappChannelUrl: "", email: "", telegramUsername: "SRMAAcademy", instagramUsername: "", xUsername: "", linkedinUsername: "",
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