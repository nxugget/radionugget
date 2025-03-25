"use client";

import { useState, useEffect, useRef } from "react";
import { getGridSquare, getGridSquareCoords } from "@/src/lib/gridSquare";
import { TypewriterEffectSmooth } from "@/src/components/features/Typewritter";
import dynamic from "next/dynamic";
import GridSquareInfo from "./GridSquareInfo";
import { useI18n } from "@/locales/client"; // useScopedI18n retiré

// Import dynamique du composant Map
const Map = dynamic(() => import("./GridSquareMap"), { ssr: false });

export default function GridSquareCalculator() {
  const t = useI18n(); // traduction globale

  const [query, setQuery] = useState("");
  const [gridSquare, setGridSquare] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ lat: 0, lon: 0, grid: "" });
  const [copied, setCopied] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [utcTime, setUtcTime] = useState<Date | null>(null); // Fix hydration error
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]);
  const [mapZoom, setMapZoom] = useState(3); // ajout de l'état pour le zoom
  const [directSearch, setDirectSearch] = useState(""); // nouvel état pour la recherche directe
  const [directSearchError, setDirectSearchError] = useState<string | null>(null);

  // Ajout d'un ref pour le conteneur de recherche
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!hasLoaded) {
      setHasLoaded(true);
    }
  }, [hasLoaded]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUtcTime(new Date()); // Update UTC time dynamically
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Débounce réduit à 300ms et suppression conditionnelle des suggestions
  useEffect(() => {
    if (!suppressSuggestions && query.length > 2) {
      const timeout = setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`)
          .then((response) => response.json())
          .then((data) => setSuggestions(data))
          .catch(() => setSuggestions([]));
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setSuggestions([]);
    }
  }, [query, suppressSuggestions]);

  // Ajout d'un event listener pour masquer les suggestions lorsqu'on clique en dehors du conteneur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-dismiss des erreurs après 5 secondes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (directSearchError) {
      const timer = setTimeout(() => setDirectSearchError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [directSearchError]);

  const fetchCoordinates = async (address: string) => {
    setLoading(true);
    setError(null);
    setGridSquare(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();

      if (data.length === 0) {
        throw new Error("Not found");
      }

      const { lat, lon } = data[0];
      const square = getGridSquare(parseFloat(lat), parseFloat(lon));
      setGridSquare(square);

      setMapCenter([parseFloat(lat), parseFloat(lon)]);
      setMapZoom(13);
    } catch (err) {
      setError(t("notFound")); // fallback retiré
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.display_name);
    setSuggestions([]);
    setSuppressSuggestions(true);
  };

  const handleCopy = () => {
    if (gridSquare) {
      navigator.clipboard.writeText(gridSquare);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDirectSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[A-Za-z]{2}(\d{2}([A-Za-z]{2})?)?$/.test(directSearch)) {
      setDirectSearchError(t("notFound")); // fallback retiré
      return;
    }
    try {
      const coords = getGridSquareCoords(directSearch);
      setMapCenter([coords.lat, coords.lon]);
      setMapZoom(13);
    } catch (error) {
      setDirectSearchError(t("notFound")); // fallback retiré
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-3 sm:px-4">
      <div className="w-full max-w-full sm:max-w-[600px] lg:max-w-[800px] mx-auto mb-4">
        <div className="bg-black/50 rounded-lg p-6 shadow-lg">
          <div className="w-full flex justify-center">
            {hasLoaded && (
              <TypewriterEffectSmooth
                words={[
                  { text: "Grid", className: "text-[#b400ff]" },
                  { text: "Square", className: "text-[#b400ff]" },
                  { text: t("gridSquareCalculator.calculator"), className: "text-white" }
                ]}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-2" // increased text size for mobile
                cursorClassName="bg-[#b400ff]"
              />
            )}
          </div>

          <GridSquareInfo />

          <form
            ref={searchRef} // Ajout du ref pour surveiller les clics externes
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim() !== "") {
                fetchCoordinates(query);
                setSuggestions([]);
              }
            }}
            className="flex items-center my-2 w-full max-w-sm mx-auto relative" // Ajout de relative
          >
            <div className="w-full relative">
              <input
                className="bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400 focus:ring-2 focus:ring-purple outline-none duration-300 placeholder:text-zinc-600 placeholder:opacity-50 rounded-full px-4 py-2 shadow-md w-full pr-12"
                autoComplete="off"
                placeholder={t("address.placeholder")} // fallback retiré
                name="text"
                type="text"
                value={query}
                onFocus={() => setSuppressSuggestions(false)} // Affiche les suggestions quand l'input est focus
                onChange={(e) => {
                  setSuppressSuggestions(false);
                  setQuery(e.target.value);
                }}
              />
              {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 bg-black/70 text-white rounded-md shadow-md max-h-60 overflow-y-auto z-10">
                  {suggestions.map((sugg, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 cursor-pointer transition-colors duration-200 hover:text-purple-500"
                      onClick={() => handleSuggestionClick(sugg)}
                    >
                      {sugg.display_name}
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="submit"
                className="absolute top-1/2 right-2 transform -translate-y-1/2 rounded-full bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400 px-3 py-1 shadow-md duration-150 active:scale-95"
              >
                🔍
              </button>
            </div>
          </form>

          <p className="text-zinc-400 text-xs md:text-sm text-center">
            {t("address.example")} {/* traduction de l'exemple */}
          </p>

          {gridSquare && (
            <div className="bg-gray-800 text-white font-mono px-4 py-2 rounded-md shadow-lg mt-4 flex justify-between items-center w-full max-w-sm mx-auto">
              <span className="font-bold text-white">
                Grid Square: <span className="text-orange">{gridSquare}</span>
              </span>
              <button
                onClick={handleCopy}
                className="text-white bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded-md text-sm transition"
              >
                {copied ? "✅" : "📋"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-full sm:max-w-[600px] lg:max-w-[1600px] mb-0">
        {/* Header Banner */}
        {/* Mobile Header */}
        <div className="block sm:hidden w-full bg-gray-900 text-white py-2 px-4 rounded-t-md shadow-md mb-2">
          {/* Row 1: Search Form */}
          <div className="w-full mb-2">
            <form onSubmit={handleDirectSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder={t("gridSquare.directSearchPlaceholder")}
                value={directSearch}
                onChange={(e) => setDirectSearch(e.target.value)}
                className="bg-gray-700 text-white rounded-full pl-4 pr-12 py-2 w-full focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple hover:bg-orange text-white rounded-full px-3 py-1 transition-colors duration-200"
              >
                Go
              </button>
            </form>
          </div>
          {/* Row 2: Coordinates */}
          <div className="w-full text-center mb-2">
            <span className="font-bold">Latitude: </span>
            <span className="text-purple">{mousePosition.lat.toFixed(4)}</span>
            <span className="mx-2 font-bold">Longitude: </span>
            <span className="text-purple">{mousePosition.lon.toFixed(4)}</span>
          </div>
          {/* Row 3: Grid Square */}
          <div className="w-full text-center mb-2">
            <span className="font-bold">Grid Square: </span>
            <span className="text-orange">{mousePosition.grid}</span>
          </div>
          {/* Row 4: UTC Time aligned right and lowered */}
          <div className="w-full text-right mt-1">
            <span className="text-gray-400 text-xs">
              UTC Time: {utcTime ? utcTime.toISOString().split("T")[1].split(".")[0] : "Loading..."}
            </span>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:flex w-full bg-gray-900 text-white py-2 px-4 rounded-t-md shadow-md mb-2 items-center justify-between">
          {/* Search Form */}
          <div className="w-1/3 relative">
            <form onSubmit={handleDirectSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder={t("gridSquare.directSearchPlaceholder")}
                value={directSearch}
                onChange={(e) => setDirectSearch(e.target.value)}
                className="bg-gray-700 text-white rounded-full pl-4 pr-12 py-2 w-full focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple hover:bg-orange text-white rounded-full px-3 py-1 transition-colors duration-200"
              >
                Go
              </button>
            </form>
          </div>
          {/* Coordinates & Grid Square */}
          <div className="w-1/3 flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <span className="font-bold">Latitude:</span>
              <span className="text-purple ml-1">{mousePosition.lat.toFixed(4)}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold">Longitude:</span>
              <span className="text-purple ml-1">{mousePosition.lon.toFixed(4)}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold">Grid Square:</span>
              <span className="text-orange ml-1">{mousePosition.grid}</span>
            </div>
          </div>
          {/* UTC Time aligned right and lowered */}
          <div className="w-1/3 text-right flex flex-col items-end">
            <div className="mt-auto">
              <span className="text-gray-400 text-base">
                UTC Time: {utcTime ? utcTime.toISOString().split("T")[1].split(".")[0] : "Loading..."}
              </span>
            </div>
          </div>
        </div>

        {/* Map placed immediately after with increased mobile height */}
        <Map center={mapCenter} zoom={mapZoom} setMousePosition={setMousePosition} className="h-[50vh] sm:h-[calc(70vh-4rem)] w-full rounded-lg" />
      </div>
    </div>
  );
}
