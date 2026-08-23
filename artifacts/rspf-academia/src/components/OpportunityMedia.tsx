import { BookOpen, Clock3, UsersRound } from "lucide-react";
import { ResearchOpportunity } from "@/lib/researchData";
import { RESEARCH_STATUS_LABELS } from "@/lib/opportunityPricing";

export default function OpportunityMedia({ research, className = "h-56" }: { research: ResearchOpportunity; className?: string }) {
  const classification = research.journalScopus || research.journalWos || research.journalPubmed || research.indexedIn?.[0];
  const status = RESEARCH_STATUS_LABELS[research.status] || research.status;

  return (
    <div className={`srma-protected-image relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0c3156] via-[#15578d] to-[#117b59] shadow-sm ${className}`} onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
      {research.imageUrl ? (
        <img src={research.imageUrl} alt={`صورة ${research.titleAr || research.title}`} draggable={false} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-white/70"><BookOpen size={44} /></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#061b31]/85 via-[#061b31]/10 to-[#061b31]/45" />
      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2" dir="rtl">
        <span className="rounded-full border border-white/20 bg-[#117b59]/90 px-3 py-1 text-[11px] font-black text-white shadow-sm backdrop-blur">{status}</span>
        <span className="max-w-[55%] truncate rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">{research.specialtyAr || research.specialty}</span>
      </div>
      <div className="absolute inset-x-3 bottom-3 space-y-2 text-right text-white" dir="rtl">
        {research.journalTarget && <p className="truncate text-sm font-black drop-shadow">{research.journalTarget}</p>}
        <div className="flex flex-wrap justify-end gap-1.5">
          {classification && <span className="rounded-full bg-white/18 px-2.5 py-1 text-[10px] font-bold backdrop-blur">الفهرسة: {classification}</span>}
          {research.duration && <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-[10px] font-bold backdrop-blur"><Clock3 size={11} /> {research.duration}</span>}
          <span className="inline-flex items-center gap-1 rounded-full bg-[#e9a020]/95 px-2.5 py-1 text-[10px] font-black text-[#0c3156]"><UsersRound size={11} /> {research.seatsLeft} من {research.totalSeats} متاحة</span>
        </div>
      </div>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-black tracking-[0.35em] text-white/45 drop-shadow">SRMA</span>
    </div>
  );
}