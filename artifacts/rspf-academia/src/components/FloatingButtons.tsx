import { useLanguage } from "@/lib/i18n";
import { useSiteContentSettings } from "@/hooks/use-site-content-settings";
import { Facebook, Instagram, Linkedin, Mail, MessageCircle, Music2, Phone, Send, Youtube } from "lucide-react";
import type { SocialIconId } from "@/lib/siteContentSettings";

interface FloatingButtonsProps {
  audience?: "public" | "participant" | "coordinator";
  showTelegram?: boolean;
  showWhatsapp?: boolean;
}

export default function FloatingButtons({
  audience = "public",
  showTelegram = true,
  showWhatsapp = true,
}: FloatingButtonsProps) {
  const { localize } = useLanguage();
  const { data: settings } = useSiteContentSettings();
  const brand = settings.brand;
  const selected = brand[`${audience}SocialIcons`].filter((id) => (id !== "telegram" || showTelegram) && (id !== "whatsapp" || showWhatsapp));
  const position = brand[`${audience}IconPosition`];
  const whatsapp = audience === "participant"
    ? brand.participantWhatsapp || brand.whatsapp
    : audience === "coordinator"
      ? brand.coordinatorWhatsapp || brand.whatsapp
      : brand.whatsapp;
  const telegram = brand.telegramUsername.startsWith("http") ? brand.telegramUsername : `https://t.me/${brand.telegramUsername}`;
  const links: Record<SocialIconId, string> = {
    whatsapp: whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : "",
    telegram: brand.telegramUsername ? telegram : "",
    instagram: brand.instagramUsername ? (brand.instagramUsername.startsWith("http") ? brand.instagramUsername : `https://instagram.com/${brand.instagramUsername}`) : "",
    x: brand.xUsername ? (brand.xUsername.startsWith("http") ? brand.xUsername : `https://x.com/${brand.xUsername}`) : "",
    linkedin: brand.linkedinUsername ? (brand.linkedinUsername.startsWith("http") ? brand.linkedinUsername : `https://linkedin.com/in/${brand.linkedinUsername}`) : "",
    facebook: brand.facebookUrl,
    tiktok: brand.tiktokUrl,
    youtube: brand.youtubeUrl,
    snapchat: brand.snapchatUrl,
    email: brand.email ? `mailto:${brand.email}` : "",
    phone: brand.phone ? `tel:${brand.phone}` : "",
  };
  const icons: Record<SocialIconId, typeof MessageCircle> = {
    whatsapp: MessageCircle, telegram: Send, instagram: Instagram, x: MessageCircle,
    linkedin: Linkedin, facebook: Facebook, tiktok: Music2, youtube: Youtube,
    snapchat: MessageCircle, email: Mail, phone: Phone,
  };
  const labels: Record<SocialIconId, string> = {
    whatsapp: "واتساب", telegram: "تيليجرام", instagram: "إنستجرام", x: "X",
    linkedin: "لينكد إن", facebook: "فيسبوك", tiktok: "تيك توك", youtube: "يوتيوب",
    snapchat: "سناب شات", email: "البريد الإلكتروني", phone: "الهاتف",
  };
  const colors: Record<SocialIconId, string> = {
    whatsapp: "bg-[#25D366]", telegram: "bg-[#229ED9]", instagram: "bg-[#C13584]", x: "bg-black",
    linkedin: "bg-[#0A66C2]", facebook: "bg-[#1877F2]", tiktok: "bg-black", youtube: "bg-[#FF0000]",
    snapchat: "bg-[#FFFC00] text-black", email: "bg-slate-600", phone: "bg-[#117b59]",
  };
  const positionClass = {
    "bottom-left": "bottom-6 left-6",
    "bottom-right": "bottom-6 right-6",
    "middle-left": "top-1/2 left-6 -translate-y-1/2",
    "middle-right": "top-1/2 right-6 -translate-y-1/2",
  }[position];
  const visible = selected.filter((id) => links[id]);
  if (!visible.length) return null;

  return (
    <div className={`fixed ${positionClass} z-50 flex flex-col gap-3`}>
      {visible.map((id) => {
        const Icon = icons[id];
        return <a key={id} href={links[id]} target={id === "email" || id === "phone" ? undefined : "_blank"} rel="noopener noreferrer" data-testid={`button-float-${id}`} className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-110 ${colors[id]}`} title={labels[id]} aria-label={localize(`تواصل عبر ${labels[id]}`, `Contact via ${labels[id]}`)}>
          <Icon className="h-6 w-6" />
        </a>;
      })}
    </div>
  );
}
