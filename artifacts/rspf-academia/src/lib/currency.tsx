import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import type { SiteLanguage } from "@/lib/i18n";

export type OpportunityCurrency = "SAR" | "USD";

export const SAR_PER_USD = 3.75;

export interface CurrencyContextValue {
  currency: OpportunityCurrency;
  setCurrency: (currency: OpportunityCurrency) => void;
  toggleCurrency: () => void;
  convertSarToUsd: (sar: number) => number;
  convertUsdToSar: (usd: number) => number;
  formatMoney: (sarAmount: number, targetCurrency?: OpportunityCurrency, language?: SiteLanguage) => string;
  formatDualMoney: (sarAmount: number, language?: SiteLanguage) => {
    primary: string;
    secondary: string;
    primaryCurrency: OpportunityCurrency;
    secondaryCurrency: OpportunityCurrency;
  };
  rateNotice: string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "srma-currency-choice";

export function formatOpportunityMoney(
  sar: number,
  currency: OpportunityCurrency,
  language: SiteLanguage = "ar"
): string {
  const amount = currency === "USD" ? sar / SAR_PER_USD : sar;
  const hasDecimals = currency === "USD" && amount % 1 !== 0;
  const maximumFractionDigits = hasDecimals ? 2 : 0;

  if (language === "ar") {
    const formattedNum = new Intl.NumberFormat("ar-SA", {
      maximumFractionDigits,
      minimumFractionDigits: maximumFractionDigits,
    }).format(amount);
    return currency === "SAR" ? `${formattedNum} ر.س` : `${formattedNum} $ دولار`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(amount);
}

export function formatDualOpportunityMoney(
  sar: number,
  activeCurrency: OpportunityCurrency,
  language: SiteLanguage = "ar"
) {
  const otherCurrency: OpportunityCurrency = activeCurrency === "SAR" ? "USD" : "SAR";
  const primary = formatOpportunityMoney(sar, activeCurrency, language);
  const secondary = formatOpportunityMoney(sar, otherCurrency, language);

  return {
    primary,
    secondary,
    primaryCurrency: activeCurrency,
    secondaryCurrency: otherCurrency,
  };
}

export function getDiscountPercentage(originalSar: number, discountedSar: number) {
  if (originalSar <= 0 || discountedSar >= originalSar) return 0;
  return ((originalSar - discountedSar) / originalSar) * 100;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, updateCurrency] = useState<OpportunityCurrency>(() => {
    if (typeof window === "undefined") return "SAR";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "USD" ? "USD" : "SAR";
  });

  const setCurrency = (next: OpportunityCurrency) => {
    updateCurrency(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  };

  const toggleCurrency = () => {
    setCurrency(currency === "SAR" ? "USD" : "SAR");
  };

  const convertSarToUsd = (sar: number) => {
    return Math.round((sar / SAR_PER_USD) * 100) / 100;
  };

  const convertUsdToSar = (usd: number) => {
    return Math.round(usd * SAR_PER_USD * 100) / 100;
  };

  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    setCurrency,
    toggleCurrency,
    convertSarToUsd,
    convertUsdToSar,
    formatMoney: (sar, target = currency, lang = "ar") => formatOpportunityMoney(sar, target, lang),
    formatDualMoney: (sar, lang = "ar") => formatDualOpportunityMoney(sar, currency, lang),
    rateNotice: "1 USD = 3.75 SAR (1 دولار أمريكي = 3.75 ريال سعودي)",
  }), [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      currency: "SAR",
      setCurrency: () => {},
      toggleCurrency: () => {},
      convertSarToUsd: (sar: number) => Math.round((sar / SAR_PER_USD) * 100) / 100,
      convertUsdToSar: (usd: number) => Math.round(usd * SAR_PER_USD * 100) / 100,
      formatMoney: (sar: number, target = "SAR", lang = "ar") => formatOpportunityMoney(sar, target, lang),
      formatDualMoney: (sar: number, lang = "ar") => formatDualOpportunityMoney(sar, "SAR", lang),
      rateNotice: "1 USD = 3.75 SAR",
    };
  }
  return context;
}
