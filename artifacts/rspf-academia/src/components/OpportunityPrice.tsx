import { BadgePercent, ChevronDown } from "lucide-react";
import { OpportunityCurrency, formatOpportunityMoney, getDiscountPercentage } from "@/lib/opportunityPricing";
import { useLanguage } from "@/lib/i18n";

interface OpportunityPriceProps {
  originalSar?: number;
  discountedSar?: number;
  currency: OpportunityCurrency;
  onCurrencyChange: (currency: OpportunityCurrency) => void;
  compact?: boolean;
}

export default function OpportunityPrice({ originalSar = 1500, discountedSar = 1000, currency, onCurrencyChange, compact = false }: OpportunityPriceProps) {
  const { direction, language, localize } = useLanguage();
  const discount = getDiscountPercentage(originalSar, discountedSar);
  return (
    <div className={`rounded-2xl border border-emerald-100 bg-gradient-to-l from-emerald-50 to-amber-50/50 ${compact ? "p-3" : "p-4"}`} dir={direction}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1 text-xs font-black text-[#117b59]"><BadgePercent size={15} /> {localize("سعر الاشتراك", "Subscription price")}</span>
        <label className="relative">
          <select aria-label={localize("عملة السعر", "Price currency")} value={currency} onChange={(event) => onCurrencyChange(event.target.value as OpportunityCurrency)} className="appearance-none rounded-lg border border-emerald-200 bg-white py-1.5 pr-3 pl-7 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200">
            <option value="SAR">{localize("ريال سعودي", "Saudi riyal")}</option>
            <option value="USD">{localize("دولار أمريكي", "US dollar")}</option>
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
        </label>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">{localize("السعر بعد التخفيض", "Discounted price")}</p>
          <p dir="ltr" className={`${compact ? "text-xl" : "text-2xl"} font-black text-[#0c3156]`}>{formatOpportunityMoney(discountedSar, currency, language)}</p>
        </div>
        <div className="text-left">
          <p dir="ltr" className="text-xs text-slate-400 line-through">{formatOpportunityMoney(originalSar, currency, language)}</p>
          <span className="mt-1 inline-block rounded-full bg-[#e9a020] px-2 py-0.5 text-[10px] font-black text-[#0c3156]">{localize("وفّر", "Save")} {discount.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}