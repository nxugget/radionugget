"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/locales/client";  // new import for translations

export default function GridSquareInfo() {
  const t = useI18n(); // new: using translation function
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="w-full flex flex-col items-center relative">
      {/* Bouton interactif amélioré avec icône et style visuel - animation plus discrète */}
      <button
        onClick={() => setShowInfo(true)}
        className="mb-4 flex items-center gap-2 px-4 py-2 bg-purple/8 hover:bg-purple/15 rounded-xl border border-purple/20 text-gray-300 hover:text-white text-sm font-medium transition-all duration-300"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-5 h-5 text-[#b400ff]"
        >
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
        {t("gridSquareInfo.question")}
      </button>

      <AnimatePresence>
        {showInfo && (
          <>
            {/* Backdrop to close modal on outside click */}
            <div
              onClick={() => setShowInfo(false)}
              className="fixed inset-0 z-[999] bg-black/50"
            ></div>
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-surface-2 border border-white/[0.06] text-white p-6 rounded-2xl shadow-float w-[90vw] max-w-lg sm:w-[80vw] sm:max-w-md md:w-[60vw] md:max-w-lg absolute top-full mt-4 left-[3%] sm:left-[43%] transform sm:-translate-x-1/2 z-[1000] h-auto sm:h-[70vh] md:h-auto overflow-y-auto backdrop-blur-xl"
            >
              {/* Close button */}
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-2 right-2 text-[#b400ff] hover:text-orange transition-colors duration-200 text-lg font-bold"
              >
                ✕
              </button>
              <p className="text-sm">
                {t("gridSquareInfo.description1")}
              </p>
              <p className="text-sm mt-2">
                {t("gridSquareInfo.description2")}
              </p>
              <p className="text-sm mt-2">
                {t("gridSquareInfo.description3")}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
