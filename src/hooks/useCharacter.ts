import { useContext } from "react";
import {
  CharacterContext,
  CharacterContextType,
} from "@/contexts/CharacterContext";

export function useCharacter(): CharacterContextType {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }
  return context;
}
