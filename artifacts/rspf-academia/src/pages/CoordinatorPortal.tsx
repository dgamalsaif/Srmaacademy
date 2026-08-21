import { useState } from "react";
import { Shield, Eye, EyeOff, ArrowLeft, Headphones } from "lucide-react";
import { useLocation } from "wouter";

const ADMIN_PASSWORD = "RSPF2026";

export default function CoordinatorPortal() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError("");
      setLocation("/admin");
    } else {
      setError("رمز الدخول غير صحيح. يرجى التحقق والمحاولة مجدداً.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fa] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[430px]">
        <div className="text-center mb-7">
          <p className="text-sm font-bold text-[#0C3156] mb-2">بوابة المنسق — Research Aid 2026</p>
          <h1 className="text-2xl font-black text-[#172238]">بوابة المنسقين</h1>
          <p className="text-sm text-slate-500 mt-2">سجّل دخولك برمز الوصول الخاص بك</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_18px_45px_rgba(17,38,59,0.10)] border border-slate-200/80 p-8 text-center">
          <div className="w-14 h-14 bg-[#e7f3ef] rounded-full flex items-center justify-center mx-auto mb-5">
            <Shield size={27} className="text-[#117b59]" strokeWidth={2.2} />
          </div>
          <h2 className="text-xl font-black text-[#172238] mb-2">دخول المنسق</h2>
          <p className="text-slate-500 text-sm mb-7">أدخل رمز الدخول للوصول إلى لوحة إدارة الفرص والطلاب</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <a href="https://t.me/RSPF_Services" target="_blank" rel="noopener noreferrer"
                data-testid="link-coordinator-help"
                className="text-[#117b59] font-bold hover:underline inline-flex items-center gap-1">
                سجّل الآن
                <Headphones size={14} />
              </a>
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">
          البوابة مخصصة للمنسقين المعتمدين فقط
        </p>
      </div>
    </div>
  );
}
