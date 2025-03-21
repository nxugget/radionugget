"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils"; // Import de la fonction cn si nécessaire

interface BlackHoleProps {
  className?: string;
}

export const BlackHole: React.FC<BlackHoleProps> = ({ className }) => {
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scale = viewportHeight / 690;
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
        className="rotate-180 absolute left-0 w-full h-full object-cover"
        style={videoStyle}
      >
        <source src="/videos/blackhole.webm" type="video/webm" />
      </video>
    </div>
  );
};
