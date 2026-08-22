import { BookOpen, Clock, Calendar, ChevronLeft } from "lucide-react";

const articles = [
  { id: 1, category: "نقاط البورد والهاتشي", categoryClass: "bg-[#0C3156]/10 text-[#0C3156] border border-[#0C3156]/12", title: "اعتماد نقاط البحث العلمي في Matching 2026 — كيف تحقّق 5 نقاط الفارق", excerpt: "كل ما تحتاج معرفته عن نقاط SCFHS للبحث العلمي وكيف تؤثر على ترتيبك في Matching البورد السعودي لعام 2026. دليل شامل ومحدث مع آخر التعديلات.", readTime: "4 دقائق", date: "7 مايو 2026", featured: true },
  { id: 2, category: "إرشادات النشر", categoryClass: "bg-blue-50 text-blue-700 border border-blue-100", title: "كيف تختار موضوع البحث المناسب لتخصصك؟", excerpt: "دليل عملي لاختيار موضوع بحثي مناسب يخدم أهدافك المهنية ويزيد فرص القبول في المجلات العالمية.", readTime: "5 دقائق", date: "1 مايو 2026", featured: false },
  { id: 3, category: "المجلات العلمية", categoryClass: "bg-purple-50 text-purple-700 border border-purple-100", title: "الفرق بين Q1 وQ2 وكيف تختار المجلة الأنسب لبحثك؟", excerpt: "شرح مبسط للتصنيفات العلمية للمجلات وكيف تختار المجلة المناسبة لتخصصك وهدفك البحثي.", readTime: "6 دقائق", date: "24 أبريل 2026", featured: false },
  { id: 4, category: "نصائح بحثية", categoryClass: "bg-orange-50 text-orange-700 border border-orange-100", title: "أشهر أخطاء الباحثين الجدد وكيف تتجنبها؟", excerpt: "تعرّف على أكثر الأخطاء شيوعاً التي يقع فيها الباحثون المبتدئون وكيف يتجنبها المحترفون.", readTime: "7 دقائق", date: "17 أبريل 2026", featured: false },
];

export default function KnowledgeCenter() {
  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-white py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#0C3156]/8 border border-[#0C3156]/15 text-[#0C3156] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            مركز المعرفة
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">مقالات وأدلة لكل باحث طبي</h1>
          <p className="text-slate-600 max-w-xl mx-auto">محتوى بحثي متخصص يساعدك على فهم عالم النشر العلمي وتطوير مهاراتك البحثية</p>
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {featured && (
            <div className="bg-gradient-to-br from-[#0C3156] to-[#1A5FAE] rounded-3xl overflow-hidden mb-8 shadow-xl text-right" data-testid={`card-article-featured-${featured.id}`}>
              <div className="p-8 sm:p-10 text-white">
                <span className="inline-block bg-[#E9A020] text-white text-xs font-bold px-3 py-1 rounded-full mb-4">{featured.category}</span>
                <h2 className="text-xl sm:text-2xl font-black leading-tight mb-4">{featured.title}</h2>
                <p className="text-blue-100 leading-relaxed mb-5 text-sm">{featured.excerpt}</p>
                <div className="flex items-center gap-4 flex-row-reverse text-blue-200 text-xs mb-5">
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {featured.readTime}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {featured.date}</span>
                </div>
                <button data-testid={`button-read-article-${featured.id}`}
                  className="inline-flex items-center gap-2 bg-white text-[#0C3156] px-5 py-2.5 rounded-full font-bold text-sm hover:bg-blue-50 transition-colors">
                  اقرأ المقال كاملاً <ChevronLeft size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {rest.map((article) => (
              <div key={article.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow hover:border-[#0C3156]/25" data-testid={`card-article-${article.id}`}>
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${article.categoryClass}`}>{article.category}</span>
                <h3 className="font-bold text-slate-900 text-right leading-snug mb-3 text-sm">{article.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed text-right mb-4 line-clamp-3">{article.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <button data-testid={`button-read-more-${article.id}`} className="text-[#0C3156] font-semibold hover:underline flex items-center gap-1">
                    اقرأ المزيد <ChevronLeft size={12} />
                  </button>
                  <span className="flex items-center gap-1"><Clock size={11} /> {article.readTime}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-[#0C3156] to-[#1A5FAE] rounded-3xl p-8 text-center text-white shadow-xl">
            <BookOpen size={36} className="mx-auto mb-4 text-[#E9A020]" />
            <h3 className="text-xl font-black mb-2">هل تحتاج إلى دعم احترافي في النشر؟</h3>
            <p className="text-blue-100 mb-6 max-w-md mx-auto text-sm">فريق SRMA يشرف على بحثك من الفكرة حتى النشر في مجلات Q1 وQ2 المفهرسة دولياً</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="https://wa.me/966562159258" target="_blank" rel="noopener noreferrer" data-testid="button-knowledge-whatsapp"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#1eb856] transition-colors shadow-md">
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                واتساب
              </a>
              <a href="https://t.me/SRMAAcademy" target="_blank" rel="noopener noreferrer" data-testid="button-knowledge-telegram"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-white/10 transition-colors">
                Telegram ←
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
