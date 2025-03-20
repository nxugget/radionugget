"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GridSquareInfo() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="w-full flex flex-col items-center relative">
      {/* Bouton interactif avec un effet de scintillement */}
      <button
        onClick={() => setShowInfo(true)}
        className="mb-4 text-white text-lg font-bold relative transition-all duration-300"
      >
        Qu'est-ce qu'une Grid Square ?
      </button>

      {/* Popup (Card) qui apparaît avec une animation smooth */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900 text-white p-6 rounded-lg shadow-xl w-full max-w-lg fixed top-20 left-1/2 transform -translate-x-1/2"
          >
            <p className="text-sm">
              Une Grid Square est un système de coordonnées utilisé par les radioamateurs pour localiser précisément un point sur la Terre.
              Il est basé sur un quadrillage divisé en plusieurs niveaux de précision.
            </p>
            <p className="text-sm mt-2">
              Un Grid Square standard est formé de 4 caractères (ex: JN18). En zoomant, on peut voir des subdivisions plus précises, permettant d'affiner encore plus la localisation.
            </p>
            {/* Bouton pour fermer la popup */}
            <button
              onClick={() => setShowInfo(false)}
              className="mt-4 px-4 py-2 bg-orange hover:bg-purple text-white rounded"
            >
              Fermer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
