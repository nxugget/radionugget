"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Import useRouter
import SatelliteSearch from "../satellite-prediction/SatelliteSearch";
import Link from "next/link";
import PolarChart from "./PolarChart";
import TLEDisplay from "./tle";
import { TypewriterEffectSmooth } from "@/src/components/features/Typewritter";
import { getFavorites, setFavorites } from "@/src/lib/favorites";
import { getSatellites } from "@/src/lib/satelliteAPI";
import { getGridSquareCoords } from "@/src/lib/gridSquare";
import { twoline2satrec, propagate, gstime, eciToEcf, ecfToLookAngles, EciVec3 } from "satellite.js";
import { useI18n } from "@/locales/client"; // Add i18n import
import InputSearch from "@/src/components/ui/InputSearch"; // Import du composant InputSearch
import { isValidGridSquare } from "@/src/lib/checkGridSquare"; // Import the validation function

interface Satellite {
  id: string;
  name: string;
  category?: string;
  image?: string;
}

interface SatelliteDetails {
  id: string;
  name: string;
  description: string;
  status: string;
  frequency: string;
  modulation: string;
  photoUrl: string;
  tle1: string;
  tle2: string;
  image_source: string;
  country_image?: string; // Ajout de l'image du drapeau
}

interface Point {
  az: number;
  el: number;
}

const deg2rad = (deg: number) => deg * (Math.PI / 180);
const rad2deg = (rad: number) => rad * (180 / Math.PI);

function formatCountdown(seconds: number): string {
  if (seconds < 0) return "Pas de passage prévu";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function isValidEciVec3(value: any): value is EciVec3<number> {
  return value && typeof value === "object" && "x" in value && "y" in value && "z" in value;
}

export default function SatelliteInfoPage() {
  const t = useI18n(); // Initialize i18n
  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize router
  const satelliteId = searchParams.get("satelliteId"); // Get satelliteId from query params

  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);
  const [details, setDetails] = useState<SatelliteDetails | null>(null);
  const [favorites, setFavs] = useState<string[]>([]);
  const [polarInfo, setPolarInfo] = useState({ azimuth: 0, elevation: 0, nextAOSCountdown: -1 });
  const [latitude, setLatitude] = useState<number>(48.8566); // Default latitude set to Paris
  const [longitude, setLongitude] = useState<number>(2.3522); // Default longitude set to Paris
  const [gridSquare, setGridSquare] = useState<string>("DM27bf"); // Default Grid Square
  const [isEditingGridSquare, setIsEditingGridSquare] = useState<boolean>(false); // Editing state
  const [countdown, setCountdown] = useState<string>("");
  const [imageError, setImageError] = useState(false); // Nouvel état pour gérer l'erreur d'image
  const [trajectoryPoints, setTrajectoryPoints] = useState<Point[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // État pour la recherche
  const [filteredSatellites, setFilteredSatellites] = useState<Satellite[]>([]); // Satellites filtrés
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false); // État pour afficher/masquer les suggestions
  const suggestionsRef = useRef<HTMLDivElement | null>(null); // Référence pour détecter les clics en dehors
  const [gridSquareError, setGridSquareError] = useState<boolean>(false); // State for error handling

  useEffect(() => {
    getSatellites()
      .then((data) => {
        setSatellites(data);
        if (satelliteId) {
          const sat = data.find((s) => s.id === satelliteId) || null;
          setSelectedSatellite(sat);
        }
      })
      .catch(console.error);
  }, [satelliteId]); // React to changes in satelliteId

  useEffect(() => {
    setFavs(getFavorites());
  }, []);

  useEffect(() => {
    if (selectedSatellite && !details) { // Fetch details only if not already loaded
      fetch(`/api/satellite/${selectedSatellite.id}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`API error ${res.status}: ${errorText}`);
          }
          return res.json();
        })
        .then((data: SatelliteDetails) => {
          setDetails(data);
        })
        .catch((error) => {
          console.error("Erreur de récupération des détails :", error);
          setDetails(null);
        });
    }
  }, [selectedSatellite, details]);

  useEffect(() => {
    if (!selectedSatellite) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/getRealtimePolar?satId=${selectedSatellite.id}&lat=${latitude}&lon=${longitude}&height=0`);
        if (!res.ok) {
          throw new Error("API error");
        }
        const data = await res.json();
        setPolarInfo(data);

        // Déterminez si on affiche AOS ou LOS
        if (data.elevation > 0) {
          setCountdown(data.nextLOSCountdown > 0 ? `LOS in ${formatCountdown(data.nextLOSCountdown)}` : "Pas de passage prévu");
        } else {
          setCountdown(data.nextAOSCountdown > 0 ? `AOS in ${formatCountdown(data.nextAOSCountdown)}` : "Pas de passage prévu");
        }
      } catch (e) {
        console.error("Error fetching realtime polar data", e);
      }
    }, 1000); // Actualisation toutes les secondes
    return () => clearInterval(interval);
  }, [selectedSatellite, latitude, longitude]);

  useEffect(() => {
    if (details?.tle1 && details?.tle2) {
      const satrec = twoline2satrec(details.tle1.trim(), details.tle2.trim());
      const observerCoords = {
        latitude: deg2rad(latitude),
        longitude: deg2rad(longitude),
        height: 0,
      };
      const now = new Date();
      const points: Point[] = [];
      let elevationAboveHorizon = false; // Flag pour suivre si l'élévation est > 0

      for (let t = 0; t <= 3600; t += 10) { // Simulez jusqu'à 1 heure
        const futureTime = new Date(now.getTime() + t * 1000);
        const prop = propagate(satrec, futureTime);
        if (prop.position && isValidEciVec3(prop.position)) {
          const gmst = gstime(futureTime);
          const posEcf = eciToEcf(prop.position, gmst);
          const look = ecfToLookAngles(observerCoords, posEcf);

          if (look.elevation > 0) {
            elevationAboveHorizon = true; // L'élévation est > 0
            points.push({
              az: rad2deg(look.azimuth),
              el: Math.min(rad2deg(look.elevation), 90),
            });
          } else if (elevationAboveHorizon) {
            // Si l'élévation redevient < 0 après avoir été > 0, arrêtez
            break;
          }
        }
      }
      setTrajectoryPoints(points);
    }
  }, [details, latitude, longitude]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSatellites([]);
      return;
    }
    const results = satellites.filter((sat) =>
      sat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSatellites(results);
  }, [searchQuery, satellites]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false); // Masquer les suggestions si on clique en dehors
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGridSquareChange = (newGridSquare: string) => {
    if (isValidGridSquare(newGridSquare)) {
      try {
        const coords = getGridSquareCoords(newGridSquare);
        setLatitude(coords.lat);
        setLongitude(coords.lon);
        setGridSquare(newGridSquare);
        setGridSquareError(false); // Clear error if valid
      } catch {
        setGridSquareError(true); // Set error if invalid
        setGridSquare(""); // Reset Grid Square if invalid
      }
    } else {
      setGridSquareError(true); // Set error if invalid format
      setGridSquare(""); // Reset Grid Square if invalid
    }
  };

  const handleGridSquareDoubleClick = () => {
    setIsEditingGridSquare(true);
  };

  const handleGridSquareBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newGridSquare = e.target.value.trim();
    if (isValidGridSquare(newGridSquare)) {
      handleGridSquareChange(newGridSquare);
      setIsEditingGridSquare(false); // Exit editing mode if valid
    } else {
      setGridSquareError(true); // Keep error if invalid
    }
  };

  const handleGridSquareKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newGridSquare = (e.target as HTMLInputElement).value.trim();
      if (isValidGridSquare(newGridSquare)) {
        handleGridSquareChange(newGridSquare);
        setIsEditingGridSquare(false); // Exit editing mode if valid
      } else {
        setGridSquareError(true); // Keep error if invalid
      }
    }
  };

  const toggleFavorite = (id: string) => {
    let newFavs: string[];
    if (favorites.includes(id)) {
      newFavs = favorites.filter(fav => fav !== id);
    } else {
      newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    setFavs(newFavs);
  };

  const handleSatelliteSelect = (id: string) => {
    const sat = satellites.find((s) => s.id === id) || null;

    // Reset image error state on every selection to force image reload.
    setImageError(false);

    // Only reset details if a different satellite is selected
    if (selectedSatellite?.id !== id) {
      setSelectedSatellite(sat);
      setDetails(null); // Reset details to ensure re-fetching
      setPolarInfo({ azimuth: 0, elevation: 0, nextAOSCountdown: -1 }); // Reset polar info
      setTrajectoryPoints([]); // Clear trajectory points
    }
    // Clear search input and suggestions after selecting
    setSearchQuery("");
    setFilteredSatellites([]);
    setShowSuggestions(false); // Hide suggestions after selection
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (filteredSatellites.length > 0) {
      handleSatelliteSelect(filteredSatellites[0].id); // Sélectionne le premier résultat
    }
  };

  const handleInputFocus = () => {
    setShowSuggestions(true); // Afficher les suggestions lorsque l'input est focus
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6">
      <div className="w-full max-w-[1400px] bg-black bg-opacity-70 rounded-x2 p-6">
        <div className="w-full flex justify-center mb-4"> {/* Réduction de la marge */}
          <TypewriterEffectSmooth
            as="h1"
            words={[
              { text: "Satellite", className: "text-purple" },
              { text: "Explorer", className: "text-white" },
            ]}
            className="text-2xl font-bold text-center text-white"
            cursorClassName="bg-purple"
          />
        </div>
        <p className="text-center text-gray-400 mb-4">{t("betaDescription")}</p> {/* Réduction de la marge */}
        <div className="relative mx-auto w-full max-w-2xl mb-6">
          <InputSearch
            placeholder="Rechercher un satellite..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus} // Afficher les suggestions au focus
            className="w-80 mx-auto" // Centrer l'input
            showButton={false} // Désactive le bouton "loupe" pour cette page
          />
          {showSuggestions && filteredSatellites.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-80 bg-black/70 rounded-lg mt-2 max-h-[150px] overflow-y-auto z-50 shadow-lg" // Centré avec l'input
            >
              {filteredSatellites.map((sat) => (
                <div
                  key={sat.id}
                  className="p-2 text-white hover:bg-zinc-700 cursor-pointer"
                  onClick={() => handleSatelliteSelect(sat.id)}
                >
                  {sat.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSatellite && (
          <div className="mt-6 p-4 rounded-lg flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-6"> {/* Increased gap */}
                <h2 className="text-3xl font-bold text-white"> {/* Larger title */}
                  {details?.name || selectedSatellite.name}
                </h2>
                {details?.country_image && (
                  <div className="w-20 h-12 rounded-md shadow-md overflow-hidden">
                    <img
                      src={details.country_image}
                      alt="Country flag"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <p className="text-gray-300 text-lg"> {/* Larger description */}
                {details?.description || "Aucune description n'est disponible pour le moment."}
              </p>
              <div className="flex flex-col items-start">
                <div className="w-full relative bg-gray-800 bg-opacity-30 shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 rounded-md max-w-[600px]">
                  {/* Removed negative margin from header */}
                  <h2 className="relative z-10 text-white text-center text-4xl font-bold mt-4 mb-4">PolarChart</h2>
                  <div className="absolute top-20 left-2 p-2 text-purple text-xl">
                    Élévation: {polarInfo.elevation}° {/* Elevation in purple */}
                  </div>
                  <div className="absolute top-20 right-2 p-2 text-orange text-xl">
                    Azimuth: {polarInfo.azimuth}° {/* Azimuth in orange */}
                  </div>
                  <div className="flex justify-center mt-8">
                    <div className="w-[500px] h-[500px] flex items-center justify-center rounded-md">
                      <PolarChart 
                        satelliteId={selectedSatellite.id} 
                        trajectoryPoints={trajectoryPoints} // Trajectory points
                      />
                    </div>
                  </div>
                  {/* Restoration of countdown and grid square editing UI */}
                  <div className="flex justify-center items-center mt-4 gap-16">
                    <div className="text-white text-xl">
                      {gridSquare ? countdown : "Renseignez une Grid Square valide"}
                    </div>
                    {isEditingGridSquare ? (
                      <div className="relative">
                        <input
                          type="text"
                          defaultValue={gridSquare || "DM27bf"}
                          onBlur={handleGridSquareBlur}
                          onKeyDown={handleGridSquareKeyDown}
                          className={`bg-gray-700 text-white rounded-full pl-4 pr-4 py-2 w-32 focus:outline-none focus:ring-1 ${
                            gridSquareError ? "ring-red-500" : "ring-purple"
                          } focus:ring-opacity-75 transition-colors ease-in-out duration-300`}
                          autoFocus
                        />
                        {gridSquareError && (
                          <span className="absolute top-full left-0 text-red-500 text-sm animate-pulse mt-1">
                            Gridsquare invalide
                          </span>
                        )}
                      </div>
                    ) : (
                      <span
                        className="text-white cursor-pointer"
                        onClick={() => setIsEditingGridSquare(true)}
                      >
                        (Grid Square: {gridSquare || "N/A"})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/3 flex-shrink-0 relative">
              {imageError || !(details?.photoUrl || selectedSatellite?.image) ? (
                <div className="w-full h-[300px] flex flex-col items-center justify-center bg-gray-900 bg-opacity-30 text-purple text-2xl font-bold rounded-lg">
                  <span>{details?.name || selectedSatellite?.name || "Satellite"}</span>
                  <span>Photo no available</span>
                </div>
              ) : (
                <div className="relative w-full aspect-video">
                  <img
                    src={details?.photoUrl || selectedSatellite?.image}
                    alt={details?.name || selectedSatellite?.name || "Satellite"}
                    className="w-full h-full object-contain rounded-lg"
                    onError={() => setImageError(true)} // Déclenché si l'image échoue à se charger
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Source: {details?.image_source || "https://wikipedia.org"}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {selectedSatellite && (
          <div className="mt-6 w-full text-center">
            <div className="bg-gray-800 bg-opacity-30 shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 rounded-md w-full inline-block">
              <TLEDisplay
                tle1={details?.tle1 || ""}
                tle2={details?.tle2 || ""}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

