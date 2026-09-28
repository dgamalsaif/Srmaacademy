import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { ChevronLeft, Users, Clock, BookOpen, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";
import { ResearchOpportunity } from "@/lib/researchData";
import RegistrationModal from "@/components/RegistrationModal";
import { DEFAULT_SITE_CONTENT_SETTINGS, SiteContentSettings, getContactUsHref } from "@/lib/siteContentSettings";
import OpportunityMedia from "@/components/OpportunityMedia";
import OpportunityPrice from "@/components/OpportunityPrice";
import { OpportunityCurrency, RESEARCH_STATUS_LABELS } from "@/lib/opportunityPricing";
import { useLanguage } from "@/lib/i18n";
import { useSiteContentSettings } from "@/hooks/use-site-content-settings";
import { PageSeo } from "@/lib/seo";

export default function ResearchDetail() {
  const { direction, language, localize, t } = useLanguage();
  const params = useParams<{ id: string }>();
  const [research, setResearch] = useState<ResearchOpportunity | null>(null);
  const [allResearch, setAllResearch] = useState<ResearchOpportunity[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currency, setCurrency] = useState<OpportunityCurrency>("SAR");
  const { data: contentSettings = DEFAULT_SITE_CONTENT_SETTINGS } = useSiteContentSettings();

  const loadResearch = () => {
    fetch("/api/programs", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("programs unavailable")))
      .then((data: ResearchOpportunity[]) => {
        setAllResearch(data);
        setResearch(data.find((item) => item.id === parseInt(params.id || "0")) || null);
      })
      .catch(() => { setAllResearch([]); setResearch(null); });
  };

  useEffect(() => {
    loadResearch();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") loadResearch();
    };
    window.addEventListener("focus", loadResearch);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", loadResearch);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [params.id]);

  if (!research) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-slate-700 mb-3">{localize("الفرصة البحثية غير موجودة", "Research opportunity not found")}</h2>
          <Link href="/participant-portal" className="text-[#0C3156] font-semibold hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={16} /> {t("common.backToOpportunities")}
          </Link>
        </div>
      </div>
    );
  }

  const seatsUsed = research.totalSeats - research.seatsLeft;
  const pct = research.totalSeats > 0 ? Math.round((seatsUsed / research.totalSeats) * 100) : 0;
  const isCompletedResearch = research.category === "completed";
  const statusLabel = localize(RESEARCH_STATUS_LABELS[research.status] || "دراسة منجزة", ({
    ethics_approved: "Ethics approved", under_review: "Under review", completed: "Completed study",
  } as Record<string, string>)[research.status], research.status);
  const title = research.titleEn || research.title;
  const specialty = localize(research.specialtyAr, research.specialtyEn, research.specialty);
  const description = localize(research.descriptionAr, research.descriptionEn, research.description);
  const contentFlow = direction === "rtl" ? "flex-row-reverse" : "flex-row";
  const siteName = language === "ar" ? contentSettings.brand.siteNameAr : contentSettings.brand.siteNameEn;

  const contact = getContactUsHref(contentSettings.brand);

  return (
    <>
      <PageSeo pathname={`/research/${research.id}`} language={language} title={`${title} | ${siteName}`} description={description} />
      <div className="min-h-screen bg-white" dir={direction}>
      {/* BREADCRUMB */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">

        <div className={`mx-auto max-w-5xl mb-4 ${contentFlow}`}>
          <h1 className="text-2xl font-black text-slate-900 mb-1">{language === "ar" ? contentSettings.pages.researchDetail.titleAr : contentSettings.pages.researchDetail.titleEn}</h1>
          <p className="text-slate-600 text-sm">{language === "ar" ? contentSettings.pages.researchDetail.descriptionAr : contentSettings.pages.researchDetail.descriptionEn}</p>
        </div>
{((language === "ar" ? contentSettings?.pages.researchDetail.contentAr : contentSettings?.pages.researchDetail.contentEn) || "").trim() && (
        <section className="mx-auto max-w-5xl mb-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="max-w-4xl mx-auto whitespace-pre-wrap text-slate-700 leading-relaxed">
            {language === "ar" ? contentSettings?.pages.researchDetail.contentAr : contentSettings?.pages.researchDetail.contentEn}
          </div>
        </section>
      )}
        <div className={`mx-auto flex max-w-5xl items-center gap-2 text-sm text-slate-500 ${contentFlow}`}>
          <span className="text-slate-400">›</span>
          <Link href="/participant-portal" className="hover:text-[#0C3156] transition-colors">{localize("بوابة المشارك", "Participant Portal")}</Link>
          <span className="text-slate-400">›</span>
          <Link href="/" className="hover:text-[#0C3156] transition-colors">{localize("الرئيسية", "Home")}</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0C3156] to-[#1A5FAE] p-7 text-start text-white">
              <div className={`mb-4 flex items-center gap-3 ${contentFlow}`}>
                <span className={`text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white`}>
                  {specialty}
                </span>
                {isCompletedResearch || research.status === "ethics_approved" || research.status === "under_review" ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-400 text-[#0C3156]">
                    {statusLabel}
                  </span>
                ) : research.status === "open" && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E9A020] text-white">
                    {localize("مفتوح للتسجيل ✓", "Open for registration ✓")}
                  </span>
                )}
                {research.status === "closed" && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500 text-white">
                    {localize("مغلق 🔒", "Closed 🔒")}
                  </span>
                )}
                {research.status === "draft" && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-400 text-white">
                    {localize("مسودة", "Draft")}
                  </span>
                )}
              </div>
              <h1 className="mb-2 text-left text-xl font-black leading-snug sm:text-2xl" dir="ltr">{title}</h1>
              <p className="text-blue-200 text-sm">{localize("تاريخ الإضافة:", "Date added:")} {research.createdAt}</p>
            </div>
            <OpportunityMedia research={research} className="aspect-[4/3] min-h-[240px]" />

            {/* Description */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-start shadow-sm">
              <h2 className={`mb-3 flex items-center gap-2 text-lg font-black text-slate-900 ${contentFlow}`}>
                <BookOpen size={20} className="text-[#0C3156]" />
                {localize("وصف الدراسة", "Study description")}
              </h2>
              <p className="text-slate-600 leading-relaxed">{localize(research.descriptionAr, research.descriptionEn, research.description)}</p>
            </div>

            {/* Benefits */}
            <div className="rounded-2xl border border-[#0C3156]/12 bg-[#EFF6FF] p-6 text-start shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-4">{isCompletedResearch ? localize("تفاصيل ومخرجات الدراسة", "Study details and outcomes") : localize("مزا[...]","Study benefits")}</h2>
              <ul className="space-y-3">
                {research.benefits.map((b) => (
                  <li key={b} className={`flex items-center gap-3 ${contentFlow}`}>
                    <CheckCircle2 size={18} className="text-[#0C3156] flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Indexed in */}
            {research.indexedIn.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-start shadow-sm">
                <h2 className="text-lg font-black text-slate-900 mb-4">{localize("مفهرسة في", "Indexed in")}</h2>
                <div className={`flex flex-wrap gap-2 ${contentFlow}`}>
                  {research.indexedIn.map((db) => (
                    <span key={db} className="bg-[#0C3156] text-white text-sm font-bold px-4 py-1.5 rounded-full">{db}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-5">
            <div className="sticky top-20 rounded-2xl border-2 border-[#0C3156]/15 bg-white p-6 text-start shadow-md">
              <h3 className="text-lg font-black text-slate-900 mb-4">{isCompletedResearch ? localize("تفاصيل الدراسة", "Study details") : localize("تفاصيل الفرصة", "Opportunity details")}</h3>

              <div className="space-y-3 mb-5">
                <div className={`flex items-center justify-between border-b border-slate-100 py-2 ${contentFlow}`}>
                  <span className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Users size={14} />
                    {localize("المقاعد المتاحة", "Available seats")}
                  </span>
                  <span className="font-bold text-slate-900">
                    {research.seatsLeft} / {research.totalSeats}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs">
                  <div className="flex justify-between gap-2 font-bold text-amber-700"><span>{localize("الكاتب الأول", "First author")}</span><span>{localize(`${research.firstAuthorSea[...]
