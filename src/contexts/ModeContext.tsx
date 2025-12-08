"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";

export type Mode = "translation" | "conversation";

type ModeContextType = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

export const ModeContext = createContext<ModeContextType | undefined>(undefined);

export type { ModeContextType };

type ModeProviderProps = {
  children: ReactNode;
};

const MODE_STORAGE_KEY = "chattr_mode";
const DEFAULT_MODE: Mode = "translation";
const VALID_MODES: readonly Mode[] = ["translation", "conversation"];

function isValidMode(value: string | null): value is Mode {
  return value !== null && (VALID_MODES as readonly string[]).includes(value);
}

export function ModeProvider({ children }: ModeProviderProps) {
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MODE_STORAGE_KEY);
      if (isValidMode(stored)) {
        setMode(stored);
      }
    } catch {
      console.warn("Failed to load mode from localStorage");
    }
  }, []);

  const updateMode = (newMode: Mode) => {
    setMode(newMode);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, newMode);
    } catch {
      console.warn("Failed to save mode to localStorage");
    }
  };

  const ctx: ModeContextType = {
    mode,
    setMode: updateMode,
  };

  return (
    <ModeContext.Provider value={ctx}>
      {children}
    </ModeContext.Provider>
  );
}
