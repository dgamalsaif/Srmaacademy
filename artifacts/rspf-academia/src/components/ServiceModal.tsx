import { useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
}

const API_BASE = "/api";

const serviceTypes = [
  { value: "إعداد الدراسة البحثية", label: "Research study preparation" },
  { value: "رسائل الماجستير", label: "Master's theses" },
  { value: "رسائل الدكتوراه", label: "Doctoral dissertations" },
  { value: "التحكيم العلمي", label: "Scientific peer review" },
  { value: "الترجمة الأكاديمية", label: "Academic translation" },
  { value: "التدقيق والمراجعة", label: "Editing and proofreading" },
  { value: "التحليل الإحصائي", label: "Statistical analysis" },
  { value: "خدمات أخرى", label: "Other services" },
];

export default function ServiceModal({ isOpen, onClose, serviceName }: ServiceModalProps) {
  const { language, localize } = useLanguage();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    serviceType: serviceName,
    details: "",
    fileLink: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setForm({ fullName: "", phone: "", email: "", serviceType: serviceName, details: "", fileLink: "" });
    setDone(false);
    setError("");
    setLoading(false);
  };

  const handleClose = () => { reset(); onClose(); };
  const serviceLabel = (value: string) => language === "en"
    ? serviceTypes.find((service) => service.value === value)?.label || value
    : value;
  const requestError = (message?: string) => language === "en"
    ? "We could not submit your request. Please try again."
    : (message || "حدث خطأ أثناء الإرسال");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/service-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(requestError((body as { error?: string }).error));
      }

      setDone(true);

      // Open WhatsApp with pre-filled message
      const waMessage = encodeURIComponent(
        language === "en"
          ? `Hello, I am ${form.fullName}\nI am requesting: ${serviceLabel(form.serviceType)}\n\n📱 ${form.phone}\n📧 ${form.email}\n\nDetails: ${form.details}`
          : `مرحباً، أنا ${form.fullName}\nأطلب خدمة: ${form.serviceType}\n\n📱 ${form.phone}\n📧 ${form.email}\n\nالتفاصيل: ${form.details}`
      );
      setTimeout(() => {
        window.open(`https://wa.me/966562159258?text=${waMessage}`, "_blank");
      }, 1200);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : localize("حدث خطأ غير متوقع", "An unexpected error occurred."));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <button data-testid="button-service-modal-close" aria-label={localize("إغلاق نافذة طلب الخدمة", "Close service request dialog")} onClick={handleClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <div className="text-right">
              <h2 className="text-lg font-bold text-[#0C3156]">{serviceLabel(form.serviceType || serviceName)}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{localize("يرجى ملء النموذج لتقديم طلبك", "Please complete the form to submit your request.")}</p>
            </div>
          </div>
        </div>

        {/* Success state */}
        {done ? (
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{localize("تم استلام طلبك!", "Your request has been received!")}</h3>
            <p className="text-slate-500 text-sm mb-2">{localize("تم حفظ طلبك وسيتواصل معك الفريق خلال 24 ساعة.", "Your request has been saved and the team will contact you within 24 hours.")}</p>
            <p className="text-slate-500 text-sm mb-6">{localize("سيفتح واتساب تلقائياً...", "WhatsApp will open automatically...")}</p>
            <div className="flex gap-3 justify-center">
              <a
                href={`https://wa.me/966562159258?text=${encodeURIComponent(language === "en" ? `Hello, I am ${form.fullName} — I am requesting: ${serviceLabel(form.serviceType)}` : `مرحباً، أنا ${form.fullName} — أطلب خدمة: ${form.serviceType}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-[#1eb856] transition-colors"
              >
                {localize("فتح واتساب يدوياً", "Open WhatsApp manually")}
              </a>
              <button onClick={handleClose} className="border border-slate-200 text-slate-600 font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-slate-50">
                {localize("إغلاق", "Close")}
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
              { label: localize("الاسم الكامل", "Full name"), key: "fullName", placeholder: localize("الاسم الكامل", "Full name"), type: "text" },
              { label: localize("رقم الجوال (واتساب)", "Mobile number (WhatsApp)"), key: "phone", placeholder: "+966 56 215 9258", type: "tel" },
              { label: localize("البريد الإلكتروني", "Email address"), key: "email", placeholder: "example@email.com", type: "email", ltr: true },
            ].map(({ label, key, placeholder, type, ltr }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-slate-700 mb-1 text-right">{label} <span className="text-red-500">*</span></label>
                <input
                  data-testid={`input-service-${key}`}
                  type={type}
                  required
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  dir={ltr ? "ltr" : undefined}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/25 focus:border-[#0C3156]"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 text-right">{localize("نوع الخدمة", "Service type")}</label>
              <select
                data-testid="select-service-type"
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/25 focus:border-[#0C3156] bg-white"
              >
                {serviceTypes.map((service) => <option key={service.value} value={service.value}>{language === "en" ? service.label : service.value}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 text-right">{localize("تفاصيل الطلب", "Request details")} <span className="text-red-500">*</span></label>
              <textarea
                data-testid="textarea-service-details"
                required
                rows={4}
                placeholder={localize("يرجى وصف احتياجك بالتفصيل...", "Please describe your needs in detail...")}
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/25 focus:border-[#0C3156] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 text-right">
                {localize("رابط الملفات", "File link")} <span className="text-slate-400 font-normal">{localize("(اختياري)", "(optional)")}</span>
              </label>
              <input
                data-testid="input-service-file-link"
                type="url"
                placeholder="https://drive.google.com/..."
                value={form.fileLink}
                onChange={(e) => setForm({ ...form, fileLink: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/25 focus:border-[#0C3156]"
                dir="ltr"
              />
            </div>

            <button
              data-testid="button-submit-service"
              type="submit"
              disabled={loading}
              className="w-full bg-[#E9A020] text-white font-bold py-3.5 rounded-xl hover:bg-[#d08e10] transition-colors text-base shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> {localize("جاري الإرسال...", "Submitting...")}</>
              ) : (
                localize("تقديم الطلب الآن 📤", "Submit request now 📤")
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-1">
              {localize("بعد التقديم سيفتح واتساب تلقائياً مع بياناتك", "After submission, WhatsApp will open automatically with your details.")}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
