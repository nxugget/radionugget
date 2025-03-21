"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GridSquareInfo() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="w-full flex flex-col items-center relative">
      {/* Bouton interactif avec effet hover texte violet */}
      <button
        onClick={() => setShowInfo(true)}
        className="mb-4 text-white text-lg font-bold relative transition-all duration-300 hover:text-[#b400ff]"
      >
        Qu'est-ce qu'une Grid Square ?
      </button>

      <AnimatePresence>
        {showInfo && (
          <>
            {/* Backdrop: close modal on click outside */}
            <div
              onClick={() => setShowInfo(false)}
              className="fixed inset-0 z-40 bg-black/50"
            ></div>
            <motion.div
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-black text-white p-6 rounded-lg shadow-xl w-full max-w-lg fixed top-32 left-1/2 transform -translate-x-1/2 z-50"
            >
              {/* Petite croix purple en haut à droite */}
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-2 right-2 text-[#b400ff] hover:text-orange transition-colors duration-200 text-lg font-bold"
              >
                ✕
              </button>
              <p className="text-sm">
                Une Grid Square est un système de coordonnées utilisé par les radioamateurs pour localiser précisément un point sur la Terre.
              </p>
              <p className="text-sm mt-2">
                Plutôt que de donner des coordonnées GPS précises comme 37°14'3.60" N -115°48'23.99" W, on va juste dire DM27bf. C'est quand même plus pratique :)
              </p>
              <p className="text-sm mt-2">
                Les grid squares divisent le globe en 324 grands champs (10° par 20°), chacun subdivisé en 100 carrés. Les deux lettres supplémentaires affinent ta position en découpant chaque carré en sous-carrés.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
