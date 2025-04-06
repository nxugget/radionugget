"use client";

import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
  as = "h1",
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
  as?: React.ElementType;
}) => {
  const Wrapper = as;
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  const [hasPlayed, setHasPlayed] = useState(false);
  const [cursorWidth, setCursorWidth] = useState("2px");
  const [textScale, setTextScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Set initial state and observe container size
  useEffect(() => {
    // Detect mobile devices
    if (typeof window !== "undefined") {
      const checkIfMobile = window.innerWidth < 768;
      setIsMobile(checkIfMobile);
      
      setCursorWidth(checkIfMobile ? "2px" : "3px");
    }
    
    const timer = setTimeout(() => {
      setHasPlayed(true);
    }, 150);
    
    return () => clearTimeout(timer);
  }, []);

  // Scale text+cursor block to fit container width
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;
    
    const calculateScale = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        
        if (contentWidth > containerWidth - 10) {
          let scale = (containerWidth - 10) / contentWidth;
          const minScale = isMobile ? 0.3 : 0.5;
          setTextScale(Math.max(minScale, scale));
        } else {
          setTextScale(1);
        }
      }
    };

    const resizeObserver = new ResizeObserver(calculateScale);
    resizeObserver.observe(containerRef.current);
    calculateScale(); // Calculate initial scale
    
    return () => resizeObserver.disconnect();
  }, [hasPlayed, isMobile, animationComplete]);

  return (
    <Wrapper 
      ref={containerRef}
      className={cn("flex flex-col items-center my-6 w-full", className)} 
      role="heading"
    >
      <div className="flex justify-center w-full">
        {hasPlayed && (
          <div className="relative flex justify-center w-full">
            {/* Container d'animation avec effet de typewriter de gauche à droite */}
            <motion.div
              className="overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: "auto" }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
              style={{ 
                display: "inline-block",
              }}
              onAnimationComplete={() => setAnimationComplete(true)}
            >
              {/* Bloc de contenu mis à l'échelle */}
              <div 
                ref={contentRef}
                style={{
                  transform: `scale(${textScale})`,
                  transformOrigin: animationComplete ? "center center" : "left center",
                  display: "flex",
                  alignItems: "center",
                  whiteSpace: "nowrap"
                }}
              >
                <div
                  className="font-bold"
                  style={{ 
                    display: "inline-block",
                    fontSize: isMobile ? "1.75rem" : "2rem",
                    lineHeight: "1.2",
                  }}
                >
                  {wordsArray.map((word, idx) => (
                    <div key={`word-${idx}`} className="inline-block">
                      {word.text.map((char, index) => (
                        <span key={`char-${index}`} className={cn("", word.className)}>
                          {char}
                        </span>
                      ))}
                      &nbsp;
                    </div>
                  ))}
                </div>
                
                {/* Le curseur attaché au texte */}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                  className={cn("bg-blue-500", cursorClassName)}
                  style={{ 
                    width: cursorWidth,
                    height: "1.8rem",
                    marginLeft: "2px",
                    display: "inline-block",
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Wrapper>
  );
};
