import { BadgePercent, ChevronDown } from "lucide-react";
import { OpportunityCurrency, formatOpportunityMoney, getDiscountPercentage } from "@/lib/opportunityPricing";

interface OpportunityPriceProps {
  originalSar?: number;
  discountedSar?: number;
  currency: OpportunityCurrency;
  onCurrencyChange: (currency: OpportunityCurrency) => void;
  compact?: boolean;
}

export default function OpportunityPrice({ originalSar = 1500, discountedSar = 1000, currency, onCurrencyChange, compact = false }: OpportunityPriceProps) {
  const discount = getDiscountPercentage(originalSar, discountedSar);
  return (
    <div className={`rounded-2xl border border-emerald-100 bg-gradient-to-l from-emerald-50 to-amber-50/50 ${compact ? "p-3" : "p-4"}`} dir="rtl">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1 text-xs font-black text-[#117b59]"><BadgePercent size={15} /> سعر الاشتراك</span>
        <label className="relative">
          <select aria-label="عملة السعر" value={currency} onChange={(event) => onCurrencyChange(event.target.value as OpportunityCurrency)} className="appearance-none rounded-lg border border-emerald-200 bg-white py-1.5 pr-3 pl-7 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200">
            <option value="SAR">ريال سعودي</option>
            <option value="USD">دولار أمريكي</option>
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
        </label>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">السعر بعد التخفيض</p>
          <p className={`${compact ? "text-xl" : "text-2xl"} font-black text-[#0c3156]`}>{formatOpportunityMoney(discountedSar, currency)}</p>
        </div>
        <div className="text-left">
          <p className="text-xs text-slate-400 line-through">{formatOpportunityMoney(originalSar, currency)}</p>
          <span className="mt-1 inline-block rounded-full bg-[#e9a020] px-2 py-0.5 text-[10px] font-black text-[#0c3156]">وفر {discount.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}