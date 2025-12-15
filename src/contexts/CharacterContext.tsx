"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import {
  Character,
  PRESET_CHARACTERS,
  DEFAULT_CHARACTER_ID,
  CHARACTER_STORAGE_KEY,
} from "@/utils/characters";

type CharacterContextType = {
  selectedCharacter: Character;
  setSelectedCharacter: (character: Character) => void;
  availableCharacters: Character[];
};

export const CharacterContext = createContext<CharacterContextType | undefined>(
  undefined
);

export type { CharacterContextType };

type CharacterProviderProps = {
  children: ReactNode;
};

function getDefaultCharacter(): Character {
  return (
    PRESET_CHARACTERS.find((c) => c.id === DEFAULT_CHARACTER_ID) ||
    PRESET_CHARACTERS[0]
  );
}

function findCharacterById(id: string): Character | undefined {
  return PRESET_CHARACTERS.find((c) => c.id === id);
}

export function CharacterProvider({ children }: CharacterProviderProps) {
  const [selectedCharacter, setSelectedCharacter] =
    useState<Character>(getDefaultCharacter());

  useEffect(() => {
    try {
      const storedId = localStorage.getItem(CHARACTER_STORAGE_KEY);
      if (storedId) {
        const character = findCharacterById(storedId);
        if (character) {
          setSelectedCharacter(character);
        }
      }
    } catch {
      console.warn("Failed to load character from localStorage");
    }
  }, []);

  const updateCharacter = (character: Character) => {
    setSelectedCharacter(character);
    try {
      localStorage.setItem(CHARACTER_STORAGE_KEY, character.id);
    } catch {
      console.warn("Failed to save character to localStorage");
    }
  };

  const ctx: CharacterContextType = {
    selectedCharacter,
    setSelectedCharacter: updateCharacter,
    availableCharacters: PRESET_CHARACTERS,
  };

  return (
    <CharacterContext.Provider value={ctx}>
      {children}
    </CharacterContext.Provider>
  );
}
