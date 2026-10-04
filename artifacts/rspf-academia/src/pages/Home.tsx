import { isFieldVisible } from "@/lib/opportunityVisibility";
import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  BarChart2,
  BookOpen,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Lock,
  MessageCircle,
  RefreshCw,
  Shield,
  Star,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useSiteContentSettings } from "@/hooks/use-site-content-settings";
import { getEnglishOpportunityTitle } from "@/lib/opportunityDisplay";
import { DEFAULT_SITE_CONTENT_SETTINGS, getContactUsHref } from "@/lib/siteContentSettings";
import { ResearchOpportunity } from "@/lib/researchData";
import RegistrationModal from "@/components/RegistrationModal";
import SiteAnnouncement from "@/components/SiteAnnouncement";
import ServiceModal from "@/components/ServiceModal";
import OpportunityPrice from "@/components/OpportunityPrice";
import { ProtectedResearchWatermark, AntiCaptureResearchTitle } from "@/components/ResearchProtection";

const SERVICES = [
  {
    key: "study",
    icon: FileText,
    value: "إعداد الدراسة البحثية",
    ar: "إعداد الدراسة البحثية",
    en: "Research study preparation",
    descAr: "من صياغة السؤال البحثي وكتابة البروتوكول حتى جاهزية المخطوطة للإرسال.",
    descEn: "From framing the research question and protocol to a manuscript ready for submission.",
  },
  {
    key: "stats",
    icon: BarChart2,
    value: "التحليل الإحصائي",
    ar: "التحليل الإحصائي",
    en: "Statistical analysis",
    descAr: "تحليل بيانات الأبحاث الطبية مع جداول ورسوم جاهزة للنشر وتقرير تفسيري.",
    descEn: "Medical data analysis with publication-ready tables, figures and an interpretive report.",
  },
  {
    key: "edit",
    icon: Globe,
    value: "التدقيق والمراجعة",
    ar: "التدقيق والمراجعة اللغوية",
    en: "Editing and proofreading",
    descAr: "تدقيق لغوي وطبي للمخطوطات قبل إرسالها إلى المجلات.",
    descEn: "Language and medical editing of manuscripts before journal submission.",
  },
  {
    key: "review",
    icon: Shield,
    value: "التحكيم العلمي",
    ar: "التحكيم العلمي",
    en: "Scientific peer review",
    descAr: "تحكيم الأدوات البحثية والاستبانات ودعم ملفات لجان أخلاقيات البحث.",
    descEn: "Validation of research instruments and questionnaires, with support for ethics committee files.",
  },
  {
    key: "theses",
    icon: GraduationCap,
    value: "رسائل الماجستير",
    ar: "رسائل الماجستير والدكتوراه",
    en: "Master's and doctoral theses",
    descAr: "دعم أكاديمي لرسائل الدراسات العليا في كل مراحلها.",
    descEn: "Academic support for postgraduate theses at every stage.",
  },
  {
    key: "other",
    icon: Star,
    value: "خدمات أخرى",
    ar: "طلب خدمة أخرى",
    en: "Other services",
    descAr: "لديك احتياج بحثي مختلف؟ أرسل طلبك وسنراجعه معك.",
    descEn: "A different research need? Send your request and we will review it with you.",
  },
];

type LoadState = "loading" | "error" | "ready";

export default function Home() {
  const { direction, language, localize } = useLanguage();
  const { data: settings } = useSiteContentSettings();
  const siteBrand = settings?.brand || DEFAULT_SITE_CONTENT_SETTINGS.brand;
  const contact = getContactUsHref(siteBrand);
  const contactLabel = language === "ar" ? contact.labelAr : contact.labelEn;
  const isRtl = direction === "rtl";
  const showDetails = settings?.showOpportunityDetails !== false;

  const homeSettings = settings?.pages?.home;
  const rawTitle = (language === "ar" ? homeSettings?.titleAr : homeSettings?.titleEn)?.trim();
  const rawDesc = (language === "ar" ? homeSettings?.descriptionAr : homeSettings?.descriptionEn)?.trim();
  const customNotice = (language === "ar" ? homeSettings?.contentAr : homeSettings?.contentEn)?.trim();

  const heroTitle =
    rawTitle ||
    localize("فرص بحثية حقيقية للأطباء، من التسجيل حتى النشر", "Real research opportunities for physicians, from registration to publication");
  const heroDesc =
    rawDesc ||
    localize(
      "تصفح الدراسات المفتوحة حالياً، اختر تخصصك، وسجل مقعدك مباشرة. يتواصل معك منسق البرنامج لتأكيد المقعد.",
      "Browse the studies open now, pick your specialty and reserve a seat. A program coordinator will contact you to confirm."
    );

  const [opportunities, setOpportunities] = useState<ResearchOpportunity[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [selectedOpportunity, setSelectedOpportunity] = useState<ResearchOpportunity | null>(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedServiceName, setSelectedServiceName] = useState("إعداد الدراسة البحثية");

  const loadOpportunities = useCallback(() => {
    setLoadState("loading");
    apiFetch("/api/programs", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("programs unavailable"))))
      .then((data: ResearchOpportunity[]) => {
        const list = Array.isArray(data) ? data : [];
        setOpportunities(list.filter((item) => item.status === "open" && (item.category || "active") === "active"));
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  const preview = opportunities.slice(0, 6);
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const openRegistration = (op: ResearchOpportunity) => {
    setSelectedOpportunity(op);
    setRegistrationModalOpen(true);
  };
  const openService = (name: string) => {
    setSelectedServiceName(name);
    setServiceModalOpen(true);
  };

  return (
    <div className="min-h-[100dvh] bg-[#f7f9fb] text-slate-900 w-full max-w-full overflow-x-clip" dir={direction}>
      {/* HERO */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-[#f1f6f4] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl text-center srma-reveal">
          <h1 className="text-3xl font-black leading-[1.3] tracking-tight text-[#0C3156] sm:text-4xl lg:text-5xl">
            {heroTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{heroDesc}</p>

          {customNotice && (
            <div
              data-testid="home-admin-notice"
              className="mx-auto mt-6 max-w-2xl text-start"
            >
              <SiteAnnouncement content={customNotice} />
            </div>
          )}

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/participant-portal"
              data-testid="button-hero-explore-programs"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0C3156] px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-[#0a2847]"
            >
              <span>{localize("استعرض الفرص البحثية", "Browse research opportunities")}</span>
              <Arrow size={18} />
            </Link>
            <a
              href={contact.href}
              target={contact.isExternal ? "_blank" : undefined}
              rel={contact.isExternal ? "noopener noreferrer" : undefined}
              data-testid="button-hero-contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-bold text-[#0C3156] transition-colors hover:border-[#117b59] hover:text-[#117b59]"
            >
              <MessageCircle size={18} />
              <span>{contactLabel}</span>
            </a>
          </div>
        </div>
      </section>

      {/* LIVE OPPORTUNITIES */}
      <section className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8" aria-labelledby="home-opps-title">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="home-opps-title" className="text-2xl font-black text-[#0C3156] sm:text-3xl">
                {localize("الفرص المفتوحة الآن", "Open opportunities")}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {localize("تصفح الفرص المسجلة لدى الأكاديمية واختر الدراسة المناسبة لك.", "Browse academy opportunities and choose the right study for you.")}
              </p>
            </div>
            <Link
              href="/participant-portal"
              data-testid="link-view-all-portal"
              className="inline-flex items-center gap-2 self-start text-sm font-bold text-[#117b59] hover:underline sm:self-auto"
            >
              <span>{localize("عرض الكل في بوابة المشارك", "View all in the participant portal")}</span>
              <Arrow size={16} />
            </Link>
          </div>

          {loadState === "loading" && (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" data-testid="home-opps-loading">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white motion-reduce:animate-none" />
              ))}
            </div>
          )}

          {loadState === "error" && (
            <div role="alert" data-testid="home-opps-error" className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="font-bold text-slate-800">{localize("تعذر تحميل الفرص البحثية حالياً.", "We could not load research opportunities.")}</p>
              <p className="mt-1 text-sm text-slate-500">{localize("تحقق من الاتصال ثم أعد المحاولة.", "Check your connection and try again.")}</p>
              <button
                type="button"
                onClick={loadOpportunities}
                data-testid="button-home-retry"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0C3156] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a2847]"
              >
                <RefreshCw size={15} />
                {localize("إعادة المحاولة", "Retry")}
              </button>
            </div>
          )}

          {loadState === "ready" && preview.length === 0 && (
            <div data-testid="home-opps-empty" className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="font-bold text-slate-800">{localize("لا توجد فرص مفتوحة للتسجيل حالياً.", "No opportunities are open for registration right now.")}</p>
              <p className="mt-1 text-sm text-slate-500">{localize("تواصل معنا لنخبرك عند فتح دراسة جديدة.", "Contact us and we will tell you when a new study opens.")}</p>
            </div>
          )}

          {loadState === "ready" && preview.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {preview.map((op) => {
                const title = getEnglishOpportunityTitle(op);
                const spec = (language === "ar" ? op.specialtyAr : op.specialtyEn) || op.specialty;
                const desc = (language === "ar" ? op.descriptionAr : op.descriptionEn) || op.description;
                return (
                  <article
                    key={op.id}
                    data-protected="research"
                    data-testid={`card-opportunity-${op.id}`}
                    className="protected-research-content research-card relative flex select-none flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
                    style={{ userSelect: "none", WebkitUserSelect: "none" }}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  >
                    <ProtectedResearchWatermark />
                    <div className="relative z-10 flex-1">
                      {showDetails && (
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          {spec && isFieldVisible(op, "specialty") && <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">{spec}</span>}
                          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            <Lock size={10} />
                            {localize("محمي", "Protected")}
                          </span>
                        </div>
                      )}
                      <AntiCaptureResearchTitle title={title} titleHref={`/research/${op.id}`} />
                      {showDetails && (
                        <>
                          {desc && isFieldVisible(op, "description") && <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{desc}</p>}
                          <div className="mb-3 space-y-1 text-xs text-slate-500">
                            {op.journalTarget && isFieldVisible(op, "journal") && (
                              <p className="flex items-start gap-1.5">
                                <BookOpen size={13} className="mt-0.5 shrink-0 text-[#0C3156]" />
                                <span className="font-semibold text-slate-700">{op.journalTarget}</span>
                              </p>
                            )}
                            {op.duration && isFieldVisible(op, "duration") && (
                              <p>
                                <span>{localize("المدة:", "Duration:")}</span> <span className="font-semibold text-slate-700">{op.duration}</span>
                              </p>
                            )}
                            {isFieldVisible(op, "seats") && typeof op.seatsLeft === "number" && typeof op.totalSeats === "number" && (
                              <p>
                                {localize(`المقاعد المتبقية ${op.seatsLeft} من ${op.totalSeats}`, `${op.seatsLeft} of ${op.totalSeats} seats left`)}
                              </p>
                            )}
                          </div>
                          {isFieldVisible(op, "price") && <OpportunityPrice originalSar={op.priceOriginalSar} discountedSar={op.priceDiscountedSar} compact />}
                        </>
                      )}
                    </div>
                    <div className="relative z-10 mt-4 flex gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => openRegistration(op)}
                        data-testid={`button-register-opportunity-${op.id}`}
                        className="flex-1 rounded-xl bg-[#0C3156] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0a2847]"
                      >
                        {localize("سجل الآن", "Register now")}
                      </button>
                      {showDetails && (
                        <Link
                          href={`/research/${op.id}`}
                          data-testid={`link-detail-opportunity-${op.id}`}
                          className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <span>{localize("التفاصيل", "Details")}</span>
                          <ExternalLink size={12} />
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SERVICES */}
      <section className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 sm:py-14 lg:px-8" aria-labelledby="home-services-title">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 max-w-2xl">
            <h2 id="home-services-title" className="text-2xl font-black text-[#0C3156] sm:text-3xl">
              {localize("خدمات بحثية عند الطلب", "Research services on request")}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {localize("اختر الخدمة وأرسل طلبك، ونعود إليك بالتفاصيل.", "Choose a service and send your request. We will get back to you with details.")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex flex-col rounded-2xl border border-slate-200 bg-[#f7f9fb] p-5">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#117b59]/10 text-[#117b59]">
                    <Icon size={20} />
                  </span>
                  <h3 className="text-base font-black text-slate-900">{localize(s.ar, s.en)}</h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">{localize(s.descAr, s.descEn)}</p>
                  <button
                    type="button"
                    onClick={() => openService(s.value)}
                    data-testid={`button-service-${s.key}`}
                    className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-bold text-[#0C3156] hover:text-[#117b59]"
                  >
                    <span>{localize("اطلب الخدمة", "Request this service")}</span>
                    <Arrow size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* KNOWLEDGE + CONTACT */}
      <section className="bg-[#0C3156] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-xl font-black sm:text-2xl">{localize("مركز المعرفة", "Knowledge Center")}</h2>
            <p className="mt-1 text-sm leading-relaxed text-blue-100">
              {localize(
                "مقالات وأدلة عن منهجية البحث والنشر ومتطلبات الترقية. تجد إجابات أسئلتك الشائعة في صفحة الأسئلة الشائعة.",
                "Articles and guides on research methods, publishing and career requirements. Common questions are answered on the FAQ page."
              )}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/knowledge-center"
              data-testid="link-home-knowledge"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0C3156] transition-colors hover:bg-emerald-50"
            >
              <BookOpen size={16} />
              {localize("تصفح مركز المعرفة", "Open the Knowledge Center")}
            </Link>
            <Link
              href="/faq"
              data-testid="link-home-faq"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              {localize("الأسئلة الشائعة", "FAQ")}
            </Link>
          </div>
        </div>
      </section>

      {selectedOpportunity && (
        <RegistrationModal
          isOpen={registrationModalOpen}
          onClose={() => setRegistrationModalOpen(false)}
          researchTitle={getEnglishOpportunityTitle(selectedOpportunity)}
          researchId={selectedOpportunity.id}
          firstAuthorSeatsLeft={selectedOpportunity.firstAuthorSeatsLeft}
          coAuthorSeatsLeft={selectedOpportunity.coAuthorSeatsLeft}
          priceOriginalSar={selectedOpportunity.priceOriginalSar}
          priceDiscountedSar={selectedOpportunity.priceDiscountedSar}
          onRegistered={loadOpportunities}
        />
      )}

      <ServiceModal isOpen={serviceModalOpen} onClose={() => setServiceModalOpen(false)} serviceName={selectedServiceName} />
    </div>
  );
}
