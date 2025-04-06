"use client";

import { useState, useRef, useEffect } from "react";

interface NavIndicatorProps {
  containerRef: React.RefObject<HTMLElement>;
  className?: string;
  paddingX?: number; // Padding horizontal en pixels
}

export const NavIndicator = ({ containerRef, className = "", paddingX = 24 }: NavIndicatorProps) => {
  const [style, setStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0
  });

  const updateIndicator = (target: HTMLElement) => {
    if (!containerRef.current) return;

    const rect = target.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Calcul précis de la position relative au conteneur
    const offsetLeft = rect.left - containerRect.left;

    // Ajout d'un padding autour du texte pour que l'indicateur soit plus grand
    setStyle({
      left: offsetLeft - paddingX / 2,
      width: rect.width + paddingX,
      opacity: 1
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON') {
        updateIndicator(target);
      }
    };

    const handleMouseLeave = () => {
      setStyle(prev => ({ ...prev, opacity: 0 }));
    };

    container.addEventListener('mouseover', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseover', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef]);

  return (
    <div 
      className={`absolute h-[85%] bg-purple-900/30 backdrop-blur-sm rounded-full transition-all duration-300 ease-out ${className}`}
      style={{
        left: `${style.left}px`,
        width: `${style.width}px`,
        opacity: style.opacity,
        top: '50%',
        transform: 'translateY(-50%)'
      }}
    />
  );
};
