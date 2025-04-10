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
import SatMap from "./SatMap"; // Import the SatMap component

interface Satellite {
  id: string;
  name: string;
  category?: string;
  image?: string;
}

interface TransponderMode {
  name: string;
  status: string;
  uplink?: string;
  downlink?: string;
  beacon?: string;
  mode: string;
}

interface SatelliteDetails {
  id: string;
  name: string;
  description: string;
  status: string;
  frequency: {
    downlink?: string;
    uplink?: string;
  };
  modulation: string;
  photoUrl: string;
  tle1: string;
  tle2: string;
  image_source: string;
  country_image?: string; // Ajout de l'image du drapeau
  transponders?: {
    modes: TransponderMode[];
  };
}

interface Point {
  az: number;
  el: number;
  time?: Date; // Add time property
}

const deg2rad = (deg: number) => deg * (Math.PI / 180);
const rad2deg = (rad: number) => rad * (180 / Math.PI);

function isValidEciVec3(value: any): value is EciVec3<number> {
  return value && typeof value === "object" && "x" in value && "y" in value && "z" in value;
}

// Constantes pour le localStorage
const GRIDSQUARE_STORAGE_KEY = "satellite-explorer-gridsquare";

export default function SatelliteInfoPage() {
  const t = useI18n(); // Initialize i18n
  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize router
  const satelliteId = searchParams ? searchParams.get("satelliteId") : null; // Add null check for searchParams

  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);
  const [details, setDetails] = useState<SatelliteDetails | null>(null);
  const [favorites, setFavs] = useState<string[]>([]);
  const [polarInfo, setPolarInfo] = useState<{ 
    azimuth: number; 
    elevation: number; 
    nextAOSCountdown: number; 
    nextLOSCountdown: number;
  }>({ azimuth: 0, elevation: 0, nextAOSCountdown: -1, nextLOSCountdown: -1 });
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gridSquare, setGridSquare] = useState<string | null>(null);
  const [gridSquareLoaded, setGridSquareLoaded] = useState(false);
  const [isEditingGridSquare, setIsEditingGridSquare] = useState<boolean>(false); // Editing state
  const [countdown, setCountdown] = useState<string>("");
  const [imageError, setImageError] = useState(false); // Nouvel état pour gérer l'erreur d'image
  const [trajectoryPoints, setTrajectoryPoints] = useState<Point[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // État pour la recherche
  const [filteredSatellites, setFilteredSatellites] = useState<Satellite[]>([]); // Satellites filtrés
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false); // État pour afficher/masquer les suggestions
  const suggestionsRef = useRef<HTMLDivElement | null>(null); // Référence pour détecter les clics en dehors
  const [gridSquareError, setGridSquareError] = useState<boolean>(false); // State for error handling
  const [currentPosition, setCurrentPosition] = useState<Point | undefined>(undefined); // State for accurate real-time position
  const [lastTleUpdate, setLastTleUpdate] = useState<string | null>(null); // State to store TLE update time
  const [tleUpdateError, setTleUpdateError] = useState<string | null>(null); // Add error state for debugging
  const [lastTransponderUpdate, setLastTransponderUpdate] = useState<string | null>(null); // Nouvel état pour les transpondeurs
  const [transponderUpdateError, setTransponderUpdateError] = useState<string | null>(null); // Nouvel état pour les erreurs de transpondeurs

  // New states for focus mode
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const focusContainerRef = useRef<HTMLDivElement>(null);

  // Effet UNIQUEMENT pour charger la gridsquare du localStorage - séparé des autres effets
  useEffect(() => {
    try {
      // Récupération de la gridsquare stockée ou utilisation de la valeur par défaut
      const storedGridSquare = localStorage.getItem(GRIDSQUARE_STORAGE_KEY);
      
      if (storedGridSquare && isValidGridSquare(storedGridSquare)) {
        console.log("Loaded GridSquare from localStorage:", storedGridSquare);
        setGridSquare(storedGridSquare);
      } else {
        console.log("Using default GridSquare: DM27bf");
        setGridSquare("DM27bf");
      }
      
      // Marquer comme chargée pour éviter les problèmes de rendu
      setGridSquareLoaded(true);
    } catch (error) {
      console.error("Error loading GridSquare from localStorage:", error);
      setGridSquare("DM27bf");
      setGridSquareLoaded(true);
    }
  }, []); // S'exécute uniquement au montage du composant
  
  // Effet SÉPARÉ pour mettre à jour latitude/longitude quand gridSquare change
  useEffect(() => {
    // Ne rien faire si la gridsquare n'est pas encore chargée
    if (!gridSquareLoaded || !gridSquare) return;
    
    try {
      console.log("Updating coordinates from GridSquare:", gridSquare);
      const coords = getGridSquareCoords(gridSquare);
      setLatitude(coords.lat);
      setLongitude(coords.lon);
    } catch (error) {
      console.error("Error converting grid square to coordinates:", error);
      
      // Fallback à la valeur par défaut en cas d'erreur
      try {
        const defaultCoords = getGridSquareCoords("DM27bf");
        setLatitude(defaultCoords.lat);
        setLongitude(defaultCoords.lon);
      } catch {
        // Fallback vraiment de secours
        setLatitude(48.8566);
        setLongitude(2.3522);
      }
    }
  }, [gridSquare, gridSquareLoaded]);

  useEffect(() => {
    // Fetch the TLE last update data
    console.log('Fetching TLE update information...');
    fetch('/api/tle-last-update')
      .then(response => {
        console.log('TLE update response status:', response.status);
        if (!response.ok) {
          throw new Error(`API error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('TLE update data received:', data);
        if (data && data.lastUpdate) {
          // Format the date to show date and time (without seconds) and specify UTC
          const date = new Date(data.lastUpdate);
          const formattedDate = date.toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, -3);
          console.log('Formatted TLE update date:', formattedDate);
          setLastTleUpdate(formattedDate);
        } else {
          setTleUpdateError('No lastUpdate field in response');
        }
      })
      .catch(error => {
        console.error('Error fetching TLE update information:', error);
        setTleUpdateError(error.message);
      });
      
    // Nouvelle requête pour les transpondeurs
    console.log('Fetching transponder update information...');
    fetch('/api/transponders-last-update')
      .then(response => {
        console.log('Transponder update response status:', response.status);
        if (!response.ok) {
          throw new Error(`API error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Transponder update data received:', data);
        if (data && data.updated_at) {
          // Même formatage que pour les TLEs
          const date = new Date(data.updated_at);
          const formattedDate = date.toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, -3);
          console.log('Formatted transponder update date:', formattedDate);
          setLastTransponderUpdate(formattedDate);
        } else {
          setTransponderUpdateError('No updated_at field in response');
        }
      })
      .catch(error => {
        console.error('Error fetching transponder update information:', error);
        setTransponderUpdateError(error.message);
      });
  }, []);

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

  const formatCountdown = (seconds: number): string => {
    if (seconds < 0) return t("satellites.countdown.noPassPredicted");
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60); // Ensure seconds are integers
    
    // Always show hours, minutes and seconds in format HH:MM:SS
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!selectedSatellite || latitude === null || longitude === null) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/getRealtimePolar?satId=${selectedSatellite.id}&lat=${latitude}&lon=${longitude}&height=0`);
        if (!res.ok) {
          throw new Error("API error");
        }
        const data = await res.json();
        setPolarInfo(data);

        // Update with translations
        if (data.nextLOSCountdown > 0 || data.nextAOSCountdown > 0) {
          setCountdown(
            data.elevation > 0 
              ? (data.nextLOSCountdown > 0 ? `${t("satellites.countdown.losIn")} ${formatCountdown(data.nextLOSCountdown)}` : t("satellites.countdown.noPassPredicted"))
              : (data.nextAOSCountdown > 0 ? `${t("satellites.countdown.aosIn")} ${formatCountdown(data.nextAOSCountdown)}` : t("satellites.countdown.noPassPredicted"))
          );
        } else {
          setCountdown(t("satellites.countdown.noPassNext24h"));
        }
      } catch (e) {
        console.error("Error fetching realtime polar data", e);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedSatellite, latitude, longitude, t]);

  useEffect(() => {
    if (!details?.tle1 || !details?.tle2 || latitude === null || longitude === null) return;

    const satrec = twoline2satrec(details.tle1.trim(), details.tle2.trim());
    const observerCoords = {
      latitude: deg2rad(latitude),
      longitude: deg2rad(longitude),
      height: 0,
    };
    const now = new Date();
    const points: Point[] = [];
    
    // CASE 1: Satellite is currently visible - show current pass only
    if (polarInfo.elevation > 0) {
      // Look back to show the trajectory from the start of pass
      const lookBackSeconds = 30 * 60; // 30 minutes (keep this the same)
      
      // Add past trajectory points
      for (let t = -lookBackSeconds; t < 0; t += 30) { // Increased step to 30 seconds for efficiency
        const sampleTime = new Date(now.getTime() + t * 1000);
        const prop = propagate(satrec, sampleTime);
        if (prop.position && isValidEciVec3(prop.position)) {
          const gmst = gstime(sampleTime);
          const posEcf = eciToEcf(prop.position, gmst);
          const look = ecfToLookAngles(observerCoords, posEcf);
          const el = rad2deg(look.elevation);
          points.push({
            az: rad2deg(look.azimuth),
            el: Math.min(el, 90),
            time: new Date(sampleTime)
          });
        }
      }
      
      // Add future points until the end of THIS pass only
      let inPass = true;
      const maxSeconds = 3 * 60 * 60; // 3 hours maximum search time
      
      for (let t = 0; t <= maxSeconds && inPass; t += 30) {
        const sampleTime = new Date(now.getTime() + t * 1000);
        const prop = propagate(satrec, sampleTime);
        if (prop.position && isValidEciVec3(prop.position)) {
          const gmst = gstime(sampleTime);
          const posEcf = eciToEcf(prop.position, gmst);
          const look = ecfToLookAngles(observerCoords, posEcf);
          const el = rad2deg(look.elevation);
          const az = rad2deg(look.azimuth);
          
          // Add point if satellite is still visible
          if (el > 0) {
            points.push({
              az,
              el: Math.min(el, 90),
              time: new Date(sampleTime)
            });
          } else {
            // When elevation goes below 0, add a final point and exit
            inPass = false;
            points.push({
              az,
              el: 0,
              time: new Date(sampleTime)
            });
          }
        }
      }
      
      console.log(`Computed trajectory for current pass only`);
    } else {
      // CASE 2: Satellite not visible - show ONLY the NEXT pass
      // First, find the time of the next AOS if available from polarInfo
      const maxSecondsSearch = 24 * 60 * 60; // 24 hours search window
      
      // If we know when the next AOS is, use that time
      let nextAosTime: Date | null = null;
      if (polarInfo.nextAOSCountdown > 0) {
        nextAosTime = new Date(now.getTime() + polarInfo.nextAOSCountdown * 1000);
        console.log(`Next AOS in ${polarInfo.nextAOSCountdown} seconds`);
      } else {
        // Otherwise search for the next AOS
        console.log("Searching for next AOS...");
        let prevEl = -1;
        
        for (let t = 0; t <= maxSecondsSearch; t += 60) {
          const sampleTime = new Date(now.getTime() + t * 1000);
          const prop = propagate(satrec, sampleTime);
          if (prop.position && isValidEciVec3(prop.position)) {
            const gmst = gstime(sampleTime);
            const posEcf = eciToEcf(prop.position, gmst);
            const look = ecfToLookAngles(observerCoords, posEcf);
            const el = rad2deg(look.elevation);
            
            // Check crossing from below horizon to above horizon (rising)
            if (prevEl <= 0 && el > 0) {
              nextAosTime = new Date(sampleTime);
              console.log(`Found next AOS at ${nextAosTime.toISOString()}`);
              break;
            }
            prevEl = el;
          }
        }
      }
      
      // If we found a next AOS time, compute the trajectory for just that pass
      if (nextAosTime) {
        // Start from 5 minutes before AOS to ensure we catch the rising point
        const preAosTime = new Date(nextAosTime.getTime() - 5 * 60 * 1000);
        let inPass = false;
        
        // Collect points around the pass (3 hours max)
        for (let t = 0; t <= 3 * 60 * 60; t += 20) { // Higher resolution near AOS
          const sampleTime = new Date(preAosTime.getTime() + t * 1000);
          const prop = propagate(satrec, sampleTime);
          if (prop.position && isValidEciVec3(prop.position)) {
            const gmst = gstime(sampleTime);
            const posEcf = eciToEcf(prop.position, gmst);
            const look = ecfToLookAngles(observerCoords, posEcf);
            const el = rad2deg(look.elevation);
            const az = rad2deg(look.azimuth);
            
            // Detect rising above horizon
            if (!inPass && el > 0) {
              inPass = true;
              // Add a point exactly at the horizon
              points.push({
                az,
                el: 0,
                time: new Date(sampleTime)
              });
            }
            
            // Add points during the pass
            if (inPass) {
              points.push({
                az,
                el: Math.min(el, 90),
                time: new Date(sampleTime)
              });
              
              // Detect setting below horizon
              if (el <= 0) {
                // Add a final point at the horizon
                points.push({
                  az,
                  el: 0,
                  time: new Date(sampleTime)
                });
                break; // We've completed the pass
              }
            }
          }
        }
        
        console.log(`Computed trajectory for next pass with ${points.length} points`);
      } else {
        console.log("No future passes found within search window");
      }
    }

    // Ensure points are in chronological order
    points.sort((a, b) => 
      (a.time && b.time) ? a.time.getTime() - b.time.getTime() : 0
    );

    setTrajectoryPoints(points);
  }, [details, latitude, longitude, polarInfo]);

  useEffect(() => {
    if (!details) return;
    const satrec = twoline2satrec(details.tle1.trim(), details.tle2.trim());
    const observerCoords = {
      latitude: deg2rad(latitude!),
      longitude: deg2rad(longitude!),
      height: 0,
    };
    const interval = setInterval(() => {
      const now = new Date();
      const prop = propagate(satrec, now);
      if (prop.position && isValidEciVec3(prop.position)) {
        const gmst = gstime(now);
        const posEcf = eciToEcf(prop.position, gmst);
        const look = ecfToLookAngles(observerCoords, posEcf);
        setCurrentPosition({
          az: rad2deg(look.azimuth),
          el: Math.min(rad2deg(look.elevation), 90),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
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

  // Function to toggle focus mode
  const toggleFocusMode = () => {
    const newFocusMode = !focusMode;
    setFocusMode(newFocusMode);
    
    // Handle fullscreen
    if (newFocusMode) {
      if (focusContainerRef.current && focusContainerRef.current.requestFullscreen) {
        focusContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
        });
      }
    } else if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit fullscreen mode: ${err.message}`);
      });
    }
  };

  // Event listener for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && focusMode) {
        setFocusMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [focusMode]);

  const handleGridSquareChange = (newGridSquare: string) => {
    if (isValidGridSquare(newGridSquare)) {
      try {
        const coords = getGridSquareCoords(newGridSquare);
        setLatitude(coords.lat);
        setLongitude(coords.lon);
        setGridSquare(newGridSquare);
        setGridSquareError(false); // Clear error if valid
        
        // Sauvegarder dans le localStorage
        localStorage.setItem(GRIDSQUARE_STORAGE_KEY, newGridSquare);
        
        console.log(`Grid square ${newGridSquare} saved to localStorage`);
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
      setPolarInfo({ azimuth: 0, elevation: 0, nextAOSCountdown: -1, nextLOSCountdown: -1 }); // Reset polar info
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
    <div className="flex flex-col items-center justify-start min-h-screen p-3 sm:p-6">
      {gridSquareLoaded ? (
        // Afficher le contenu normal une fois la gridsquare chargée
        <div className="w-full max-w-[1400px] bg-black bg-opacity-70 rounded-lg p-3 sm:p-6">
          {!focusMode && (
            <>
              <div className="w-full flex justify-center mb-2"> {/* Reduced margin between title and beta description */}
                <TypewriterEffectSmooth
                  as="h1"
                  words={[
                    { text: "Satellite", className: "text-purple" },
                    { text: t("satellites.explorer.title"), className: "text-white" },
                  ]}
                  className="text-2xl font-bold text-center text-white"
                  cursorClassName="bg-purple"
                />
              </div>
              <p className="text-center text-gray-400 mb-5">{t("betaDescription")}</p> {/* Increased margin after beta description */}
              
              <div className="relative mx-auto w-full max-w-2xl mb-6">
                {/* TLE Update as small text right above the search input */}
                {lastTleUpdate && (
                  <p className="text-center text-xs text-gray-400 mb-1">
                    {t("satellites.explorer.lastTleUpdate")} {lastTleUpdate} UTC
                  </p>
                )}
                
                <InputSearch
                  placeholder={t("satellites.explorer.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleInputFocus}
                  className="w-full sm:w-80 mx-auto"
                  showButton={false}
                />
                {showSuggestions && filteredSatellites.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-full sm:w-80 bg-black/70 rounded-lg mt-2 max-h-[150px] overflow-y-auto z-50 shadow-lg" // Centré avec l'input
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
            </>
          )}

          {selectedSatellite && (
            <div className={`${focusMode ? 'p-0' : 'mt-6 p-4'} rounded-lg flex flex-col gap-4`}>
              {/* Top row: details text on left, small image on top right - hide in focus mode */}
              {!focusMode && (
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        {details?.name || selectedSatellite.name}
                      </h2>
                      {details?.country_image && (
                        <div className="w-10 h-6 rounded-md shadow-md overflow-hidden">
                          <img
                            src={details.country_image}
                            alt="Country flag"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-gray-300 text-lg">
                      {details?.description ||
                        t("satellites.explorer.noDescription")}
                    </p>
                    
                    {/* Transponder Modes Display */}
                    {details?.transponders?.modes && details.transponders.modes.length > 0 && (
                      <div className="mt-4 mb-8"> {/* On garde la marge en bas */}
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {t("satellites.transponder.title")}
                        </h3>
                        
                        {/* Information de dernière mise à jour des transpondeurs - alignée à gauche comme demandé */}
                        {lastTransponderUpdate && (
                          <p className="text-xs text-gray-400 mb-3">
                            {t("satellites.explorer.lastTransponderUpdate")} {lastTransponderUpdate} UTC
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {details.transponders.modes.map((mode, index) => {
                            // Définir la couleur de bordure en fonction du statut
                            const borderColorClass = mode.status === 'active' 
                              ? 'border-green-500' 
                              : 'border-red-500';
                            
                            return (
                              <div 
                                key={index} 
                                className={`bg-black bg-opacity-60 rounded-lg p-2 border ${borderColorClass} shadow-md w-64 h-36`}
                              >
                                <div className="flex flex-col gap-1 h-full">
                                  {/* Titre en haut avec "Mode" ajouté avant le mode - suppression des événements de survol */}
                                  <div className="flex items-center justify-between border-b border-gray-700 pb-1 mb-1">
                                    <span className="font-medium text-white text-lg">
                                      Mode {mode.mode || `${index+1}`}
                                    </span>
                                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                                      mode.status === 'active' ? 'bg-green-800 text-green-200' : 
                                      'bg-red-800 text-red-200'
                                    }`}>
                                      {mode.status === 'active' 
                                        ? t("satellites.transponder.active") 
                                        : t("satellites.transponder.inactive")}
                                    </span>
                                  </div>
                                  
                                  {/* Contenu des fréquences */}
                                  <div className="flex-1 flex flex-col justify-between">
                                    {mode.uplink ? (
                                      <div className="text-sm">
                                        <span className="text-blue-400">↑ {t("satellites.transponder.uplink")}:</span> <span className="text-white">{mode.uplink} MHz</span>
                                      </div>
                                    ) : <div className="text-sm opacity-0">-</div>}
                                    
                                    {mode.downlink ? (
                                      <div className="text-sm">
                                        {/* Couleur du texte Downlink changée à rose */}
                                        <span className="text-pink-400">↓ {t("satellites.transponder.downlink")}:</span> <span className="text-white">{mode.downlink} MHz</span>
                                      </div>
                                    ) : <div className="text-sm opacity-0">-</div>}
                                    
                                    {mode.beacon ? (
                                      <div className="text-sm">
                                        <span className="text-yellow-400">🔊 {t("satellites.transponder.beacon")}:</span> <span className="text-white">{mode.beacon} MHz</span>
                                      </div>
                                    ) : <div className="text-sm opacity-0">-</div>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-full sm:w-56 flex-shrink-0 mb-2">
                    {imageError || !(details?.photoUrl || selectedSatellite?.image) ? (
                      <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-900 bg-opacity-30 text-purple text-xl font-bold rounded-lg">
                        <span>{details?.name || selectedSatellite?.name || "Satellite"}</span>
                        <span>{t("satellites.explorer.photoNA")}</span>
                      </div>
                    ) : (
                      <div className="relative w-full h-32">
                        <img
                          src={details?.photoUrl || selectedSatellite?.image}
                          alt={details?.name || selectedSatellite?.name || "Satellite"}
                          className="w-full h-full object-contain rounded-lg"
                          onError={() => setImageError(true)}
                        />
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
                          {details?.image_source || t("satellites.explorer.source")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Focus mode container - used for fullscreen */}
              <div 
                ref={focusContainerRef} 
                className={`
                  ${focusMode ? 'fixed inset-0 z-50 bg-black p-2' : 'relative'}
                  transition-all duration-300 ease-in-out
                `}
              >
                {/* FOCUS button row */}
                <div className={`w-full flex justify-center ${focusMode ? 'absolute top-2 left-0 right-0 z-10' : 'mb-2'}`}>
                  <button
                    onClick={toggleFocusMode}
                    className={`
                      px-4 py-1 rounded-full 
                      ${focusMode 
                        ? 'bg-white text-black opacity-60 hover:opacity-100 hover:bg-purple hover:text-white' 
                        : 'bg-purple text-white hover:bg-white hover:text-purple'} 
                      font-medium transition-all duration-300 ease-in-out
                      flex items-center gap-1
                    `}
                  >
                    {focusMode ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {t("satellites.explorer.exitFocus")}
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                        </svg>
                        {t("satellites.explorer.focusMode")}
                      </>
                    )}
                  </button>
                </div>
                
                {/* Charts row with flexible layout based on focus mode */}
                <div className={`
                  flex 
                  ${focusMode 
                    ? 'flex-col lg:flex-row w-full h-full gap-2' 
                    : 'flex-col lg:flex-row w-full gap-4 items-stretch min-h-[650px] lg:min-h-[650px]'
                  }
                `}>
                  {/* PolarChart container */}
                  <div className={`
                    flex-1 relative bg-gray-800 bg-opacity-30 shadow-lg 
                    transition-shadow duration-300 rounded-md flex flex-col
                    ${focusMode ? 'h-1/2 lg:h-full p-2' : 'p-4'}
                  `}>
                    {!focusMode && (
                      <h2 className="relative z-10 text-white text-center text-3xl sm:text-4xl font-bold mt-2 mb-2">
                        {t("satellites.explorer.polarChart")}
                      </h2>
                    )}
                    
                    {/* Information de position - affichage différent selon le mode */}
                    {focusMode ? (
                      // Affichage en haut au centre pour le mode FOCUS - avec alignement sur une ligne
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/30 px-6 py-3 rounded-xl">
                        <div className="flex items-center justify-center gap-2 text-4xl sm:text-6xl font-bold text-center mb-2">
                          <span className="text-purple">{t("satellites.explorer.elevation")}</span>
                          <span className="text-purple">{polarInfo.elevation}°</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-4xl sm:text-6xl font-bold text-center">
                          <span className="text-orange">{t("satellites.explorer.azimuth")}</span>
                          <span className="text-orange">{polarInfo.azimuth}°</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="absolute top-16 sm:top-20 left-4 sm:left-16 p-2 text-purple text-lg sm:text-xl">
                          {t("satellites.explorer.elevation")} {polarInfo.elevation}°
                        </div>
                        
                        <div className="absolute top-16 sm:top-20 right-4 sm:right-16 p-2 text-orange text-lg sm:text-xl">
                          {t("satellites.explorer.azimuth")} {polarInfo.azimuth}°
                        </div>
                      </>
                    )}
                    
                    <div className={`flex justify-center ${focusMode ? 'mt-12 sm:mt-16' : 'mt-2'} flex-grow`}>
                      <div className={`
                        ${focusMode ? 'w-full h-full' : 'w-full max-w-[550px]'} 
                        flex items-center justify-center
                      `}>
                        <PolarChart 
                          satelliteId={selectedSatellite.id} 
                          trajectoryPoints={trajectoryPoints}
                          currentPosition={currentPosition}
                          currentTime={new Date()}
                        />
                      </div>
                    </div>
                    
                    <div className={`
                      flex flex-col sm:flex-row justify-center items-center 
                      ${focusMode ? 'mt-4 gap-4 sm:gap-8' : 'mt-4 gap-4 sm:gap-16'}
                    `}>
                      <div className={`
                        ${polarInfo.elevation > 0 ? "text-red-600" : "text-[#228B22]"} 
                        ${focusMode ? 'text-4xl sm:text-6xl font-bold' : 'text-lg sm:text-xl'}
                      `}>
                        {gridSquare ? countdown : t("satellites.explorer.enterValidGridSquare")}
                      </div>
                      
                      {/* Hide GridSquare input in focus mode if we already have one set */}
                      {(!focusMode || !gridSquare) && (
                        <div className="flex items-center">
                          <label htmlFor="gridSquareInput" className="text-white mr-2">
                            {t("satellites.explorer.gridSquareLabel")}
                          </label>
                          {isEditingGridSquare ? (
                            <div className="relative">
                              <input
                                id="gridSquareInput"
                                type="text"
                                defaultValue={gridSquare || ""}
                                onBlur={handleGridSquareBlur}
                                onKeyDown={handleGridSquareKeyDown}
                                className={`bg-gray-700 text-white rounded px-3 py-1 w-24 focus:outline-none focus:ring-1 ${
                                  gridSquareError ? "ring-red-500" : "ring-purple"
                                } focus:ring-opacity-75 transition-colors ease-in-out duration-300`}
                                autoFocus
                              />
                              {gridSquareError && (
                                <span className="absolute top-full left-0 text-red-500 text-sm animate-pulse mt-1">
                                  {t("satellites.explorer.invalidGridSquare")}
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsEditingGridSquare(true)}
                              className="bg-gray-700 text-white rounded px-3 py-1 w-24 text-center border border-gray-600 hover:bg-gray-600 transition-colors"
                            >
                              {gridSquare || t("satellites.explorer.setGrid")}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* SatMap container */}
                  <div className={`
                    flex-1 relative bg-gray-800 bg-opacity-30 shadow-lg 
                    transition-shadow duration-300 rounded-md flex flex-col 
                    ${focusMode ? 'h-1/2 lg:h-full p-0' : 'p-0 mt-4 lg:mt-0'}
                  `}>
                    {!focusMode && (
                      <h2 className="relative z-10 text-white text-center text-3xl sm:text-4xl font-bold my-1">
                        {t("satellites.explorer.satMap")}
                      </h2>
                    )}
                    
                    <div className={`flex-grow flex ${focusMode ? 'h-full' : 'min-h-[500px]'}`}>
                      {details?.tle1 && details?.tle2 && (
                        <SatMap 
                          satelliteId={selectedSatellite.id}
                          tle1={details.tle1}
                          tle2={details.tle2}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Show TLE display only when not in focus mode */}
          {selectedSatellite && !focusMode && (
            <div className="mt-6 w-full text-center">
              <div className="bg-gray-800 bg-opacity-30 shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 rounded-md w-full inline-block">
                <h2 className="relative z-10 text-white text-center text-3xl sm:text-4xl font-bold mt-4 mb-1">
                  {t("satellites.explorer.tleTitle")}
                </h2>
                {lastTleUpdate && (
                  <p className="text-center text-xs text-gray-400 mb-3">
                    {t("satellites.explorer.lastTleUpdate")} {lastTleUpdate} UTC
                  </p>
                )}
                <TLEDisplay
                  tle1={details?.tle1 || ""}
                  tle2={details?.tle2 || ""}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        // Afficher un chargement si la gridsquare n'est pas encore chargée
        <div className="w-full max-w-[1400px] bg-black bg-opacity-70 rounded-lg p-3 sm:p-6 flex justify-center items-center min-h-[300px]">
          <p className="text-white text-xl">{t("satellites.explorer.loading")}</p>
        </div>
      )}
    </div>
  );
}

