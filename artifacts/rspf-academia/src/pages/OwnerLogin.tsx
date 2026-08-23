import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LockKeyhole, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import { SRMA_LOGO } from "@/components/BrandBackground";

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
    <div className="flex min-h-screen flex-col" dir="rtl">
      <header className="border-b border-emerald-100 bg-white/95 px-5 py-3 shadow-sm backdrop-blur">
        <Link href="/" className="mx-auto flex max-w-6xl items-center justify-end gap-3">
          <div className="text-right"><p className="text-lg font-black text-[#0C3156]">SRMA</p><p className="text-[10px] font-bold tracking-wide text-slate-500">RESEARCH ACADEMY</p></div>
          <img src={SRMA_LOGO} alt="SRMA Research Academy" className="h-11 w-11 rounded-full border border-emerald-100 object-cover" />
        </Link>
      </header>
      <main className="flex-1 p-5">
        <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl items-center justify-center">
          <section className="w-full max-w-md rounded-[2rem] border border-emerald-100 bg-white p-7 text-center shadow-[0_28px_80px_rgba(13,118,92,0.15)] sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-emerald-100">
              <img src={SRMA_LOGO} alt="SRMA Research Academy" className="h-full w-full object-cover" />
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
      <Footer />
    </div>
  );
}