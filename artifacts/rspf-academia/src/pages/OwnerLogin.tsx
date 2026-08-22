import { useState } from "react";
import { useLocation } from "wouter";
import { LockKeyhole, Loader2, ShieldCheck } from "lucide-react";

export default function OwnerLogin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/owner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error || "تعذر تسجيل الدخول.");
        return;
      }
      setLocation("/admin");
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#edf4f1] p-5" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl items-center justify-center">
        <section className="w-full max-w-md rounded-[2rem] border border-emerald-100 bg-white p-7 text-center shadow-[0_28px_80px_rgba(13,118,92,0.15)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0d765c] text-white shadow-lg">
            <ShieldCheck size={31} />
          </div>
          <p className="mt-6 text-xs font-black tracking-[0.16em] text-[#117b59]">SRMA CONTROL</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">دخول مالك المنصة</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">هذه الصفحة مخصصة لمالك SRMA Research Academy فقط لإدارة المحتوى والإعدادات.</p>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <input aria-hidden="true" tabIndex={-1} type="text" name="username" autoComplete="username" className="sr-only" />
            <label className="block text-right text-sm font-bold text-slate-700" htmlFor="owner-password">رمز دخول المالك</label>
            <div className="relative">
              <LockKeyhole size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="owner-password" data-testid="input-owner-password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-11 pl-4 text-left outline-none transition focus:border-[#117b59] focus:ring-4 focus:ring-[#117b59]/10" dir="ltr" placeholder="••••••••••••" />
            </div>
            {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{error}</p>}
            <button data-testid="button-owner-login" disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#117b59] py-3.5 text-base font-black text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#0c6549] disabled:cursor-wait disabled:opacity-70">
              {loading ? <><Loader2 size={18} className="animate-spin" /> جارٍ التحقق...</> : "دخول لوحة المالك"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}