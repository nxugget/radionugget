"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/locales/client";

interface Satellite {
  name: string;
  id: string;
  category?: string;
  country?: string;
}

interface SatelliteSearchProps {
  satellites: Satellite[];
  selectedSatelliteId: string | null;
  onSelect: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddAll?: (satellites: Satellite[]) => void;
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

  const filteredSatellites = useMemo(() => {
    return satellites.filter((sat) => {
      const matchesQuery = sat.name.toLowerCase().includes(query.toLowerCase());
      const matchesFavorite = !showFavorites || favorites.includes(sat.id);
      return matchesQuery && matchesFavorite;
    });
  }, [satellites, query, showFavorites, favorites]);

  return (
    <div className="flex flex-col gap-3 bg-nottooblack p-4 rounded-md">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder={t("satellite.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-zinc-700 text-white px-4 py-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-purple"
        />
        <button
          onClick={() => setShowFavorites((v) => !v)}
          className={`ml-2 flex items-center justify-center px-3 py-2 rounded-md font-bold transition-colors duration-200 ${
            showFavorites
              ? "bg-orange text-black"
              : "bg-zinc-800 text-white hover:bg-orange hover:text-black"
          }`}
          title={t("satellite.filterFavorites")}
        >
          <span className="text-xl">{showFavorites ? "★" : "☆"}</span>
        </button>
        <button
          onClick={() => onAddAll && onAddAll(filteredSatellites)}
          className="ml-2 text-sm font-bold text-white hover:text-orange transition-colors bg-transparent px-2 py-1 rounded-md"
          style={{ boxShadow: "none", background: "none" }}
        >
          {t("satellite.addAll")}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto mt-1">
        {filteredSatellites.map((sat) => {
          const isSelected = sat.id === selectedSatelliteId;
          const countries = sat.country
            ? sat.country.split(",").map((c) => c.trim().toLowerCase())
            : [];
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
