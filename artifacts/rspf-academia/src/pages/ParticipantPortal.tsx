import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Lock, Flame, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { ResearchOpportunity } from "@/lib/researchData";
import RegistrationModal from "@/components/RegistrationModal";
import { DEFAULT_SITE_CONTENT_SETTINGS, SiteContentSettings } from "@/lib/siteContentSettings";

const hallOfFame = [
  { specialty: "ENT – Head and Neck Surgery", specialtyColor: "bg-indigo-100 text-indigo-700", title: "Efficacy of Biologic Therapy versus Conventional Treatment in Chronic Rhinosinusitis" },
  { specialty: "Obesity Surgery", specialtyColor: "bg-yellow-100 text-yellow-700", title: "Endoscopic Versus Surgical Bariatric Procedures: Long-term Outcomes Comparison" },
  { specialty: "Anesthesiology", specialtyColor: "bg-emerald-100 text-emerald-700", title: "Comparative Effectiveness of Regional vs. General Anesthesia in Major Orthopedic Procedures" },
  { specialty: "Clinical Cardiology", specialtyColor: "bg-red-100 text-red-700", title: "Comparative Efficacy and Safety of Patiromer vs. Sodium Zirconium Cyclosilicate" },
];

export default function ParticipantPortal() {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState<ResearchOpportunity | null>(null);
  const [opportunities, setOpportunities] = useState<ResearchOpportunity[]>([]);
  const [contentSettings, setContentSettings] = useState<SiteContentSettings>(DEFAULT_SITE_CONTENT_SETTINGS);

  useEffect(() => {
    fetch("/api/programs")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("programs unavailable")))
      .then((data: ResearchOpportunity[]) => {
        const available = data.filter((item) => item.status === "open" && (item.category || "active") === "active");
        setOpportunities(available);
      })
      .catch(() => setOpportunities([]));
    fetch("/api/site-content-settings")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((settings: SiteContentSettings) => setContentSettings(settings))
      .catch(() => setContentSettings(DEFAULT_SITE_CONTENT_SETTINGS));
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedCards((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const openModal = (research: ResearchOpportunity) => { setSelectedResearch(research); setModalOpen(true); };
  const displayTitle = (research: ResearchOpportunity) => {
    if (contentSettings.participantTitleLanguage === "arabic") return research.titleAr || research.title;
    if (contentSettings.participantTitleLanguage === "both") return `${research.titleAr || research.title}\n${research.titleEn || research.title}`;
    return research.titleEn || research.title;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <section className="py-14 px-4 text-center" style={{ background: `linear-gradient(135deg, ${contentSettings.primaryColor}10, ${contentSettings.accentColor}08, white)` }}>
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold" style={{ color: contentSettings.primaryColor, backgroundColor: `${contentSettings.primaryColor}0d`, borderColor: `${contentSettings.primaryColor}26` }}>
            {contentSettings.participantTitle}
          </div>
          <h1 className="mb-3 text-3xl font-black text-slate-900 sm:text-4xl">{contentSettings.participantTitle}</h1>
          <p className="mx-auto max-w-xl text-slate-600">{contentSettings.participantDescription}</p>
        </div>
      </section>

      {/* TABS */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-16 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto">
          {[
            { label: "الفرص البحثية الجاهزة للنشر", activeClass: "bg-[#0C3156] text-white" },
            { label: "برنامج تدريب باحث مع النشر", activeClass: "bg-[#0369A1] text-white" },
            { label: "دورات طبية بساعات CME معتمدة", activeClass: "bg-violet-600 text-white" },
          ].map((tab, i) => (
            <button key={i} data-testid={`button-tab-${i}`} onClick={() => setActiveTab(i)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                activeTab === i ? tab.activeClass : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TICKER */}
      <div className="py-2.5 text-white overflow-hidden" style={{ backgroundColor: contentSettings.primaryColor }}>
        <div className="animate-marquee">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="inline-block mx-10 text-sm font-medium whitespace-nowrap">
              ⚡ انضم لأكثر من 500 طبيب وباحث حققوا متطلبات الهيئة السعودية للتخصصات الصحية مع SRMA &nbsp;|&nbsp; سجل الآن وابدأ رحلتك البحثية اليوم
            </span>
          ))}
        </div>
      </div>

      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {activeTab === 0 && (
            <>
              <div className="flex items-center justify-between mb-6 flex-row-reverse">
                <h2 className="text-xl font-black text-slate-900">✨ الفرص البحثية المتاحة للتسجيل</h2>
                <span className="bg-[#0C3156]/8 text-[#0C3156] text-xs font-bold px-3 py-1.5 rounded-full border border-[#0C3156]/12">
                  {opportunities.length} فرصة متاحة
                </span>
              </div>
              {opportunities.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <div className="text-5xl mb-4">🔬</div>
                  <p className="font-medium">لا توجد فرص متاحة حالياً</p>
                  <p className="text-sm mt-1">تابع قناتنا على Telegram للإشعارات الفورية</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {opportunities.map((opp) => {
                    const isExpanded = expandedCards.includes(opp.id);
                    const seatsUsed = opp.totalSeats - opp.seatsLeft;
                    const pct = Math.round((seatsUsed / opp.totalSeats) * 100);
                    return (
                      <div key={opp.id} className="rounded-2xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md" style={{ backgroundColor: contentSettings.cardBackgroundColor }} data-testid={`card-research-${opp.id}`}>
                        <div className="flex items-center justify-between gap-3 mb-3 flex-row-reverse">
                          {contentSettings.visibleParticipantCardParts.includes("specialty") && <span className={`text-xs font-bold px-3 py-1 rounded-full ${opp.specialtyColor}`}>{opp.specialtyAr || opp.specialty}</span>}
                          <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                            <Flame size={11} /> متبقية مقاعد محدودة
                          </span>
                        </div>

                        <Link href={`/research/${opp.id}`} data-testid={`link-research-title-${opp.id}`}>
                          <h3 className="mb-2 cursor-pointer text-right font-bold leading-snug text-slate-900 transition-colors" style={{ color: contentSettings.primaryColor }}>
                            {displayTitle(opp)}
                          </h3>
                        </Link>

                        <p className="text-[#0C3156] text-sm italic text-right mb-3 font-medium">
                          🏆 نحن في SRMA – نبني ملفك البحثي ونصنع الفارق
                        </p>
                        <div className="mb-4 space-y-2 text-right text-sm leading-6 text-slate-600">
                          {contentSettings.participantCardOrder.filter((part) => contentSettings.visibleParticipantCardParts.includes(part) && !["specialty", "seats", "benefits"].includes(part)).map((part) => {
                            if (part === "description") return <p key={part}>{opp.descriptionAr || opp.description}</p>;
                            if (part === "duration" && opp.duration) return <p key={part}><strong>المدة:</strong> {opp.duration}</p>;
                            if (part === "supervisor" && opp.supervisor) return <p key={part}><strong>المشرف:</strong> {opp.supervisor}</p>;
                            if (part === "journal" && opp.journalTarget) return <div key={part} className="space-y-1"><p><strong>المجلة المستهدفة:</strong> {opp.journalTarget}</p>{opp.journalIssn && <p className="text-xs"><strong>ISSN:</strong> {opp.journalIssn}</p>}</div>;
                            return null;
                          })}
                        </div>

                        <a href="https://wa.me/966562159258" target="_blank" rel="noopener noreferrer"
                          data-testid={`link-price-${opp.id}`}
                          className="text-[#0C3156] text-sm underline text-right block mb-3 font-semibold">
                          تواصل لمعرفة السعر
                        </a>

                        {contentSettings.visibleParticipantCardParts.includes("seats") && <><div className="mb-1">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(to left, ${contentSettings.primaryColor}, ${contentSettings.accentColor})` }} />
                          </div>
                        </div>
                        <p className="mb-4 text-right text-xs text-slate-500">تبقى <span className="font-bold" style={{ color: contentSettings.primaryColor }}>{opp.seatsLeft} مقاعد</span> فقط من أصل {opp.totalSeats}</p></>}

                        {contentSettings.visibleParticipantCardParts.includes("benefits") && <><button data-testid={`button-expand-benefits-${opp.id}`} onClick={() => toggleExpand(opp.id)}
                          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0C3156] mb-3 flex-row-reverse w-full justify-end">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          مزايا وقيمة المشاركة 💡
                        </button>
                        {isExpanded && opp.benefits.length > 0 && (
                          <ul className="space-y-1.5 mb-4 bg-[#EFF6FF] rounded-xl p-4">
                            {opp.benefits.map((b) => (
                              <li key={b} className="flex items-center gap-2 flex-row-reverse text-sm text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0C3156] flex-shrink-0" />
                                {b}
                              </li>
                            ))}
                          </ul>
                        )}</>}

                        <div className="flex gap-3">
                          <button data-testid={`button-register-${opp.id}`} onClick={() => openModal(opp)}
                            className="flex-1 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-sm" style={{ backgroundColor: contentSettings.primaryColor }}>
                            سجل الآن 👤
                          </button>
                          <Link href={`/research/${opp.id}`} data-testid={`button-detail-${opp.id}`}
                            className="flex items-center gap-1 border font-semibold px-4 py-3 rounded-xl transition-colors text-sm" style={{ borderColor: `${contentSettings.primaryColor}40`, color: contentSettings.primaryColor }}>
                            التفاصيل <ChevronLeft size={14} />
                          </Link>
                        </div>
                        <button data-testid={`button-copy-link-${opp.id}`}
                          className="w-full text-xs text-slate-400 hover:text-slate-600 py-2 mt-1"
                          onClick={() => { navigator.clipboard.writeText(window.location.origin + `/research/${opp.id}`); alert("تم نسخ الرابط"); }}>
                          نسخ رابط الفرصة 🔗
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 1 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-5">📚</div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">برنامج تدريب باحث مع النشر</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                برنامج تدريبي متكامل يأخذك من الصفر إلى النشر الدولي. تدريب عملي مع إشراف متخصص وفرصة نشر حقيقية في نهاية البرنامج.
              </p>
              <a href="https://wa.me/966562159258" target="_blank" rel="noopener noreferrer" data-testid="button-trainer-whatsapp"
                className="inline-flex items-center gap-2 bg-[#0369A1] text-white px-7 py-3.5 rounded-full font-bold hover:bg-[#025b88] transition-colors shadow-md">
                تواصل معنا للتسجيل ←
              </a>
            </div>
          )}

          {activeTab === 2 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-5">🎓</div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">دورات طبية بساعات CME معتمدة</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                دورات طبية معتمدة من الهيئة السعودية للتخصصات الصحية. احصل على نقاطك CME مع شهادة رسمية معتمدة.
              </p>
              <a href="https://wa.me/966562159258" target="_blank" rel="noopener noreferrer" data-testid="button-cme-whatsapp"
                className="inline-flex items-center gap-2 bg-violet-600 text-white px-7 py-3.5 rounded-full font-bold hover:bg-violet-700 transition-colors shadow-md">
                تواصل معنا للتسجيل ←
              </a>
            </div>
          )}
        </div>
      </section>

      {/* HALL OF FAME */}
      <section className="py-12 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-right mb-6">
            <h2 className="text-2xl font-black text-slate-900">مشاريع اكتمل فريقها (لوحة الشرف) 🏆</h2>
            <p className="text-slate-500 text-sm mt-1">أبحاث سابقة تم إغلاق التسجيل فيها بنجاح</p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {hallOfFame.map((item, i) => (
              <div key={i} className="flex-shrink-0 w-72 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm" data-testid={`card-hall-${i}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    <Lock size={10} /> اكتمل الفريق
                  </span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.specialtyColor} inline-block mb-2`}>{item.specialty}</span>
                <p className="text-sm font-semibold text-slate-700 line-clamp-3">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RegistrationModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelectedResearch(null); }} researchTitle={selectedResearch?.titleAr || selectedResearch?.title || ""} researchId={selectedResearch?.id} />
    </div>
  );
}
