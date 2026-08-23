import { useEffect, useRef, useState } from "react";
import { BadgePercent, BookOpen, Clock3, Expand, LibraryBig, UsersRound, X } from "lucide-react";
import { ResearchOpportunity } from "@/lib/researchData";
import { formatOpportunityMoney, getDiscountPercentage, getResearchStatusLabel } from "@/lib/opportunityPricing";
import { SRMA_LOGO } from "@/components/BrandBackground";
import { useLanguage } from "@/lib/i18n";

function OpportunityMetadata({ research, className = "" }: { research: ResearchOpportunity; className?: string }) {
  const { direction, language, localize } = useLanguage();
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
    <div className={`srma-media-info rounded-xl border border-white/20 bg-[#061f35]/90 p-2.5 text-white shadow-xl backdrop-blur-md ${className}`} dir={direction}>
      <div className="flex items-center gap-1.5 border-b border-white/15 pb-1.5">
        <LibraryBig size={13} className="shrink-0 text-[#8ee0c3]" />
        <p className="min-w-0 truncate text-[11px] font-black">{research.journalTarget || localize("المجلة المستهدفة", "Target journal")}</p>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {journalDetails.map((detail) => (
          <span key={detail} className="srma-media-detail-chip">{detail}</span>
        ))}
        {research.indexedIn?.map((index) => (
          <span key={`index-${index}`} className="srma-media-detail-chip">{localize("مفهرسة في", "Indexed in")} {index}</span>
        ))}
        {research.duration && (
          <span className="srma-media-detail-chip inline-flex items-center gap-1"><Clock3 size={10} /> {research.duration}</span>
        )}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-[1.15fr_1fr] sm:items-center">
        <div className="flex items-center gap-2 rounded-lg border border-[#8ee0c3]/30 bg-[#07634e]/55 px-2 py-1.5">
          <BadgePercent size={16} className="shrink-0 text-[#8ee0c3]" />
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-white/70">{localize("السعر بعد الخصم", "Discounted price")}</p>
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <strong dir="ltr" className="text-sm font-black text-white">{formatOpportunityMoney(discountedSar, "SAR", language)}</strong>
              <span dir="ltr" className="text-[9px] font-bold text-white/65">{formatOpportunityMoney(discountedSar, "USD", language)}</span>
            </div>
          </div>
          {discount > 0 && (
            <span className="mr-auto shrink-0 rounded-full bg-[#f5c34b] px-1.5 py-0.5 text-[9px] font-black text-[#082c4a]">
              {localize("خصم", "Save")} {discount.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-white/15 bg-white/10 px-2 py-1.5">
          <div>
            <p className="text-[9px] font-bold text-white/65">{localize("السعر الأصلي", "Original price")}</p>
            <p dir="ltr" className="text-[11px] font-black text-white/85 line-through">{formatOpportunityMoney(originalSar, "SAR", language)}</p>
          </div>
          <div className="text-left">
            <p className="text-[9px] font-bold text-white/65">{localize("المقاعد", "Seats")}</p>
            <p className="inline-flex items-center gap-1 text-[11px] font-black text-white"><UsersRound size={11} /> {localize(`${research.seatsLeft} متاح من ${research.totalSeats}`, `${research.seatsLeft} of ${research.totalSeats} available`)}</p>
          </div>
        </div>
      </div>
      {(firstAuthorSeats !== undefined || coAuthorSeats !== undefined) && (
        <div className="mt-1.5 flex flex-wrap justify-end gap-1">
          {firstAuthorSeats !== undefined && <span className="srma-media-seat-chip">{localize("الكاتب الأول", "First author")}: {firstAuthorSeats} {localize("متاح", "available")}</span>}
          {coAuthorSeats !== undefined && <span className="srma-media-seat-chip">{localize("المؤلفون المشاركون", "Co-authors")}: {coAuthorSeats} {localize("متاح", "available")}</span>}
        </div>
      )}
    </div>
  );
}

export default function OpportunityMedia({ research, className = "aspect-[4/3] min-h-[172px]" }: { research: ResearchOpportunity; className?: string }) {
  const { direction, language, localize } = useLanguage();
  const status = getResearchStatusLabel(research.status, language);
  const title = research.titleEn || research.title;
  const specialty = localize(research.specialtyAr, research.specialtyEn, research.specialty);
  const originalSar = research.priceOriginalSar ?? 1500;
  const discountedSar = research.priceDiscountedSar ?? 1000;
  const discount = getDiscountPercentage(originalSar, discountedSar);
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

  const handleImageFailure = () => {
    setImageFailed(true);
    setIsPanoramaOpen(false);
  };

  const openPanoramaWithKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!canShowImage || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    setIsPanoramaOpen(true);
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-stretch gap-2" dir={direction}>
          <div className="hidden w-[68px] shrink-0 flex-col justify-between gap-1.5 2xl:flex">
            <span data-testid={`status-opportunity-${research.id}`} className="srma-media-side-chip border-emerald-200 bg-emerald-50 text-emerald-700">{status}</span>
            <span className="srma-media-side-chip border-slate-200 bg-slate-50 text-slate-700">{specialty}</span>
          </div>
          <div ref={stageRef} className={`srma-media-stage srma-protected-image relative min-w-0 flex-1 ${className}`} onPointerMove={handlePointerMove} onPointerLeave={resetTilt} onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
            <div
              className={`srma-media-surface relative h-full overflow-hidden rounded-2xl border border-[#c5dce0] bg-[#082c4a] shadow-sm ${canShowImage ? "cursor-zoom-in" : ""}`}
              role={canShowImage ? "button" : undefined}
              tabIndex={canShowImage ? 0 : undefined}
              aria-label={canShowImage ? localize(`عرض صورة ${title} كبانوراما بالحجم الكامل`, `View ${title} as a full-size panorama`) : undefined}
              onClick={() => canShowImage && setIsPanoramaOpen(true)}
              onKeyDown={openPanoramaWithKeyboard}
            >
              {canShowImage ? (
                <>
                  <img src={research.imageUrl} alt="" aria-hidden="true" draggable={false} className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-xl" />
                  <img data-testid={`img-opportunity-${research.id}`} src={research.imageUrl} alt={localize(`صورة ${title}`, `Image of ${title}`)} draggable={false} onError={handleImageFailure} className="srma-media-image relative h-full w-full" />
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <img src={SRMA_LOGO} alt="" className="h-[80%] w-[80%] rounded-full object-cover opacity-20 blur-[0.3px]" />
                  <BookOpen size={38} className="absolute text-white/80" />
                  {imageFailed && <p role="status" className="relative px-4 text-xs font-bold text-white/90">{localize("تعذر عرض الصورة المحمية حالياً", "The protected image cannot be displayed at this time.")}</p>}
                </div>
              )}
              <img
                src={SRMA_LOGO}
                alt={localize("شعار SRMA", "SRMA logo")}
                aria-hidden="true"
                className={`pointer-events-none absolute top-3 h-11 w-11 rounded-xl border border-white/30 object-cover opacity-90 shadow-lg ${direction === "rtl" ? "right-3" : "left-3"}`}
              />
              {discount > 0 && (
                <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
                  <span data-testid={`discount-badge-${research.id}`} className="srma-discount-badge inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-600 px-3 py-1.5 text-xs font-black text-white shadow-lg">
                    <BadgePercent size={14} /> {localize(`تخفيض ${discount.toFixed(0)}%`, `Save ${discount.toFixed(0)}%`)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="hidden w-[68px] shrink-0 flex-col justify-between gap-1.5 2xl:flex">
            <span className="srma-media-side-chip border-slate-200 bg-white text-slate-600">{research.journalTarget || localize("المجلة المستهدفة", "Target journal")}</span>
            <span className="srma-media-side-chip border-slate-200 bg-white text-slate-700">{localize(`${research.seatsLeft} مقاعد`, `${research.seatsLeft} seats`)}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 2xl:hidden" dir={direction}>
          <span data-testid={`status-opportunity-${research.id}`} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">{status}</span>
          <span className="max-w-[48%] truncate rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700">{specialty}</span>
          <span className="max-w-[52%] truncate rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold text-slate-600">{research.journalTarget || localize("المجلة المستهدفة", "Target journal")}</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black text-slate-700">{localize(`${research.seatsLeft} مقاعد`, `${research.seatsLeft} seats`)}</span>
        </div>
        {canShowImage && <button type="button" data-testid={`button-expand-image-${research.id}`} onClick={() => setIsPanoramaOpen(true)} className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0C3156] transition hover:border-[#0C3156]/40 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0C3156]" aria-label={localize(`عرض صورة ${title} بالحجم الكامل`, `View ${title} full size`)}><Expand size={15} /></button>}
      </div>
      {isPanoramaOpen && canShowImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#041829]/[.94] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={localize(`صورة ${title}`, `Image of ${title}`)} onClick={() => setIsPanoramaOpen(false)}>
          <div className="relative flex h-[min(94vh,980px)] w-full max-w-7xl flex-col gap-3" onClick={(event) => event.stopPropagation()} onContextMenu={(event) => event.preventDefault()}>
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[#082c4a] shadow-2xl">
              <img src={research.imageUrl} alt="" aria-hidden="true" draggable={false} onError={handleImageFailure} className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl" />
              <img src={research.imageUrl} alt={localize(`صورة ${title}`, `Image of ${title}`)} draggable={false} onError={handleImageFailure} className="srma-protected-image relative max-h-full max-w-full object-contain shadow-2xl" />
            </div>
            <button type="button" data-testid={`button-close-image-${research.id}`} onClick={() => setIsPanoramaOpen(false)} className="absolute right-1 top-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-[#0b3657] text-white transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label={localize("إغلاق عرض الصورة", "Close image viewer")}><X size={20} /></button>
            <OpportunityMetadata research={research} className="mx-auto w-full max-w-4xl shrink-0" />
            <p className="sr-only">{title}</p>
          </div>
        </div>
      )}
    </>
  );
}