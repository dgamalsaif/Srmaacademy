import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { useSiteContentSettings } from "@/hooks/use-site-content-settings";

export default function SiteIdentitySync() {
  const { language } = useLanguage();
  const { data: settings } = useSiteContentSettings();

  useEffect(() => {
    if (!settings) return;
    const { brand } = settings;
    const siteName = language === "ar" ? brand.siteNameAr : brand.siteNameEn;
    document.title = siteName;

    const manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (manifest) {
      const version = encodeURIComponent([brand.appNameAr, brand.appNameEn, brand.appShortName, brand.appIconUrl, brand.appThemeColor].join("|"));
      manifest.href = `/api/pwa-manifest?v=${version}`;
    }
    const icon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (icon) icon.href = brand.appIconUrl || brand.logoUrl;
    const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (theme) theme.content = brand.appThemeColor;
  }, [language, settings]);

  return null;
}