import { CheckCircle2 } from "lucide-react";

const stats = [
  { value: "200+", label: "بحث مدعوم", icon: "📄" },
  { value: "30+", label: "مجلة محكمة", icon: "📚" },
  { value: "50+", label: "فرصة بحثية", icon: "🔬" },
  { value: "500+", label: "مشارك ومتدرب", icon: "👨‍⚕️" },
];

const values = [
  { emoji: "🎓", title: "الجودة الأكاديمية", desc: "نلتزم بأعلى المعايير الأكاديمية الدولية في كل خطوة من خطوات العمل البحثي" },
  { emoji: "💡", title: "الابتكار البحثي", desc: "نعتمد أساليب بحثية متطورة وحلولاً مبتكرة تواكب أحدث التوجهات العلمية العالمية" },
  { emoji: "🤝", title: "التكامل والشراكة", desc: "نبني شراكات متينة مع نخبة من المستشارين والمؤسسات الأكاديمية الرائدة" },
  { emoji: "🏥", title: "الأثر الصحي الوطني", desc: "أبحاثنا تهدف إلى تحقيق أثر إيجابي حقيقي في واقع الرعاية الصحية في المملكة العربية السعودية" },
];

const services = [
  "فرص بحثية للمشاركة والنشر في مجلات Q1 وQ2",
  "برنامج تدريب الباحث مع فرصة نشر حقيقية",
  "دعم النشر في مجلات عالية التصنيف (Scopus / WoS / PubMed)",
  "التدقيق والتحليل الإحصائي الاحترافي",
  "ترجمة أكاديمية وطبية متخصصة",
  "دعم رسائل الماجستير والدكتوراه",
  "التحكيم العلمي للأدوات البحثية",
  "دورات طبية معتمدة CME / SCFHS",
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-white py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#0C3156]/8 border border-[#0C3156]/15 text-[#0C3156] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">عن المنصة</div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">رسالتنا نحو بحث علمي طبي متميز</h1>
          <p className="text-slate-600 text-lg leading-relaxed">SRMA Research Academy هي أكاديمية متخصصة تُعنى بدعم الأطباء والباحثين الصحيين في رحلتهم البحثية من الفكرة حتى النشر الدولي</p>
        </div>
      </section>

      <section className="py-10 px-4 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-5 bg-gradient-to-br from-[#0C3156] to-[#1A5FAE] rounded-2xl shadow-md text-white">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-black">{stat.value}</div>
                <div className="text-blue-200 text-sm mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-right">
          <h2 className="text-2xl font-black text-slate-900 mb-5">منصة أكاديمية سعودية تُعيد تشكيل مسار البحث الطبي</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>انطلقت SRMA Research Academy من قناعة راسخة بأن كل طبيب وباحث صحي في المملكة العربية السعودية يستحق الوصول إلى فرصة بحثية حقيقية تمكّنه من النشر في أرقى المجلات العلمية الدولية.</p>
            <p>نؤمن بأن البحث العلمي الطبي ليس ترفاً أكاديمياً، بل هو ضرورة مهنية تفتح أمام الأطباء أبواب البورد السعودي، والزمالات الخارجية، والترقية الأكاديمية، والابتعاث الدولي.</p>
            <p>لهذا السبب، بنينا منظومة متكاملة من الخدمات البحثية التي تلبي احتياجات كل مرحلة: من اختيار موضوع البحث، مروراً بجمع البيانات والتحليل الإحصائي، وصولاً إلى النشر الدولي والحصول على الشهادات المعتمدة.</p>
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">ما الذي يقودنا</h2>
            <p className="text-slate-500 mt-2">القيم الأساسية التي تُوجّه عملنا وتشكّل هويتنا</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map((val) => (
              <div key={val.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:border-[#0C3156]/25 text-right">
                <div className="text-3xl mb-3">{val.emoji}</div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{val.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-right">
          <h2 className="text-2xl font-black text-slate-900 mb-6">ماذا نقدم؟</h2>
          <ul className="space-y-3">
            {services.map((svc) => (
              <li key={svc} className="flex items-center gap-3 flex-row-reverse bg-[#EFF6FF] border border-[#0C3156]/10 rounded-xl px-5 py-3">
                <CheckCircle2 size={18} className="text-[#0C3156] flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700">{svc}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14 px-4 bg-slate-50/50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-[#1E3A5F] to-[#0C3156] rounded-2xl p-8 text-right text-white shadow-xl">
            <h2 className="text-2xl font-black mb-3 text-[#E9A020]">شركاء رؤية 2030</h2>
            <p className="text-blue-100 leading-relaxed">SRMA Research Academy تدعم رؤية المملكة العربية السعودية 2030 من خلال تطوير قدرات الباحثين الصحيين وتعزيز الإنتاج العلمي الوطني. نسعى إلى بناء جيل من الأطباء الباحثين القادرين على المساهمة في رفع المستوى الصحي وتحقيق التنمية المستدامة.</p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {["بناء المعرفة", "دعم البحث العلمي", "تطوير الكوادر"].map((item) => (
                <div key={item} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                  <span className="text-sm font-semibold text-blue-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
