import { useQuery } from "@tanstack/react-query";
import { SiteContentSettings, DEFAULT_SITE_CONTENT_SETTINGS } from "@/lib/siteContentSettings";

export function useSiteContentSettings() {
  return useQuery<SiteContentSettings>({
    queryKey: ["site-content-settings"],
    queryFn: async () => {
      const response = await fetch("/api/site-content-settings");
      if (!response.ok) {
        throw new Error("Failed to fetch site content settings");
      }
      return response.json();
    },
    initialData: DEFAULT_SITE_CONTENT_SETTINGS,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
