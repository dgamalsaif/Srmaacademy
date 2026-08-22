import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { ChevronLeft, Users, Clock, BookOpen, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";
import { ResearchOpportunity } from "@/lib/researchData";
import RegistrationModal from "@/components/RegistrationModal";
import { DEFAULT_SITE_CONTENT_SETTINGS, SiteContentSettings } from "@/lib/siteContentSettings";

const COMPLETED_STAGE_LABELS: Record<string, string> = {
  seats_full: "اكتملت المقاعد",
  submitted: "تم الرفع في المجلة",
  accepted: "مقبولة",
  published: "تم النشر",
};

export default function ResearchDetail() {
  const params = useParams<{ id: string }>();
  const [research, setResearch] = useState<ResearchOpportunity | null>(null);
  const [allResearch, setAllResearch] = useState<ResearchOpportunity[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [contentSettings, setContentSettings] = useState<SiteContentSettings>(DEFAULT_SITE_CONTENT_SETTINGS);

  useEffect(() => {
    fetch("/api/programs")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("programs unavailable")))
      .then((data: ResearchOpportunity[]) => {
        setAllResearch(data);
        setResearch(data.find((item) => item.id === parseInt(params.id || "0")) || null);
      })
      .catch(() => { setAllResearch([]); setResearch(null); });
    fetch("/api/site-content-settings")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((settings: SiteContentSettings) => setContentSettings(settings))
      .catch(() => setContentSettings(DEFAULT_SITE_CONTENT_SETTINGS));
  }, [params.id]);

  if (!research) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-slate-700 mb-3">الفرصة البحثية غير موجودة</h2>
          <Link href="/participant-portal" className="text-[#0C3156] font-semibold hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={16} /> العودة للفرص البحثية
          </Link>
        </div>
      </div>
    );
  }

  const seatsUsed = research.totalSeats - research.seatsLeft;
  const pct = research.totalSeats > 0 ? Math.round((seatsUsed / research.totalSeats) * 100) : 0;
  const isCompletedResearch = research.category === "completed";
  const completedStageLabel = COMPLETED_STAGE_LABELS[research.status] || "دراسة منجزة";

  return (
    <div className="min-h-screen bg-white">
      {/* BREADCRUMB */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-slate-500 flex-row-reverse">
          <span className="text-slate-400">›</span>
          <Link href="/participant-portal" className="hover:text-[#0C3156] transition-colors">بوابة المشارك</Link>
          <span className="text-slate-400">›</span>
          <Link href="/" className="hover:text-[#0C3156] transition-colors">الرئيسية</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#0C3156] to-[#1A5FAE] rounded-2xl p-7 text-white text-right">
              <div className="flex items-center gap-3 flex-row-reverse mb-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white`}>
                  {research.specialty}
                </span>
                {isCompletedResearch ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-400 text-[#0C3156]">
                    {completedStageLabel}
                  </span>
                ) : research.status === "open" && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E9A020] text-white">
                    مفتوح للتسجيل ✓
                  </span>
                )}
                {research.status === "closed" && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500 text-white">
                    مغلق 🔒
                  </span>
                )}
                {research.status === "draft" && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-400 text-white">
                    مسودة
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black leading-snug mb-2 whitespace-pre-line">{contentSettings.participantTitleLanguage === "arabic" ? (research.titleAr || research.title) : contentSettings.participantTitleLanguage === "both" ? `${research.titleAr || research.title}\n${research.titleEn || research.title}` : (research.titleEn || research.title)}</h1>
              <p className="text-blue-200 text-sm">تاريخ الإضافة: {research.createdAt}</p>
            </div>

            {/* Description */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-right shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2 flex-row-reverse">
                <BookOpen size={20} className="text-[#0C3156]" />
                وصف الدراسة
              </h2>
              <p className="text-slate-600 leading-relaxed">{research.description}</p>
            </div>

            {/* Benefits */}
            <div className="bg-[#EFF6FF] border border-[#0C3156]/12 rounded-2xl p-6 text-right shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-4">{isCompletedResearch ? "تفاصيل ومخرجات الدراسة" : "مزايا وقيمة المشاركة 💡"}</h2>
              <ul className="space-y-3">
                {research.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 flex-row-reverse">
                    <CheckCircle2 size={18} className="text-[#0C3156] flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Indexed in */}
            {research.indexedIn.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-right shadow-sm">
                <h2 className="text-lg font-black text-slate-900 mb-4">مفهرسة في</h2>
                <div className="flex flex-wrap gap-2 flex-row-reverse">
                  {research.indexedIn.map((db) => (
                    <span key={db} className="bg-[#0C3156] text-white text-sm font-bold px-4 py-1.5 rounded-full">{db}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-5">
            <div className="bg-white border-2 border-[#0C3156]/15 rounded-2xl p-6 text-right shadow-md sticky top-20">
              <h3 className="text-lg font-black text-slate-900 mb-4">{isCompletedResearch ? "تفاصيل الدراسة" : "تفاصيل الفرصة"}</h3>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between flex-row-reverse py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Users size={14} />
                    المقاعد المتاحة
                  </span>
                  <span className="font-bold text-slate-900">
                    {research.seatsLeft} / {research.totalSeats}
                  </span>
                </div>
                <div className="flex items-center justify-between flex-row-reverse py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Clock size={14} />
                    مدة الدراسة
                  </span>
                  <span className="font-bold text-slate-900">{research.duration}</span>
                </div>
                <div className="py-2 border-b border-slate-100 text-right">
                  <span className="text-sm text-slate-500 block mb-1">{isCompletedResearch ? "المجلة أو جهة النشر" : "المجلة المستهدفة"}</span>
                  <span className="font-semibold text-slate-800 text-sm">{research.journalTarget || "—"}</span>
                </div>
                <div className="py-2 text-right">
                  <span className="text-sm text-slate-500 block mb-1">المشرف</span>
                  <span className="font-semibold text-[#0C3156] text-sm">{research.supervisor || "—"}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-slate-500 mb-2 flex-row-reverse">
                  <span>تبقى {research.seatsLeft} من أصل {research.totalSeats}</span>
                  <span>{pct}% ممتلئ</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-l from-[#0C3156] to-[#1A5FAE] rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {research.status === "open" ? (
                <button
                  data-testid="button-detail-register"
                  onClick={() => setModalOpen(true)}
                  className="w-full bg-[#0C3156] text-white font-bold py-3.5 rounded-xl hover:bg-[#0a2847] transition-colors text-base shadow-sm mb-3"
                >
                  سجل الآن 👤
                </button>
              ) : (
                <div className="w-full bg-slate-100 text-slate-500 font-bold py-3.5 rounded-xl text-center text-base mb-3">
                  🔒 مغلق التسجيل
                </div>
              )}

              <a
                href="https://wa.me/966562159258"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-detail-whatsapp"
                className="w-full border border-[#0C3156]/25 text-[#0C3156] font-semibold py-2.5 rounded-xl text-sm text-center hover:bg-[#0C3156]/5 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} />
                تواصل لمعرفة السعر
              </a>
            </div>
          </div>
        </div>

        {/* RELATED */}
        {allResearch.filter((r) => r.id !== research.id && r.status === "open").length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-black text-slate-900 text-right mb-5">فرص بحثية أخرى</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allResearch.filter((r) => r.id !== research.id && r.status === "open").slice(0, 3).map((r) => (
                <Link key={r.id} href={`/research/${r.id}`} data-testid={`card-related-${r.id}`}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow hover:border-[#0C3156]/25 block">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block mb-3 ${r.specialtyColor}`}>
                    {r.specialty}
                  </span>
                  <p className="font-semibold text-slate-800 text-sm line-clamp-2 text-right mb-3">{r.title}</p>
                  <div className="flex items-center justify-between flex-row-reverse text-xs text-slate-500">
                    <span>{r.seatsLeft} مقعد متبقي</span>
                    <span className="text-[#0C3156] font-semibold flex items-center gap-1">
                      عرض التفاصيل <ChevronLeft size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <RegistrationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} researchTitle={research.titleAr || research.title} researchId={research.id} />
    </div>
  );
}
