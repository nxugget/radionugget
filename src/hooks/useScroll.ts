// src/hooks/useScroll.ts
import { useState, useEffect } from "react";

export function useScroll() {
  const [scrollPhase, setScrollPhase] = useState(0); // 0: initial, 1: parallax, 2: best-projects
  const [step, setStep] = useState(0); // Animation step for parallax
  const [passed, setPassed] = useState(false); // Animation state for parallax

  const handleWheel = (event: WheelEvent) => {
    if (event.deltaY > 0) {
      // Scroll down
      if (scrollPhase === 0) {
        setScrollPhase(1); // Trigger parallax animation
        setStep(1);
        setPassed(true);
      } else if (scrollPhase === 1) {
        setScrollPhase(2); // Move to best-projects
      }
    } else if (event.deltaY < 0) {
      // Scroll up
      if (scrollPhase === 2) {
        setScrollPhase(0); // Return to initial state
        setStep(0);
        setPassed(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [scrollPhase]);

  return { scrollPhase, step, passed };
}
