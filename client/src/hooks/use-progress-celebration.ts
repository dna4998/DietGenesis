import { useState } from "react";
import type { Patient } from "@shared/schema";

export function useProgressCelebration() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<Patient | null>(null);

  const triggerCelebration = (patient: Patient) => {
    setCelebrationData(patient);
    setShowCelebration(true);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
    setCelebrationData(null);
  };

  return {
    showCelebration,
    celebrationData,
    triggerCelebration,
    closeCelebration
  };
}