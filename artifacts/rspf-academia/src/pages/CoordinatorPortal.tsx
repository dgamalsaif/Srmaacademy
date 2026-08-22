import { useState } from "react";
import { Shield, Eye, EyeOff, ArrowLeft, Headphones, X, CheckCircle2, Loader2, UserRound, Mail, Phone, Building2 } from "lucide-react";
import { useLocation } from "wouter";
import CountrySelector from "@/components/CountrySelector";

export default function CoordinatorPortal() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/coordinator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json() as { error?: string };
      if (response.ok) {
      setError("");
      setLocation("/admin");
      } else {
        setError(result.error || "تعذر تسجيل الدخول");
      }
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fa] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[430px]">
        <div className="text-center mb-7">
          <p className="text-sm font-bold text-[#0C3156] mb-2">بوابة المنسق — SRMA Research Academy</p>
          <h1 className="text-2xl font-black text-[#172238]">بوابة المنسقين</h1>
          <p className="text-sm text-slate-500 mt-2">سجّل دخولك برمز الوصول الخاص بك</p>
        </div>

        <div className="page-enter bg-white rounded-2xl shadow-[0_18px_45px_rgba(17,38,59,0.10)] border border-slate-200/80 p-8 text-center">
          <div className="w-14 h-14 bg-[#e7f3ef] rounded-full flex items-center justify-center mx-auto mb-5">
            <Shield size={27} className="text-[#117b59]" strokeWidth={2.2} />
          </div>
          <h2 className="text-xl font-black text-[#172238] mb-2">دخول المنسق</h2>
          <p className="text-slate-500 text-sm mb-7">أدخل رمز الدخول للوصول إلى لوحة إدارة الفرص والطلاب</p>

          <form onSubmit={handleSubmit} className="space-y-4">
             <input type="text" name="username" autoComplete="username" tabIndex={-1} aria-hidden="true" className="absolute h-0 w-0 opacity-0 pointer-events-none" />
            <div className="relative">
              <label htmlFor="coordinator-password" className="block text-right text-sm font-semibold text-[#263447] mb-2">
                رمز الدخول
              </label>
              <input
                id="coordinator-password"
                data-testid="input-coordinator-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="أدخل الرمز هنا..."
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className={`w-full border rounded-xl px-5 py-3.5 text-right text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
                  error ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-[#117b59]/20 focus:border-[#117b59]"
                }`}
              />
              <button
                type="button"
                data-testid="button-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm text-right bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              data-testid="button-coordinator-login"
              type="submit"
              className="w-full bg-[#117b59] text-white font-bold py-3.5 rounded-xl hover:bg-[#0c6549] transition-colors text-base shadow-[0_8px_18px_rgba(17,123,89,0.18)] flex items-center justify-center gap-2"
            >
              دخول
              <ArrowLeft size={17} />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              لا تملك حساباً؟{" "}
              <button type="button" onClick={() => setRequestOpen(true)}
                data-testid="link-coordinator-help"
                className="text-[#117b59] font-bold hover:underline inline-flex items-center gap-1">
                سجّل الآن
                <Headphones size={14} />
              </button>
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">
          البوابة مخصصة للمنسقين المعتمدين فقط
        </p>
      </div>
      {requestOpen && <CoordinatorRequestModal onClose={() => setRequestOpen(false)} />}
    </div>
  );
}

interface CoordinatorRequestModalProps {
  onClose: () => void;
}

function CoordinatorRequestModal({ onClose }: CoordinatorRequestModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    affiliation: "",
    country: "المملكة العربية السعودية",
    dialCode: "+966",
  });
  const [loading, setLoading] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");
  const [error, setError] = useState("");

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: `${form.dialCode} ${form.phone}`.trim(),
          email: form.email,
          serviceType: "طلب اعتماد منسق بحثي",
          details: `أرغب في الانضمام كمنسق للأبحاث العلمية في SRMA Research Academy. جهة الانتساب: ${form.affiliation}. الدولة: ${form.country}`,
          fileLink: "",
        }),
      });
      const saved = await response.json() as { id?: number; error?: string };
      if (!response.ok || !saved.id) throw new Error(saved.error || "تعذر إرسال الطلب");
      const number = `SRMA-COORD-${String(saved.id).padStart(4, "0")}`;
      setRequestNumber(number);
      const message = encodeURIComponent(
        `طلب اعتماد منسق بحثي جديد\n\nالاسم: ${form.fullName}\nالهاتف: ${form.dialCode} ${form.phone}\nالبريد: ${form.email}\nجهة الانتساب: ${form.affiliation}\nالدولة: ${form.country}\nرقم الطلب: ${number}`
      );
      window.open(`https://wa.me/966562159258?text=${message}`, "_blank", "noopener,noreferrer");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#102d2a]/45 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl page-enter" onClick={(event) => event.stopPropagation()} dir="rtl">
        <button type="button" onClick={onClose} data-testid="button-close-coordinator-request" className="absolute left-5 top-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <X size={19} />
        </button>
        {requestNumber ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f3ef]">
              <CheckCircle2 size={32} className="text-[#117b59]" />
            </div>
            <h2 className="text-xl font-black text-[#172238]">تم إرسال طلبك بنجاح</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">تم إشعار الإدارة برسالة واتساب، وسيتم التواصل معك بعد مراجعة الطلب.</p>
            <div className="my-5 rounded-xl border border-[#d8eee7] bg-[#f3fbf8] px-4 py-3">
              <p className="text-xs text-[#568477]">رقم طلب المتابعة</p>
              <p data-testid="text-coordinator-request-number" className="mt-1 font-black tracking-wider text-[#117b59]" dir="ltr">{requestNumber}</p>
            </div>
            <p className="text-xs leading-6 text-slate-400">بعد اعتمادك سيصلك رمز الدخول من الإدارة عبر واتساب أو البريد الإلكتروني.</p>
            <button type="button" onClick={onClose} data-testid="button-close-request-success" className="mt-6 w-full rounded-xl bg-[#117b59] py-3 font-bold text-white transition hover:bg-[#0c6549]">إغلاق</button>
          </div>
        ) : (
          <>
            <div className="mb-6 border-b border-slate-100 pb-5">
              <p className="text-xs font-bold text-[#117b59]">طلب اعتماد جديد</p>
              <h2 className="mt-1 text-xl font-black text-[#172238]">كن منسقاً للأبحاث العلمية</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">أدخل بياناتك، وسنرسل طلبك مباشرة إلى إدارة SRMA للمراجعة.</p>
            </div>
            <form onSubmit={submitRequest} className="space-y-4">
              {[
                { key: "fullName", label: "الاسم الكامل", placeholder: "د. أحمد محمد", icon: UserRound, type: "text" },
                { key: "email", label: "البريد الإلكتروني", placeholder: "name@example.com", icon: Mail, type: "email" },
                { key: "affiliation", label: "جهة الانتساب", placeholder: "الجامعة أو المستشفى", icon: Building2, type: "text" },
              ].map(({ key, label, placeholder, icon: Icon, type }) => (
                <div key={key}>
                  <label htmlFor={`coordinator-${key}`} className="mb-1.5 block text-right text-sm font-semibold text-[#263447]">{label}</label>
                  <div className="relative">
                    <Icon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id={`coordinator-${key}`}
                      data-testid={`input-coordinator-${key}`}
                      required
                      type={type}
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 py-3 pr-10 pl-4 text-right text-sm outline-none transition focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15"
                      dir={key === "email" || key === "phone" ? "ltr" : undefined}
                    />
                  </div>
                </div>
              ))}
              <div>
                <label htmlFor="coordinator-phone" className="mb-1.5 block text-right text-sm font-semibold text-[#263447]">رقم واتساب</label>
                <div className="relative">
                  <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="coordinator-phone"
                    data-testid="input-coordinator-phone"
                    required type="tel" placeholder="5X XXX XXXX" value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    dir="ltr"
                    className="w-full rounded-xl border border-slate-200 py-3 pr-10 pl-4 text-left text-sm outline-none transition focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15"
                  />
                </div>
              </div>
              <CountrySelector
                country={form.country}
                onCountryChange={(country) => setForm((previous) => ({ ...previous, country }))}
                dialCode={form.dialCode}
                onDialCodeChange={(dialCode) => setForm((previous) => ({ ...previous, dialCode }))}
                id="coordinator"
                required
              />
              {error && <p data-testid="status-coordinator-request-error" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-right text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading} data-testid="button-submit-coordinator-request" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#117b59] py-3.5 font-bold text-white shadow-[0_8px_18px_rgba(17,123,89,0.16)] transition hover:bg-[#0c6549] disabled:opacity-60">
                {loading ? <><Loader2 size={17} className="animate-spin" /> جارٍ إرسال الطلب...</> : "إرسال طلب الاعتماد"}
              </button>
              <p className="text-center text-xs leading-5 text-slate-400">بعد الإرسال ستظهر لك مباشرةً بطاقة تحتوي على رقم طلبك.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
