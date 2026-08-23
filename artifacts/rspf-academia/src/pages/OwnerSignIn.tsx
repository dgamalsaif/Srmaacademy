import { SignIn } from "@clerk/react";
import { SRMA_LOGO } from "@/components/BrandBackground";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function OwnerSignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10" dir="rtl">
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <img src={SRMA_LOGO} alt="SRMA Research Academy" className="mx-auto h-16 w-16 rounded-2xl border border-emerald-100 bg-white object-cover p-1 shadow-sm" />
          <p className="mt-4 text-xs font-black tracking-[0.16em] text-[#117b59]">SRMA CONTROL</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">دخول مالك المنصة</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">استخدم حساب المالك الموثّق بالبريد الإلكتروني.</p>
        </div>
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}