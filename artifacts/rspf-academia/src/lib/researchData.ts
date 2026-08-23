export interface ResearchOpportunity {
  id: number;
  category?: "active" | "completed" | "training" | "cme";
  specialty: string;
  specialtyAr?: string;
  specialtyEn?: string;
  specialtyColor: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  description: string;
  descriptionAr?: string;
  descriptionEn?: string;
  seatsLeft: number;
  totalSeats: number;
  status: "open" | "closed" | "draft" | "upcoming" | "seats_full" | "ethics_approved" | "submitted" | "under_review" | "accepted" | "published";
  firstAuthorSeats?: number;
  firstAuthorSeatsLeft?: number;
  coAuthorSeats?: number;
  coAuthorSeatsLeft?: number;
  priceOriginalSar?: number;
  priceDiscountedSar?: number;
  journalTarget: string;
  journalIssn?: string;
  journalPubmed?: string;
  journalScopus?: string;
  journalWos?: string;
  indexedIn: string[];
  benefits: string[];
  duration: string;
  supervisor: string;
  createdAt: string;
  imageUrl?: string;
}

const DEFAULT_RESEARCH: ResearchOpportunity[] = [
  {
    id: 1,
    specialty: "Emergency Medicine",
    specialtyColor: "bg-orange-100 text-orange-700",
    title: "Early Lactate-Guided vs. Standard Hemodynamic Resuscitation in Patients With Sepsis and Septic Shock",
    description: "دراسة مقارنة شاملة بين أسلوبَي الإنعاش الديناميكي الدموي في مرضى الإنتان والصدمة الإنتانية بالأقسام الطارئة. تهدف الدراسة لتقييم أثر التوجيه بمستويات اللاكتات على نتائج المرضى السريرية.",
    seatsLeft: 2,
    totalSeats: 12,
    status: "open",
    journalTarget: "Journal of Emergency Medicine (Q2)",
    indexedIn: ["Scopus", "PubMed"],
    benefits: [
      "نشر في مجلة Q2 مفهرسة في Scopus",
      "5 نقاط SCFHS معتمدة",
      "إشراف من استشاري طوارئ معتمد",
      "شهادة مشاركة رسمية",
    ],
    duration: "8 أشهر",
    supervisor: "د. محمد العمري — استشاري طب طوارئ",
    createdAt: "2026-04-01",
  },
  {
    id: 2,
    specialty: "Plastic Surgery",
    specialtyColor: "bg-pink-100 text-pink-700",
    title: "Efficacy and Safety of Autologous Fat Grafting for Facial Rejuvenation: A Systematic Review and Meta-Analysis",
    description: "مراجعة منهجية وتحليل شامل لأدلة فاعلية وسلامة حقن الدهون الذاتية لتجديد شباب الوجه. تغطي الدراسة نتائج المرضى والمضاعفات ودرجة الرضا على المدى البعيد.",
    seatsLeft: 2,
    totalSeats: 12,
    status: "open",
    journalTarget: "Aesthetic Surgery Journal (Q1)",
    indexedIn: ["PubMed", "Scopus", "WoS"],
    benefits: [
      "نشر في مجلة Q1 مفهرسة في PubMed",
      "5 نقاط SCFHS معتمدة",
      "إشراف من استشاري جراحة تجميل",
      "تحليل إحصائي كامل مشمول",
    ],
    duration: "10 أشهر",
    supervisor: "د. سارة القحطاني — استشارية جراحة تجميل",
    createdAt: "2026-04-05",
  },
  {
    id: 3,
    specialty: "Restorative Dentistry",
    specialtyColor: "bg-blue-100 text-blue-700",
    title: "Selective Caries Removal Versus Complete Caries Excavation in Permanent Teeth: A Systematic Review",
    description: "مراجعة منهجية تقارن بين تقنية إزالة التسوس الانتقائية والإزالة الكاملة في الأسنان الدائمة. تستعرض أحدث الدراسات وتُقيّم النتائج السريرية على المدى القصير والبعيد.",
    seatsLeft: 6,
    totalSeats: 12,
    status: "open",
    journalTarget: "Journal of Dentistry (Q1)",
    indexedIn: ["Scopus", "PubMed"],
    benefits: [
      "نشر في مجلة أسنان دولية محكمة",
      "5 نقاط SCFHS معتمدة",
      "منهجية Systematic Review متكاملة",
      "دعم البحث المنهجي وتقييم الأدلة",
    ],
    duration: "9 أشهر",
    supervisor: "د. خالد الزهراني — استشاري طب الأسنان التحفظي",
    createdAt: "2026-04-10",
  },
  {
    id: 4,
    specialty: "Pedodontics",
    specialtyColor: "bg-teal-100 text-teal-700",
    title: "Bioactive Glass-Based Materials vs. Conventional Materials in Primary Tooth Restorations: A Systematic Review",
    description: "مراجعة منهجية تقارن مواد الزجاج الحيوي بالمواد التقليدية في حشوات أسنان الأطفال. تُقيّم الدراسة فاعلية المواد ومدة بقائها ودرجة قبول الأطفال لها.",
    seatsLeft: 5,
    totalSeats: 12,
    status: "open",
    journalTarget: "International Journal of Paediatric Dentistry (Q2)",
    indexedIn: ["Scopus", "PubMed"],
    benefits: [
      "نشر في مجلة أطفال دولية محكمة",
      "5 نقاط SCFHS معتمدة",
      "مقارنة بين مواد تحشية متقدمة",
      "إشراف من استشاري أسنان أطفال",
    ],
    duration: "8 أشهر",
    supervisor: "د. نورة الدوسري — استشارية أسنان أطفال",
    createdAt: "2026-04-15",
  },
  {
    id: 5,
    specialty: "Cardiac Surgery",
    specialtyColor: "bg-red-100 text-red-700",
    title: "Endoscopic aortic valve replacement with automated annular suture device versus conventional suturing",
    description: "دراسة مقارنة بين تقنية استبدال صمام الأبهر بالمنظار مع جهاز الخياطة الحلقية الآلي مقابل تقنية الخياطة التقليدية. تُركّز على نتائج السلامة والفاعلية والمضاعفات.",
    seatsLeft: 4,
    totalSeats: 12,
    status: "open",
    journalTarget: "European Journal of Cardio-Thoracic Surgery (Q1)",
    indexedIn: ["PubMed", "Scopus", "WoS"],
    benefits: [
      "نشر في مجلة قلب دولية عالية التصنيف",
      "5 نقاط SCFHS معتمدة",
      "إشراف من جراح قلب استشاري",
      "مقارنة تقنيات جراحية حديثة",
    ],
    duration: "12 أشهر",
    supervisor: "د. عبدالرحمن الغامدي — استشاري جراحة القلب والصدر",
    createdAt: "2026-04-20",
  },
  {
    id: 6,
    specialty: "Interventional Radiology",
    specialtyColor: "bg-purple-100 text-purple-700",
    title: "Safety and Feasibility and Clinical Outcomes of Stenting vs. Angloplasty for critical limb Ischemia",
    description: "دراسة تهدف لتقييم سلامة وجدوى وكفاءة الدعامات مقارنةً بتوسيع الأوعية بالبالون في علاج إقفار الطرف الحرج. تشمل متابعة طويلة الأمد للنتائج السريرية.",
    seatsLeft: 3,
    totalSeats: 12,
    status: "open",
    journalTarget: "Cardiovascular and Interventional Radiology (Q2)",
    indexedIn: ["Scopus", "PubMed"],
    benefits: [
      "نشر في مجلة أشعة تداخلية محكمة",
      "5 نقاط SCFHS معتمدة",
      "إشراف من استشاري أشعة تداخلية",
      "مقارنة نتائج سريرية متقدمة",
    ],
    duration: "10 أشهر",
    supervisor: "د. فيصل العسيري — استشاري الأشعة التداخلية",
    createdAt: "2026-04-25",
  },
];

const STORAGE_KEY = "srma_research_opportunities";
const LEGACY_STORAGE_KEY = "rspf_research_opportunities";

export function getResearchOpportunities(): ResearchOpportunity[] {
  try {
    for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY]) {
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored) as ResearchOpportunity[];
        if (key === LEGACY_STORAGE_KEY) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RESEARCH));
  return DEFAULT_RESEARCH;
}

export function saveResearchOpportunities(data: ResearchOpportunity[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getNextId(data: ResearchOpportunity[]): number {
  return data.length > 0 ? Math.max(...data.map((d) => d.id)) + 1 : 1;
}

export const SPECIALTY_COLORS: Record<string, string> = {
  "Emergency Medicine": "bg-orange-100 text-orange-700",
  "Plastic Surgery": "bg-pink-100 text-pink-700",
  "Restorative Dentistry": "bg-blue-100 text-blue-700",
  Pedodontics: "bg-teal-100 text-teal-700",
  "Cardiac Surgery": "bg-red-100 text-red-700",
  "Interventional Radiology": "bg-purple-100 text-purple-700",
  "Internal Medicine": "bg-indigo-100 text-indigo-700",
  Orthopedics: "bg-yellow-100 text-yellow-700",
  Neurology: "bg-cyan-100 text-cyan-700",
  Dermatology: "bg-rose-100 text-rose-700",
  Ophthalmology: "bg-lime-100 text-lime-700",
  Other: "bg-gray-100 text-gray-700",
};
