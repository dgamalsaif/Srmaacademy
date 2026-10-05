import type { BrandContactSettings, ForwardingType } from "./siteContentSettings";

/** Explicit forwarding targets take precedence, including an intentionally empty target. */
export function getRegistrationForwarding(brand: Partial<BrandContactSettings> | null, coordinator = false) {
  if (!brand) return { type: "none" as ForwardingType, target: "", customMessage: "", autoRedirect: false };
  const target = coordinator ? brand.coordinatorForwardTarget : brand.participantForwardTarget;
  const legacyTarget = coordinator ? brand.coordinatorWhatsapp : brand.participantWhatsapp;
  const type = (coordinator ? brand.coordinatorForwardType : brand.participantForwardType) || "whatsapp";
  let destination = typeof target === "string" ? target.trim() : (legacyTarget || brand.whatsapp || "").trim();
  if (type === "whatsapp") {
    destination = destination.replace(/\D/g, "").replace(/^00/, "");
    if (/^05\d{8}$/.test(destination)) destination = `966${destination.slice(1)}`;
  }
  return {
    type,
    target: destination,
    customMessage: (coordinator ? brand.coordinatorCustomMessage : brand.participantCustomMessage) || "",
    autoRedirect: !!(coordinator ? brand.coordinatorAutoRedirect : brand.participantAutoRedirect),
  };
}

/** A saved registration is not undone when fetching current communication settings fails. */
export async function loadLatestForwardingBrand(fetcher: typeof fetch = fetch): Promise<BrandContactSettings | null> {
  try {
    const response = await fetcher("/api/site-content-settings", { cache: "no-store", credentials: "include", signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;
    const settings = await response.json();
    return settings?.brand && typeof settings.brand === "object" && !Array.isArray(settings.brand) ? settings.brand : null;
  } catch {
    return null;
  }
}