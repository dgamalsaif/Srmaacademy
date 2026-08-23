import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";

export type CountryOption = {
  name: string;
  nameEn: string;
  code: string;
  flag: string;
  aliases?: string[];
};

export const COUNTRIES: CountryOption[] = [
  { name: "المملكة العربية السعودية", nameEn: "Saudi Arabia", code: "+966", flag: "🇸🇦", aliases: ["السعودية", "saudi"] },
  { name: "اليمن", nameEn: "Yemen", code: "+967", flag: "🇾🇪", aliases: ["yemen"] },
  { name: "الإمارات العربية المتحدة", nameEn: "United Arab Emirates", code: "+971", flag: "🇦🇪", aliases: ["الإمارات", "uae"] },
  { name: "الكويت", nameEn: "Kuwait", code: "+965", flag: "🇰🇼", aliases: ["kuwait"] },
  { name: "قطر", nameEn: "Qatar", code: "+974", flag: "🇶🇦", aliases: ["qatar"] },
  { name: "البحرين", nameEn: "Bahrain", code: "+973", flag: "🇧🇭", aliases: ["bahrain"] },
  { name: "عُمان", nameEn: "Oman", code: "+968", flag: "🇴🇲", aliases: ["oman"] },
  { name: "مصر", nameEn: "Egypt", code: "+20", flag: "🇪🇬", aliases: ["egypt"] },
  { name: "الأردن", nameEn: "Jordan", code: "+962", flag: "🇯🇴", aliases: ["jordan"] },
  { name: "العراق", nameEn: "Iraq", code: "+964", flag: "🇮🇶", aliases: ["iraq"] },
  { name: "سوريا", nameEn: "Syria", code: "+963", flag: "🇸🇾", aliases: ["syria"] },
  { name: "لبنان", nameEn: "Lebanon", code: "+961", flag: "🇱🇧", aliases: ["lebanon"] },
  { name: "فلسطين", nameEn: "Palestine", code: "+970", flag: "🇵🇸", aliases: ["palestine"] },
  { name: "المغرب", nameEn: "Morocco", code: "+212", flag: "🇲🇦", aliases: ["morocco"] },
  { name: "الجزائر", nameEn: "Algeria", code: "+213", flag: "🇩🇿", aliases: ["algeria"] },
  { name: "تونس", nameEn: "Tunisia", code: "+216", flag: "🇹🇳", aliases: ["tunisia"] },
  { name: "ليبيا", nameEn: "Libya", code: "+218", flag: "🇱🇾", aliases: ["libya"] },
  { name: "السودان", nameEn: "Sudan", code: "+249", flag: "🇸🇩", aliases: ["sudan"] },
  { name: "تركيا", nameEn: "Turkey", code: "+90", flag: "🇹🇷", aliases: ["turkey"] },
  { name: "المملكة المتحدة", nameEn: "United Kingdom", code: "+44", flag: "🇬🇧", aliases: ["uk", "britain"] },
  { name: "الولايات المتحدة", nameEn: "United States", code: "+1", flag: "🇺🇸", aliases: ["usa", "america"] },
  { name: "كندا", nameEn: "Canada", code: "+1", flag: "🇨🇦", aliases: ["canada"] },
  { name: "ألمانيا", nameEn: "Germany", code: "+49", flag: "🇩🇪", aliases: ["germany"] },
  { name: "فرنسا", nameEn: "France", code: "+33", flag: "🇫🇷", aliases: ["france"] },
  { name: "أستراليا", nameEn: "Australia", code: "+61", flag: "🇦🇺", aliases: ["australia"] },
  { name: "الهند", nameEn: "India", code: "+91", flag: "🇮🇳", aliases: ["india"] },
  { name: "باكستان", nameEn: "Pakistan", code: "+92", flag: "🇵🇰", aliases: ["pakistan"] },
];

interface CountrySelectorProps {
  country: string;
  onCountryChange: (country: string) => void;
  dialCode: string;
  onDialCodeChange: (code: string) => void;
  id?: string;
  required?: boolean;
  compact?: boolean;
}

/**
 * A searchable country dial-code picker. Selecting a dial code always updates
 * the associated country, keeping phone and location data consistent.
 */
export default function CountrySelector({
  country,
  onCountryChange,
  dialCode,
  onDialCodeChange,
  id = "country",
  required = false,
  compact = false,
}: CountrySelectorProps) {
  const { direction, language, localize } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(dialCode);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(dialCode), [dialCode]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return COUNTRIES;
    return COUNTRIES.filter((item) =>
      [item.name, item.nameEn, item.code, ...(item.aliases || [])].some((entry) => entry.toLowerCase().includes(normalized)),
    );
  }, [query]);

  const selectedCountry = COUNTRIES.find((item) => item.name === country || item.nameEn === country);
  const selected = selectedCountry ?? COUNTRIES[0];
  const choose = (item: CountryOption) => {
    onCountryChange(item.name);
    onDialCodeChange(item.code);
    setQuery(item.code);
    setOpen(false);
  };

  return (
    <div className={compact ? "grid grid-cols-[minmax(0,1fr)_120px] gap-2" : "grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_150px] gap-3"} dir={direction}>
      <div>
        <label htmlFor={`${id}-country`} className="mb-1.5 block text-right text-sm font-semibold text-slate-700">
          {localize("الدولة", "Country")} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative">
          <input
            id={`${id}-country`}
            value={selectedCountry ? (language === "ar" ? selected.name : selected.nameEn) : country}
            readOnly
            required={required}
            aria-label={localize("الدولة المختارة", "Selected country")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm font-medium text-slate-700 outline-none"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">{selected.flag}</span>
        </div>
      </div>
      <div ref={root} className="relative">
        <label htmlFor={`${id}-dial-code`} className="mb-1.5 block text-right text-sm font-semibold text-slate-700">
          {localize("رمز الدولة", "Dial code")}
        </label>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id={`${id}-dial-code`}
            data-testid={`input-${id}-dial-code`}
            aria-label={localize("ابحث برمز الدولة أو اسمها", "Search by country name or dial code")}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            placeholder="+966"
            dir="ltr"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-9 pl-8 text-left text-sm outline-none transition focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15"
          />
          <ChevronDown size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        {open && (
          <div className="absolute z-30 mt-1 max-h-56 w-[min(320px,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
            {matches.length ? matches.map((item) => (
              <button
                type="button"
                key={`${item.name}-${item.code}`}
                onClick={() => choose(item)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-right text-sm transition hover:bg-[#f3fbf8]"
              >
                <span className="text-lg">{item.flag}</span>
                <span className="flex-1 font-medium text-slate-700">{language === "ar" ? item.name : item.nameEn}</span>
                <span className="font-bold text-[#117b59]" dir="ltr">{item.code}</span>
              </button>
            )) : <p className="px-3 py-4 text-center text-xs text-slate-400">{localize("لا توجد دولة مطابقة للبحث", "No matching country found")}</p>}
          </div>
        )}
      </div>
    </div>
  );
}