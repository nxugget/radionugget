"use client";

import { useEffect, useState } from "react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button
      onClick={() => {
        if (navigator.vibrate) navigator.vibrate(50);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-16 right-4 h-10 w-10 flex items-center justify-center 
      bg-surface-2/80 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-card transition-all duration-500 ease-expo-out
      ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"} 
      hover:border-purple/30 hover:shadow-glow-sm active:scale-95`}
      aria-label="Retour en haut"
    >
      <svg
        className={`w-4 h-4 text-gray-400 transition-all duration-300 ${
          isHovered ? "-translate-y-0.5 text-purple" : ""
        }`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="white"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;
