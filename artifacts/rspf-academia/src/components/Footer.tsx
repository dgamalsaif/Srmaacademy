import { Link } from "wouter";
import { AtSign, Instagram, Linkedin, Mail, Phone, Radio, Send } from "lucide-react";
import { SRMA_LOGO } from "@/components/BrandBackground";
import InstallAppButton from "@/components/InstallAppButton";
import { useLanguage } from "@/lib/i18n";
import { useSiteContentSettings } from "@/hooks/use-site-content-settings";

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
  const { localize, t, language } = useLanguage();
  const { data: settings } = useSiteContentSettings();
  const brand = settings?.brand;
  const siteName = language === "ar" ? brand?.siteNameAr : brand?.siteNameEn;
  const linkedinUrl = brand?.linkedinUsername?.startsWith("https://")
    ? brand.linkedinUsername
    : `https://www.linkedin.com/in/${brand?.linkedinUsername || ""}`;

  return (
    <footer className="bg-[#0C3156] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-5 text-[#E9A020]">{t("footer.contact")}</h3>
            <div className="space-y-3">
              <a
                href={`https://wa.me/${settings?.brand.whatsapp || "966562159258"}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-footer-phone"
                className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors"
              >
                <Phone size={15} />
                {settings?.brand.whatsapp ? `+${settings.brand.whatsapp}` : "+966 56 215 9258"}
              </a>
              <a
                href={`https://t.me/${settings?.brand.telegramUsername || "SRMAAcademy"}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-footer-telegram-supervisor"
                className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors"
              >
                <Send size={15} />
                @{settings?.brand.telegramUsername || "SRMAAcademy"} ({t("common.telegram")})
              </a>
              {brand?.whatsappChannelUrl && <a
                href={brand.whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-footer-telegram-channel"
                className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors"
              >
                <Radio size={15} />
                {localize("قناة WhatsApp", "WhatsApp Channel")}
              </a>}
              {brand?.email && <a href={`mailto:${brand.email}`} className="flex items-center gap-2 text-sm text-blue-200 transition-colors hover:text-white"><Mail size={15} />{brand.email}</a>}
              {brand?.instagramUsername && <a href={`https://instagram.com/${brand.instagramUsername}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-200 transition-colors hover:text-white"><Instagram size={15} />@{brand.instagramUsername}</a>}
              {brand?.xUsername && <a href={`https://x.com/${brand.xUsername}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-200 transition-colors hover:text-white"><AtSign size={15} />@{brand.xUsername}</a>}
              {brand?.linkedinUsername && <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-200 transition-colors hover:text-white"><Linkedin size={15} />{brand.linkedinUsername}</a>}
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
                  <img src={settings?.brand.logoUrl || SRMA_LOGO} alt={language === "ar" ? settings?.brand.siteNameAr : settings?.brand.siteNameEn} className="h-14 w-14 rounded-full border border-white/20 object-cover shadow-lg bg-white" />
                  <div>
                    <span className="block max-w-56 truncate text-2xl font-black tracking-tight text-white">{siteName || "SRMA"}</span>
                    <span className="mt-0.5 block text-[10px] font-medium tracking-widest text-blue-200">{language === "ar" ? settings?.brand.siteNameAr : settings?.brand.siteNameEn}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-blue-200 text-sm text-right leading-relaxed">
              {localize("المنصة الأكاديمية الأولى في المملكة للبحث العلمي الطبي — نرافقك من الفكرة حتى النشر في أرقى المجلات الدولية", "The Kingdom's leading academic platform for medical research — supporting you from idea to publication in leading international journals.")}
            </p>
            <a
              href={`https://t.me/${settings?.brand.telegramUsername || "SRMAAcademy"}`}
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
           <p className="text-blue-300 text-xs">© {siteName || "SRMA"} {new Date().getFullYear()}. {localize("جميع الحقوق محفوظة.", "All rights reserved.")}</p>
           <p className="text-blue-300 text-xs">{siteName || "SRMA"}</p>
        </div>
      </div>
    </footer>
  );
}
