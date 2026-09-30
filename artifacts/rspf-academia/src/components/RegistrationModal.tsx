import { useEffect, useState } from "react";
import { X, CheckCircle2, Loader2, UserRound, Building2, MapPin, AtSign, ExternalLink, MessageCircle, Send, Mail, Share2, GraduationCap, AlertTriangle, ShieldCheck } from "lucide-react";
import CountrySelector from "./CountrySelector";
import OpportunityPrice from "./OpportunityPrice";
import { DEFAULT_SITE_CONTENT_SETTINGS, RegistrationFieldId, SiteContentSettings, buildForwardingUrl, ForwardingType, DEFAULT_ACADEMIC_DEGREE_SETTINGS, DEFAULT_RESEARCH_EXPERIENCE_SETTINGS, DEFAULT_FEE_AND_TASK_AGREEMENT_SETTINGS } from "@/lib/siteContentSettings";
import { useLanguage } from "@/lib/i18n";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  researchTitle: string;
  researchId?: number;
  coordinatorEntry?: boolean;
  firstAuthorSeatsLeft?: number;
  coAuthorSeatsLeft?: number;
  onRegistered?: () => void;
  priceOriginalSar?: number;
  priceDiscountedSar?: number;
}

const API_BASE = "/api";
const initialForm = { fullName: "", specialization: "", email: "", whatsapp: "", affiliation: "", country: "المملكة العربية السعودية", dialCode: "+966", city: "", orcid: "" };

export default function RegistrationModal({
  isOpen,
  onClose,
  researchTitle,
  researchId = 0,
  coordinatorEntry = false,
  firstAuthorSeatsLeft,
  coAuthorSeatsLeft,
  onRegistered,
  priceOriginalSar,
  priceDiscountedSar,
}: RegistrationModalProps) {
  const { language, localize } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [authorRole, setAuthorRole] = useState<"first_author" | "co_author">("co_author");
  const [academicDegree, setAcademicDegree] = useState("");
  const [hasResearchExp, setHasResearchExp] = useState<"yes" | "no" | "">("");
  const [researchExpDetails, setResearchExpDetails] = useState("");
  const [agreeFeesAndTasks, setAgreeFeesAndTasks] = useState<"agree" | "disagree" | "">("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [researchGroupUrl, setResearchGroupUrl] = useState("");
  const [forwardUrl, setForwardUrl] = useState("");
  const [forwardType, setForwardType] = useState<ForwardingType>("whatsapp");
  const [contentSettings, setContentSettings] = useState<SiteContentSettings>(DEFAULT_SITE_CONTENT_SETTINGS);
  const audience = coordinatorEntry ? "coordinator" : "participant";
  const fieldSetting = (id: RegistrationFieldId) => contentSettings.registrationFields.find((field) => field.id === id) || DEFAULT_SITE_CONTENT_SETTINGS.registrationFields.find((field) => field.id === id)!;
  const visible = (id: RegistrationFieldId) => audience === "participant" ? fieldSetting(id).showParticipant : fieldSetting(id).showCoordinator;
  const required = (id: RegistrationFieldId) => audience === "participant" ? fieldSetting(id).requiredParticipant : fieldSetting(id).requiredCoordinator;
  const degreeSettings = contentSettings.academicDegreeSettings || DEFAULT_ACADEMIC_DEGREE_SETTINGS;
  const expSettings = contentSettings.researchExperienceSettings || DEFAULT_RESEARCH_EXPERIENCE_SETTINGS;
  const agreementSettings = contentSettings.feeAndTaskAgreementSettings || DEFAULT_FEE_AND_TASK_AGREEMENT_SETTINGS;
  const fieldText: Record<RegistrationFieldId, { label: string; placeholder: string }> = {
    fullName: { label: "Full name", placeholder: "Dr. Ahmed Mohammed" },
    specialization: { label: "Specialization", placeholder: "e.g., Cardiology" },
    email: { label: "Email address", placeholder: "doctor@example.com" },
    affiliation: { label: "Affiliation", placeholder: "University or hospital" },
    whatsapp: { label: "WhatsApp number", placeholder: "5X XXX XXXX" },
    city: { label: "City", placeholder: "Riyadh" },
    orcid: { label: "ORCID", placeholder: "0000-0000-0000-0000" },
    country: { label: "Country", placeholder: "" },
  };
  const localizedField = (id: RegistrationFieldId) => {
    const configured = fieldSetting(id);
    if (language !== "en") return configured;
    return {
      ...configured,
      label: configured.labelEn || fieldText[id].label,
      placeholder: configured.placeholderEn || fieldText[id].placeholder,
    };
  };
  const localizedSetting = (arabic: string, english: string, fallback: string) => language === "en" ? (english || fallback) : arabic;
  const submitError = (message?: string) => language === "en"
    ? "We could not save your registration. Please try again."
    : (message || "حدث خطأ أثناء حفظ التسجيل");

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/site-content-settings")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((settings: SiteContentSettings) => setContentSettings(settings))
      .catch(() => setContentSettings(DEFAULT_SITE_CONTENT_SETTINGS));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setAuthorRole(coAuthorSeatsLeft === 0 && (firstAuthorSeatsLeft || 0) > 0 ? "first_author" : "co_author");
  }, [isOpen, firstAuthorSeatsLeft, coAuthorSeatsLeft]);

  const reset = () => {
    setForm(initialForm);
    setAuthorRole("co_author");
    setAcademicDegree("");
    setHasResearchExp("");
    setResearchExpDetails("");
    setAgreeFeesAndTasks("");
    setDone(false);
    setError("");
    setResearchGroupUrl("");
    setLoading(false);
  };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    // Validate mandatory fee & task agreement
    if (audience === "participant" && agreementSettings.enabled && agreementSettings.required) {
      if (agreeFeesAndTasks !== "agree") {
        setError(language === "en" ? agreementSettings.blockingMessageEn : agreementSettings.blockingMessageAr);
        return;
      }
    }

    // Validate academic degree if required
    if (audience === "participant" && degreeSettings.enabled && degreeSettings.required && !academicDegree) {
      setError(localize("يرجى اختيار الدرجة الأكاديمية.", "Please select your academic degree."));
      return;
    }

    // Validate prior research experience if required
    if (audience === "participant" && expSettings.enabled && expSettings.required && !hasResearchExp) {
      setError(localize("يرجى تحديد هل لديك خبرات بحثية سابقة أم لا.", "Please specify whether you have prior research experience."));
      return;
    }

    // Validate research experience details if yes and details are required
    if (audience === "participant" && expSettings.enabled && hasResearchExp === "yes" && expSettings.detailsRequiredWhenYes && !researchExpDetails.trim()) {
      setError(localize("يرجى كتابة وتوضيح تفاصيل خبراتك البحثية السابقة.", "Please describe your previous research experience."));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        whatsapp: visible("whatsapp") ? `${form.dialCode} ${form.whatsapp}`.trim() : "",
        academicDegree: degreeSettings.enabled ? academicDegree : "",
        hasResearchExperience: expSettings.enabled ? hasResearchExp : "",
        researchExperienceDetails: (expSettings.enabled && hasResearchExp === "yes") ? researchExpDetails : "",
        agreedToFeeAndTasks: agreementSettings.enabled ? (agreeFeesAndTasks === "agree" ? "yes" : (agreeFeesAndTasks === "disagree" ? "no" : "")) : "",
        researchId,
        researchTitle,
        authorRole,
        customFields: {
          academicDegree: degreeSettings.enabled ? academicDegree : "",
          hasResearchExperience: expSettings.enabled ? hasResearchExp : "",
          researchExperienceDetails: (expSettings.enabled && hasResearchExp === "yes") ? researchExpDetails : "",
          agreedToFeeAndTasks: agreementSettings.enabled ? (agreeFeesAndTasks === "agree" ? "yes" : (agreeFeesAndTasks === "disagree" ? "no" : "")) : "",
        },
      };
      const response = await fetch(coordinatorEntry ? `${API_BASE}/coordinator/registrations` : `${API_BASE}/registrations`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({})) as { error?: string; researchGroupUrl?: string | null };
      if (!response.ok) throw new Error(submitError(result.error));

      // Resolve specialty group link or research group link
      const specialtyMatch = contentSettings.specialtyOptions.find((opt) =>
        (opt.nameAr && opt.nameAr === form.specialization) ||
        (opt.nameEn && opt.nameEn.toLowerCase() === form.specialization.toLowerCase()) ||
        form.specialization.includes(opt.nameAr) ||
        form.specialization.includes(opt.nameEn)
      );
      const effectiveGroupUrl = (typeof result.researchGroupUrl === "string" && result.researchGroupUrl.startsWith("http"))
        ? result.researchGroupUrl
        : (specialtyMatch?.groupUrl?.trim() || "");
      if (effectiveGroupUrl) {
        setResearchGroupUrl(effectiveGroupUrl);
      }

      // Resolve configured forwarding channel
      const fType = coordinatorEntry
        ? (contentSettings.brand.coordinatorForwardType || "whatsapp")
        : (contentSettings.brand.participantForwardType || "whatsapp");
      const fTarget = coordinatorEntry
        ? (contentSettings.brand.coordinatorForwardTarget || contentSettings.brand.coordinatorWhatsapp || contentSettings.brand.whatsapp || "966562159258")
        : (contentSettings.brand.participantForwardTarget || contentSettings.brand.participantWhatsapp || contentSettings.brand.whatsapp || "966562159258");
      const fAuto = coordinatorEntry
        ? contentSettings.brand.coordinatorAutoRedirect
        : contentSettings.brand.participantAutoRedirect;
      const fMsg = coordinatorEntry
        ? contentSettings.brand.coordinatorCustomMessage
        : contentSettings.brand.participantCustomMessage;

      const generatedUrl = buildForwardingUrl({
        type: fType,
        target: fTarget,
        customMessage: fMsg,
        studentName: form.fullName,
        specialization: form.specialization,
        researchTitle,
        email: form.email,
        affiliation: form.affiliation,
        whatsapp: visible("whatsapp") ? `${form.dialCode} ${form.whatsapp}`.trim() : "",
        academicDegree: degreeSettings.enabled ? academicDegree : undefined,
        hasResearchExperience: expSettings.enabled ? hasResearchExp : undefined,
        language,
      });

      setForwardUrl(generatedUrl);
      setForwardType(fType);
      setDone(true);
      onRegistered?.();

      if (generatedUrl && fAuto && fType !== "none") {
        window.setTimeout(() => {
          try {
            if (fType === "email") {
              window.location.href = generatedUrl;
            } else {
              const link = document.createElement("a");
              link.href = generatedUrl;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              link.click();
            }
          } catch {
            // Screen provides direct button fallback
          }
        }, 800);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : localize("حدث خطأ غير متوقع", "An unexpected error occurred."));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  const baseFields: Array<{ key: "fullName" | "specialization" | "email" | "affiliation"; icon: typeof UserRound; ltr?: boolean }> = [
    { key: "fullName", icon: UserRound }, { key: "specialization", icon: UserRound },
    { key: "email", icon: AtSign, ltr: true }, { key: "affiliation", icon: Building2 },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-[#0b2540]/60 backdrop-blur-sm" />
      <div role="dialog" aria-modal="true" aria-labelledby="registration-dialog-title" className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[1.35rem] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between rounded-t-[1.35rem] border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
          <button data-testid="button-modal-close" aria-label={localize("إغلاق نافذة التسجيل", "Close registration dialog")} onClick={handleClose} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button>
          <div className="text-right">
            <p className="mb-1 text-xs font-bold" style={{ color: contentSettings.accentColor }}>{coordinatorEntry ? localize("تسجيل جديد من لوحة المنسق", "New registration from the coordinator dashboard") : (language === "en" ? contentSettings.brand.siteNameEn : contentSettings.brand.siteNameAr)}</p>
            <h2 id="registration-dialog-title" className="text-lg font-black text-[#102b4d]">{coordinatorEntry ? localizedSetting(contentSettings.coordinatorFormTitle, contentSettings.coordinatorFormTitleEn, "Register a student for a research opportunity") : localize("التسجيل في الفرصة البحثية", "Register for the research opportunity")}</h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{coordinatorEntry ? localizedSetting(contentSettings.coordinatorFormDescription, contentSettings.coordinatorFormDescriptionEn, "Enter the student's details exactly as they appear in their academic documents.") : researchTitle}</p>
          </div>
        </div>

        {done ? (
          <div className="px-7 py-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f3ef]"><CheckCircle2 size={34} style={{ color: contentSettings.accentColor }} /></div>
            <h3 className="text-xl font-black text-[#172238]">{localize("تم حفظ التسجيل بنجاح", "Registration saved successfully")}</h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500">{coordinatorEntry ? localize("تمت إضافة بيانات الطالب إلى لوحة التسجيلات بنجاح.", "The student's details have been added to the registrations dashboard.") : localize(`تم حفظ بياناتك وسيتم التواصل معك من فريق ${contentSettings.brand.siteNameAr} قريباً.`, `Your details have been saved and the ${contentSettings.brand.siteNameEn} team will contact you soon.`)}</p>

            {forwardUrl && forwardType !== "none" && (
              <a
                href={forwardUrl}
                target={forwardType === "email" ? undefined : "_blank"}
                rel={forwardType === "email" ? undefined : "noopener noreferrer"}
                className="mx-auto mt-5 flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-[#117b59] px-5 py-3.5 text-sm font-black text-white shadow-md transition hover:bg-[#0c6549]"
              >
                {forwardType === "email" ? <Mail size={18} /> : forwardType === "telegram" ? <Send size={18} /> : <MessageCircle size={18} />}
                {forwardType === "email"
                  ? localize("إرسال البيانات عبر البريد الإلكتروني", "Send details via Email")
                  : forwardType === "telegram"
                  ? localize("إرسال البيانات عبر تيليجرام", "Send details via Telegram")
                  : forwardType === "messenger"
                  ? localize("إرسال البيانات عبر فيسبوك ماسنجر", "Send details via Messenger")
                  : forwardType === "instagram"
                  ? localize("التواصل عبر إنستجرام", "Send details via Instagram")
                  : forwardType === "custom_url"
                  ? localize("متابعة إرسال البيانات", "Proceed to submission")
                  : localize("إرسال البيانات ومتابعة التسجيل", "Send details & proceed")}
              </a>
            )}

            {researchGroupUrl && (
              <a
                href={researchGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-auto mt-3 flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-black text-white shadow-md transition hover:bg-[#1eb856]"
              >
                <ExternalLink size={17} />{localize("الانضمام إلى قروب التخصص / الباحثين", "Join the researchers & specialty group")}
              </a>
            )}

            <button onClick={handleClose} className="mt-7 rounded-xl px-8 py-3 text-sm font-bold text-white transition" style={{ backgroundColor: contentSettings.primaryColor }}>{localize("إغلاق", "Close")}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
            {coordinatorEntry && <div className="rounded-xl border border-[#d8eee7] bg-[#f3fbf8] px-4 py-3 text-right text-sm leading-6 text-[#28634f]">{localizedSetting(contentSettings.coordinatorFormDescription, contentSettings.coordinatorFormDescriptionEn, "Enter the student's details exactly as they appear in their academic documents.")}</div>}
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-700">⚠️ {error}</div>}
            {baseFields.filter(({ key }) => visible(key)).map(({ key, icon: Icon, ltr }) => {
              const setting = fieldSetting(key);
              return <div key={key}>
                <label className="mb-1.5 block text-right text-sm font-semibold text-slate-700">{localizedField(key).label} {required(key) && <span className="text-rose-500">*</span>}</label>
                <div className="relative">
                  <Icon size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: setting.color }} />
                  <input data-testid={`input-${key}`} required={required(key)} type={setting.type} placeholder={localizedField(key).placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} dir={ltr ? "ltr" : undefined} className="w-full rounded-xl border py-3 pr-10 pl-4 text-right text-sm outline-none transition focus:ring-2" style={{ borderColor: `${setting.color}55` }} />
                </div>
              </div>;
            })}

            {visible("whatsapp") && <div>
              <label className="mb-1.5 block text-right text-sm font-semibold text-slate-700">{localizedField("whatsapp").label} {required("whatsapp") && <span className="text-rose-500">*</span>}</label>
              <div className="flex gap-2" dir="ltr">
                <input data-testid="input-whatsapp" required={required("whatsapp")} type="tel" placeholder={localizedField("whatsapp").placeholder} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none" style={{ borderColor: `${fieldSetting("whatsapp").color}55` }} />
                <span className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold" style={{ color: contentSettings.accentColor }}>{form.dialCode}</span>
              </div>
            </div>}

            {(visible("city") || visible("orcid")) && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visible("city") && <div><label className="mb-1.5 block text-right text-sm font-semibold text-slate-700">{localizedField("city").label} {required("city") && <span className="text-rose-500">*</span>}</label><div className="relative"><MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: fieldSetting("city").color }} /><input data-testid="input-city" required={required("city")} type="text" placeholder={localizedField("city").placeholder} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-xl border py-3 pr-10 pl-4 text-right text-sm outline-none" style={{ borderColor: `${fieldSetting("city").color}55` }} /></div></div>}
              {visible("orcid") && <div><label className="mb-1.5 block text-right text-sm font-semibold text-slate-700">{localizedField("orcid").label} {required("orcid") && <span className="text-rose-500">*</span>}</label><input data-testid="input-orcid" required={required("orcid")} type="text" placeholder={localizedField("orcid").placeholder} value={form.orcid} onChange={(e) => setForm({ ...form, orcid: e.target.value })} dir="ltr" className="w-full rounded-xl border px-4 py-3 text-left text-sm outline-none" style={{ borderColor: `${fieldSetting("orcid").color}55` }} /></div>}
            </div>}

            {visible("country") && <CountrySelector country={form.country} onCountryChange={(country) => setForm((previous) => ({ ...previous, country }))} dialCode={form.dialCode} onDialCodeChange={(dialCode) => setForm((previous) => ({ ...previous, dialCode }))} id={coordinatorEntry ? "student-country" : "registration-country"} required={required("country")} />}

            {!coordinatorEntry && (priceDiscountedSar || priceOriginalSar) && (
              <div className="rounded-xl overflow-hidden mb-2">
                <OpportunityPrice
                  originalSar={priceOriginalSar || 2500}
                  discountedSar={priceDiscountedSar || 1500}
                  compact
                />
              </div>
            )}

            {!coordinatorEntry && (typeof firstAuthorSeatsLeft === "number" || typeof coAuthorSeatsLeft === "number") && (
              <div className="rounded-xl border border-[#d8eee7] bg-[#f3fbf8] p-4 text-right">
                <label className="mb-2 block text-sm font-black text-[#174c3d]">{localize("دور التأليف المطلوب", "Requested authorship role")}</label>
                <select data-testid="select-author-role" value={authorRole} onChange={(event) => setAuthorRole(event.target.value as "first_author" | "co_author")} className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200">
                  <option value="first_author" disabled={(firstAuthorSeatsLeft || 0) < 1}>{localize(`الكاتب الأول — متاح ${firstAuthorSeatsLeft || 0} من 1`, `First author — ${firstAuthorSeatsLeft || 0} of 1 available`)}</option>
                  <option value="co_author" disabled={(coAuthorSeatsLeft || 0) < 1}>{localize(`مؤلف مشارك — متاح ${coAuthorSeatsLeft || 0}`, `Co-author — ${coAuthorSeatsLeft || 0} available`)}</option>
                </select>
                <p className="mt-2 text-xs leading-5 text-slate-500">{localize("يُحجز الدور المختار فوراً عند حفظ التسجيل، ولا يمكن تجاوزه بعد اكتمال مقاعده.", "The selected role is reserved immediately when the registration is saved and cannot be selected once its seats are filled.")}</p>
              </div>
            )}

            {/* 1. Academic Degree Field (الدرجة الأكاديمية) */}
            {degreeSettings.enabled && (
              <div className="text-right">
                <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>
                    {language === "en" ? degreeSettings.labelEn : degreeSettings.labelAr}{" "}
                    {degreeSettings.required && <span className="text-rose-500">*</span>}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <GraduationCap size={15} />
                    <span>{localize("الدرجة الأكاديمية", "Academic Degree")}</span>
                  </span>
                </label>
                <div className="relative">
                  <select
                    data-testid="select-academic-degree"
                    required={degreeSettings.required}
                    value={academicDegree}
                    onChange={(e) => setAcademicDegree(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-right text-sm font-medium text-slate-800 outline-none transition focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/20"
                  >
                    <option value="" disabled>
                      {localize("— اختر الدرجة الأكاديمية (امتياز، استشاري، رزدنت...) —", "— Select Academic Degree (Intern, Consultant, Resident...) —")}
                    </option>
                    {degreeSettings.options.map((opt) => (
                      <option key={opt.id} value={language === "en" ? opt.nameEn : opt.nameAr}>
                        {language === "en" ? opt.nameEn : opt.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 2. Prior Research Experience Field (الخبرات البحثية السابقة) */}
            {expSettings.enabled && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-right">
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  {language === "en" ? expSettings.labelEn : expSettings.labelAr}{" "}
                  {expSettings.required && <span className="text-rose-500">*</span>}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    data-testid="button-research-exp-yes"
                    onClick={() => setHasResearchExp("yes")}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs sm:text-sm font-black transition-all ${
                      hasResearchExp === "yes"
                        ? "border-[#117b59] bg-[#e6f5ef] text-[#117b59] shadow-sm ring-2 ring-[#117b59]/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle2 size={16} className={hasResearchExp === "yes" ? "text-[#117b59]" : "text-slate-400"} />
                    <span>{language === "en" ? expSettings.yesLabelEn : expSettings.yesLabelAr}</span>
                  </button>
                  <button
                    type="button"
                    data-testid="button-research-exp-no"
                    onClick={() => {
                      setHasResearchExp("no");
                      setResearchExpDetails("");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs sm:text-sm font-black transition-all ${
                      hasResearchExp === "no"
                        ? "border-slate-500 bg-slate-200 text-slate-900 shadow-sm ring-2 ring-slate-400/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{language === "en" ? expSettings.noLabelEn : expSettings.noLabelAr}</span>
                  </button>
                </div>

                {hasResearchExp === "yes" && (
                  <div className="mt-3.5 pt-3 border-t border-slate-200/80 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">
                      {language === "en" ? expSettings.detailsLabelEn : expSettings.detailsLabelAr}{" "}
                      {expSettings.detailsRequiredWhenYes && <span className="text-rose-500">*</span>}
                    </label>
                    <textarea
                      data-testid="textarea-research-exp-details"
                      required={expSettings.detailsRequiredWhenYes}
                      rows={3}
                      value={researchExpDetails}
                      onChange={(e) => setResearchExpDetails(e.target.value)}
                      placeholder={language === "en" ? expSettings.detailsPlaceholderEn : expSettings.detailsPlaceholderAr}
                      className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3 text-right text-xs leading-5 text-slate-800 outline-none transition focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/20"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 3. Mandatory Fee & Tasks Agreement (إقرار دفع الرسوم والمهام) */}
            {!coordinatorEntry && agreementSettings.enabled && (
              <div
                data-testid="fee-task-agreement-card"
                className={`rounded-2xl border p-4 text-right transition-all ${
                  agreeFeesAndTasks === "disagree"
                    ? "border-rose-400 bg-rose-50/90 shadow-sm"
                    : agreeFeesAndTasks === "agree"
                    ? "border-emerald-300 bg-emerald-50/60 shadow-sm"
                    : "border-amber-300 bg-amber-50/50"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`mt-0.5 rounded-xl p-2 shrink-0 ${
                    agreeFeesAndTasks === "disagree"
                      ? "bg-rose-100 text-rose-700"
                      : agreeFeesAndTasks === "agree"
                      ? "bg-emerald-100 text-[#117b59]"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    <ShieldCheck size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-black leading-6 text-slate-900">
                      {language === "en" ? agreementSettings.questionEn : agreementSettings.questionAr}
                      {agreementSettings.required && <span className="mr-1 text-rose-500 font-bold">*</span>}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-slate-500 leading-4">
                      {localize(
                        "شرط إلزامي من أجل التحليل والاعتماد ضمن الفريق البحثي والالتزام بالمهام والمواعيد المحددة.",
                        "Mandatory requirement for inclusion in the research team and commitment to tasks and timelines."
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    data-testid="button-agreement-agree"
                    onClick={() => {
                      setAgreeFeesAndTasks("agree");
                      if (error) setError("");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 px-3 text-xs sm:text-sm font-black transition-all ${
                      agreeFeesAndTasks === "agree"
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-500/30"
                        : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    <CheckCircle2 size={17} />
                    <span>{language === "en" ? agreementSettings.agreeLabelEn : agreementSettings.agreeLabelAr}</span>
                  </button>

                  <button
                    type="button"
                    data-testid="button-agreement-disagree"
                    onClick={() => {
                      setAgreeFeesAndTasks("disagree");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 px-3 text-xs sm:text-sm font-black transition-all ${
                      agreeFeesAndTasks === "disagree"
                        ? "border-rose-600 bg-rose-600 text-white shadow-md shadow-rose-700/20 ring-2 ring-rose-500/30"
                        : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50"
                    }`}
                  >
                    <AlertTriangle size={17} />
                    <span>{language === "en" ? agreementSettings.disagreeLabelEn : agreementSettings.disagreeLabelAr}</span>
                  </button>
                </div>

                {agreeFeesAndTasks === "disagree" && (
                  <div
                    data-testid="agreement-rejection-warning"
                    className="mt-3.5 flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-100 p-3 text-rose-900 text-xs font-bold leading-5 animate-in fade-in duration-200"
                  >
                    <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <p>{language === "en" ? agreementSettings.warningNoticeEn : agreementSettings.warningNoticeAr}</p>
                      <p className="mt-1 text-[11px] font-black text-rose-700">
                        {language === "en" ? agreementSettings.blockingMessageEn : agreementSettings.blockingMessageAr}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              data-testid="button-submit-registration"
              type="submit"
              disabled={loading || (!coordinatorEntry && agreementSettings.enabled && agreementSettings.required && agreeFeesAndTasks === "disagree")}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white shadow-[0_8px_18px_rgba(17,123,89,0.18)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: (!coordinatorEntry && agreementSettings.enabled && agreementSettings.required && agreeFeesAndTasks === "disagree") ? "#94a3b8" : contentSettings.accentColor }}
            >
               {loading ? (
                 <><Loader2 size={18} className="animate-spin" /> {localize("جارٍ الحفظ...", "Saving...")}</>
               ) : !coordinatorEntry && agreementSettings.enabled && agreementSettings.required && agreeFeesAndTasks === "disagree" ? (
                 localize("التسجيل غير متاح دون الموافقة", "Registration not allowed without agreement")
               ) : coordinatorEntry ? (
                 localize("حفظ تسجيل الطالب", "Save student registration")
               ) : (
                 localize("تسجيل الآن", "Register now")
               )}
            </button>
            {!coordinatorEntry && visible("whatsapp") && <p className="text-center text-xs text-slate-400">{localize("بعد التسجيل سيفتح واتساب برسالة جاهزة للتواصل", "After registration, WhatsApp will open with a ready-to-send contact message.")}</p>}
          </form>
        )}
      </div>
    </div>
  );
}