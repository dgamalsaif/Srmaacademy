import { useEffect } from "react";
import type { SiteLanguage } from "@/lib/i18n";

const SITE_URL = "https://srmaacademy.com";
const SITE_NAME = "SRMA Research Academy";

const pageMetadata: Record<string, Record<SiteLanguage, { title: string; description: string }>> = {
  "/": {
    ar: {
      title: "SRMA Research Academy | أبحاث للأطباء والنشر العلمي الطبي",
      description: "فرص بحثية طبية ونشر علمي للأطباء: دعم اختيار المجلات والنشر في مجلات Q1 وQ2 المفهرسة في PubMed وScopus وWeb of Science.",
    },
    en: {
      title: "SRMA Research Academy | Medical Research & Publication Support",
      description: "Medical research opportunities, journal selection, and publication support for physicians targeting Q1 and Q2 journals indexed in PubMed, Scopus, and Web of Science.",
    },
  },
  "/participant-portal": {
    ar: {
      title: "فرص بحثية للأطباء | البورد السعودي والزمالات 2026 | SRMA",
      description: "فرص بحثية للأطباء والريزيدنت لدعم البورد السعودي وMatching 2026 والزمالات والترقية الأكاديمية والنشر العلمي الطبي.",
    },
    en: {
      title: "Research Opportunities for Physicians | SRMA",
      description: "Medical research opportunities for residents and physicians pursuing board applications, fellowships, academic promotion, and publication.",
    },
  },
  "/knowledge-center": {
    ar: {
      title: "مركز المعرفة | البورد السعودي والنشر العلمي واختيار المجلات",
      description: "أدلة عملية للأطباء حول أبحاث البورد السعودي وMatching 2026 والنشر العلمي واختيار مجلات Q1 وQ2 وفهرسة PubMed وScopus وWOS.",
    },
    en: {
      title: "Knowledge Center | Medical Research, Boards & Publication",
      description: "Practical medical research guides for board applications, fellowships, journal selection, Q1/Q2 publication, PubMed, Scopus, and Web of Science.",
    },
  },
  "/about": {
    ar: {
      title: "عن SRMA Research Academy | دعم الأبحاث والنشر العلمي الطبي",
      description: "تعرف على منصة SRMA لدعم الأطباء والباحثين في البحث العلمي الطبي والنشر واختيار المجلات والفهرسة الدولية.",
    },
    en: {
      title: "About SRMA Research Academy | Medical Research Support",
      description: "Learn about SRMA Research Academy and our support for medical research, scientific publication, journal selection, and international indexing.",
    },
  },
  "/faq": {
    ar: {
      title: "الأسئلة الشائعة | أبحاث البورد والنشر العلمي | SRMA",
      description: "إجابات حول فرص الأبحاث للأطباء، البورد السعودي، النشر العلمي، المجلات Q1 وQ2، PubMed وScopus وWeb of Science.",
    },
    en: {
      title: "FAQs | Medical Research and Publication | SRMA",
      description: "Answers about medical research opportunities, scientific publication, Q1/Q2 journals, PubMed, Scopus, Web of Science, and fellowships.",
    },
  },
  "/special-requests": {
    ar: {
      title: "خدمات النشر العلمي واختيار المجلات | SRMA",
      description: "خدمات بحثية للأطباء تشمل إعداد الأبحاث والتحليل الإحصائي واختيار المجلات والنشر العلمي في مجلات Q1 وQ2 المفهرسة.",
    },
    en: {
      title: "Scientific Publication & Journal Selection Services | SRMA",
      description: "Medical research services including study design, statistics, journal selection, and publication support for indexed Q1 and Q2 journals.",
    },
  },
};

function setMeta(selector: string, attribute: "name" | "property", value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, selector.match(/="([^"]+)"/)?.[1] || "");
    document.head.appendChild(element);
  }
  element.content = value;
}

function setLink(rel: string, href: string, language?: string) {
  const selector = language ? `link[rel="${rel}"][hreflang="${language}"]` : `link[rel="${rel}"]`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    if (language) element.hreflang = language;
    document.head.appendChild(element);
  }
  element.href = href;
}

export function buildPublicUrl(pathname: string, language: SiteLanguage) {
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  return `${SITE_URL}${path}?lang=${language}`;
}

export function PageSeo({ pathname, language, title, description, jsonLd, noIndex = false }: {
  pathname: string;
  language: SiteLanguage;
  title?: string;
  description?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  noIndex?: boolean;
}) {
  useEffect(() => {
    const knownPage = pageMetadata[pathname]?.[language] || pageMetadata["/"][language];
    const pageTitle = title || knownPage.title;
    const pageDescription = description || knownPage.description;
    const canonical = buildPublicUrl(pathname, language);

    document.title = pageTitle;
    setMeta('meta[name="description"]', "name", pageDescription);
    setMeta('meta[name="robots"]', "name", noIndex ? "noindex, nofollow" : "index, follow");
    setMeta('meta[property="og:title"]', "property", pageTitle);
    setMeta('meta[property="og:description"]', "property", pageDescription);
    setMeta('meta[property="og:url"]', "property", canonical);
    setMeta('meta[property="og:locale"]', "property", language === "ar" ? "ar_SA" : "en_US");
    setMeta('meta[name="twitter:title"]', "name", pageTitle);
    setMeta('meta[name="twitter:description"]', "name", pageDescription);
    setLink("canonical", canonical);
    setLink("alternate", buildPublicUrl(pathname, "ar"), "ar");
    setLink("alternate", buildPublicUrl(pathname, "en"), "en");
    setLink("alternate", buildPublicUrl(pathname, "ar"), "x-default");

    const structuredData = jsonLd || {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/srma-logo.jpg`,
          description: "Medical research opportunities and scientific publication support for physicians.",
        },
        {
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          inLanguage: language,
        },
        {
          "@type": "WebPage",
          name: pageTitle,
          description: pageDescription,
          url: canonical,
          inLanguage: language,
        },
      ],
    };
    let script = document.head.querySelector<HTMLScriptElement>('script[data-srma-jsonld="page"]');
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.srmaJsonld = "page";
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(structuredData);
  }, [description, jsonLd, language, noIndex, pathname, title]);

  return null;
}

export const SEO_KEYWORD_FAMILIES = {
  ar: [
    "أبحاث البورد السعودي", "أطباء البورد", "Matching 2026", "البورد الأردني", "البورد الأمريكي", "البورد البريطاني",
    "الزمالات الأمريكية", "الزمالة الكندية", "الترقية الأكاديمية", "نشر علمي للأبحاث", "اختيار المجلات",
    "مجلات Q1 وQ2", "PubMed", "Scopus", "Web of Science", "SMLE", "SPLE", "SDLE", "USMLE", "MRCOG",
  ],
  en: [
    "medical research publication", "board application research", "fellowship research", "journal selection",
    "Q1 Q2 medical journals", "PubMed", "Scopus", "Web of Science", "USMLE research", "MRCOG research",
  ],
};