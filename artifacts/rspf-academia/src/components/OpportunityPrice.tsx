import { BadgePercent, ArrowRightLeft } from "lucide-react";
import {
  OpportunityCurrency,
  formatOpportunityMoney,
  formatDualOpportunityMoney,
  getDiscountPercentage,
  useCurrency,
  SAR_PER_USD,
} from "@/lib/opportunityPricing";
import { useLanguage } from "@/lib/i18n";

interface OpportunityPriceProps {
  originalSar?: number;
  discountedSar?: number;
  currency?: OpportunityCurrency;
  onCurrencyChange?: (currency: OpportunityCurrency) => void;
  compact?: boolean;
  showDualEquiv?: boolean;
}

export default function OpportunityPrice({
  originalSar: providedOriginal,
  discountedSar: providedDiscounted,
  currency: propCurrency,
  onCurrencyChange,
  compact = false,
  showDualEquiv = true,
}: OpportunityPriceProps) {
  const { direction, language, localize } = useLanguage();
  const globalCurrency = useCurrency();

  const activeCurrency: OpportunityCurrency = propCurrency ?? globalCurrency.currency;
  const setCurrency = (next: OpportunityCurrency) => {
    if (onCurrencyChange) {
      onCurrencyChange(next);
    }
    globalCurrency.setCurrency(next);
  };

  const originalSar = providedOriginal ?? providedDiscounted;
  const discountedSar = providedDiscounted ?? providedOriginal;
  if (originalSar === undefined || discountedSar === undefined) {
    return <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">{localize("الرسوم غير محددة؛ تواصل مع الأكاديمية للاستفسار.", "Fees are not specified; contact the academy for details.")}</p>;
  }
  const discount = getDiscountPercentage(originalSar, discountedSar);
  const dual = formatDualOpportunityMoney(discountedSar, activeCurrency, language);
  const dualOriginal = formatDualOpportunityMoney(originalSar, activeCurrency, language);

  return (
    <div
      className={`rounded-2xl border border-emerald-100 bg-gradient-to-l from-emerald-50/70 via-white to-amber-50/40 shadow-2xs ${
        compact ? "p-3" : "p-4"
      }`}
      dir={direction}
    >
      {/* Top Header: Badge + Currency Switcher */}
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-black text-[#117b59]">
          <BadgePercent size={15} />
          {localize("سعر الاشتراك والفرصة", "Subscription Price")}
        </span>

        {/* Currency Switcher Buttons */}
        <div className="inline-flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200 shadow-2xs" dir="ltr">
          <button
            type="button"
            data-testid="button-currency-sar"
            onClick={() => setCurrency("SAR")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
              activeCurrency === "SAR"
                ? "bg-[#0C3156] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            SAR
          </button>
          <button
            type="button"
            data-testid="button-currency-usd"
            onClick={() => setCurrency("USD")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
              activeCurrency === "USD"
                ? "bg-[#0C3156] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            USD
          </button>
        </div>
      </div>

      {/* Main Prices */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-slate-500 font-semibold mb-0.5">
            {discount > 0 ? localize("السعر بعد التخفيض", "Discounted price") : localize("رسوم المشاركة", "Participation fee")}
          </p>
          <div className="flex items-baseline gap-2">
            <span
              dir="ltr"
              className={`${
                compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
              } font-black text-[#0c3156] tracking-tight`}
            >
              {dual.primary}
            </span>
          </div>

          {/* Dual secondary conversion display */}
          {showDualEquiv && (
            <p className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <ArrowRightLeft size={11} className="text-emerald-600" />
              <span>
                {localize(
                  `يعادل تقريباً: ${dual.secondary}`,
                  `Approx. equivalent: ${dual.secondary}`
                )}
              </span>
            </p>
          )}
        </div>

        <div className="text-left">
          {discount > 0 && <p dir="ltr" className="text-xs text-slate-400 line-through font-semibold">
            {dualOriginal.primary}
          </p>}
          {discount > 0 && (
            <span className="mt-1 inline-block rounded-full bg-[#e9a020] px-2.5 py-0.5 text-[10px] font-black text-[#0c3156] shadow-2xs">
              {localize("وفر", "Save")} {discount.toFixed(0)}%
            </span>
          )}
          <p className="text-[9px] text-slate-400 mt-1 text-right sm:text-left">
            1$ = {SAR_PER_USD} ر.س
          </p>
        </div>
      </div>
    </div>
  );
}
