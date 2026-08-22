import { useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  researchTitle: string;
  researchId?: number;
}

const API_BASE = "/api";

export default function RegistrationModal({ isOpen, onClose, researchTitle, researchId = 0 }: RegistrationModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    specialization: "",
    email: "",
    whatsapp: "",
    affiliation: "",
    country: "المملكة العربية السعودية",
    city: "",
    orcid: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setForm({ fullName: "", specialization: "", email: "", whatsapp: "", affiliation: "", country: "المملكة العربية السعودية", city: "", orcid: "" });
    setDone(false);
    setError("");
    setLoading(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          researchId,
          researchTitle,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || "حدث خطأ أثناء الإرسال");
      }

      setDone(true);

      // Open WhatsApp with pre-filled message
      const waMessage = encodeURIComponent(
        `مرحباً، أنا ${form.fullName} — ${form.specialization}\n` +
        `أودّ التسجيل في الفرصة البحثية:\n${researchTitle}\n\n` +
        `📧 ${form.email}\n📱 ${form.whatsapp}\n🏥 ${form.affiliation}`
      );
      setTimeout(() => {
        window.open(`https://wa.me/966562159258?text=${waMessage}`, "_blank");
      }, 1200);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 rounded-t-2xl">
          <div className="flex items-start justify-between gap-3">
            <button data-testid="button-modal-close" onClick={handleClose} className="text-slate-400 hover:text-slate-600 mt-1 flex-shrink-0">
              <X size={20} />
            </button>
            <div className="text-right">
              <h2 className="text-lg font-bold text-[#0C3156]">التسجيل في الفرصة البحثية</h2>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{researchTitle}</p>
            </div>
          </div>
        </div>

        {/* Success state */}
        {done ? (
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">تم استلام طلبك بنجاح!</h3>
            <p className="text-slate-500 text-sm mb-2">تم حفظ بياناتك وسيتواصل معك فريق SRMA قريباً.</p>
            <p className="text-slate-500 text-sm mb-6">سيفتح واتساب تلقائياً مع رسالتك...</p>
            <div className="flex gap-3 justify-center">
              <a
                href={`https://wa.me/966562159258?text=${encodeURIComponent(`مرحباً، أنا ${form.fullName} — أودّ التسجيل في: ${researchTitle}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-[#1eb856] transition-colors"
              >
                فتح واتساب يدوياً
              </a>
              <button onClick={handleClose} className="border border-slate-200 text-slate-600 font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-slate-50">
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm text-right">
                ⚠️ {error}
              </div>
            )}

            {[
              { label: "الاسم الكامل — Full Name", key: "fullName", placeholder: "د. أحمد محمد", type: "text" },
              { label: "التخصص الدقيق — Specialization", key: "specialization", placeholder: "مثال: طب القلب", type: "text" },
              { label: "البريد الإلكتروني — Email", key: "email", placeholder: "doctor@example.com", type: "email", ltr: true },
              { label: "جهة الانتساب — Affiliation", key: "affiliation", placeholder: "مستشفى الملك فيصل التخصصي", type: "text" },
            ].map(({ label, key, placeholder, type, ltr }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-slate-700 mb-1 text-right">{label} <span className="text-red-500">*</span></label>
                <input
                  data-testid={`input-${key}`}
                  type={type}
                  required
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  dir={ltr ? "ltr" : undefined}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/25 focus:border-[#0C3156] transition-colors"
                />
              </div>
            ))}

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 text-right">
                رقم واتساب — WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  data-testid="input-whatsapp"
                  type="tel"
                  required
                  placeholder="578032336"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/25 focus:border-[#0C3156]"
                />
                <span className="flex items-center px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 flex-shrink-0">
                  🇸🇦 +966
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 text-right">المدينة</label>
                <input
                  data-testid="input-city"
                  type="text"
                  placeholder="الرياض"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/25 focus:border-[#0C3156]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 text-right">الدولة</label>
                <select
                  data-testid="select-country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/25 focus:border-[#0C3156] bg-white"
                >
                  <option>المملكة العربية السعودية</option>
                  <option>البحرين</option>
                  <option>قطر</option>
                  <option>عُمان</option>
                  <option>الكويت</option>
                  <option>الإمارات</option>
                  <option>أخرى</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 text-right">
                ORCID Number <span className="text-slate-400 font-normal">(اختياري)</span>
              </label>
              <input
                data-testid="input-orcid"
                type="text"
                placeholder="0000-0000-0000-0000"
                value={form.orcid}
                onChange={(e) => setForm({ ...form, orcid: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/25 focus:border-[#0C3156]"
                dir="ltr"
              />
            </div>

            <button
              data-testid="button-submit-registration"
              type="submit"
              disabled={loading}
              className="w-full bg-[#0C3156] text-white font-bold py-3.5 rounded-xl hover:bg-[#0a2847] transition-colors text-base mt-2 shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> جاري الإرسال...</>
              ) : (
                "تسجيل الآن 👤"
              )}
            </button>

            <p className="text-center text-xs text-slate-400 mt-1">
              بعد التسجيل سيفتح واتساب تلقائياً مع بياناتك
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
