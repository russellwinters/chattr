"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import {
  TargetLanguageCode,
  LanguageOption,
  SUPPORTED_LANGUAGES,
  DEFAULT_TARGET_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  VALID_LANGUAGE_CODES,
} from "@/utils/languages";

type LanguageContextType = {
  targetLanguage: TargetLanguageCode;
  setTargetLanguage: (code: TargetLanguageCode) => void;
  availableLanguages: readonly LanguageOption[];
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export type { LanguageContextType };

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [targetLanguage, setTargetLanguageState] = useState<TargetLanguageCode>(
    DEFAULT_TARGET_LANGUAGE
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && VALID_LANGUAGE_CODES.has(stored)) {
        setTargetLanguageState(stored as TargetLanguageCode);
      }
    } catch {
      console.warn("Failed to load language from localStorage");
    }
  }, []);

  const setTargetLanguage = (code: TargetLanguageCode) => {
    setTargetLanguageState(code);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      console.warn("Failed to save language to localStorage");
    }
  };

  const ctx: LanguageContextType = {
    targetLanguage,
    setTargetLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={ctx}>
      {children}
    </LanguageContext.Provider>
  );
}
