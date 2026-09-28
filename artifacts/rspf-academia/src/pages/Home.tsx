import { Link } from "wouter";
import {
  FlaskConical,
  Users,
  BookOpen,
  BarChart2,
  Heart,
  Award,
  CheckCircle2,
  ChevronLeft,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useSiteContentSettings } from "@/hooks/use-site-content-settings";

const services = [
  {
    bg: "#0C3156",
    icon: <FlaskConical size={26} />,
    title: "فرص بحثية للمشاركة والنشر",
    desc: "شارك في أبحاث طبية محكمة ومفهرسة دولياً مع إشراف كامل حتى النشر",
    href: "/services/research",
  },
  {
    bg: "#0369A1",
    icon: <Users size={26} />,
    title: "برنامج تدريب باحث",
    desc: "تدريب متكامل على مهارات البحث العلمي مع فرصة نشر حقيقية",
    href: "/services/training",
  },
  {
    bg: "#6D28D9",
    icon: <BookOpen size={26} />,
    title: "دعم النشر في مجلات عالية التصنيف",
    desc: "إعداد بحثك للنشر في مجلات Q1 و Q2 المفهرسة في Scopus وWoS وPubMed",
    href: "/services/publishing",
  },
  {
    bg: "#1E3A5F",
    icon: <BarChart2 size={26} />,
    title: "التدقيق والتحليل الإحصائي",
    desc: "تحليل إحصائي دقيق ومراجعة علمية شاملة لضمان سلامة البيانات وصحة النتائج",
    href: "/services/stats",
  },
  {
    bg: "#0F766E",
    icon: <Heart size={26} />,
    title: "وجهتك للتدريب الصحي",
    desc: "برامج تدريب صحي معتمدة تمنحك شهادات معترف بها من الهيئة السعودية للتخصصات الصحية",
    href: "/services/health-training",
  },
  {
    bg: "#C2410C",
    icon: <Award size={26} />,
    title: "دورات طبية معتمدة CME",
    desc: "دورات طبية معتمدة تمنحك نقاط CME المطلوبة لتجديد اعتمادك المهني",
    href: "/services/cme",
  },
];

const universities = [
  "جامعة القصيم",
  "جامعة الملك فيصل",
  "جامعة أم القرى",
  "جامعة تبوك",
  "جامعة حائل",
  "جامعة نجران",
  "جامعة جازان",
  "جامعة طريف",
  "جامعة الباحة",
];

const databases = [
  { name: "PMC", desc: "PubMed Central" },
  { name: "WoS", desc: "Web of Science" },
  { name: "PubMed", desc: "المرجع الأول" },
  { name: "Scopus", desc: "أكبر قواعد البيانات" },
  { name: "Q1 / Q2", desc: "أعلى التصنيفات" },
];

const goals = [
  {
    emoji: "🏥",
    title: "البورد السعودي",
    badge: "5 نقاط SCFHS",
    bullets: ["5 نقاط SCFHS للبورد", "بحث مفهرس في مجلة محكمة", "إشراف كامل حتى النشر"],
  },
  {
    emoji: "🎓",
    title: "زمالة التخصصات الدقيقة",
    badge: "بورد+",
    bullets: ["بحث في تخصصك الدقيق", "نشر في مجلة Q1 أو Q2", "رسالة توصية"],
  },
  {
    emoji: "🌍",
    title: "الزمالات الخارجية",
    badge: "ERAS / Oriel",
    bullets: ["بحث منشور بحسا��ك كمؤلف", "CV يلفت نظر المراكز العالمية", "مساندة للملف التنافسي"],
  },
  {
    emoji: "📚",
    title: "الترقية الأكاديمية",
    badge: "+3 أبحاث",
    bullets: ["3 أبحاث أكاديمية أو أكثر", "نشر في مجلات محكمة", "فهرسة PubMed / Scopus"],
  },
  {
    emoji: "✈️",
    title: "الابتعاث الخارجي",
    badge: "بحوث علمية",
    bullets: ["بحوث تدعم ملف الابتعاث", "نشر دولي موثق", "رسائل توصية"],
  },
  {
    emoji: "💼",
    title: "الترقية المهنية",
    badge: "ملف متميز",
    bullets: ["ملف مهني يتكلم عنك", "نشر في مجلات معترف بها", "نقاط CME إضافية"],
  },
];

const partnerFeatures = [
  "فريق متخصص من الأطباء والباحثين",
  "إشراف كامل من الفكرة حتى النشر",
  "مجلات مفهرسة في PubMed وScopus وWoS",
  "دعم في التوثيق والإعداد للمنشورات",
];

export default function Home() {
  const { direction, localize, language } = useLanguage();
  const { data: settings } = useSiteContentSettings();
  const whatsapp = `https://wa.me/${settings?.brand?.whatsapp || "966562159258"}`;

  const staticEnglish: Record<string, string> = {
    "فرص بحثية للمشاركة والنشر": "Research opportunities for participation and publication",
    "شارك في أبحاث طبية محكمة ومفهرسة دولياً مع إشراف كامل حتى النشر": "Participate in peer-reviewed, internationally indexed medical research with full supervision until publication",
    "الأكثر طلباً ⭐": "Most requested ⭐",
    "برنامج تدريب باحث": "Researcher training program",
    "تدريب متكامل على مهارات البحث العلمي مع فرصة نشر حقيقية": "Comprehensive scientific research skills training with a real publication opportunity",
    "دعم النشر في مجلات عالية التصنيف": "Publication support in highly ranked journals",
    "إعداد بحثك للنشر في مجلات Q1 و Q2 المفهرسة في Scopus وWoS وPubMed": "Prepare your research for publication in Q1 and Q2 journals indexed in Scopus, WoS, and PubMed",
    "التدقيق والتحليل الإحصائي": "Statistical review and analysis",
    "تحليل إحصائي دقيق ومراجعة علمية شاملة لضمان سلامة البيانات وصحة النتائج": "Precise statistical analysis and comprehensive scientific review to ensure data integrity and result validity",
    "وجهتك للتدريب الصحي": "Your destination for health training",
    "برامج تدريب صحي معتمدة تمنحك شهادات معترف بها من الهيئة السعودية للتخصصات الصحية": "Accredited health training programs recognized by the Saudi Commission for Health Specialties",
    "دورات طبية معتمدة CME": "Accredited CME medical courses",
    "دورات طبية معتمدة تمنحك نقاط CME المطلوبة لتجديد اعتمادك المهني": "Accredited medical courses that provide the CME points required to renew your professional accreditation",
    "المرجع الأول": "Primary reference",
    "أكبر قواعد البيانات": "Largest databases",
    "أعلى التصنيفات": "Highest rankings",
    "البورد السعودي": "Saudi Board",
    "5 نقاط SCFHS": "5 SCFHS points",
    "5 نقاط SCFHS للبورد": "5 SCFHS points for the Board",
    "بحث مفهرس في مجلة محكمة": "Peer-reviewed research in a reputable journal",
    "زمالة التخصصات الدقيقة": "Subspecialty fellowship",
    "بورد+": "Board+",
    "بحث في تخصصك الدقيق": "Research in your subspecialty",
    "نشر في مجلة Q1 أو Q2": "Publication in a Q1 or Q2 journal",
    "الزمالات الخارجية": "International fellowships",
    "بحث منشور بحسابك كمؤلف": "Published research credited to you as an author",
    "CV يلفت نظر المراكز العالمية": "A CV that catches the attention of international centers",
    "الترقية الأكاديمية": "Academic promotion",
    "+3 أبحاث": "3+ studies",
    "3 أبحاث أكاديمية أو أكثر": "3 or more academic studies",
    "الابتعاث الخارجي": "International scholarship",
    "بحوث علمية": "Scientific research",
    "بحوث تدعم ملف الابتعاث": "Research that supports your scholarship file",
    "الترقية المهنية": "Professional promotion",
    "ملف متميز": "Outstanding profile",
    "ملف مهني يتكلم عنك": "A professional profile that speaks for you",
    "فريق متخصص من الأطباء والباحثين": "Specialized team of physicians and researchers",
    "إشراف كامل من الفكرة حتى النشر": "Full supervision from idea to publication",
    "مجلات مفهرسة في PubMed وScopus وWoS": "Journals indexed in PubMed, Scopus, and WoS",
    "تحديد موضوع بحثي مناسب لتخصصه في طب القلب": "Identifying a suitable cardiology research topic",
    "بناء فريق البحث وتوزيع المهام بدقة": "Building the research team and assigning tasks precisely",
    "بحث جاهز بدون نشر؟": "Research ready but unpublished?",
    "بيانات مجمعة بدون تحليل؟": "Collected data without analysis?",
    "فكرة بدون فريق؟": "No team for the idea?",
    "المدرّبون والمشاركون": "Trainers and participants",
    "الفرص البحثية": "Research opportunities",
    "نسبة النجاح": "Success rate",
    "مجلة دولية معتمدة": "International accredited journal",
    "نقاط SCFHS": "SCFHS points",
    "طلاب في المجموعة": "Students in the group",
    "خصم حتى": "Discount up to",
    "المجالس الطلابية في كليات الطب والعلوم الصحية": "Student councils in medical and health sciences colleges",
    "اعتماد رسمي": "Official accreditation",
    "باحث مسجل": "Registered researchers",
    "دراسة مكتملة": "Completed studies",
    "كل ما تحتاجه في مكان واحد": "Everything you need in one place",
    "خدماتنا المتميزة ⭐": "Our distinguished services ⭐",
    "خدمات بحثية متكاملة مصممة خصيصاً للأطباء والباحثين": "Comprehensive research services designed for clinicians and researchers",
    "شركاؤنا الأكاديميون 🤝": "Our academic partners 🤝",
    "يثق بنا باحثون من أكثر من 30 جامعة": "Trusted by researchers from 30+ universities",
    "تعرف علينا": "Get to know us",
    "استكشف الفرص البحثية": "Explore research opportunities",
    "تواصل معنا": "Contact us",
    "للاستفسارات: ": "For inquiries: ",
    "استكشف الباقة وسجل الآن": "Explore the package and register now",
    "ابدأ الآن عبر واتساب": "Start now via WhatsApp",
    "تصفح الفرص البحثية": "Browse research opportunities",
    "أُحيي أبحاثك المتوقفة ونوصلها لمرحلة النشر": "We revive stalled research and take it to publication",
    "لا تترك بحثك يجمع الغبار": "Don’t leave your research gathering dust",
    "تحدث معنا الآن لإحياء بحثك": "Talk to us now to revive your research",
    "جاهز للبدء في بحثك القادم؟": "Ready to start your next research project?",
    "فريق": "Team",
    "أكاديمية": "Academy",
    "جاهز لمساعدتك": "Ready to help you",
    "دخول بوابة المشارك": "Enter the Participant Portal",
    "طلب خدمة خاصة": "Request a special service",
  };

  const s = (arabic: string) => localize(arabic, staticEnglish[arabic] ?? arabic);

  return (
    <div className="min-h-screen bg-white" dir={direction}>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-white py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(12,49,86,0.06)_0%,_transparent_60%)]" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#0C3156]/8 border border-[#0C3156]/15 text-[#0C3156] px-5 py-2 rounded-full text-sm font-semibold mb-7 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#E9A020] animate-pulse" />
            {localize(
              `${settings?.brand?.siteNameAr || "أكاديمية الأبحاث"} · إصدار 2026`,
              `${settings?.brand?.siteNameEn || "Research Academy"} · Edition 2026`
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight text-slate-900">
            {language === "ar" ? settings?.pages?.home?.titleAr : settings?.pages?.home?.titleEn}
          </h1>

          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            {language === "ar" ? settings?.pages?.home?.descriptionAr : settings?.pages?.home?.descriptionEn}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Link
              href="/participant-portal"
              data-testid="button-hero-explore"
              className="bg-[#0C3156] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-[#0a2847] transition-all shadow-lg shadow-[#0C3156]/25 inline-flex items-center gap-2 justify-center"
            >
              {localize("استكشف الفرص البحثية", "Explore research opportunities")} <ChevronLeft size={18} />
            </Link>

            <Link
              href="/about"
              data-testid="button-hero-about"
              className="border-2 border-[#0C3156]/25 text-[#0C3156] bg-white px-8 py-4 rounded-full font-bold text-base hover:border-[#0C3156]/50 hover:bg-blue-50/50 transition-all inline-flex items-center gap-2 justify-center"
            >
              {localize("تعرف علينا", "Get to know us")} <ChevronLeft size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { value: "SCFHS", label: "اعتماد رسمي", icon: "🏛️" },
              { value: "500+", label: "باحث مسجل", icon: "👨‍⚕️" },
              { value: "50+", label: "دراسة مكتملة", icon: "📄" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-black text-[#0C3156]">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{s(stat.label)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#E9A020]/15 border border-[#E9A020]/25 text-[#C47D00] px-4 py-1.5 rounded-full text-sm font-bold mb-3">
              {localize("خدماتنا المتميزة ⭐", "Our distinguished services ⭐")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">
              {localize("كل ما تحتاجه في مكان واحد", "Everything you need in one place")}
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              {localize(
                "خدمات بحثية متكاملة مصممة خصيصاً للأطباء والباحثين",
                "Comprehensive research services designed for clinicians and researchers"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc) => (
              <div
                key={svc.title}
                className="srma-hover-lift rounded-2xl p-6 text-white flex flex-col gap-4 hover:scale-[1.02] transition-transform"
                style={{ backgroundColor: svc.bg }}
              >
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">{svc.icon}</div>
                <div>
                  <h3 className="text-lg font-bold leading-snug">{s(svc.title)}</h3>
                  <p className="text-white/75 text-sm mt-2 leading-relaxed">{s(svc.desc)}</p>
                </div>
                <Link
                  href={svc.href}
                  data-testid={`button-svc-${svc.title.substring(0, 6)}`}
                  className="mt-auto inline-flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors border border-white/20"
                >
                  {localize("استكشف الباقة وسجل الآن", "Explore the package and register now")} <ChevronLeft size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#0C3156]/8 border border-[#0C3156]/12 text-[#0C3156] px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
              {localize("شركاؤنا الأكاديميون 🤝", "Our academic partners 🤝")}
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {localize("يثق بنا باحثون من أكثر من 30 جامعة", "Trusted by researchers from 30+ universities")}
            </h2>
          </div>

          <div className="flex justify-center gap-3 flex-wrap mb-6">
            {[...universities, ...universities].map((uni, i) => (
              <span
                key={`${uni}-${i}`}
                className="flex-shrink-0 bg-[#EFF6FF] border border-[#0C3156]/12 rounded-full px-4 py-2 text-sm font-medium text-[#0C3156] whitespace-nowrap"
              >
                🇸🇦 {uni}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-slate-50/50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#E9A020]/15 border border-[#E9A020]/25 text-[#C47D00] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            {localize("التميز العلمي 🏆", "Research excellence 🏆")}
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">
            {localize("حقّق التميّز العلمي وانشر في أقوى المجلات العالمية", "Achieve research excellence and publish in the strongest international journals")}
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto mb-8">
            {localize(
              "أبحاثنا مفهرسة في أكبر وأهم قواعد البيانات العلمية الدولية",
              "Our research is indexed in the largest and most important international scientific databases"
            )}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            {databases.map((db) => (
              <div
                key={db.name}
                className="bg-white border border-[#0C3156]/12 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-xl font-black text-[#0C3156]">{db.name}</div>
                <div className="text-xs text-slate-500 mt-1.5 font-medium">{s(db.desc)}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Cochrane Library",
              "EBSCO",
              "Google Scholar",
              "Ovid",
              "DOAJ",
              "CINAHL",
            ].map((db) => (
              <span
                key={db}
                className="bg-white border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm"
              >
                {db}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#0C3156]/8 text-[#0C3156] px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
              🎯 {localize("هدفك الأكاديمي", "Your academic goal")}
            </div>
            <h2 className="text-3xl font-black text-slate-900">
              {localize("الفائدة حسب هدفك", "Benefits based on your goal")}
            </h2>
            <p className="text-slate-500 mt-2">
              {localize("نخصص دعمنا حسب هدفك البحثي والمهني", "We tailor our support to your research and professional goals.")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((goal) => (
              <div
                key={goal.title}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:border-[#0C3156]/25"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#0C3156]/8 text-[#0C3156] text-xs font-bold px-2.5 py-1 rounded-full border border-[#0C3156]/10">
                    {s(goal.badge)}
                  </span>
                  <span className="text-2xl">{goal.emoji}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-right mb-3">{s(goal.title)}</h3>
                <ul className="space-y-1.5">
                  {goal.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 flex-row-reverse">
                      <CheckCircle2 size={14} className="text-[#0C3156] flex-shrink-0" />
                      <span className="text-sm text-slate-600">{s(b)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-slate-50/50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-[#0C3156] to-[#1A5FAE] rounded-3xl p-8 sm:p-10 text-white text-right shadow-xl">
            <div className="inline-flex items-center gap-2 bg-[#E9A020] text-white px-4 py-1.5 rounded-full text-xs font-bold mb-5">
              {localize("SRMA في 2026 🌟", "SRMA in 2026 🌟")}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-6">
              {localize("نوّر لك المسار الكامل 🚀", "We illuminate your complete path 🚀")}
            </h2>
            <ul className="space-y-3 mb-8">
              {partnerFeatures.map((item) => (
                <li key={item} className="flex items-start gap-3 flex-row-reverse">
                  <CheckCircle2 size={18} className="text-[#E9A020] flex-shrink-0 mt-0.5" />
                  <span className="text-white/90">{s(item)}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-path-whatsapp"
                className="bg-[#E9A020] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#d08e10] transition-colors inline-flex items-center gap-2 justify-center shadow-lg"
              >
                {localize("ابدأ الآن عبر واتساب", "Start now via WhatsApp")} <ChevronLeft size={16} />
              </a>
              <Link
                href="/participant-portal"
                data-testid="button-path-browse"
                className="border-2 border-white/30 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-white/10 transition-colors inline-flex items-center gap-2 justify-center"
              >
                {localize("تصفح الفرص البحثية", "Browse research opportunities")} <ChevronLeft size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#E9A020]/15 border border-[#E9A020]/25 text-[#C47D00] px-4 py-1.5 rounded-full text-sm font-bold mb-5">
            {localize("قصة حقيقية 🏆", "A real story 🏆")}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8">
            {localize("من رفضين متتاليين إلى القبول في زمالة القلبية ❤️", "From two rejections to acceptance into a cardiology fellowship ❤️")}
          </h2>
          <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 text-right mb-5">
            <blockquote className="text-slate-700 text-lg font-medium leading-relaxed mb-6 italic border-r-4 border-[#0C3156] pr-4">
              {localize(
                "كنت أعتقد أن رحلتي مع الزمالة انتهت بعد الرفض الثاني، لكن SRMA صنعت معي ملفاً بحثياً من الصفر خلال شهرين وبدّل حالتي تماماً",
                "I thought my fellowship journey was over after the second rejection, but SRMA built a research file for me from scratch in two months and changed my situation completely."
              )}
            </blockquote>
            <div className="space-y-3">
              {[
                "تحديد موضوع بحثي مناسب لتخصصه في طب القلب",
                "بناء فريق البحث وتوزيع المهام بدقة",
                "الإشراف على جمع البيانات وتحليلها",
              ].map((step, i) => (
                <div key={step} className="flex items-center gap-3 flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-[#0C3156] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-slate-600 text-sm">{s(step)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#E9A020]/10 border-2 border-[#E9A020] rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="font-black text-slate-900 text-lg">
              {localize("قُبل في برنامج زمالة القلبية ✅", "Accepted into a cardiology fellowship program ✅")}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {localize("بعد 6 أشهر فقط مع SRMA", "After only six months with SRMA")}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-slate-50/50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            {localize("أُحيي أبحاثك المتوقفة ونوصلها لمرحلة النشر", "We revive your stalled research and take it to publication")}
          </h2>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto">
            {localize(
              "لا تترك بحثك يجمع الغبار — لدينا الفريق والخبرة لإعادة إحياء أي بحث",
              "Don’t leave your research gathering dust — we have the team and experience to revive any study."
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {[
              { bg: "#0C3156", text: "بحث جاهز بدون نشر؟" },
              { bg: "#0369A1", text: "بيانات مجمعة بدون تحليل؟" },
              { bg: "#6D28D9", text: "فكرة بدون فريق؟" },
            ].map((card) => (
              <div
                key={card.text}
                className="rounded-2xl p-6 text-white text-center font-bold text-lg shadow-sm"
                style={{ backgroundColor: card.bg }}
              >
                {s(card.text)}
              </div>
            ))}
          </div>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="button-revive-whatsapp"
            className="inline-flex items-center gap-2 bg-[#0C3156] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-[#0a2847] transition-colors shadow-lg shadow-[#0C3156]/25"
          >
            {localize("تحدث معنا الآن لإحياء بحثك", "Talk to us now to revive your research")} <ChevronLeft size={18} />
          </a>
        </div>
      </section>

      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900">
              {localize("شريكك الحقيقي في رحلتك البحثية", "Your true partner in your research journey")}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-10">
            {[
              { value: "200+", label: "المدرّبون والمشاركون", icon: "👨‍⚕️" },
              { value: "50+", label: "الفرص البحثية", icon: "🔬" },
              { value: "95%", label: "نسبة النجاح", icon: "📊" },
              { value: "30+", label: "مجلة دولية محكمة", icon: "📚" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-gradient-to-br from-[#0C3156] to-[#1A5FAE] rounded-2xl p-5 text-center text-white shadow-md"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-black">{stat.value}</div>
                <div className="text-sm text-blue-100 mt-2 font-medium">{s(stat.label)}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {partnerFeatures.map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-3 flex-row-reverse bg-[#EFF6FF] rounded-xl px-4 py-3 border border-[#0C3156]/10"
              >
                <CheckCircle2 size={17} className="text-[#0C3156] flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700">{s(feat)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#E9A020]/15 border border-[#E9A020]/25 text-[#C47D00] px-4 py-1.5 rounded-full text-sm font-bold mb-3">
              {localize("مبادرة حصرية - جديد 🎓", "Exclusive initiative — new 🎓")}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {localize("باقة التميز للمجالس الطلابية والأندية ا��أكاديمية", "Excellence package for student councils and academic clubs")}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { value: "5", label: "نقاط SCFHS" },
              { value: "+5", label: "طلاب في المجموعة" },
              { value: "25%", label: "خصم حتى" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-[#0C3156]/12 rounded-2xl p-4 text-center shadow-sm">
                <div className="text-2xl font-black text-[#0C3156]">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{s(stat.label)}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 text-right">{localize("الفئات المستهدفة:", "Target groups:")}</h3>
            <ul className="space-y-2">
              {[
                "المجالس ال��لابية في كليات الطب والتمريض والصيدلة",
                "الأندية الأكاديمية والبحثية في الجامعات السعودية",
                "مراكز الطلاب والأنشطة العلمية",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 flex-row-reverse">
                  <CheckCircle2 size={16} className="text-[#0C3156] flex-shrink-0" />
                  <span className="text-sm text-slate-700">{s(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-[#0C3156]">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-black mb-3">
            {localize("جاهز للبدء في بحثك القادم؟", "Ready to start your next research project?")}
          </h2>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto">
            {localize(
              "فريق أكاديمية الأبحاث جاهز لمساعدتك في كل خطوة من خطوات رحلتك البحثية",
              "The Research Academy team is ready to help you at every step of your research journey."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/participant-portal"
              data-testid="button-cta-portal"
              className="bg-[#E9A020] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-[#d08e10] transition-colors shadow-lg inline-flex items-center gap-2 justify-center"
            >
              {localize("دخول بوابة المشارك", "Enter the Participant Portal")} <ArrowUpRight size={18} />
            </Link>
            <Link
              href="/special-requests"
              data-testid="button-cta-special"
              className="border-2 border-white/25 text-white px-8 py-4 rounded-full font-bold text-base hover:bg-white/10 transition-colors inline-flex items-center gap-2 justify-center"
            >
              {localize("طلب خدمة خاصة", "Request a special service")} <ChevronLeft size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
