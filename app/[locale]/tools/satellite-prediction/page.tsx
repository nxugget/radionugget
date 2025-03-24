"use client";

import { useState, useEffect } from "react";
import SatelliteSearch from "./SatelliteSearch";
import { TypewriterEffectSmooth } from "@/src/components/features/Typewritter";
import { getSatellites, getSatellitePasses } from "@/src/lib/satelliteAPI";
import SatelliteTimeline from "./SatelliteTimeline";
import { getGridSquareCoords } from "@/src/lib/gridSquare";

interface Satellite {
  name: string;
  id: string;
  category?: string;
}

interface SatellitePassData {
  startTime: string;
  endTime: string;
  maxElevation: number;
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
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [selectedSatellites, setSelectedSatellites] = useState<Satellite[]>([]);
  const [allPredictions, setAllPredictions] = useState<SatellitePrediction[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

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

  // États pour l'affichage / erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sélection d'éléments dans chaque bloc
  const [selectedAvailableId, setSelectedAvailableId] = useState<string | null>(null);
  const [selectedChosenId, setSelectedChosenId] = useState<string | null>(null);

  // Fonctions d'aide pour les cookies
  const getCookieValue = (name: string) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  };

  const updateCookie = (name: string, value: string, days: number = 365) => {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
  };

  // Charger les favoris et la position depuis les cookies au chargement
  useEffect(() => {
    const favCookie = getCookieValue("favorites");
    if (favCookie) {
      try {
        setFavorites(JSON.parse(favCookie));
      } catch (e) {
        setFavorites([]);
      }
    }
    const latCookie = getCookieValue("latitude");
    if (latCookie) setLatitude(parseFloat(latCookie));
    const lonCookie = getCookieValue("longitude");
    if (lonCookie) setLongitude(parseFloat(lonCookie));
    const cityCookie = getCookieValue("city");
    if (cityCookie) setCity(cityCookie);
    const gridCookie = getCookieValue("gridSquare");
    if (gridCookie) setGridSquare(gridCookie);
  }, []);

  // Mettre à jour les cookies lors du changement de position
  useEffect(() => {
    updateCookie("latitude", latitude.toString());
  }, [latitude]);

  useEffect(() => {
    updateCookie("longitude", longitude.toString());
  }, [longitude]);

  useEffect(() => {
    updateCookie("city", city);
  }, [city]);

  useEffect(() => {
    updateCookie("gridSquare", gridSquare);
  }, [gridSquare]);

  // Fonction pour basculer l'état "favoris" et mettre à jour le cookie
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      let newFavorites;
      if (prev.includes(id)) {
        newFavorites = prev.filter((fav) => fav !== id);
      } else {
        newFavorites = [...prev, id];
      }
      updateCookie("favorites", JSON.stringify(newFavorites));
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
            words={[
              { text: "Satellite", className: "text-purple" },
              { text: "Pass", className: "text-white" },
              { text: "Prediction", className: "text-white" },
            ]}
            className="text-2xl font-bold text-center text-white"
            cursorClassName="bg-purple"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* PARTIE GAUCHE : sélection des satellites */}
          <div className="md:w-1/2 p-6 rounded-lg shadow-lg flex flex-col gap-6">
            <div className="bg-zinc-800 p-4 rounded-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-lg">Satellites prédictables</h3>
                <button
                  onClick={handleAddAll}
                  className="text-sm font-bold text-white hover:text-purple transition-colors"
                >
                  Add All
                </button>
              </div>
              <SatelliteSearch
                satellites={unselectedSatellites}
                selectedSatelliteId={selectedAvailableId}
                onSelect={(id) => {
                  setSelectedAvailableId(id);
                  setSelectedChosenId(null);
                }}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
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
                <h3 className="text-white text-lg">Satellites à prédire</h3>
                <button
                  onClick={() => {
                    setSelectedSatellites([]);
                    setSelectedChosenId(null);
                  }}
                  className="text-sm font-bold text-white hover:text-purple transition-colors"
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
                          toggleFavorite(sat.id);
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
          </div>

          {/* PARTIE DROITE : configuration */}
          <div className="md:w-1/2 p-6 rounded-lg shadow-lg">
            {/* Section de choix de position */}
            <div className="mb-6">
              <h3 className="text-white mb-4">Choisir votre position</h3>
              <div className="flex flex-col gap-4">
                {/* Ligne avec Ville, GridSquare et Position Actuelle */}
                <div className="flex items-center gap-4">
                  {/* Champ Ville */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      placeholder="Ville (ex: Paris)"
                      className="bg-zinc-200 text-zinc-600 px-4 py-2 rounded-md w-full"
                      onFocus={() => setCitySuggestions([])} // Empêche les suggestions de réapparaître après sélection
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
                  <span className="text-white font-bold">OU</span>

                  {/* Champ GridSquare */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={gridSquareInput}
                      onChange={(e) => setGridSquareInput(e.target.value)}
                      onBlur={() => {
                        if (gridSquareInput.trim() !== "") {
                          try {
                            const coords = getGridSquareCoords(gridSquareInput);
                            setLatitude(coords.lat);
                            setLongitude(coords.lon);
                          } catch {
                            alert("Gridsquare invalide.");
                          }
                        }
                      }}
                      placeholder="Gridsquare (ex: JN18du)"
                      className="bg-zinc-200 text-zinc-600 px-4 py-2 rounded-md w-full"
                    />
                  </div>
                  <span className="text-white font-bold">OU</span>

                  {/* Bouton Position Actuelle */}
                  <button
                    onClick={() => {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setLatitude(parseFloat(pos.coords.latitude.toFixed(5)));
                          setLongitude(parseFloat(pos.coords.longitude.toFixed(5)));
                        },
                        (err) => {
                          console.error("Erreur de géolocalisation :", err);
                          alert("Impossible de récupérer votre position.");
                        }
                      );
                    }}
                    className="bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-600"
                    title="Utiliser ma position actuelle"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414-1.414m12.728 0l1.414 1.414M6.05 6.05l1.414 1.414"
                      />
                    </svg>
                  </button>
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
                        className="bg-zinc-200 text-zinc-600 px-4 py-2 rounded-md w-full text-center font-bold text-lg"
                      />
                    </div>
                    <div className="flex flex-col items-center w-1/2">
                      <label className="text-white font-bold mb-1">Longitude</label>
                      <input
                        type="number"
                        value={longitude.toFixed(5)}
                        onChange={(e) => setLongitude(Number(e.target.value))}
                        placeholder="Longitude"
                        className="bg-zinc-200 text-zinc-600 px-4 py-2 rounded-md w-full text-center font-bold text-lg"
                      />
                    </div>
                  </div>
                  <p className="text-white text-sm text-center mt-2">
                    Les valeurs négatives indiquent le <strong>Sud</strong> pour la latitude et l'<strong>Ouest</strong> pour la longitude.
                  </p>
                </div>
              </div>
            </div>

            {/* Section Local Time */}
            <div className="flex items-center gap-6">
              <label
                htmlFor="localTime"
                className="flex items-center gap-2 text-white cursor-pointer"
              >
                <input
                  type="checkbox"
                  id="localTime"
                  checked={useLocalTime}
                  onChange={(e) => handleLocalTimeChange(e.target.checked)}
                  className="h-8 w-8 appearance-none border-2 border-orange rounded-md cursor-pointer transition-colors duration-300 hover:border-purple checked:bg-purple checked:border-purple"
                />
                <span className="text-lg font-semibold select-none">Local Time</span>
              </label>
            </div>

            {/* Section Élévation minimale */}
            <div className="mt-4">
              <p className="text-white mb-1">Élévation minimale (°)</p>
              <input
                type="range"
                min="0"
                max="90"
                value={elevation}
                onChange={(e) => setElevation(Number(e.target.value))}
                className="bg-purple w-96 h-8 hover:cursor-pointer"
              />
              <p className="text-center text-white mt-1">{elevation}°</p>
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

        <div className="mt-6 w-full flex justify-center">
          <div className="w-full max-w-[1400px] overflow-x-auto">
            <SatelliteTimeline
              key={JSON.stringify(allPredictions)} // Force le re-rendu lorsque les prédictions changent
              passes={allPredictions.flatMap((pred) =>
                pred.passes.map((pass) => ({
                  satelliteName: pred.satelliteName,
                  startTime: pass.startTime,
                  endTime: pass.endTime,
                  maxElevation: pass.maxElevation,
                }))
              )}
              useLocalTime={useLocalTime}
              utcOffset={utcOffset}
            />
          </div>
        </div>
      </div>
      {/* Bannière de cookies */}
      <CookieBanner />
    </div>
  );
}
