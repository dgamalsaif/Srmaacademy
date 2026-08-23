import { useEffect, useRef, useState } from "react";
import { BadgePercent, BookOpen, Clock3, Expand, LibraryBig, UsersRound, X } from "lucide-react";
import { ResearchOpportunity } from "@/lib/researchData";
import { formatOpportunityMoney, getDiscountPercentage, RESEARCH_STATUS_LABELS } from "@/lib/opportunityPricing";
import { SRMA_LOGO } from "@/components/BrandBackground";

function OpportunityMetadata({ research, className = "" }: { research: ResearchOpportunity; className?: string }) {
  const originalSar = research.priceOriginalSar ?? 1500;
  const discountedSar = research.priceDiscountedSar ?? 1000;
  const discount = getDiscountPercentage(originalSar, discountedSar);
  const journalDetails = [
    research.journalIssn && `ISSN: ${research.journalIssn}`,
    research.journalPubmed && `PubMed: ${research.journalPubmed}`,
    research.journalScopus && `Scopus: ${research.journalScopus}`,
    research.journalWos && `WOS: ${research.journalWos}`,
  ].filter(Boolean) as string[];
  const firstAuthorSeats = typeof research.firstAuthorSeatsLeft === "number"
    ? research.firstAuthorSeatsLeft
    : undefined;
  const coAuthorSeats = typeof research.coAuthorSeatsLeft === "number"
    ? research.coAuthorSeatsLeft
    : undefined;

  return (
    <div className={`srma-media-info rounded-xl border border-white/20 bg-[#061f35]/90 p-2.5 text-white shadow-xl backdrop-blur-md ${className}`} dir="rtl">
      <div className="flex items-center gap-1.5 border-b border-white/15 pb-1.5">
        <LibraryBig size={13} className="shrink-0 text-[#8ee0c3]" />
        <p className="min-w-0 truncate text-[11px] font-black">{research.journalTarget || "المجلة المستهدفة"}</p>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {journalDetails.map((detail) => (
          <span key={detail} className="srma-media-detail-chip">{detail}</span>
        ))}
        {research.indexedIn?.map((index) => (
          <span key={`index-${index}`} className="srma-media-detail-chip">مفهرسة في {index}</span>
        ))}
        {research.duration && (
          <span className="srma-media-detail-chip inline-flex items-center gap-1"><Clock3 size={10} /> {research.duration}</span>
        )}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-[1.15fr_1fr] sm:items-center">
        <div className="flex items-center gap-2 rounded-lg border border-[#8ee0c3]/30 bg-[#07634e]/55 px-2 py-1.5">
          <BadgePercent size={16} className="shrink-0 text-[#8ee0c3]" />
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-white/70">السعر بعد الخصم</p>
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <strong className="text-sm font-black text-white">{formatOpportunityMoney(discountedSar, "SAR")}</strong>
              <span className="text-[9px] font-bold text-white/65">{formatOpportunityMoney(discountedSar, "USD")}</span>
            </div>
          </div>
          {discount > 0 && (
            <span className="mr-auto shrink-0 rounded-full bg-[#f5c34b] px-1.5 py-0.5 text-[9px] font-black text-[#082c4a]">
              خصم {discount.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-white/15 bg-white/10 px-2 py-1.5">
          <div>
            <p className="text-[9px] font-bold text-white/65">السعر الأصلي</p>
            <p className="text-[11px] font-black text-white/85 line-through">{formatOpportunityMoney(originalSar, "SAR")}</p>
          </div>
          <div className="text-left">
            <p className="text-[9px] font-bold text-white/65">المقاعد</p>
            <p className="inline-flex items-center gap-1 text-[11px] font-black text-white"><UsersRound size={11} /> {research.seatsLeft} متاح من {research.totalSeats}</p>
          </div>
        </div>
      </div>
      {(firstAuthorSeats !== undefined || coAuthorSeats !== undefined) && (
        <div className="mt-1.5 flex flex-wrap justify-end gap-1">
          {firstAuthorSeats !== undefined && <span className="srma-media-seat-chip">الكاتب الأول: {firstAuthorSeats} متاح</span>}
          {coAuthorSeats !== undefined && <span className="srma-media-seat-chip">المؤلفون المشاركون: {coAuthorSeats} متاح</span>}
        </div>
      )}
    </div>
  );
}

export default function OpportunityMedia({ research, className = "h-56" }: { research: ResearchOpportunity; className?: string }) {
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
          <OpportunityMetadata research={research} className="srma-media-copy absolute inset-x-3 bottom-3" />
          <img src={SRMA_LOGO} alt="شعار SRMA" className="pointer-events-none absolute bottom-3 left-3 h-9 w-9 rounded-xl border border-white/40 bg-white/90 object-cover p-0.5 shadow-lg" />
          {canShowImage && <button type="button" data-testid={`button-expand-image-${research.id}`} onClick={(event) => { event.stopPropagation(); setIsPanoramaOpen(true); }} className="srma-media-open absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label={`عرض صورة ${research.titleAr || research.title} بالحجم الكامل`}><Expand size={17} /></button>}
        </div>
      </div>
      {isPanoramaOpen && canShowImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#041829]/[.94] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`صورة ${research.titleAr || research.title}`} onClick={() => setIsPanoramaOpen(false)}>
          <div className="relative flex h-[min(94vh,980px)] w-full max-w-7xl flex-col gap-3" onClick={(event) => event.stopPropagation()} onContextMenu={(event) => event.preventDefault()}>
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[#082c4a] shadow-2xl">
              <img src={research.imageUrl} alt={`صورة ${research.titleAr || research.title}`} draggable={false} className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl" />
              <img src={research.imageUrl} alt={`صورة ${research.titleAr || research.title}`} draggable={false} className="srma-protected-image relative max-h-full max-w-full object-contain shadow-2xl" />
            </div>
            <button type="button" data-testid={`button-close-image-${research.id}`} onClick={() => setIsPanoramaOpen(false)} className="absolute right-1 top-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-[#0b3657] text-white transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label="إغلاق عرض الصورة"><X size={20} /></button>
            <OpportunityMetadata research={research} className="mx-auto w-full max-w-4xl shrink-0" />
            <p className="sr-only">{research.titleAr || research.title}</p>
          </div>
        </div>
      )}
    </>
  );
}