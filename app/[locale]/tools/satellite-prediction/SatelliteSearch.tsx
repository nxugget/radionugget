"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/locales/client"; // Ajout de l'import i18n

interface Satellite {
  name: string;
  id: string;
  category?: string;
}

interface SatelliteSearchProps {
  satellites: Satellite[];
  selectedSatelliteId: string | null;
  onSelect: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddAll?: (satellites: Satellite[]) => void; // Nouvelle prop pour ajouter tous les satellites filtrés
}

export default function SatelliteSearch({
  satellites,
  selectedSatelliteId,
  onSelect,
  favorites,
  onToggleFavorite,
  onAddAll,
}: SatelliteSearchProps) {
  const t = useI18n(); // Initialisation du système de traduction
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Filtrage par nom et par catégorie ou par favori
  const filteredSatellites = useMemo(() => {
    return satellites.filter((sat) => {
      const matchesQuery = sat.name.toLowerCase().includes(query.toLowerCase());
      if (activeFilter === "all") return matchesQuery;
      if (activeFilter === "favorite")
        return matchesQuery && favorites.includes(sat.id);
      return matchesQuery && sat.category === activeFilter;
    });
  }, [satellites, query, activeFilter, favorites]);

  // Fonction pour ajouter tous les satellites filtrés
  const handleAddAll = () => {
    if (onAddAll) {
      onAddAll(filteredSatellites);
    }
  };

  // Helper function to get filter name for display
  const getFilterDisplayName = (filter: string) => {
    if (filter === "all") return "";
    if (filter === "weather") return t("satellite.filterWeather");
    if (filter === "amateur") return t("satellite.filterAmateur");
    if (filter === "favorite") return t("satellite.filterFavorites");
    return "";
  };

  return (
    <div className="flex flex-col">
      {/* Barre de recherche avec bouton Add All */}
      <div className="flex mb-3 items-center">
        <input
          type="text"
          placeholder={t("satellite.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400
                     focus:ring-2 focus:ring-purple outline-none duration-300
                     placeholder:text-zinc-600 placeholder:opacity-50
                     rounded-full px-4 py-2 shadow-md focus:shadow-lg flex-grow"
        />
      </div>
      
      <div className="flex justify-between items-center mb-3">
        {/* Boutons de filtre */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-md text-white font-bold ${
              activeFilter === "all" ? "bg-purple" : "bg-gray-900 hover:bg-purple"
            }`}
          >
            {t("satellite.filterAll")}
          </button>
          <button
            onClick={() => setActiveFilter("weather")}
            className={`px-4 py-2 rounded-md text-white font-bold ${
              activeFilter === "weather"
                ? "bg-purple"
                : "bg-gray-900 hover:bg-purple"
            }`}
          >
            {t("satellite.filterWeather")}
          </button>
          <button
            onClick={() => setActiveFilter("amateur")}
            className={`px-4 py-2 rounded-md text-white font-bold ${
              activeFilter === "amateur"
                ? "bg-purple"
                : "bg-gray-900 hover:bg-purple"
            }`}
          >
            {t("satellite.filterAmateur")}
          </button>
          <button
            onClick={() => setActiveFilter("favorite")}
            className={`px-4 py-2 rounded-md text-white font-bold ${
              activeFilter === "favorite"
                ? "bg-purple"
                : "bg-gray-900 hover:bg-purple"
            }`}
          >
            {t("satellite.filterFavorites")}
          </button>
        </div>
        
        {/* Fixed Add All button */}
        <button
          onClick={handleAddAll}
          className="text-sm font-bold text-white hover:text-purple transition-colors"
        >
          {t("satellite.addAll")} {activeFilter !== "all" && getFilterDisplayName(activeFilter)}
        </button>
      </div>

      {/* Liste des satellites filtrés */}
      <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto mt-3">
        {filteredSatellites.map((sat) => {
          const isSelected = sat.id === selectedSatelliteId;
          return (
            <div
              key={sat.id}
              onClick={() => onSelect(sat.id)}
              className={`group relative cursor-pointer rounded-md p-3 text-sm font-medium
                ${
                  isSelected
                    ? "bg-purple text-white"
                    : "bg-zinc-700 text-white hover:bg-purple hover:text-white"
                }`}
            >
              <p>{sat.name}</p>
              {sat.category && (
                <p
                  className={`text-xs ${
                    isSelected
                      ? "text-white"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                >
                  {sat.category}
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(sat.id);
                }}
                className={`absolute top-2 right-2 text-xl transition-colors duration-300 ${
                  favorites.includes(sat.id) ? "text-orange" : "text-gray-300"
                } hover:text-orange`}
                title={t("satellite.addToFavorites")}
              >
                {favorites.includes(sat.id) ? "★" : "☆"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
