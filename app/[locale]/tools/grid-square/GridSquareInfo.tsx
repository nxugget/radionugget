"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/locales/client";  // new import for translations

export default function GridSquareInfo() {
  const t = useI18n(); // new: using translation function
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="w-full flex flex-col items-center relative">
      {/* Interactive button using translated label */}
      <button
        onClick={() => setShowInfo(true)}
        className="mb-4 text-white text-lg font-bold relative transition-all duration-300 hover:text-[#b400ff]"
      >
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
              className="bg-black text-white p-6 rounded-lg shadow-xl w-[90vw] max-w-lg sm:w-[80vw] sm:max-w-md md:w-[60vw] md:max-w-lg absolute top-full mt-4 left-[3%] sm:left-[43%] transform sm:-translate-x-1/2 z-[1000] h-auto sm:h-[70vh] md:h-auto overflow-y-auto"
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
