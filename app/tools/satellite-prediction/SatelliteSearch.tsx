"use client";

import { useState, useMemo } from "react";

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
}

export default function SatelliteSearch({
  satellites,
  selectedSatelliteId,
  onSelect,
  favorites,
  onToggleFavorite,
}: SatelliteSearchProps) {
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

  return (
    <div className="flex flex-col">
      {/* Barre de recherche */}
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <input
          type="text"
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400
                     focus:ring-2 focus:ring-purple outline-none duration-300
                     placeholder:text-zinc-600 placeholder:opacity-50
                     rounded-full px-4 py-2 shadow-md focus:shadow-lg w-full"
        />
      </div>

      {/* Boutons de filtre */}
      <div className="mt-1 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-md text-white font-bold ${
            activeFilter === "all" ? "bg-purple" : "bg-gray-900 hover:bg-purple"
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setActiveFilter("weather")}
          className={`px-4 py-2 rounded-md text-white font-bold ${
            activeFilter === "weather"
              ? "bg-purple"
              : "bg-gray-900 hover:bg-purple"
          }`}
        >
          Weather
        </button>
        <button
          onClick={() => setActiveFilter("amateur")}
          className={`px-4 py-2 rounded-md text-white font-bold ${
            activeFilter === "amateur"
              ? "bg-purple"
              : "bg-gray-900 hover:bg-purple"
          }`}
        >
          Amateur
        </button>
        <button
          onClick={() => setActiveFilter("favorite")}
          className={`px-4 py-2 rounded-md text-white font-bold ${
            activeFilter === "favorite"
              ? "bg-purple"
              : "bg-gray-900 hover:bg-purple"
          }`}
        >
          Favoris
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
                    ? "bg-orange text-black"
                    : "bg-zinc-700 text-white hover:bg-orange hover:text-black"
                }`}
            >
              <p>{sat.name}</p>
              {sat.category && (
                <p
                  className={`text-xs ${
                    isSelected
                      ? "text-black"
                      : "text-gray-300 group-hover:text-black"
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
                  favorites.includes(sat.id) ? "text-purple" : "text-gray-300"
                } hover:text-black`}
                title="Ajouter aux favoris"
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
