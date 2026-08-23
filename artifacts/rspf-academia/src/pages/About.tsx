import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

type LocalizedText = { ar: string; en: string };

const stats: (LocalizedText & { value: string; icon: string })[] = [
  { value: "200+", ar: "بحث مدعوم", en: "Supported studies", icon: "📄" },
  { value: "30+", ar: "مجلة محكمة", en: "Peer-reviewed journals", icon: "📚" },
  { value: "50+", ar: "فرصة بحثية", en: "Research opportunities", icon: "🔬" },
  { value: "500+", ar: "مشارك ومتدرب", en: "Participants and trainees", icon: "👨‍⚕️" },
];

const values: (LocalizedText & { emoji: string; desc: LocalizedText })[] = [
  { emoji: "🎓", ar: "الجودة الأكاديمية", en: "Academic excellence", desc: { ar: "نلتزم بأعلى المعايير الأكاديمية الدولية في كل خطوة من خطوات العمل البحثي", en: "We uphold the highest international academic standards throughout every stage of research." } },
  { emoji: "💡", ar: "الابتكار البحثي", en: "Research innovation", desc: { ar: "نعتمد أساليب بحثية متطورة وحلولاً مبتكرة تواكب أحدث التوجهات العلمية العالمية", en: "We use advanced research methods and innovative solutions aligned with the latest global scientific trends." } },
  { emoji: "🤝", ar: "التكامل والشراكة", en: "Integration and partnership", desc: { ar: "نبني شراكات متينة مع نخبة من المستشارين والمؤسسات الأكاديمية الرائدة", en: "We build strong partnerships with leading consultants and academic institutions." } },
  { emoji: "🏥", ar: "الأثر الصحي الوطني", en: "National health impact", desc: { ar: "أبحاثنا تهدف إلى تحقيق أثر إيجابي حقيقي في واقع الرعاية الصحية في المملكة العربية السعودية", en: "Our research aims to make a real, positive impact on healthcare in Saudi Arabia." } },
];

const services: LocalizedText[] = [
  { ar: "فرص بحثية للمشاركة والنشر في مجلات Q1 وQ2", en: "Research opportunities for participation and publication in Q1 and Q2 journals" },
  { ar: "برنامج تدريب الباحث مع فرصة نشر حقيقية", en: "Researcher training program with a real publication opportunity" },
  { ar: "دعم النشر في مجلات عالية التصنيف (Scopus / WoS / PubMed)", en: "Publication support in highly ranked journals (Scopus / WoS / PubMed)" },
  { ar: "التدقيق والتحليل الإحصائي الاحترافي", en: "Professional editing and statistical analysis" },
  { ar: "ترجمة أكاديمية وطبية متخصصة", en: "Specialized academic and medical translation" },
  { ar: "دعم رسائل الماجستير والدكتوراه", en: "Master's and doctoral thesis support" },
  { ar: "التحكيم العلمي للأدوات البحثية", en: "Scientific validation of research instruments" },
  { ar: "دورات طبية معتمدة CME / SCFHS", en: "Accredited CME / SCFHS medical courses" },
];

export default function About() {
  const { localize } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-white py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#0C3156]/8 border border-[#0C3156]/15 text-[#0C3156] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">{localize("عن المنصة", "About the platform")}</div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">{localize("رسالتنا نحو بحث علمي طبي متميز", "Our mission for exceptional medical research")}</h1>
          <p className="text-slate-600 text-lg leading-relaxed">{localize("SRMA Research Academy هي أكاديمية متخصصة تُعنى بدعم الأطباء والباحثين الصحيين في رحلتهم البحثية من الفكرة حتى النشر الدولي", "SRMA Research Academy is a specialized academy supporting physicians and health researchers throughout their research journey, from idea to international publication.")}</p>
        </div>
      </section>
      <section className="py-10 px-4 bg-white border-b border-slate-100"><div className="max-w-5xl mx-auto"><div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {stats.map((stat) => <div key={stat.ar} className="text-center p-5 bg-gradient-to-br from-[#0C3156] to-[#1A5FAE] rounded-2xl shadow-md text-white"><div className="text-2xl mb-2">{stat.icon}</div><div className="text-3xl font-black">{stat.value}</div><div className="text-blue-200 text-sm mt-2 font-medium">{localize(stat.ar, stat.en)}</div></div>)}
      </div></div></section>
      <section className="py-14 px-4 bg-white"><div className="max-w-3xl mx-auto text-right">
        <h2 className="text-2xl font-black text-slate-900 mb-5">{localize("منصة أكاديمية سعودية تُعيد تشكيل مسار البحث الطبي", "A Saudi academic platform reshaping medical research")}</h2>
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>{localize("انطلقت SRMA Research Academy من قناعة راسخة بأن كل طبيب وباحث صحي في المملكة العربية السعودية يستحق الوصول إلى فرصة بحثية حقيقية تمكّنه من النشر في أرقى المجلات العلمية الدولية.", "SRMA Research Academy was founded on the firm belief that every physician and health researcher in Saudi Arabia deserves access to a genuine research opportunity that enables publication in the world's leading scientific journals.")}</p>
          <p>{localize("نؤمن بأن البحث العلمي الطبي ليس ترفاً أكاديمياً، بل هو ضرورة مهنية تفتح أمام الأطباء أبواب البورد السعودي، والزمالات الخارجية، والترقية الأكاديمية، والابتعاث الدولي.", "We believe that medical research is not an academic luxury, but a professional necessity that opens doors to the Saudi Board, international fellowships, academic promotion, and overseas scholarships.")}</p>
          <p>{localize("لهذا السبب، بنينا منظومة متكاملة من الخدمات البحثية التي تلبي احتياجات كل مرحلة: من اختيار موضوع البحث، مروراً بجمع البيانات والتحليل الإحصائي، وصولاً إلى النشر الدولي والحصول على الشهادات المعتمدة.", "That is why we built an integrated research-services ecosystem for every stage: from selecting a research topic and collecting data to statistical analysis, international publication, and accredited certificates.")}</p>
        </div>
      </div></section>
      <section className="py-14 px-4 bg-slate-50/50"><div className="max-w-5xl mx-auto"><div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{localize("ما الذي يقودنا", "What drives us")}</h2><p className="text-slate-500 mt-2">{localize("القيم الأساسية التي تُوجّه عملنا وتشكّل هويتنا", "The core values that guide our work and shape our identity")}</p>
      </div><div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{values.map((val) => <div key={val.ar} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:border-[#0C3156]/25 text-right"><div className="text-3xl mb-3">{val.emoji}</div><h3 className="font-bold text-lg text-slate-900 mb-2">{localize(val.ar, val.en)}</h3><p className="text-sm text-slate-600 leading-relaxed">{localize(val.desc.ar, val.desc.en)}</p></div>)}</div></div></section>
      <section className="py-14 px-4 bg-white"><div className="max-w-3xl mx-auto text-right"><h2 className="text-2xl font-black text-slate-900 mb-6">{localize("ماذا نقدم؟", "What we offer")}</h2><ul className="space-y-3">{services.map((service) => <li key={service.ar} className="flex items-center gap-3 flex-row-reverse bg-[#EFF6FF] border border-[#0C3156]/10 rounded-xl px-5 py-3"><CheckCircle2 size={18} className="text-[#0C3156] flex-shrink-0" /><span className="text-sm font-medium text-slate-700">{localize(service.ar, service.en)}</span></li>)}</ul></div></section>
      <section className="py-14 px-4 bg-slate-50/50"><div className="max-w-3xl mx-auto"><div className="bg-gradient-to-br from-[#1E3A5F] to-[#0C3156] rounded-2xl p-8 text-right text-white shadow-xl">
        <h2 className="text-2xl font-black mb-3 text-[#E9A020]">{localize("شركاء رؤية 2030", "Vision 2030 partners")}</h2><p className="text-blue-100 leading-relaxed">{localize("SRMA Research Academy تدعم رؤية المملكة العربية السعودية 2030 من خلال تطوير قدرات الباحثين الصحيين وتعزيز الإنتاج العلمي الوطني. نسعى إلى بناء جيل من الأطباء الباحثين القادرين على المساهمة في رفع المستوى الصحي وتحقيق التنمية المستدامة.", "SRMA Research Academy supports Saudi Vision 2030 by developing health researchers' capabilities and advancing national scientific output. We seek to build a generation of physician-researchers able to improve health standards and achieve sustainable development.")}</p>
        <div className="mt-6 grid grid-cols-3 gap-4">{[{ ar: "بناء المعرفة", en: "Building knowledge" }, { ar: "دعم البحث العلمي", en: "Supporting research" }, { ar: "تطوير الكوادر", en: "Developing talent" }].map((item) => <div key={item.ar} className="bg-white/10 rounded-xl p-3 text-center border border-white/10"><span className="text-sm font-semibold text-blue-100">{localize(item.ar, item.en)}</span></div>)}</div>
      </div></div></section>
    </div>
  );
}