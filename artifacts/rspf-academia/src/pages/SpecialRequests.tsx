import { useState } from "react";
import { FlaskConical, GraduationCap, FileText, Shield, Globe, Search, BarChart2, Wrench } from "lucide-react";
import ServiceModal from "@/components/ServiceModal";
import { useLanguage } from "@/lib/i18n";

const services = [
  { bg: "#0C3156", icon: <FlaskConical size={26} />, title: { ar: "إعداد الدراسة البحثية", en: "Research study preparation" }, desc: { ar: "تصميم وإعداد الدراسات البحثية الفردية وفق أعلى المعايير الأكاديمية الدولية", en: "Design and preparation of individual research studies to the highest international academic standards." } },
  { bg: "#0369A1", icon: <GraduationCap size={26} />, title: { ar: "رسائل الماجستير", en: "Master's theses" }, desc: { ar: "دعم شامل لرسائل الماجستير من اختيار الموضوع حتى النشر في مجلة محكمة", en: "Comprehensive master's thesis support, from topic selection to publication in a peer-reviewed journal." } },
  { bg: "#6D28D9", icon: <FileText size={26} />, title: { ar: "رسائل الدكتوراه", en: "Doctoral dissertations" }, desc: { ar: "دعم متكامل لرسائل الدكتوراه والبحوث الأكاديمية المتقدمة بأعلى مستوى من الجودة", en: "Integrated support for doctoral dissertations and advanced academic research at the highest quality level." } },
  { bg: "#B45309", icon: <Shield size={26} />, title: { ar: "التحكيم العلمي", en: "Scientific validation" }, desc: { ar: "خدمات التحكيم العلمي للأدوات البحثية والاستبيانات والمقاييس من متخصصين معتمدين", en: "Scientific validation services for research instruments, questionnaires, and scales by accredited specialists." } },
  { bg: "#9D174D", icon: <Globe size={26} />, title: { ar: "الترجمة الأكاديمية", en: "Academic translation" }, desc: { ar: "ترجمة أكاديمية وطبية متخصصة بين العربية والإنجليزية بأدق المصطلحات العلمية", en: "Specialized academic and medical translation between Arabic and English using precise scientific terminology." } },
  { bg: "#1E3A5F", icon: <Search size={26} />, title: { ar: "التدقيق والمراجعة", en: "Editing and review" }, desc: { ar: "تدقيق لغوي وعلمي احترافي للأبحاث والمقالات باللغتين العربية والإنجليزية", en: "Professional linguistic and scientific editing for research and articles in Arabic and English." } },
  { bg: "#065F46", icon: <BarChart2 size={26} />, title: { ar: "التحليل الإحصائي", en: "Statistical analysis" }, desc: { ar: "تحليل إحصائي متقدم باستخدام SPSS وR وغيرها من الأدوات المتخصصة", en: "Advanced statistical analysis using SPSS, R, and other specialist tools." } },
  { bg: "#374151", icon: <Wrench size={26} />, title: { ar: "خدمات أخرى", en: "Other services" }, desc: { ar: "خدمات أخرى غير مذكورة أعلاه. يرجى وصف احتياجك بالتفصيل وسنجد لك الحل", en: "Services not listed above. Please describe your needs in detail and we will find the right solution." } },
];

export default function SpecialRequests() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const { localize, t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-white py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#0C3156]/8 border border-[#0C3156]/15 text-[#0C3156] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            {t("nav.requests")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">{localize("بوابة الطلبات الخاصة", "Special Requests Portal")}</h1>
          <p className="text-slate-600 max-w-xl mx-auto">{localize("خدمات بحثية متخصصة ومتكاملة للباحثين وطلاب الدراسات العليا. اختر الخدمة المطلوبة للتواصل مع فريق الخبراء", "Specialized, integrated research services for researchers and postgraduate students. Select the service you need to contact our expert team.")}</p>
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {services.map((svc) => (
              <div key={svc.title.ar} className="rounded-2xl p-6 text-white hover:scale-[1.01] transition-transform shadow-sm" style={{ backgroundColor: svc.bg }} data-testid={`card-special-${svc.title.ar.substring(0,10)}`}>
                <div className="flex items-start gap-4 flex-row-reverse mb-5">
                  <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">{svc.icon}</div>
                  <div className="text-right flex-1">
                    <h3 className="text-lg font-bold leading-snug">{localize(svc.title.ar, svc.title.en)}</h3>
                    <p className="text-white/75 text-sm mt-1.5 leading-relaxed">{localize(svc.desc.ar, svc.desc.en)}</p>
                  </div>
                </div>
                <button
                  data-testid={`button-request-${svc.title.ar.substring(0,8)}`}
                  onClick={() => { setSelectedService(localize(svc.title.ar, svc.title.en)); setModalOpen(true); }}
                  className="w-full border border-white/30 text-white font-semibold py-2.5 rounded-xl hover:bg-white/15 transition-colors text-sm"
                >
                  {localize("اطلب هذه الخدمة ←", "Request this service →")}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-[#EFF6FF] border border-[#0C3156]/12 rounded-2xl p-7 text-center shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-2">{localize("هل تريد التواصل المباشر مع فريقنا؟", "Would you like to contact our team directly?")}</h3>
            <p className="text-slate-500 text-sm mb-5">{localize("فريق SRMA جاهز للإجابة على استفساراتك خلال ساعات", "The SRMA team is ready to answer your questions within hours.")}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="https://wa.me/966562159258" target="_blank" rel="noopener noreferrer" data-testid="button-special-whatsapp"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-[#1eb856] transition-colors shadow-md">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                {t("common.whatsapp")}
              </a>
              <a href="https://t.me/SRMAAcademy" target="_blank" rel="noopener noreferrer" data-testid="button-special-telegram"
                className="inline-flex items-center gap-2 bg-[#0C3156] text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-[#0a2847] transition-colors shadow-md">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      <ServiceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} serviceName={selectedService} />
    </div>
  );
}
