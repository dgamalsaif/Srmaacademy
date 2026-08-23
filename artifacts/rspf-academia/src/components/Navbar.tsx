import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { SRMA_LOGO } from "@/components/BrandBackground";
import InstallAppButton from "@/components/InstallAppButton";
import { useLanguage } from "@/lib/i18n";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();
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
          <button type="button" data-testid="button-language-toggle" onClick={toggleLanguage} className="hidden rounded-full border border-[#0C3156]/20 px-3 py-2 text-xs font-black text-[#0C3156] transition hover:bg-[#0C3156] hover:text-white sm:inline-flex" aria-label={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}>
            {t("language.switch")}
          </button>

          {/* Logo */}
          <Link href="/" data-testid="link-logo" className="flex items-center gap-2.5 flex-shrink-0">
            <img src={SRMA_LOGO} alt="SRMA Research Academy" className="h-11 w-11 rounded-full border border-[#0C3156]/15 object-cover shadow-sm" />
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-[#0C3156] tracking-tight">SRMA</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">SRMA Research Academy</span>
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
            <button type="button" data-testid="button-language-toggle-mobile" onClick={() => { toggleLanguage(); setMobileOpen(false); }} className="mb-2 flex w-full items-center justify-center rounded-xl border border-[#0C3156]/20 px-4 py-3 text-sm font-black text-[#0C3156]">
              {t("language.switch")}
            </button>
            <InstallAppButton className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e6f5ef] px-4 py-3 text-sm font-black text-[#117b59]" />
          </div>
        </div>
      )}
    </nav>
  );
}
