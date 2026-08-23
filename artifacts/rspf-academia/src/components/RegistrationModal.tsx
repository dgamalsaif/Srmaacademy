import { useEffect, useState } from "react";
import { X, CheckCircle2, Loader2, UserRound, Building2, MapPin, AtSign } from "lucide-react";
import CountrySelector from "./CountrySelector";
import { DEFAULT_SITE_CONTENT_SETTINGS, RegistrationFieldId, SiteContentSettings } from "@/lib/siteContentSettings";
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
}

const API_BASE = "/api";
const initialForm = { fullName: "", specialization: "", email: "", whatsapp: "", affiliation: "", country: "المملكة العربية السعودية", dialCode: "+966", city: "", orcid: "" };

export default function RegistrationModal({ isOpen, onClose, researchTitle, researchId = 0, coordinatorEntry = false, firstAuthorSeatsLeft, coAuthorSeatsLeft, onRegistered }: RegistrationModalProps) {
  const { language, localize } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [authorRole, setAuthorRole] = useState<"first_author" | "co_author">("co_author");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [contentSettings, setContentSettings] = useState<SiteContentSettings>(DEFAULT_SITE_CONTENT_SETTINGS);
  const audience = coordinatorEntry ? "coordinator" : "participant";
  const fieldSetting = (id: RegistrationFieldId) => contentSettings.registrationFields.find((field) => field.id === id) || DEFAULT_SITE_CONTENT_SETTINGS.registrationFields.find((field) => field.id === id)!;
  const visible = (id: RegistrationFieldId) => audience === "participant" ? fieldSetting(id).showParticipant : fieldSetting(id).showCoordinator;
  const required = (id: RegistrationFieldId) => audience === "participant" ? fieldSetting(id).requiredParticipant : fieldSetting(id).requiredCoordinator;
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
  const localizedField = (id: RegistrationFieldId) => language === "en" ? fieldText[id] : fieldSetting(id);
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

  const reset = () => { setForm(initialForm); setAuthorRole("co_author"); setDone(false); setError(""); setLoading(false); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        whatsapp: visible("whatsapp") ? `${form.dialCode} ${form.whatsapp}`.trim() : "",
        researchId,
        researchTitle,
        authorRole,
      };
      const response = await fetch(coordinatorEntry ? `${API_BASE}/coordinator/registrations` : `${API_BASE}/registrations`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(submitError(result.error));
      setDone(true);
      onRegistered?.();
      if (!coordinatorEntry && visible("whatsapp")) {
        const message = encodeURIComponent(language === "en"
          ? `Hello, I am ${form.fullName} — ${form.specialization}\nI would like to register for the research opportunity:\n${researchTitle}\n\n📧 ${form.email}\n🏥 ${form.affiliation}`
          : `مرحباً، أنا ${form.fullName} — ${form.specialization}\nأودّ التسجيل في الفرصة البحثية:\n${researchTitle}\n\n📧 ${form.email}\n🏥 ${form.affiliation}`);
        window.setTimeout(() => window.open(`https://wa.me/966562159258?text=${message}`, "_blank"), 900);
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
            <p className="mb-1 text-xs font-bold" style={{ color: contentSettings.accentColor }}>{coordinatorEntry ? localize("تسجيل جديد من لوحة المنسق", "New registration from the coordinator dashboard") : "SRMA Research Academy"}</p>
            <h2 id="registration-dialog-title" className="text-lg font-black text-[#102b4d]">{coordinatorEntry ? localize(contentSettings.coordinatorFormTitle, "Register a student for a research opportunity") : localize("التسجيل في الفرصة البحثية", "Register for the research opportunity")}</h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{coordinatorEntry ? localize(contentSettings.coordinatorFormDescription, "Enter the student's details exactly as they appear in their academic documents.") : researchTitle}</p>
          </div>
        </div>

        {done ? (
          <div className="px-7 py-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f3ef]"><CheckCircle2 size={34} style={{ color: contentSettings.accentColor }} /></div>
            <h3 className="text-xl font-black text-[#172238]">{localize("تم حفظ التسجيل بنجاح", "Registration saved successfully")}</h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500">{coordinatorEntry ? localize("تمت إضافة بيانات الطالب إلى لوحة التسجيلات بنجاح.", "The student's details have been added to the registrations dashboard.") : localize("تم حفظ بياناتك وسيتم التواصل معك من فريق SRMA قريباً.", "Your details have been saved and the SRMA team will contact you soon.")}</p>
            <button onClick={handleClose} className="mt-7 rounded-xl px-8 py-3 text-sm font-bold text-white transition" style={{ backgroundColor: contentSettings.primaryColor }}>{localize("إغلاق", "Close")}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
            {coordinatorEntry && <div className="rounded-xl border border-[#d8eee7] bg-[#f3fbf8] px-4 py-3 text-right text-sm leading-6 text-[#28634f]">{localize(contentSettings.coordinatorFormDescription, "Enter the student's details exactly as they appear in their academic documents.")}</div>}
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

            <button data-testid="button-submit-registration" type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white shadow-[0_8px_18px_rgba(17,123,89,0.18)] transition disabled:opacity-60" style={{ backgroundColor: contentSettings.accentColor }}>
               {loading ? <><Loader2 size={18} className="animate-spin" /> {localize("جارٍ الحفظ...", "Saving...")}</> : coordinatorEntry ? localize("حفظ تسجيل الطالب", "Save student registration") : localize("تسجيل الآن", "Register now")}
            </button>
            {!coordinatorEntry && visible("whatsapp") && <p className="text-center text-xs text-slate-400">{localize("بعد التسجيل سيفتح واتساب برسالة جاهزة للتواصل", "After registration, WhatsApp will open with a ready-to-send contact message.")}</p>}
          </form>
        )}
      </div>
    </div>
  );
}