import { useEffect, useState } from "react";
import { UserProfile, useUser } from "@clerk/react";
import { BadgeCheck, KeyRound, Loader2, MailCheck, Phone, ShieldCheck, UserRound } from "lucide-react";

type OwnerProfile = {
  fullName: string;
  email: string;
  phone: string;
  verified: boolean;
};

export default function OwnerSecurityPanel({ onNameUpdated }: { onNameUpdated: (name: string) => void }) {
  const { user } = useUser();
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/owner/profile")
      .then((response) => response.ok ? response.json() as Promise<OwnerProfile> : Promise.reject())
      .then((data) => {
        setProfile(data);
        setFullName(data.fullName);
        setPhone(data.phone);
      })
      .catch(() => setMessage("تعذر تحميل بيانات حساب المالك."));
  }, []);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/owner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone }),
      });
      const result = await response.json() as OwnerProfile | { error?: string };
      if (!response.ok || !("fullName" in result)) {
        setMessage("error" in result && result.error ? result.error : "تعذر حفظ بيانات المالك.");
        return;
      }
      setProfile({ ...result, verified: true });
      setFullName(result.fullName);
      onNameUpdated(result.fullName);
      setMessage("تم حفظ بيانات المالك.");
    } catch {
      setMessage("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-l from-emerald-50 to-white p-6 text-right shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center justify-end gap-2 text-[#117b59]"><ShieldCheck size={22} /><p className="font-black">حساب المالك المحمي</p></div>
            <h2 className="mt-2 text-2xl font-black text-slate-800">{profile?.fullName || user?.fullName || "حساب المالك"}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">يتم حفظ كلمة المرور والتحقق وعوامل الأمان داخل خدمة المصادقة؛ لا تظهر أي كلمة مرور في لوحة SRMA.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-[#117b59]"><BadgeCheck size={15} /> حساب إداري موثّق</span>
        </div>
      </div>

      <form onSubmit={saveProfile} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#117b59]"><UserRound size={20} /></div>
          <div className="text-right"><h3 className="font-black text-slate-800">بيانات المالك</h3><p className="mt-1 text-xs text-slate-500">يُستخدم البريد الموثق لتحديد صلاحيات لوحة الإدارة.</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-right text-sm font-bold text-slate-700">
            الاسم الكامل
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={3} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right outline-none focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15" />
          </label>
          <label className="block text-right text-sm font-bold text-slate-700">
            رقم الهاتف
            <div className="relative mt-2"><Phone size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={phone} onChange={(event) => setPhone(event.target.value)} minLength={7} maxLength={32} required dir="ltr" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-left outline-none focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15" /></div>
          </label>
        </div>
        <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-right text-sm text-sky-900">
          <span className="inline-flex items-center gap-2 font-black"><MailCheck size={17} /> البريد الموثق:</span> <span dir="ltr">{profile?.email || user?.primaryEmailAddress?.emailAddress || "..."}</span>
        </div>
        {message && <p role="status" className={`mt-4 text-right text-sm font-bold ${message.includes("تم ") ? "text-[#117b59]" : "text-red-600"}`}>{message}</p>}
        <button disabled={saving} type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#117b59] px-5 py-3.5 font-black text-white transition hover:bg-[#0c6549] disabled:opacity-70">{saving ? <Loader2 className="animate-spin" size={18} /> : <UserRound size={18} />} حفظ بيانات المالك</button>
      </form>

      <div className="relative z-10 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><KeyRound size={20} /></div>
          <div className="text-right"><h3 className="font-black text-slate-800">كلمة المرور والتحقق بخطوتين وPasskey</h3><p className="mt-1 text-sm leading-6 text-slate-500">يتطلب الوصول إلى لوحة المالك عامل تحقق ثانياً. من هنا يمكنك تغيير كلمة المرور، إضافة بريد موثق، وإدارة الأجهزة والجلسات وتسجيل عامل أمان أو Passkey عند تفعيله في إعدادات المصادقة.</p></div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <UserProfile
            routing="hash"
            appearance={{
              variables: {
                colorPrimary: "#117b59",
                colorForeground: "#0f2744",
                colorMutedForeground: "#64748b",
                colorBackground: "#ffffff",
                colorInput: "#f8fafc",
                colorInputForeground: "#0f2744",
                colorNeutral: "#dbe4ee",
                borderRadius: "0.875rem",
              },
              elements: {
                rootBox: "w-full",
                cardBox: "w-full max-w-none !bg-white !shadow-none !border-0",
                navbar: "border-b border-slate-200 bg-slate-50 md:w-56 md:border-b-0 md:border-l",
                navbarButton: "text-slate-600 hover:bg-white hover:text-[#117b59]",
                navbarButton__active: "bg-emerald-50 text-[#117b59] font-bold",
                pageScrollBox: "!bg-white",
                profileSection: "border-slate-200",
                profileSectionPrimaryButton: "text-[#117b59] hover:bg-emerald-50",
                formFieldLabel: "text-slate-700 font-bold",
                formFieldInput: "bg-slate-50 text-slate-900 border-slate-200",
                formButtonPrimary: "bg-[#117b59] hover:bg-[#0c6549]",
              },
            }}
          />
        </div>
      </div>
    </section>
  );
}