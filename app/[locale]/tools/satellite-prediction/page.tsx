"use client";

import { useState, useEffect } from "react";
import SatelliteSearch from "./SatelliteSearch";
import { TypewriterEffectSmooth } from "@/src/components/features/Typewritter";
import { getSatellites, getSatellitePasses } from "@/src/lib/satelliteAPI";
import SatelliteTimeline from "./SatelliteTimeline";
import SatelliteTab from "./SatelliteTab"; // new import
import { getGridSquareCoords } from "@/src/lib/gridSquare";
import { useI18n } from "@/locales/client"; // Add i18n import
import { getCookieValue, setCookie } from "@/src/lib/cookies"; // Restore cookie functions for favorites
import LocationButton from "@/src/components/features/LocationButton";

interface Satellite {
  name: string;
  id: string;
  category?: string;
}

interface SatellitePassData {
  startTime: string;
  endTime: string;
  maxElevation: number;
  aosAzimuth?: number; // Added aosAzimuth
  losAzimuth?: number; // Added losAzimuth
}

interface SatellitePrediction {
  satelliteId: string;
  satelliteName: string;
  passes: SatellitePassData[];
}

// Composant pour afficher la bannière de cookies
function CookieBanner() {
  const [visible, setVisible] = useState(true);

  const handleAccept = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex flex-col md:flex-row justify-between items-center">
      <p className="text-sm mb-2 md:mb-0">
        Pour sauvegarder tes favoris et ta position, cette page utilise des cookies. Ces derniers sont stockés uniquement sur ton appareil et personne d'autres n'y aura accès :)
      </p>
      <button onClick={handleAccept} className="bg-purple hover:bg-orange hover:text-black text-white px-4 py-2 transition-colors rounded-md">
        Accepter
      </button>
    </div>
  );
}

export default function SatelliteTracker() {
  const t = useI18n(); // Initialize i18n
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [selectedSatellites, setSelectedSatellites] = useState<Satellite[]>([]);
  const [allPredictions, setAllPredictions] = useState<SatellitePrediction[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline"); // New view mode state

  // Configuration
  const [elevation, setElevation] = useState(10);
  const [utcOffset, setUtcOffset] = useState(0);
  const [useLocalTime, setUseLocalTime] = useState(false);

  // Position
  const [locationType, setLocationType] = useState("latlon");
  const [latitude, setLatitude] = useState(48.8566);
  const [longitude, setLongitude] = useState(2.3522);
  const [city, setCity] = useState("");
  const [gridSquare, setGridSquare] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [gridSquareInput, setGridSquareInput] = useState("");
  const [locationLoading, setLocationLoading] = useState(false); // État pour gérer le chargement de la localisation

  // États pour l'affichage / erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sélection d'éléments dans chaque bloc
  const [selectedAvailableId, setSelectedAvailableId] = useState<string | null>(null);
  const [selectedChosenId, setSelectedChosenId] = useState<string | null>(null);

  // Charger les favoris depuis les cookies au chargement
  useEffect(() => {
    const favCookie = getCookieValue("favorites");
    if (favCookie) {
      try {
        setFavorites(JSON.parse(favCookie));
      } catch (e) {
        setFavorites([]);
      }
    }
  }, []);

  // Mettre à jour les cookies lors du changement de position
  useEffect(() => {
    setCookie("latitude", latitude.toString());
  }, [latitude]);

  useEffect(() => {
    setCookie("longitude", longitude.toString());
  }, [longitude]);

  useEffect(() => {
    setCookie("city", city);
  }, [city]);

  const handleGridSquareChange = (newGridSquare: string) => {
    setGridSquareInput(newGridSquare);
    try {
      const coords = getGridSquareCoords(newGridSquare);
      setLatitude(coords.lat);
      setLongitude(coords.lon);
    } catch {
      console.error("Gridsquare invalide.");
    }
  };

  // Fonction pour basculer l'état "favoris" et mettre à jour le cookie
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      let newFavorites;
      if (prev.includes(id)) {
        newFavorites = prev.filter((fav) => fav !== id);
      } else {
        newFavorites = [...prev, id];
      }
      setCookie("favorites", JSON.stringify(newFavorites)); // Update cookie for favorites
      return newFavorites;
    });
  };

  useEffect(() => {
    const fetchSatellitesData = async () => {
      try {
        const data = await getSatellites();
        setSatellites(data);
      } catch (err) {
        console.error("Error fetching satellites:", err);
        setError("Impossible de charger la liste des satellites.");
      }
    };
    fetchSatellitesData();
  }, []);

  const unselectedSatellites = satellites.filter(
    (sat) => !selectedSatellites.some((sel) => sel.id === sat.id)
  );

  const moveOneDown = () => {
    if (!selectedAvailableId) return;
    const sat = unselectedSatellites.find((s) => s.id === selectedAvailableId);
    if (sat) {
      setSelectedSatellites((prev) => [...prev, sat]);
      setSelectedAvailableId(null);
    }
  };

  const moveOneUp = () => {
    if (!selectedChosenId) return;
    setSelectedSatellites((prev) =>
      prev.filter((s) => s.id !== selectedChosenId)
    );
    setSelectedChosenId(null);
  };

  const handleAddAll = () => {
    setSelectedSatellites((prev) => {
      const toAdd = unselectedSatellites.filter(
        (sat) => !prev.some((p) => p.id === sat.id)
      );
      return [...prev, ...toAdd];
    });
  };

  // Nouvelle fonction pour ajouter tous les satellites filtrés
  const handleAddAllFiltered = (filteredSatellites: Satellite[]) => {
    setSelectedSatellites((prev) => {
      const toAdd = filteredSatellites.filter(
        (sat) => !prev.some((p) => p.id === sat.id)
      );
      return [...prev, ...toAdd];
    });
  };

  const getPredictions = async () => {
    if (selectedSatellites.length === 0) {
      setError("Veuillez sélectionner au moins un satellite.");
      return;
    }
    setLoading(true);
    setError(null);

    // Réinitialise les prédictions pour forcer la mise à jour
    setAllPredictions([]);

    try {
      const results = await Promise.all(
        selectedSatellites.map(async (sat) => {
          const data = await getSatellitePasses(
            sat.id,
            latitude,
            longitude,
            elevation, // Utilise l'élévation actuelle
            utcOffset
          );
          return {
            satelliteId: sat.id,
            satelliteName: sat.name,
            passes: data,
          };
        })
      );
      setAllPredictions(results); // Met à jour les prédictions avec les nouvelles données
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError("Erreur lors de la récupération des prédictions.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocalTimeChange = (checked: boolean) => {
    setUseLocalTime(checked);
    if (checked) {
      const offset = -new Date().getTimezoneOffset() / 60;
      setUtcOffset(offset);
    } else {
      setUtcOffset(0);
    }
  };

  const useCurrentLocation = () => {
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(5)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(5)));
        setLocationLoading(false);
      },
      (err) => {
        console.error("Erreur de géolocalisation :", err);
        alert("Impossible de récupérer votre position.");
        setLocationLoading(false);
      }
    );
  };

  // Autocomplétion pour les villes
  useEffect(() => {
    if (cityQuery.length > 2) {
      const timeout = setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(cityQuery)}`)
          .then((response) => response.json())
          .then((data) => setCitySuggestions(data))
          .catch(() => setCitySuggestions([]));
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setCitySuggestions([]);
    }
  }, [cityQuery]);

  const handleCitySelect = (city: any) => {
    setCityQuery(city.display_name);
    setLatitude(parseFloat(city.lat));
    setLongitude(parseFloat(city.lon));
    setCitySuggestions([]);
  };

  const handleGridSquareSubmit = () => {
    try {
      const coords = getGridSquareCoords(gridSquareInput);
      setLatitude(coords.lat);
      setLongitude(coords.lon);
    } catch {
      alert("Gridsquare invalide.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6">
      <div className="w-full max-w-[1400px] bg-black bg-opacity-70 rounded-x2 p-6">
        <div className="w-full flex justify-center mb-6">
          <TypewriterEffectSmooth
            as="h1"
            words={[
              { text: "Satellite", className: "text-purple" },
              { text: "Pass", className: "text-white" },
              { text: "Prediction", className: "text-white" },
            ]}
            // Réduire la taille du texte sur mobile et l'augmenter progressivement
            className="text-xl xs:text-2xl md:text-3xl font-bold text-center text-white overflow-hidden"
            cursorClassName="bg-purple"
          />
        </div>
        {/* Réduire la taille du texte de la description beta */}
        <p className="text-center text-gray-400 mb-6 text-xs sm:text-sm">{t("betaDescription")}</p>
        <div className="flex flex-col md:flex-row gap-6">
          {/* PARTIE GAUCHE : sélection des satellites */}
          <div className="md:w-1/2 p-6 rounded-lg shadow-lg flex flex-col gap-6">
            <div className="bg-zinc-800 p-4 rounded-md flex flex-col gap-4">
              <h3 className="text-white text-lg text-center">Satellites prédictables</h3>
              <SatelliteSearch
                satellites={unselectedSatellites}
                selectedSatelliteId={selectedAvailableId}
                onSelect={(id) => {
                  setSelectedAvailableId(id);
                  setSelectedChosenId(null);
                }}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onAddAll={handleAddAllFiltered}
              />
            </div>

            <div className="flex items-center justify-center gap-8">
              <button
                onClick={moveOneDown}
                className="bg-purple text-white p-3 rounded-md transition-all duration-300 ease-in-out hover:bg-orange"
                title="Ajouter le satellite sélectionné vers le bas"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={moveOneUp}
                className="bg-purple text-white p-3 rounded-md transition-all duration-300 ease-in-out hover:bg-orange"
                title="Retirer le satellite sélectionné vers le haut"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>

            <div className="bg-zinc-800 p-4 rounded-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-lg text-center w-full">Satellites à prédire</h3>
                <button
                  onClick={() => {
                    setSelectedSatellites([]);
                    setSelectedChosenId(null);
                  }}
                  className="text-sm font-bold text-white hover:text-red-600 transition-colors absolute right-10"
                >
                  Clean All
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                {selectedSatellites.map((sat) => {
                  const isSelected = sat.id === selectedChosenId;
                  return (
                    <div
                      key={sat.id}
                      onClick={() => {
                        setSelectedChosenId(sat.id);
                        setSelectedAvailableId(null);
                      }}
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
                          toggleFavorite(sat.id);
                        }}
                        className={`absolute top-2 right-2 text-xl transition-colors duration-300 ${
                          favorites.includes(sat.id) ? "text-orange" : "text-gray-300"
                        } hover:text-orange`}
                        title="Ajouter aux favoris"
                      >
                        {favorites.includes(sat.id) ? "★" : "☆"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PARTIE DROITE : configuration */}
          <div className="md:w-1/2 p-6 rounded-lg shadow-lg">
            {/* Section de choix de position */}
            <div className="mb-6">
              <h3 className="text-white mb-4">Choisir votre position</h3>
              <div className="flex flex-col gap-4">
                {/* Centrer la ligne d'input et le bouton de localisation */}
                <div className="flex items-center justify-center gap-4 w-full mx-auto">
                  {/* Champ Ville */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      placeholder="Ville (ex: Paris)"
                      className="bg-zinc-800 text-white px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple"
                      onFocus={() => setCitySuggestions([])}
                    />
                    {citySuggestions.length > 0 && (
                      <ul className="absolute left-0 right-0 bg-black/70 text-white rounded-md shadow-md max-h-60 overflow-y-auto z-10">
                        {citySuggestions.map((city, idx) => (
                          <li
                            key={idx}
                            className="px-4 py-2 cursor-pointer transition-colors duration-200 hover:text-purple-500"
                            onClick={() => handleCitySelect(city)}
                          >
                            {city.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <span className="text-white font-bold">{t("or")}</span>

                  {/* Champ GridSquare */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={gridSquareInput}
                      onChange={(e) => handleGridSquareChange(e.target.value)}
                      placeholder="Gridsquare (ex: JN18du)"
                      className="bg-zinc-800 text-white px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple"
                    />
                  </div>
                  <span className="text-white font-bold">{t("or")}</span>

                  <LocationButton
                    onClick={useCurrentLocation}
                    loading={locationLoading}
                    title={t("useMyLocation")}
                    size={40}
                  />
                </div>

                {/* Latitude et Longitude */}
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center w-1/2">
                      <label className="text-white font-bold mb-1">Latitude</label>
                      <input
                        type="number"
                        value={latitude.toFixed(5)}
                        onChange={(e) => setLatitude(Number(e.target.value))}
                        placeholder="Latitude"
                        className="bg-zinc-800 text-white px-4 py-2 rounded-md w-full text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      />
                    </div>
                    <div className="flex flex-col items-center w-1/2">
                      <label className="text-white font-bold mb-1">Longitude</label>
                      <input
                        type="number"
                        value={longitude.toFixed(5)}
                        onChange={(e) => setLongitude(Number(e.target.value))}
                        placeholder="Longitude"
                        className="bg-zinc-800 text-white px-4 py-2 rounded-md w-full text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      />
                    </div>
                  </div>
                  <p className="text-white text-sm text-center mt-2">
                    Les valeurs négatives indiquent le <strong>Sud</strong> pour la latitude et l'<strong>Ouest</strong> pour la longitude.
                  </p>
                </div>
              </div>
            </div>

            {/* Section Élévation minimale */}
            <div className="mt-4 flex flex-col items-center w-full">
              <p className="text-white mb-1 text-center w-full">Élévation minimale (°)</p>
              <input
                type="range"
                min="0"
                max="90"
                value={elevation}
                onChange={(e) => setElevation(Number(e.target.value))}
                className="bg-purple w-full h-8 hover:cursor-pointer"
              />
              <p className="text-center text-white mt-1 w-full">{elevation}°</p>
            </div>

            <div className="mt-10 flex flex-col items-center">
              <button
                onClick={getPredictions}
                className="px-[40px] py-[17px] rounded-full cursor-pointer border-0 bg-white shadow-[0_0_8px_rgba(0,0,0,0.05)] tracking-[1.5px] uppercase text-[15px] transition-all duration-500 ease-in-out hover:tracking-[3px] hover:bg-purple hover:text-white hover:shadow-[0_7px_29px_0_rgb(93_24_220)] active:tracking-[3px] active:bg-purple active:text-white active:shadow-none active:translate-y-[10px]"
              >
                PREDICT
              </button>
            </div>
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </div>
        </div>

        {/* New Small Toggle Section (positioned above predictions) */}
        {allPredictions.length > 0 && (
          <div className="mt-4 flex justify-start gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-800 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1 text-sm text-white ${
                  viewMode === "timeline" ? "bg-purple" : "bg-gray-800 hover:bg-purple"
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 text-sm text-white ${
                  viewMode === "table" ? "bg-purple" : "bg-gray-800 hover:bg-purple"
                }`}
              >
                Table
              </button>
            </div>
            {/* Time Mode Toggle */}
            <div className="flex items-center bg-gray-800 rounded-md overflow-hidden">
              <button
                onClick={() => {
                  setUseLocalTime(false);
                  setUtcOffset(0);
                }}
                className={`px-3 py-1 text-sm text-white ${
                  !useLocalTime ? "bg-purple" : "bg-gray-800 hover:bg-purple"
                }`}
              >
                UTC Time
              </button>
              <button
                onClick={() => {
                  setUseLocalTime(true);
                  const offset = -new Date().getTimezoneOffset() / 60;
                  setUtcOffset(offset);
                }}
                className={`px-3 py-1 text-sm text-white ${
                  useLocalTime ? "bg-purple" : "bg-gray-800 hover:bg-purple"
                }`}
              >
                Local Time
              </button>
            </div>
          </div>
        )}

        {allPredictions.length > 0 && (
          <div className="mt-6 w-full flex justify-center">
            <div className="w-full max-w-[1400px] overflow-x-auto">
              {viewMode === "timeline" ? (
                <SatelliteTimeline
                  key={JSON.stringify(allPredictions)} // Force re-render when predictions change
                  passes={allPredictions.flatMap((pred) =>
                    pred.passes.map((pass) => ({
                      satelliteName: pred.satelliteName,
                      satelliteId: pred.satelliteId,
                      startTime: pass.startTime,
                      endTime: pass.endTime,
                      maxElevation: pass.maxElevation,
                      aosAzimuth: pass.aosAzimuth ?? 0,
                      losAzimuth: pass.losAzimuth ?? 0,
                    }))
                  )}
                  useLocalTime={useLocalTime}
                  utcOffset={utcOffset}
                />
              ) : (
                <SatelliteTab
                  passes={allPredictions.flatMap((pred) =>
                    pred.passes.map((pass) => ({
                      satelliteName: pred.satelliteName,
                      satelliteId: pred.satelliteId,
                      startTime: pass.startTime,
                      endTime: pass.endTime,
                      maxElevation: pass.maxElevation,
                      aosAzimuth: pass.aosAzimuth ?? 0,
                      losAzimuth: pass.losAzimuth ?? 0,
                    }))
                  )}
                  useLocalTime={useLocalTime}
                  utcOffset={utcOffset}
                />
              )}
            </div>
          </div>
        )}
      </div>
      {/* Bannière de cookies */}
      <CookieBanner />
    </div>
  );
}

