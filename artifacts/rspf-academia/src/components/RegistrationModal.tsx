import { useEffect, useState } from "react";
import { X, CheckCircle2, Loader2, UserRound, Building2, MapPin, AtSign } from "lucide-react";
import CountrySelector from "./CountrySelector";
import { DEFAULT_SITE_CONTENT_SETTINGS, RegistrationFieldId, SiteContentSettings } from "@/lib/siteContentSettings";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  researchTitle: string;
  researchId?: number;
  coordinatorEntry?: boolean;
}

const API_BASE = "/api";
const initialForm = { fullName: "", specialization: "", email: "", whatsapp: "", affiliation: "", country: "المملكة العربية السعودية", dialCode: "+966", city: "", orcid: "" };

export default function RegistrationModal({ isOpen, onClose, researchTitle, researchId = 0, coordinatorEntry = false }: RegistrationModalProps) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [contentSettings, setContentSettings] = useState<SiteContentSettings>(DEFAULT_SITE_CONTENT_SETTINGS);
  const audience = coordinatorEntry ? "coordinator" : "participant";
  const fieldSetting = (id: RegistrationFieldId) => contentSettings.registrationFields.find((field) => field.id === id) || DEFAULT_SITE_CONTENT_SETTINGS.registrationFields.find((field) => field.id === id)!;
  const visible = (id: RegistrationFieldId) => audience === "participant" ? fieldSetting(id).showParticipant : fieldSetting(id).showCoordinator;
  const required = (id: RegistrationFieldId) => audience === "participant" ? fieldSetting(id).requiredParticipant : fieldSetting(id).requiredCoordinator;

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/site-content-settings")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((settings: SiteContentSettings) => setContentSettings(settings))
      .catch(() => setContentSettings(DEFAULT_SITE_CONTENT_SETTINGS));
  }, [isOpen]);

  const reset = () => { setForm(initialForm); setDone(false); setError(""); setLoading(false); };
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
      };
      const response = await fetch(coordinatorEntry ? `${API_BASE}/coordinator/registrations` : `${API_BASE}/registrations`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error || "حدث خطأ أثناء حفظ التسجيل");
      setDone(true);
      if (!coordinatorEntry && visible("whatsapp")) {
        const message = encodeURIComponent(`مرحباً، أنا ${form.fullName} — ${form.specialization}\nأودّ التسجيل في الفرصة البحثية:\n${researchTitle}\n\n📧 ${form.email}\n🏥 ${form.affiliation}`);
        window.setTimeout(() => window.open(`https://wa.me/966562159258?text=${message}`, "_blank"), 900);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "حدث خطأ غير متوقع");
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
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[1.35rem] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between rounded-t-[1.35rem] border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
          <button data-testid="button-modal-close" onClick={handleClose} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button>
          <div className="text-right">
            <p className="mb-1 text-xs font-bold" style={{ color: contentSettings.accentColor }}>{coordinatorEntry ? "تسجيل جديد من لوحة المنسق" : "SRMA Research Academy"}</p>
            <h2 className="text-lg font-black text-[#102b4d]">{coordinatorEntry ? contentSettings.coordinatorFormTitle : "التسجيل في الفرصة البحثية"}</h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{coordinatorEntry ? contentSettings.coordinatorFormDescription : researchTitle}</p>
          </div>
        </div>

        {done ? (
          <div className="px-7 py-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f3ef]"><CheckCircle2 size={34} style={{ color: contentSettings.accentColor }} /></div>
            <h3 className="text-xl font-black text-[#172238]">تم حفظ التسجيل بنجاح</h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500">{coordinatorEntry ? "تمت إضافة بيانات الطالب إلى لوحة التسجيلات بنجاح." : "تم حفظ بياناتك وسيتم التواصل معك من فريق SRMA قريباً."}</p>
            <button onClick={handleClose} className="mt-7 rounded-xl px-8 py-3 text-sm font-bold text-white transition" style={{ backgroundColor: contentSettings.primaryColor }}>إغلاق</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
            {coordinatorEntry && <div className="rounded-xl border border-[#d8eee7] bg-[#f3fbf8] px-4 py-3 text-right text-sm leading-6 text-[#28634f]">{contentSettings.coordinatorFormDescription}</div>}
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-700">⚠️ {error}</div>}
            {baseFields.filter(({ key }) => visible(key)).map(({ key, icon: Icon, ltr }) => {
              const setting = fieldSetting(key);
              return <div key={key}>
                <label className="mb-1.5 block text-right text-sm font-semibold text-slate-700">{setting.label} {required(key) && <span className="text-rose-500">*</span>}</label>
                <div className="relative">
                  <Icon size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: setting.color }} />
                  <input data-testid={`input-${key}`} required={required(key)} type={setting.type} placeholder={setting.placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} dir={ltr ? "ltr" : undefined} className="w-full rounded-xl border py-3 pr-10 pl-4 text-right text-sm outline-none transition focus:ring-2" style={{ borderColor: `${setting.color}55` }} />
                </div>
              </div>;
            })}

            {visible("whatsapp") && <div>
              <label className="mb-1.5 block text-right text-sm font-semibold text-slate-700">{fieldSetting("whatsapp").label} {required("whatsapp") && <span className="text-rose-500">*</span>}</label>
              <div className="flex gap-2" dir="ltr">
                <input data-testid="input-whatsapp" required={required("whatsapp")} type="tel" placeholder={fieldSetting("whatsapp").placeholder} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none" style={{ borderColor: `${fieldSetting("whatsapp").color}55` }} />
                <span className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold" style={{ color: contentSettings.accentColor }}>{form.dialCode}</span>
              </div>
            </div>}

            {(visible("city") || visible("orcid")) && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visible("city") && <div><label className="mb-1.5 block text-right text-sm font-semibold text-slate-700">{fieldSetting("city").label} {required("city") && <span className="text-rose-500">*</span>}</label><div className="relative"><MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: fieldSetting("city").color }} /><input data-testid="input-city" required={required("city")} type="text" placeholder={fieldSetting("city").placeholder} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-xl border py-3 pr-10 pl-4 text-right text-sm outline-none" style={{ borderColor: `${fieldSetting("city").color}55` }} /></div></div>}
              {visible("orcid") && <div><label className="mb-1.5 block text-right text-sm font-semibold text-slate-700">{fieldSetting("orcid").label} {required("orcid") && <span className="text-rose-500">*</span>}</label><input data-testid="input-orcid" required={required("orcid")} type="text" placeholder={fieldSetting("orcid").placeholder} value={form.orcid} onChange={(e) => setForm({ ...form, orcid: e.target.value })} dir="ltr" className="w-full rounded-xl border px-4 py-3 text-left text-sm outline-none" style={{ borderColor: `${fieldSetting("orcid").color}55` }} /></div>}
            </div>}

            {visible("country") && <CountrySelector country={form.country} onCountryChange={(country) => setForm((previous) => ({ ...previous, country }))} dialCode={form.dialCode} onDialCodeChange={(dialCode) => setForm((previous) => ({ ...previous, dialCode }))} id={coordinatorEntry ? "student-country" : "registration-country"} required={required("country")} />}

            <button data-testid="button-submit-registration" type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white shadow-[0_8px_18px_rgba(17,123,89,0.18)] transition disabled:opacity-60" style={{ backgroundColor: contentSettings.accentColor }}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> جارٍ الحفظ...</> : coordinatorEntry ? "حفظ تسجيل الطالب" : "تسجيل الآن"}
            </button>
            {!coordinatorEntry && visible("whatsapp") && <p className="text-center text-xs text-slate-400">بعد التسجيل سيفتح واتساب برسالة جاهزة للتواصل</p>}
          </form>
        )}
      </div>
    </div>
  );
}