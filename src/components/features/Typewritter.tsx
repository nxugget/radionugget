"use client";

import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    setHasPlayed(true);
  }, []);

  return (
    <div className={cn("flex space-x-1 my-6", className)}>
      {hasPlayed && ( // Empêche l'effet de se rejouer après le scroll
        <motion.div
          className="overflow-hidden pb-2"
          initial={{ width: "0%" }}
          animate={{ width: "fit-content" }} // Remplace `whileInView` par `animate`
          transition={{ duration: 0.8, ease: "linear", delay: 0.5 }}
        >
          <div
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold normal-case"
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
        className={cn("block rounded-sm w-[4px] h-4 sm:h-6 xl:h-12 bg-blue-500", cursorClassName)}
      />
    </div>
  );
};
