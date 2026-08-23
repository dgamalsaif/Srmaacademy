import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { ChevronLeft, Users, Clock, BookOpen, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";
import { ResearchOpportunity } from "@/lib/researchData";
import RegistrationModal from "@/components/RegistrationModal";
import { DEFAULT_SITE_CONTENT_SETTINGS, SiteContentSettings } from "@/lib/siteContentSettings";
import OpportunityMedia from "@/components/OpportunityMedia";
import OpportunityPrice from "@/components/OpportunityPrice";
import { OpportunityCurrency, RESEARCH_STATUS_LABELS } from "@/lib/opportunityPricing";
import { useLanguage } from "@/lib/i18n";
import { PageSeo } from "@/lib/seo";

export default function ResearchDetail() {
  const { direction, language, localize, t } = useLanguage();
  const params = useParams<{ id: string }>();
  const [research, setResearch] = useState<ResearchOpportunity | null>(null);
  const [allResearch, setAllResearch] = useState<ResearchOpportunity[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currency, setCurrency] = useState<OpportunityCurrency>("SAR");
  const [contentSettings, setContentSettings] = useState<SiteContentSettings>(DEFAULT_SITE_CONTENT_SETTINGS);

  const loadResearch = () => {
    fetch("/api/programs")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("programs unavailable")))
      .then((data: ResearchOpportunity[]) => {
        setAllResearch(data);
        setResearch(data.find((item) => item.id === parseInt(params.id || "0")) || null);
      })
      .catch(() => { setAllResearch([]); setResearch(null); });
  };

  useEffect(() => {
    loadResearch();
    fetch("/api/site-content-settings")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((settings: SiteContentSettings) => setContentSettings(settings))
      .catch(() => setContentSettings(DEFAULT_SITE_CONTENT_SETTINGS));
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
  const title = localize(research.titleAr, research.titleEn, research.title);
  const specialty = localize(research.specialtyAr, research.specialtyEn, research.specialty);
  const description = localize(research.descriptionAr, research.descriptionEn, research.description);

  return (
    <>
      <PageSeo pathname={`/research/${research.id}`} language={language} title={`${title} | SRMA Research Academy`} description={description} />
      <div className="min-h-screen bg-white" dir={direction}>
      {/* BREADCRUMB */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-slate-500 flex-row-reverse">
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
            <div className="bg-gradient-to-br from-[#0C3156] to-[#1A5FAE] rounded-2xl p-7 text-white text-right">
              <div className="flex items-center gap-3 flex-row-reverse mb-4">
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
              <h1 className="text-xl sm:text-2xl font-black leading-snug mb-2 whitespace-pre-line">{contentSettings.participantTitleLanguage === "both" ? `${research.titleAr || research.title}\n${research.titleEn || research.title}` : title}</h1>
              <p className="text-blue-200 text-sm">{localize("تاريخ الإضافة:", "Date added:")} {research.createdAt}</p>
            </div>
            <OpportunityMedia research={research} className="h-[320px] sm:h-[420px]" />

            {/* Description */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-right shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2 flex-row-reverse">
                <BookOpen size={20} className="text-[#0C3156]" />
                {localize("وصف الدراسة", "Study description")}
              </h2>
              <p className="text-slate-600 leading-relaxed">{localize(research.descriptionAr, research.descriptionEn, research.description)}</p>
            </div>

            {/* Benefits */}
            <div className="bg-[#EFF6FF] border border-[#0C3156]/12 rounded-2xl p-6 text-right shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-4">{isCompletedResearch ? localize("تفاصيل ومخرجات الدراسة", "Study details and outcomes") : localize("مزايا وقيمة المشاركة 💡", "Benefits and participation value 💡")}</h2>
              <ul className="space-y-3">
                {research.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 flex-row-reverse">
                    <CheckCircle2 size={18} className="text-[#0C3156] flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Indexed in */}
            {research.indexedIn.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-right shadow-sm">
                <h2 className="text-lg font-black text-slate-900 mb-4">{localize("مفهرسة في", "Indexed in")}</h2>
                <div className="flex flex-wrap gap-2 flex-row-reverse">
                  {research.indexedIn.map((db) => (
                    <span key={db} className="bg-[#0C3156] text-white text-sm font-bold px-4 py-1.5 rounded-full">{db}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-5">
            <div className="bg-white border-2 border-[#0C3156]/15 rounded-2xl p-6 text-right shadow-md sticky top-20">
              <h3 className="text-lg font-black text-slate-900 mb-4">{isCompletedResearch ? localize("تفاصيل الدراسة", "Study details") : localize("تفاصيل الفرصة", "Opportunity details")}</h3>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between flex-row-reverse py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Users size={14} />
                    {localize("المقاعد المتاحة", "Available seats")}
                  </span>
                  <span className="font-bold text-slate-900">
                    {research.seatsLeft} / {research.totalSeats}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs">
                  <div className="flex justify-between gap-2 font-bold text-amber-700"><span>{localize("الكاتب الأول", "First author")}</span><span>{localize(`${research.firstAuthorSeatsLeft ?? 1} متاح من ${research.firstAuthorSeats ?? 1}`, `${research.firstAuthorSeatsLeft ?? 1} available of ${research.firstAuthorSeats ?? 1}`)}</span></div>
                  <div className="mt-1.5 flex justify-between gap-2 font-bold text-emerald-700"><span>{localize("المؤلفون المشاركون", "Co-authors")}</span><span>{localize(`${research.coAuthorSeatsLeft ?? 14} متاح من ${research.coAuthorSeats ?? 14}`, `${research.coAuthorSeatsLeft ?? 14} available of ${research.coAuthorSeats ?? 14}`)}</span></div>
                </div>
                <div className="flex items-center justify-between flex-row-reverse py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Clock size={14} />
                    {localize("مدة الدراسة", "Study duration")}
                  </span>
                  <span className="font-bold text-slate-900">{research.duration}</span>
                </div>
                <div className="py-2 border-b border-slate-100 text-right">
                  <span className="text-sm text-slate-500 block mb-1">{isCompletedResearch ? localize("المجلة أو جهة النشر", "Journal or publishing venue") : localize("المجلة المستهدفة", "Target journal")}</span>
                  <span className="font-semibold text-slate-800 text-sm">{research.journalTarget || "—"}</span>
                  {research.journalIssn && <span className="mt-1 block text-xs font-medium text-slate-500" dir="ltr">ISSN: {research.journalIssn}</span>}
                </div>
                {(research.journalPubmed || research.journalScopus || research.journalWos) && <div className="py-2 border-b border-slate-100 text-right">
                  <span className="text-sm text-slate-500 block mb-2">{localize("الفهرسة والتصنيف", "Indexing and ranking")}</span>
                  <div className="flex flex-wrap justify-end gap-2">
                    {research.journalPubmed && <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">PubMed: {research.journalPubmed}</span>}
                    {research.journalScopus && <span className="rounded-lg bg-orange-50 px-2 py-1 text-xs font-bold text-orange-700">Scopus: {research.journalScopus}</span>}
                    {research.journalWos && <span className="rounded-lg bg-violet-50 px-2 py-1 text-xs font-bold text-violet-700">WOS: {research.journalWos}</span>}
                  </div>
                </div>}
                <div className="py-2 text-right">
                  <span className="text-sm text-slate-500 block mb-1">{localize("المشرف", "Supervisor")}</span>
                  <span className="font-semibold text-[#0C3156] text-sm">{research.supervisor || "—"}</span>
                </div>
              </div>

              {!isCompletedResearch && <div className="mb-5"><OpportunityPrice originalSar={research.priceOriginalSar} discountedSar={research.priceDiscountedSar} currency={currency} onCurrencyChange={setCurrency} /></div>}

              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-slate-500 mb-2 flex-row-reverse">
                  <span>{localize(`تبقى ${research.seatsLeft} من أصل ${research.totalSeats}`, `${research.seatsLeft} of ${research.totalSeats} remain`)}</span>
                  <span>{localize(`${pct}% ممتلئ`, `${pct}% filled`)}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-l from-[#0C3156] to-[#1A5FAE] rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {research.status === "open" ? (
                <button
                  data-testid="button-detail-register"
                  onClick={() => setModalOpen(true)}
                  className="w-full bg-[#0C3156] text-white font-bold py-3.5 rounded-xl hover:bg-[#0a2847] transition-colors text-base shadow-sm mb-3"
                >
                  {t("common.registerNow")} 👤
                </button>
              ) : (
                <div className="w-full bg-slate-100 text-slate-500 font-bold py-3.5 rounded-xl text-center text-base mb-3">
                  🔒 {localize("مغلق التسجيل", "Registration closed")}
                </div>
              )}

              <a
                href="https://wa.me/966562159258"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-detail-whatsapp"
                className="w-full border border-[#0C3156]/25 text-[#0C3156] font-semibold py-2.5 rounded-xl text-sm text-center hover:bg-[#0C3156]/5 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} />
                {localize("تواصل معنا", "Contact us")}
              </a>
            </div>
          </div>
        </div>

        {/* RELATED */}
        {allResearch.filter((r) => r.id !== research.id && r.status === "open").length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-black text-slate-900 text-right mb-5">{localize("فرص بحثية أخرى", "Other research opportunities")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allResearch.filter((r) => r.id !== research.id && r.status === "open").slice(0, 3).map((r) => (
                <Link key={r.id} href={`/research/${r.id}`} data-testid={`card-related-${r.id}`}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow hover:border-[#0C3156]/25 block">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block mb-3 ${r.specialtyColor}`}>
                    {localize(r.specialtyAr, r.specialtyEn, r.specialty)}
                  </span>
                  <p className="font-semibold text-slate-800 text-sm line-clamp-2 text-right mb-3">{localize(r.titleAr, r.titleEn, r.title)}</p>
                  <div className="flex items-center justify-between flex-row-reverse text-xs text-slate-500">
                    <span>{localize(`${r.seatsLeft} مقعد متبقي`, `${r.seatsLeft} seats remaining`)}</span>
                    <span className="text-[#0C3156] font-semibold flex items-center gap-1">
                      {localize("عرض التفاصيل", "View details")} <ChevronLeft size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <RegistrationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} researchTitle={title} researchId={research.id} firstAuthorSeatsLeft={research.firstAuthorSeatsLeft} coAuthorSeatsLeft={research.coAuthorSeatsLeft} onRegistered={loadResearch} />
      </div>
    </>
  );
}
