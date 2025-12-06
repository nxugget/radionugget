// src/hooks/useScroll.ts
import { useState, useEffect, useRef } from "react";

export function useScroll() {
  const [scrollPhase, setScrollPhase] = useState(0); 
  const [step, setStep] = useState(0); 
  const [passed, setPassed] = useState(false); 
  const scrollLocked = useRef(false); 
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches
    );
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const touch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(touch);
  }, []);

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
    if (isTouchDevice) return;
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [scrollPhase, isTouchDevice]);

  useEffect(() => {
    // Touch logic needed on mobile to trigger phases but must not block native scroll
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

    const handleTouchMove = (_e: TouchEvent) => {
      if (touchStartY === null || touchHandled) return;
      touchDeltaY = touchStartY - _e.touches[0].clientY;
      if (!hasMoved && Math.abs(touchDeltaY) > 2) {
        hasMoved = true;
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
    if (isTouchDevice) {
      // Mobile: mimic desktop behavior with phases
      if (scrollPhase === 0) {
        setScrollPhase(1);
        setStep(1);
        setPassed(true);
      } else if (scrollPhase === 1) {
        setScrollPhase(3);
        const projectsSection = document.getElementById("projects-section");
        if (projectsSection) {
          projectsSection.scrollIntoView({ behavior: "smooth" });
        }
      }
      return;
    }
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

  return { scrollPhase, step, passed, triggerScrollDown, isTouchDevice };
}
