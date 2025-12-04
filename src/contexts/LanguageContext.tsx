"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [targetLanguage, setTargetLanguageState] = useState<TargetLanguageCode>(
    DEFAULT_TARGET_LANGUAGE
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && VALID_LANGUAGE_CODES.has(stored)) {
        setTargetLanguageState(stored as TargetLanguageCode);
      }
    } catch (error) {
      // localStorage might be blocked or unavailable
      console.warn("Failed to load language from localStorage:", error);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when language changes
  const setTargetLanguage = (code: TargetLanguageCode) => {
    setTargetLanguageState(code);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch (error) {
      // localStorage might be blocked or unavailable
      console.warn("Failed to save language to localStorage:", error);
    }
  };

  const value: LanguageContextType = {
    targetLanguage,
    setTargetLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
  };

  // Don't render children until initial load from localStorage is complete
  // to prevent flash of wrong language
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook for using the language context
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
