import { useEffect, useRef, useState } from "react";
import { BookOpen, Clock3, Expand, UsersRound, X } from "lucide-react";
import { ResearchOpportunity } from "@/lib/researchData";
import { RESEARCH_STATUS_LABELS } from "@/lib/opportunityPricing";
import { SRMA_LOGO } from "@/components/BrandBackground";

export default function OpportunityMedia({ research, className = "h-56" }: { research: ResearchOpportunity; className?: string }) {
  const classification = research.journalScopus || research.journalWos || research.journalPubmed || research.indexedIn?.[0];
  const status = RESEARCH_STATUS_LABELS[research.status] || research.status;
  const [imageFailed, setImageFailed] = useState(false);
  const [isPanoramaOpen, setIsPanoramaOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const canShowImage = Boolean(research.imageUrl) && !imageFailed;

  useEffect(() => setImageFailed(false), [research.imageUrl]);
  useEffect(() => {
    if (!isPanoramaOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPanoramaOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isPanoramaOpen]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !stageRef.current) return;
    const bounds = stageRef.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    stageRef.current.style.setProperty("--srma-tilt-x", `${x * 5}deg`);
    stageRef.current.style.setProperty("--srma-tilt-y", `${y * -4}deg`);
  };

  const resetTilt = () => {
    stageRef.current?.style.setProperty("--srma-tilt-x", "0deg");
    stageRef.current?.style.setProperty("--srma-tilt-y", "0deg");
  };

  const openPanoramaWithKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!canShowImage || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    setIsPanoramaOpen(true);
  };

  return (
    <>
      <div ref={stageRef} className={`srma-media-stage srma-protected-image relative ${className}`} onPointerMove={handlePointerMove} onPointerLeave={resetTilt} onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
        <div
          className={`srma-media-surface relative h-full overflow-hidden rounded-2xl border border-[#c5dce0] bg-[#082c4a] shadow-sm ${canShowImage ? "cursor-zoom-in" : ""}`}
          role={canShowImage ? "button" : undefined}
          tabIndex={canShowImage ? 0 : undefined}
          aria-label={canShowImage ? `عرض صورة ${research.titleAr || research.title} كبانوراما بالحجم الكامل` : undefined}
          onClick={() => canShowImage && setIsPanoramaOpen(true)}
          onKeyDown={openPanoramaWithKeyboard}
        >
          {canShowImage ? (
            <>
              <img src={research.imageUrl} alt="" aria-hidden="true" draggable={false} className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-xl" />
              <img data-testid={`img-opportunity-${research.id}`} src={research.imageUrl} alt={`صورة ${research.titleAr || research.title}`} draggable={false} onError={() => setImageFailed(true)} className="srma-media-image relative h-full w-full" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center"><img src={SRMA_LOGO} alt="" className="h-[80%] w-[80%] rounded-full object-cover opacity-20 blur-[0.3px]" /><BookOpen size={38} className="absolute text-white/80" /></div>
          )}
          <img src={SRMA_LOGO} alt="" aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover opacity-[0.11] mix-blend-screen" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#061f35]/80 via-transparent to-[#061f35]/50" />
          <div className="srma-media-copy absolute inset-x-3 top-3 flex items-start justify-between gap-2" dir="rtl">
            <span data-testid={`status-opportunity-${research.id}`} className="rounded-full border border-[#8ee0c3]/45 bg-[#07634e]/95 px-3 py-1 text-[11px] font-black text-white shadow-sm">{status}</span>
            <span className="srma-media-chip max-w-[55%] truncate rounded-full px-3 py-1 text-[11px] font-bold">{research.specialtyAr || research.specialty}</span>
          </div>
          <div className="srma-media-copy absolute inset-x-3 bottom-3 space-y-2 text-right text-white" dir="rtl">
            {research.journalTarget && <p className="truncate text-sm font-black drop-shadow">{research.journalTarget}</p>}
            <div className="flex flex-wrap justify-end gap-1.5">
              {classification && <span className="srma-media-chip rounded-full px-2.5 py-1 text-[10px] font-bold">الفهرسة: {classification}</span>}
              {research.duration && <span className="srma-media-chip inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"><Clock3 size={11} /> {research.duration}</span>}
              <span className="inline-flex items-center gap-1 rounded-full border border-[#f5ce72] bg-[#f5c34b] px-2.5 py-1 text-[10px] font-black text-[#082c4a]"><UsersRound size={11} /> {research.seatsLeft} من {research.totalSeats} متاحة</span>
            </div>
          </div>
          <img src={SRMA_LOGO} alt="شعار SRMA" className="pointer-events-none absolute bottom-3 left-3 h-9 w-9 rounded-xl border border-white/40 bg-white/90 object-cover p-0.5 shadow-lg" />
          {canShowImage && <button type="button" data-testid={`button-expand-image-${research.id}`} onClick={(event) => { event.stopPropagation(); setIsPanoramaOpen(true); }} className="srma-media-open absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label={`عرض صورة ${research.titleAr || research.title} بالحجم الكامل`}><Expand size={17} /></button>}
        </div>
      </div>
      {isPanoramaOpen && canShowImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#041829]/[.94] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`صورة ${research.titleAr || research.title}`} onClick={() => setIsPanoramaOpen(false)}>
          <div className="relative flex h-full w-full max-w-7xl items-center justify-center" onClick={(event) => event.stopPropagation()} onContextMenu={(event) => event.preventDefault()}>
            <img src={research.imageUrl} alt={`صورة ${research.titleAr || research.title}`} draggable={false} className="srma-protected-image max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
            <button type="button" data-testid={`button-close-image-${research.id}`} onClick={() => setIsPanoramaOpen(false)} className="absolute right-1 top-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-[#0b3657] text-white transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label="إغلاق عرض الصورة"><X size={20} /></button>
            <p className="absolute bottom-3 left-1/2 max-w-[80%] -translate-x-1/2 truncate rounded-full bg-[#061f35]/85 px-4 py-2 text-center text-sm font-bold text-white">{research.titleAr || research.title}</p>
          </div>
        </div>
      )}
    </>
  );
}