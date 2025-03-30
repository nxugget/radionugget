"use client";

import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
  as = "h1", // changed default from "div" to "h1"
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
  const [cursorWidth, setCursorWidth] = useState("3px");

  useEffect(() => {
    setHasPlayed(true);
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 768) {
        setCursorWidth("4px"); // Thicker on desktop
      } else {
        setCursorWidth("3px");
      }
    }
  }, []);

  return (
    <Wrapper className={cn("flex items-center space-x-1 my-6", className)} role="heading">
      {hasPlayed && (
        <motion.div
          className="overflow-hidden pb-2"
          initial={{ width: "0%" }}
          animate={{ width: "fit-content" }}
          transition={{ duration: 0.8, ease: "linear", delay: 0.5 }}
        >
          <div
            // Updated: fixed text size for mobile instead of responsive classes
            className="text-4xl font-bold normal-case"
            style={{ whiteSpace: "nowrap", maxWidth: "100%" }}
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
        </motion.div>
      )}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className={cn("block h-[1em] bg-blue-500", cursorClassName)}
        style={{ position: "relative", width: cursorWidth }}
      />
    </Wrapper>
  );
};
