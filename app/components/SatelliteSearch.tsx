// SatelliteSearch.tsx

"use client";

import { useState, useMemo } from "react";

interface Satellite {
  name: string;
  id: string;
  category?: string;
}

interface SatelliteSearchProps {
  satellites: Satellite[];
  onSelect: (sat: Satellite) => void;
  onAddAll: (sats: Satellite[]) => void;
}

export default function SatelliteSearch({
  satellites,
  onSelect,
  onAddAll,
}: SatelliteSearchProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredSatellites = useMemo(() => {
    return satellites.filter((sat) => {
      const matchesQuery = sat.name.toLowerCase().includes(query.toLowerCase());
      if (activeFilter === "all") {
        return matchesQuery;
      }
      return matchesQuery && sat.category === activeFilter;
    });
  }, [satellites, query, activeFilter]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <input
          type="text"
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400 focus:ring-2 focus:ring-purple outline-none duration-300 placeholder:text-zinc-600 placeholder:opacity-50 rounded-full px-4 py-2 shadow-md focus:shadow-lg w-full"
        />
        <button
          onClick={() => onAddAll(filteredSatellites)}
          className="px-4 py-2 text-sm font-medium rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Add All
        </button>
      </div>

      <div className="mt-1 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeFilter === "all"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-purple-200"
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setActiveFilter("weather")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeFilter === "weather"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-purple-200"
          }`}
        >
          Weather
        </button>
        <button
          onClick={() => setActiveFilter("amateur")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeFilter === "amateur"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-purple-200"
          }`}
        >
          Amateur
        </button>
      </div>

      <div className="max-h-[300px] overflow-y-auto mt-3 flex flex-col gap-2">
        {filteredSatellites.map((sat) => (
          <div
            key={sat.id}
            onClick={() => onSelect(sat)}
            className="bg-zinc-700 text-white rounded-full p-3 text-sm font-medium cursor-pointer hover:bg-purple-600 transition-colors duration-200 ease-in-out"
          >
            <p>{sat.name}</p>
            <p className="text-xs text-gray-300">{sat.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
