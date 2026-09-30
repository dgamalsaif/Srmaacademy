import { useState, useId } from "react";
import { ArrowRightLeft, DollarSign, Coins, Check, Calculator, Info } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useCurrency, SAR_PER_USD, formatOpportunityMoney } from "@/lib/currency";

interface CurrencyConverterProps {
  className?: string;
  variant?: "card" | "compact" | "banner";
}

export default function CurrencyConverter({ className = "", variant = "card" }: CurrencyConverterProps) {
  const { direction, language, localize } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [sarInput, setSarInput] = useState<string>("1500");
  const [usdInput, setUsdInput] = useState<string>(
    (Math.round((1500 / SAR_PER_USD) * 100) / 100).toString()
  );
  const [lastChanged, setLastChanged] = useState<"sar" | "usd">("sar");
  const [copied, setCopied] = useState(false);
  const sarInputId = useId();
  const usdInputId = useId();

  const handleSarChange = (value: string) => {
    setSarInput(value);
    setLastChanged("sar");
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      const converted = Math.round((num / SAR_PER_USD) * 100) / 100;
      setUsdInput(converted.toString());
    } else {
      setUsdInput("");
    }
  };

  const handleUsdChange = (value: string) => {
    setUsdInput(value);
    setLastChanged("usd");
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      const converted = Math.round(num * SAR_PER_USD * 100) / 100;
      setSarInput(converted.toString());
    } else {
      setSarInput("");
    }
  };

  const handlePresetClick = (sarAmount: number) => {
    handleSarChange(sarAmount.toString());
  };

  const presets = [
    { sar: 500, labelAr: "500 ر.س", labelEn: "500 SAR" },
    { sar: 1000, labelAr: "1,000 ر.س", labelEn: "1,000 SAR" },
    { sar: 1500, labelAr: "1,500 ر.س", labelEn: "1,500 SAR" },
    { sar: 2500, labelAr: "2,500 ر.س", labelEn: "2,500 SAR" },
    { sar: 3750, labelAr: "3,750 ر.س (1000$)", labelEn: "3,750 SAR ($1k)" },
  ];

  return (
    <div
      className={`rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/20 to-slate-50 p-5 sm:p-7 shadow-sm ${className}`}
      dir={direction}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0C3156] text-white flex items-center justify-center shadow-sm">
            <Calculator size={20} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {localize("محول الأسعار المباشر (ريال سعودي ⮂ دولار أمريكي)", "Live Currency Converter (SAR ⮂ USD)")}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {localize("حساب وتحويل فوري لرسوم المشاركة والفرص البحثية", "Instant calculation & conversion of research opportunity fees")}
            </p>
          </div>
        </div>

        {/* Global Currency Selection Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-500">
            {localize("عرض أسعار الموقع بـ:", "Display site prices in:")}
          </span>
          <div className="inline-flex rounded-xl bg-slate-200/80 p-0.5" dir="ltr">
            <button
              type="button"
              onClick={() => setCurrency("SAR")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                currency === "SAR"
                  ? "bg-[#117b59] text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              🇸🇦 SAR
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                currency === "USD"
                  ? "bg-[#117b59] text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              🇺🇸 USD
            </button>
          </div>
        </div>
      </div>

      {/* Converter Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
        {/* SAR Box */}
        <div className="md:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-[#117b59]/40 transition-colors">
          <label htmlFor={sarInputId} className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2 cursor-pointer">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🇸🇦</span>
              <span>{localize("المبلغ بالريال السعودي (SAR)", "Amount in Saudi Riyals (SAR)")}</span>
            </span>
            <span className="text-emerald-700 font-extrabold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">
              ر.س
            </span>
          </label>
          <div className="relative">
            <input
              id={sarInputId}
              type="number"
              min="0"
              step="10"
              value={sarInput}
              onChange={(e) => handleSarChange(e.target.value)}
              placeholder="0.00"
              dir="ltr"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-lg font-black text-slate-900 outline-none focus:border-[#117b59] focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>
        </div>

        {/* Exchange Arrow Divider */}
        <div className="md:col-span-1 flex justify-center py-1 md:py-0">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#117b59] shadow-2xs">
            <ArrowRightLeft size={16} />
          </div>
        </div>

        {/* USD Box */}
        <div className="md:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-[#0C3156]/40 transition-colors">
          <label htmlFor={usdInputId} className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2 cursor-pointer">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🇺🇸</span>
              <span>{localize("المبلغ بالدولار الأمريكي (USD)", "Amount in US Dollars (USD)")}</span>
            </span>
            <span className="text-[#0C3156] font-extrabold text-[11px] bg-blue-50 px-2 py-0.5 rounded-md">
              $ USD
            </span>
          </label>
          <div className="relative">
            <input
              id={usdInputId}
              type="number"
              min="0"
              step="5"
              value={usdInput}
              onChange={(e) => handleUsdChange(e.target.value)}
              placeholder="0.00"
              dir="ltr"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-lg font-black text-slate-900 outline-none focus:border-[#0C3156] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Preset Amount Chips & Exchange Rate Note */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1 ml-1">
            {localize("مبالغ شائعة:", "Quick amounts:")}
          </span>
          {presets.map((preset) => (
            <button
              key={preset.sar}
              type="button"
              onClick={() => handlePresetClick(preset.sar)}
              className="rounded-lg border border-slate-200 bg-white hover:bg-slate-100 hover:border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
            >
              {language === "ar" ? preset.labelAr : preset.labelEn}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <Info size={13} className="text-emerald-600" />
          <span>
            {localize("سعر الصرف الرسمي المعتمد: 1 دولار أمريكي = 3.75 ريال سعودي", "Official fixed conversion rate: 1 USD = 3.75 SAR")}
          </span>
        </div>
      </div>
    </div>
  );
}
