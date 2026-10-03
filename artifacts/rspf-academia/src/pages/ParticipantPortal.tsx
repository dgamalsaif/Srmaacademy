import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Lock, Flame, ChevronLeft, ChevronRight, MessageCircle, ExternalLink, Send, Phone, LayoutGrid, SlidersHorizontal, Copy, Mail, Check } from "lucide-react";
import { Link } from "wouter";
import { ResearchOpportunity } from "@/lib/researchData";
import RegistrationModal from "@/components/RegistrationModal";
import { DEFAULT_SITE_CONTENT_SETTINGS, SiteContentSettings, getContactUsHref, getOpportunityInquiryLink } from "@/lib/siteContentSettings";
import OpportunityMedia from "@/components/OpportunityMedia";
import OpportunityPrice from "@/components/OpportunityPrice";
import { OpportunityCurrency, useCurrency } from "@/lib/opportunityPricing";
import { useLanguage } from "@/lib/i18n";
import SpecialtyFilter, { buildSpecialtyOptions, canonicalSpecialty, specialtyMatches } from "@/components/SpecialtyFilter";
import { ResearchProtectionBanner, ProtectedResearchWatermark, AntiCaptureResearchTitle } from "@/components/ResearchProtection";

const hallOfFame = [
  { specialty: "ENT – Head and Neck Surgery", specialtyColor: "bg-indigo-100 text-indigo-700", title: "Efficacy of Biologic Therapy versus Conventional Treatment in Chronic Rhinosinusitis" },
  { specialty: "Obesity Surgery", specialtyColor: "bg-yellow-100 text-yellow-700", title: "Endoscopic Versus Surgical Bariatric Procedures: Long-term Outcomes Comparison" },
  { specialty: "Anesthesiology", specialtyColor: "bg-emerald-100 text-emerald-700", title: "Comparative Effectiveness of Regional vs. General Anesthesia in Major Orthopedic Procedures" },
  { specialty: "Clinical Cardiology", specialtyColor: "bg-red-100 text-red-700", title: "Comparative Efficacy and Safety of Patiromer vs. Sodium Zirconium Cyclosilicate" },
];

export default function ParticipantPortal() {
  const { direction, language, localize, t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedOppId, setCopiedOppId] = useState<number | null>(null);

  const handleCopyOppLink = (oppId: number) => {
    const url = `${window.location.origin}/survey?rid=RES-2026-${oppId}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    } else {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopiedOppId(oppId);
    setTimeout(() => setCopiedOppId(null), 2500);
  };
  const [selectedResearch, setSelectedResearch] = useState<ResearchOpportunity | null>(null);
  const [opportunities, setOpportunities] = useState<ResearchOpportunity[]>([]);
  const { currency, setCurrency } = useCurrency();
  const [contentSettings, setContentSettings] = useState<SiteContentSettings>(DEFAULT_SITE_CONTENT_SETTINGS);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<"grid" | "scroll">("grid");

  const refreshOpportunities = () => {
    fetch("/api/programs", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("programs unavailable")))
      .then((data: ResearchOpportunity[]) => {
        const available = data.filter((item) => item.status === "open" && (item.category || "active") === "active");
        setOpportunities(uniqueResearchOpportunities(available));
      })
      .catch(() => setOpportunities([]));
  };

  useEffect(() => {
    refreshOpportunities();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshOpportunities();
    };
    window.addEventListener("focus", refreshOpportunities);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    fetch("/api/site-content-settings")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((settings: SiteContentSettings) => {
        setContentSettings(settings);
        if (settings.opportunityDisplayMode) {
          setDisplayMode(settings.opportunityDisplayMode);
        }
      })
      .catch(() => setContentSettings(DEFAULT_SITE_CONTENT_SETTINGS));
    return () => {
      window.removeEventListener("focus", refreshOpportunities);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedCards((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const openModal = (research: ResearchOpportunity) => { setSelectedResearch(research); setModalOpen(true); };
  const displayTitle = (research: ResearchOpportunity) => research.titleEn || research.title;
  const participantTitle = language === "en" ? contentSettings.pages.participant.titleEn : contentSettings.pages.participant.titleAr;
  const participantDescription = language === "en" ? contentSettings.pages.participant.descriptionEn : contentSettings.pages.participant.descriptionAr;
  const siteName = language === "en" ? contentSettings.brand.siteNameEn : contentSettings.brand.siteNameAr;
  const whatsappUrl = `https://wa.me/${contentSettings.brand.participantWhatsapp || contentSettings.brand.whatsapp || "966562159258"}`;
  const contactHref = getContactUsHref(contentSettings.brand);

  const specialtyOptions = buildSpecialtyOptions(contentSettings.specialtyOptions, opportunities);
  const displaySpecialty = (opportunity: ResearchOpportunity) => {
    const canonical = canonicalSpecialty(opportunity.specialtyAr || opportunity.specialty, opportunity.specialtyEn || opportunity.specialty);
    return specialtyOptions.find((option) => option.id === canonical.id) || canonical;
  };
  const visibleOpportunities = opportunities.filter((opportunity) => specialtyMatches(opportunity, selectedSpecialty));
  const groupedOpportunities = specialtyOptions
    .map((option) => {
      const specialty = option.nameEn || option.nameAr;
      return {
        id: option.id,
        label: localize(option.nameAr, option.nameEn),
        items: visibleOpportunities.filter((opportunity) => specialtyMatches(opportunity, specialty)),
      };
    })
    .filter((group) => group.items.length > 0);
  const groupedOpportunityIds = new Set(groupedOpportunities.flatMap((group) => group.items.map((opportunity) => opportunity.id)));
  const ungroupedOpportunities = visibleOpportunities.filter((opportunity) => !groupedOpportunityIds.has(opportunity.id));
  if (ungroupedOpportunities.length > 0) {
    groupedOpportunities.push({
      id: "other-specialties",
      label: localize("تخصصات أخرى", "Other specialties"),
      items: ungroupedOpportunities,
    });
  }
  const opportunityOrder = (opportunity: ResearchOpportunity) => opportunity.displayOrder ?? Number.MAX_SAFE_INTEGER;
  groupedOpportunities.forEach((group) => {
    group.items.sort((a, b) => opportunityOrder(a) - opportunityOrder(b) || (a.titleEn || a.title).localeCompare(b.titleEn || b.title));
  });
  groupedOpportunities.sort((a, b) => {
    const orderA = Math.min(...a.items.map(opportunityOrder));
    const orderB = Math.min(...b.items.map(opportunityOrder));
    return orderA - orderB || a.label.localeCompare(b.label);
  });
  const isSpecialtyScroll = displayMode === "scroll";
  const contentFlow = direction === "rtl" ? "flex-row-reverse" : "flex-row";

  return (
      <div className="min-h-screen bg-white w-full max-w-full overflow-x-clip" dir={direction}>
      {/* HEADER */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50/80 via-white to-white py-12 px-4 sm:py-16">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3.5 py-1.5 text-xs font-black text-[#117b59] mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#117b59] animate-pulse" />
            <span>{participantTitle}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            {participantTitle}
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {participantDescription}
          </p>

          {/* Value Stats Strip */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-3xl mx-auto text-center">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <p className="text-xl sm:text-2xl font-black text-[#117b59]">+500</p>
              <p className="text-xs font-bold text-slate-600 mt-0.5">{localize("طبيب وباحث منجز", "Completed researchers")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <p className="text-xl sm:text-2xl font-black text-[#0C3156]">100%</p>
              <p className="text-xs font-bold text-slate-600 mt-0.5">{localize("مطابق للهيئة السعودية", "SCFHS compliant")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <p className="text-xl sm:text-2xl font-black text-amber-600">Scopus/WoS</p>
              <p className="text-xs font-bold text-slate-600 mt-0.5">{localize("مجلات عالمية مصنفة", "Indexed journals")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <p className="text-xl sm:text-2xl font-black text-sky-600">1:1</p>
              <p className="text-xs font-bold text-slate-600 mt-0.5">{localize("إشراف وتوجيه مباشر", "Direct supervision")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* TABS (Segmented Control) */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sticky top-16 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto">
          <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/70 scrollbar-none">
            <div className="flex w-max min-w-full gap-1.5">
              {[
                { id: 0, icon: "🔬", label: localize("الفرص البحثية الجاهزة للنشر", "Research opportunities ready for publication") },
                { id: 1, icon: "📚", label: localize("برنامج تدريب باحث مع النشر", "Researcher training program with publication") },
                { id: 2, icon: "🎓", label: localize("دورات طبية بساعات CME معتمدة", "Accredited CME medical courses") },
              ].map((tab) => (
                <button
                  key={tab.id}
                  data-testid={`button-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[200px] sm:min-w-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-[#0C3156] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TICKER */}
      <div className="srma-ticker w-full max-w-full overflow-hidden overflow-x-clip py-2.5 text-white" style={{ backgroundColor: contentSettings.primaryColor }}>
        <div className="srma-ticker-track" dir="ltr">
          <span>⚡ {localize(`انضم لأكثر من 500 طبيب وباحث حققوا متطلبات الهيئة السعودية للتخصصات الصحية مع ${siteName} | سجل الآن وابدأ رحلتك البحثية اليوم`, `Join over 500 physicians and researchers who have met Saudi Commission for Health Specialties requirements with ${siteName} | Register now and begin your research journey today`)}</span>
          <span aria-hidden="true">⚡ {localize(`انضم لأكثر من 500 طبيب وباحث حققوا متطلبات الهيئة السعودية للتخصصات الصحية مع ${siteName} | سجل الآن وابدأ رحلتك البحثية اليوم`, `Join over 500 physicians and researchers who have met Saudi Commission for Health Specialties requirements with ${siteName} | Register now and begin your research journey today`)}</span>
        </div>
      </div>

      <section className="py-8 sm:py-10 px-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-none mx-auto">
          <section data-testid="participant-welcome" className="srma-welcome-card mb-8 rounded-3xl border border-emerald-100 bg-gradient-to-l from-[#f3fbf8] via-white to-[#eff6ff] p-6 text-start shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-[#117b59]">{localize(`مرحباً بك في ${siteName} 👋`, `Welcome to ${siteName} 👋`)}</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{localize("ابدأ رحلتك البحثية بخطوات بسيطة", "Start your research journey in a few simple steps")}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{localize("اختر التخصص، راجع تفاصيل الفرصة ومقاعدها المتبقية، ثم اضغط «سجل الآن» لإرسال بياناتك.", "Choose a specialty, review the opportunity details and remaining seats, then select “Register now” to submit your details.")}</p>
              </div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0C3156] text-3xl shadow-lg shadow-[#0C3156]/20">🔬</div>
            </div>
            <div className="mt-5 grid gap-2 text-xs font-bold text-slate-600 sm:grid-cols-3">
              {[localize("1. اختر تخصصك", "1. Choose your specialty"), localize("2. راجع المقاعد والسعر", "2. Review seats and price"), localize("3. أرسل طلب التسجيل", "3. Send your registration")].map((step) => (
                <span key={step} className="rounded-xl border border-white bg-white/80 px-3 py-3 shadow-sm">{step}</span>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-emerald-100/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span>💬 {localize("تحتاج مساعدة أو استفسار بخصوص البرامج البحثية؟", "Need help or have questions about research programs?")}</span>
              </div>
              <a
                href={contactHref.href}
                target={contactHref.isExternal ? "_blank" : undefined}
                rel={contactHref.isExternal ? "noopener noreferrer" : undefined}
                data-testid="button-portal-welcome-contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0C3156] hover:bg-[#0a2847] text-white px-4 py-2 text-xs font-bold transition-colors shadow-xs"
              >
                <MessageCircle size={14} />
                <span>{language === "ar" ? (contentSettings.brand.contactUsLabelAr || "تواصل معنا مباشرة") : (contentSettings.brand.contactUsLabelEn || "Contact Us Directly")}</span>
              </a>
            </div>
          </section>
          {activeTab === 0 && (
            <>
              {/* Intellectual Property & Anti-Theft Protection Banner */}
              <ResearchProtectionBanner />

              <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 ${contentFlow}`}>
                <div>
                  <h2 className="text-xl font-black text-slate-900">✨ {localize("الفرص البحثية المتاحة للتسجيل", "Research opportunities open for registration")}</h2>
                  <p className="text-xs text-slate-500 mt-1">{localize("تصفح البرامج والفرص وسجل مقعدك مباشرة أو استفسر عبر القنوات المباشرة", "Browse programs, reserve your seat directly or inquire via direct channels")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-[#0C3156]/8 text-[#0C3156] text-xs font-bold px-3 py-1.5 rounded-full border border-[#0C3156]/12">
                     {localize(`${visibleOpportunities.length} فرصة متاحة`, `${visibleOpportunities.length} opportunities available`)}
                  </span>
                  {/* View Mode Toggle: Grid or Carousel */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setDisplayMode("grid")}
                      data-testid="button-view-grid"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        displayMode === "grid"
                          ? "bg-white text-[#0C3156] shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title={localize("عرض شبكة", "Grid view")}
                    >
                      <LayoutGrid size={14} />
                      <span>{localize("شبكة", "Grid")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisplayMode("scroll")}
                      data-testid="button-view-carousel"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        displayMode === "scroll"
                          ? "bg-white text-[#0C3156] shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title={localize("عرض كروسال (تمرير أفقي)", "Carousel view")}
                    >
                      <SlidersHorizontal size={14} />
                      <span>{localize("كروسال", "Carousel")}</span>
                    </button>
                  </div>
                </div>
              </div>
              <SpecialtyFilter
                options={specialtyOptions}
                selectedSpecialty={selectedSpecialty}
                onSelect={setSelectedSpecialty}
                className="mb-5"
              />
              {visibleOpportunities.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <div className="text-5xl mb-4">🔬</div>
                  <p className="font-medium">{selectedSpecialty ? localize("لا توجد فرص متاحة في هذا التخصص حالياً", "There are currently no opportunities in this specialty.") : localize("لا توجد فرص متاحة حالياً", "There are currently no opportunities available.")}</p>
                  <p className="text-sm mt-1">{selectedSpecialty ? localize("اختر كل التخصصات لعرض جميع الفرص.", "Choose all specialties to view every opportunity.") : localize("تابع قناتنا على Telegram للإشعارات الفورية", "Follow our Telegram channel for instant notifications.")}</p>
                </div>
              ) : (
                <div className="space-y-10">
                   {groupedOpportunities.map((group) => (
                    <section key={group.id} className="srma-reveal" data-testid={`specialty-section-${group.id}`}>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <h3 className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-black text-[#117b59]">
                            {group.label} ({group.items.length})
                          </h3>
                        </div>
                        <div className="h-px flex-1 bg-slate-200 hidden sm:block" />
                        {isSpecialtyScroll && group.items.length > 1 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById(`carousel-${group.id}`);
                                if (el) el.scrollBy({ left: direction === "rtl" ? 360 : -360, behavior: "smooth" });
                              }}
                              className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0C3156] flex items-center justify-center transition-colors shadow-2xs"
                              title={localize("السابق", "Previous")}
                            >
                              {direction === "rtl" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById(`carousel-${group.id}`);
                                if (el) el.scrollBy({ left: direction === "rtl" ? -360 : 360, behavior: "smooth" });
                              }}
                              className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0C3156] flex items-center justify-center transition-colors shadow-2xs"
                              title={localize("التالي", "Next")}
                            >
                              {direction === "rtl" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                            </button>
                          </div>
                        )}
                      </div>
                      <div
                        id={`carousel-${group.id}`}
                        className={
                          isSpecialtyScroll
                            ? "flex snap-x snap-mandatory gap-5 w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden pb-4 scroll-smooth"
                            : "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                        }
                      >
                   {group.items.map((opp) => {
                    const isExpanded = expandedCards.includes(opp.id);
                    const seatsUsed = opp.totalSeats - opp.seatsLeft;
                    const pct = Math.round((seatsUsed / opp.totalSeats) * 100);
                    return (
                      <div
                        key={opp.id}
                        data-protected="research"
                        className={`protected-research-content research-card relative overflow-hidden select-none ${isSpecialtyScroll ? "w-[min(88vw,390px)] shrink-0 snap-start" : ""} rounded-2xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md`}
                        style={{
                          backgroundColor: contentSettings.cardBackgroundColor,
                          userSelect: "none",
                          WebkitUserSelect: "none",
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        data-testid={`card-research-${opp.id}`}
                      >
                        {/* Dynamic Anti-Camera Watermark */}
                        <ProtectedResearchWatermark />

                        <div className={`flex items-center justify-between gap-3 mb-3 relative z-10 ${contentFlow}`}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {contentSettings.visibleParticipantCardParts.includes("specialty") && <span className={`text-xs font-bold px-3 py-1 rounded-full ${opp.specialtyColor}`}>{localize(displaySpecialty(opp).nameAr, displaySpecialty(opp).nameEn, opp.specialty)}</span>}
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Lock size={10} className="text-emerald-600" />
                              <span>{localize("محمي", "Protected")}</span>
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                            <Flame size={11} /> {localize("مقاعد محدودة متبقية", "Limited seats remaining")}
                          </span>
                        </div>

                        <div className="relative z-10 mb-2">
                          <AntiCaptureResearchTitle
                            title={displayTitle(opp)}
                            titleHref={`/research/${opp.id}`}
                            titleClassName="mb-1 cursor-pointer text-left font-bold leading-snug text-slate-900 transition-colors select-none text-base"
                          />
                        </div>
                        <div className="mb-4"><OpportunityMedia research={opp} className="aspect-[4/3] min-h-[172px]" /></div>

                        <p className="mb-3 text-start text-sm font-medium italic text-[#0C3156]">
                           🏆 {localize(`نحن في ${siteName} – نبني ملفك البحثي ونصنع الفارق`, `At ${siteName}, we build your research profile and make the difference.`)}
                        </p>
                        <div className="mb-4 space-y-2 text-start text-sm leading-6 text-slate-600">
                          {contentSettings.participantCardOrder.filter((part) => contentSettings.visibleParticipantCardParts.includes(part) && !["specialty", "seats", "benefits"].includes(part)).map((part) => {
                            if (part === "description") return <p key={part}>{localize(opp.descriptionAr, opp.descriptionEn, opp.description)}</p>;
                            if (part === "duration" && opp.duration) return <p key={part}><strong>{localize("المدة:", "Duration:")}</strong> {opp.duration}</p>;
                            if (part === "supervisor" && opp.supervisor) return <p key={part}><strong>{localize("المشرف:", "Supervisor:")}</strong> {opp.supervisor}</p>;
                            if (part === "journal" && opp.journalTarget) return <div key={part} className="space-y-1"><p><strong>{localize("المجلة المستهدفة:", "Target journal:")}</strong> {opp.journalTarget}</p>{opp.journalIssn && <p className="text-xs"><strong>ISSN:</strong> {opp.journalIssn}</p>}</div>;
                            return null;
                   })}
                       </div>

                        <div className="mb-4"><OpportunityPrice originalSar={opp.priceOriginalSar} discountedSar={opp.priceDiscountedSar} currency={currency} onCurrencyChange={setCurrency} compact /></div>

                        {contentSettings.visibleParticipantCardParts.includes("seats") && <><div className="mb-1">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(to left, ${contentSettings.primaryColor}, ${contentSettings.accentColor})` }} />
                          </div>
                        </div>
                        <p className="mb-2 text-start text-xs text-slate-500">{localize(`تبقى ${opp.seatsLeft} مقاعد فقط من أصل ${opp.totalSeats}`, `Only ${opp.seatsLeft} seats remain out of ${opp.totalSeats}`)}</p>
                        <div className="mb-4 flex flex-wrap justify-start gap-1.5 text-[11px] font-bold">
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">{localize("الكاتب الأول", "First author")}: {opp.firstAuthorSeatsLeft ?? 1} {localize("متاح", "available")}</span>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{localize("مؤلف مشارك", "Co-author")}: {opp.coAuthorSeatsLeft ?? 14} {localize("متاح", "available")}</span>
                        </div></>}

                        {contentSettings.visibleParticipantCardParts.includes("benefits") && <><button data-testid={`button-expand-benefits-${opp.id}`} onClick={() => toggleExpand(opp.id)}
                          className={`mb-3 flex w-full items-center justify-start gap-2 text-sm font-semibold text-slate-600 hover:text-[#0C3156] ${contentFlow}`}>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          {localize("مزايا وقيمة المشاركة 💡", "Benefits and participation value 💡")}
                        </button>
                        {isExpanded && opp.benefits.length > 0 && (
                          <ul className="space-y-1.5 mb-4 bg-[#EFF6FF] rounded-xl p-4">
                            {opp.benefits.map((b) => (
                              <li key={b} className={`flex items-center gap-2 text-sm text-slate-700 ${contentFlow}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0C3156] flex-shrink-0" />
                                {b}
                              </li>
                            ))}
                          </ul>
                        )}</>}

                        {/* Actions block: Register Now, Contact Us, Copy Link */}
                        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                          {/* 1. Register Now & Details */}
                          <div className={`flex gap-2 ${contentFlow}`}>
                            <button
                              data-testid={`button-register-${opp.id}`}
                              onClick={() => openModal(opp)}
                              className="flex-1 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-sm hover:opacity-95 flex items-center justify-center gap-1.5"
                              style={{ backgroundColor: contentSettings.primaryColor }}
                            >
                              <span>{t("common.registerNow")}</span>
                              <span>👤</span>
                            </button>
                            <Link
                              href={`/research/${opp.id}`}
                              data-testid={`button-detail-${opp.id}`}
                              className="flex items-center justify-center gap-1 border font-bold px-4 py-3 rounded-xl transition-colors text-sm bg-white hover:bg-slate-50"
                              style={{ borderColor: `${contentSettings.primaryColor}35`, color: contentSettings.primaryColor }}
                            >
                              <span>{t("common.details")}</span>
                              <ChevronLeft size={14} />
                            </Link>
                          </div>

                          {/* 2. Inquiry Contact Button (تحت زر سجل الآن مباشرة بتخصيص الأدمن) */}
                          {(() => {
                            const inquiry = getOpportunityInquiryLink(
                              contentSettings.brand,
                              displayTitle(opp),
                              language as "ar" | "en"
                            );
                            if (!inquiry) return null;

                            return (
                              <a
                                href={inquiry.href}
                                target={inquiry.isExternal && inquiry.channel !== "email" && inquiry.channel !== "phone" ? "_blank" : undefined}
                                rel={inquiry.isExternal && inquiry.channel !== "email" && inquiry.channel !== "phone" ? "noopener noreferrer" : undefined}
                                data-testid={`button-contact-${opp.id}`}
                                className={`w-full font-bold py-2.5 rounded-xl text-xs text-center transition-all flex items-center justify-center gap-2 shadow-2xs ${
                                  inquiry.channel === "whatsapp"
                                    ? "border border-emerald-500/35 bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                                    : inquiry.channel === "telegram"
                                    ? "border border-sky-500/35 bg-sky-50 hover:bg-sky-100 text-sky-800"
                                    : inquiry.channel === "email"
                                    ? "border border-amber-500/35 bg-amber-50 hover:bg-amber-100 text-amber-800"
                                    : inquiry.channel === "phone"
                                    ? "border border-blue-500/35 bg-blue-50 hover:bg-blue-100 text-blue-800"
                                    : "border border-purple-500/35 bg-purple-50 hover:bg-purple-100 text-purple-800"
                                }`}
                              >
                                {inquiry.channel === "whatsapp" && <MessageCircle size={15} className="text-emerald-600 shrink-0" />}
                                {inquiry.channel === "telegram" && <Send size={14} className="text-sky-600 shrink-0" />}
                                {inquiry.channel === "email" && <Mail size={14} className="text-amber-600 shrink-0" />}
                                {inquiry.channel === "phone" && <Phone size={14} className="text-blue-600 shrink-0" />}
                                {inquiry.channel === "custom_url" && <ExternalLink size={14} className="text-purple-600 shrink-0" />}
                                <span className="truncate">
                                  {language === "ar" ? inquiry.labelAr : inquiry.labelEn}
                                </span>
                              </a>
                            );
                          })()}

                          {/* 3. Copy Opportunity Link (زر نسخ الرابط) */}
                          <button
                            type="button"
                            data-testid={`button-copy-link-${opp.id}`}
                            className={`w-full text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 font-medium border ${
                              copiedOppId === opp.id
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border-slate-200/60"
                            }`}
                            onClick={() => handleCopyOppLink(opp.id)}
                          >
                            {copiedOppId === opp.id ? (
                              <>
                                <Check size={13} className="text-emerald-600" />
                                <span>{localize("تم نسخ الرابط ومعاينة الصورة جاهزة ✓", "Link copied! Image preview ready ✓")}</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} className="text-slate-400" />
                                <span>{localize("نسخ رابط الفرصة 🔗", "Copy opportunity link 🔗")}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                      </div>
                    </section>
                   ))}
                </div>
              )}
            </>
          )}

          {activeTab === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Main Banner */}
              <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/40 p-6 sm:p-10 shadow-xs text-start">
                <div className="inline-flex items-center gap-2 rounded-xl bg-sky-100/80 px-3 py-1 text-xs font-bold text-sky-800 mb-3">
                  <span>📚</span>
                  <span>{localize("مسار تدريبي وعملي شامل", "Comprehensive practical training track")}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                  {localize("برنامج تدريب باحث سريري متقدم (من الفكرة حتى النشر الدولي)", "Advanced Clinical Researcher Program (From Concept to International Publication)")}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                  {localize(
                    "برنامج تدريبي تطبيقي يدمج بين التدريب الأكاديمي النظري والممارسة العملية الفعلية تحت إشراف نخبة من كبار الباحثين والمحكمين الدوليين، وينتهي ببحث علمي منشور باسمك ومطابق لمعايير الهيئة السعودية للتخصصات الصحية.",
                    "An applied training program combining theoretical academic training and real-world practical research under the mentorship of top international researchers and reviewers, concluding with a published paper under your name complying with SCFHS standards."
                  )}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href={contactHref.href}
                    target={contactHref.isExternal ? "_blank" : undefined}
                    rel={contactHref.isExternal ? "noopener noreferrer" : undefined}
                    data-testid="button-trainer-register"
                    className="inline-flex items-center gap-2 bg-[#0C3156] hover:bg-[#08223c] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
                  >
                    <MessageCircle size={16} />
                    <span>{localize("التسجيل في الدفعة القادمة", "Register for upcoming cohort")}</span>
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
                  >
                    <span>💬</span>
                    <span>{localize("استفسار عبر واتساب الأكاديمية", "Inquire via WhatsApp")}</span>
                  </a>
                </div>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: "💡",
                    titleAr: "1. اختيار الفكرة والبروتوكول",
                    titleEn: "1. Topic & Protocol Design",
                    descAr: "صياغة سؤال البحث، بناء خطة الدراسة، وكتابة البروتوكول العلمي المعتمد.",
                    descEn: "Formulate research question, design study plan, and write approved scientific protocol.",
                  },
                  {
                    icon: "📊",
                    titleAr: "2. الإحصاء وتحليل البيانات",
                    titleEn: "2. Biostatistics & Data Analysis",
                    descAr: "تدريب عملي على برامج الإحصاء (SPSS / R / RevMan) وإجراء الميتا أناليسيس.",
                    descEn: "Hands-on training in statistical tools (SPSS, R, RevMan) and meta-analyses.",
                  },
                  {
                    icon: "✍️",
                    titleAr: "3. الكتابة والنشر المصنف",
                    titleEn: "3. Academic Writing & Indexing",
                    descAr: "صياغة المخطوطة وفق دليل النشر بمجلات Scopus وWeb of Science وPubMed.",
                    descEn: "Draft manuscript adhering to guidelines of Scopus, Web of Science, and PubMed journals.",
                  },
                  {
                    icon: "🎯",
                    titleAr: "4. الرد على المحكمين والقبول",
                    titleEn: "4. Peer Review & Acceptance",
                    descAr: "متابعة الملاحظات والرد على المحكمين حتى صدور خطاب القبول النهائي.",
                    descEn: "Handle reviewer feedback until final official acceptance letter is issued.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-2 shadow-2xs hover:border-sky-300 transition-colors text-start">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-black text-slate-900 text-sm">{localize(item.titleAr, item.titleEn)}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{localize(item.descAr, item.descEn)}</p>
                  </div>
                ))}
              </div>

              {/* Details and Target Audience */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-start space-y-3">
                  <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <span>🎯</span>
                    <span>{localize("الفئات المستهدفة", "Target Audience")}</span>
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-slate-700">
                    <li className="flex items-center gap-2">✓ {localize("الأطباء المقيمون وأطباء الزمالة (Residents & Fellows).", "Residents and Fellows.")}</li>
                    <li className="flex items-center gap-2">✓ {localize("أطباء الامتياز والخريجون الباحثون عن نقاط المفاضلة.", "Interns and medical graduates seeking matching points.")}</li>
                    <li className="flex items-center gap-2">✓ {localize("الممارسون الصحيون والراغبون في الترقية المهنية والأكاديمية.", "Healthcare practitioners seeking academic promotion.")}</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-start space-y-3">
                  <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <span>🏆</span>
                    <span>{localize("مخرجات البرنامج والشهادة", "Program Outcomes & Certificate")}</span>
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-slate-700">
                    <li className="flex items-center gap-2">✓ {localize("ورقة بحثية منشورة أو مقبولة في مجلة عالمية مصنفة.", "Published or accepted research paper in an indexed journal.")}</li>
                    <li className="flex items-center gap-2">✓ {localize("شهادة إتمام برنامج تدريب باحث معتمدة من الأكاديمية.", "Certified program completion certificate from the Academy.")}</li>
                    <li className="flex items-center gap-2">✓ {localize("ملف باحث متكامل (ORCID, ResearchGate, Google Scholar).", "Comprehensive researcher profile (ORCID, ResearchGate, Google Scholar).")}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* CME Header */}
              <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/80 via-white to-purple-50/40 p-6 sm:p-10 shadow-xs text-start">
                <div className="inline-flex items-center gap-2 rounded-xl bg-violet-100/80 px-3 py-1 text-xs font-bold text-violet-800 mb-3">
                  <span>🎓</span>
                  <span>{localize("معتمدة من الهيئة السعودية للتخصصات الصحية (SCFHS)", "Accredited by Saudi Commission for Health Specialties (SCFHS)")}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                  {localize("دورات طبية تخصصية بساعات تعليم طبي مستمر (CME)", "Specialized Medical Courses with Continuing Medical Education (CME) Hours")}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                  {localize(
                    "احصل على ساعات CME المعتمدة لتجديد التصنيف المهني والتسجيل في برامج البورد، مع تقديم محتوى عملي يقدمه خبراء سريريون وأكاديميون معتمدون وشهادات رقمية فورية.",
                    "Earn accredited CME hours for professional re-registration and matching in residency programs, with practical curriculum by certified clinicians and instant verified digital certificates."
                  )}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href={contactHref.href}
                    target={contactHref.isExternal ? "_blank" : undefined}
                    rel={contactHref.isExternal ? "noopener noreferrer" : undefined}
                    data-testid="button-cme-register"
                    className="inline-flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
                  >
                    <MessageCircle size={16} />
                    <span>{localize("طلب التسجيل في الدورات", "Register for Courses")}</span>
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white border border-violet-300 text-violet-800 hover:bg-violet-50 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
                  >
                    <span>💬</span>
                    <span>{localize("استفسار عن جدول الدورات القادمة", "Inquire about Upcoming Schedule")}</span>
                  </a>
                </div>
              </div>

              {/* Sample Courses Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    code: "CME-101",
                    hours: "15 CME",
                    titleAr: "منهجية الأبحاث السريرية وتصميم الدراسات الطبية",
                    titleEn: "Clinical Research Methodology & Study Design",
                    topicsAr: "أنواع الدراسات، صياغة السؤال البحثي PICO، عينات الدراسة، والتحيز السريري.",
                    topicsEn: "Study designs, PICO question formulation, sampling, and clinical bias mitigation.",
                  },
                  {
                    code: "CME-102",
                    hours: "12 CME",
                    titleAr: "التحليل الإحصائي الحيوي التطبيقي للأطباء (SPSS & R)",
                    titleEn: "Applied Biostatistics for Physicians (SPSS & R)",
                    topicsAr: "المتغيرات، اختبارات الفرضيات، تحليل الانحدار، وقراءة الجداول الإحصائية للأوراق العلمية.",
                    topicsEn: "Variables, hypothesis testing, regression analysis, and reading journal statistical tables.",
                  },
                  {
                    code: "CME-103",
                    hours: "20 CME",
                    titleAr: "المراجعات المنهجية والميتا أناليسيس (PRISMA Guideline)",
                    titleEn: "Systematic Reviews & Meta-Analyses (PRISMA)",
                    topicsAr: "استراتيجية البحث في قواعد البيانات، استخراج البيانات، تقييم جودة الدراسات، ورسم Forest Plot.",
                    topicsEn: "Database search strategies, data extraction, risk of bias assessment, and Forest plots.",
                  },
                  {
                    code: "CME-104",
                    hours: "8 CME",
                    titleAr: "أخلاقيات البحث الطبي والممارسة السريرية الجيدة (GCP)",
                    titleEn: "Good Clinical Practice (GCP) & Medical Ethics",
                    topicsAr: "موافقات اللجان الأخلاقية IRB، حماية خصوصية المرضى، وتطبيق إعلان هلسنكي.",
                    topicsEn: "IRB ethical approval requirements, patient privacy, and the Declaration of Helsinki.",
                  },
                ].map((course, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-start shadow-2xs hover:border-violet-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-400">{course.code}</span>
                      <span className="text-xs font-black text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-lg">
                        {course.hours}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-900 text-sm leading-snug">{localize(course.titleAr, course.titleEn)}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{localize(course.topicsAr, course.topicsEn)}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-700">✓ شهادة معتمدة فورية</span>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-700 hover:text-violet-900 hover:underline"
                      >
                        {localize("احجز مقعدك ←", "Reserve seat →")}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* HALL OF FAME */}
      <section className="py-12 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-right mb-6">
            <h2 className="text-2xl font-black text-slate-900">{localize("مشاريع اكتمل فريقها (لوحة الشرف) 🏆", "Projects with completed teams (Hall of Fame) 🏆")}</h2>
            <p className="text-slate-500 text-sm mt-1">{localize("أبحاث سابقة تم إغلاق التسجيل فيها بنجاح", "Previous research projects whose registration closed successfully.")}</p>
          </div>
          <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden pb-4">
            <div className="flex w-max min-w-max gap-4">
              {hallOfFame.map((item, i) => (
                <div key={i} className="flex-shrink-0 w-72 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm" data-testid={`card-hall-${i}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      <Lock size={10} /> {localize("اكتمل الفريق", "Team complete")}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.specialtyColor} inline-block mb-2`}>{item.specialty}</span>
                  <p className="text-sm font-semibold text-slate-700 line-clamp-3">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <RegistrationModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedResearch(null); }}
        researchTitle={selectedResearch ? displayTitle(selectedResearch) : ""}
        researchId={selectedResearch?.id}
        firstAuthorSeatsLeft={selectedResearch?.firstAuthorSeatsLeft}
        coAuthorSeatsLeft={selectedResearch?.coAuthorSeatsLeft}
        priceOriginalSar={selectedResearch?.priceOriginalSar}
        priceDiscountedSar={selectedResearch?.priceDiscountedSar}
        onRegistered={refreshOpportunities}
      />
    </div>
  );
}

function uniqueResearchOpportunities(opportunities: ResearchOpportunity[]) {
  const seenTitles = new Set<string>();
  return opportunities.filter((opportunity) => {
    const title = normalizeResearchTitle(opportunity.titleEn || opportunity.titleAr || opportunity.title || String(opportunity.id));
    if (seenTitles.has(title)) return false;
    seenTitles.add(title);
    return true;
  });
}

function normalizeResearchTitle(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
