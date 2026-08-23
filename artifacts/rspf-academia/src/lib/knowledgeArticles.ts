import type { SiteLanguage } from "@/lib/i18n";

export interface KnowledgeArticle {
  slug: string;
  featured?: boolean;
  categoryClass: string;
  category: Record<SiteLanguage, string>;
  title: Record<SiteLanguage, string>;
  excerpt: Record<SiteLanguage, string>;
  readTime: Record<SiteLanguage, string>;
  date: string;
  sections: Record<SiteLanguage, Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>>;
}

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    slug: "saudi-board-research-matching-2026",
    featured: true,
    categoryClass: "bg-[#0C3156]/10 text-[#0C3156] border border-[#0C3156]/12",
    category: { ar: "أبحاث البورد وMatching", en: "Board & Matching Research" },
    title: {
      ar: "أبحاث البورد السعودي وMatching 2026: كيف تبني ملفاً بحثياً موثقاً؟",
      en: "Saudi Board Research and Matching 2026: Building a Documented Research Portfolio",
    },
    excerpt: {
      ar: "إطار عملي لأطباء البورد والريزيدنت لتنظيم بحث موثق ومناسب لملفهم المهني، مع الرجوع دائماً إلى متطلبات الهيئة المعلنة.",
      en: "A practical framework for residents and board applicants to organize a documented research portfolio while relying on official published requirements.",
    },
    readTime: { ar: "5 دقائق", en: "5 min read" },
    date: "2026-08-23",
    sections: {
      ar: [
        { heading: "ابدأ بالمصدر الرسمي", paragraphs: ["تتغير قواعد المفاضلة، الأهلية والوثائق من دورة إلى أخرى. لذلك لا يعِد هذا الدليل بعدد نقاط أو قبول؛ راجع دائماً الإعلانات واللوائح الرسمية للهيئة السعودية للتخصصات الصحية قبل اتخاذ أي قرار."] },
        { heading: "ما الذي يجعل الملف البحثي مفيداً؟", paragraphs: ["اجعل مشروعك قابلاً للتتبع: دورك موثق، الموافقات المطلوبة مكتملة، والنتائج أو حالة المخطوطة واضحة. اختر موضوعاً قريباً من تخصصك ووقتك المتاح، لا موضوعاً واسعاً لا يمكن إكماله."], bullets: ["حدّد دورك البحثي بوضوح من البداية.", "احتفظ بسجل للموافقات والنسخ والمراسلات.", "فرّق بين بحث قيد التنفيذ، مخطوطة مقدمة، ومقال منشور."] },
        { heading: "خطة عملية لـ Matching 2026", paragraphs: ["ابدأ مبكراً، حدّد مرحلة المشروع مع المشرف، ثم راجع التوثيق قبل أي موعد تقديم. البحث الجيد يدعم ملفك ولكنه لا يغني عن استيفاء شروط البرنامج الرسمية أو الاختبارات المطلوبة."] },
      ],
      en: [
        { heading: "Start with the official source", paragraphs: ["Eligibility, ranking, and documentation rules can change by cycle. This guide does not promise points or acceptance; always verify the current published Saudi Commission for Health Specialties requirements before making a decision."] },
        { heading: "What makes a research portfolio useful?", paragraphs: ["Make your work traceable: document your role, complete required approvals, and state the manuscript status accurately. Choose a project that fits your specialty and available time rather than an overly broad project you cannot finish."], bullets: ["Define your research role at the outset.", "Keep approval, version, and correspondence records.", "Clearly distinguish in-progress, submitted, and published work."] },
        { heading: "A practical Matching 2026 plan", paragraphs: ["Start early, agree on a project stage with your supervisor, and review documentation before application deadlines. Research can strengthen a profile, but it never replaces formal program requirements or examinations."] },
      ],
    },
  },
  {
    slug: "choosing-q1-q2-medical-journal",
    categoryClass: "bg-purple-50 text-purple-700 border border-purple-100",
    category: { ar: "المجلات العلمية", en: "Scientific Journals" },
    title: { ar: "اختيار مجلات Q1 وQ2: دليل واقعي للباحث الطبي", en: "Choosing Q1 and Q2 Journals: A Practical Guide for Medical Researchers" },
    excerpt: { ar: "كيف تقارن نطاق المجلة، نوع المقال، الفهرسة ومتطلبات المؤلفين قبل تقديم بحثك.", en: "How to compare journal scope, article type, indexing, and author requirements before submission." },
    readTime: { ar: "6 دقائق", en: "6 min read" },
    date: "2026-08-23",
    sections: {
      ar: [
        { heading: "لا تبدأ بالتصنيف وحده", paragraphs: ["Q1 وQ2 تصنيفات قد تختلف باختلاف قاعدة البيانات والسنة والتخصص. الملاءمة المنهجية لنطاق المجلة، جودة البحث، ونوع المقال عناصر أكثر أهمية من مطاردة التصنيف فقط."] },
        { heading: "تحقق من الفهرسة بنفسك", paragraphs: ["إذا كان هدفك PubMed أو Scopus أو Web of Science، تحقق من مصدر القاعدة مباشرة ومن صفحة المجلة الرسمية في يوم التقديم. لا تعتمد على لقطات شاشة أو ادعاءات تسويقية قديمة."] },
        { heading: "قائمة قبل الإرسال", paragraphs: ["اقرأ تعليمات المؤلفين، طابق تنسيق المخطوطة، راجع الرسوم ومدة التحكيم المعلنة، وتجنب المجلات التي تعد بقبول مضمون أو نشر سريع بلا مراجعة علمية واضحة."], bullets: ["النطاق والتخصص.", "الفهرسة الحالية من مصدر رسمي.", "سياسة التحكيم والرسوم.", "إرشادات الأخلاقيات وتضارب المصالح."] },
      ],
      en: [
        { heading: "Do not start with quartile alone", paragraphs: ["Q1 and Q2 can vary by database, year, and subject category. Methodological fit, study quality, and article type matter more than pursuing a quartile in isolation."] },
        { heading: "Verify indexing yourself", paragraphs: ["If PubMed, Scopus, or Web of Science matters to you, verify it directly in the database and on the journal website on the day you submit. Do not rely on old screenshots or marketing claims."] },
        { heading: "Pre-submission checklist", paragraphs: ["Read author instructions, align the manuscript format, review published fees and timelines, and avoid journals promising guaranteed acceptance or rapid publication without a transparent peer-review process."], bullets: ["Scope and specialty fit.", "Current indexing from an official source.", "Peer-review policy and fees.", "Ethics and conflict-of-interest requirements."] },
      ],
    },
  },
  {
    slug: "research-for-fellowship-and-exam-applications",
    categoryClass: "bg-blue-50 text-blue-700 border border-blue-100",
    category: { ar: "التخطيط المهني", en: "Career Planning" },
    title: { ar: "الأبحاث لملفات الزمالات والاختبارات المهنية: خطة أخلاقية وقابلة للتنفيذ", en: "Research for Fellowship and Professional Exam Applications: An Ethical, Achievable Plan" },
    excerpt: { ar: "تنظيم مشروع بحثي لخدمة الترقية الأكاديمية أو الزمالات دون ادعاء أن البحث يضمن القبول.", en: "Organizing a research project for academic promotion or fellowship goals without claiming it guarantees acceptance." },
    readTime: { ar: "5 دقائق", en: "5 min read" },
    date: "2026-08-23",
    sections: {
      ar: [
        { heading: "البحث جزء من الملف لا بديل عنه", paragraphs: ["قد يهتم المتقدمون للزمالة الأمريكية والكندية أو البورد الأمريكي والبريطاني والأردني بإنجازاتهم البحثية. لكن شروط القبول والاختبارات مثل USMLE وMRCOG وSMLE وSPLE وSDLE تحددها الجهات الرسمية والبرامج، وتختلف بين المسارات."] },
        { heading: "اختر مرحلة يمكن إنهاؤها", paragraphs: ["للمبتدئ قد تكون مراجعة منهجية محددة جيداً أو مشروع جودة بإشراف مناسب أكثر واقعية من دراسة واسعة بلا بيانات أو فريق. ناقش التأليف والأدوار وخطة الوقت مع المشرف قبل البدء."] },
        { heading: "قدم إنجازك بدقة", paragraphs: ["في السيرة الذاتية اكتب الحالة الحقيقية للعمل ودورك. لا تحوّل مخطوطة تحت المراجعة إلى نشر، ولا تعد بقبول أو ترقية مضمونة بسبب بحث واحد."] },
      ],
      en: [
        { heading: "Research is one part of an application", paragraphs: ["Applicants to American and Canadian fellowships or American, British, Saudi, and Jordanian board pathways may value research experience. However, admissions and exam requirements—including USMLE, MRCOG, SMLE, SPLE, and SDLE—are set by official bodies and individual programs."] },
        { heading: "Choose a finishable stage", paragraphs: ["For a new researcher, a well-scoped systematic review or supervised quality project can be more realistic than a broad study without data or a team. Agree on authorship, roles, and timelines before starting."] },
        { heading: "Represent work accurately", paragraphs: ["In your CV, state the real manuscript stage and your role. Do not present work under review as published or promise acceptance or promotion because of a single project."] },
      ],
    },
  },
];

export function getKnowledgeArticle(slug: string | undefined) {
  return knowledgeArticles.find((article) => article.slug === slug);
}