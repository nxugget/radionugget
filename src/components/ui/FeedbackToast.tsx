"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface SuccessFeedbackProps {
  show: boolean;
  message?: string;
  duration?: number;
  onComplete?: () => void;
}

export function SuccessFeedback({
  show,
  message = "✓ Succès!",
  duration = 2000,
  onComplete,
}: SuccessFeedbackProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          onAnimationComplete={() => {
            setTimeout(() => {
              onComplete?.();
            }, duration);
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-green-600/20 border border-green-500/50 rounded-lg backdrop-blur-sm">
            <motion.div
              className="flex items-center justify-center w-5 h-5"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
            <span className="text-sm font-medium text-green-300">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export interface ErrorFeedbackProps {
  show: boolean;
  message?: string;
  duration?: number;
  onComplete?: () => void;
}

export function ErrorFeedback({
  show,
  message = "✕ Erreur",
  duration = 3000,
  onComplete,
}: ErrorFeedbackProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-6 right-6 z-50"
          onAnimationComplete={() => {
            setTimeout(() => {
              onComplete?.();
            }, duration);
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-red-600/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
            <motion.div
              className="flex items-center justify-center w-5 h-5"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <svg
                className="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
            <span className="text-sm font-medium text-red-300">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
