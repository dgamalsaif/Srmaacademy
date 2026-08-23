import { useEffect, useState } from "react";
import { Download } from "lucide-react";

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
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const captureInstall = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    window.addEventListener("beforeinstallprompt", captureInstall);
    return () => window.removeEventListener("beforeinstallprompt", captureInstall);
  }, []);

  const install = async () => {
    if (!installEvent) {
      setMessage("استخدم خيار «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية» من قائمة المتصفح.");
      return;
    }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstallEvent(null);
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => void install()} data-testid="button-install-app" className={className}>
        <Download size={15} />
        تحميل التطبيق
      </button>
      {message && <span role="status" className="absolute left-0 top-[calc(100%+0.5rem)] z-[90] w-64 rounded-xl bg-slate-900 px-3 py-2 text-right text-[11px] font-medium leading-5 text-white shadow-xl">{message}</span>}
    </div>
  );
}