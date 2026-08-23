import { BookOpen, Clock, Calendar, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { knowledgeArticles } from "@/lib/knowledgeArticles";
import { useLanguage } from "@/lib/i18n";

export default function KnowledgeCenter() {
  const { language, direction, t } = useLanguage();
  const featured = knowledgeArticles.find((article) => article.featured);
  const rest = knowledgeArticles.filter((article) => !article.featured);
  const arrowClass = language === "ar" ? "" : "rotate-180";

  return (
    <div className="min-h-screen bg-white" dir={direction}>
      <section className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-white px-4 py-14 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0C3156]/15 bg-[#0C3156]/8 px-4 py-1.5 text-sm font-semibold text-[#0C3156]">
            {language === "ar" ? "مركز المعرفة" : "Knowledge Center"}
          </div>
          <h1 className="mb-3 text-3xl font-black text-slate-900 sm:text-4xl">
            {language === "ar" ? "مقالات وأدلة لكل باحث طبي" : "Articles and guides for every medical researcher"}
          </h1>
          <p className="mx-auto max-w-xl text-slate-600">
            {language === "ar"
              ? "أدلة عملية عن أبحاث البورد، النشر العلمي، اختيار المجلات والفهرسة الدولية."
              : "Practical guides on board research, scientific publication, journal selection, and international indexing."}
          </p>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-5xl">
          {featured && (
            <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0C3156] to-[#1A5FAE] text-start text-white shadow-xl" data-testid={`card-article-featured-${featured.slug}`}>
              <div className="p-8 sm:p-10">
                <span className="mb-4 inline-block rounded-full bg-[#E9A020] px-3 py-1 text-xs font-bold text-white">{featured.category[language]}</span>
                <h2 className="mb-4 text-xl font-black leading-tight sm:text-2xl">{featured.title[language]}</h2>
                <p className="mb-5 text-sm leading-relaxed text-blue-100">{featured.excerpt[language]}</p>
                <div className="mb-5 flex items-center gap-4 text-xs text-blue-200">
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {featured.readTime[language]}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {featured.date}</span>
                </div>
                <Link href={`/knowledge-center/${featured.slug}`} data-testid="button-read-article-featured" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0C3156] transition-colors hover:bg-blue-50">
                  {language === "ar" ? "اقرأ المقال كاملاً" : "Read the full article"} <ChevronLeft size={14} className={arrowClass} />
                </Link>
              </div>
            </div>
          )}

          <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {rest.map((article) => (
              <Link key={article.slug} href={`/knowledge-center/${article.slug}`} data-testid={`card-article-${article.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 text-start shadow-sm transition-shadow hover:border-[#0C3156]/25 hover:shadow-md">
                <span className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${article.categoryClass}`}>{article.category[language]}</span>
                <h2 className="mb-3 text-base font-bold leading-snug text-slate-900">{article.title[language]}</h2>
                <p className="mb-4 text-xs leading-relaxed text-slate-500">{article.excerpt[language]}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock size={11} /> {article.readTime[language]}</span>
                  <span className="flex items-center gap-1 font-semibold text-[#0C3156]">{language === "ar" ? "اقرأ المزيد" : "Read more"} <ChevronLeft size={12} className={arrowClass} /></span>
                </div>
              </Link>
            ))}
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-[#0C3156] to-[#1A5FAE] p-8 text-center text-white shadow-xl">
            <BookOpen size={36} className="mx-auto mb-4 text-[#E9A020]" />
            <h2 className="mb-2 text-xl font-black">{language === "ar" ? "هل تحتاج إلى دعم احترافي في النشر؟" : "Need professional publication support?"}</h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-blue-100">
              {language === "ar"
                ? "نساعدك في التخطيط لبحثك واختيار المجلة وإعداد المخطوطة؛ والقبول والنشر النهائيان يحددهما المحررون والمراجعون."
                : "We can help plan your study, select a journal, and prepare a manuscript; editors and reviewers determine final acceptance and publication."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="https://wa.me/966562159258" target="_blank" rel="noopener noreferrer" data-testid="button-knowledge-whatsapp" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#1eb856]">
                {t("common.whatsapp")}
              </a>
              <a href="https://t.me/SRMAAcademy" target="_blank" rel="noopener noreferrer" data-testid="button-knowledge-telegram" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                {t("common.telegram")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}