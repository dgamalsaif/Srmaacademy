import { Link } from "wouter";
import { Phone, Send, Radio } from "lucide-react";
import { SRMA_LOGO } from "@/components/BrandBackground";
import InstallAppButton from "@/components/InstallAppButton";
import { useLanguage } from "@/lib/i18n";

const quickLinks = [
  { href: "/", ar: "الرئيسية", en: "Home" },
  { href: "/participant-portal", ar: "بوابة المشارك", en: "Participant Portal" },
  { href: "/coordinator", ar: "بوابة المنسق", en: "Coordinator Portal" },
  { href: "/special-requests", ar: "الطلبات الخاصة", en: "Special Requests" },
  { href: "/knowledge-center", ar: "مركز المعرفة", en: "Knowledge Center" },
  { href: "/about", ar: "عن المنصة", en: "About the platform" },
  { href: "/faq", ar: "الأسئلة الشائعة", en: "Frequently asked questions" },
];

export default function Footer() {
  const { localize, t } = useLanguage();

  return (
    <footer className="bg-[#0C3156] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-5 text-[#E9A020]">{t("footer.contact")}</h3>
            <div className="space-y-3">
              <a
                href="https://wa.me/966562159258"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-footer-phone"
                className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors"
              >
                <Phone size={15} />
                +966 56 215 9258
              </a>
              <a
                href="https://t.me/SRMAAcademy"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-footer-telegram-supervisor"
                className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors"
              >
                <Send size={15} />
                @SRMAAcademy ({t("common.telegram")})
              </a>
              <a
                href="https://whatsapp.com/channel/0029Vb7QxGE1iUxikfgEFJ0I"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-footer-telegram-channel"
                className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors"
              >
                <Radio size={15} />
                {localize("قناة WhatsApp", "WhatsApp Channel")}
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-bold mb-5 text-[#E9A020]">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    data-testid={`link-footer-${link.href.replace("/", "") || "home"}`}
                    className="text-blue-200 hover:text-white text-sm transition-colors"
                  >
                    {localize(link.ar, link.en)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logo & tagline */}
          <div className="flex flex-col items-end gap-5">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-3">
                  <img src={SRMA_LOGO} alt="SRMA Research Academy" className="h-14 w-14 rounded-full border border-white/20 object-cover shadow-lg" />
                  <div>
                    <span className="block text-2xl font-black text-white tracking-tight">SRMA</span>
                    <span className="mt-0.5 block text-[10px] font-medium tracking-widest text-blue-200">RESEARCH ACADEMY</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-blue-200 text-sm text-right leading-relaxed">
              {localize("المنصة الأكاديمية الأولى في المملكة للبحث العلمي الطبي — نرافقك من الفكرة حتى النشر في أرقى المجلات الدولية", "The Kingdom's leading academic platform for medical research — supporting you from idea to publication in leading international journals.")}
            </p>
            <a
              href="https://t.me/SRMAAcademy"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-footer-telegram-channel"
              className="flex items-center gap-2 border border-[#E9A020]/60 text-[#E9A020] px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#E9A020]/10 transition-colors"
            >
              <Send size={14} />
              {t("footer.telegram")}
            </a>
            <InstallAppButton className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#0C3156] transition hover:bg-blue-50" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-2">
          <p className="text-blue-300 text-xs">{localize("© SRMA Research Academy 2026. جميع الحقوق محفوظة.", "© SRMA Research Academy 2026. All rights reserved.")}</p>
          <p className="text-blue-300 text-xs">SRMA Research Academy</p>
        </div>
      </div>
    </footer>
  );
}
