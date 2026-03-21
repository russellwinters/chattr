"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import {
  TargetLanguageCode,
  LanguageOption,
  SUPPORTED_LANGUAGES,
  DEFAULT_TARGET_LANGUAGE,
  DEFAULT_NATIVE_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  NATIVE_LANGUAGE_STORAGE_KEY,
  VALID_LANGUAGE_CODES,
} from "@/utils/languages";

type LanguageContextType = {
  targetLanguage: TargetLanguageCode;
  setTargetLanguage: (code: TargetLanguageCode) => void;
  nativeLanguage: TargetLanguageCode;
  setNativeLanguage: (code: TargetLanguageCode) => void;
  availableLanguages: readonly LanguageOption[];
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export type { LanguageContextType };

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguageCode>(
    DEFAULT_TARGET_LANGUAGE
  );
  const [nativeLanguage, setNativeLanguage] = useState<TargetLanguageCode>(
    DEFAULT_NATIVE_LANGUAGE
  );

  useEffect(() => {
    try {
      const storedTarget = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedTarget && VALID_LANGUAGE_CODES.has(storedTarget)) {
        setTargetLanguage(storedTarget as TargetLanguageCode);
      }
      const storedNative = localStorage.getItem(NATIVE_LANGUAGE_STORAGE_KEY);
      if (storedNative && VALID_LANGUAGE_CODES.has(storedNative)) {
        setNativeLanguage(storedNative as TargetLanguageCode);
      }
    } catch {
      console.warn("Failed to load language from localStorage");
    }
  }, []);

  const updateTargetLanguage = (code: TargetLanguageCode) => {
    setTargetLanguage(code);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      console.warn("Failed to save language to localStorage");
    }
  };

  const updateNativeLanguage = (code: TargetLanguageCode) => {
    setNativeLanguage(code);
    try {
      localStorage.setItem(NATIVE_LANGUAGE_STORAGE_KEY, code);
    } catch {
      console.warn("Failed to save native language to localStorage");
    }
  };

  const ctx: LanguageContextType = {
    targetLanguage,
    setTargetLanguage: updateTargetLanguage,
    nativeLanguage,
    setNativeLanguage: updateNativeLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={ctx}>
      {children}
    </LanguageContext.Provider>
  );
}
