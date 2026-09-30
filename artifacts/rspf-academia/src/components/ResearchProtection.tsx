import React, { useEffect, useState } from "react";
import { ShieldCheck, Lock, AlertTriangle, EyeOff, Eye } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";

/**
 * Global Research Protection Provider
 * Prevents right-clicking, copying, cut, print shortcuts, and external screen-snipping
 * on research titles and intellectual property across the academy platform.
 */
export function ResearchProtectionProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { language, localize } = useLanguage();
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [screenShotDetected, setScreenShotDetected] = useState(false);

  useEffect(() => {
    // 1. Right Click Prevention on protected elements
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-protected="research"], .protected-research-content')) {
        e.preventDefault();
        e.stopPropagation();
        toast({
          title: language === "ar" ? "🔒 محتوى بحثي محمي" : "🔒 Protected Research Content",
          description:
            language === "ar"
              ? "عناوين وبروتوكولات الأبحاث مسجلة ومحمية بحقوق الملكية الفكرية والأسبقية الأكاديمية. النسخ والتصوير غير مسموح."
              : "Research titles and protocols are protected under intellectual property and academic priority laws. Copying and capturing are prohibited.",
          variant: "destructive",
        });
      }
    };

    // 2. Keyboard Shortcuts Interception (Copy, Cut, Print, Save, View Source, DevTools)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Detect PrintScreen
      if (e.key === "PrintScreen") {
        setScreenShotDetected(true);
        // Clear clipboard if possible
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("🔒 المحتوى محمي بحقوق الملكية الفكرية - أكاديمية SRMA للأبحاث");
        }
        toast({
          title: language === "ar" ? "⚠️ تم رصد محاولة التقاط شاشة" : "⚠️ Screenshot Attempt Detected",
          description:
            language === "ar"
              ? "هذا المحتوى محمي بعلامة مائية رقمية ومسجل بأسبقية أكاديمية."
              : "This content is digitally watermarked and registered with academic priority.",
          variant: "destructive",
        });
        setTimeout(() => setScreenShotDetected(false), 3000);
      }

      // Check if user is focused inside or attempting to copy protected content
      const selection = window.getSelection();
      const selectedNode = selection?.anchorNode?.parentElement;
      const isProtectedSelection = selectedNode?.closest('[data-protected="research"], .protected-research-content');

      // Intercept Copy / Cut
      if (isCmdOrCtrl && (key === "c" || key === "x") && isProtectedSelection) {
        e.preventDefault();
        toast({
          title: language === "ar" ? "🚫 النسخ غير مسموح" : "🚫 Copying Prohibited",
          description:
            language === "ar"
              ? "عناوين الأبحاث محمية ضد النسخ والنقل لحفظ أسبقية الباحثين وحقوق الملكية."
              : "Research titles are copy-protected to safeguard author priority and intellectual property.",
          variant: "destructive",
        });
      }

      // Intercept Print (Ctrl+P / Cmd+P)
      if (isCmdOrCtrl && key === "p") {
        e.preventDefault();
        toast({
          title: language === "ar" ? "🖨️ الطباعة معطلة للمحتوى المحمي" : "🖨️ Printing Disabled for Protected Content",
          description:
            language === "ar"
              ? "لحماية المشاريع البحثية، تم تعطيل طباعة وتصدير هذه الصفحة إلى PDF."
              : "To protect research projects, page printing and PDF export are disabled.",
          variant: "destructive",
        });
      }

      // Intercept Save Page (Ctrl+S / Cmd+S)
      if (isCmdOrCtrl && key === "s") {
        e.preventDefault();
      }

      // Intercept View Source (Ctrl+U)
      if (isCmdOrCtrl && key === "u") {
        e.preventDefault();
      }
    };

    // 3. Anti-Snipping Tool Protection (Window blur detection)
    // External capture tools (Snipping tool, Lightshot, etc.) cause the browser window to lose focus
    const handleBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleFocus = () => {
      setIsWindowBlurred(false);
      setScreenShotDetected(false);
    };

    // 4. Copy Event interception on protected elements
    const handleCopy = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      const selection = window.getSelection();
      const node = selection?.anchorNode?.parentElement || activeEl;
      if (node?.closest('[data-protected="research"], .protected-research-content')) {
        e.preventDefault();
        if (e.clipboardData) {
          e.clipboardData.setData(
            "text/plain",
            "🔒 محتوى محمي بحقوق الملكية الفكرية - أكاديمية SRMA للأبحاث (https://srmaacademy.com)"
          );
        }
      }
    };

    document.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("copy", handleCopy, { capture: true });

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("copy", handleCopy, { capture: true });
    };
  }, [language, toast]);

  return (
    <>
      {children}

      {/* Screen blur shield active when an external snipping tool steals focus */}
      {isWindowBlurred && (
        <div
          className="fixed inset-0 z-[9999] pointer-events-none bg-slate-900/20 backdrop-blur-md flex items-center justify-center transition-all duration-200"
          aria-hidden="true"
        >
          <div className="bg-slate-900/90 text-white border border-emerald-500/40 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md text-center mx-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0 animate-pulse" />
            <div className="text-right">
              <div className="text-sm font-black text-emerald-300">
                {language === "ar" ? "درع حماية الملكية الفكرية نشط" : "Intellectual Property Shield Active"}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {language === "ar"
                  ? "يتم تمويه المحتوى تلقائياً عند تشغيل برامج التصوير الخارجي لحماية عناوين الأبحاث."
                  : "Content is blurred during external capture attempts to protect research titles."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full screen alert on PrintScreen key */}
      {screenShotDetected && (
        <div
          className="fixed inset-0 z-[10000] pointer-events-none bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6"
          aria-hidden="true"
        >
          <div className="bg-slate-900 border-2 border-red-500/80 rounded-3xl p-8 max-w-lg text-center shadow-2xl text-white">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400 animate-bounce" />
            </div>
            <h3 className="text-xl font-black text-red-400 mb-2">
              {language === "ar" ? "تنبيه: محتوى بحثي محمي دولياً" : "Notice: Internationally Protected Research"}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {language === "ar"
                ? "عناوين وبروتوكولات أبحاث SRMA مسجلة وموثقة بأسبقية تاريخية في قواعد البيانات المعتمدة. تصوير الشاشة أو تداول العناوين غير مصرح به."
                : "SRMA research titles and protocols are registered with verified timestamps. Unauthorized capture or distribution is strictly prohibited."}
            </p>
            <div className="text-xs font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-emerald-400">
              ID: SRMA-IP-SHIELD-SECURE • {new Date().toISOString().split("T")[0]}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Visual Dynamic Watermark Overlay for Research Cards & Detail Pages
 * Creates a subtle repeating pattern that stamps any phone photo or capture with proof of IP ownership.
 */
export function ProtectedResearchWatermark() {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10 opacity-[0.035] dark:opacity-[0.05]"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='120' viewBox='0 0 280 120'><text x='20' y='60' fill='%230c3156' font-size='11' font-weight='800' font-family='sans-serif' transform='rotate(-22 20 60)'>SRMA ACADEMIA • IP PROTECTED • ${today}</text></svg>")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}

/**
 * Protected Research Title Component
 * Wraps title and description with anti-selection, anti-drag, right-click suppression,
 * and security badge.
 */
interface ProtectedResearchTitleProps {
  title: string;
  description?: string;
  code?: string;
  className?: string;
  titleClassName?: string;
  descClassName?: string;
  showBadge?: boolean;
}

export function ProtectedResearchTitle({
  title,
  description,
  code,
  className = "",
  titleClassName = "text-base sm:text-lg font-black text-slate-900",
  descClassName = "text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed",
  showBadge = true,
}: ProtectedResearchTitleProps) {
  const { language } = useLanguage();

  return (
    <div
      data-protected="research"
      className={`protected-research-content relative group/prot select-none ${className}`}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      onDragStart={(e) => {
        e.preventDefault();
      }}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      {/* Subtle Anti-Camera Watermark */}
      <ProtectedResearchWatermark />

      {/* Code & IP Badge */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {code && (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0C3156]/10 text-[#0C3156] border border-[#0C3156]/20">
            {code}
          </span>
        )}
        {showBadge && (
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <Lock size={10} className="text-emerald-600" />
            <span>{language === "ar" ? "عنوان محمي بالملكية الفكرية" : "IP-Protected Title"}</span>
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        className={`${titleClassName} select-none leading-snug tracking-tight`}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={`mt-2 ${descClassName} select-none`}
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Trust & Security Banner to be displayed on top of the Research Section
 */
export function ResearchProtectionBanner() {
  const { language } = useLanguage();

  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-[#0C3156] text-white p-3.5 sm:p-4 mb-6 shadow-md border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="text-xs sm:text-sm font-black text-white flex items-center justify-center sm:justify-start gap-1.5">
            <span>{language === "ar" ? "نظام حماية الملكية الفكرية والأسبقية البحثية نشط" : "IP & Academic Priority Shield Active"}</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
            {language === "ar"
              ? "كافة العناوين والأفكار مسجلة بأسبقية زمنية في قواعد البيانات الأكاديمية ومحمية تقنياً ضد النسخ والتصوير لحفظ حقوق الباحثين."
              : "All research titles and protocols are registered with timestamp priority and copy-shielded to protect researcher intellectual rights."}
          </p>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 text-emerald-300">
          PROSPERO / OSF Protocol Shield
        </span>
      </div>
    </div>
  );
}

/**
 * AntiCaptureResearchTitle
 * Blurs the title by default to prevent OCR and phone photography from stealing the title.
 * Provides a controlled "Click to Peek" button with auto-blur and Anti-OCR grid.
 */
interface AntiCaptureResearchTitleProps {
  title: string;
  titleHref?: string;
  className?: string;
  titleClassName?: string;
}

export function AntiCaptureResearchTitle({
  title,
  titleHref,
  className = "",
  titleClassName = "text-base sm:text-lg font-black text-slate-900 group-hover:text-[#117b59] transition-colors leading-snug cursor-pointer select-none",
}: AntiCaptureResearchTitleProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const { localize } = useLanguage();

  // Auto-hide countdown
  useEffect(() => {
    if (timerRemaining === null) return;
    if (timerRemaining <= 0) {
      setIsRevealed(false);
      setTimerRemaining(null);
      return;
    }
    const interval = setInterval(() => {
      setTimerRemaining((prev) => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRemaining]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRevealed) {
      setIsRevealed(false);
      setTimerRemaining(null);
    } else {
      setIsRevealed(true);
      setTimerRemaining(7); // reveal for 7 seconds then auto-blur
    }
  };

  return (
    <div
      className={`relative select-none group/anticap mb-2.5 ${className}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onMouseLeave={() => {
        if (!timerRemaining) setIsRevealed(false);
      }}
    >
      {/* Title with conditional blur and anti-OCR pattern */}
      <div
        className={`transition-all duration-300 relative rounded-xl p-1 ${
          isRevealed
            ? "filter-none opacity-100"
            : "filter blur-[9px] opacity-40 select-none pointer-events-none"
        }`}
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      >
        {/* Anti-OCR Micro Grid Pattern active during reveal to disrupt AI OCR & Google Lens */}
        {isRevealed && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-20 opacity-30 mix-blend-multiply"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(12, 49, 86, 0.4) 3px, rgba(12, 49, 86, 0.4) 4px)`,
            }}
          />
        )}

        {titleHref ? (
          <Link href={titleHref}>
            <h3 className={titleClassName}>
              {title}
            </h3>
          </Link>
        ) : (
          <h3 className={titleClassName}>
            {title}
          </h3>
        )}
      </div>

      {/* Protective Shield Overlay when Blurred */}
      {!isRevealed ? (
        <div
          onClick={handleToggle}
          className="absolute inset-0 z-30 flex items-center justify-center cursor-pointer bg-slate-900/5 hover:bg-slate-900/15 backdrop-blur-[2px] rounded-xl border border-dashed border-slate-300/80 p-2 transition-all group/btn"
          title={localize("اضغط لمعاينة العنوان المحمي", "Click to view protected title")}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 text-slate-800 text-xs font-bold shadow-sm border border-slate-200 group-hover/btn:scale-105 transition-transform">
            <Eye className="w-3.5 h-3.5 text-[#117b59]" />
            <span>{localize("معاينة العنوان المحمي", "View Protected Title")}</span>
            <Lock className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      ) : (
        <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-700 font-bold px-1 animate-fadeIn">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px]">{localize("درع الحماية ضد الاستخراج نشط", "Anti-OCR Shield Active")}</span>
          </span>
          <button
            onClick={handleToggle}
            className="text-slate-500 hover:text-red-600 underline text-[10px] cursor-pointer"
          >
            {localize(`طمس العنوان (${timerRemaining}ث)`, `Blur (${timerRemaining}s)`)}
          </button>
        </div>
      )}
    </div>
  );
}

