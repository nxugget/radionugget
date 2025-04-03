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
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-14 right-0 h-16 w-8 sm:h-20 sm:w-10 flex items-center justify-center 
      bg-purple shadow-2xl transition-all duration-300 transform 
      ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"} 
      hover:bg-orange active:scale-95`}
      style={{
        borderTopLeftRadius: "12px", // Rounded top-left corner
        borderBottomLeftRadius: "12px", // Rounded bottom-left corner
      }}
      aria-label="Retour en haut"
    >
      <svg
        className={`w-4 h-4 sm:w-6 sm:h-6 transition-transform duration-300 ${
          isHovered ? "-translate-y-1" : "translate-y-1"
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
