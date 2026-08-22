import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  { q: "ما هي SRMA Research Academy ومن المستهدف من الخدمة؟", a: "SRMA Research Academy هي أكاديمية متخصصة في دعم الأطباء والباحثين الصحيين في رحلتهم البحثية. نستهدف أطباء البورد، المقيمين، الاستشاريين، وطلاب الدراسات العليا في المملكة العربية السعودية ودول الخليج." },
  { q: "كيف يمكنني التسجيل في فرصة بحثية؟", a: "ادخل إلى بوابة المشارك، اختر الفرصة البحثية المناسبة لتخصصك، ثم اضغط على زر 'سجل الآن' وأكمل بيانات التسجيل. سيتواصل معك فريق SRMA خلال 24-48 ساعة لتأكيد التسجيل." },
  { q: "ما الفرق بين الفرص البحثية وبرنامج تدريب الباحث؟", a: "الفرص البحثية: تنضم فيها إلى بحث قائم بالفعل كمؤلف مشارك مع إشراف كامل. برنامج تدريب الباحث: برنامج تدريبي متكامل يعلمك مهارات البحث العلمي من الصفر مع فرصة نشر حقيقية في نهاية البرنامج." },
  { q: "هل الأبحاث مفهرسة في PubMed وScopus؟", a: "نعم، جميع أبحاثنا تنشر في مجلات مفهرسة في قواعد البيانات الدولية المعتمدة مثل PubMed وScopus وWeb of Science وPMC. نختار المجلات بعناية لضمان أعلى جودة أكاديمية وأوسع انتشار علمي." },
  { q: "كم تستغرق عملية النشر؟", a: "تتفاوت مدة النشر بين 6 و18 شهراً حسب المجلة والبحث. عادةً تستغرق مرحلة إعداد البحث 3-6 أشهر، ثم مرحلة مراجعة المجلة والنشر من 3 إلى 12 شهراً." },
  { q: "هل أحتاج خبرة سابقة في البحث العلمي؟", a: "لا، لا تحتاج إلى أي خبرة سابقة. فريق SRMA يشرف على كل خطوة بدءاً من اختيار الموضوع وحتى النشر النهائي. كل ما نحتاجه منك هو الالتزام وحضور اجتماعات الفريق." },
  { q: "ما هي نقاط SCFHS وكيف تساعدني SRMA في الحصول عليها؟", a: "نقاط SCFHS هي نقاط التعليم الطبي المستمر المطلوبة لتجديد الترخيص المهني والتقدم للبورد السعودي. SRMA تمنحك 5 نقاط SCFHS عند إتمام المشاركة في بحث ونشره." },
  { q: "هل تقدمون خدمات لطلاب الطب؟", a: "نعم، لدينا باقة خاصة للمجالس الطلابية والأندية الأكاديمية تشمل خصماً خاصاً وإمكانية المشاركة كمجموعة. يمكن لطلاب الطب الاستفادة من برامجنا لبناء ملف بحثي قوي منذ سنوات الدراسة." },
  { q: "كيف أتواصل مع فريق SRMA؟", a: "يمكنك التواصل معنا عبر واتساب: +966 56 215 9258 | تيليجرام: @SRMAAcademy | قناة WhatsApp: whatsapp.com/channel/0029Vb7QxGE1iUxikfgEFJ0I. فريقنا متاح 6 أيام في الأسبوع." },
  { q: "هل يمكن إحياء بحث متوقف؟", a: "بالتأكيد! إذا كان لديك بحث توقف لأي سبب (بيانات غير محللة، فريق انحل، مشكلة في المنهجية)، يمكن لفريق SRMA إعادة تقييمه وإحيائه ووصوله إلى مرحلة النشر." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-white py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#0C3156]/8 border border-[#0C3156]/15 text-[#0C3156] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            الأسئلة الشائعة
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">الأسئلة الشائعة</h1>
          <p className="text-slate-600">إجابات على أكثر الأسئلة شيوعاً حول SRMA Research Academy وخدماتها</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden hover:border-[#0C3156]/25 transition-colors" data-testid={`accordion-faq-${index}`}>
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-right hover:bg-slate-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                data-testid={`button-faq-toggle-${index}`}
              >
                <div className="flex items-center gap-2">
                  {openIndex === index
                    ? <ChevronUp size={18} className="text-[#0C3156] flex-shrink-0" />
                    : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-3 flex-row-reverse flex-1">
                  <span className="w-7 h-7 rounded-full bg-[#0C3156]/10 text-[#0C3156] text-xs font-bold flex items-center justify-center flex-shrink-0">{index + 1}</span>
                  <span className="font-semibold text-slate-900 text-right">{faq.q}</span>
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 border-t border-slate-100 bg-[#EFF6FF]/60">
                  <p className="text-slate-600 leading-relaxed pt-4 text-sm text-right">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-[#0C3156] to-[#1A5FAE] rounded-2xl p-7 text-right text-white shadow-xl">
            <h3 className="text-xl font-black mb-2">هل لديك سؤال آخر؟</h3>
            <p className="text-blue-100 text-sm mb-5">فريقنا جاهز للإجابة على جميع استفساراتك عبر قنوات التواصل المختلفة</p>
            <div className="flex gap-3 flex-wrap">
              <a href="https://wa.me/966562159258" target="_blank" rel="noopener noreferrer" data-testid="button-faq-whatsapp"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#1eb856] transition-colors">
                واتساب ←
              </a>
              <a href="https://t.me/SRMAAcademy" target="_blank" rel="noopener noreferrer" data-testid="button-faq-telegram"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/10 transition-colors">
                @SRMAAcademy ←
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
