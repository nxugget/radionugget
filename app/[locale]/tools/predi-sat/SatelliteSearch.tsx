"use client";

import { useState, useMemo, useRef } from "react";
import { useI18n } from "@/locales/client";

interface Satellite {
  name: string;
  id: string;
  category?: string;
  country?: string;
  transmitters?: { mode: string; description?: string }[];
}

interface SatelliteSearchProps {
  satellites: Satellite[];
  selectedSatelliteId: string | null;
  onSelect: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddAll?: (satellites: Satellite[]) => void;
}

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "fmvoice", label: "FM Voice" },
  { key: "weather", label: "Weather" },
];

function isWeatherSatellite(sat: Satellite) {
  const name = sat.name.toLowerCase();
  return name.includes("noaa") || name.includes("meteor");
}

function isFMVoiceSatellite(sat: Satellite) {
  if (!sat.transmitters) return false;
  return sat.transmitters.some((tx) =>
    tx.description && tx.description.toLowerCase().includes("fm voice")
  );
}

export default function SatelliteSearch({
  satellites,
  selectedSatelliteId,
  onSelect,
  favorites,
  onToggleFavorite,
  onAddAll,
}: SatelliteSearchProps) {
  const t = useI18n();
  const [query, setQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [category, setCategory] = useState<"all" | "weather" | "fmvoice">("all");
  const [selectOpen, setSelectOpen] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  const filteredSatellites = useMemo(() => {
    let filtered = satellites;
    if (category === "weather") {
      filtered = filtered.filter(isWeatherSatellite);
    } else if (category === "fmvoice") {
      filtered = filtered.filter(isFMVoiceSatellite);
    }
    return filtered.filter((sat) => {
      const matchesQuery = sat.name.toLowerCase().includes(query.toLowerCase());
      const matchesFavorite = !showFavorites || favorites.includes(sat.id);
      return matchesQuery && matchesFavorite;
    });
  }, [satellites, query, showFavorites, favorites, category]);

  // Gestion ouverture/fermeture du select pour l'animation de la flèche
  const handleSelectFocus = () => setSelectOpen(true);
  const handleSelectBlur = () => setSelectOpen(false);
  const handleSelectClick = () => setSelectOpen((v) => !v);

  return (
    <div className="flex flex-col gap-2 sm:gap-3 glass-light rounded-xl p-3 sm:p-4">
      <div className="flex gap-1 sm:gap-2 items-center">
        {/* Input recherche */}
        <input
          type="text"
          placeholder={t("satellite.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] text-white px-3 sm:px-3 py-1.5 sm:py-2 rounded-lg flex-1 focus:outline-none focus:border-purple/40 focus:ring-1 focus:ring-purple/20 text-xs sm:text-sm placeholder:text-gray-500 transition-all duration-200"
          style={{ minHeight: 36, height: 36 }}
        />
        {/* Liste déroulante catégorie */}
        <div
          className="relative"
          style={{ minWidth: 90, maxWidth: 120, width: "auto" }}
        >
          <select
            ref={selectRef}
            value={category}
            onChange={e => setCategory(e.target.value as any)}
            onFocus={handleSelectFocus}
            onBlur={handleSelectBlur}
            onClick={handleSelectClick}
            className={`
              appearance-none
              bg-white/[0.04]
              border border-white/[0.08]
              text-white
              px-2 sm:px-2
              py-1.5 sm:py-2
              rounded-lg
              focus:outline-none
              focus:border-purple/40
              focus:ring-1
              focus:ring-purple/20
              text-[11px] sm:text-xs
              transition-all
              hover:border-purple/30
              cursor-pointer
              w-full
              font-medium
              shadow-none
              duration-200
              `}
            style={{
              height: 36,
              minHeight: 36,
              maxHeight: 40,
              boxShadow: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none",
              paddingRight: "2.2em",
              backgroundImage: "none",
            }}
          >
            {CATEGORIES.map(cat => (
              <option
                key={cat.key}
                value={cat.key}
                style={{
                  background: "#18181b",
                  color: "#fff",
                  fontWeight: category === cat.key ? "bold" : "normal",
                  fontSize: "12px",
                  padding: "6px 10px",
                }}
                className={category === cat.key ? "bg-purple text-white" : "bg-surface-2 text-white"}
              >
                {cat.label}
              </option>
            ))}
          </select>
          {/* Custom caret avec rotation animée */}
          <span
            className={`pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-white transition-transform duration-200
              ${selectOpen ? "rotate-180" : "rotate-0"}
            `}
            style={{ fontSize: "1em" }}
          >
            ▼
          </span>
        </div>
        {/* Favoris */}
        <button
          onClick={() => setShowFavorites((v) => !v)}
          className={`flex items-center justify-center px-2 py-1.5 rounded-lg font-bold transition-all duration-200 ${
            showFavorites
              ? "bg-orange/20 text-orange border border-orange/30"
              : "bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-orange hover:border-orange/30"
          }`}
          title={t("satellite.filterFavorites")}
          style={{ height: 36, minHeight: 36 }}
        >
          <span className="text-xl">{showFavorites ? "★" : "☆"}</span>
        </button>
        {/* Add all */}
        <button
          onClick={() => onAddAll && onAddAll(filteredSatellites)}
          className="text-xs sm:text-sm font-medium text-gray-400 hover:text-green-400 transition-colors bg-transparent px-1 sm:px-2 py-1.5 rounded-lg"
          style={{ boxShadow: "none", background: "none", height: 36, minHeight: 36 }}
        >
          {t("satellite.addAll")}
        </button>
      </div>
      <div className="grid grid-cols-2 xs:grid-cols-3 gap-1 sm:gap-2 max-h-[120px] sm:max-h-[200px] overflow-y-auto mt-1 mb-0">
        {filteredSatellites.map((sat) => {
          const isSelected = sat.id === selectedSatelliteId;
          const countries = sat.country
            ? sat.country.split(",").map((c) => c.trim().toLowerCase())
            : [];
          return (
            <div
              key={sat.id}
              onClick={() => onSelect(sat.id)}
              className={`group relative cursor-pointer rounded-lg p-2.5 text-sm font-medium transition-all duration-200
                ${
                  isSelected
                    ? "bg-purple/20 text-white border border-purple/30"
                    : "bg-white/[0.03] border border-white/[0.06] text-gray-300 hover:bg-purple/10 hover:border-purple/20 hover:text-white"
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <p className="m-0">{sat.name}</p>
                  {countries.length === 4 ? (
                    <span className="ml-1 grid grid-cols-2 gap-[2px]">
                      {countries.map((code, idx) => (
                        <span
                          key={idx}
                          className="inline-block"
                          style={{
                            width: 24,
                            height: 16,
                            minWidth: 24,
                            minHeight: 16,
                            borderRadius: 3,
                            overflow: "hidden",
                            background: "#27272a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                          }}
                        >
                          <img
                            src={`/images/flags/${code}.png`}
                            alt={`flag of ${code}`}
                            style={{
                              width: "100%",
                              height: "auto",
                              aspectRatio: "3/2",
                              display: "block",
                              borderRadius: 3,
                              background: "#27272a",
                              objectFit: "cover",
                            }}
                          />
                        </span>
                      ))}
                    </span>
                  ) : (
                    countries.map((code, idx) => (
                      <span
                        key={idx}
                        className="inline-block"
                        style={{
                          width: 24,
                          height: 16,
                          minWidth: 24,
                          minHeight: 16,
                          borderRadius: 3,
                          overflow: "hidden",
                          background: "#27272a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                        }}
                      >
                        <img
                          src={`/images/flags/${code}.png`}
                          alt={`flag of ${code}`}
                          style={{
                            width: "100%",
                            height: "auto",
                            aspectRatio: "3/2",
                            display: "block",
                            borderRadius: 3,
                            background: "#27272a",
                            objectFit: "cover",
                          }}
                        />
                      </span>
                    ))
                  )}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(sat.id);
                  }}
                  className={`ml-2 text-base transition-colors duration-300 ${
                    favorites.includes(sat.id) ? "text-orange" : "text-gray-300"
                  } hover:text-orange`}
                  title={t("satellite.addToFavorites")}
                >
                  {favorites.includes(sat.id) ? "★" : "☆"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
