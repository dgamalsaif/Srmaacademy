import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useLanguage } from "@/lib/i18n";
import type { ResearchOpportunity } from "@/lib/researchData";

const staticEnglish: Record<string, string> = {
  "استكشف الفرص البحثية": "Explore research opportunities",
  "تواصل معنا": "Contact us",
  "ابدأ الآن": "Start now",
  "للاستفسارات: ": "For inquiries: ",
};

export default function Home() {
  const { direction, localize, t } = useLanguage();

  const s = (arabic: string) => localize(arabic, staticEnglish[arabic] ?? arabic);

  const opportunities: Partial<ResearchOpportunity>[] = useMemo(
    () => [
      {
        id: 1,
        title: s("فرص بحثية"),
        description: s("اكتشف مشاريع بحثية متنوعة"),
      },
    ],
    [s],
  );

  return (
    <main className="min-h-screen bg-[#f5f5f5]" dir={direction}>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col items-center gap-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-[#0C3156] md:text-6xl"
          >
            {s("استكشف الفرص البحثية")}
          </motion.h1>

          <Link
            href="/participant-portal"
            data-testid="button-hero-explore"
            className="bg-[#0C3156] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-[#0a2847] transition-colors inline-flex items-center gap-2"
          >
            {s("استكشف الفرص البحثية")}{' '}
            <ChevronLeft size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
