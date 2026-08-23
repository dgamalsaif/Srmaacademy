import { useMemo, useState } from "react";
import { Search, Stethoscope, X } from "lucide-react";
import type { ResearchOpportunity } from "@/lib/researchData";
import type { SpecialtyOption } from "@/lib/siteContentSettings";
import { useLanguage } from "@/lib/i18n";

interface SpecialtyFilterProps {
  options: SpecialtyOption[];
  selectedSpecialty: string | null;
  onSelect: (specialty: string | null) => void;
  className?: string;
}

export function buildSpecialtyOptions(
  configuredOptions: SpecialtyOption[],
  opportunities: ResearchOpportunity[],
): SpecialtyOption[] {
  const seen = new Set<string>();
  const result: SpecialtyOption[] = [];
  const add = (option: SpecialtyOption) => {
    const nameAr = option.nameAr?.trim() || "";
    const nameEn = option.nameEn?.trim() || "";
    const key = `${nameEn.toLowerCase()}|${nameAr.toLowerCase()}`;
    if (!key || key === "|" || seen.has(key)) return;
    seen.add(key);
    result.push({ ...option, nameAr, nameEn });
  };

  configuredOptions.forEach(add);
  opportunities.forEach((opportunity) => add({
    id: `program-specialty-${opportunity.id}`,
    nameAr: opportunity.specialtyAr || opportunity.specialty || "",
    nameEn: opportunity.specialtyEn || opportunity.specialty || "",
  }));
  return result;
}

export function specialtyMatches(opportunity: ResearchOpportunity, specialty: string | null) {
  if (!specialty) return true;
  return [opportunity.specialty, opportunity.specialtyAr, opportunity.specialtyEn]
    .filter(Boolean)
    .some((value) => value === specialty);
}

export default function SpecialtyFilter({
  options,
  selectedSpecialty,
  onSelect,
  className = "",
}: SpecialtyFilterProps) {
  const { direction, localize } = useLanguage();
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearchText(query);
  const visibleOptions = useMemo(() => {
    if (!normalizedQuery) return options;
    return options.filter((option) => [option.nameAr, option.nameEn]
      .some((name) => normalizeSearchText(name).includes(normalizedQuery)));
  }, [normalizedQuery, options]);

  if (options.length === 0) return null;

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm ${className}`}
      dir={direction}
      aria-label={localize("تصفية الفرص حسب التخصص", "Filter opportunities by specialty")}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
        <Stethoscope size={16} className="text-[#117b59]" />
        <span>{localize("التخصصات الدقيقة", "Specialties")}</span>
      </div>
      <label className="relative mb-3 block">
        <span className="sr-only">{localize("ابحث عن تخصص", "Search specialties")}</span>
        <Search size={17} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          data-testid="input-specialty-search"
          placeholder={localize("ابحث عن التخصص بالعربية أو الإنجليزية", "Search specialties in Arabic or English")}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pe-10 ps-10 text-sm text-slate-800 outline-none transition focus:border-[#117b59] focus:bg-white focus:ring-2 focus:ring-[#117b59]/15"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={localize("مسح بحث التخصص", "Clear specialty search")}
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700"
          >
            <X size={15} />
          </button>
        )}
      </label>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          data-testid="button-specialty-all"
          onClick={() => onSelect(null)}
          aria-pressed={!selectedSpecialty}
          className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
            !selectedSpecialty
              ? "border-[#117b59] bg-[#117b59] text-white"
              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#117b59]/35 hover:bg-[#e6f5ef]"
          }`}
        >
          {localize("كل التخصصات", "All specialties")}
        </button>
        {visibleOptions.map((option) => {
          const value = option.nameEn || option.nameAr;
          const selected = selectedSpecialty === value;
          return (
            <button
              type="button"
              key={option.id}
              data-testid={`button-specialty-${option.id}`}
              onClick={() => onSelect(value)}
              aria-pressed={selected}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
                selected
                  ? "border-[#117b59] bg-[#117b59] text-white"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#117b59]/35 hover:bg-[#e6f5ef]"
              }`}
            >
              {localize(option.nameAr, option.nameEn)}
            </button>
          );
        })}
      </div>
      {visibleOptions.length === 0 && (
        <p className="py-3 text-center text-xs font-semibold text-slate-500">
          {localize("لا يوجد تخصص مطابق لعبارة البحث.", "No specialty matches your search.")}
        </p>
      )}
    </section>
  );
}

function normalizeSearchText(value = "") {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}