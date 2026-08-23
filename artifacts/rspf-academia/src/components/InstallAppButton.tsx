import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { SRMA_LOGO } from "@/components/BrandBackground";
import { useLanguage } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function InstallAppButton({ className = "" }: { className?: string }) {
  const { direction, language, localize } = useLanguage();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const captureInstall = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    window.addEventListener("beforeinstallprompt", captureInstall);
    const installed = () => {
      setInstallEvent(null);
      setIsOpen(false);
      setInstalling(false);
    };
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstall);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  const install = async () => {
    if (!installEvent) {
      return;
    }
    setInstalling(true);
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") {
        setInstallEvent(null);
        setIsOpen(false);
      }
    } finally {
      setInstalling(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} data-testid="button-install-app" className={className} aria-label={localize("تحميل التطبيق", "Install app")}>
        <Download size={15} />
        {localize("تحميل التطبيق", "Install app")}
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4" onClick={() => setIsOpen(false)} role="dialog" aria-modal="true" aria-label={localize("تثبيت تطبيق SRMA Research Academy", "Install SRMA Research Academy app")}>
          <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />
          <section className="relative w-full max-w-sm rounded-3xl border border-emerald-100 bg-white p-6 text-start shadow-2xl" dir={direction} onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setIsOpen(false)} className="absolute left-4 top-4 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={localize("إغلاق نافذة التثبيت", "Close install dialog")}><X size={18} /></button>
            <div className="flex items-center gap-3 pl-8">
              <img src={SRMA_LOGO} alt={localize("شعار SRMA Research Academy", "SRMA Research Academy logo")} className="h-14 w-14 rounded-2xl border border-emerald-100 object-cover shadow-sm" />
              <div>
                <p className="text-xs font-black text-[#117b59]">{localize("تطبيق SRMA", "SRMA app")}</p>
                <h2 className="mt-1 text-lg font-black text-slate-800">SRMA Research Academy</h2>
              </div>
            </div>
            {installEvent ? (
              <>
                <p className="mt-5 text-sm leading-7 text-slate-600">{localize("ثبّت المنصة على جهازك للوصول السريع إلى الفرص البحثية وبوابة المنسق مباشرة من شاشة الهاتف أو سطح المكتب.", "Install the platform for quick access to research opportunities and the coordinator portal from your phone or desktop.")}</p>
                <button type="button" onClick={() => void install()} disabled={installing} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#117b59] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-[#0c6549] disabled:cursor-wait disabled:opacity-70">
                  <Download size={17} /> {installing ? localize("جارٍ فتح التثبيت...", "Opening installation...") : localize("تثبيت التطبيق الآن", "Install app now")}
                </button>
              </>
            ) : (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-[#117b59]"><Smartphone size={18} /><h3 className="text-sm font-black">{localize("أضف التطبيق إلى جهازك", "Add the app to your device")}</h3></div>
                <p className="mt-2 text-xs leading-6 text-slate-600">{language === "ar" ? <>من قائمة المتصفح اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>. قد يظهر خيار التثبيت بعد فتح الموقع من Chrome أو Edge مرة أخرى.</> : <>From your browser menu, choose <strong>“Install app”</strong> or <strong>“Add to Home Screen.”</strong> The install option may appear after reopening the site in Chrome or Edge.</>}</p>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}