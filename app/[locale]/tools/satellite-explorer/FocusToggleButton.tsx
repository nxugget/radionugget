"use client";

import React from 'react';

interface FocusToggleButtonProps {
  isFocused: boolean;
  onToggle: () => void;
  className?: string;
}

const FocusToggleButton: React.FC<FocusToggleButtonProps> = ({ 
  isFocused, 
  onToggle,
  className = ''
}) => {
  return (
    <button
      onClick={onToggle}
      className={`
        px-4 py-1 rounded-full 
        ${isFocused ? 'bg-white text-black opacity-60 hover:opacity-100' : 'bg-purple text-white'} 
        font-medium transition-all duration-200
        flex items-center gap-1
        ${className}
      `}
      aria-label={isFocused ? "Exit focus mode" : "Enter focus mode"}
    >
      {isFocused ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Exit Focus
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
          Focus Mode
        </>
      )}
    </button>
  );
};

export default FocusToggleButton;
