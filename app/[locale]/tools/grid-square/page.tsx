"use client";

import { useState, useEffect, useRef } from "react";
import { getGridSquare, getGridSquareCoords } from "@/src/lib/gridSquare";
import dynamic from "next/dynamic";
import GridSquareInfo from "./GridSquareInfo";
import { useI18n } from "@/locales/client";
import InputSearch from "@/src/components/ui/InputSearch";
import LocationButton from "@/src/components/features/LocationButton";
import { isValidGridSquare } from "@/src/lib/checkGridSquare";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";

// Import dynamique du composant Map
const Map = dynamic(() => import("./GridSquareMap"), { ssr: false, loading: () => <SkeletonLoader type="card" /> });

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
  const [locationLoading, setLocationLoading] = useState(false); // État pour le chargement de la localisation

  // Ajout d'un ref pour le conteneur de recherche
  const searchRef = useRef<HTMLDivElement>(null);

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
    setGridSquare(null); // Réinitialiser le grid square avant la recherche

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();

      if (data.length === 0) {
        throw new Error("Not found");
      }

      const { lat, lon } = data[0];
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);
      const square = getGridSquare(parsedLat, parsedLon);
      setGridSquare(square); // Update the grid square without changing map center yet

      setMapCenter([parsedLat, parsedLon]);
      setMapZoom(13);
    } catch (err) {
      setError(t("notFound"));
    } finally {
      setLoading(false);
    }
  };

  // Nouvelle fonction pour obtenir l'adresse à partir des coordonnées
  const fetchAddressFromCoordinates = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setQuery(data.display_name);
        setSuppressSuggestions(true);
        return data.display_name;
      }
      return null;
    } catch (err) {
      console.error("Error fetching address:", err);
      return null;
    }
  };

  // Fonction pour utiliser la position actuelle
  const useCurrentLocation = () => {
    setLocationLoading(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Mettre à jour le grid square
        const square = getGridSquare(latitude, longitude);
        handleGridSquareChange(square);
        
        // Mettre à jour la carte
        setMapCenter([latitude, longitude]);
        setMapZoom(13);
        
        // Récupérer l'adresse correspondante
        await fetchAddressFromCoordinates(latitude, longitude);
        setLocationLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(t("locationError"));
        setLocationLoading(false);
      }
    );
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
    if (!isValidGridSquare(directSearch)) { // Use isValidGridSquare instead of regex
      setDirectSearchError(t("gridSquare.invalid"));
      return;
    }
    try {
      const coords = getGridSquareCoords(directSearch);
      setMapCenter([coords.lat, coords.lon]);
      setMapZoom(13);
      handleGridSquareChange(directSearch); // Mettre à jour le grid square
    } catch (error) {
      setDirectSearchError(t("gridSquare.invalid"));
    }
  };

  const handleGridSquareChange = (newGridSquare: string) => {
    setGridSquare(newGridSquare);
    try {
      const coords = getGridSquareCoords(newGridSquare);
      setMapCenter([coords.lat, coords.lon]);
      setMapZoom(13);
    } catch {
      console.error("Gridsquare invalide.");
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-start min-h-screen">
        <div
          className="
            w-full
            max-w-full
            sm:max-w-[1400px]
            glass-card
            rounded-2xl
            mt-2
            mb-4
            px-2
            py-3
            sm:px-6
            sm:py-6
            mx-1
          "
        >
          <div className="w-full flex justify-center sm:mb-1">
            {hasLoaded && (
              <h1 className="text-lg xs:text-xl md:text-3xl font-bold text-center overflow-hidden">
                <span className="text-gradient-purple">Grid Square</span>
                {" "}
                <span className="text-gray-200">{t("gridSquareCalculator.calculator")}</span>
              </h1>
            )}
          </div>

          <GridSquareInfo />
          <div ref={searchRef} className="relative flex justify-center w-full my-2">
            <div className="flex items-center gap-2 w-full max-w-sm mx-auto">
              <div className="relative flex-1">
                <InputSearch
                  placeholder={t("address.placeholder")}
                  value={query}
                  onChange={(e) => {
                    setSuppressSuggestions(false);
                    setQuery(e.target.value);
                  }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (query.trim() !== "") {
                      fetchCoordinates(query);
                      setSuggestions([]);
                    }
                  }}
                />
                {/* Correction: minHeight appliqué seulement quand suggestions visibles */}
                {suggestions.length > 0 && (
                  <ul
                    className="absolute left-0 right-0 bg-surface-2/95 backdrop-blur-2xl border border-white/[0.06] text-white rounded-xl shadow-float max-h-60 overflow-y-auto z-[1000] mt-1"
                    style={{ minHeight: 180 }}
                  >
                    {suggestions.map((sugg, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-3 cursor-pointer border-b border-white/[0.04] last:border-none transition-colors duration-200 hover:text-purple hover:bg-white/[0.03] text-sm"
                        onClick={() => handleSuggestionClick(sugg)}
                      >
                        {sugg.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <span className="text-white font-bold">{t("or")}</span>
              
              <LocationButton 
                onClick={useCurrentLocation}
                loading={locationLoading}
                title={t("useMyLocation")}
                size={40}
              />
            </div>
          </div>

          <p className="text-gray-500 text-xs md:text-sm text-center">
            {t("address.example")}
          </p>

          {error && (
            <div className="text-red-400 py-2 mt-2 text-center text-sm">
              {error}
            </div>
          )}

          <div style={{ minHeight: 56 }}> {/* Réserve l'espace pour le résultat Grid Square */}
            {gridSquare && (
              <div className="glass-light rounded-xl font-mono px-4 py-3 mt-4 flex justify-between items-center w-full max-w-sm mx-auto">
                <span className="font-semibold text-gray-200 text-sm">
                  Grid Square: <span className="text-orange font-bold">{gridSquare}</span>
                </span>
                <button
                  onClick={handleCopy}
                  className="text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] px-2.5 py-1 rounded-lg text-sm transition-all duration-200"
                >
                  {copied ? "✅" : "📋"}
                </button>
              </div>
            )}
          </div>
          
          {/* Map intégrée dans la div principale */}
          <div className="w-full mt-6">
            <Map center={mapCenter} zoom={mapZoom} setMousePosition={setMousePosition} className="h-[50vh] sm:h-[calc(70vh-4rem)] w-full rounded-xl border border-white/[0.06]" />
            {/* Nouvelle bannière pour la vue desktop sur une seule ligne */}
            <div className="hidden sm:flex w-full glass-light rounded-b-xl py-3 px-5 mt-0 items-center justify-between text-sm">
              <div className="flex-shrink-0 mr-4">
                <InputSearch
                  placeholder={t("gridSquare.directSearchPlaceholder")}
                  value={directSearch}
                  onChange={(e) => setDirectSearch(e.target.value)}
                  onSubmit={handleDirectSearchSubmit}
                  className="w-auto min-w-[250px]" // increased minimum width from 200px to 250px
                />
                <div className="text-center">
                  {directSearchError && (
                    <span className="text-red-500 text-sm mt-1 block">
                      {directSearchError}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-4 items-center">
                <div>
                  <span className="font-bold">Latitude:</span> <span className="text-purple">{mousePosition.lat.toFixed(4)}</span>
                </div>
                <div>
                  <span className="font-bold">Longitude:</span> <span className="text-purple">{mousePosition.lon.toFixed(4)}</span>
                </div>
                <div>
                  <span className="font-bold">Grid Square:</span> <span className="text-orange">{mousePosition.grid}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400 text-base">
                  UTC Time: {utcTime ? utcTime.toISOString().split("T")[1].split(".")[0] : "Loading..."}
                </span>
              </div>
            </div>
            {/* Pour la vue mobile, garder l'ancienne bannière si nécessaire */}
            <div className="block sm:hidden w-full glass-light rounded-b-xl py-3 px-4 mt-0 text-sm">
              <div className="w-full mb-2">
                <InputSearch
                  placeholder={t("gridSquare.directSearchPlaceholder")}
                  value={directSearch}
                  onChange={(e) => setDirectSearch(e.target.value)}
                  onSubmit={handleDirectSearchSubmit}
                />
                <div className="text-center">
                  {directSearchError && (
                    <span className="text-red-500 text-sm mt-1 block">
                      {directSearchError}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full text-center mb-2 flex flex-wrap justify-center gap-2">
                <div>
                  <span className="font-bold">Latitude: </span>
                  <span className="text-purple">{mousePosition.lat.toFixed(4)}</span>
                </div>
                <div>
                  <span className="font-bold">Longitude: </span>
                  <span className="text-purple">{mousePosition.lon.toFixed(4)}</span>
                </div>
              </div>
              <div className="w-full text-center mb-2">
                <span className="font-bold">Grid Square: </span>
                <span className="text-orange break-all">{mousePosition.grid}</span>
              </div>
              <div className="w-full text-center">
                <span className="text-gray-400 text-xs">
                  UTC Time: {utcTime ? utcTime.toISOString().split("T")[1].split(".")[0] : "Loading..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
