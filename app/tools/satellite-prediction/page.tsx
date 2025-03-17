// page.tsx
"use client";

import { useState, useEffect } from "react";
import SatelliteSearch from "../../components/SatelliteSearch";
import { TypewriterEffectSmooth } from "../../components/typewritter-effect";
import { getSatellites, getSatellitePasses } from "@/lib/satelliteAPI";


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

export default function SatelliteTracker() {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [selectedSatellites, setSelectedSatellites] = useState<Satellite[]>([]);
  const [allPredictions, setAllPredictions] = useState<SatellitePrediction[]>([]);

  // Configuration (le compteur de prédictions a été supprimé)
  const [elevation, setElevation] = useState(10);
  const [utcOffset, setUtcOffset] = useState(0);
  const [useLocalTime, setUseLocalTime] = useState(false);

  // Position
  const [locationType, setLocationType] = useState("latlon");
  const [latitude, setLatitude] = useState(48.8566);
  const [longitude, setLongitude] = useState(2.3522);
  const [city, setCity] = useState("");
  const [gridSquare, setGridSquare] = useState("");

  // États pour l'affichage / erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sélection d'éléments dans chaque bloc
  const [selectedAvailableId, setSelectedAvailableId] = useState<string | null>(null);
  const [selectedChosenId, setSelectedChosenId] = useState<string | null>(null);

  const handleCleanAll = () => {
    setSelectedSatellites([]);
    setSelectedChosenId(null);
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
    setAllPredictions([]);

    try {
      const results = await Promise.all(
        selectedSatellites.map(async (sat) => {
          const data = await getSatellitePasses(
            sat.id,
            latitude,
            longitude,
            elevation,
            utcOffset
          );
          return {
            satelliteId: sat.id,
            satelliteName: sat.name,
            passes: data,
          };
        })
      );
      setAllPredictions(results);
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

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6">
      <div className="w-full max-w-[1400px]">
        <div className="w-full flex justify-center mb-6">
          <TypewriterEffectSmooth
            words={[
              { text: "Satellite", className: "text-purple" },
              { text: "Pass", className: "text-orange" },
              { text: "Prediction", className: "text-orange" },
            ]}
            className="text-2xl font-bold text-center text-white"
            cursorClassName="bg-purple"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* PARTIE GAUCHE : sélection des satellites */}
          <div className="md:w-1/2 p-6 rounded-lg shadow-lg flex flex-col gap-6">
            <h2 className="text-xl text-white">Sélection du satellite</h2>
            <div className="bg-zinc-800 p-4 rounded-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-lg">Satellites disponibles</h3>
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
                <h3 className="text-white text-lg">Satellites sélectionnés</h3>
                <button
                  onClick={handleCleanAll}
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
                      className={`group cursor-pointer rounded-md p-3 text-sm font-medium
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PARTIE DROITE : configuration */}
          <div className="md:w-1/2 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl text-white mb-4">Configuration de la prédiction</h2>

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

            <div className="mt-4">
              <h3 className="text-white mb-1">Choisir votre position</h3>
              <select
                className="bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400 focus:ring-2 focus:ring-purple outline-none duration-300 placeholder:text-zinc-600 placeholder:opacity-50 rounded-full px-4 py-2 shadow-md focus:shadow-lg w-full mb-2"
                onChange={(e) => setLocationType(e.target.value)}
                value={locationType}
              >
                <option value="latlon">Latitude / Longitude</option>
                <option value="city">Ville</option>
                <option value="gridsquare">Gridsquare</option>
              </select>

              {locationType === "latlon" && (
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    placeholder="Latitude"
                    autoComplete="off"
                    className="bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400 focus:ring-2 focus:ring-purple outline-none duration-300 placeholder:text-zinc-600 placeholder:opacity-50 rounded-full px-4 py-2 shadow-md focus:shadow-lg w-full"
                  />
                  <input
                    type="number"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    placeholder="Longitude"
                    autoComplete="off"
                    className="bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400 focus:ring-2 focus:ring-purple outline-none duration-300 placeholder:text-zinc-600 placeholder:opacity-50 rounded-full px-4 py-2 shadow-md focus:shadow-lg w-full"
                  />
                </div>
              )}

              {locationType === "city" && (
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ville"
                  autoComplete="off"
                  className="bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400 focus:ring-2 focus:ring-purple outline-none duration-300 placeholder:text-zinc-600 placeholder:opacity-50 rounded-full px-4 py-2 shadow-md focus:shadow-lg w-full"
                />
              )}

              {locationType === "gridsquare" && (
                <input
                  type="text"
                  value={gridSquare}
                  onChange={(e) => setGridSquare(e.target.value)}
                  placeholder="Gridsquare"
                  autoComplete="off"
                  className="bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400 focus:ring-2 focus:ring-purple outline-none duration-300 placeholder:text-zinc-600 placeholder:opacity-50 rounded-full px-4 py-2 shadow-md focus:shadow-lg w-full"
                />
              )}
            </div>

            <div className="mt-10 flex flex-col items-center">
              <button
                onClick={getPredictions}
                className="px-[40px] py-[17px] rounded-full cursor-pointer border-0 bg-white shadow-[0_0_8px_rgba(0,0,0,0.05)] tracking-[1.5px] uppercase text-[15px] transition-all duration-500 ease-in-out hover:tracking-[3px] hover:bg-purple hover:text-white hover:shadow-[0_7px_29px_0_rgb(93_24_220)] active:tracking-[3px] active:bg-purple active:text-white active:shadow-none active:translate-y-[10px]"
              >
                PREDICT
              </button>
              {loading && (
                <div className="flex justify-center items-center mt-4">
                  <div className="loader">
                    <span></span>
                  </div>
                </div>
              )}
            </div>
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </div>
        </div>

        <div className="mt-6">
          {allPredictions.length > 0 &&
            allPredictions.map((pred) => (
              <div
                key={pred.satelliteId}
                className="bg-zinc-800 text-white p-4 rounded-md shadow-md mb-4"
              >
                <h3 className="text-lg font-bold mb-2">{pred.satelliteName}</h3>
                {Array.isArray(pred.passes) && pred.passes.length > 0 ? (
                  <ul>
                    {pred.passes.map((pass, index) => (
                      <li key={index} className="py-1">
                        Passage {index + 1} → Début : {pass.startTime} | Fin : {pass.endTime} | Max Élévation : {pass.maxElevation}°
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No passes</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
