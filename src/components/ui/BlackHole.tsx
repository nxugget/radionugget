"use client";
import React, { useState, useEffect } from "react";

export const BlackHole = () => {
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scale = viewportHeight / 720;
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
    <div className="fixed left-0 w-full -z-20" style={containerStyle}>
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
