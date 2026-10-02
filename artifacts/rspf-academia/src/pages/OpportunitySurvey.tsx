import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  ArrowRight,
  Send,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { ResearchOpportunity } from "@/lib/researchData";
import OpportunityMedia from "@/components/OpportunityMedia";
import OpportunityPrice from "@/components/OpportunityPrice";
import CountrySelector from "@/components/CountrySelector";
import {
  DEFAULT_SITE_CONTENT_SETTINGS,
  RegistrationFieldId,
  SiteContentSettings,
  buildForwardingUrl,
  ForwardingType,
  DEFAULT_ACADEMIC_DEGREE_SETTINGS,
  DEFAULT_RESEARCH_EXPERIENCE_SETTINGS,
  DEFAULT_FEE_AND_TASK_AGREEMENT_SETTINGS,
} from "@/lib/siteContentSettings";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/opportunityPricing";
import { PageSeo } from "@/lib/seo";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "/api";

export default function OpportunitySurvey() {
  const { direction, language, localize } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { toast } = useToast();

  const [opportunities, setOpportunities] = useState<ResearchOpportunity[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<ResearchOpportunity | null>(null);
  const [loadingOpp, setLoadingOpp] = useState(true);
  const [contentSettings, setContentSettings] = useState<SiteContentSettings>(DEFAULT_SITE_CONTENT_SETTINGS);

  // Form states
  const [form, setForm] = useState({
    fullName: "",
    specialization: "",
    email: "",
    whatsapp: "",
    affiliation: "",
    country: "المملكة العربية السعودية",
    dialCode: "+966",
    city: "",
    orcid: "",
  });
  const [authorRole, setAuthorRole] = useState<"first_author" | "co_author">("co_author");
  const [academicDegree, setAcademicDegree] = useState("");
  const [hasResearchExp, setHasResearchExp] = useState<"yes" | "no" | "">("");
  const [researchExpDetails, setResearchExpDetails] = useState("");
  const [agreeFeesAndTasks, setAgreeFeesAndTasks] = useState<"agree" | "disagree" | "">("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [forwardUrl, setForwardUrl] = useState("");
  const [forwardType, setForwardType] = useState<ForwardingType>("whatsapp");
  const [researchGroupUrl, setResearchGroupUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Parse `rid` from query string: e.g. /survey?rid=RES-2026-128 or ?rid=128 or ?id=128
  const searchParams = new URLSearchParams(window.location.search);
  const rawRid = searchParams.get("rid") || searchParams.get("id") || "";
  const numericId = parseInt(rawRid.replace(/\D/g, ""), 10);

  useEffect(() => {
    fetch("/api/site-content-settings")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((settings: SiteContentSettings) => setContentSettings(settings))
      .catch(() => setContentSettings(DEFAULT_SITE_CONTENT_SETTINGS));

    fetch("/api/programs", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: ResearchOpportunity[]) => {
        setOpportunities(data);
        if (Number.isInteger(numericId) && numericId > 0) {
          const match = data.find((item) => item.id === numericId);
          if (match) setSelectedOpp(match);
        } else if (data.length > 0) {
          setSelectedOpp(data[0]);
        }
      })
      .catch(() => {
        setOpportunities([]);
        setSelectedOpp(null);
      })
      .finally(() => setLoadingOpp(false));
  }, [numericId]);

  useEffect(() => {
    if (selectedOpp) {
      if (selectedOpp.coAuthorSeatsLeft === 0 && (selectedOpp.firstAuthorSeatsLeft || 0) > 0) {
        setAuthorRole("first_author");
      } else {
        setAuthorRole("co_author");
      }
    }
  }, [selectedOpp]);

  const fieldSetting = (id: RegistrationFieldId) =>
    contentSettings.registrationFields.find((f) => f.id === id) ||
    DEFAULT_SITE_CONTENT_SETTINGS.registrationFields.find((f) => f.id === id)!;
  const visible = (id: RegistrationFieldId) => fieldSetting(id).showParticipant;
  const required = (id: RegistrationFieldId) => fieldSetting(id).requiredParticipant;
  const degreeSettings = contentSettings.academicDegreeSettings || DEFAULT_ACADEMIC_DEGREE_SETTINGS;
  const expSettings = contentSettings.researchExperienceSettings || DEFAULT_RESEARCH_EXPERIENCE_SETTINGS;
  const agreementSettings = contentSettings.feeAndTaskAgreementSettings || DEFAULT_FEE_AND_TASK_AGREEMENT_SETTINGS;

  const handleCopySurveyLink = async () => {
    if (!selectedOpp) return;
    const link = `${window.location.origin}/survey?rid=RES-2026-${selectedOpp.id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const input = document.createElement("input");
        input.value = link;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      toast({
        title: localize("تم نسخ رابط استمارة التسجيل 🔗", "Registration link copied 🔗"),
        description: localize(
          "ينقل هذا الرابط المشترك مباشرة إلى استمارة التسجيل الخاصة بهذه الفرصة.",
          "This link takes applicants directly to the registration form for this opportunity."
        ),
      });
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;

    if (visible("academicDegree") && required("academicDegree") && degreeSettings.enabled && !academicDegree) {
      setError(localize("يرجى اختيار الدرجة العلمية", "Please select your academic degree"));
      return;
    }
    if (visible("researchExperience") && required("researchExperience") && expSettings.enabled && !hasResearchExp) {
      setError(localize("يرجى الإجابة على سؤال الخبرة البحثية السابقة", "Please answer the research experience question"));
      return;
    }
    if (visible("feeAndTaskAgreement") && agreementSettings.enabled) {
      if (!agreeFeesAndTasks) {
        setError(localize("يرجى تحديد موافقتك على الرسوم والمهام البحثية", "Please indicate agreement with fees and research tasks"));
        return;
      }
      if (agreeFeesAndTasks === "disagree") {
        setError(localize("يلزم الموافقة على الرسوم والمهام البحثية لإتمام التسجيل في البرنامج", "Agreement to fees and tasks is required to complete registration"));
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          specialization: form.specialization.trim(),
          email: form.email.trim(),
          whatsapp: `${form.dialCode} ${form.whatsapp}`.trim(),
          affiliation: form.affiliation.trim(),
          country: form.country,
          city: form.city.trim(),
          orcid: form.orcid.trim(),
          researchId: selectedOpp.id,
          researchTitle: selectedOpp.titleEn || selectedOpp.title,
          academicDegree: academicDegree || undefined,
          hasResearchExp: hasResearchExp || undefined,
          researchExpDetails: researchExpDetails || undefined,
          agreeFeesAndTasks: agreeFeesAndTasks || undefined,
          authorRole,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || localize("حدث خطأ أثناء حفظ التسجيل", "Failed to save registration"));
      }

      setResearchGroupUrl(resData.researchGroupUrl || selectedOpp.researchGroupUrl || "");
      const fUrl = buildForwardingUrl(contentSettings.forwarding, {
        fullName: form.fullName.trim(),
        specialization: form.specialization.trim(),
        email: form.email.trim(),
        whatsapp: `${form.dialCode} ${form.whatsapp}`.trim(),
        affiliation: form.affiliation.trim(),
        country: form.country,
        researchTitle: selectedOpp.titleEn || selectedOpp.title,
        researchId: selectedOpp.id,
        authorRole,
      });
      setForwardUrl(fUrl);
      setForwardType(contentSettings.forwarding.type);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || localize("حدث خطأ أثناء حفظ التسجيل", "Failed to save registration"));
    } finally {
      setLoading(false);
    }
  };

  const title = selectedOpp ? selectedOpp.titleAr || selectedOpp.titleEn || selectedOpp.title : "";
  const oppImageUrl = selectedOpp ? `${window.location.origin}/api/programs/${selectedOpp.id}/image` : "";

  return (
    <>
      <PageSeo
        pathname="/survey"
        language={language}
        title={selectedOpp ? `استمارة التسجيل: ${title} | SRMA` : "استمارة التسجيل في الفرص البحثية"}
        description={selectedOpp?.descriptionAr || selectedOpp?.descriptionEn || "استمارة تسجيل الانضمام إلى الفرصة البحثية في منصة SRMA"}
        image={oppImageUrl}
      />

      <div className="min-h-screen bg-slate-50/70 pb-16 pt-6" dir={direction}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Top Bar Navigation */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Link
              href="/participant-portal"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#117b59] hover:underline"
            >
              <ArrowRight size={15} />
              <span>{localize("العودة إلى فهرس الفرص البحثية", "Back to Opportunities Catalog")}</span>
            </Link>

            {selectedOpp && (
              <button
                type="button"
                onClick={handleCopySurveyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-black text-[#117b59] shadow-2xs transition hover:bg-emerald-100"
              >
                {copiedLink ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                <span>{copiedLink ? localize("تم نسخ الرابط ✓", "Link Copied ✓") : localize("نسخ رابط الاستمارة 🔗", "Copy Form Link 🔗")}</span>
              </button>
            )}
          </div>

          {loadingOpp ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 size={32} className="animate-spin text-[#117b59]" />
            </div>
          ) : !selectedOpp ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <AlertCircle size={44} className="mx-auto text-amber-500" />
              <h2 className="mt-3 text-xl font-black text-slate-800">
                {localize("الفرصة البحثية المطلوبة غير متوفرة", "Opportunity Not Found")}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {localize("يرجى اختيار فرصة بحثية من الفهرس المتاح للتسجيل.", "Please browse the catalog to pick an open opportunity.")}
              </p>
              <Link
                href="/participant-portal"
                className="mt-5 inline-block rounded-xl bg-[#117b59] px-6 py-2.5 text-sm font-black text-white hover:bg-[#0c6549]"
              >
                {localize("تصفح جميع الفرص", "Browse Opportunities")}
              </Link>
            </div>
          ) : done ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#117b59]">
                <CheckCircle2 size={36} />
              </div>

              <span className="mt-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-[#117b59]">
                RES-2026-{selectedOpp.id}
              </span>

              <h2 className="mt-2 text-2xl font-black text-slate-900">
                {localize("تم استلام طلب تسجيلك بنجاح!", "Registration Received Successfully!")}
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                {localize(
                  `شكراً لك د. ${form.fullName}. تم تسجيل بياناتك في الفرصة البحثية (${selectedOpp.titleAr || selectedOpp.titleEn || selectedOpp.title}).`,
                  `Thank you Dr. ${form.fullName}. Your registration in (${selectedOpp.titleEn || selectedOpp.title}) is confirmed.`
                )}
              </p>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs font-bold text-slate-700">
                <p>{localize("دور التأليف المختار:", "Selected Author Role:")} <span className="font-black text-[#117b59]">{authorRole === "first_author" ? localize("الكاتب الأول (First Author)", "First Author") : localize("مؤلف مشارك (Co-Author)", "Co-Author")}</span></p>
                <p className="mt-1">{localize("رقم الواتساب المسجل:", "WhatsApp Number:")} <span dir="ltr" className="font-mono">{form.dialCode} {form.whatsapp}</span></p>
              </div>

              {/* Research Group / WhatsApp Join Buttons */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {researchGroupUrl && (
                  <a
                    href={researchGroupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-md transition hover:bg-emerald-700 sm:w-auto"
                  >
                    <MessageCircle size={18} />
                    <span>{localize("الانضمام لمجموعة البحث في واتساب", "Join Research WhatsApp Group")}</span>
                    <ExternalLink size={15} />
                  </a>
                )}

                {forwardUrl && (
                  <a
                    href={forwardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-6 py-3.5 text-sm font-black text-[#117b59] transition hover:bg-emerald-100 sm:w-auto"
                  >
                    <Send size={16} />
                    <span>{localize("تأكيد التسجيل مع المنسق عبر واتساب", "Confirm with Coordinator on WhatsApp")}</span>
                  </a>
                )}
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <Link
                  href="/participant-portal"
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  {localize("تصفح فرص بحثية أخرى", "Browse Other Opportunities")}
                </Link>
              </div>
            </div>
          ) : (
            /* REGISTRATION SURVEY VIEW */
            <div className="space-y-6">
              {/* 1. OPPORTUNITY CARD & IMAGE PREVIEW */}
              <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-md">
                <div className="relative border-b border-slate-100 bg-slate-900">
                  {/* Research Opportunity Image Preview */}
                  <OpportunityMedia research={selectedOpp} className="h-64 sm:h-80 w-full object-cover" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="rounded-lg bg-[#117b59] px-2.5 py-0.5 text-xs font-black text-white">
                        RES-2026-{selectedOpp.id}
                      </span>
                      <span className="rounded-lg bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold text-white">
                        {localize(selectedOpp.specialtyAr, selectedOpp.specialtyEn, selectedOpp.specialty)}
                      </span>
                      {selectedOpp.journalTarget && (
                        <span className="rounded-lg bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold text-white">
                          {selectedOpp.journalTarget}
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white leading-snug drop-shadow-md">
                      {selectedOpp.titleAr || selectedOpp.titleEn || selectedOpp.title}
                    </h1>
                  </div>
                </div>

                {/* Details Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-emerald-50/40 text-center border-b border-emerald-100">
                  <div className="rounded-xl bg-white p-2.5 shadow-2xs border border-emerald-100/60">
                    <p className="text-[11px] font-bold text-slate-500">{localize("المقاعد المتبقية", "Seats Left")}</p>
                    <p className="text-sm font-black text-[#117b59]">{selectedOpp.seatsLeft} / {selectedOpp.totalSeats}</p>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 shadow-2xs border border-emerald-100/60">
                    <p className="text-[11px] font-bold text-slate-500">{localize("مقاعد الكاتب الأول", "First Author Seats")}</p>
                    <p className="text-sm font-black text-slate-800">{selectedOpp.firstAuthorSeatsLeft ?? 1}</p>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 shadow-2xs border border-emerald-100/60">
                    <p className="text-[11px] font-bold text-slate-500">{localize("مقاعد المؤلف المشارك", "Co-Author Seats")}</p>
                    <p className="text-sm font-black text-slate-800">{selectedOpp.coAuthorSeatsLeft ?? 14}</p>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 shadow-2xs border border-emerald-100/60">
                    <p className="text-[11px] font-bold text-slate-500">{localize("الرسوم التقديرية", "Fee")}</p>
                    <div className="text-sm font-black text-emerald-700">
                      <OpportunityPrice
                        priceSar={selectedOpp.priceDiscountedSar || selectedOpp.priceOriginalSar || 1000}
                        priceUsd={Math.round((selectedOpp.priceDiscountedSar || 1000) / 3.75)}
                        currency={currency}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. REGISTRATION SURVEY FORM */}
              <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-[#117b59]" />
                      <span>{localize("استمارة التسجيل والانضمام للفرصة البحثية", "Opportunity Registration Survey")}</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {localize("املأ البيانات التالية لحجز مقعدك والتواصل مع المنسق المعتمد.", "Fill out the fields below to reserve your seat.")}
                    </p>
                  </div>
                </div>

                {/* Author Role Selection */}
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2">
                    {localize("اختر دور التأليف المطلوب", "Select Author Role")} <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAuthorRole("first_author")}
                      disabled={(selectedOpp.firstAuthorSeatsLeft ?? 1) <= 0}
                      className={`rounded-2xl border p-4 text-right transition ${
                        authorRole === "first_author"
                          ? "border-[#117b59] bg-[#e6f5ef] ring-2 ring-[#117b59]/20"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50"
                      } ${(selectedOpp.firstAuthorSeatsLeft ?? 1) <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#117b59]">
                          {(selectedOpp.firstAuthorSeatsLeft ?? 1) > 0 ? localize("متاح", "Available") : localize("مكتمل", "Full")}
                        </span>
                        <p className="font-black text-slate-800">{localize("الكاتب الأول (First Author)", "First Author")}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {localize("إشراف مباشر ومسؤولية قيادية في البحث.", "Lead role in research writing and submission.")}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAuthorRole("co_author")}
                      disabled={(selectedOpp.coAuthorSeatsLeft ?? 14) <= 0}
                      className={`rounded-2xl border p-4 text-right transition ${
                        authorRole === "co_author"
                          ? "border-[#117b59] bg-[#e6f5ef] ring-2 ring-[#117b59]/20"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50"
                      } ${(selectedOpp.coAuthorSeatsLeft ?? 14) <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#117b59]">
                          {(selectedOpp.coAuthorSeatsLeft ?? 14) > 0 ? localize("متاح", "Available") : localize("مكتمل", "Full")}
                        </span>
                        <p className="font-black text-slate-800">{localize("مؤلف مشارك (Co-Author)", "Co-Author")}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {localize("المشاركة في استخلاص البيانات أو الكتابة المنهجية.", "Participate in data extraction or section writing.")}
                      </p>
                    </button>
                  </div>
                </div>

                {/* Personal & Academic Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visible("fullName") && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {localize("الاسم الثلاثي أو الرباعي بالإنجليزية (كما يُنشر في الورقة)", "Full Name in English (as it appears in paper)")}
                        {required("fullName") && <span className="text-rose-500"> *</span>}
                      </label>
                      <input
                        required={required("fullName")}
                        type="text"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        placeholder="Dr. Ahmed Mohammed Ali"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#117b59] focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 text-left"
                        dir="ltr"
                      />
                    </div>
                  )}

                  {visible("academicDegree") && degreeSettings.enabled && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {localize("الدرجة العلمية الحالية", "Current Academic Degree")}
                        {required("academicDegree") && <span className="text-rose-500"> *</span>}
                      </label>
                      <select
                        required={required("academicDegree")}
                        value={academicDegree}
                        onChange={(e) => setAcademicDegree(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#117b59] focus:outline-none focus:ring-2 focus:ring-[#117b59]/20"
                      >
                        <option value="">{localize("-- اختر الدرجة العلمية --", "-- Select Academic Degree --")}</option>
                        {degreeSettings.options.map((opt) => (
                          <option key={opt.id} value={opt.nameAr}>
                            {localize(opt.nameAr, opt.nameEn)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {visible("specialization") && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {localize("التخصص الطبي أو الدقيق", "Specialization")}
                        {required("specialization") && <span className="text-rose-500"> *</span>}
                      </label>
                      <input
                        required={required("specialization")}
                        type="text"
                        value={form.specialization}
                        onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                        placeholder="طب وجراحة عامة / Cardiology"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#117b59] focus:outline-none focus:ring-2 focus:ring-[#117b59]/20"
                      />
                    </div>
                  )}

                  {visible("affiliation") && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {localize("جهة الانتساب الأكاديمي أو الوظيفي (الجامعة أو المستشفى)", "Affiliation (University or Hospital)")}
                        {required("affiliation") && <span className="text-rose-500"> *</span>}
                      </label>
                      <input
                        required={required("affiliation")}
                        type="text"
                        value={form.affiliation}
                        onChange={(e) => setForm({ ...form, affiliation: e.target.value })}
                        placeholder="جامعة الملك سعود / King Saud University"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#117b59] focus:outline-none focus:ring-2 focus:ring-[#117b59]/20"
                      />
                    </div>
                  )}

                  {visible("email") && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {localize("البريد الإلكتروني", "Email Address")}
                        {required("email") && <span className="text-rose-500"> *</span>}
                      </label>
                      <input
                        required={required("email")}
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="doctor@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#117b59] focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 text-left"
                        dir="ltr"
                      />
                    </div>
                  )}

                  {visible("whatsapp") && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {localize("رقم الواتساب مع المفتاح الدولي", "WhatsApp Number with Country Code")}
                        {required("whatsapp") && <span className="text-rose-500"> *</span>}
                      </label>
                      <div className="flex gap-2" dir="ltr">
                        <input
                          type="text"
                          readOnly
                          value={form.dialCode}
                          className="w-20 rounded-xl border border-slate-200 bg-slate-100 px-3 py-3 text-sm font-bold text-slate-700 text-center"
                        />
                        <input
                          required={required("whatsapp")}
                          type="tel"
                          value={form.whatsapp}
                          onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/[^0-9]/g, "") })}
                          placeholder="5XXXXXXXX"
                          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#117b59] focus:outline-none focus:ring-2 focus:ring-[#117b59]/20"
                        />
                      </div>
                    </div>
                  )}

                  {visible("country") && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {localize("الدولة", "Country")}
                      </label>
                      <CountrySelector
                        value={form.country}
                        onChange={(country, dialCode) => setForm({ ...form, country, dialCode })}
                      />
                    </div>
                  )}

                  {visible("city") && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {localize("المدينة", "City")}
                        {required("city") && <span className="text-rose-500"> *</span>}
                      </label>
                      <input
                        required={required("city")}
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="الرياض / مسقط / القاهرة"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#117b59] focus:outline-none focus:ring-2 focus:ring-[#117b59]/20"
                      />
                    </div>
                  )}

                  {visible("orcid") && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {localize("معرّف ORCID (اختياري)", "ORCID iD (Optional)")}
                      </label>
                      <input
                        type="text"
                        value={form.orcid}
                        onChange={(e) => setForm({ ...form, orcid: e.target.value })}
                        placeholder="0000-0000-0000-0000"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#117b59] focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 text-left"
                        dir="ltr"
                      />
                    </div>
                  )}
                </div>

                {/* Research Experience */}
                {visible("researchExperience") && expSettings.enabled && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      {localize("هل لديك خبرة بحثية سابقة؟", "Do you have previous research experience?")}
                      {required("researchExperience") && <span className="text-rose-500"> *</span>}
                    </label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
                        <input
                          type="radio"
                          name="exp"
                          value="yes"
                          checked={hasResearchExp === "yes"}
                          onChange={() => setHasResearchExp("yes")}
                          className="text-[#117b59] focus:ring-[#117b59]"
                        />
                        <span>{localize("نعم", "Yes")}</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
                        <input
                          type="radio"
                          name="exp"
                          value="no"
                          checked={hasResearchExp === "no"}
                          onChange={() => setHasResearchExp("no")}
                          className="text-[#117b59] focus:ring-[#117b59]"
                        />
                        <span>{localize("لا (مبتدئ)", "No (Beginner)")}</span>
                      </label>
                    </div>
                    {hasResearchExp === "yes" && (
                      <textarea
                        value={researchExpDetails}
                        onChange={(e) => setResearchExpDetails(e.target.value)}
                        placeholder={localize("اذكر ملخصاً بسيطاً (أبحاث منشورة، أو خبرة في التحليل والكتابة)...", "Briefly describe your experience...")}
                        className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs focus:border-[#117b59] focus:outline-none focus:ring-2 focus:ring-[#117b59]/20"
                        rows={2}
                      />
                    )}
                  </div>
                )}

                {/* Fees and Tasks Agreement */}
                {visible("feeAndTaskAgreement") && agreementSettings.enabled && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <div className="flex items-start gap-2">
                      <ShieldCheck size={18} className="text-[#117b59] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-slate-800">
                          {localize("الإقرار بالالتزام بالمهام البحثية ورسوم البرنامج", "Acknowledgment of Tasks and Program Fees")}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 leading-5">
                          {localize(agreementSettings.statementAr, agreementSettings.statementEn)}
                        </p>
                        <div className="mt-3 flex gap-4">
                          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-black text-emerald-800">
                            <input
                              type="radio"
                              name="agree"
                              value="agree"
                              checked={agreeFeesAndTasks === "agree"}
                              onChange={() => setAgreeFeesAndTasks("agree")}
                              className="text-[#117b59] focus:ring-[#117b59]"
                            />
                            <span>{localize("أوافق وأتعهد بالالتزام", "I Agree and Commit")}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                    {error}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#117b59] py-4 text-base font-black text-white shadow-lg transition hover:bg-[#0c6549] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>{localize("جارٍ إرسال طلب التسجيل...", "Submitting Registration...")}</span>
                    </>
                  ) : (
                    <span>{localize("تأكيد التسجيل في الفرصة البحثية ✓", "Confirm Opportunity Registration ✓")}</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
