export type PortalNavIcon = "home" | "book" | "info" | "graduation" | "users" | "file";
export type CoordinatorCopyKey = "brandSubtitle" | "pageTitle" | "loginTitle" | "loginDescription" | "codeLabel" | "codePlaceholder" | "loginLabel" | "registrationPrefix" | "registrationLabel" | "footnote" | "cookieTitle" | "cookieDescription" | "cookieRejectLabel" | "cookieAcceptLabel" | "installTitle" | "installDescription" | "installActionLabel" | "installDismissLabel";

export interface PortalNavItem {
  id: string;
  label: string;
  labelEn?: string;
  href: string;
  icon: PortalNavIcon;
  visible: boolean;
  accent: boolean;
}

export interface CoordinatorPortalSettings {
  brandName: string;
  brandYear: string;
  brandSubtitle: string;
  pageTitle: string;
  loginTitle: string;
  loginDescription: string;
  codeLabel: string;
  codePlaceholder: string;
  loginLabel: string;
  registrationPrefix: string;
  registrationLabel: string;
  footnote: string;
  telegramUrl: string;
  whatsappUrl: string;
  showTelegram: boolean;
  showWhatsapp: boolean;
  showCookieBanner: boolean;
  cookieTitle: string;
  cookieDescription: string;
  cookieRejectLabel: string;
  cookieAcceptLabel: string;
  cookiePolicyUrl: string;
  showInstallPrompt: boolean;
  installTitle: string;
  installDescription: string;
  installActionLabel: string;
  installDismissLabel: string;
  translations: Record<CoordinatorCopyKey, string>;
  navItems: PortalNavItem[];
}

export const PORTAL_NAV_ICONS: { value: PortalNavIcon; label: string }[] = [
  { value: "home", label: "الرئيسية" },
  { value: "book", label: "مركز المعرفة" },
  { value: "info", label: "عن المنصة" },
  { value: "graduation", label: "بوابة المشارك" },
  { value: "users", label: "بوابة المنسق" },
  { value: "file", label: "الطلبات الخاصة" },
];

export const DEFAULT_COORDINATOR_PORTAL_SETTINGS: CoordinatorPortalSettings = {
  brandName: "SRMA",
  brandYear: "2026",
  brandSubtitle: "Research Academy",
  pageTitle: "SRMA Research Academy — بوابة المنسق",
  loginTitle: "بوابة المنسقين",
  loginDescription: "سجّل دخولك برمز الوصول الخاص بك",
  codeLabel: "رمز الدخول",
  codePlaceholder: "أدخل الرمز هنا...",
  loginLabel: "دخول",
  registrationPrefix: "لا تملك حساباً؟",
  registrationLabel: "سجّل الآن",
  footnote: "البوابة مخصصة للمنسقين المعتمدين فقط",
  telegramUrl: "https://t.me/SRMAAcademy",
  whatsappUrl: "https://wa.me/966562159258",
  showTelegram: true,
  showWhatsapp: true,
  showCookieBanner: true,
  cookieTitle: "نحن نستخدم ملفات تعريف الارتباط",
  cookieDescription: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وقياس أداء المنصة. يمكنك تغيير قرارك لاحقاً من صفحة السياسات والشروط.",
  cookieRejectLabel: "رفض غير الضروري",
  cookieAcceptLabel: "قبول الكل",
  cookiePolicyUrl: "/policies",
  showInstallPrompt: true,
  installTitle: "ثبّت تطبيق SRMA Research Academy",
  installDescription: "أضف المنصة إلى شاشتك الرئيسية للوصول السريع.",
  installActionLabel: "تثبيت",
  installDismissLabel: "ليس الآن",
  translations: {
    brandSubtitle: "Research Academy",
    pageTitle: "SRMA Research Academy — Coordinator Portal",
    loginTitle: "Coordinator Portal",
    loginDescription: "Sign in with your personal access code",
    codeLabel: "Access code",
    codePlaceholder: "Enter your code here...",
    loginLabel: "Sign in",
    registrationPrefix: "Don't have an account?",
    registrationLabel: "Register now",
    footnote: "This portal is for approved coordinators only",
    cookieTitle: "We use cookies",
    cookieDescription: "We use cookies to improve your experience and measure platform performance. You can change your choice later from the policies page.",
    cookieRejectLabel: "Reject non-essential",
    cookieAcceptLabel: "Accept all",
    installTitle: "Install SRMA Research Academy",
    installDescription: "Add the platform to your home screen for quick access.",
    installActionLabel: "Install",
    installDismissLabel: "Not now",
  },
  navItems: [
    { id: "home", label: "الرئيسية", labelEn: "Home", href: "/", icon: "home", visible: true, accent: false },
    { id: "knowledge", label: "مركز المعرفة", labelEn: "Knowledge Center", href: "/knowledge-center", icon: "book", visible: true, accent: false },
    { id: "about", label: "عن المنصة", labelEn: "About", href: "/about", icon: "info", visible: true, accent: false },
    { id: "participant", label: "بوابة المشارك", labelEn: "Participant Portal", href: "/participant-portal", icon: "graduation", visible: true, accent: true },
    { id: "coordinator", label: "بوابة المنسق", labelEn: "Coordinator Portal", href: "/coordinator", icon: "users", visible: true, accent: true },
    { id: "requests", label: "الطلبات الخاصة", labelEn: "Special Requests", href: "/special-requests", icon: "file", visible: true, accent: false },
  ],
};