import React, { useEffect, useId, useState } from "react";
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";

const protectedSelector = '[data-protected="research"], .protected-research-content';
const editableSelector = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [data-allow-copy]';

/** Deterrence only: public text and screenshots cannot be made confidential. */
export function ResearchProtectionProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { localize } = useLanguage();
  useEffect(() => {
    const editable = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest(editableSelector));
    const protectedTarget = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest(protectedSelector));
    const protectedSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) return false;
      for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i);
        for (const element of document.querySelectorAll(protectedSelector)) {
          if (range.intersectsNode(element)) return true;
        }
      }
      return false;
    };
    const notice = () => toast({
      title: localize("نسخ العناوين مباشرة محدود", "Direct title copying is restricted"),
      description: localize("يمكن استخدام زر مشاركة الإعلان. يرجى عدم إعادة نشر المحتوى دون إذن.",
        "Use the announcement share button. Please do not republish content without permission."),
    });
    const copy = (event: ClipboardEvent) => {
      // Never interfere with registration inputs, editing or explicit share actions.
      if (editable(event.target) || editable(document.activeElement)) return;
      if (protectedSelection()) { event.preventDefault(); notice(); }
    };
    const context = (event: MouseEvent) => {
      if (!editable(event.target) && protectedTarget(event.target)) { event.preventDefault(); notice(); }
    };
    const drag = (event: DragEvent) => {
      if (!editable(event.target) && protectedTarget(event.target)) event.preventDefault();
    };
    document.addEventListener("copy", copy, true);
    document.addEventListener("cut", copy, true);
    document.addEventListener("contextmenu", context, true);
    document.addEventListener("dragstart", drag, true);
    return () => {
      document.removeEventListener("copy", copy, true);
      document.removeEventListener("cut", copy, true);
      document.removeEventListener("contextmenu", context, true);
      document.removeEventListener("dragstart", drag, true);
    };
  }, [localize, toast]);
  return <>{children}</>;
}

/** Visible attribution discourages reuse; it is not a screenshot/OCR blocker. */
export function ProtectedResearchWatermark() {
  const label = "© SRMA Research Academy";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="95"><text x="8" y="65" fill="#0c3156" font-size="11" font-weight="700" font-family="sans-serif" transform="rotate(-20 8 65)">${label}</text></svg>`;
  return <div aria-hidden="true"
    className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10 opacity-[0.10]"
    style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundRepeat: "repeat" }} />;
}

interface ProtectedResearchTitleProps {
  title: string; description?: string; code?: string; className?: string;
  titleClassName?: string; descClassName?: string; showBadge?: boolean;
}
export function ProtectedResearchTitle({
  title, description, code, className = "",
  titleClassName = "text-base sm:text-lg font-black text-slate-900",
  descClassName = "text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed",
  showBadge = true,
}: ProtectedResearchTitleProps) {
  const { localize } = useLanguage();
  return <div data-protected="research" className={`protected-research-content relative select-none ${className}`}
    style={{ userSelect: "none", WebkitUserSelect: "none" }}>
    <ProtectedResearchWatermark />
    {(code || showBadge) && <div className="flex items-center gap-2 mb-2">
      {code && <span className="font-mono text-xs">{code}</span>}
      {showBadge && <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><Lock size={10} />
        {localize("بعلامة مائية", "Watermarked")}</span>}
    </div>}
    <h3 className={`${titleClassName} leading-snug`}>{title}</h3>
    {description && <p className={descClassName}>{description}</p>}
  </div>;
}

export function ResearchProtectionBanner() {
  const { localize } = useLanguage();
  return <div className="rounded-xl bg-slate-900 text-white p-4 flex items-center gap-3">
    <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-300" />
    <p className="text-sm">{localize(
      "العناوين متاحة للجميع مع علامات مائية وتقليل النسخ المباشر. هذه الوسائل لا تمنع التقاط الشاشة أو استخراج المحتوى العام بالكامل.",
      "Titles are public, with watermarks and direct-copy deterrents. These measures cannot completely prevent screenshots or extraction of public content.",
    )}</p>
  </div>;
}

interface AntiCaptureResearchTitleProps {
  title: string; titleHref?: string; className?: string; titleClassName?: string;
}
export function AntiCaptureResearchTitle({
  title, titleHref, className = "",
  titleClassName = "text-base sm:text-lg font-black text-slate-900 group-hover:text-[#117b59] transition-colors leading-snug",
}: AntiCaptureResearchTitleProps) {
  // Public by user choice. No automatic hiding or fake screenshot detection.
  const [revealed, setRevealed] = useState(true);
  const id = useId();
  const { localize } = useLanguage();
  return <div data-protected="research" className={`relative select-none mb-2.5 ${className}`}
    style={{ userSelect: "none", WebkitUserSelect: "none" }}>
    <div id={id} hidden={!revealed} className="relative rounded-xl p-1">
      <ProtectedResearchWatermark />
      {titleHref ? <Link href={titleHref}><h3 className={titleClassName}>{title}</h3></Link>
        : <h3 className={titleClassName}>{title}</h3>}
    </div>
    <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-500">
      <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" />
        {localize("بعلامة مائية — نسخ مباشر محدود", "Watermarked — direct copy restricted")}</span>
      <button type="button" aria-controls={id} aria-expanded={revealed}
        onClick={() => setRevealed(value => !value)} className="inline-flex items-center gap-1 underline">
        {revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        {revealed ? localize("إخفاء العنوان", "Hide title") : localize("إظهار العنوان", "Show title")}
      </button>
    </div>
  </div>;
}