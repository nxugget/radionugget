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
          onFocus={onFocus} // Ajout de l'événement onFocus
          className={`bg-gray-700 text-white ${textSize} rounded-full pl-4 ${showButton ? "pr-12" : "pr-4"} py-2 ${inputWidthClass} focus:outline-none focus:ring-1 focus:ring-purple focus:ring-opacity-75 transition-colors ease-in-out duration-300`}
        />
        {showButton && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple text-white rounded-full px-3 py-1 transition-colors duration-200 hover:bg-white hover:text-purple"
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
