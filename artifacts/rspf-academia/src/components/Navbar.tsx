import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { SRMA_LOGO } from "@/components/BrandBackground";
import InstallAppButton from "@/components/InstallAppButton";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/knowledge-center", label: "مركز المعرفة" },
  { href: "/about", label: "عن المنصة" },
  { href: "/participant-portal", label: "بوابة المشارك", highlight: true },
  { href: "/coordinator", label: "بوابة المنسق" },
  { href: "/special-requests", label: "الطلبات الخاصة ⭐" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <InstallAppButton className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e6f5ef] px-4 py-3 text-sm font-black text-[#117b59]" />
          </div>
        </div>
      )}
    </nav>
  );
}
