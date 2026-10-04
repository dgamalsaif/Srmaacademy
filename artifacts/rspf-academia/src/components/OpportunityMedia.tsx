import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BadgePercent, BookOpen, Clock3, Expand, LibraryBig, UsersRound, X } from "lucide-react";
import { ResearchOpportunity } from "@/lib/researchData";
import { formatOpportunityMoney, getDiscountPercentage } from "@/lib/opportunityPricing";
import { SRMA_LOGO } from "@/components/BrandBackground";
import BrandLogo from "@/components/BrandLogo";
import { useLanguage } from "@/lib/i18n";
import { useSiteContentSettings } from "@/hooks/use-site-content-settings";
import { getEnglishOpportunityTitle } from "@/lib/opportunityDisplay";
import { getPublicImageUrl, isFieldVisible } from "@/lib/opportunityVisibility";

function OpportunityMetadata({ research, className = "" }: { research: ResearchOpportunity; className?: string }) {
  const { direction, language, localize } = useLanguage();
  const originalSar = research.priceOriginalSar ?? research.priceDiscountedSar ?? 0;
  const discountedSar = research.priceDiscountedSar ?? research.priceOriginalSar ?? 0;
  const hasPrice = research.priceOriginalSar !== undefined || research.priceDiscountedSar !== undefined;
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
  const showJournal = isFieldVisible(research, "journal");
  const showIndexed = isFieldVisible(research, "indexedIn");
  const showDuration = isFieldVisible(research, "duration");
  const showPrice = isFieldVisible(research, "price");
  const showSeats = isFieldVisible(research, "seats");

  return (
    <div className={`srma-media-info rounded-xl border border-white/20 bg-[#061f35]/90 p-2.5 text-white shadow-xl backdrop-blur-md ${className}`} dir={direction}>
      {showJournal && <div className="flex items-center gap-1.5 border-b border-white/15 pb-1.5">
        <LibraryBig size={13} className="shrink-0 text-[#8ee0c3]" />
        <p className="min-w-0 truncate text-[11px] font-black">{research.journalTarget || localize("المجلة المستهدفة", "Target journal")}</p>
      </div>}
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {showIndexed && journalDetails.map((detail) => (
          <span key={detail} className="srma-media-detail-chip">{detail}</span>
        ))}
        {showIndexed && research.indexedIn?.map((index) => (
          <span key={`index-${index}`} className="srma-media-detail-chip">{localize("مفهرسة في", "Indexed in")} {index}</span>
        ))}
        {showDuration && research.duration && (
          <span className="srma-media-detail-chip inline-flex items-center gap-1"><Clock3 size={10} /> {research.duration}</span>
        )}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-[1.15fr_1fr] sm:items-center">
        {showPrice && hasPrice && <div className="flex items-center gap-2 rounded-lg border border-[#8ee0c3]/30 bg-[#07634e]/55 px-2 py-1.5">
          <BadgePercent size={16} className="shrink-0 text-[#8ee0c3]" />
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-white/70">{discount > 0 ? localize("السعر بعد الخصم", "Discounted price") : localize("رسوم المشاركة", "Participation fee")}</p>
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
        </div>}
        {(showPrice || showSeats) && <div className="flex items-center justify-between gap-2 rounded-lg border border-white/15 bg-white/10 px-2 py-1.5">
          {showPrice && discount > 0 && <div>
            <p className="text-[9px] font-bold text-white/65">{localize("السعر الأصلي", "Original price")}</p>
            <p dir="ltr" className="text-[11px] font-black text-white/85 line-through">{formatOpportunityMoney(originalSar, "SAR", language)}</p>
          </div>}
          {showSeats && <div className="text-left">
            <p className="text-[9px] font-bold text-white/65">{localize("المقاعد", "Seats")}</p>
            <p className="inline-flex items-center gap-1 text-[11px] font-black text-white"><UsersRound size={11} /> {localize(`${research.seatsLeft} متاح من ${research.totalSeats}`, `${research.seatsLeft} of ${research.totalSeats} available`)}</p>
          </div>}
        </div>}
      </div>
      {showSeats && (firstAuthorSeats !== undefined || coAuthorSeats !== undefined) && (
        <div className="mt-1.5 flex flex-wrap justify-end gap-1">
          {firstAuthorSeats !== undefined && <span className="srma-media-seat-chip">{localize("الكاتب الأول", "First author")}: {firstAuthorSeats} {localize("متاح", "available")}</span>}
          {coAuthorSeats !== undefined && <span className="srma-media-seat-chip">{localize("المؤلفون المشاركون", "Co-authors")}: {coAuthorSeats} {localize("متاح", "available")}</span>}
        </div>
      )}
    </div>
  );
}

export default function OpportunityMedia({ research, className = "aspect-[4/3] min-h-[172px]" }: { research: ResearchOpportunity; className?: string }) {
  const { data: settings } = useSiteContentSettings();
  const brandLogo = settings?.brand.logoUrl || SRMA_LOGO;
  const brandName = settings?.brand.siteNameAr || settings?.brand.siteNameEn || "SRMA";
  const { direction, language, localize } = useLanguage();
  const title = getEnglishOpportunityTitle(research);
  const originalSar = research.priceOriginalSar ?? research.priceDiscountedSar ?? 0;
  const discountedSar = research.priceDiscountedSar ?? research.priceOriginalSar ?? 0;
  const discount = getDiscountPercentage(originalSar, discountedSar);
  const [imageFailed, setImageFailed] = useState(false);
  const [isPanoramaOpen, setIsPanoramaOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const imageUrl = getPublicImageUrl(research);
  const canShowImage = Boolean(imageUrl) && !imageFailed;

  useEffect(() => setImageFailed(false), [imageUrl]);
  useEffect(() => {
    if (!isPanoramaOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPanoramaOpen(false);
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [isPanoramaOpen]);

  const handleImageFailure = () => {
    setImageFailed(true);
    setIsPanoramaOpen(false);
  };

  if (!isFieldVisible(research, "image")) return null;

  return (
    <>
      <div className={`srma-protected-image relative min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-[#082c4a] ${className}`} dir={direction} onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
        {canShowImage ? (
          <button type="button" data-testid={`button-expand-image-${research.id}`} onClick={() => setIsPanoramaOpen(true)} className="absolute inset-0 h-full w-full cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-emerald-400" aria-label={localize(`عرض صورة ${title} بالحجم الكامل`, `View ${title} full size`)}>
            <img loading="lazy" decoding="async" data-testid={`img-opportunity-${research.id}`} src={imageUrl} alt={localize(`صورة ${title}`, `Image of ${title}`)} draggable={false} onError={handleImageFailure} className="h-full w-full object-contain" />
            <span className="absolute bottom-2 end-2 flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-[#082c4a]/90 text-white"><Expand size={17} aria-hidden="true" /></span>
          </button>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center text-white/80">
            <BookOpen size={30} aria-hidden="true" />
            <p role="status" className="text-xs">{imageFailed ? localize("تعذر تحميل الصورة", "Image could not be loaded") : localize("لا توجد صورة لهذه الفرصة", "No image for this opportunity")}</p>
          </div>
        )}
        <BrandLogo src={brandLogo} alt={localize(`شعار ${brandName}`, `${brandName} logo`)} animationEnabled={false} decorative className="pointer-events-none absolute start-2 top-2 h-8 w-8 rounded-lg border border-white/25 object-cover" />
        {isFieldVisible(research, "price") && discount > 0 && <span data-testid={`discount-badge-${research.id}`} className="pointer-events-none absolute end-2 top-2 inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2 py-1 text-[11px] font-bold text-white"><BadgePercent size={12} /> {localize("خصم", "Save")} {discount.toFixed(0)}%</span>}
      </div>
      {isPanoramaOpen && canShowImage && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#041829]/[.94] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={localize(`صورة ${title}`, `Image of ${title}`)} onClick={() => setIsPanoramaOpen(false)}>
          <div className="relative flex h-[min(94vh,980px)] w-full max-w-7xl flex-col gap-3" onClick={(event) => event.stopPropagation()} onContextMenu={(event) => event.preventDefault()}>
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[#082c4a] shadow-2xl">
              <img src={imageUrl} alt="" aria-hidden="true" draggable={false} onError={handleImageFailure} className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl" />
              <img src={imageUrl} alt={localize(`صورة ${title}`, `Image of ${title}`)} draggable={false} onError={handleImageFailure} className="srma-protected-image relative max-h-full max-w-full object-contain shadow-2xl" />
            </div>
             <button ref={closeButtonRef} type="button" data-testid={`button-close-image-${research.id}`} onClick={() => setIsPanoramaOpen(false)} className="absolute right-1 top-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-[#0b3657] text-white transition-colors hover:bg-[#15486d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label={localize("إغلاق عرض الصورة", "Close image viewer")}><X size={20} /></button>
            <OpportunityMetadata research={research} className="mx-auto w-full max-w-4xl shrink-0" />
            <p className="sr-only">{title}</p>
          </div>
         </div>, document.body
      )}
    </>
  );
}