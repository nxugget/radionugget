// page.tsx

"use client";

import { useState, useEffect } from "react";
import SatelliteSearch from "../../components/SatelliteSearch";
import { TypewriterEffectSmooth } from "../../components/typewritter-effect";
import {
  fetchSatellitePasses,
  fetchFilteredSatellites,
} from "@/lib/satelliteAPI";

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

  const [elevation, setElevation] = useState(10);
  const [predictionCount, setPredictionCount] = useState(5);
  const [utcOffset, setUtcOffset] = useState(0);

  const [locationType, setLocationType] = useState("latlon");
  const [latitude, setLatitude] = useState(48.8566);
  const [longitude, setLongitude] = useState(2.3522);
  const [city, setCity] = useState("");
  const [gridSquare, setGridSquare] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSatellitesData = async () => {
      const data = await fetchFilteredSatellites();
      setSatellites(data);
    };
    fetchSatellitesData();
  }, []);

  const handleAddSatellite = (sat: Satellite) => {
    setSelectedSatellites((prev) => {
      if (!prev.some((s) => s.id === sat.id)) {
        return [...prev, sat];
      }
      return prev;
    });
  };

  const handleRemoveSatellite = (satelliteId: string) => {
    setSelectedSatellites((prev) => prev.filter((sat) => sat.id !== satelliteId));
  };

  const handleAddAll = (sats: Satellite[]) => {
    setSelectedSatellites((prev) => {
      const newList = [...prev];
      sats.forEach((sat) => {
        if (!newList.some((existing) => existing.id === sat.id)) {
          newList.push(sat);
        }
      });
      return newList;
    });
  };

  const handleCleanAll = () => {
    setSelectedSatellites([]);
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
          const data = await fetchSatellitePasses(
            sat.id,
            latitude,
            longitude,
            elevation,
            predictionCount
          );
          return {
            satelliteId: sat.id,
            satelliteName: sat.name,
            passes: data,
          };
        })
      );
      setAllPredictions(results);
    } catch {
      setError("Erreur lors de la récupération des prédictions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6">
      <div className="w-full max-w-[1400px]">
        <div className="w-full flex justify-center mb-6">
          <TypewriterEffectSmooth
            words={[
              { text: "Satellite", className: "text-[#b400ff]" },
              { text: "Pass", className: "text-[#ffaa00]" },
              { text: "Prediction", className: "text-[#ffaa00]" },
            ]}
            className="text-2xl font-bold text-center text-white"
            cursorClassName="bg-[#b400ff]"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Colonne de sélection des satellites */}
          <div className="md:w-1/2 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl text-white mb-4">Sélection du satellite</h2>
            <SatelliteSearch
              satellites={satellites}
              onSelect={handleAddSatellite}
              onAddAll={handleAddAll}
            />
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-lg">Satellites sélectionnés :</h3>
                <button
                  className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                  onClick={handleCleanAll}
                >
                  Clean All
                </button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {selectedSatellites.map((sat) => (
                  <div
                    key={sat.id}
                    className="relative bg-purple-700 text-white px-4 py-2 text-sm font-medium rounded-md"
                  >
                    {sat.name}
                    <button
                      className="absolute top-0 right-0 text-red-300 hover:text-red-500 px-2"
                      onClick={() => handleRemoveSatellite(sat.id)}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne configuration */}
          <div className="md:w-1/2 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl text-white mb-4">Configuration de la prédiction</h2>

            {/* Nombre de prédictions & Fuseau horaire */}
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-white mb-1">Nombre de prédictions</p>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={predictionCount}
                  onChange={(e) => setPredictionCount(Number(e.target.value))}
                  className="bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400 focus:ring-2 focus:ring-purple outline-none duration-300 placeholder:text-zinc-600 placeholder:opacity-50 rounded-full px-4 py-2 shadow-md focus:shadow-lg w-full"
                  autoComplete="off"
                />
              </div>
              <div>
                <p className="text-white mb-1">Fuseau horaire UTC</p>
                <select
                  value={utcOffset}
                  onChange={(e) => setUtcOffset(Number(e.target.value))}
                  className="bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400 focus:ring-2 focus:ring-purple outline-none duration-300 placeholder:text-zinc-600 placeholder:opacity-50 rounded-full px-4 py-2 shadow-md focus:shadow-lg w-full"
                >
                  {[...Array(25)].map((_, i) => (
                    <option key={i} value={i - 12}>
                      UTC {i - 12 >= 0 ? `+${i - 12}` : i - 12}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Élévation */}
            <div className="mt-4">
              <p className="text-white mb-1">Élévation minimale (°)</p>
              <input
                type="range"
                min="0"
                max="90"
                value={elevation}
                onChange={(e) => setElevation(Number(e.target.value))}
                className="bg-purple-500 w-96 h-8 hover:cursor-pointer"
              />
              <p className="text-center text-white mt-1">{elevation}°</p>
            </div>

            {/* Choix de la position */}
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

            {/* Bouton PREDICT */}
            <div className="mt-10 flex flex-col items-center">
              <button
                onClick={getPredictions}
                // Style inspiré de Uiverse.io by barisdogansutcu
                className="
                  px-[40px]
                  py-[17px]
                  rounded-full
                  cursor-pointer
                  border-0
                  bg-white
                  shadow-[0_0_8px_rgba(0,0,0,0.05)]
                  tracking-[1.5px]
                  uppercase
                  text-[15px]
                  transition-all
                  duration-500
                  ease-in-out
                  hover:tracking-[3px]
                  hover:bg-purple
                  hover:text-white
                  hover:shadow-[0_7px_29px_0_rgb(93_24_220)]
                  active:tracking-[3px]
                  active:bg-purple
                  active:text-white
                  active:shadow-none
                  active:translate-y-[10px]
                "
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

        {/* Résultats */}
        <div className="mt-6">
          {allPredictions.length > 0 &&
            allPredictions.map((pred) => (
              <div
                key={pred.satelliteId}
                className="bg-gray-800 text-white p-4 rounded-md shadow-md mb-4"
              >
                <h3 className="text-lg font-bold mb-2">{pred.satelliteName}</h3>
                <ul>
                  {pred.passes.map((pass, index) => (
                    <li key={index} className="py-1">
                      Passage {index + 1} → Début : {pass.startTime} | Fin : {pass.endTime} | Max Élévation :{" "}
                      {pass.maxElevation}°
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
