"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";

interface BlackHoleProps {
  className?: string;
}

export const BlackHole: React.FC<BlackHoleProps> = ({ className }) => {
  // 1. Même valeur côté serveur et premier rendu client
  const [viewportHeight, setViewportHeight] = useState(800);

  useEffect(() => {
    // 2. On met à jour uniquement côté client après le montage
    const updateHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    updateHeight(); // première mise à jour
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const scale = viewportHeight / 700;
  const containerOffset = 150 * scale;
  const videoOffset = 250 * scale;

  const containerStyle = {
    top: `-${containerOffset}px`,
    height: `${viewportHeight + containerOffset}px`,
  };

  const videoStyle = {
    top: `-${videoOffset}px`,
  };

  return (
    <div
      className={cn("fixed left-0 w-full -z-20", className)}
      style={containerStyle}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="rotate-180 absolute left-0 w-full h-full object-cover"
        style={videoStyle}
      >
        <source src="/videos/blackhole.webm" type="video/webm" />
      </video>
    </div>
  );
};
