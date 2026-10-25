"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Locale, Direction } from "@/types/common";
import { en, Translations } from "./translations/en";
import { ar } from "./translations/ar";

interface I18nContextType {
  locale: Locale;
  direction: Direction;
  setLocale: (loc: Locale) => void;
  toggleLocale: () => void;
  t: Translations;
  isRtl: boolean;
}

const dictionaries: Record<Locale, Translations> = {
  en,
  ar,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read user preference from localStorage or navigator
    const saved = localStorage.getItem("hospitalos_locale") as Locale | null;
    if (saved === "ar" || saved === "en") {
      setLocaleState(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    const dir: Direction = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
    localStorage.setItem("hospitalos_locale", locale);
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const toggleLocale = () => {
    setLocaleState((prev) => (prev === "en" ? "ar" : "en"));
  };

  const direction: Direction = locale === "ar" ? "rtl" : "ltr";
  const isRtl = direction === "rtl";
  const t = dictionaries[locale] || en;

  return (
    <I18nContext.Provider
      value={{
        locale,
        direction,
        setLocale,
        toggleLocale,
        t,
        isRtl,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback for isolated SSR or tests
    return {
      locale: "en",
      direction: "ltr",
      setLocale: () => {},
      toggleLocale: () => {},
      t: en,
      isRtl: false,
    };
  }
  return context;
}
