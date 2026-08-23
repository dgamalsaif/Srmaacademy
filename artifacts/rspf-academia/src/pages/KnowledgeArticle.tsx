import { Link, useParams } from "wouter";
import { ArrowLeft, Calendar, Clock, FileText } from "lucide-react";
import { getKnowledgeArticle } from "@/lib/knowledgeArticles";
import { useLanguage } from "@/lib/i18n";
import { PageSeo, buildPublicUrl } from "@/lib/seo";

export default function KnowledgeArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { language, direction, t } = useLanguage();
  const article = getKnowledgeArticle(slug);

  if (!article) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-4xl flex-col items-center justify-center px-4 text-center">
        <FileText size={42} className="mb-4 text-[#0C3156]" />
        <h1 className="mb-3 text-2xl font-black">{language === "ar" ? "المقال غير موجود" : "Article not found"}</h1>
        <Link href="/knowledge-center" className="font-bold text-[#0C3156] hover:underline">{t("common.backToOpportunities")}</Link>
      </div>
    );
  }

  const content = article.sections[language];
  const title = article.title[language];
  const description = article.excerpt[language];
  const pathname = `/knowledge-center/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: language,
    mainEntityOfPage: buildPublicUrl(pathname, language),
    publisher: { "@type": "Organization", name: "SRMA Research Academy", url: "https://srmaacademy.com" },
  };

  return (
    <article className="min-h-screen bg-white" dir={direction}>
      <PageSeo pathname={pathname} language={language} title={`${title} | SRMA Research Academy`} description={description} jsonLd={jsonLd} />
      <header className="border-b border-slate-100 bg-gradient-to-br from-slate-50 via-blue-50/50 to-white px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <Link href="/knowledge-center" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[#0C3156] hover:underline">
            <ArrowLeft size={16} className={language === "ar" ? "rotate-180" : ""} />
            {language === "ar" ? "العودة إلى مركز المعرفة" : "Back to Knowledge Center"}
          </Link>
          <span className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold ${article.categoryClass}`}>{article.category[language]}</span>
          <h1 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl">{title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Clock size={15} />{article.readTime[language]}</span>
            <span className="inline-flex items-center gap-1.5"><Calendar size={15} />{article.date}</span>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="mb-10 border-s-4 border-[#E9A020] bg-amber-50/60 p-5 text-lg leading-8 text-slate-700">{description}</p>
        <div className="space-y-10">
          {content.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-4 text-2xl font-black text-[#0C3156]">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph} className="mb-4 leading-8 text-slate-700">{paragraph}</p>)}
              {section.bullets && (
                <ul className="space-y-2 rounded-2xl bg-slate-50 p-5 text-slate-700">
                  {section.bullets.map((bullet) => <li key={bullet} className="flex gap-2 leading-7"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#E9A020]" />{bullet}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}