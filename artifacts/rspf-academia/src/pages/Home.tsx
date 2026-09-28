import { Link } from "wouter";
import { FlaskConical, Users, BookOpen, BarChart2, Heart, Award, CheckCircle2, ChevronLeft, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useSiteContentSettings } from "@/hooks/use-site-content-settings";
import { getContactUsHref } from "@/lib/siteContentSettings";

const services = [
  { bg: "#0C3156", icon: <FlaskConical size={26} />, title: "فرص بحثية للمشاركة والنشر", desc: "شارك في أبحاث طبية محكمة ومفهرسة دولياً مع �[...]" },
  { bg: "#0369A1", icon: <Users size={26} />, title: "برنامج تدريب باحث", desc: "تدريب متكامل على مهارات البحث العلمي مع فرصة نشر حقيقية[... ]" },
  { bg: "#6D28D9", icon: <BookOpen size={26} />, title: "دعم النشر في مجلات عالية التصنيف", desc: "إعداد بحثك للنشر في مجلات Q1 و Q2 المفهرس�[...]" },
  { bg: "#1E3A5F", icon: <BarChart2 size={26} />, title: "التدقيق والتحليل الإحصائي", desc: "تحليل إحصائي دقيق ومراجعة علمية شاملة لضمان[... ]" },
  { bg: "#0F766E", icon: <Heart size={26} />, title: "وجهتك للتدريب الصحي", desc: "برامج تدريب صحي معتمدة تمنحك شهادات معترف بها من اله�[...]" },
  { bg: "#C2410C", icon: <Award size={26} />, title: "دورات طبية معتمدة CME", desc: "دورات طبية معتمدة تمنحك نقاط CME المطلوبة لتجديد اعتم�[...]" },
];

const universities = ["جامعة القصيم","جامعة الملك فيصل","جامعة أم القرى","جامعة تبوك","جامعة حائل","جامعة نجران","جامعة جاز[...]"];
const databases = [
  { name: "PMC", desc: "PubMed Central" },
  { name: "WoS", desc: "Web of Science" },
  { name: "PubMed", desc: "المرجع الأول" },
  { name: "Scopus", desc: "أكبر قواعد البيانات" },
  { name: "Q1 / Q2", desc: "أعلى التصنيفات" },
];
const goals = [
  { emoji: "🏥", title: "البورد السعودي", badge: "5 نقاط SCFHS", bullets: ["5 نقاط SCFHS للبورد","بحث مفهرس في مجلة محكمة","إشراف كامل حت[...]"] },
  { emoji: "🎓", title: "زمالة التخصصات الدقيقة", badge: "بورد+", bullets: ["بحث في تخصصك الدقيق","نشر في مجلة Q1 أو Q2","رسالة توصية[...]"] },
  { emoji: "🌍", title: "الزمالات الخارجية", badge: "ERAS / Oriel", bullets: ["بحث منشور بحسابك كمؤلف","CV يلفت نظر المراكز العالمية","م[...]"] },
  { emoji: "📚", title: "الترقية الأكاديمية", badge: "+3 أبحاث", bullets: ["3 أبحاث أكاديمية أو أكثر","نشر في مجلات محكمة","فهرسة Pub[...]"] },
  { emoji: "✈️", title: "الابتعاث الخارجي", badge: "بحوث علمية", bullets: ["بحوث تدعم ملف الابتعاث","نشر دولي موثق","رسائل توصية[...]"] },
  { emoji: "💼", title: "الترقية المهنية", badge: "ملف متميز", bullets: ["ملف مهني يتكلم عنك","نشر في مجلات معترف بها","نقاط CME إضا[...]"] },
];
const partnerFeatures = ["فريق متخصص من الأطباء والباحثين","إشراف كامل من الفكرة حتى النشر","مجلات مفهرسة في PubMed وScopus وWoS","دع[...]"];

export default function Home() {
  const { direction, localize, language } = useLanguage();
  const { data: settings } = useSiteContentSettings();
  const contact = getContactUsHref(settings?.brand);
  const staticEnglish: Record<string, string> = {
    "فرص بحثية للمشاركة والنشر": "Research opportunities for participation and publication",
    "شارك في أبحاث طبية محكمة ومفهرسة دولياً مع إشراف كامل حتى النشر": "Participate in peer-reviewed, internationally indexed medical research w[...]",
    "الأكثر طلباً ⭐": "Most requested ⭐",
    "برنامج تدريب باحث": "Researcher training program",
    "تدريب متكامل على مهارات البحث العلمي مع فرصة نشر حقيقية في نهاية البرنامج": "Comprehensive scientific research skills training wit[...]",
    "دعم النشر في مجلات عالية التصنيف": "Publication support in highly ranked journals",
    "إعداد بحثك للنشر في مجلات Q1 و Q2 المفهرسة في Scopus وWoS وPubMed": "Prepare your research for publication in Q1 and Q2 journals indexed in Scopus, WoS, and [...]",
    "التدقيق والتحليل الإحصائي": "Statistical review and analysis",
    "تحليل إحصائي دقيق ومراجعة علمية شاملة لضمان سلامة البيانات وصحة النتائج": "Precise statistical analysis and comprehensive scientif[...]",
    "وجهتك للتدريب الصحي": "Your destination for health training",
    "برامج تدريب صحي معتمدة تمنحك شهادات معترف بها من الهيئة السعودية للتخصصات الصحية": "Accredited health training programs off[...]",
    "دورات طبية معتمدة CME": "Accredited CME medical courses",
    "دورات طبية معتمدة تمنحك نقاط CME المطلوبة لتجديد اعتمادك المهني": "Accredited medical courses that provide the CME points required to renew [...]",
    "المرجع الأول": "Primary reference", "أكبر قواعد البيانات": "Largest databases", "أعلى التصنيفات": "Highest rankings",
    "البورد السعودي": "Saudi Board", "5 نقاط SCFHS": "5 SCFHS points", "5 نقاط SCFHS للبورد": "5 SCFHS points for the Board", "بحث مفهرس في مجلة محكمة[...]": "Research indexed in a peer-reviewed journal[...],",
    "زمالة التخصصات الدقيقة": "Subspecialty fellowship", "بورد+": "Board+", "بحث في تخصصك الدقيق": "Research in your subspecialty", "نشر في مجلة Q1[...]": "Publish in Q1 journals[...]",
    "الزمالات الخارجية": "International fellowships", "بحث منشور بحسابك كمؤلف": "Published research credited to you as an author", "CV يلفت نظر المرا[...]": "CV that attracts international centers",
    "الترقية الأكاديمية": "Academic promotion", "+3 أبحاث": "3+ studies", "3 أبحاث أكاديمية أو أكثر": "3 or more academic studies", "نشر في مجلات[...]": "Publish in indexed journals[...]",
    "الابتعاث الخارجي": "International scholarship", "بحوث علمية": "Scientific research", "بحوث تدعم ملف الابتعاث": "Research supporting your scholarship[...]",
    "الترقية المهنية": "Professional promotion", "ملف متميز": "Outstanding profile", "ملف مهني يتكلم عنك": "A professional profile that speaks for you", "نش�[...]": "[...]",
    "فريق متخصص من الأطباء والباحثين": "Specialized team of physicians and researchers", "إشراف كامل من الفكرة حتى النشر": "Full supervision fro[...]",
    "فرص مشاركة بحثية في مجلات Q1 و Q2": "Research participation opportunities in Q1 and Q2 journals", "مفهرسة في PubMed / Scopus / WoS / PMC": "Indexed in PubMed / S[...]",
    "تحديد موضوع بحثي مناسب لتخصصه في طب القلب": "Identifying a suitable cardiology research topic", "بناء فريق البحث وتوزيع المهام بد�[...]": "Build a research team and distribute tasks[...]",
    "بحث جاهز بدون نشر؟": "Research ready but unpublished?", "بيانات مجمعة بدون تحليل؟": "Collected data without analysis?", "فكرة بدون فريق؟": "An[...]",
    "المدرّبون والمشاركون": "Trainers and participants", "الفرص البحثية": "Research opportunities", "نسبة النجاح": "Success rate", "مجلة دولية م�[...]": "International journal[...]",
    "نقاط SCFHS": "SCFHS points", "طلاب في المجموعة": "Students in the group", "خصم حتى": "Discount up to", "المجالس الطلابية في كليات الطب وال[...]": "Student councils in medical faculties[...]",
  };
  const s = (arabic: string) => localize(arabic, staticEnglish[arabic]);
  return (
    <div className="min-h-screen bg-white" dir={direction}>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-white py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(12,49,86,0.06)_0%,_transparent_60%)]" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#0C3156]/8 border border-[#0C3156]/15 text-[#0C3156] px-5 py-2 rounded-full text-sm font-semibold mb-7 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#E9A020] animate-pulse" />
            {localize(`${settings?.brand.siteNameAr || "أكاديمية الأبحاث"} · إصدار 2026`, `${settings?.brand.siteNameEn || "Research Academy"} · Edition 2026`)}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight text-slate-900">
            {language === "ar" ? settings?.pages.home.titleAr : settings?.pages.home.titleEn}
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            {language === "ar" ? settings?.pages.home.descriptionAr : settings?.pages.home.descriptionEn}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Link href="/participant-portal" data-testid="button-hero-explore"
              className="bg-[#0C3156] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-[#0a2847] transition-all shadow-lg shadow-[#0C3156]/25 inline-flex items-center gap-2 justify-c[...]
              {localize("استكشف الفرص البحثية", "Explore research opportunities")} <ChevronLeft size={18} />
            </Link>
            <Link href="/about" data-testid="button-hero-about"
              className="border-2 border-[#0C3156]/25 text-[#0C3156] bg-white px-8 py-4 rounded-full font-bold text-base hover:border-[#0C3156]/50 hover:bg-blue-50/50 transition-all inline-flex it[...]
              {localize("تعرف علينا", "Get to know us")} <ChevronLeft size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
               { value: "SCFHS", label: localize("اعتماد رسمي", "Official accreditation"), icon: "🏛️" },
               { value: "500+", label: localize("باحث مسجل", "Registered researchers"), icon: "👨‍⚕️" },
               { value: "50+", label: localize("دراسة مكتملة", "Completed studies"), icon: "📄" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-black text-[#0C3156]">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{s(stat.label)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

{((language === "ar" ? settings?.pages.home.contentAr : settings?.pages.home.contentEn) || "").trim() && (
        <section className="py-12 px-4 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto whitespace-pre-wrap text-slate-700 leading-relaxed">
            {language === "ar" ? settings?.pages.home.contentAr : settings?.pages.home.contentEn}
          </div>
        </section>
      )}

      {/* SERVICES */}
      <section className="py-16 px-4 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#E9A020]/15 border border-[#E9A020]/25 text-[#C47D00] px-4 py-1.5 rounded-full text-sm font-bold mb-3">
               {localize("خدماتنا المتميزة ⭐", "Our distinguished services ⭐")}
            </div>
             <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">{localize("كل ما تحتاجه في مكان واحد", "Everything you need in one place")}</h2>
             <p className="text-slate-500 max-w-xl mx-auto">{localize("خدمات بحثية متكاملة مصممة خصيصاً للأطباء والباحثين في المملكة العر�[...]", "Comprehensive research services tailored for physicians and researchers in the Kingdom")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc) => (
              <div key={svc.title} className="srma-hover-lift rounded-2xl p-6 text-white flex flex-col gap-4 hover:scale-[1.02] transition-transform" style={{ backgroundColor: svc.bg }} data-test[...]
                {svc.badge && (
                  <span className="inline-flex self-start bg-[#E9A020] text-white text-xs font-bold px-3 py-1 rounded-full">{s(svc.badge)}</span>
                )}
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">{svc.icon}</div>
                <div>
                  <h3 className="text-lg font-bold leading-snug">{s(svc.title)}</h3>
                  <p className="text-white/75 text-sm mt-2 leading-relaxed">{s(svc.desc)}</p>
                </div>
                <Link href={svc.href} data-testid={`button-svc-${svc.title.substring(0,6)}`}
                  className="mt-auto inline-flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors border border-white/20"[...]
                  {localize("استكشف الباقة وسجل الآن", "Explore the package and register now")} <ChevronLeft size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UNIVERSITIES */}
      <section className="py-14 px-4 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#0C3156]/8 border border-[#0C3156]/12 text-[#0C3156] px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
               {localize("شركاؤنا الأكاديميون 🤝", "Our academic partners 🤝")}
            </div>
             <h2 className="text-2xl font-black text-slate-900">{localize("يثق بنا باحثون من أكثر من 30 جامعة سعودية وخليجية", "Trusted by researchers from m[...]")}</h2>
          </div>
          <div className="flex justify-center gap-3 flex-wrap mb-6">
            {[...universities,...universities].map((uni, i) => (
              <span key={i} className="flex-shrink-0 bg-[#EFF6FF] border border-[#0C3156]/12 rounded-full px-4 py-2 text-sm font-medium text-[#0C3156] whitespace-nowrap">
                🇸🇦 {uni}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH EXCELLENCE */}
      <section className="py-14 px-4 bg-slate-50/50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#E9A020]/15 border border-[#E9A020]/25 text-[#C47D00] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
             {localize("التميز العلمي 🏆", "Research excellence 🏆")}
          </div>
           <h2 className="text-3xl font-black text-slate-900 mb-3">{localize("حقّق التميّز العلمي وانشر في أقوى المجلات العالمية", "Achieve research exc[...]")}</h2>
           <p className="text-slate-500 max-w-xl mx-auto mb-8">{localize("أبحاثنا مفهرسة في أكبر وأهم قواعد البيانات العلمية الدولية", "Our resea[...]")}</p>
           <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
             {databases.map((db) => (
               <div key={db.name} className="bg-white border border-[#0C3156]/12 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                 <div className="text-xl font-black text-[#0C3156]">{db.name}</div>
                  <div className="text-xs text-slate-500 mt-1.5 font-medium">{s(db.desc)}</div>
               </div>
             ))}
           </div>
           <div className="flex flex-wrap justify-center gap-2">
             {["Cochrane Library","EBSCO","Google Scholar","Ovid","DOAJ","CINAHL"].map((db) => (
               <span key={db} className="bg-white border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">{db}</span>
             ))}
           </div>
         </div>
       </section>

       {/* GOALS */}
       <section className="py-14 px-4 bg-white">
         <div className="max-w-5xl mx-auto">
           <div className="text-center mb-10">
             <div className="inline-flex items-center gap-2 bg-[#0C3156]/8 text-[#0C3156] px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
                🎯 {localize("هدفك الأكاديمي", "Your academic goal")}
             </div>
              <h2 className="text-3xl font-black text-slate-900">{localize("الفائدة حسب هدفك", "Benefits based on your goal")}</h2>
              <p className="text-slate-500 mt-2">{localize("نخصص دعمنا حسب هدفك البحثي والمهني", "We tailor our support to your research and professional goals.")}</p>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
             {goals.map((goal) => (
               <div key={goal.title} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:border-[#0C3156]/25">
                 <div className="flex items-center justify-between mb-3">
                    <span className="bg-[#0C3156]/8 text-[#0C3156] text-xs font-bold px-2.5 py-1 rounded-full border border-[#0C3156]/10">{s(goal.badge)}</span>
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

       {/* COMPLETE PATH */}
       <section className="py-14 px-4 bg-slate-50/50">
         <div className="max-w-3xl mx-auto">
           <div className="bg-gradient-to-br from-[#0C3156] to-[#1A5FAE] rounded-3xl p-8 sm:p-10 text-white text-right shadow-xl">
             <div className="inline-flex items-center gap-2 bg-[#E9A020] text-white px-4 py-1.5 rounded-full text-xs font-bold mb-5">
                {localize("SRMA في 2026 🌟", "SRMA in 2026 🌟")}
             </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-6">{localize("نوّر لك المسار الكامل 🚀", "We illuminate your complete path 🚀")}</h2>
             <ul className="space-y-3 mb-8">
               {[