export type Audience = "participant" | "coordinator";
export type TitleLanguage = "arabic" | "english" | "both";
export type OpportunityDisplayMode = "grid" | "scroll";
export type RegistrationFieldId = "fullName" | "specialization" | "email" | "affiliation" | "whatsapp" | "city" | "orcid" | "country";
export type OpportunityFieldId = "titleAr" | "titleEn" | "specialtyAr" | "specialtyEn" | "status" | "totalSeats" | "seatsLeft" | "descriptionAr" | "descriptionEn" | "journalTarget" | "journalIssn" | "journalPubmed" | "journalScopus" | "journalWos" | "duration" | "supervisor" | "indexedIn" | "benefits";

export interface SpecialtyOption {
  id: string;
  nameAr: string;
  nameEn: string;
  groupUrl?: string;
}

export interface JournalOption {
  id: string;
  nameAr: string;
  nameEn: string;
  issn: string;
  pubmed: string;
  scopus: string;
  wos: string;
  specialty?: string;
}

export interface AcademicDegreeOption {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface AcademicDegreeSettings {
  enabled: boolean;
  required: boolean;
  labelAr: string;
  labelEn: string;
  options: AcademicDegreeOption[];
}

export interface ResearchExperienceSettings {
  enabled: boolean;
  required: boolean;
  labelAr: string;
  labelEn: string;
  yesLabelAr: string;
  yesLabelEn: string;
  noLabelAr: string;
  noLabelEn: string;
  detailsLabelAr: string;
  detailsLabelEn: string;
  detailsPlaceholderAr: string;
  detailsPlaceholderEn: string;
  detailsRequiredWhenYes: boolean;
}

export interface FeeAndTaskAgreementSettings {
  enabled: boolean;
  required: boolean;
  questionAr: string;
  questionEn: string;
  agreeLabelAr: string;
  agreeLabelEn: string;
  disagreeLabelAr: string;
  disagreeLabelEn: string;
  warningNoticeAr: string;
  warningNoticeEn: string;
  blockingMessageAr: string;
  blockingMessageEn: string;
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

export type ContactUsType = "whatsapp" | "phone" | "email" | "telegram" | "instagram" | "custom_url";
export type ForwardingType = "whatsapp" | "whatsapp_direct_url" | "email" | "telegram" | "messenger" | "instagram" | "custom_url" | "none";
export type OpportunityInquiryChannel = "whatsapp" | "email" | "telegram" | "phone" | "custom_url";

export interface BrandContactSettings {
  siteNameAr: string; siteNameEn: string; logoUrl: string;
  appNameAr: string; appNameEn: string; appShortName: string; appIconUrl: string; appThemeColor: string;
  phone: string; whatsapp: string; participantWhatsapp: string; coordinatorWhatsapp: string; whatsappChannelUrl: string; email: string;
  telegramUsername: string; instagramUsername: string; xUsername: string; linkedinUsername: string;
  facebookUrl: string; tiktokUrl: string; youtubeUrl: string; snapchatUrl: string;
  publicSocialIcons: SocialIconId[]; participantSocialIcons: SocialIconId[]; coordinatorSocialIcons: SocialIconId[];
  publicIconPosition: FloatingIconPosition; participantIconPosition: FloatingIconPosition; coordinatorIconPosition: FloatingIconPosition;

  // Contact Us configuration
  contactUsType: ContactUsType;
  contactUsValue: string;
  contactUsLabelAr: string;
  contactUsLabelEn: string;

  // Opportunity Contact Channels (under registration / order button)
  opportunityContactEnabled?: boolean;
  opportunityContactChannels?: ("whatsapp" | "telegram" | "email" | "phone")[];
  opportunityContactType?: ContactUsType;
  opportunityContactValue?: string;
  opportunityContactLabelAr?: string;
  opportunityContactLabelEn?: string;
  opportunityContactEmail?: string;
  opportunityContactPhone?: string;
  opportunityContactTelegram?: string;
  opportunityContactWhatsapp?: string;

  // Opportunity Inquiry Button directly under Register Button
  opportunityInquiryEnabled?: boolean;
  opportunityInquiryChannel?: OpportunityInquiryChannel;
  opportunityInquiryValue?: string;
  opportunityInquiryWhatsapp?: string;
  opportunityInquiryTelegram?: string;
  opportunityInquiryEmail?: string;
  opportunityInquiryPhone?: string;
  opportunityInquiryCustomUrl?: string;
  opportunityInquiryLabelAr?: string;
  opportunityInquiryLabelEn?: string;
  opportunityInquiryMessageAr?: string;
  opportunityInquiryMessageEn?: string;

  // Post-Registration Forwarding for Participants
  participantForwardType: ForwardingType;
  participantForwardTarget: string;
  participantAutoRedirect: boolean;
  participantCustomMessage: string;

  // Post-Registration Forwarding for Coordinators
  coordinatorForwardType: ForwardingType;
  coordinatorForwardTarget: string;
  coordinatorAutoRedirect: boolean;
  coordinatorCustomMessage: string;
}
export type SocialIconId = "whatsapp" | "telegram" | "instagram" | "x" | "linkedin" | "facebook" | "tiktok" | "youtube" | "snapchat" | "email" | "phone";
export type FloatingIconPosition = "bottom-left" | "bottom-right" | "middle-left" | "middle-right";
export const SOCIAL_ICON_OPTIONS: { id: SocialIconId; label: string }[] = [
  { id: "whatsapp", label: "واتساب" }, { id: "telegram", label: "تيليجرام" },
  { id: "instagram", label: "إنستجرام" }, { id: "x", label: "X" },
  { id: "linkedin", label: "لينكد إن" }, { id: "facebook", label: "فيسبوك" },
  { id: "tiktok", label: "تيك توك" }, { id: "youtube", label: "يوتيوب" },
  { id: "snapchat", label: "سناب شات" }, { id: "email", label: "البريد" }, { id: "phone", label: "الهاتف" },
];

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
  academicDegreeSettings: AcademicDegreeSettings;
  researchExperienceSettings: ResearchExperienceSettings;
  feeAndTaskAgreementSettings: FeeAndTaskAgreementSettings;
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

export const DEFAULT_ACADEMIC_DEGREE_OPTIONS: AcademicDegreeOption[] = [
  { id: "intern", nameAr: "طبيب امتياز (Intern)", nameEn: "Intern / House Officer" },
  { id: "resident", nameAr: "طبيب مقيم / رزدنت (Resident)", nameEn: "Resident" },
  { id: "consultant", nameAr: "طبيب استشاري (Consultant)", nameEn: "Consultant" },
  { id: "specialist", nameAr: "طبيب أخصائي (Specialist)", nameEn: "Specialist" },
  { id: "student", nameAr: "طالب طب / علوم صحية", nameEn: "Medical / Health Sciences Student" },
  { id: "other", nameAr: "باحث / درجة أكاديمية أخرى", nameEn: "Researcher / Other" },
];

export const DEFAULT_ACADEMIC_DEGREE_SETTINGS: AcademicDegreeSettings = {
  enabled: true,
  required: true,
  labelAr: "الدرجة الأكاديمية / الوظيفية",
  labelEn: "Academic Degree / Status",
  options: [...DEFAULT_ACADEMIC_DEGREE_OPTIONS],
};

export const DEFAULT_RESEARCH_EXPERIENCE_SETTINGS: ResearchExperienceSettings = {
  enabled: true,
  required: true,
  labelAr: "هل لديك خبرات بحثية سابقة؟",
  labelEn: "Do you have prior research experience?",
  yesLabelAr: "نعم",
  yesLabelEn: "Yes",
  noLabelAr: "لا",
  noLabelEn: "No",
  detailsLabelAr: "يرجى ذكر وتوضيح تفاصيل خبراتك البحثية السابقة",
  detailsLabelEn: "Please detail your previous research experience",
  detailsPlaceholderAr: "مثال: أبحاث منشورة، مشاريع بحثية، مهارات إحصائية (SPSS/R)، كتابة أوراق علمية...",
  detailsPlaceholderEn: "e.g., published papers, research projects, data analysis (SPSS/R), protocol writing...",
  detailsRequiredWhenYes: true,
};

export const DEFAULT_FEE_AND_TASK_AGREEMENT_SETTINGS: FeeAndTaskAgreementSettings = {
  enabled: true,
  required: true,
  questionAr: "هل أنت موافق على دفع رسوم التحليل والنشر والقيام بالمهام الموكلة إليك في البحث وفي النطاق الزمني المحدد، من أجل التحليل ضمن الفريق البحثي؟",
  questionEn: "Do you agree to pay the analysis and publication fees and carry out the tasks assigned to you in the research within the specified timeline, for analysis within the research team?",
  agreeLabelAr: "أوافق",
  agreeLabelEn: "I Agree",
  disagreeLabelAr: "لا أوافق",
  disagreeLabelEn: "I Do Not Agree",
  warningNoticeAr: "تنبيه: الموافقة على دفع رسوم التحليل والنشر والالتزام بالمهام في النطاق الزمني شرط إلزامي للانضمام للفريق البحثي وإتمام عملية التسجيل.",
  warningNoticeEn: "Notice: Agreeing to pay analysis and publication fees and commit to tasks within the timeline is mandatory to join the research team and complete registration.",
  blockingMessageAr: "لا يمكن إتمام عملية التسجيل دون الموافقة على دفع رسوم التحليل والنشر والقيام بالمهام في النطاق الزمني المحدد.",
  blockingMessageEn: "Registration cannot be completed without agreeing to pay the fees and perform the assigned tasks within the specified timeline.",
};

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
  specialtyOptions: [...DEFAULT_SPECIALTY_OPTIONS],
  journalOptions: [...DEFAULT_JOURNAL_OPTIONS],
  academicDegreeSettings: { ...DEFAULT_ACADEMIC_DEGREE_SETTINGS },
  researchExperienceSettings: { ...DEFAULT_RESEARCH_EXPERIENCE_SETTINGS },
  feeAndTaskAgreementSettings: { ...DEFAULT_FEE_AND_TASK_AGREEMENT_SETTINGS },
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
    phone: "+966562159258", whatsapp: "966562159258", participantWhatsapp: "966562159258", coordinatorWhatsapp: "966562159258", whatsappChannelUrl: "", email: "srmaacademy@gmail.com", telegramUsername: "SRMAAcademy", instagramUsername: "", xUsername: "", linkedinUsername: "",
    facebookUrl: "", tiktokUrl: "", youtubeUrl: "", snapchatUrl: "",
    publicSocialIcons: ["whatsapp", "telegram"], participantSocialIcons: ["whatsapp", "telegram"], coordinatorSocialIcons: ["whatsapp", "telegram"],
    publicIconPosition: "bottom-left", participantIconPosition: "bottom-left", coordinatorIconPosition: "bottom-left",
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
    opportunityContactEnabled: true,
    opportunityContactChannels: ["whatsapp", "telegram", "email", "phone"],
    opportunityContactType: "whatsapp",
    opportunityContactValue: "966562159258",
    opportunityContactLabelAr: "تواصل معنا بخصوص هذه الفرصة",
    opportunityContactLabelEn: "Contact us about this opportunity",
    opportunityContactEmail: "srmaacademy@gmail.com",
    opportunityContactPhone: "966562159258",
    opportunityContactTelegram: "SRMAAcademy",
    opportunityContactWhatsapp: "966562159258",
    opportunityInquiryEnabled: true,
    opportunityInquiryChannel: "whatsapp",
    opportunityInquiryValue: "966562159258",
    opportunityInquiryWhatsapp: "966562159258",
    opportunityInquiryTelegram: "SRMAAcademy",
    opportunityInquiryEmail: "srmaacademy@gmail.com",
    opportunityInquiryPhone: "+966562159258",
    opportunityInquiryCustomUrl: "",
    opportunityInquiryLabelAr: "تواصل معنا للاستفسار 💬",
    opportunityInquiryLabelEn: "Contact us for inquiries 💬",
    opportunityInquiryMessageAr: "مرحباً، أود الاستفسار والتسجيل بخصوص الفرصة البحثية: {title}",
    opportunityInquiryMessageEn: "Hello, I would like to inquire about the research opportunity: {title}",
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

export function getContactUsHref(brand?: BrandContactSettings): { href: string; isExternal: boolean; labelAr: string; labelEn: string } {
  const b = brand || DEFAULT_SITE_CONTENT_SETTINGS.brand;
  const type = b.contactUsType || "whatsapp";
  const val = (b.contactUsValue || b.whatsapp || "966562159258").trim();
  const labelAr = b.contactUsLabelAr || "تواصل معنا";
  const labelEn = b.contactUsLabelEn || "Contact Us";

  switch (type) {
    case "phone":
      return { href: `tel:${val.replace(/[^\d+]/g, "")}`, isExternal: false, labelAr, labelEn };
    case "email":
      return { href: `mailto:${val}`, isExternal: false, labelAr, labelEn };
    case "telegram": {
      const raw = val.trim();
      if (raw.startsWith("http")) {
        return { href: raw, isExternal: true, labelAr, labelEn };
      }
      const clean = raw.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "").replace(/\/$/, "");
      const isPhone = /^\+?\d{8,15}$/.test(clean.replace(/\s+/g, "")) || (/^05\d{8}$/.test(clean) && clean.length === 10);
      if (isPhone) {
        let digits = clean.replace(/[^\d]/g, "");
        if (digits.startsWith("05") && digits.length === 10) digits = "966" + digits.substring(1);
        return { href: `tg://resolve?phone=${digits}`, isExternal: true, labelAr, labelEn };
      }
      return {
        href: `https://t.me/${clean}`,
        isExternal: true,
        labelAr,
        labelEn,
      };
    }
    case "instagram":
      return {
        href: val.startsWith("http") ? val : `https://instagram.com/${val.replace(/^@/, "")}`,
        isExternal: true,
        labelAr,
        labelEn,
      };
    case "custom_url":
      return { href: val, isExternal: true, labelAr, labelEn };
    case "whatsapp":
    default: {
      const cleanNum = val.replace(/[^\d+]/g, "").replace(/^\+/, "");
      return {
        href: val.startsWith("http") ? val : `https://wa.me/${cleanNum || "966562159258"}`,
        isExternal: true,
        labelAr,
        labelEn,
      };
    }
  }
}

export interface OpportunityContactLink {
  id: "whatsapp" | "telegram" | "email" | "phone";
  href: string;
  isExternal: boolean;
  labelAr: string;
  labelEn: string;
  displayValue: string;
}

export function getOpportunityContactLinks(
  brand?: BrandContactSettings,
  opportunityTitle?: string,
  language: "ar" | "en" = "ar"
): OpportunityContactLink[] {
  const b = brand || DEFAULT_SITE_CONTENT_SETTINGS.brand;
  if (b.opportunityContactEnabled === false) return [];

  const channels = b.opportunityContactChannels || ["whatsapp", "telegram", "email", "phone"];
  const links: OpportunityContactLink[] = [];

  const titleText = opportunityTitle ? `"${opportunityTitle}"` : "";
  const whatsappMsg = language === "en"
    ? `Hello, I would like to inquire about the research opportunity: ${titleText}`
    : `مرحباً، أود الاستفسار والتسجيل بخصوص الفرصة البحثية: ${titleText}`;
  const emailSubject = language === "en"
    ? `Inquiry regarding research opportunity: ${opportunityTitle || ""}`
    : `استفسار بخصوص الفرصة البحثية: ${opportunityTitle || ""}`;

  for (const channel of channels) {
    if (channel === "whatsapp") {
      const num = (b.opportunityContactWhatsapp || b.whatsapp || "966562159258").trim();
      if (num) {
        const clean = num.replace(/[^\d+]/g, "").replace(/^\+/, "");
        links.push({
          id: "whatsapp",
          href: `https://wa.me/${clean}?text=${encodeURIComponent(whatsappMsg)}`,
          isExternal: true,
          labelAr: "واتساب",
          labelEn: "WhatsApp",
          displayValue: num,
        });
      }
    } else if (channel === "telegram") {
      const tg = (b.opportunityContactTelegram || b.telegramUsername || "SRMAAcademy").trim();
      if (tg) {
        const isUrl = tg.startsWith("http");
        const clean = tg.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "").replace(/\/$/, "");
        const isPhone = /^\+?\d{8,15}$/.test(clean.replace(/\s+/g, "")) || (/^05\d{8}$/.test(clean) && clean.length === 10);
        let href = "";
        let displayVal = `@${clean}`;
        if (isUrl) {
          href = tg;
          displayVal = "Telegram";
        } else if (isPhone) {
          let cleanDigits = clean.replace(/[^\d]/g, "");
          if (cleanDigits.startsWith("05") && cleanDigits.length === 10) {
            cleanDigits = "966" + cleanDigits.substring(1);
          }
          href = `tg://resolve?phone=${cleanDigits}`;
          displayVal = `+${cleanDigits}`;
        } else {
          href = `https://t.me/${clean}?text=${encodeURIComponent(whatsappMsg)}`;
          displayVal = `@${clean}`;
        }
        links.push({
          id: "telegram",
          href,
          isExternal: true,
          labelAr: "تيليجرام",
          labelEn: "Telegram",
          displayValue: displayVal,
        });
      }
    } else if (channel === "email") {
      const mail = (
        b.opportunityContactEmail ||
        b.opportunityInquiryEmail ||
        (b.contactUsType === "email" && b.contactUsValue && b.contactUsValue.includes("@") ? b.contactUsValue : "") ||
        b.email ||
        "srmaacademy@gmail.com"
      ).trim();
      const customArMsg = b.opportunityInquiryMessageAr || "مرحباً، أود الاستفسار والتسجيل بخصوص الفرصة البحثية: {title}";
      const customEnMsg = b.opportunityInquiryMessageEn || "Hello, I would like to inquire about the research opportunity: {title}";
      const rawInquiryMsg = language === "en" ? customEnMsg : customArMsg;
      const emailBody = rawInquiryMsg.replace(/{title}/g, titleText).replace(/{name}/g, titleText);

      if (mail) {
        links.push({
          id: "email",
          href: `mailto:${mail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`,
          isExternal: false,
          labelAr: "البريد الإلكتروني",
          labelEn: "Email",
          displayValue: mail,
        });
      }
    } else if (channel === "phone") {
      const ph = (b.opportunityContactPhone || b.phone || b.whatsapp || "966562159258").trim();
      if (ph) {
        const clean = ph.replace(/[^\d+]/g, "");
        links.push({
          id: "phone",
          href: `tel:${clean}`,
          isExternal: false,
          labelAr: "اتصال هاتفي",
          labelEn: "Phone Call",
          displayValue: ph,
        });
      }
    }
  }

  return links;
}

export interface OpportunityInquiryLink {
  channel: OpportunityInquiryChannel;
  href: string;
  isExternal: boolean;
  labelAr: string;
  labelEn: string;
  displayValue: string;
}

export function getOpportunityInquiryLink(
  brand?: BrandContactSettings,
  opportunityTitle?: string,
  language: "ar" | "en" = "ar"
): OpportunityInquiryLink | null {
  const b = brand || DEFAULT_SITE_CONTENT_SETTINGS.brand;
  if (b.opportunityInquiryEnabled === false) {
    return null;
  }

  // Determine channel (whatsapp / email / telegram / phone / custom_url)
  // opportunityInquiryChannel takes primary precedence
  const channel: OpportunityInquiryChannel =
    b.opportunityInquiryChannel ||
    (b.opportunityContactType as OpportunityInquiryChannel) ||
    "whatsapp";

  const titleText = opportunityTitle ? `"${opportunityTitle}"` : "";
  const defaultArMsg = b.opportunityInquiryMessageAr || "مرحباً، أود الاستفسار والتسجيل بخصوص الفرصة البحثية: {title}";
  const defaultEnMsg = b.opportunityInquiryMessageEn || "Hello, I would like to inquire about the research opportunity: {title}";
  const rawMsg = language === "en" ? defaultEnMsg : defaultArMsg;
  const message = rawMsg.replace(/{title}/g, titleText).replace(/{name}/g, titleText);

  const labelAr = b.opportunityInquiryLabelAr || b.opportunityContactLabelAr || "تواصل معنا للاستفسار 💬";
  const labelEn = b.opportunityInquiryLabelEn || b.opportunityContactLabelEn || "Contact us for inquiries 💬";

  if (channel === "whatsapp") {
    const rawVal = (
      b.opportunityInquiryWhatsapp ||
      b.opportunityContactWhatsapp ||
      b.opportunityInquiryValue ||
      b.participantWhatsapp ||
      b.whatsapp ||
      "966562159258"
    ).trim();
    let cleanNum = rawVal.replace(/[^\d+]/g, "").replace(/^\+/, "");
    if (cleanNum.startsWith("05") && cleanNum.length === 10) {
      cleanNum = "966" + cleanNum.substring(1);
    }
    return {
      channel: "whatsapp",
      href: `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`,
      isExternal: true,
      labelAr,
      labelEn,
      displayValue: cleanNum,
    };
  }

  if (channel === "email") {
    const emailVal = (
      b.opportunityInquiryEmail ||
      b.opportunityContactEmail ||
      (b.contactUsType === "email" && b.contactUsValue && b.contactUsValue.includes("@") ? b.contactUsValue : "") ||
      b.email ||
      "srmaacademy@gmail.com"
    ).trim();
    const subject = language === "en"
      ? `Inquiry regarding research opportunity: ${opportunityTitle || ""}`
      : `استفسار بخصوص الفرصة البحثية: ${opportunityTitle || ""}`;
    return {
      channel: "email",
      href: `mailto:${emailVal}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`,
      isExternal: false,
      labelAr,
      labelEn,
      displayValue: emailVal,
    };
  }

  if (channel === "telegram") {
    const rawTg = (
      b.opportunityInquiryTelegram ||
      b.opportunityContactTelegram ||
      b.telegramUsername ||
      b.opportunityInquiryValue ||
      "SRMAAcademy"
    ).trim();

    const isUrl = rawTg.startsWith("http");
    const cleanUsername = rawTg.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "").replace(/\/$/, "");
    const isPhoneNumber = /^\+?\d{8,15}$/.test(cleanUsername.replace(/\s+/g, "")) || (/^05\d{8}$/.test(cleanUsername) && cleanUsername.length === 10);

    let href = "";
    let displayValue = `@${cleanUsername}`;

    if (isUrl) {
      href = rawTg;
      displayValue = "Telegram";
    } else if (isPhoneNumber) {
      let cleanDigits = cleanUsername.replace(/[^\d]/g, "");
      if (cleanDigits.startsWith("05") && cleanDigits.length === 10) {
        cleanDigits = "966" + cleanDigits.substring(1);
      }
      href = `tg://resolve?phone=${cleanDigits}`;
      displayValue = `+${cleanDigits}`;
    } else {
      href = `https://t.me/${cleanUsername}?text=${encodeURIComponent(message)}`;
      displayValue = `@${cleanUsername}`;
    }

    return {
      channel: "telegram",
      href,
      isExternal: true,
      labelAr: b.opportunityInquiryLabelAr || "تواصل معنا للاستفسار 💬",
      labelEn: b.opportunityInquiryLabelEn || "Contact us for inquiries 💬",
      displayValue,
    };
  }

  if (channel === "phone") {
    const phoneVal = (
      b.opportunityInquiryPhone ||
      b.opportunityContactPhone ||
      b.phone ||
      "966562159258"
    ).trim();
    const cleanPhone = phoneVal.replace(/[^\d+]/g, "");
    return {
      channel: "phone",
      href: `tel:${cleanPhone}`,
      isExternal: false,
      labelAr: b.opportunityInquiryLabelAr || "اتصال للاستفسار 📞",
      labelEn: b.opportunityInquiryLabelEn || "Call for inquiries 📞",
      displayValue: phoneVal,
    };
  }

  if (channel === "custom_url") {
    const urlVal = (
      b.opportunityInquiryCustomUrl ||
      b.opportunityInquiryValue ||
      b.contactUsValue ||
      ""
    ).trim();
    return {
      channel: "custom_url",
      href: urlVal.startsWith("http") ? urlVal : `https://${urlVal}`,
      isExternal: true,
      labelAr: b.opportunityInquiryLabelAr || "رابط الاستفسار والتواصل 🔗",
      labelEn: b.opportunityInquiryLabelEn || "Inquiry & Contact Link 🔗",
      displayValue: urlVal,
    };
  }

  return null;
}

export function buildForwardingUrl({
  type,
  target,
  customMessage,
  studentName,
  specialization,
  researchTitle,
  email,
  affiliation,
  whatsapp,
  language,
}: {
  type: ForwardingType;
  target: string;
  customMessage?: string;
  studentName: string;
  specialization: string;
  researchTitle: string;
  email?: string;
  affiliation?: string;
  whatsapp?: string;
  language: string;
}): string {
  if (type === "none" || !target) return "";

  const defaultMsg = language === "en"
    ? `Hello, I registered for the research opportunity:\n"${researchTitle}"\n\nName: ${studentName}\nSpecialty: ${specialization}${email ? `\nEmail: ${email}` : ""}${affiliation ? `\nAffiliation: ${affiliation}` : ""}${whatsapp ? `\nWhatsApp: ${whatsapp}` : ""}`
    : `مرحباً، لقد أتممت التسجيل في الفرصة البحثية:\n"${researchTitle}"\n\nالاسم: ${studentName}\nالتخصص: ${specialization}${email ? `\nالبريد: ${email}` : ""}${affiliation ? `\nالجهة: ${affiliation}` : ""}${whatsapp ? `\nواتساب: ${whatsapp}` : ""}`;

  let body = customMessage && customMessage.trim() ? customMessage : defaultMsg;
  body = body
    .replace(/{name}/g, studentName)
    .replace(/{title}/g, researchTitle)
    .replace(/{specialty}/g, specialization)
    .replace(/{email}/g, email || "")
    .replace(/{affiliation}/g, affiliation || "")
    .replace(/{whatsapp}/g, whatsapp || "");

  const encoded = encodeURIComponent(body);

  switch (type) {
    case "whatsapp": {
      const cleanNum = target.replace(/[^\d+]/g, "").replace(/^\+/, "");
      return `https://wa.me/${cleanNum}?text=${encoded}`;
    }
    case "whatsapp_direct_url": {
      if (target.startsWith("http")) {
        return target.includes("?") ? `${target}&text=${encoded}` : `${target}?text=${encoded}`;
      }
      return `https://wa.me/${target.replace(/[^\d+]/g, "")}?text=${encoded}`;
    }
    case "email": {
      const emailTarget = (target && target.includes("@") ? target : "srmaacademy@gmail.com").trim();
      const subject = encodeURIComponent(language === "en" ? `Registration: ${researchTitle}` : `تسجيل جديد: ${researchTitle}`);
      return `mailto:${emailTarget}?subject=${subject}&body=${encoded}`;
    }
    case "telegram": {
      if (target.startsWith("http")) return target;
      const clean = target.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "");
      const isPhone = /^\+?\d{8,15}$/.test(clean.replace(/\s+/g, "")) || (/^05\d{8}$/.test(clean) && clean.length === 10);
      if (isPhone) {
        let digits = clean.replace(/[^\d]/g, "");
        if (digits.startsWith("05") && digits.length === 10) digits = "966" + digits.substring(1);
        return `tg://resolve?phone=${digits}`;
      }
      return `https://t.me/${clean}`;
    }
    case "messenger": {
      const user = target.replace(/^https?:\/\/m\.me\//, "");
      return `https://m.me/${user}`;
    }
    case "instagram": {
      const user = target.replace(/^@/, "").replace(/^https?:\/\/instagram\.com\//, "");
      return `https://instagram.com/${user}`;
    }
    case "custom_url": {
      return target;
    }
    default:
      return "";
  }
}