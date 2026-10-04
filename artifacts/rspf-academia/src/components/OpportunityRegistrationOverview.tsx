import type { ReactNode } from "react";
import { BookOpen, CalendarDays, Clock3, GraduationCap, LibraryBig, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import OpportunityMedia from "@/components/OpportunityMedia";
import OpportunityPrice from "@/components/OpportunityPrice";
import { useLanguage } from "@/lib/i18n";
import { getResearchStatusLabel } from "@/lib/opportunityPricing";
import type { ResearchOpportunity } from "@/lib/researchData";
import { getEnglishOpportunityTitle } from "../lib/opportunityDisplay";

interface Props {
  opportunity: ResearchOpportunity;
  showDetails: boolean;
  brandName: string;
}

function Fact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 transition-colors hover:border-emerald-200">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#117b59]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-500">{label}</p>
        <div className="mt-0.5 break-words text-sm font-black text-[#0c3156]">{children}</div>
      </div>
    </div>
  );
}

export default function OpportunityRegistrationOverview({ opportunity, showDetails, brandName }: Props) {
  const { direction, language, localize } = useLanguage();
  const englishTitle = getEnglishOpportunityTitle(opportunity);
  const code = `RES-2026-${opportunity.id}`;
  const specialty = localize(opportunity.specialtyAr, opportunity.specialtyEn, opportunity.specialty);

  const header = (
    <div className="p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-[#0c3156] px-2.5 py-1 text-xs font-black text-white">{brandName}</span>
        <span dir="ltr" className="rounded-lg bg-emerald-100 px-2.5 py-1 font-mono text-xs font-black text-[#117b59]">{code}</span>
        {showDetails && (
          <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-black text-[#0c3156]">
            {getResearchStatusLabel(opportunity.status, language)}
          </span>
        )}
      </div>
      <p className="mt-4 text-[11px] font-black uppercase tracking-wider text-[#117b59]">
        {localize("فرصة بحثية جديدة", "New research opportunity")}
      </p>
      <h1
        id="opp-overview-title"
        dir="ltr"
        lang="en"
        className="mt-1 break-words text-left text-xl font-black leading-snug text-[#0c3156] sm:text-2xl"
        data-testid="text-opportunity-title"
      >
        {englishTitle}
      </h1>
      {specialty && <p className="mt-2 text-sm font-bold text-[#117b59]">{localize("التخصص:", "Specialty:")} {specialty}</p>}
    </div>
  );

  const shell = "overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg";

  if (!showDetails) {
    return (
      <section aria-labelledby="opp-overview-title" className={shell} dir={direction} data-testid="section-opportunity-overview-minimal">
        <OpportunityMedia research={opportunity} className="h-56 w-full" />
        <div className="border-s-4 border-[#117b59]">{header}</div>
      </section>
    );
  }

  const description = localize(opportunity.descriptionAr, opportunity.descriptionEn, opportunity.description);
  const issnLines = [
    opportunity.journalIssn && `ISSN: ${opportunity.journalIssn}`,
    opportunity.journalPubmed && `PubMed: ${opportunity.journalPubmed}`,
    opportunity.journalScopus && `Scopus: ${opportunity.journalScopus}`,
    opportunity.journalWos && `WOS: ${opportunity.journalWos}`,
  ].filter(Boolean) as string[];
  const indexed = (opportunity.indexedIn || []).filter(Boolean);
  const benefits = (opportunity.benefits || []).filter(Boolean);
  const first = typeof opportunity.firstAuthorSeatsLeft === "number" ? opportunity.firstAuthorSeatsLeft : undefined;
  const co = typeof opportunity.coAuthorSeatsLeft === "number" ? opportunity.coAuthorSeatsLeft : undefined;
  const hasSeats = typeof opportunity.seatsLeft === "number" && typeof opportunity.totalSeats === "number";
  const original = opportunity.priceOriginalSar;
  const discounted = opportunity.priceDiscountedSar;
  const hasPrice = typeof original === "number" || typeof discounted === "number";
  const created = opportunity.createdAt ? new Date(opportunity.createdAt) : null;
  const dateText = created && !Number.isNaN(created.getTime())
    ? created.toLocaleDateString(language === "ar" ? "ar-SA" : "en-GB", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <section aria-labelledby="opp-overview-title" className={shell} dir={direction} data-testid="section-opportunity-overview">
      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="bg-slate-900">
          <OpportunityMedia research={opportunity} className="aspect-[4/3] w-full lg:h-full lg:min-h-[300px]" />
        </div>
        <div className="border-b border-emerald-100 lg:border-b-0 lg:border-s">
          {header}
          {specialty && (
            <div className="px-5 pb-5 sm:px-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-[#117b59]">
                <GraduationCap size={14} aria-hidden="true" />
                {specialty}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 border-t border-emerald-100 bg-slate-50/60 p-5 sm:p-7">
        {description && (
          <div>
            <h2 className="flex items-center gap-2 text-sm font-black text-[#0c3156]">
              <BookOpen size={16} className="text-[#117b59]" aria-hidden="true" />
              {localize("عن هذه الدراسة", "About this study")}
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{description}</p>
          </div>
        )}

        <div>
          <h2 className="sr-only">{localize("تفاصيل الدراسة", "Study details")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {opportunity.journalTarget && (
              <Fact icon={<LibraryBig size={16} aria-hidden="true" />} label={localize("المجلة المستهدفة", "Target journal")}>
                <span>{opportunity.journalTarget}</span>
                {(issnLines.length > 0 || indexed.length > 0) && (
                  <div dir="ltr" className="mt-1.5 flex flex-wrap gap-1">
                    {issnLines.map((l) => (
                      <span key={l} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{l}</span>
                    ))}
                    {indexed.map((i) => (
                      <span key={i} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#117b59]">{i}</span>
                    ))}
                  </div>
                )}
              </Fact>
            )}
            {opportunity.duration && (
              <Fact icon={<Clock3 size={16} aria-hidden="true" />} label={localize("المدة", "Duration")}>{opportunity.duration}</Fact>
            )}
            {opportunity.supervisor && (
              <Fact icon={<UserRound size={16} aria-hidden="true" />} label={localize("المشرف", "Supervisor")}>{opportunity.supervisor}</Fact>
            )}
            {dateText && (
              <Fact icon={<CalendarDays size={16} aria-hidden="true" />} label={localize("تاريخ الإضافة", "Date added")}>{dateText}</Fact>
            )}
            {hasSeats && (
              <Fact icon={<UsersRound size={16} aria-hidden="true" />} label={localize("المقاعد المتاحة", "Available seats")}>
                <span dir="ltr">{opportunity.seatsLeft} / {opportunity.totalSeats}</span>
                {(first !== undefined || co !== undefined) && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-bold text-slate-600">
                    {first !== undefined && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">{localize("الكاتب الأول", "First author")}: {first}</span>
                    )}
                    {co !== undefined && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">{localize("مؤلف مشارك", "Co-author")}: {co}</span>
                    )}
                  </div>
                )}
              </Fact>
            )}
          </div>
        </div>

        {benefits.length > 0 && (
          <div>
            <h2 className="flex items-center gap-2 text-sm font-black text-[#0c3156]">
              <ShieldCheck size={16} className="text-[#117b59]" aria-hidden="true" />
              {localize("ما ستحصل عليه", "What you receive")}
            </h2>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-bold leading-6 text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e9a020]" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasPrice && (
          <OpportunityPrice
            originalSar={original ?? discounted}
            discountedSar={discounted ?? original}
          />
        )}
      </div>
    </section>
  );
}
