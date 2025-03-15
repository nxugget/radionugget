"use client"; // 👈 Indique que c'est un Client Component

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
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-14 right-20 w-20 h-20 flex items-center justify-center 
      rounded-full bg-purple shadow-2xl transition-all duration-300 transform 
      ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"} 
      hover:bg-orange active:scale-90`}
      aria-label="Retour en haut"
    >
      {/* Flèche SVG propre et animée */}
      <svg
        className={`w-10 h-10 transition-transform duration-300 ${
          isHovered ? "translate-y-1" : "-translate-y-1"
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
