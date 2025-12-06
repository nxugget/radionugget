// src/hooks/useScroll.ts
import { useState, useEffect, useRef } from "react";

export function useScroll() {
  const [scrollPhase, setScrollPhase] = useState(0); 
  const [step, setStep] = useState(0); 
  const [passed, setPassed] = useState(false); 
  const scrollLocked = useRef(false); 

  const lockScroll = () => {
    scrollLocked.current = true;
    setTimeout(() => {
      scrollLocked.current = false;
    }, 900); 
  };

  const handleWheel = (event: WheelEvent) => {
    if (scrollLocked.current) return;
    event.preventDefault(); // Prevent default page scrolling
    if (event.deltaY > 0) {
      // Scroll down
      if (scrollPhase === 0) {
        setScrollPhase(1); // Trigger parallax animation
        setStep(1);
        setPassed(true);
        lockScroll();
      } else if (scrollPhase === 1) {
        setScrollPhase(3); 
        lockScroll();
      }
    } else if (event.deltaY < 0) {
      if (scrollPhase === 3) {
        setScrollPhase(1);
        setStep(1);
        setPassed(true);
        lockScroll();
      } else if (scrollPhase === 1) {
        setStep(0);
        setPassed(false);
        lockScroll();
        setTimeout(() => {
          setScrollPhase(0); 
        }, 800); 
      }
    }
  };

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [scrollPhase]);

  useEffect(() => {
    let touchStartY: number | null = null;
    let touchHandled = false;
    let touchDeltaY = 0;
    let hasMoved = false;
    const threshold = 80; // seuil de swipe vertical

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        touchHandled = false;
        touchDeltaY = 0;
        hasMoved = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY === null || touchHandled) return;
      touchDeltaY = touchStartY - e.touches[0].clientY;
      // Dès qu'il y a un mouvement vertical, on bloque le scroll natif
      if (!hasMoved && Math.abs(touchDeltaY) > 2) {
        hasMoved = true;
      }
      if (hasMoved || scrollPhase !== 0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchHandled || touchStartY === null || scrollLocked.current) return;
      if (Math.abs(touchDeltaY) >= threshold) {
        touchHandled = true;
        if (touchDeltaY > 0) {
          // Swipe up
          if (scrollPhase === 0) {
            setScrollPhase(1);
            setStep(1);
            setPassed(true);
            lockScroll();
          } else if (scrollPhase === 1) {
            setScrollPhase(3);
            lockScroll();
          }
        } else {
          // Swipe down
          if (scrollPhase === 3) {
            setScrollPhase(1);
            setStep(1);
            setPassed(true);
            lockScroll();
          } else if (scrollPhase === 1) {
            setStep(0);
            setPassed(false);
            lockScroll();
            setTimeout(() => {
              setScrollPhase(0);
            }, 800);
          }
        }
      }
      touchStartY = null;
      touchDeltaY = 0;
      hasMoved = false;
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

  const triggerScrollDown = () => {
    if (scrollLocked.current) return;
    if (scrollPhase === 0) {
      setScrollPhase(1);
      setStep(1);
      setPassed(true);
      lockScroll();
    } else if (scrollPhase === 1) {
      setScrollPhase(3);
      lockScroll();
    }
  };

  return { scrollPhase, step, passed, triggerScrollDown };
}
