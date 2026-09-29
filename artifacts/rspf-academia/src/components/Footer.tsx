import { Link } from "wouter";
import { Phone, Mail, MessageCircle, Send, Radio, Instagram } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useSiteContentSettings } from "@/hooks/use-site-content-settings";

const QUICK_LINKS = [
  { href: "/about", ar: "عن المنصة", en: "About the platform" },
  { href: "/faq", ar: "الأسئلة الشائعة", en: "Frequently asked questions" },
];

function socialUrl(value: string | undefined, baseUrl: string) {
  if (!value) return "";
  return value.startsWith("https://") ? value : `${baseUrl}${value.replace(/^@/, "")}`;
}

export default function Footer() {
  const { localize, t, language } = useLanguage();
  const { data: settings } = useSiteContentSettings();
  const brand = settings?.brand;
  const siteName = language === "ar" ? brand?.siteNameAr : brand?.siteNameEn;
  const telegramUrl = socialUrl(brand?.telegramUsername, "https://t.me/");
  const instagramUrl = socialUrl(brand?.instagramUsername, "https://instagram.com/");
  const xUrl = socialUrl(brand?.xUsername, "https://x.com/");
  const linkedinUrl = socialUrl(brand?.linkedinUsername, "https://www.linkedin.com/in/");

  // Configurable primary contact link driven by brand.contactUsType / brand.contactUsValue
  const contactType = brand?.contactUsType; // 'whatsapp' | 'telegram' | 'email' | 'phone' | 'custom_url'
  const rawContactValue = brand?.contactUsValue || "";
  const contactValue = String(rawContactValue || "").trim();
  const contactLabel = localize(brand?.contactUsLabelAr || "", brand?.contactUsLabelEn || "") ||
    (contactType === "telegram" ? t("common.telegram") : contactType === "email" ? "Email" : t("common.whatsapp"));

  const contactHref = (() => {
    if (!contactType || !contactValue) return "";
    switch (contactType) {
      case "whatsapp":
        return `https://wa.me/${contactValue.replace(/^\+/, "")}`;
      case "telegram":
        return contactValue.startsWith("https://") ? contactValue : `https://t.me/${contactValue.replace(/^@/, "")}`;
      case "email":
        return `mailto:${contactValue}`;
      case "phone":
        return `tel:${contactValue}`;
      case "custom_url":
        return contactValue;
      default:
        return contactValue;
    }
  })();

  const ContactIcon = contactType === "telegram" ? Send : contactType === "email" ? Mail : contactType === "phone" ? Phone : MessageCircle;

  return (
    <footer className="bg-[#0C3156] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-5 text-[#E9A020]">{t("footer.contact")}</h3>
            <div className="space-y-3">
              {/* Configurable primary contact link (WhatsApp / Telegram / Email / Phone / Custom URL) */}
              {contactHref ? (
                <a
                  href={contactHref}
                  target={contactHref.startsWith("mailto:") || contactHref.startsWith("tel:") ? undefined : "_blank"}
                  rel={contactHref.startsWith("mailto:") || contactHref.startsWith("tel:") ? undefined : "noopener noreferrer"}
                  data-testid="link-footer-contact-us"
                  className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors"
                >
                  <ContactIcon size={15} />
                  <span>
                    {contactLabel} {contactType === "whatsapp" && contactValue ? `+${contactValue.replace(/^\+/, "")}` : contactType === "email" || contactType === "phone" ? contactValue : ""}
                  </span>
                </a>
              ) : null}

              {/* Existing contact fallbacks / additional links */}
              {brand?.phone && (
                <a
                  href={`tel:${brand.phone}`}
                  data-testid="link-footer-phone"
                  className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors"
                >
                  <Phone size={15} />
                  {brand.phone}
                </a>
              )}

              <a
                href={`https://wa.me/${brand?.whatsapp || "966562159258"}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-footer-whatsapp"
                className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors"
              >
                <MessageCircle size={15} />
                {brand?.whatsapp ? `+${brand.whatsapp.replace(/^\+/, "")}` : "+966 56 215 9258"}
              </a>

              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-footer-telegram-supervisor"
                  className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors"
                >
                  <Send size={15} />
                  {t("common.telegram")}
                </a>
              )}

              {brand?.whatsappChannelUrl && (
                <a
                  href={brand.whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-footer-telegram-channel"
                  className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors"
                >
                  <Radio size={15} />
                  {localize("قناة WhatsApp", "WhatsApp Channel")}
                </a>
              )}

              {brand?.email && (
                <a
                  href={`mailto:${brand.email}`}
                  className="flex items-center gap-2 text-sm text-blue-200 transition-colors hover:text-white"
                >
                  <Mail size={15} />
                  {brand.email}
                </a>
              )}

              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-200 transition-colors hover:text-white">
                  <Instagram size={15} />Instagram
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-5 text-[#E9A020]">{t("footer.quickLinks")}</h3>
            <div className="flex flex-col gap-2">
              {QUICK_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="text-sm text-blue-200 hover:text-white transition-colors">
                  {language === "ar" ? l.ar : l.en}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-5 text-[#E9A020]">{siteName}</h3>
            <p className="text-sm text-blue-200 max-w-xs">{t("footer.tagline")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
