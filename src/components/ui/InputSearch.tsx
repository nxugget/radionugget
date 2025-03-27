import React, { forwardRef, FormEvent } from "react";

interface InputSearchProps {
	placeholder?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (e: FormEvent<HTMLFormElement>) => void;
	buttonContent?: React.ReactNode;
	/**
	 * Permet de passer des classes personalisées pour la largeur (ex: "w-auto") qui remplace "w-full" par défaut.
	 */
	className?: string;
}

const defaultIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
	</svg>
);

const InputSearch = forwardRef<HTMLFormElement, InputSearchProps>(
  ({ placeholder, value, onChange, onSubmit, buttonContent = defaultIcon, className }, ref) => {
    // Utilise la classe passée ou "w-full" par défaut
    const inputWidthClass = className ? className : "w-full";
    return (
      <form ref={ref} onSubmit={onSubmit} className="relative flex items-center">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          // Suppression de "focus:bg-gray-700" pour éviter le flash ; passage à "transition-colors" uniquement
          className={`bg-gray-700 text-white rounded-full pl-4 pr-12 py-2 ${inputWidthClass} focus:outline-none focus:ring-1 focus:ring-purple focus:ring-opacity-75 transition-colors ease-in-out duration-300`}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple text-white rounded-full px-3 py-1 transition-colors duration-200 hover:bg-white hover:text-purple"
        >
          {buttonContent}
        </button>
      </form>
    );
  }
);
InputSearch.displayName = "InputSearch";
export default InputSearch;
