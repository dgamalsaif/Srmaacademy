import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  GraduationCap,
  MessageCircle,
  Shield,
  Sparkles,
  Users,
  Search,
  BarChart2,
  Globe,
  ExternalLink,
  Flame,
  ArrowLeft,
  ArrowRight,
  Stethoscope,
  BadgeCheck,
  TrendingUp,
  HeartPulse,
  Send,
  Building,
  Star,
  Check,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useSiteContentSettings } from "@/hooks/use-site-content-settings";
import { getEnglishOpportunityTitle } from "@/lib/opportunityDisplay";
import {
  DEFAULT_SITE_CONTENT_SETTINGS,
  SiteContentSettings,
  getContactUsHref,
  getOpportunityInquiryLink,
} from "@/lib/siteContentSettings";
import { ResearchOpportunity } from "@/lib/researchData";
import RegistrationModal from "@/components/RegistrationModal";
import ServiceModal from "@/components/ServiceModal";
import OpportunityPrice from "@/components/OpportunityPrice";
import OpportunityMedia from "@/components/OpportunityMedia";
import CurrencyConverter from "@/components/CurrencyConverter";
import { ResearchProtectionBanner, ProtectedResearchWatermark, AntiCaptureResearchTitle } from "@/components/ResearchProtection";
import { Lock } from "lucide-react";
import { useCurrency } from "@/lib/currency";

const fallbackOpportunities: ResearchOpportunity[] = [
  {
    id: 1,
    specialty: "Cardiology",
    specialtyAr: "طب وأمراض القلب",
    specialtyEn: "Cardiology",
    specialtyColor: "bg-red-50 text-red-700 border-red-200",
    title: "Comparative Efficacy and Safety of Novel Anticoagulants in Post-PCI Patients with Atrial Fibrillation",
    titleAr: "مقارنة الفعالية والأمان لمضادات التخثر الحديثة لدى مرضى الرجفان الأذيني بعد القسطرة التداخلية",
    description: "دراسة سريرية متعددة المراكز تقيس معدلات النزيف والوقاية من السكتات الدماغية في المستشفيات التخصصية، موجهة للنشر في مجلة Q1 محكمة ومفهرسة في PubMed وScopus.",
    seatsLeft: 2,
    totalSeats: 10,
    status: "open",
    journalTarget: "European Heart Journal (Q1 - Scopus & PubMed)",
    indexedIn: ["Scopus Q1", "PubMed", "Web of Science"],
    benefits: [
      "مؤلف رسمي معتمد في الورقة المنشورة",
      "استيفاء متطلبات البورد السعودي وبدل التميز",
      "إشراف مباشر من استشاري قلب وقسطرة",
      "شهادة مشاركة بحثية معتمدة",
    ],
    duration: "6 أشهر",
    supervisor: "د. طارق الحازمي — استشاري أمراض القلب وقسطرة الشرايين",
    priceOriginalSar: 2500,
    priceDiscountedSar: 1600,
    createdAt: "2026-05-01",
  },
  {
    id: 2,
    specialty: "General Surgery",
    specialtyAr: "الجراحة العامة والمناظير",
    specialtyEn: "General Surgery",
    specialtyColor: "bg-blue-50 text-blue-700 border-blue-200",
    title: "Minimally Invasive vs. Open Resection in Complex Gastrointestinal Malignancies: A 5-Year Cohort",
    titleAr: "مقارنة استئصال أورام الجهاز الهضمي بالمنظار مقابل الجراحة المفتوحة: دراسة أترابية لخمس سنوات",
    description: "بحث متقدم يوثق النتائج الجراحية وفترات التعافي ونسب البقاء على قيد الحياة، مطابق تماماً لمعايير الترقية والاستشاريين والمفاضلة بالبورد.",
    seatsLeft: 3,
    totalSeats: 12,
    status: "open",
    journalTarget: "Annals of Surgery / International Journal of Surgery (Q1)",
    indexedIn: ["Scopus Q1", "PubMed", "Clarivate ESCI"],
    benefits: [
      "إدراج الاسم في قائمة الباحثين المشاركين",
      "تحليل إحصائي متقدم بمنهجية Kaplan-Meier",
      "5 نقاط كاملة في مفاضلة الهيئة السعودية (SCFHS)",
      "توصية أكاديمية لدعم برامج الزمالة",
    ],
    duration: "5 أشهر",
    supervisor: "د. عبد الله الشهري — استشاري جراحة الأورام والمناظير",
    priceOriginalSar: 2800,
    priceDiscountedSar: 1800,
    createdAt: "2026-05-10",
  },
  {
    id: 3,
    specialty: "Pediatrics",
    specialtyAr: "طب الأطفال وحديثي الولادة",
    specialtyEn: "Pediatrics",
    specialtyColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    title: "Clinical Trajectory and Biomarker Profiling in Pediatric Sepsis: A Prospective Observational Study",
    titleAr: "المسار السريري والمؤشرات الحيوية في إنتان الأطفال: دراسة استباقية قائمة على الملاحظة",
    description: "تقييم المؤشرات الحيوية المبكرة للتشخيص والاستجابة العلاجية في عناية الأطفال المركزة، لتحديد معايير التدخل السريع.",
    seatsLeft: 1,
    totalSeats: 8,
    status: "open",
    journalTarget: "Pediatrics / Pediatric Research (Q1 - Scopus)",
    indexedIn: ["PubMed", "Scopus Q1", "WoS Science Citation Index"],
    benefits: [
      "مقعد مؤلف رئيسي / مشارك بحسب الاختيار",
      "مطابق للائحة بدل التميز السنوي لوزارة الصحة",
      "متابعة دورية أسبوعية مع مشرف البحث",
      "صياغة علمية احترافية باللغة الإنجليزية الطبية",
    ],
    duration: "4 أشهر",
    supervisor: "د. منى الغامدي — استشاري طب الأطفال والعناية المركزة",
    priceOriginalSar: 2200,
    priceDiscountedSar: 1400,
    createdAt: "2026-05-15",
  },
  {
    id: 4,
    specialty: "Emergency Medicine",
    specialtyAr: "طب الطوارئ والحوادث",
    specialtyEn: "Emergency Medicine",
    specialtyColor: "bg-amber-50 text-amber-700 border-amber-200",
    title: "Diagnostic Accuracy of Point-of-Care Ultrasound (POCUS) in Acute Undifferentiated Shock in the ED",
    titleAr: "دقة السونار السريع بجانب السرير (POCUS) في تشخيص حالات الصدمة غير المحددة في الطوارئ",
    description: "دراسة تقييمية للأثر التشخيصي العاجل لسونار الطوارئ في توجيه القرارات الإنعاشية الحرجة وإنقاذ المرضى ذوي الحالات غير المستقرة.",
    seatsLeft: 2,
    totalSeats: 10,
    status: "open",
    journalTarget: "Journal of Emergency Medicine / Academic Emergency Med (Q2/Q1)",
    indexedIn: ["Scopus Q2", "PubMed"],
    benefits: [
      "تدريب تطبيقي على قراءة البيانات التشخيصية",
      "نقاط مفاضلة قوية لأطباء مقيمي الطوارئ والعناية",
      "تسليم مسودة المخطوطة قبل الإرسال للمجلة",
      "ضمان إعادة الإرسال في حال طلب تعديلات المحكمين",
    ],
    duration: "6 أشهر",
    supervisor: "د. خالد السبيعي — استشاري طب الطوارئ والحالات الحرجة",
    priceOriginalSar: 2000,
    priceDiscountedSar: 1300,
    createdAt: "2026-05-20",
  },
];

const publishedHallOfFame = [
  {
    specialtyAr: "جراحة السمنة والأيض",
    specialtyEn: "Bariatric Surgery",
    journal: "Obesity Surgery (Springer - Q1)",
    impact: "Impact Factor: 3.4 | PubMed & Scopus Q1",
    titleAr: "مقارنة النتائج طويلة الأمد بين تكميم المعدة وتحويل المسار المصغر لدى مرضى السكري النوع الثاني",
    titleEn: "Endoscopic vs. Surgical Bariatric Procedures: 5-Year Metabolic Outcomes Comparison",
    authorsCount: "فريق من 6 أطباء مقيمين واستشاريين",
    statusBadge: "تم النشر رسمياً مع فهرسة PubMed",
  },
  {
    specialtyAr: "المخ والأعصاب",
    specialtyEn: "Neurology",
    journal: "Journal of the Neurological Sciences (Elsevier - Q1)",
    impact: "Impact Factor: 4.1 | Web of Science & PubMed",
    titleAr: "المؤشرات العصبية للتنبؤ بالاستجابة للعلاج المناعي في التصلب المتعدد الناكس المتردد",
    titleEn: "Biomarker Predictors of Treatment Response to Monoclonal Antibodies in RRMS",
    authorsCount: "فريق من 5 باحثين وأطباء بورد",
    statusBadge: "مقبول نهائياً ومتاح على الإنترنت",
  },
  {
    specialtyAr: "التخدير وعلاج الألم",
    specialtyEn: "Anesthesiology & Pain",
    journal: "BMC Anesthesiology (Springer Nature - Q2)",
    impact: "Impact Factor: 2.5 | Scopus Q2 & PubMed",
    titleAr: "الفعالية المقارنة للتخدير الناحي مقابل العام في جراحات العظام الكبرى للمسنين",
    titleEn: "Comparative Effectiveness of Regional vs. General Anesthesia in Major Orthopedic Surgery",
    authorsCount: "فريق من 7 باحثين من مختلف المستشفيات",
    statusBadge: "نشر كامل وحصل المشاركون على بدل التميز",
  },
];

const testimonials = [
  {
    name: "د. فيصل القحطاني",
    role: "طبيب مقيم - البورد السعودي للجراحة العامة",
    location: "الرياض، المملكة العربية السعودية",
    avatar: "👨‍⚕️",
    text: "كنت بحاجة ماسة لاستيفاء نقاط البحث العلمي لمفاضلة البورد السعودي. من خلال المنصة انضممت لفريق بحثي جراحي متميز في مجلة Q1 محكمة، ونُشر البحث وحصلت على الدرجة الكاملة (5 نقاط) وتم قبولي في المركز الأول برغبتي. التزام وتوجيه أكاديمي استثنائي!",
  },
  {
    name: "د. سارة المطيري",
    role: "أخصائية أولى باطنة عامة",
    location: "جدة، المملكة العربية السعودية",
    avatar: "👩‍⚕️",
    text: "استفدت من المنصة في نشر ورقة بحثية مصنفة في PubMed وScopus Q2 لاستحقاق بدل التميز لوزارة الصحة. الفريق وفر متابعة حثيثة من التحليل الإحصائي وحتى القبول النهائي، وتم صرف البدل لي بنجاح. شكراً جزيلاً لهذه الاحترافية.",
  },
  {
    name: "د. عبد العزيز الشمري",
    role: "استشاري مشارك - طب الأطفال والخدج",
    location: "الدمام، المملكة العربية السعودية",
    avatar: "👨‍⚕️",
    text: "الخدمة تتجاوز مجرد المشاركة في بحث؛ إنها مدرسة بحثية متكاملة. التدقيق الإحصائي والصياغة بالإنجليزية الطبية كانت على أعلى مستوى أكاديمي دولي. منصة نفتخر بها في الوسط الطبي السعودي.",
  },
];

const faqs = [
  {
    q: "هل الأبحاث المنشورة متوافقة مع متطلبات الهيئة السعودية للتخصصات الصحية (SCFHS)؟",
    a: "نعم، 100%. كافة الفرص البحثية مصممة وتستهدف مجلات دولية محكمة ومفهرسة في قواعد البيانات المعتمدة لدى الهيئة (Web of Science / Scopus / PubMed)، مما يضمن لك احتساب النقاط الكاملة في مفاضلة البورد السعودي، وكذلك الترقية المهنية والأكاديمية.",
  },
  {
    q: "كيف تساعدني هذه الأبحاث في الحصول على بدل التميز لوزارة الصحة؟",
    a: "وفقاً للائحة بدل التميز للممارسين الصحيين في وزارة الصحة السعودية، فإن نشر بحث علمي كباحث رئيسي أو مشارك في مجلة علمية محكمة مفهرسة في (Web of Science أو Scopus أو PubMed) يمنحك الاستحقاق المباشر للحصول على بدل التميز السنوي بنسبة تتراوح بين 10% إلى 30% من الراتب الأساسي.",
  },
  {
    q: "ما هي المجلات المستهدفة للنشر؟ وهل يتم النشر في مجلات Q1 و Q2؟",
    a: "نستهدف حصراً المجلات العلمية الرصينة ذات التصنيف العالمي Q1 و Q2 الصادرة عن دور نشر دولية موثوقة مثل Elsevier, Springer Nature, Wiley, Oxford University Press, BMJ, Frontiers وغيرها. لا نتعامل إطلاقاً مع المجلات المفترسة أو المشبوهة، ونزود الباحث برقم ISSN ورابط المجلة في Scopus و PubMed للتأكد شخصياً.",
  },
  {
    q: "أين سيكون موقع اسمي في قائمة مؤلفي البحث؟",
    a: "يحق للباحث اختيار نوع المقعد المناسب له عند التسجيل: سواءً باحث رئيسي (First Author) أو باحث مشارك (Co-Author) وفق الطاقة الاستيعابية المتاحة لكل مشروع. ويتم توثيق ذلك مسبقاً بما يحفظ حق الباحث الأكاديمي والمهني.",
  },
  {
    q: "كم تستغرق رحلة إنجاز البحث حتى القبول والنشر؟",
    a: "تتراوح المدة بحسب طبيعة الدراسة ونوع المجلة ما بين 4 إلى 8 أشهر كمتوسط، شاملة التحليل الإحصائي، صياغة المخطوطة، المراجعة اللغوية، الإرسال والرد على ملاحظات المحكمين (Peer Review) حتى صدور خطاب القبول النهائي والرقم المعياري الرقمي (DOI).",
  },
  {
    q: "كيف أبدأ التسجيل وما هي خطوات الانضمام؟",
    a: "يمكنك تصفح الفرص المتاحة في هذه الصفحة أو في 'بوابة المشارك'، ثم الضغط على زر 'حجز مقعد / تسجيل'. سيتواصل معك منسق البرنامج مباشرة لتأكيد المقعد وتزويدك بالبروتوكول وإضافتك إلى مجموعة العمل البحثي المخصصة.",
  },
];

export default function Home() {
  const { direction, language, localize } = useLanguage();
  const { data: settings } = useSiteContentSettings();
  const siteBrand = settings?.brand || DEFAULT_SITE_CONTENT_SETTINGS.brand;
  const siteName = language === "ar" ? siteBrand.siteNameAr : siteBrand.siteNameEn;
  const contactHref = getContactUsHref(siteBrand);

  const homeSettings = settings?.pages?.home;
  const rawAdminTitle = (language === "ar" ? homeSettings?.titleAr : homeSettings?.titleEn)?.trim();
  const isDefaultTitle = !rawAdminTitle || rawAdminTitle === "أكاديمية SRMA للأبحاث" || rawAdminTitle === "SRMA Research Academy";
  const customHeroTitle = !isDefaultTitle ? rawAdminTitle : null;

  const rawAdminDesc = (language === "ar" ? homeSettings?.descriptionAr : homeSettings?.descriptionEn)?.trim();
  const isDefaultDesc = !rawAdminDesc || rawAdminDesc === "نحو مجتمع بحثي أكثر تأثيراً" || rawAdminDesc === "Building a more impactful research community";
  const customHeroDesc = !isDefaultDesc ? rawAdminDesc : null;

  const customNotice = (language === "ar" ? homeSettings?.contentAr : homeSettings?.contentEn)?.trim();

  const [opportunities, setOpportunities] = useState<ResearchOpportunity[]>(fallbackOpportunities);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedOpportunity, setSelectedOpportunity] = useState<ResearchOpportunity | null>(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedServiceName, setSelectedServiceName] = useState("إعداد الدراسة البحثية");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    apiFetch("/api/programs", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: ResearchOpportunity[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const available = data.filter((item) => item.status === "open" && (item.category || "active") === "active");
          if (available.length > 0) {
            setOpportunities(available);
          }
        }
      })
      .catch(() => {
        // Keep fallback
      });
  }, []);

  const specialtiesList = useMemo(() => {
    const set = new Set<string>();
    opportunities.forEach((op) => {
      const spec = language === "ar" ? (op.specialtyAr || op.specialty) : (op.specialtyEn || op.specialty);
      if (spec) set.add(spec);
    });
    return Array.from(set);
  }, [opportunities, language]);

  const filteredOpportunities = useMemo(() => {
    if (selectedSpecialty === "all") return opportunities.slice(0, 6);
    return opportunities
      .filter((op) => {
        const specAr = op.specialtyAr || op.specialty;
        const specEn = op.specialtyEn || op.specialty;
        return specAr === selectedSpecialty || specEn === selectedSpecialty;
      })
      .slice(0, 6);
  }, [opportunities, selectedSpecialty]);

  const handleRegisterClick = (op: ResearchOpportunity) => {
    setSelectedOpportunity(op);
    setRegistrationModalOpen(true);
  };

  const handleServiceClick = (serviceTitle: string) => {
    setSelectedServiceName(serviceTitle);
    setServiceModalOpen(true);
  };

  const isRtl = direction === "rtl";
  const whatsappNumber = siteBrand.participantWhatsapp || siteBrand.whatsapp || "966562159258";
  const directWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "مرحباً، أود الاستفسار عن الفرص البحثية المتاحة في الأكاديمية وخدمات النشر في مجلات Q1/Q2 ومتطلبات البورد وبدل التميز."
  )}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 w-full max-w-full overflow-x-clip" dir={direction}>
      {/* 1. TOP NOTICE / MARQUEE TICKER */}
      <section className="bg-gradient-to-r from-[#0C3156] via-[#117b59] to-[#0C3156] text-white py-2.5 px-4 text-xs sm:text-sm font-semibold shadow-inner">
        <div className="w-full max-w-none mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-amber-300 font-bold text-xs border border-amber-400/30 animate-pulse">
              <Flame size={13} className="text-amber-300" />
              {localize("تسجيل مفتوح", "Registration Open")}
            </span>
            <span className="truncate">
              {localize(
                "فتح باب الانضمام للفرص البحثية للربع الحالي في مجلات Q1 و Q2 المفهرسة في PubMed & Scopus - مقاعد محدودة!",
                "Open registration for current quarter research opportunities in Q1 & Q2 journals indexed in PubMed & Scopus!"
              )}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs text-emerald-100">
            <span className="flex items-center gap-1">
              <BadgeCheck size={14} className="text-emerald-300" />
              {localize("معتمد للهيئة السعودية (SCFHS)", "SCFHS Compliant")}
            </span>
            <span className="opacity-40">•</span>
            <span className="flex items-center gap-1">
              <Star size={14} className="text-amber-300" />
              {localize("مستوفٍ لبدل التميز", "Excellence Allowance Ready")}
            </span>
            <span className="opacity-40">•</span>
            <a
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-white hover:text-amber-200 underline font-bold"
            >
              <MessageCircle size={14} />
              {localize("استشارة فورية واتساب", "Instant WhatsApp Chat")}
            </a>
          </div>
        </div>
      </section>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-emerald-50/20 to-white py-14 sm:py-20 lg:py-24 border-b border-slate-100">
        {/* Subtle background decorative shapes */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#117b59]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#0C3156]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-50 px-4 py-1.5 text-xs sm:text-sm font-bold text-[#117b59] mb-6 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>
                {localize(
                  "المنصة الأكاديمية الرائدة لأبحاث الأطباء والنشر الدولي 🇸🇦",
                  "The Leading Academic Platform for Physician Research & International Publishing 🇸🇦"
                )}
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.25] sm:leading-[1.2] mb-6"
            >
              {customHeroTitle ? (
                <span>{customHeroTitle}</span>
              ) : (
                <>
                  {localize(
                    "منصتك الموثوقة للنشر في أرقى المجلات العالمية ",
                    "Your Trusted Academic Gateway to Publishing in Top International Journals "
                  )}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#117b59] via-emerald-600 to-[#0C3156]">
                    Q1 & Q2
                  </span>
                  <br />
                  <span className="text-[#0C3156]">
                    {localize("ومتطلبات البورد السعودي وبدل التميز", "and Saudi Board & Excellence Allowance Requirements")}
                  </span>
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg lg:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto mb-10"
            >
              {customHeroDesc ? (
                <span>{customHeroDesc}</span>
              ) : (
                localize(
                  "نوفر للأطباء والباحثين الصحيين فرصاً بحثية حقيقية متكاملة تبدأ من الفكرة والبروتوكول والتحليل الإحصائي وحتى القبول النهائي والنشر في PubMed, Scopus, Web of Science، بإشراف نخبة من كبار الاستشاريين والمحكمين الدوليين.",
                  "We provide physicians and healthcare researchers with authentic, comprehensive research opportunities from idea, protocol, and biostatistical analysis to final acceptance and publication in PubMed, Scopus, and Web of Science, supervised by elite international consultants and peer reviewers."
                )
              )}
            </motion.p>

            {/* Dynamic Admin Notice / Announcement Banner if configured in Admin */}
            {customNotice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 mx-auto max-w-3xl rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/90 p-4 sm:p-5 text-start shadow-sm text-slate-800"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#117b59] text-white font-black text-sm shadow-xs">
                    📢
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">
                      {localize("إعلان وتنويه رسمي من إدارة الأكاديمية", "Official Academy Notice & Announcement")}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
                      {customNotice}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto"
            >
              <Link
                href="/participant-portal"
                data-testid="button-hero-explore-programs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0C3156] px-8 py-4 text-base font-black text-white shadow-xl hover:bg-[#0a2847] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>{localize("استكشف الفرص البحثية المتاحة", "Explore Research Opportunities")}</span>
                {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </Link>

              <a
                href={directWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-hero-whatsapp"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-7 py-4 text-base font-black text-white shadow-lg hover:bg-[#1eb856] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <MessageCircle size={20} />
                <span>{localize("تواصل مباشر عبر واتساب", "Direct WhatsApp Chat")}</span>
              </a>

              <Link
                href="/special-requests"
                data-testid="button-hero-custom-request"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-700 hover:border-[#0C3156] hover:text-[#0C3156] hover:bg-slate-50 transition-all"
              >
                <Sparkles size={18} className="text-amber-500" />
                <span>{localize("طلب خدمة بحثية مخصصة", "Custom Research Request")}</span>
              </Link>
            </motion.div>

            {/* Trust Metrics Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center"
            >
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#117b59]/30 transition-colors">
                <div className="text-2xl sm:text-3xl font-black text-[#117b59]">+500</div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                  {localize("طبيب وباحث مشارك", "Physicians & Trainees")}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {localize("في مختلف التخصصات الطبية", "Across all medical specialties")}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#0C3156]/30 transition-colors">
                <div className="text-2xl sm:text-3xl font-black text-[#0C3156]">100%</div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                  {localize("مطابق لمعايير الهيئة (SCFHS)", "SCFHS Compliant")}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {localize("درجات مفاضلة كاملة للبورد", "Full Saudi Board score")}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-500/30 transition-colors">
                <div className="text-2xl sm:text-3xl font-black text-amber-600">Q1 & Q2</div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                  {localize("مجلات عالمية مصنفة", "Indexed Journals")}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {localize("PubMed / Scopus / WoS", "PubMed / Scopus / WoS")}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-500/30 transition-colors">
                <div className="text-2xl sm:text-3xl font-black text-sky-600">1 : 1</div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                  {localize("إشراف مباشر ومرافقة", "Direct Supervision")}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {localize("من الفكرة حتى النشر والتوثيق", "From idea to publication")}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED RESEARCH OPPORTUNITIES SECTION */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
        <div className="w-full max-w-none mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-[#0C3156]/8 border border-[#0C3156]/15 px-3 py-1 text-xs font-black text-[#0C3156] mb-3">
                <Stethoscope size={14} />
                <span>{localize("فرص النشر الفوري المتاحة", "Instant Publication Opportunities")}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {localize("أحدث الفرص البحثية الجاهزة للتسجيل", "Latest Research Opportunities Ready for Registration")}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
                {localize(
                  "انضم كباحث مشارك أو رئيسي في مشاريع بحثية قائمة بإشراف استشاريين معتمدين وفي مجلات طبية محكمة ذات معامل تأثير عالي.",
                  "Join as a first or co-author on active medical research projects supervised by certified consultants in high-impact journals."
                )}
              </p>
            </div>

            <Link
              href="/participant-portal"
              data-testid="link-view-all-portal"
              className="inline-flex items-center gap-2 rounded-xl bg-[#117b59] hover:bg-[#0c6549] text-white px-5 py-3 text-sm font-bold shadow-sm transition-colors whitespace-nowrap self-start md:self-auto"
            >
              <span>{localize("عرض كافة الفرص (بوابة المشارك)", "View All in Participant Portal")}</span>
              {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>
          </div>

          {/* Research Intellectual Property Protection Banner */}
          <ResearchProtectionBanner />

          {/* Specialty Filter Pills */}
          {specialtiesList.length > 0 && (
            <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden pb-4 mb-8 scrollbar-none">
              <div className="flex w-max min-w-max items-center gap-2">
                <button
                  onClick={() => setSelectedSpecialty("all")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    selectedSpecialty === "all"
                      ? "bg-[#0C3156] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {localize("جميع التخصصات", "All Specialties")}
                </button>
                {specialtiesList.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      selectedSpecialty === spec
                        ? "bg-[#0C3156] text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((op) => {
              const displayTitle = getEnglishOpportunityTitle(op);
              const displayDesc = (language === "ar" ? op.descriptionAr : op.descriptionEn) || op.description;
              const displaySpec = (language === "ar" ? op.specialtyAr : op.specialtyEn) || op.specialty;
              const seatsLeft = op.seatsLeft ?? 2;
              const isUrgent = seatsLeft <= 2;

              return (
                <div
                  key={op.id}
                  data-protected="research"
                  className="protected-research-content research-card flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:border-[#117b59]/40 transition-all duration-300 relative group overflow-hidden select-none"
                  style={{ userSelect: "none", WebkitUserSelect: "none" }}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                >
                  {/* Subtle Anti-Camera Watermark */}
                  <ProtectedResearchWatermark />

                  {/* Top Bar: Specialty + Urgent Badge */}
                  <div className="relative z-10">
                    {settings?.showOpportunityDetails !== false && <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
                          {displaySpec}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <Lock size={10} className="text-emerald-600" />
                          <span>{localize("محمي", "Protected")}</span>
                        </span>
                      </div>
                      {isUrgent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[11px] font-black text-red-600 animate-pulse">
                          <Flame size={12} />
                          {localize(`متبقي ${seatsLeft} مقاعد فقط!`, `Only ${seatsLeft} seats left!`)}
                        </span>
                      )}
                    </div>}

                    {/* Protected Title with Anti-Capture Blur & Anti-OCR Mesh */}
                    <AntiCaptureResearchTitle
                      title={displayTitle}
                      titleHref={`/research/${op.id}`}
                    />

                    {settings?.showOpportunityDetails !== false && <>
                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4 select-none">
                      {displayDesc}
                    </p>

                    {/* Opportunity Image / Media when available */}
                    {op.imageUrl && (
                      <div className="mb-4">
                        <OpportunityMedia research={op} className="aspect-[16/9] min-h-[140px]" />
                      </div>
                    )}

                    {/* Journal & Indexing Badges */}
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 mb-4 space-y-2">
                      <div className="flex items-start gap-2 text-xs">
                        <BookOpen size={14} className="text-[#0C3156] mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800">{op.journalTarget}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {op.indexedIn?.map((idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs"
                          >
                            <BadgeCheck size={11} className="text-emerald-600 mr-1 ml-1" />
                            {idx}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metadata details */}
                    <div className="text-xs text-slate-500 space-y-1.5 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{localize("المشرف الأكاديمي:", "Academic Supervisor:")}</span>
                        <span className="font-bold text-slate-800 truncate max-w-[200px]">{op.supervisor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{localize("المدة المتوقعة:", "Expected Duration:")}</span>
                        <span className="font-bold text-slate-800">{op.duration}</span>
                      </div>
                    </div>

                    {/* Price with instant SAR/USD conversion */}
                    <div className="mb-4">
                      <OpportunityPrice
                        originalSar={op.priceOriginalSar || 2500}
                        discountedSar={op.priceDiscountedSar || 1500}
                        compact
                      />
                    </div>
                    </>}
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => handleRegisterClick(op)}
                      data-testid={`button-register-opportunity-${op.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0C3156] hover:bg-[#0a2847] text-white py-3 text-xs sm:text-sm font-bold shadow-sm transition-all"
                    >
                      <span>{localize("حجز مقعد والتسجيل الآن", "Reserve Seat & Register Now")}</span>
                      {isRtl ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      {settings?.showOpportunityDetails !== false && <Link
                        href={`/research/${op.id}`}
                        data-testid={`link-detail-opportunity-${op.id}`}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2 text-xs font-bold text-slate-700 transition-colors"
                      >
                        <span>{localize("التفاصيل الكاملة", "Full Details")}</span>
                        <ExternalLink size={12} />
                      </Link>}

                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                          `مرحباً، أود الاستفسار عن الفرصة البحثية: ${displayTitle} (معرف: ${op.id})`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 py-2 text-xs font-bold transition-colors"
                      >
                        <MessageCircle size={13} className="text-[#25D366]" />
                        <span>{localize("استفسار واتساب", "WhatsApp Inquire")}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3.1. Interactive Live Currency Converter (SAR ⮂ USD) */}
          <div className="mt-14">
            <CurrencyConverter />
          </div>
        </div>
      </section>

      {/* 4. COMPREHENSIVE ACADEMIC SERVICES (حلولنا وخدماتنا الأكاديمية المتكاملة) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/60 border-b border-slate-100">
        <div className="w-full max-w-none mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-xl bg-[#117b59]/10 border border-[#117b59]/20 px-3.5 py-1 text-xs font-black text-[#117b59] mb-3">
              <Award size={14} />
              <span>{localize("خدمات بحثية طبية متكاملة", "Integrated Medical Research Services")}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {localize("حلول شاملة تغطي كافة مراحل البحث العلمي والنشر", "Comprehensive Solutions Covering Every Research & Publication Stage")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {localize(
                "نقدم للممارسين الصحيين والمبتعثين وطلاب الدراسات العليا دعماً متخصصاً يضمن دقة العمل ومطابقته لأعلى المعايير الأكاديمية.",
                "We provide healthcare practitioners, scholars, and postgraduate students with specialized support ensuring academic precision."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service 1 */}
            <div className="rounded-3xl bg-white p-7 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#0C3156]/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0C3156]/10 text-[#0C3156] flex items-center justify-center mb-5">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  {localize("فرص بحثية جاهزة للنشر", "Publication-Ready Research Opportunities")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {localize(
                    "أوراق ومشاريع بحثية مكتملة أو قيد الإنجاز في مجلات Q1 و Q2. تتيح لك الانضمام كباحث مشارك مع إدراج اسمك رسمياً في قائمة المؤلفين.",
                    "Active or near-completed research in Q1/Q2 journals allowing you to join as a co-author with full official authorship rights."
                  )}
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 mb-6">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#117b59] flex-shrink-0" />
                    <span>{localize("مجلات مفهرسة في PubMed & Scopus", "Indexed in PubMed & Scopus")}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#117b59] flex-shrink-0" />
                    <span>{localize("توفير 4 إلى 8 أشهر من العمل الفردي", "Saves 4 to 8 months of solo effort")}</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/participant-portal"
                className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-[#0C3156] hover:text-white text-slate-800 py-2.5 text-xs font-bold transition-colors"
              >
                <span>{localize("تصفح الفرص المتاحة", "Browse Opportunities")}</span>
                {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </Link>
            </div>

            {/* Service 2 */}
            <div className="rounded-3xl bg-white p-7 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#117b59]/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#117b59]/10 text-[#117b59] flex items-center justify-center mb-5">
                  <GraduationCap size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  {localize("برنامج تدريب باحث مع النشر الفعلي", "Researcher Training with Real Publication")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {localize(
                    "برنامج تطبيقي منهجي للأطباء الراغبين في بناء خبرة بحثية عميقة؛ تتعلم خطوات البحث خطوة بخطوة حتى نشر بحث حقيقي باسمك.",
                    "Systematic hands-on program for physicians seeking real research experience: learn methodology step-by-step to final publication."
                  )}
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 mb-6">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#117b59] flex-shrink-0" />
                    <span>{localize("كتابة المقترح والبروتوكول الطبي", "Protocol & proposal formulation")}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#117b59] flex-shrink-0" />
                    <span>{localize("شهادة إتمام برنامج بحثي معتمد", "Accredited completion certificate")}</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleServiceClick("برنامج تدريب باحث مع النشر")}
                className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-[#117b59] hover:text-white text-slate-800 py-2.5 text-xs font-bold transition-colors"
              >
                <span>{localize("التسجيل في التدريب", "Register in Training")}</span>
                {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </button>
            </div>

            {/* Service 3 */}
            <div className="rounded-3xl bg-white p-7 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                  <Star size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  {localize("مسار البورد السعودي وبدل التميز", "Saudi Board & Excellence Allowance Track")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {localize(
                    "أبحاث مخصصة ومطابقة تماماً لضوابط الهيئة السعودية للتخصصات الصحية (SCFHS) ولوائح بدل التميز السنوي الصادرة عن وزارة الصحة.",
                    "Research tailored to meet SCFHS criteria for Saudi Board matching and Ministry of Health annual Excellence Allowance regulations."
                  )}
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 mb-6">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-amber-600 flex-shrink-0" />
                    <span>{localize("5 درجات مفاضلة كاملة للبورد", "Full 5 competitive board points")}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-amber-600 flex-shrink-0" />
                    <span>{localize("علاوة بدل تميز سنوية تصل لـ 30%", "Excellence allowance up to 30%")}</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleServiceClick("مسار البورد السعودي وبدل التميز")}
                className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-amber-600 hover:text-white text-slate-800 py-2.5 text-xs font-bold transition-colors"
              >
                <span>{localize("طلب استشارة المسار", "Request Track Consultation")}</span>
                {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </button>
            </div>

            {/* Service 4 */}
            <div className="rounded-3xl bg-white p-7 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
                  <BarChart2 size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  {localize("التحليل الإحصائي الطبي الحيوي", "Biostatistics & Data Analysis")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {localize(
                    "تحليل بيانات متقدم للأبحاث الطبية باستخدام SPSS و R و GraphPad، مع تصميم الجداول الاحترافية والرسوم البيانية وتقرير تحليلي مفسر.",
                    "Advanced medical statistical analysis using SPSS, R, and GraphPad with publication-ready charts, tables, and interpretation."
                  )}
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 mb-6">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-sky-600 flex-shrink-0" />
                    <span>{localize("منهجيات الانحدار وKaplan-Meier", "Regression & survival analysis")}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-sky-600 flex-shrink-0" />
                    <span>{localize("مراجعة وتعديل مجاني على الملاحظات", "Free revisions on reviewer notes")}</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleServiceClick("التحليل الإحصائي")}
                className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-800 py-2.5 text-xs font-bold transition-colors"
              >
                <span>{localize("طلب تحليل إحصائي", "Request Biostatistics")}</span>
                {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </button>
            </div>

            {/* Service 5 */}
            <div className="rounded-3xl bg-white p-7 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-purple-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                  <Globe size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  {localize("الصياغة والترجمة والتدقيق الطبي", "Medical Writing & Academic Editing")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {localize(
                    "تدقيق لغوي وطبي احترافي بواسطة متخصصين متحدثين أصليين، مع إعادة صياغة ترفع من جودة البحث وتزيل احتمالات الرفض اللغوي.",
                    "Professional medical editing and proofreading by native medical writers, raising paper quality and preventing language rejections."
                  )}
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 mb-6">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-purple-600 flex-shrink-0" />
                    <span>{localize("شهادة تدقيق لغوي معتمدة للمجلة", "Proofreading certificate for journals")}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-purple-600 flex-shrink-0" />
                    <span>{localize("فحص نسبة الانتحال العلمي (Turnitin)", "Plagiarism check (Turnitin)")}</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleServiceClick("التدقيق والمراجعة")}
                className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-purple-600 hover:text-white text-slate-800 py-2.5 text-xs font-bold transition-colors"
              >
                <span>{localize("طلب تدقيق لغوي", "Request Medical Editing")}</span>
                {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </button>
            </div>

            {/* Service 6 */}
            <div className="rounded-3xl bg-white p-7 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
                  <Shield size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  {localize("التحكيم العلمي والموافقات الأخلاقية (IRB)", "Scientific Validation & IRB Support")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {localize(
                    "تحكيم الأدوات البحثية والاستبانات من قِبل استشاريين وأساتذة جامعيين معتمدين، ودعم ملفات لجان أخلاقيات البحث الطبي.",
                    "Scientific validation of research instruments and questionnaires by certified professors and support for IRB ethics files."
                  )}
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 mb-6">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-700 flex-shrink-0" />
                    <span>{localize("خطابات تحكيم رسمية موقعة", "Official signed validation letters")}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-700 flex-shrink-0" />
                    <span>{localize("مطابقة متطلبات المستشفيات والجامعات", "Aligned with hospital & university IRBs")}</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleServiceClick("التحكيم العلمي")}
                className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-emerald-700 hover:text-white text-slate-800 py-2.5 text-xs font-bold transition-colors"
              >
                <span>{localize("طلب تحكيم علمي", "Request Validation")}</span>
                {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STRATEGIC FOCUS: SAUDI BOARD & EXCELLENCE ALLOWANCE (قسم مخصص: البورد وبدل التميز) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0C3156] via-[#103e6d] to-[#0a2847] text-white">
        <div className="w-full max-w-none mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left/Main Column */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3.5 py-1 text-xs font-bold text-amber-300 mb-4">
                <Star size={14} />
                <span>{localize("قيمة مهنية ومالية مباشرة لمسارك الوظيفي", "Direct Professional & Financial Value")}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-4">
                {localize(
                  "كيف يُحدث نشر الأبحاث فارقاً حاسماً في مستقبلك كطبيب في السعودية؟",
                  "How Does Publishing Medical Research Transform Your Career in Saudi Arabia?"
                )}
              </h2>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-8">
                {localize(
                  "البحث العلمي الطبي في المملكة العربية السعودية لم يعد خياراً ثانوياً؛ بل هو المعيار الأكبر الذي يحدد قبولك في التخصص الذي تحلم به في البورد، أو نيل الترقية المهنية، أو استحقاق بدل التميز الحكومي.",
                  "Medical research is no longer secondary; it is the single most decisive factor determining your acceptance into your dream residency program, professional promotions, or annual excellence allowance."
                )}
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1">
                      {localize("استحقاق بدل التميز السنوي (وزارة الصحة)", "Ministry of Health Annual Excellence Allowance")}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {localize(
                        "الحصول على نسبة إضافية تصل إلى 20% - 30% من الراتب الأساسي عند نشر أبحاث في مجلات محكمة ومفهرسة في PubMed أو Scopus.",
                        "Earn up to an additional 20% - 30% of your base salary upon publishing in peer-reviewed journals indexed in PubMed or Scopus."
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BadgeCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1">
                      {localize("درجات المفاضلة القصوى بالبورد السعودي (SCFHS Matching)", "Maximum Points in Saudi Board (SCFHS) Matching")}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {localize(
                        "حصد 5 نقاط كاملة ومضمونة في معيار الأبحاث بهيئة التخصصات الصحية، وهو الفارق الأكبر في حسم القبول في التخصصات التنافسية.",
                        "Secure the full 5 research points in SCFHS matching, creating the ultimate competitive edge in sought-after specialties."
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-9 h-9 rounded-xl bg-sky-400/20 text-sky-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1">
                      {localize("القبول بالزمالات الخارجية (أمريكا، بريطانيا، كندا)", "Acceptance in International Fellowships (US, UK, Canada)")}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {localize(
                        "الأبحاث المنشورة في Q1 و Q2 تمثل بطاقة العبور الأساسية للمقابلات والقبول في برامج الزمالة الملكية والابتعاث الخارجي.",
                        "Q1 and Q2 publications are the primary qualification reviewed in fellowship selection committees abroad."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right/Card Column */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white text-slate-900 p-8 shadow-2xl border border-slate-100">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#117b59]/10 text-[#117b59] flex items-center justify-center mx-auto mb-3">
                    <HeartPulse size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {localize("استشارة بحثية مجانية عبر واتساب", "Free Research Consultation via WhatsApp")}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {localize("تحدث مع أحد مستشارينا الأكاديميين لتقييم ملفك واختيار المسار المناسب", "Talk with our consultants to evaluate your profile & choose your track")}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <CheckCircle2 size={16} className="text-[#117b59] flex-shrink-0" />
                    <span>{localize("تحديد المجلات المناسبة لتخصصك الدقيق", "Identify top journals for your subspecialty")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <CheckCircle2 size={16} className="text-[#117b59] flex-shrink-0" />
                    <span>{localize("شرح آلية احتساب نقاط البورد وبدل التميز", "Calculate your exact board points & allowance")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <CheckCircle2 size={16} className="text-[#117b59] flex-shrink-0" />
                    <span>{localize("ترشيح الفرص المفتوحة حالياً للتسجيل", "Recommend open opportunities fitting your timeline")}</span>
                  </div>
                </div>

                <a
                  href={directWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#1eb856] text-white py-4 font-black text-sm shadow-md transition-all hover:scale-[1.01]"
                >
                  <MessageCircle size={18} />
                  <span>{localize("ابدأ الاستشارة الآن عبر واتساب", "Start Consultation on WhatsApp")}</span>
                </a>

                <p className="text-[11px] text-center text-slate-400 mt-3 font-medium">
                  {localize("متاحون للرد السريع على مدار اليوم", "Available for fast response 7 days a week")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (خطوات الانضمام والنشر في 4 مراحل) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
        <div className="w-full max-w-none mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-xl bg-[#0C3156]/8 border border-[#0C3156]/15 px-3.5 py-1 text-xs font-black text-[#0C3156] mb-3">
              <Sparkles size={14} />
              <span>{localize("آلية عمل واضحة وموثوقة", "Clear & Reliable Workflow")}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {localize("رحلتك للنشر في 4 خطوات بسيطة", "Your Publication Journey in 4 Simple Steps")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {localize(
                "نظام إداري وأكاديمي متكامل يضمن لك إنجاز بحثك باحترافية وسرعة ودون أي تعقيدات.",
                "An integrated administrative and academic system ensuring professional, prompt delivery."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="rounded-3xl bg-slate-50 border border-slate-200/90 p-6 relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0C3156] text-white font-black text-base flex items-center justify-center mb-4">
                  1
                </div>
                <h3 className="font-black text-base text-slate-900 mb-2">
                  {localize("اختيار الفرصة أو تقديم الفكرة", "Select Opportunity or Submit Idea")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {localize(
                    "اختر من بين الفرص البحثية الجاهزة للتسجيل في تخصصك، أو اطلب خدمة بحثية مخصصة لفكرة ترغب بتنفيذها.",
                    "Choose from ready-to-register research opportunities in your specialty, or submit a custom idea."
                  )}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-[#117b59] font-bold">
                {localize("خلال دقائق من التصفح", "Within minutes of browsing")}
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl bg-slate-50 border border-slate-200/90 p-6 relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#117b59] text-white font-black text-base flex items-center justify-center mb-4">
                  2
                </div>
                <h3 className="font-black text-base text-slate-900 mb-2">
                  {localize("تأكيد التسجيل والتواصل الأكاديمي", "Registration & Supervisor Assignment")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {localize(
                    "يتم التواصل معك من قِبل منسق الأكاديمية والمشرف لتزويدك ببروتوكول البحث وخطة العمل وتوزيع المهام.",
                    "The coordinator connects you with the supervisor to provide protocol, timeline, and task distribution."
                  )}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-[#117b59] font-bold">
                {localize("تنسيق مباشر عبر قنوات خاصة", "Direct coordination in dedicated groups")}
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl bg-slate-50 border border-slate-200/90 p-6 relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-black text-base flex items-center justify-center mb-4">
                  3
                </div>
                <h3 className="font-black text-base text-slate-900 mb-2">
                  {localize("العمل البحثي والتحليل الإحصائي", "Research Execution & Data Analysis")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {localize(
                    "إنجاز التحليل الإحصائي، صياغة المخطوطة، المراجعة المنهجية، والتدقيق اللغوي بما يتطابق مع معايير المجلة.",
                    "Biostatistical analysis, medical manuscript writing, methodology review, and professional proofreading."
                  )}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-[#117b59] font-bold">
                {localize("إشراف خطوة بخطوة", "Step-by-step guidance")}
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-3xl bg-slate-50 border border-slate-200/90 p-6 relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center mb-4">
                  4
                </div>
                <h3 className="font-black text-base text-slate-900 mb-2">
                  {localize("الإرسال للمجلة والقبول النهائي", "Journal Submission & Acceptance")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {localize(
                    "إرسال البحث للمجلة، الرد على ملاحظات المحكمين حتى استلام خطاب القبول الرسمي والنشر المفهرس برقم DOI.",
                    "Submission to the journal, peer-review rebuttals until formal letter of acceptance and DOI publication."
                  )}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-[#117b59] font-bold">
                {localize("شهادات رسمية ونقاط معتمدة", "Official certificate & indexing")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PUBLISHED RESEARCH HIGHLIGHTS (سجل الإنجازات والأبحاث المنشورة) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 border-b border-slate-100">
        <div className="w-full max-w-none mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-xl bg-[#117b59]/10 border border-[#117b59]/20 px-3.5 py-1 text-xs font-black text-[#117b59] mb-3">
              <BadgeCheck size={14} />
              <span>{localize("إنجازات حقيقية موثقة", "Verified Real Achievements")}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {localize("نماذج من الأبحاث المنشورة لزملائنا الأطباء", "Sample Published Studies by Our Doctor Colleagues")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {localize(
                "أبحاث تم نشرها في أرقى الدوريات الطبية العالمية المفهرسة في PubMed و Web of Science و Scopus.",
                "Research successfully published in top international medical journals indexed in PubMed, WoS, and Scopus."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publishedHallOfFame.map((item, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-1">
                      {localize(item.specialtyAr, item.specialtyEn)}
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 rounded-md px-2 py-0.5">
                      Q1 / Q2
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug mb-2">
                    {localize(item.titleAr, item.titleEn)}
                  </h3>

                  <div className="text-xs text-slate-500 mb-3 space-y-1">
                    <div className="font-semibold text-slate-800">{item.journal}</div>
                    <div className="text-[11px] text-[#117b59] font-medium">{item.impact}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{item.authorsCount}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 size={13} />
                    <span>{localize("منشور بنجاح", "Published")}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS (آراء وانطباعات الأطباء) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
        <div className="w-full max-w-none mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-black text-amber-700 mb-3">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span>{localize("شهادات نعتز بها", "Testimonials We Cherish")}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {localize("ماذا يقول الأطباء والباحثون عن تجربتهم معنا؟", "What Physicians & Researchers Say About Us")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {localize(
                "تجارب واقعية لأطباء حققوا القبول بالبورد السعودي وبدل التميز والنشر الدولي.",
                "Real experiences of physicians who secured Saudi Board acceptance, excellence allowances, and international publications."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-slate-50 border border-slate-200/90 p-7 flex flex-col justify-between shadow-xs hover:border-[#117b59]/30 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">
                    "{item.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/70">
                  <div className="text-2xl">{item.avatar}</div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-xs text-[#117b59] font-medium">{item.role}</div>
                    <div className="text-[10px] text-slate-400">{item.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION (الأسئلة الشائعة والأكثر تكراراً) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-xl bg-[#0C3156]/8 border border-[#0C3156]/15 px-3.5 py-1 text-xs font-black text-[#0C3156] mb-3">
              <FileText size={14} />
              <span>{localize("إجابات واضحة وشفافة", "Clear & Transparent Answers")}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {localize("الأسئلة الأكثر شيوعاً بين الأطباء", "Frequently Asked Questions by Physicians")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {localize("كل ما تحتاج معرفته حول الاعتمادات، المجلات، وحفظ الحقوق الأكاديمية.", "Everything you need to know about accreditation, journals, and academic rights.")}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-right px-6 py-4.5 font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <span className="flex-1 text-right">{faq.q}</span>
                    <span className="text-slate-400 flex-shrink-0">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <p className="text-xs sm:text-sm text-slate-600 mb-3">
              {localize("هل لديك سؤال آخر لم تجد إجابته هنا؟", "Have another question not answered here?")}
            </p>
            <a
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#117b59] font-bold text-sm hover:underline"
            >
              <MessageCircle size={16} />
              <span>{localize("تواصل مع فريق الدعم الأكاديمي عبر واتساب مباشرة", "Contact our academic support team directly on WhatsApp")}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 10. HIGH CONVERTING BOTTOM CTA BANNER (دعوة ختامية للحجز والتسجيل) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0C3156] via-[#117b59] to-[#0C3156] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-black text-amber-300 mb-6">
            <Sparkles size={14} />
            <span>{localize("لا تدع فرصة النشر تفوتك", "Don't Miss Your Publication Opportunity")}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {localize(
              "جاهز لبدء بحثك الطبي القادم وتحقيق أهدافك المهنية؟",
              "Ready to Start Your Next Medical Research & Achieve Your Goals?"
            )}
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-emerald-100 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            {localize(
              "احجز مقعدك في إحدى الفرص البحثية النشطة أو تواصل معنا لصياغة خطة بحثية تلبي متطلباتك بدقة وسرية تامة.",
              "Reserve your seat in active research opportunities or reach out to tailor a research plan meeting your requirements with complete confidentiality."
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
            <Link
              href="/participant-portal"
              data-testid="button-cta-portal"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-[#0C3156] px-8 py-4 text-base font-black shadow-xl hover:bg-slate-100 transition-all hover:scale-[1.02]"
            >
              <span>{localize("استكشف الفرص البحثية الآن", "Explore Opportunities Now")}</span>
              {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </Link>

            <a
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-cta-whatsapp"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#1eb856] text-white px-7 py-4 text-base font-black shadow-xl transition-all hover:scale-[1.02]"
            >
              <MessageCircle size={20} />
              <span>{localize("تواصل مباشر عبر واتساب", "Direct WhatsApp Chat")}</span>
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-emerald-100/80">
            <span>• {localize("سرية تامة للبيانات", "Strict Data Confidentiality")}</span>
            <span>• {localize("حقوق ملكية فكرية محفوظة", "Protected Intellectual Property")}</span>
            <span>• {localize("إشراف من كبار الاستشاريين", "Consultant Supervision")}</span>
          </div>
        </div>
      </section>

      {/* MODALS */}
      {selectedOpportunity && (
        <RegistrationModal
          isOpen={registrationModalOpen}
          onClose={() => setRegistrationModalOpen(false)}
          researchTitle={getEnglishOpportunityTitle(selectedOpportunity)}
          researchId={selectedOpportunity.id}
          firstAuthorSeatsLeft={selectedOpportunity.firstAuthorSeatsLeft ?? 1}
          coAuthorSeatsLeft={selectedOpportunity.coAuthorSeatsLeft ?? (selectedOpportunity.seatsLeft ?? 2)}
          priceOriginalSar={selectedOpportunity.priceOriginalSar || 2500}
          priceDiscountedSar={selectedOpportunity.priceDiscountedSar || 1500}
        />
      )}

      <ServiceModal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        serviceName={selectedServiceName}
      />
    </div>
  );
}
