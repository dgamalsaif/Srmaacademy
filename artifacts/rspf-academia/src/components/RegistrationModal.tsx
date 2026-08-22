import { useState } from "react";
import { X, CheckCircle2, Loader2, UserRound, Building2, MapPin, AtSign } from "lucide-react";
import CountrySelector from "./CountrySelector";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  researchTitle: string;
  researchId?: number;
  /** Used by the coordinator dashboard. This path deliberately has no WhatsApp field. */
  coordinatorEntry?: boolean;
}

const API_BASE = "/api";
const initialForm = {
  fullName: "",
  specialization: "",
  email: "",
  whatsapp: "",
  affiliation: "",
  country: "المملكة العربية السعودية",
  dialCode: "+966",
  city: "",
  orcid: "",
};

export default function RegistrationModal({
  isOpen,
  onClose,
  researchTitle,
  researchId = 0,
  coordinatorEntry = false,
}: RegistrationModalProps) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setForm(initialForm);
    setDone(false);
    setError("");
    setLoading(false);
  };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        // The existing database column remains for historical registrations.
        // Coordinator-created records intentionally keep it blank.
        whatsapp: coordinatorEntry ? "" : `${form.dialCode} ${form.whatsapp}`.trim(),
        researchId,
        researchTitle,
      };
      const response = await fetch(
        coordinatorEntry ? `${API_BASE}/coordinator/registrations` : `${API_BASE}/registrations`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        },
      );
      const result = await response.json().catch(() => ({})) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(result.error || "حدث خطأ أثناء حفظ التسجيل");
      }
      setDone(true);
      if (!coordinatorEntry) {
        const message = encodeURIComponent(
          `مرحباً، أنا ${form.fullName} — ${form.specialization}\nأودّ التسجيل في الفرصة البحثية:\n${researchTitle}\n\n📧 ${form.email}\n🏥 ${form.affiliation}`,
        );
        window.setTimeout(() => window.open(`https://wa.me/966562159258?text=${message}`, "_blank"), 900);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fields: Array<{ label: string; key: "fullName" | "specialization" | "email" | "affiliation"; placeholder: string; icon: typeof UserRound; type: string; ltr?: boolean }> = [
    { label: "الاسم الكامل / Full Name", key: "fullName", placeholder: "د. أحمد محمد", icon: UserRound, type: "text" },
    { label: "التخصص الدقيق / Specialization", key: "specialization", placeholder: "مثال: طب القلب", icon: UserRound, type: "text" },
    { label: "البريد الإلكتروني / Email", key: "email", placeholder: "doctor@example.com", icon: AtSign, type: "email", ltr: true },
    { label: "جهة الانتساب / Affiliation", key: "affiliation", placeholder: "الجامعة أو المستشفى", icon: Building2, type: "text" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-[#0b2540]/60 backdrop-blur-sm" />
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[1.35rem] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur rounded-t-[1.35rem]">
          <button data-testid="button-modal-close" onClick={handleClose} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X size={20} />
          </button>
          <div className="text-right">
            <p className="mb-1 text-xs font-bold text-[#117b59]">{coordinatorEntry ? "تسجيل جديد من لوحة المنسق" : "SRMA Research Academy"}</p>
            <h2 className="text-lg font-black text-[#102b4d]">{coordinatorEntry ? "تسجيل طالب في الفرصة البحثية" : "التسجيل في الفرصة البحثية"}</h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{researchTitle}</p>
          </div>
        </div>

        {done ? (
          <div className="px-7 py-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f3ef]">
              <CheckCircle2 size={34} className="text-[#117b59]" />
            </div>
            <h3 className="text-xl font-black text-[#172238]">تم حفظ التسجيل بنجاح</h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500">
              {coordinatorEntry
                ? "تمت إضافة بيانات الطالب إلى لوحة التسجيلات بنجاح."
                : "تم حفظ بياناتك وسيتم التواصل معك من فريق SRMA قريباً."}
            </p>
            <button onClick={handleClose} className="mt-7 rounded-xl bg-[#0C3156] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#092744]">إغلاق</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
            {coordinatorEntry && <div className="rounded-xl border border-[#d8eee7] bg-[#f3fbf8] px-4 py-3 text-right text-sm leading-6 text-[#28634f]">أدخل بيانات الطالب كما تظهر في مستنداته الأكاديمية. الحقول المطلوبة محددة بعلامة *.</div>}
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-700">⚠️ {error}</div>}
            {fields.map(({ label, key, placeholder, icon: Icon, type, ltr }) => (
              <div key={key}>
                <label className="mb-1.5 block text-right text-sm font-semibold text-slate-700">{label} <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Icon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    data-testid={`input-${key}`}
                    required type={type} placeholder={placeholder} value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    dir={ltr ? "ltr" : undefined}
                    className="w-full rounded-xl border border-slate-200 py-3 pr-10 pl-4 text-right text-sm outline-none transition focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15"
                  />
                </div>
              </div>
            ))}

            {!coordinatorEntry && (
              <div>
                <label className="mb-1.5 block text-right text-sm font-semibold text-slate-700">رقم واتساب <span className="text-rose-500">*</span></label>
                <div className="flex gap-2" dir="ltr">
                  <input data-testid="input-whatsapp" required type="tel" placeholder="5X XXX XXXX" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15" />
                  <span className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-[#117b59]">{form.dialCode}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-right text-sm font-semibold text-slate-700">المدينة / City <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input data-testid="input-city" required type="text" placeholder="الرياض" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-xl border border-slate-200 py-3 pr-10 pl-4 text-right text-sm outline-none transition focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-right text-sm font-semibold text-slate-700">ORCID <span className="font-normal text-slate-400">(اختياري)</span></label>
                <input data-testid="input-orcid" type="text" placeholder="0000-0000-0000-0000" value={form.orcid} onChange={(e) => setForm({ ...form, orcid: e.target.value })} dir="ltr" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm outline-none transition focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15" />
              </div>
            </div>

            <CountrySelector
              country={form.country}
              onCountryChange={(country) => setForm((previous) => ({ ...previous, country }))}
              dialCode={form.dialCode}
              onDialCodeChange={(dialCode) => setForm((previous) => ({ ...previous, dialCode }))}
              id={coordinatorEntry ? "student-country" : "registration-country"}
              required
            />

            <button data-testid="button-submit-registration" type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#117b59] py-3.5 text-base font-bold text-white shadow-[0_8px_18px_rgba(17,123,89,0.18)] transition hover:bg-[#0c6549] disabled:opacity-60">
              {loading ? <><Loader2 size={18} className="animate-spin" /> جارٍ الحفظ...</> : coordinatorEntry ? "حفظ تسجيل الطالب" : "تسجيل الآن"}
            </button>
            {!coordinatorEntry && <p className="text-center text-xs text-slate-400">بعد التسجيل سيفتح واتساب برسالة جاهزة للتواصل</p>}
          </form>
        )}
      </div>
    </div>
  );
}