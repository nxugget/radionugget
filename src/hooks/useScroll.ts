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

  // Add touch support for touchpads/mobile devices with a flag to prevent multiple triggers
  useEffect(() => {
    let pointerStartY: number | null = null;
    let pointerHandled = false;
    const threshold = 150; // Increased threshold for a deliberate swipe

    const handlePointerDown = (e: PointerEvent) => {
      pointerStartY = e.clientY;
      pointerHandled = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (pointerStartY === null || pointerHandled) return;
      const deltaY = pointerStartY - e.clientY;
      if (Math.abs(deltaY) >= threshold) {
        pointerHandled = true;
        if (deltaY > 0) {
          // Swipe up: scroll down logic
          if (scrollPhase === 0) {
            setScrollPhase(1);
            setStep(1);
            setPassed(true);
          } else if (scrollPhase === 1) {
            setScrollPhase(2);
          }
        } else {
          // Swipe down: scroll up logic
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
    };

    const handlePointerUp = () => {
      pointerStartY = null;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [scrollPhase]);

  return { scrollPhase, step, passed };
}
