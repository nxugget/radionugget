import { useState, useEffect } from "react";

interface TypewriterProps {
  words: { text: string; className?: string }[];
  cursorClassName?: string;
  className?: string;
}

export function TypewriterEffectSmooth({ words, cursorClassName }: TypewriterProps) {
  // ...existing code for gestion du texte à taper...
  return (
    <div className="typewriter-container">
      {/* Texte tapé */}
      <span className="typed-text">
        {/* ...texte tapé... */}
      </span>
      {/* Curseur avec la classe passée */}
      <span className={`${cursorClassName || "text-purple"} ml-1`}>|</span>
    </div>
  );
}
