import { useContext } from "react";
import { ModeContext, ModeContextType } from "@/contexts/ModeContext";

export function useMode(): ModeContextType {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
