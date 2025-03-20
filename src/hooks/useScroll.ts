// src/hooks/useScroll.ts
import { useState, useEffect } from "react";

export function useScroll() {
  const [scrollPhase, setScrollPhase] = useState(0);  // Gère les phases de scroll (0: initial, 1: transition)
  const [step, setStep] = useState(0);                // Gère l'étape de SpaceExplore
  const [passed, setPassed] = useState(false);        // Gère les transitions d'animation
  
  // Fonction qui gère l'événement de scroll
  const handleWheel = (event: WheelEvent) => {
    if (event.deltaY > 100) {  // Si on fait défiler vers le bas
      if (scrollPhase === 0) {
        setScrollPhase(1); // Passer à la phase de transition et déclencher l'animation
      } else if (scrollPhase === 1) {
        setScrollPhase(2); // Passer à la phase suivante pour afficher "BestProjects"
      }
    } else if (event.deltaY < -100) {  // Si on fait défiler vers le haut
      if (scrollPhase === 2) {
        setScrollPhase(1);  // Retourner à la phase 1 (SpaceExplore)
      } else if (scrollPhase === 1) {
        setScrollPhase(0);  // Retour à l'état initial
      }
    }

    // Logique pour l'animation dans SpaceExplore
    if (event.deltaY > 0 && step === 0) {
      setStep(1);  // Passer à l'étape 1 de l'animation
      setPassed(true);  // Activer l'animation
    } else if (event.deltaY < 0 && step === 1) {
      setStep(0);  // Retourner à l'étape initiale
      setPassed(false);
    }
  };

  // Ajouter l'écouteur d'événements lors du montage et nettoyage lors du démontage
  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [scrollPhase, step]);

  return { scrollPhase, step, passed };
}
