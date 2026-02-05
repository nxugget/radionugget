"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation"; // Added usePathname
import SatelliteSearch from "../predi-sat/SatelliteSearch";
import Link from "next/link";
import PolarChart from "./PolarChart";
import dynamic from "next/dynamic";
import TLEDisplay from "./tle";
import { getFavorites, setFavorites } from "@/src/lib/favorites";
import { getSatellites } from "@/src/lib/satelliteAPI";
import { getGridSquareCoords } from "@/src/lib/gridSquare";
import { twoline2satrec, propagate, gstime, eciToEcf, ecfToLookAngles, EciVec3 } from "satellite.js";
import { useI18n } from "@/locales/client"; // Add i18n import
import InputSearch from "@/src/components/ui/InputSearch"; // Import du composant InputSearch
import { isValidGridSquare } from "@/src/lib/checkGridSquare"; // Import the validation function

// Import dynamique pour éviter les erreurs SSR avec Leaflet
const AreaSatMap = dynamic(() => import("./SatMap"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[300px] glass-light rounded-xl">
      <div className="text-white">Chargement de la carte...</div>
    </div>
  )
});

interface AreaSat {
  id: string;
  name: string;
  category?: string;
  image?: string;
  country?: string; // Ajout de la propriété country
}

interface TransponderMode {
  name: string;
  status: string;
  uplink?: string;
  downlink?: string;
  beacon?: string;
  mode: string;
}

interface AreaSatDetails {
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
  transmitters?: any[]; // Added transmitters for compatibility
}

interface Point {
  az: number;
  el: number;
  time?: Date; // Add time property
}

const deg2rad = (deg: number) => deg * (Math.PI / 180);
const rad2deg = (rad: number) => rad * (180 / Math.PI);

// Ajout de la fonction helper pour formater la fréquence
const formatFrequency = (freq: number): string =>
  `${(freq / 1000000).toFixed(4).replace('.', ',')}`;

function isValidEciVec3(value: any): value is EciVec3<number> {
  return value && typeof value === "object" && "x" in value && "y" in value && "z" in value;
}

// Constantes pour le localStorage
const GRIDSQUARE_STORAGE_KEY = "satellite-explorer-gridsquare";

function SatelliteItem({ areaSat }: { areaSat: any }) {
  const countries = areaSat.country 
    ? areaSat.country.split(",").map((c: string) => c.trim().toLowerCase()) 
    : [];

  return (
    <div>
      <h2 className="flex items-center gap-2">
        {areaSat.name}
        {countries.map((code: string, idx: number) => (
          <img
            key={idx}
            src={`/images/flags/${code}.png`}
            alt={code}
            className="w-6 h-4 object-cover rounded"
          />
        ))}
      </h2>
      {areaSat.transmitters && areaSat.transmitters.length > 0 && (
        <div>
          <h3>Transmitters</h3>
          <ul>
            {areaSat.transmitters.map((tx: any, idx: number) => (
              <li key={idx}>
                {tx.description ? tx.description : ""}
                {tx.mode && ` – Mode: ${tx.mode}`}
                {tx.downlink && ` – Downlink: ${tx.downlink}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AreaSatInfoPage() {
  const t = useI18n(); // Initialize i18n
  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize router
  const pathname = usePathname(); // Get current pathname
  const areaSatId = searchParams ? searchParams.get("satelliteId") : null; // Add null check for searchParams

  const [areaSats, setAreaSats] = useState<AreaSat[]>([]);
  const [selectedAreaSat, setSelectedAreaSat] = useState<AreaSat | null>(null);
  const [details, setDetails] = useState<AreaSatDetails | null>(null);
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
  const [filteredAreaSats, setFilteredAreaSats] = useState<AreaSat[]>([]); // Satellites filtrés
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false); // État pour afficher/masquer les suggestions
  const suggestionsRef = useRef<HTMLDivElement | null>(null); // Référence pour détecter les clics en dehors
  const [gridSquareError, setGridSquareError] = useState<boolean>(false); // State for error handling
  const [currentPosition, setCurrentPosition] = useState<Point | undefined>(undefined); // State for accurate real-time position
  const [lastTleUpdate, setLastTleUpdate] = useState<string | null>(null); // State to store TLE update time
  const [tleUpdateError, setTleUpdateError] = useState<string | null>(null); // Add error state for debugging
  const [lastTransponderUpdate, setLastTransponderUpdate] = useState<string | null>(null); // Nouvel état pour les transpondeurs
  const [transponderUpdateError, setTransponderUpdateError] = useState<string | null>(null); // Nouvel état pour les erreurs de transpondeurs

  // Effet UNIQUEMENT pour charger la gridsquare du localStorage - séparé des autres effets
  useEffect(() => {
    try {
      // Récupération de la gridsquare stockée ou utilisation de la valeur par défaut
      const storedGridSquare = localStorage.getItem(GRIDSQUARE_STORAGE_KEY);
      
      if (storedGridSquare && isValidGridSquare(storedGridSquare)) {
        setGridSquare(storedGridSquare);
      } else {
        setGridSquare("DM27bf");
      }
      
      // Marquer comme chargée pour éviter les problèmes de rendu
      setGridSquareLoaded(true);
    } catch (error) {
      setGridSquare("DM27bf");
      setGridSquareLoaded(true);
    }
  }, []); // S'exécute uniquement au montage du composant
  
  // Effet SÉPARÉ pour mettre à jour latitude/longitude quand gridSquare change
  useEffect(() => {
    // Ne rien faire si la gridsquare n'est pas encore chargée
    if (!gridSquareLoaded || !gridSquare) return;
    
    try {
      const coords = getGridSquareCoords(gridSquare);
      setLatitude(coords.lat);
      setLongitude(coords.lon);
    } catch (error) {
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
    fetch('/api/tle-last-update')
      .then(response => {
        if (!response.ok) {
          throw new Error(`API error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data && data.lastUpdate) {
          // Format the date to show date and time (without seconds) and specify UTC
          const date = new Date(data.lastUpdate);
          const formattedDate = date.toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, -3);
          setLastTleUpdate(formattedDate);
        } else {
          setTleUpdateError('No lastUpdate field in response');
        }
      })
      .catch(error => {
        setTleUpdateError(error.message);
      });
      
    // Nouvelle requête pour les transpondeurs
    fetch('/api/transponders-last-update')
      .then(response => {
        if (!response.ok) {
          throw new Error(`API error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data && data.updated_at) {
          // Même formatage que pour les TLEs
          const date = new Date(data.updated_at);
          const formattedDate = date.toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, -3);
          setLastTransponderUpdate(formattedDate);
        } else {
          setTransponderUpdateError('No updated_at field in response');
        }
      })
      .catch(error => {
        setTransponderUpdateError(error.message);
      });
  }, []);

  useEffect(() => {
    getSatellites()
      .then((data) => {
        setAreaSats(data);
        if (areaSatId) {
          const sat = data.find((s) => s.id === areaSatId) || null;
          setSelectedAreaSat(sat);
        }
      })
      .catch(console.error);
  }, [areaSatId]); // React to changes in areaSatId

  useEffect(() => {
    setFavs(getFavorites());
  }, []);

  useEffect(() => {
    if (selectedAreaSat && !details) { // Fetch details only if not already loaded
      fetch(`/api/satellite/${selectedAreaSat.id}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`API error ${res.status}: ${errorText}`);
          }
          return res.json();
        })
        .then((data: AreaSatDetails) => {
          setDetails(data);
        })
        .catch((error) => {
          setDetails(null);
        });
    }
  }, [selectedAreaSat, details]);

  useEffect(() => {
    if (selectedAreaSat) {
      console.log("Satellite sélectionné :", selectedAreaSat);
      console.log("Valeur de country :", selectedAreaSat.country);
    }
  }, [selectedAreaSat]);

  // Dynamically update <title> and <meta name="description"> on client navigation
  useEffect(() => {
    if (!selectedAreaSat) return;

    const isFr = pathname?.startsWith("/fr") || false;
    const title = selectedAreaSat.name
      ? `${selectedAreaSat.name} | Area Sat`
      : isFr
        ? "Area Sat | RadioNugget"
        : "Area Sat | RadioNugget";
    const description = selectedAreaSat.name
      ? isFr
        ? `Infos sur ${selectedAreaSat.name} : fréquence, modulation, polar chart et position sur carte en temps réel.`
        : `Info about ${selectedAreaSat.name}: frequency, modulation, polar chart and map.`
      : isFr
        ? "Explorez facilement les satellites avec AreaSat : fréquences, modulations, TLE actualisés, cartes orbitales et polar charts interactives. Le satellite sous toutes ses ondes !"
        : "Easily explore satellites with AreaSat : real-time frequencies, modulations, updated TLE, interactive maps, and detailed polar charts. All satellite data at your fingertips!'";

    document.title = title;

    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);
  }, [selectedAreaSat, pathname]);

  const formatCountdown = (seconds: number): string => {
    if (seconds < 0) return t("satellites.countdown.noPassPredicted");
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60); // Ensure seconds are integers
    
    // Always show hours, minutes and seconds in format HH:MM:SS
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!selectedAreaSat || latitude === null || longitude === null) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/getRealtimePolar?satId=${selectedAreaSat.id}&lat=${latitude}&lon=${longitude}&height=0`);
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
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedAreaSat, latitude, longitude, t]);

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
    } else {
      // CASE 2: Satellite not visible - show ONLY the NEXT pass
      // First, find the time of the next AOS if available from polarInfo
      const maxSecondsSearch = 24 * 60 * 60; // 24 hours search window
      
      // If we know when the next AOS is, use that time
      let nextAosTime: Date | null = null;
      if (polarInfo.nextAOSCountdown > 0) {
        nextAosTime = new Date(now.getTime() + polarInfo.nextAOSCountdown * 1000);
      } else {
        // Otherwise search for the next AOS
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
      }
    }

    // Ensure points are in chronological order
    points.sort((a, b) => 
      (a.time && b.time) ? a.time.getTime() - b.time.getTime() : 0
    );

    setTrajectoryPoints(points);
  }, [details, latitude, longitude, polarInfo]);

  useEffect(() => {
    if (details) {
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
    }
  }, [details, latitude, longitude]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAreaSats([]);
      return;
    }
    const results = areaSats.filter((sat) =>
      sat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAreaSats(results);
  }, [searchQuery, areaSats]);

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
        
        // Sauvegarder dans le localStorage
        localStorage.setItem(GRIDSQUARE_STORAGE_KEY, newGridSquare);
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

  const handleAreaSatSelect = (id: string) => {
    const sat = areaSats.find((s) => s.id === id) || null;

    // Reset image error state on every selection to force image reload.
    setImageError(false);

    // Forcer une navigation "hard" pour que le composant Head soit exécuté côté serveur (SEO dynamique)
    window.location.href = `${pathname}?satelliteId=${id}`;
    // Si tu veux garder la navigation instantanée côté client, commente la ligne ci-dessus et décommente ci-dessous :
    // if (selectedAreaSat?.id !== id) {
    //   setSelectedAreaSat(sat);
    //   setDetails(null);
    //   setPolarInfo({ azimuth: 0, elevation: 0, nextAOSCountdown: -1, nextLOSCountdown: -1 });
    //   setTrajectoryPoints([]);
    //   router.push(`${pathname}?satelliteId=${id}`, { scroll: false });
    // }
    setSearchQuery("");
    setFilteredAreaSats([]);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (filteredAreaSats.length > 0) {
      handleAreaSatSelect(filteredAreaSats[0].id); // Sélectionne le premier résultat
    }
  };

  const handleInputFocus = () => {
    setShowSuggestions(true); // Afficher les suggestions lorsque l'input est focus
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-1 sm:p-3">
      {gridSquareLoaded ? (
        <div className="w-full max-w-[1400px] glass-card rounded-2xl p-2 sm:p-6">
          <div className="w-full flex justify-center mb-3">
            <h2 className="text-lg xs:text-xl md:text-3xl font-bold text-center overflow-hidden font-alien">
              {(() => {
                const title = t("satellites.explorer.title");
                const [first, ...rest] = title.split(" ");
                return (
                  <>
                    <span className="text-gray-200">{first}</span>
                    {" "}
                    <span className="text-gradient-purple">{rest.join(" ")}</span>
                  </>
                );
              })()}
            </h2>
          </div>
          <div className="relative mx-auto w-full max-w-2xl mb-4 sm:mb-6">
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
              className="w-full sm:w-80 mx-auto text-sm sm:text-base"
              showButton={false}
            />
            <div className="flex justify-center mt-2">
              <div className="inline-flex items-center rounded px-1 py-1">
                <span className="italic text-gray-200 text-xs sm:text-sm mr-2">Powered by</span>
                <a href="https://www.satnogs.org" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/images/icon/satnogs.png"
                    alt="SatNOGS"
                    className="h-16 w-16 mx-1 cursor-pointer object-contain"
                    style={{ minWidth: "64px", minHeight: "64px" }}
                  />
                </a>
                <span className="italic text-gray-200 text-xs sm:text-sm mx-1 select-none">
                  {t("and")}
                </span>
                <a href="https://celestrak.com" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/images/icon/celestrak.png"
                    alt="CelesTrak"
                    className="h-16 w-16 mx-1 cursor-pointer object-contain"
                    style={{ minWidth: "64px", minHeight: "64px" }}
                  />
                </a>
              </div>
            </div>
            {showSuggestions && filteredAreaSats.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-1/2 transform -translate-x-1/2 w-full sm:w-80 bg-surface-2/95 backdrop-blur-2xl border border-white/[0.06] rounded-xl mt-2 max-h-[150px] overflow-y-auto z-50 shadow-float"
              >
                {filteredAreaSats.map((sat, index) => (
                  <div
                    key={`${sat.id}-${index}`}
                    className="p-2 text-white hover:bg-white/[0.05] cursor-pointer rounded-lg transition-colors duration-150"
                    onClick={() => handleAreaSatSelect(sat.id)}
                  >
                    {sat.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedAreaSat && (
            <div className="mt-4 sm:mt-6 p-2 sm:p-4 rounded-lg flex flex-col gap-4">
              {/* Bloc transmitters + image */}
              <div className="w-full flex flex-col md:flex-row items-start gap-2 sm:gap-4">
                {/* Sur mobile/tablette, nom + image alignés horizontalement */}
                <div className="w-full flex md:hidden flex-row items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight m-0 p-0">
                      {details?.name || selectedAreaSat.name}
                    </h1>
                    {selectedAreaSat?.country && selectedAreaSat.country.trim() !== "" && (() => {
                      const countries = selectedAreaSat.country.split(",").map(c => c.trim().toLowerCase());
                      return (
                        <div className="flex gap-1 items-center">
                          {countries.map((code, idx) => (
                            <img
                              key={idx}
                              src={`/images/flags/${code}.png`}
                              alt={`flag of ${code}`}
                              className="h-7 w-auto rounded shadow-md align-middle self-center relative -top-px"
                              style={{ display: 'inline-block', verticalAlign: 'middle' }}
                            />
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  {imageError || !(details?.photoUrl || selectedAreaSat?.image) ? null : (
                    <div className="relative w-20 h-20 ml-2">
                      <img
                        src={details?.photoUrl || selectedAreaSat?.image}
                        alt={details?.name || selectedAreaSat?.name || "Satellite"}
                        className="w-full h-full object-contain rounded-lg"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  )}
                </div>
                {/* Transmitters */}
                <div className="flex-1 flex flex-col gap-2 w-full">
                  {/* Sur desktop, nom + flags (image à droite dans colonne séparée) */}
                  <div className="hidden md:flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight m-0 p-0">
                      {details?.name || selectedAreaSat.name}
                    </h1>
                    {selectedAreaSat?.country && selectedAreaSat.country.trim() !== "" && (() => {
                      const countries = selectedAreaSat.country.split(",").map(c => c.trim().toLowerCase());
                      return (
                        <div className="flex gap-1 items-center">
                          {countries.map((code, idx) => (
                            <img
                              key={idx}
                              src={`/images/flags/${code}.png`}
                              alt={`flag of ${code}`}
                              className="h-7 w-auto rounded shadow-md align-middle self-center relative -top-px"
                              style={{ display: 'inline-block', verticalAlign: 'middle' }}
                            />
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  {(details?.transmitters ?? []).length > 0 && (
                    <div className="mt-2 mb-4 sm:mt-4 sm:mb-8">
                      {lastTransponderUpdate && (
                        <p className="text-xs text-gray-400 mb-3">
                          {t("satellites.explorer.lastTransmitterUpdate")} {lastTransponderUpdate} UTC
                        </p>
                      )}
                      <div className="
                        grid 
                        grid-cols-1 
                        xs:grid-cols-2 
                        md:grid-cols-3 
                        lg:grid-cols-4 
                        gap-2 
                        max-h-[200px] 
                        overflow-y-auto
                      ">
                        {(details?.transmitters ?? []).map((tx: any, index: number) => {
                          const isActive = tx.status === "active";
                          return (
                            <div
                              key={index}
                              className={`relative glass-light rounded-xl p-3 border w-full h-36 ${isActive ? "border-green-500/30" : "border-red-500/30"}`}
                            >
                              <div className={`absolute top-2 right-2 rounded-lg px-2 py-0.5 text-xs font-medium ${isActive ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                                {isActive ? t("satellites.transmitter.active") : t("satellites.transmitter.inactive")}
                              </div>
                              <div className="flex flex-col gap-1 h-full">
                                <div className="flex items-center flex-wrap justify-between border-b border-white/[0.06] pb-1 mb-1 pr-12">
                                  <span className="font-medium text-white text-lg break-words">
                                    {tx.description || `Transmitter ${index + 1}`}
                                  </span>
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                  {tx.uplink ? (
                                    <div className="text-sm">
                                      <span className="text-blue-400">↑ {t("satellites.transmitter.uplink")}:</span> <span className="text-white">{formatFrequency(tx.uplink)} MHz</span>
                                    </div>
                                  ) : <div className="text-sm opacity-0">-</div>}
                                  
                                  {tx.downlink ? (
                                    <div className="text-sm">
                                      <span className="text-pink-400">↓ {t("satellites.transmitter.downlink")}:</span> <span className="text-white">{formatFrequency(tx.downlink)} MHz</span>
                                    </div>
                                  ) : <div className="text-sm opacity-0">-</div>}
                                  
                                  {tx.beacon ? (
                                    <div className="text-sm">
                                      <span className="text-yellow-400">🔊 {t("satellites.transmitter.beacon")}:</span> <span className="text-white">{formatFrequency(tx.beacon)} MHz</span>
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
                {/* Image à droite sur desktop uniquement */}
                <div className="hidden md:block flex-shrink-0 w-20 h-20 md:w-72 md:h-32 mb-2 ml-2">
                  {imageError || !(details?.photoUrl || selectedAreaSat?.image) ? null : (
                    <div className="relative w-20 h-20 md:w-72 md:h-32">
                      <img
                        src={details?.photoUrl || selectedAreaSat?.image}
                        alt={details?.name || selectedAreaSat?.name || "Satellite"}
                        className="w-full h-full object-contain rounded-lg"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className={`
                flex 
                flex-col lg:flex-row w-full gap-4 items-stretch min-h-[400px] sm:min-h-[650px] lg:min-h-[650px]
              `}>
                <div className={`
                  flex-1 relative glass-light rounded-xl 
                  transition-shadow duration-300 flex flex-col
                  p-2 sm:p-4
                  min-h-[320px]
                `}>
                  <h2 className="relative z-10 text-white text-center text-xl sm:text-3xl font-bold mt-2 mb-2">
                    {t("satellites.explorer.polarChart")}
                  </h2>
                  <div className="absolute top-10 sm:top-16 left-2 sm:left-16 p-1 sm:p-2 text-purple text-base sm:text-lg">
                    {t("satellites.explorer.elevation")} {polarInfo.elevation}°
                  </div>
                  <div className="absolute top-10 sm:top-16 right-2 sm:right-16 p-1 sm:p-2 text-orange text-base sm:text-lg">
                    {t("satellites.explorer.azimuth")} {polarInfo.azimuth}°
                  </div>
                  <div className="flex justify-center mt-2 flex-grow">
                    <div className="w-full max-w-[350px] sm:max-w-[550px] flex items-center justify-center">
                      <PolarChart 
                        areaSatId={selectedAreaSat.id} 
                        trajectoryPoints={trajectoryPoints}
                        currentPosition={currentPosition}
                        currentTime={new Date()}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center items-center mt-2 sm:mt-4 gap-2 sm:gap-16">
                    <div className={`
                      ${polarInfo.elevation > 0 ? "text-red-600" : "text-[#228B22]"} 
                      text-base sm:text-lg
                    `}>
                      {gridSquare ? countdown : t("satellites.explorer.enterValidGridSquare")}
                    </div>
                    <div className="flex items-center">
                      <label htmlFor="gridSquareInput" className="text-white mr-2 text-xs sm:text-base">
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
                            className={`bg-white/[0.04] border border-white/[0.08] text-white rounded-lg px-3 py-1 w-24 focus:outline-none focus:ring-1 ${
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
                          className="bg-white/[0.04] border border-white/[0.08] text-white rounded-lg px-3 py-1 w-24 text-center hover:bg-white/[0.08] transition-colors"
                        >
                          {gridSquare || t("satellites.explorer.setGrid")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* Carte avec aspect ratio responsive */}
                <div className="flex-1 relative glass-light rounded-xl transition-shadow duration-300 flex flex-col p-0 mt-2 lg:mt-0" style={{ minHeight: '500px' }}>
                  <h2 className="relative z-10 text-white text-center text-xl sm:text-3xl font-bold my-1">
                    {t("satellites.explorer.satMap")}
                  </h2>
                  <div className="flex-1 w-full relative" style={{ minHeight: '450px' }}>
                    {details?.tle1 && details?.tle2 && (
                      <div className="absolute inset-0">
                        <AreaSatMap 
                          areaSatId={selectedAreaSat.id}
                          tle1={details.tle1}
                          tle2={details.tle2}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedAreaSat && (
            <div className="mt-4 sm:mt-6 w-full text-center">
              <div className="glass-light rounded-xl hover:shadow-xl transition-shadow duration-300 p-2 sm:p-4 w-full inline-block">
                <h2 className="relative z-10 text-white text-center text-xl sm:text-3xl font-bold mt-2 sm:mt-4 mb-1">
                  {t("satellites.explorer.tleTitle")}
                </h2>
                {lastTleUpdate && (
                  <p className="text-center text-xs text-gray-400 mb-2 sm:mb-3">
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
        <div className="w-full max-w-[1400px] glass-card rounded-2xl p-3 sm:p-6 flex justify-center items-center min-h-[200px] sm:min-h-[300px]">
          <p className="text-white text-base sm:text-xl">{t("satellites.explorer.loading")}</p>
        </div>
      )}
    </div>
  );
}

