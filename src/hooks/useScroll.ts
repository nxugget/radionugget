// src/hooks/useScroll.ts
import { useState, useEffect } from "react";

export function useScroll() {
  const [scrollPhase, setScrollPhase] = useState(0); // 0: initial, 1: parallax, 2: best-projects
  const [step, setStep] = useState(0); // Animation step for parallax
  const [passed, setPassed] = useState(false); // Animation state for parallax

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault(); // Prevent default page scrolling
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
      // Scroll up (reverse animation)
      if (scrollPhase === 2) {
        setScrollPhase(1); // Begin reverse from best-projects to parallax state
      } else if (scrollPhase === 1) {
        setStep(0);
        setPassed(false);
        setTimeout(() => {
          setScrollPhase(0); // Return to initial state after animation duration
        }, 1500); // Match transition duration in milliseconds
      }
    }
  };

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [scrollPhase]);

  // Gestion du swipe mobile avec touch events
  useEffect(() => {
    let touchStartY: number | null = null;
    let touchHandled = false;
    const threshold = 80; // seuil de swipe vertical

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        touchHandled = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY === null || touchHandled) return;
      const deltaY = touchStartY - e.touches[0].clientY;
      if (Math.abs(deltaY) >= threshold) {
        touchHandled = true;
        if (deltaY > 0) {
          // Swipe up
          if (scrollPhase === 0) {
            setScrollPhase(1);
            setStep(1);
            setPassed(true);
          } else if (scrollPhase === 1) {
            setScrollPhase(2);
          }
        } else {
          // Swipe down
          if (scrollPhase === 2) {
            setScrollPhase(1);
          } else if (scrollPhase === 1) {
            setStep(0);
            setPassed(false);
            setTimeout(() => {
              setScrollPhase(0);
            }, 1500);
          }
        }
      }
      // Empêche le scroll natif pendant toute phase d'animation (scrollPhase !== 0)
      if (scrollPhase !== 0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      touchStartY = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [scrollPhase]);

  return { scrollPhase, step, passed };
}
