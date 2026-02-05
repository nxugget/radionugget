import React, { forwardRef } from "react";

interface InputSearchProps {
	placeholder?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onFocus?: () => void; // Ajout de la propriété onFocus
	onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void; // Ajout de la propriété onSubmit
	buttonContent?: React.ReactNode;
	showButton?: boolean; // Propriété pour afficher ou non le bouton
	/**
	 * Permet de passer des classes personalisées pour la largeur (ex: "w-auto") qui remplace "w-full" par défaut.
	 */
	className?: string;
	// Nouvelle prop pour modifier la taille du texte de l'input
	textSize?: string;
}

const defaultIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
	</svg>
);

const InputSearch = forwardRef<HTMLFormElement, InputSearchProps>(
  ({ placeholder, value, onChange, onFocus, onSubmit, buttonContent = defaultIcon, showButton = true, className, textSize = "text-sm" }, ref) => {
    // Utilise la classe passée ou "w-full" par défaut
    const inputWidthClass = className ? className : "w-full";
    return (
      <form ref={ref} onSubmit={onSubmit} className="relative flex items-center">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          aria-label={placeholder || "Search"}
          className={`bg-white/[0.04] border border-white/[0.08] text-white ${textSize} rounded-xl pl-4 ${showButton ? "pr-12" : "pr-4"} py-2.5 ${inputWidthClass} placeholder:text-gray-500 focus:outline-none focus:border-purple/40 focus:ring-1 focus:ring-purple/20 focus:bg-white/[0.06] transition-all duration-300`}
        />
        {showButton && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple hover:bg-purple-300 text-white rounded-lg px-3 py-1.5 transition-all duration-200 hover:shadow-glow-sm"
            aria-label="Search"
          >
            {buttonContent}
          </button>
        )}
      </form>
    );
  }
);
InputSearch.displayName = "InputSearch";
export default InputSearch;
