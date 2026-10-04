import { Megaphone } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function SiteAnnouncement({ content }: { content?: string }) {
  const { localize } = useLanguage();
  if (!content?.trim()) return null;
  return (
    <aside className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5" data-testid="site-announcement">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-900">
        <Megaphone size={17} aria-hidden="true" />
        {localize("إعلان من الأكاديمية", "Academy announcement")}
      </h2>
      <p className="whitespace-pre-line break-words text-sm leading-7 text-slate-700">{content}</p>
    </aside>
  );
}