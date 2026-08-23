import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Shield, X, CheckCircle2, Loader2, UserRound, Mail, Phone, Building2, Menu, Home, BookOpen, Info, GraduationCap, UsersRound, FileText, Download, Cookie } from "lucide-react";
import CountrySelector from "@/components/CountrySelector";
import FloatingButtons from "@/components/FloatingButtons";
import { CoordinatorPortalSettings, DEFAULT_COORDINATOR_PORTAL_SETTINGS, PortalNavIcon } from "@/lib/coordinatorPortalSettings";
import Footer from "@/components/Footer";
import { SRMA_LOGO } from "@/components/BrandBackground";
import { useLanguage } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const navIcons: Record<PortalNavIcon, typeof Home> = {
  home: Home,
  book: BookOpen,
  info: Info,
  graduation: GraduationCap,
  users: UsersRound,
  file: FileText,
};

function CoordinatorHeader({ settings }: { settings: CoordinatorPortalSettings }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, localize, setLanguage } = useLanguage();
  const navLinks = settings.navItems.filter((item) => item.visible);

  return (
    <header className="relative z-50 border-b border-slate-100 bg-white shadow-[0_2px_12px_rgba(22,48,67,0.05)]">
      <div className="mx-auto flex h-[78px] max-w-[1450px] items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" data-testid="link-coordinator-logo" className="flex shrink-0 items-center gap-2.5">
          <img src={SRMA_LOGO} alt="SRMA Research Academy" className="h-11 w-11 rounded-full border border-[#0d765c]/20 object-cover shadow-sm" />
          <div className="text-right leading-none">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-[#e2a229]">{settings.brandYear}</span>
              <span className="text-[19px] font-black tracking-tight text-[#193d37]">{settings.brandName}</span>
            </div>
            <span className="mt-1 block text-[9px] font-medium tracking-wide text-slate-500">{localize(settings.brandSubtitle, settings.translations.brandSubtitle)}</span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1.5 lg:flex" aria-label={language === "en" ? "Main navigation" : "التنقل الرئيسي"}>
          {navLinks.map((item) => {
            const Icon = navIcons[item.icon];
            const active = location === item.href || (item.href === "/coordinator" && location === "/coordinator-portal");
            const className = `flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-bold transition-all ${
              item.accent
                ? "bg-[#0d765c] text-white shadow-[0_7px_16px_rgba(13,118,92,0.16)] hover:bg-[#09634d]"
                : active
                  ? "text-[#0d765c]"
                  : "text-[#1e2b3a] hover:bg-slate-50 hover:text-[#0d765c]"
            }`;
            return (
              item.href.startsWith("http") ? (
                <a key={item.id} href={item.href} className={className} target="_blank" rel="noreferrer">
                  <Icon size={15} strokeWidth={2.2} />
                  {localize(item.label, item.labelEn)}
                </a>
              ) : (
                <Link key={item.id} href={item.href} data-testid={`link-coordinator-nav-${item.id}`} className={className}>
                  <Icon size={15} strokeWidth={2.2} />
                  {localize(item.label, item.labelEn)}
                </Link>
              )
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-testid="button-language-toggle"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-[#0d765c] transition hover:border-[#0d765c]/30 hover:bg-[#e7f3ef]"
            aria-label={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            {language === "ar" ? "EN" : "ع"}
          </button>
          <button
            type="button"
            data-testid="button-coordinator-mobile-menu"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-xl p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
            aria-label={mobileOpen ? (language === "en" ? "Close menu" : "إغلاق القائمة") : (language === "en" ? "Open menu" : "فتح القائمة")}
          >
            {mobileOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="animate-in fade-in slide-in-from-top-2 border-t border-slate-100 bg-white px-5 pb-5 pt-2 duration-200 lg:hidden" aria-label={language === "en" ? "Mobile navigation" : "التنقل للجوال"}>
          {navLinks.map((item) => {
            const Icon = navIcons[item.icon];
            const className = `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${item.accent ? "text-[#0d765c] hover:bg-[#e7f3ef]" : "text-slate-700 hover:bg-slate-50"}`;
            return item.href.startsWith("http") ? (
              <a key={item.id} href={item.href} className={className} target="_blank" rel="noreferrer">
                <Icon size={17} />
                {localize(item.label, item.labelEn)}
              </a>
            ) : (
              <Link key={item.id} href={item.href} onClick={() => setMobileOpen(false)} className={className}>
                <Icon size={17} />
                {localize(item.label, item.labelEn)}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

export default function CoordinatorPortal() {
  const { language, direction, localize } = useLanguage();
  const [settings, setSettings] = useState<CoordinatorPortalSettings>(DEFAULT_COORDINATOR_PORTAL_SETTINGS);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [cookieReady, setCookieReady] = useState(false);
  const [cookiePreference, setCookiePreference] = useState<string | null>(null);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    let active = true;
    fetch("/api/coordinator-portal-settings")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((saved: CoordinatorPortalSettings) => { if (active) setSettings(saved); })
      .catch(() => undefined);
    setCookiePreference(window.localStorage.getItem("srma-cookie-preference"));
    setInstallDismissed(window.localStorage.getItem("srma-install-dismissed") === "true");
    setCookieReady(true);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    document.title = localize(settings.pageTitle, settings.translations.pageTitle);
  }, [localize, settings.pageTitle, settings.translations.pageTitle]);

  useEffect(() => {
    const captureInstall = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    window.addEventListener("beforeinstallprompt", captureInstall);
    return () => window.removeEventListener("beforeinstallprompt", captureInstall);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loggingIn) return;
    setLoggingIn(true);
    try {
      const response = await fetch("/api/coordinator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json() as { error?: string };
      if (response.ok) {
        setError("");
        setLocation("/coordinator/dashboard");
      } else {
        setError(result.error || (language === "en" ? "Unable to sign in" : "تعذر تسجيل الدخول"));
      }
    } catch {
      setError(language === "en" ? "Unable to connect to the server. Please try again." : "تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setLoggingIn(false);
    }
  };

  const saveCookiePreference = (preference: "accepted" | "rejected") => {
    window.localStorage.setItem("srma-cookie-preference", preference);
    setCookiePreference(preference);
  };

  const dismissInstall = () => {
    window.localStorage.setItem("srma-install-dismissed", "true");
    setInstallDismissed(true);
  };

  const installApp = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstallEvent(null);
    dismissInstall();
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#172238]" dir={direction}>
      <CoordinatorHeader settings={settings} />
      <main className="flex min-h-[calc(100vh-78px)] justify-center px-4 pb-28 pt-20 sm:pt-40 lg:pt-[260px]">
        <div className="w-full max-w-[448px]">
          <div className="mb-7 text-center">
            <p className="text-[17px] font-black text-[#172238]">{localize(settings.pageTitle, settings.translations.pageTitle)}</p>
          </div>

          <div className="page-enter rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-[0_16px_30px_rgba(17,38,59,0.12)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f3ef]">
              <Shield size={27} className="text-[#117b59]" strokeWidth={2.2} />
            </div>
            <h1 className="mb-2 text-xl font-black text-[#172238]">{localize(settings.loginTitle, settings.translations.loginTitle)}</h1>
            <p className="mb-7 text-sm text-slate-500">{localize(settings.loginDescription, settings.translations.loginDescription)}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="username" autoComplete="username" tabIndex={-1} aria-hidden="true" className="absolute h-0 w-0 opacity-0 pointer-events-none" />
              <div>
                <label htmlFor="coordinator-password" className="mb-2 block text-right text-sm font-semibold text-[#263447]">{localize(settings.codeLabel, settings.translations.codeLabel)}</label>
                <input
                  id="coordinator-password"
                  data-testid="input-coordinator-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder={localize(settings.codePlaceholder, settings.translations.codePlaceholder)}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={`w-full rounded-xl border bg-white px-5 py-3.5 text-right text-sm outline-none transition-colors ${error ? "border-red-300 focus:ring-2 focus:ring-red-200" : "border-slate-200 focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/20"}`}
                />
              </div>
              {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-right text-sm text-red-500">{error}</p>}
              <button data-testid="button-coordinator-login" type="submit" disabled={loggingIn} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#117b59] py-3.5 text-base font-bold text-white shadow-[0_8px_18px_rgba(17,123,89,0.18)] transition-colors hover:bg-[#0c6549] disabled:cursor-wait disabled:opacity-70">
                {loggingIn ? <><Loader2 size={18} className="animate-spin" /> {language === "en" ? "Verifying..." : "جارٍ التحقق..."}</> : localize(settings.loginLabel, settings.translations.loginLabel)}
              </button>
            </form>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-sm text-slate-500">
                {localize(settings.registrationPrefix, settings.translations.registrationPrefix)}{" "}
                <button type="button" onClick={() => setRequestOpen(true)} data-testid="link-coordinator-help" className="font-bold text-[#117b59] hover:underline">
                  {localize(settings.registrationLabel, settings.translations.registrationLabel)}
                </button>
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">{localize(settings.footnote, settings.translations.footnote)}</p>
        </div>
      </main>
      <Footer />
      <FloatingButtons
        telegramUrl={settings.telegramUrl}
        whatsappUrl={settings.whatsappUrl}
        showTelegram={settings.showTelegram}
        showWhatsapp={settings.showWhatsapp}
      />
      {cookieReady && settings.showCookieBanner && !cookiePreference && (
        <aside data-testid="coordinator-cookie-banner" className="fixed bottom-5 right-5 z-[80] w-[calc(100%-2.5rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-[0_18px_42px_rgba(15,35,50,0.18)] page-enter">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e7f3ef] text-[#117b59]"><Cookie size={19} /></div>
            <div>
              <h2 className="font-black text-slate-800">{localize(settings.cookieTitle, settings.translations.cookieTitle)}</h2>
              <p className="mt-1.5 text-xs leading-6 text-slate-500">{localize(settings.cookieDescription, settings.translations.cookieDescription)}{" "}
                {settings.cookiePolicyUrl.startsWith("http") ? (
                  <a href={settings.cookiePolicyUrl} className="font-bold text-[#117b59] hover:underline" target="_blank" rel="noreferrer">{language === "en" ? "Policies and terms" : "السياسات والشروط"}</a>
                ) : (
                  <Link href={settings.cookiePolicyUrl} className="font-bold text-[#117b59] hover:underline">{language === "en" ? "Policies and terms" : "السياسات والشروط"}</Link>
                )}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => saveCookiePreference("rejected")} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50">{localize(settings.cookieRejectLabel, settings.translations.cookieRejectLabel)}</button>
            <button type="button" onClick={() => saveCookiePreference("accepted")} className="rounded-xl bg-[#117b59] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0c6549]">{localize(settings.cookieAcceptLabel, settings.translations.cookieAcceptLabel)}</button>
          </div>
        </aside>
      )}
      {settings.showInstallPrompt && installEvent && !installDismissed && (
        <aside data-testid="coordinator-install-prompt" className="fixed bottom-5 right-5 z-[75] w-[calc(100%-2.5rem)] max-w-sm rounded-2xl border border-emerald-100 bg-white p-4 text-right shadow-[0_18px_42px_rgba(15,35,50,0.18)] page-enter">
          <button type="button" onClick={dismissInstall} className="absolute left-3 top-3 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100" aria-label={language === "en" ? "Close" : "إغلاق"}><X size={16} /></button>
          <div className="flex items-center gap-3">
            <img src={SRMA_LOGO} alt="" className="h-10 w-10 shrink-0 rounded-xl border border-emerald-100 object-cover" />
            <div>
              <h2 className="pl-6 text-sm font-black text-slate-800">{localize(settings.installTitle, settings.translations.installTitle)}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">{localize(settings.installDescription, settings.translations.installDescription)}</p>
            </div>
          </div>
          <button type="button" onClick={() => void installApp()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#117b59] py-2.5 text-sm font-bold text-white transition hover:bg-[#0c6549]"><Download size={16} />{localize(settings.installActionLabel, settings.translations.installActionLabel)}</button>
          <button type="button" onClick={dismissInstall} className="mt-2 w-full py-1.5 text-xs font-bold text-slate-500 hover:text-[#117b59]">{localize(settings.installDismissLabel, settings.translations.installDismissLabel)}</button>
        </aside>
      )}
      {requestOpen && <CoordinatorRequestModal whatsappUrl={settings.whatsappUrl} onClose={() => setRequestOpen(false)} />}
    </div>
  );
}

interface CoordinatorRequestModalProps {
  onClose: () => void;
  whatsappUrl: string;
}

function CoordinatorRequestModal({ onClose, whatsappUrl }: CoordinatorRequestModalProps) {
  const { language, direction } = useLanguage();
  const isEnglish = language === "en";
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    affiliation: "",
    country: isEnglish ? "Saudi Arabia" : "المملكة العربية السعودية",
    dialCode: "+966",
  });
  const [loading, setLoading] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");
  const [error, setError] = useState("");

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: `${form.dialCode} ${form.phone}`.trim(),
          email: form.email,
          serviceType: isEnglish ? "Research coordinator accreditation request" : "طلب اعتماد منسق بحثي",
          details: isEnglish
            ? `I would like to join SRMA Research Academy as a research coordinator. Affiliation: ${form.affiliation}. Country: ${form.country}`
            : `أرغب في الانضمام كمنسق للأبحاث العلمية في SRMA Research Academy. جهة الانتساب: ${form.affiliation}. الدولة: ${form.country}`,
          fileLink: "",
        }),
      });
      const saved = await response.json() as { id?: number; error?: string };
      if (!response.ok || !saved.id) throw new Error(saved.error || (isEnglish ? "Unable to send the request" : "تعذر إرسال الطلب"));
      const number = `SRMA-COORD-${String(saved.id).padStart(4, "0")}`;
      setRequestNumber(number);
      const message = encodeURIComponent(
        isEnglish
          ? `New research coordinator accreditation request\n\nName: ${form.fullName}\nPhone: ${form.dialCode} ${form.phone}\nEmail: ${form.email}\nAffiliation: ${form.affiliation}\nCountry: ${form.country}\nRequest number: ${number}`
          : `طلب اعتماد منسق بحثي جديد\n\nالاسم: ${form.fullName}\nالهاتف: ${form.dialCode} ${form.phone}\nالبريد: ${form.email}\nجهة الانتساب: ${form.affiliation}\nالدولة: ${form.country}\nرقم الطلب: ${number}`
      );
      const separator = whatsappUrl.includes("?") ? "&" : "?";
      window.open(`${whatsappUrl}${separator}text=${message}`, "_blank", "noopener,noreferrer");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : (isEnglish ? "An unexpected error occurred" : "حدث خطأ غير متوقع"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#102d2a]/45 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl page-enter" onClick={(event) => event.stopPropagation()} dir={direction}>
        <button type="button" onClick={onClose} data-testid="button-close-coordinator-request" aria-label={isEnglish ? "Close request form" : "إغلاق نموذج الطلب"} className="absolute left-5 top-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <X size={19} />
        </button>
        {requestNumber ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f3ef]">
              <CheckCircle2 size={32} className="text-[#117b59]" />
            </div>
            <h2 className="text-xl font-black text-[#172238]">{isEnglish ? "Your request was sent successfully" : "تم إرسال طلبك بنجاح"}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">{isEnglish ? "The administration has been notified by WhatsApp and will contact you after reviewing your request." : "تم إشعار الإدارة برسالة واتساب، وسيتم التواصل معك بعد مراجعة الطلب."}</p>
            <div className="my-5 rounded-xl border border-[#d8eee7] bg-[#f3fbf8] px-4 py-3">
              <p className="text-xs text-[#568477]">{isEnglish ? "Request tracking number" : "رقم طلب المتابعة"}</p>
              <p data-testid="text-coordinator-request-number" className="mt-1 font-black tracking-wider text-[#117b59]" dir="ltr">{requestNumber}</p>
            </div>
            <p className="text-xs leading-6 text-slate-400">{isEnglish ? "Once approved, you will receive your access code from the administration by WhatsApp or email." : "بعد اعتمادك سيصلك رمز الدخول من الإدارة عبر واتساب أو البريد الإلكتروني."}</p>
            <button type="button" onClick={onClose} data-testid="button-close-request-success" className="mt-6 w-full rounded-xl bg-[#117b59] py-3 font-bold text-white transition hover:bg-[#0c6549]">{isEnglish ? "Close" : "إغلاق"}</button>
          </div>
        ) : (
          <>
            <div className="mb-6 border-b border-slate-100 pb-5">
              <p className="text-xs font-bold text-[#117b59]">{isEnglish ? "New accreditation request" : "طلب اعتماد جديد"}</p>
              <h2 className="mt-1 text-xl font-black text-[#172238]">{isEnglish ? "Become a research coordinator" : "كن منسقاً للأبحاث العلمية"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{isEnglish ? "Enter your details and we will send your request directly to SRMA administration for review." : "أدخل بياناتك، وسنرسل طلبك مباشرة إلى إدارة SRMA للمراجعة."}</p>
            </div>
            <form onSubmit={submitRequest} className="space-y-4">
              {[
                { key: "fullName", label: isEnglish ? "Full name" : "الاسم الكامل", placeholder: isEnglish ? "Dr. Ahmed Mohammed" : "د. أحمد محمد", icon: UserRound, type: "text" },
                { key: "email", label: isEnglish ? "Email address" : "البريد الإلكتروني", placeholder: "name@example.com", icon: Mail, type: "email" },
                { key: "affiliation", label: isEnglish ? "Affiliation" : "جهة الانتساب", placeholder: isEnglish ? "University or hospital" : "الجامعة أو المستشفى", icon: Building2, type: "text" },
              ].map(({ key, label, placeholder, icon: Icon, type }) => (
                <div key={key}>
                  <label htmlFor={`coordinator-${key}`} className="mb-1.5 block text-right text-sm font-semibold text-[#263447]">{label}</label>
                  <div className="relative">
                    <Icon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id={`coordinator-${key}`}
                      data-testid={`input-coordinator-${key}`}
                      required
                      type={type}
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 py-3 pr-10 pl-4 text-right text-sm outline-none transition focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15"
                      dir={key === "email" || key === "phone" ? "ltr" : undefined}
                    />
                  </div>
                </div>
              ))}
              <div>
                <label htmlFor="coordinator-phone" className="mb-1.5 block text-right text-sm font-semibold text-[#263447]">{isEnglish ? "WhatsApp number" : "رقم واتساب"}</label>
                <div className="relative">
                  <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="coordinator-phone"
                    data-testid="input-coordinator-phone"
                    required type="tel" placeholder="5X XXX XXXX" value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    dir="ltr"
                    className="w-full rounded-xl border border-slate-200 py-3 pr-10 pl-4 text-left text-sm outline-none transition focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15"
                  />
                </div>
              </div>
              <CountrySelector
                country={form.country}
                onCountryChange={(country) => setForm((previous) => ({ ...previous, country }))}
                dialCode={form.dialCode}
                onDialCodeChange={(dialCode) => setForm((previous) => ({ ...previous, dialCode }))}
                id="coordinator"
                required
              />
              {error && <p data-testid="status-coordinator-request-error" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-right text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading} data-testid="button-submit-coordinator-request" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#117b59] py-3.5 font-bold text-white shadow-[0_8px_18px_rgba(17,123,89,0.16)] transition hover:bg-[#0c6549] disabled:opacity-60">
                {loading ? <><Loader2 size={17} className="animate-spin" /> {isEnglish ? "Sending request..." : "جارٍ إرسال الطلب..."}</> : (isEnglish ? "Send accreditation request" : "إرسال طلب الاعتماد")}
              </button>
              <p className="text-center text-xs leading-5 text-slate-400">{isEnglish ? "After submission, a card with your request number will appear immediately." : "بعد الإرسال ستظهر لك مباشرةً بطاقة تحتوي على رقم طلبك."}</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
