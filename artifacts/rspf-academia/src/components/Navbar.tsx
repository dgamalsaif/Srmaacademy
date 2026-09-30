import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Check, ChevronDown, Languages, Menu, MessageCircle, X } from "lucide-react";
import { SRMA_LOGO } from "@/components/BrandBackground";
import InstallAppButton from "@/components/InstallAppButton";
import { useLanguage } from "@/lib/i18n";
import { useCurrency, OpportunityCurrency } from "@/lib/currency";
import { useSiteContentSettings } from "@/hooks/use-site-content-settings";
import { getContactUsHref } from "@/lib/siteContentSettings";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { data: settings } = useSiteContentSettings();
  const contact = getContactUsHref(settings?.brand);
  const contactLabel = language === "ar" ? contact.labelAr : contact.labelEn;
  const languageLabel = language === "ar" ? "اللغة" : "Language";
  const languageOptions = [
    { value: "ar" as const, label: "العربية" },
    { value: "en" as const, label: "English" },
  ];
  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/knowledge-center", label: t("nav.knowledge") },
    { href: "/about", label: t("nav.about") },
    { href: "/participant-portal", label: t("nav.participant"), highlight: true },
    { href: "/coordinator", label: t("nav.coordinator") },
    { href: "/special-requests", label: t("nav.requests") },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile hamburger */}
          <button
            data-testid="button-mobile-menu"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Nav links desktop */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  data-testid={`link-nav-${link.href.replace("/", "") || "home"}`}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#0C3156] text-white shadow-sm"
                      : link.highlight
                      ? "bg-[#0C3156] text-white hover:bg-[#0a2847]"
                      : "text-slate-700 hover:bg-slate-100 hover:text-[#0C3156]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="hidden lg:block">
            <InstallAppButton className="flex items-center gap-1.5 rounded-full border border-[#117b59]/25 bg-[#f3fbf8] px-3 py-2 text-xs font-black text-[#117b59] transition hover:bg-[#e6f5ef]" />
          </div>
          <a
            href={contact.href}
            target={contact.isExternal ? "_blank" : undefined}
            rel={contact.isExternal ? "noopener noreferrer" : undefined}
            data-testid="link-nav-contact"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#117b59] px-3.5 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#0c6549]"
          >
            <MessageCircle size={14} />
            {contactLabel}
          </a>
          <CurrencyToggle
            currency={currency}
            onSelect={setCurrency}
            triggerClassName="hidden sm:inline-flex"
          />
          <LanguageMenu
            language={language}
            label={languageLabel}
            options={languageOptions}
            onSelect={setLanguage}
            triggerClassName="hidden sm:inline-flex"
          />

          {/* Logo */}
          <Link href="/" data-testid="link-logo" className="flex items-center gap-2.5 flex-shrink-0">
            <img src={settings?.brand.logoUrl || SRMA_LOGO} alt={language === "ar" ? settings?.brand.siteNameAr : settings?.brand.siteNameEn} className="h-11 w-11 rounded-full border border-[#0C3156]/15 object-cover shadow-sm" />
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <span className="max-w-48 truncate text-xl font-black tracking-tight text-[#0C3156]">{language === "ar" ? settings?.brand.siteNameAr : settings?.brand.siteNameEn || "SRMA"}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">{language === "ar" ? settings?.brand.siteNameAr : settings?.brand.siteNameEn}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-4 pt-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              data-testid={`link-mobile-${link.href.replace("/", "") || "home"}`}
              className="block py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0C3156]"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="px-3 pt-3">
            <a
              href={contact.href}
              target={contact.isExternal ? "_blank" : undefined}
              rel={contact.isExternal ? "noopener noreferrer" : undefined}
              data-testid="link-nav-contact-mobile"
              className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#117b59] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0c6549]"
            >
              <MessageCircle size={16} />
              {contactLabel}
            </a>
            <CurrencyToggle
              currency={currency}
              onSelect={(next) => { setCurrency(next); setMobileOpen(false); }}
              triggerClassName="mb-2 flex w-full"
              mobile
            />
            <LanguageMenu
              language={language}
              label={languageLabel}
              options={languageOptions}
              onSelect={(nextLanguage) => { setLanguage(nextLanguage); setMobileOpen(false); }}
              triggerClassName="mb-2 flex w-full"
              mobile
            />
            <InstallAppButton className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e6f5ef] px-4 py-3 text-sm font-black text-[#117b59]" />
          </div>
        </div>
      )}
    </nav>
  );
}

export function LanguageMenu({
  language,
  label,
  options,
  onSelect,
  triggerClassName,
  mobile = false,
}: {
  language: "ar" | "en";
  label: string;
  options: { value: "ar" | "en"; label: string }[];
  onSelect: (language: "ar" | "en") => void;
  triggerClassName: string;
  mobile?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${triggerClassName} relative`}>
      <button
        type="button"
        data-testid={mobile ? "button-language-menu-mobile" : "button-language-menu"}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`${mobile ? "w-full" : ""} inline-flex items-center justify-center gap-1.5 rounded-full border border-[#0C3156]/20 px-3 py-2 text-xs font-black text-[#0C3156] transition hover:bg-[#0C3156] hover:text-white`}
        aria-label={label}
      >
        <Languages size={15} />
        {label}
        <ChevronDown size={14} className={isOpen ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>
      {isOpen && (
        <div role="menu" className={`absolute z-[60] mt-2 min-w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ${mobile ? "left-0 right-0" : "right-0"}`}>
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            data-testid={`button-language-${option.value}`}
            onClick={() => { onSelect(option.value); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={language === option.value}
            className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-right text-sm font-bold text-slate-700 transition hover:bg-[#e6f5ef] hover:text-[#117b59] focus:bg-[#e6f5ef] focus:text-[#117b59]"
          >
            {option.label}
            {language === option.value && <Check size={15} className="text-[#117b59]" />}
          </button>
        ))}
        </div>
      )}
    </div>
  );
}

export function CurrencyToggle({
  currency,
  onSelect,
  triggerClassName,
  mobile = false,
}: {
  currency: OpportunityCurrency;
  onSelect: (currency: OpportunityCurrency) => void;
  triggerClassName: string;
  mobile?: boolean;
}) {
  return (
    <div className={`${triggerClassName} items-center`} dir="ltr">
      <div
        className={`${
          mobile ? "w-full justify-center" : ""
        } inline-flex items-center rounded-full border border-[#0C3156]/20 bg-slate-100 p-0.5 shadow-2xs`}
      >
        <button
          type="button"
          data-testid={mobile ? "button-currency-sar-mobile" : "button-currency-sar-nav"}
          onClick={() => onSelect("SAR")}
          className={`${
            mobile ? "flex-1 py-2 text-xs" : "px-3 py-1.5 text-xs"
          } rounded-full font-black transition-all ${
            currency === "SAR"
              ? "bg-[#0C3156] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
          title="Saudi Riyal (SAR)"
        >
          🇸🇦 SAR
        </button>
        <button
          type="button"
          data-testid={mobile ? "button-currency-usd-mobile" : "button-currency-usd-nav"}
          onClick={() => onSelect("USD")}
          className={`${
            mobile ? "flex-1 py-2 text-xs" : "px-3 py-1.5 text-xs"
          } rounded-full font-black transition-all ${
            currency === "USD"
              ? "bg-[#0C3156] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
          title="US Dollar (USD)"
        >
          🇺🇸 USD
        </button>
      </div>
    </div>
  );
}

