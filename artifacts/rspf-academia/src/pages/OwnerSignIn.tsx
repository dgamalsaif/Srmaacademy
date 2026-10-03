import { SignIn } from "@clerk/react";
import BrandLogo from "@/components/BrandLogo";
import { useSiteContentSettings } from "@/hooks/use-site-content-settings";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function OwnerSignIn() {
  const { data: settings } = useSiteContentSettings();
  const name = settings?.brand.siteNameAr || settings?.brand.siteNameEn || "SRMA";
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10" dir="rtl">
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <BrandLogo src={settings?.brand.logoUrl} alt={name} animationEnabled={settings?.brand.logoAnimationEnabled} className="mx-auto h-16 w-32 rounded-2xl border border-emerald-100 bg-white object-contain p-1 shadow-sm" />
          <p className="mt-4 text-xs font-black tracking-[0.16em] text-[#117b59]">{name}</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">دخول مالك المنصة</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">استخدم حساب المالك الموثّق بالبريد الإلكتروني.</p>
        </div>
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          forceRedirectUrl={`${basePath}/admin`}
          fallbackRedirectUrl={`${basePath}/admin`}
        />
      </div>
    </div>
  );
}