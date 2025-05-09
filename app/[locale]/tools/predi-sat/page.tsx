"use client";

import { useState, useEffect } from "react";
import SatelliteSearch from "./SatelliteSearch";
import { TypewriterEffectSmooth } from "@/src/components/features/Typewritter";
import { getSatellites, getSatellitePasses } from "@/src/lib/satelliteAPI";
import SatelliteTimeline from "./SatelliteTimeline";
import SatelliteTab from "./SatelliteTab"; // new import
import AzimuthSelector from "./AzimuthSelector"; // Import du nouveau composant
import { getGridSquareCoords } from "@/src/lib/gridSquare";
import { useI18n } from "@/locales/client"; // Add i18n import
import { getCookieValue, setCookie } from "@/src/lib/cookies"; 
import LocationButton from "@/src/components/features/LocationButton";

interface Satellite {
  name: string;
  id: string;
  category?: string;
  country?: string; // Added country property
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
  const t = useI18n(); // Ajout de la référence i18n

  const handleAccept = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-2 sm:p-4 flex flex-col md:flex-row justify-between items-center z-50"
      style={{
        fontSize: "12px", // plus petit sur mobile
        lineHeight: "1.2",
      }}
    >
      <p className="text-xs sm:text-sm mb-1 md:mb-0 text-center md:text-left">
        {t("cookies.message")}
      </p>
      <button
        onClick={handleAccept}
        className="bg-purple hover:bg-orange hover:text-black text-white px-3 py-1 sm:px-4 sm:py-2 transition-colors rounded-md text-xs sm:text-base"
        style={{
          minWidth: "80px",
        }}
      >
        {t("cookies.accept")}
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

  // Configuration avec élévation par défaut à 20° au lieu de 10°
  const [elevation, setElevation] = useState(20);
  const [minAzimuth, setMinAzimuth] = useState(0); // Valeur par défaut
  const [maxAzimuth, setMaxAzimuth] = useState(360); // Modifié de 359 à 360
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
  const [cityError, setCityError] = useState<string | null>(null); // Nouvel état pour les erreurs de ville
  const [gridSquareInput, setGridSquareInput] = useState("");
  const [gridSquareError, setGridSquareError] = useState<string | null>(null); // Nouvel état pour les erreurs de grid square
  const [invalidGridSquare, setInvalidGridSquare] = useState(false); // Pour suivre si une grid square invalide a été entrée
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
  }, []); // Ajout []

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

  // Modifier la gestion des grid squares pour une meilleure validation
  const handleGridSquareChange = (newGridSquare: string) => {
    setGridSquareInput(newGridSquare);
    
    // Réinitialiser les erreurs pendant la saisie
    setGridSquareError(null);
    
    // Si le champ est vide, tout réinitialiser
    if (!newGridSquare) {
      setInvalidGridSquare(false);
      return;
    }
    
    // Ne pas essayer de valider les grid squares trop courtes
    if (newGridSquare.length < 4) {
      setInvalidGridSquare(false);
      return;
    }
    
    try {
      const coords = getGridSquareCoords(newGridSquare);
      setLatitude(coords.lat);
      setLongitude(coords.lon);
      setInvalidGridSquare(false);
    } catch {
      // Marquer comme invalide mais sans afficher d'erreur pendant la saisie
      setInvalidGridSquare(true);
    }
  };

  // Fonction de validation de grid square lorsqu'on quitte le champ
  const validateGridSquare = () => {
    // Seulement valider si la grid square a une longueur suffisante
    if (gridSquareInput && gridSquareInput.length >= 4) {
      try {
        const coords = getGridSquareCoords(gridSquareInput);
        setLatitude(coords.lat);
        setLongitude(coords.lon);
        setGridSquareError(null);
        setInvalidGridSquare(false);
      } catch {
        // Forcer l'affichage de l'erreur quand l'utilisateur quitte le champ
        setGridSquareError(t("gridSquare.invalid"));
        setInvalidGridSquare(true);
        console.log("Grid square invalide détectée:", gridSquareInput);
      }
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
  }, []); // Ajout []

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

  // Fonction améliorée de validation des coordonnées
  const validateCoordinates = () => {
    let isValid = true;
    let errorMessage = "";

    // Vérifier si les coordonnées sont définies ou si leur format est valide
    if (isNaN(latitude) || isNaN(longitude) || latitude === 0 && longitude === 0) {
      isValid = false;
      errorMessage = t("satellite.missingCoordinates");
      return { isValid, errorMessage };
    }

    if (latitude < -90 || latitude > 90) {
      isValid = false;
      errorMessage = t("satellite.invalidLatitude");
    }

    if (longitude < -180 || longitude > 180) {
      isValid = false;
      errorMessage = isValid ? t("satellite.invalidLongitude") : t("satellite.invalidCoordinates");
    }

    return { isValid, errorMessage };
  };

  // Nouvelle fonction pour gérer le changement d'azimut
  const handleAzimuthChange = (min: number, max: number) => {
    setMinAzimuth(Math.round(min));
    setMaxAzimuth(Math.round(max));
  };

  const getPredictions = async () => {
    if (selectedSatellites.length === 0) {
      setError(t("satellite.errorNoSelection"));
      return;
    }

    // Validate coordinates before making predictions
    const { isValid, errorMessage } = validateCoordinates();
    if (!isValid) {
      setError(errorMessage);
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
            utcOffset,
            undefined, // utiliser le temps de début par défaut
            undefined, // utiliser le temps de fin par défaut
            minAzimuth, // Nouvel argument pour l'azimut minimum
            maxAzimuth // Nouvel argument pour l'azimut maximum
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
      setError(t("satellite.errorFetchingPredictions"));
    } finally {
      setLoading(false);
    }
  };

  const handleLocalTimeChange = (checked: boolean) => {
    setUseLocalTime(checked);
    if (checked) {
      // Local time: utcOffset = browser offset (in hours)
      const offset = -new Date().getTimezoneOffset() / 60;
      setUtcOffset(offset);
    } else {
      // UTC: utcOffset = 0
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

  // Autocomplétion pour les villes - avec gestion des erreurs améliorée
  useEffect(() => {
    if (cityQuery.length > 2) {
      setCityError(null); // Réinitialise l'erreur au début de la recherche
      const timeout = setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(cityQuery)}`)
          .then((response) => response.json())
          .then((data) => {
            setCitySuggestions(data);
            // Si la recherche ne donne pas de résultats, afficher un message d'erreur
            if (data.length === 0 && cityQuery.trim() !== "") {
              setCityError(t("satellite.cityNotFound"));
            }
          })
          .catch(() => {
            setCitySuggestions([]);
            setCityError(t("satellite.citySearchError"));
          });
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setCitySuggestions([]);
      // Ne plus afficher de message d'erreur pour les requêtes trop courtes
      setCityError(null);
    }
  }, [cityQuery, t]); // Ajout [cityQuery, t]

  const handleCitySelect = (city: any) => {
    setCityQuery(city.display_name);
    setLatitude(parseFloat(city.lat));
    setLongitude(parseFloat(city.lon));
    setCityError(null); // Réinitialise l'erreur sur sélection réussie
    setCitySuggestions([]);
    document.activeElement instanceof HTMLElement && document.activeElement.blur();
  };

  const handleGridSquareSubmit = () => {
    try {
      const coords = getGridSquareCoords(gridSquareInput);
      setLatitude(coords.lat);
      setLongitude(coords.lon);
    } catch {
      alert(t("gridSquare.invalid"));
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <div
        className="
          w-full
          max-w-full
          sm:max-w-[1400px]
          bg-black bg-opacity-70
          rounded-2xl
          shadow-lg
          mt-2
          mb-4
          px-1
          py-2
          sm:px-4
          sm:py-6
          mx-1
        "
      >
        <div className="w-full flex justify-center sm:mb-1">
          <TypewriterEffectSmooth
            as="h1"
            words={[
              { text: t("satellite.name"), className: "text-purple" },
              { text: t("satellite.prediction"), className: "text-white" },
            ]}
            className="text-lg xs:text-xl md:text-3xl font-bold text-center text-white overflow-hidden font-alien"
            cursorClassName="bg-purple"
          />
        </div>
        <p className="text-center text-gray-400 mb-2 sm:mb-3 text-xs sm:text-sm">{t("betaDescription")}</p>
        <div className="flex flex-col md:flex-row gap-3 sm:gap-6">
          {/* PARTIE GAUCHE */}
          <div className="md:w-1/2 w-full flex flex-col gap-3 sm:gap-6">
            {/* Box Satellite Predictable */}
            <div className="bg-nottooblack p-2 sm:p-4 rounded-md flex flex-col justify-start">
              <h2 className="text-white text-lg font-bold text-center">
                {t("satellite.predictableSatellites")}
              </h2>
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
            {/* Flèches de sélection - EN DEHORS des deux box, centrées */}
            <div className="flex items-center justify-center my-1">
              <button
                onClick={moveOneDown}
                className="bg-purple text-white rounded-md transition-all duration-300 ease-in-out hover:bg-orange flex items-center justify-center w-24 h-8 sm:w-12 sm:h-12 mx-2"
                title={t("satellite.addSelected")}
                style={{ minWidth: "3.5rem", minHeight: "2rem" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-10 h-5 sm:w-6 sm:h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={moveOneUp}
                className="bg-purple text-white rounded-md transition-all duration-300 ease-in-out hover:bg-orange flex items-center justify-center w-24 h-8 sm:w-12 sm:h-12 mx-2"
                title={t("satellite.removeSelected")}
                style={{ minWidth: "3.5rem", minHeight: "2rem" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-10 h-5 sm:w-6 sm:h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
            {/* Box Satellite To Predict */}
            <div className="bg-zinc-800 p-2 sm:p-4 rounded-md flex flex-col gap-2 sm:gap-4">
              <div className="flex items-center justify-between relative">
                <h2 className="text-white text-lg text-center w-full">{t("satellite.satellitesToPredict")}</h2>
                <button
                  onClick={() => {
                    setSelectedSatellites([]);
                    setSelectedChosenId(null);
                  }}
                  className="text-sm font-bold text-white hover:text-red-600 transition-colors absolute right-2"
                >
                  {t("satellite.cleanAll")}
                </button>
              </div>
              {/* Cases identiques à SatelliteSearch mais un peu plus grandes */}
              <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 sm:gap-3 max-h-[150px] sm:max-h-[240px] overflow-y-auto mt-1">
                {selectedSatellites.map((sat) => {
                  const isSelected = sat.id === selectedChosenId;
                  const countries = sat.country
                    ? sat.country.split(",").map((c) => c.trim().toLowerCase())
                    : [];
                  return (
                    <div
                      key={sat.id}
                      onClick={() => {
                        setSelectedChosenId(sat.id);
                        setSelectedAvailableId(null);
                      }}
                      className={`group relative cursor-pointer rounded-md p-4 sm:p-5 text-base sm:text-lg font-medium min-h-[60px] sm:min-h-[80px] flex flex-col justify-center
                        ${
                          isSelected
                            ? "bg-purple text-white"
                            : "bg-zinc-700 text-white hover:bg-purple hover:text-white"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <p className="m-0">{sat.name}</p>
                          {countries.length === 4 ? (
                            <span className="ml-1 grid grid-cols-2 gap-[2px]">
                              {countries.map((code, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block"
                                  style={{
                                    width: 26,
                                    height: 18,
                                    minWidth: 26,
                                    minHeight: 18,
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    background: "#27272a",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 0,
                                  }}
                                >
                                  <img
                                    src={`/images/flags/${code}.png`}
                                    alt={`flag of ${code}`}
                                    style={{
                                      width: "100%",
                                      height: "auto",
                                      aspectRatio: "3/2",
                                      display: "block",
                                      borderRadius: 3,
                                      background: "#27272a",
                                      objectFit: "cover",
                                    }}
                                  />
                                </span>
                              ))}
                            </span>
                          ) : (
                            countries.map((code, idx) => (
                              <span
                                key={idx}
                                className="inline-block"
                                style={{
                                  width: 26,
                                  height: 18,
                                  minWidth: 26,
                                  minHeight: 18,
                                  borderRadius: 3,
                                  overflow: "hidden",
                                  background: "#27272a",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: 0,
                                }}
                              >
                                <img
                                  src={`/images/flags/${code}.png`}
                                  alt={`flag of ${code}`}
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                    aspectRatio: "3/2",
                                    display: "block",
                                    borderRadius: 3,
                                    background: "#27272a",
                                    objectFit: "cover",
                                  }}
                                />
                              </span>
                            ))
                          )}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(sat.id);
                          }}
                          className={`ml-2 text-base transition-colors duration-300 ${
                            favorites.includes(sat.id) ? "text-orange" : "text-gray-300"
                          } hover:text-orange`}
                          title={t("satellite.addToFavorites")}
                        >
                          {favorites.includes(sat.id) ? "★" : "☆"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* PARTIE DROITE */}
          <div className="md:w-1/2 w-full flex flex-col gap-3 sm:gap-6">
            <div className="bg-nottooblack p-2 sm:p-4 rounded-md h-full justify-start flex flex-col">
              <h2 className="text-white text-lg text-center mb-4">{t("satellite.chooseYourPosition")}</h2>
              {/* Ligne unique pour inputs + bouton + "OR" sur mobile */}
              <div
                className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full mx-auto"
                style={{
                  flexWrap: "nowrap",
                  overflowX: "auto",
                  minWidth: 0,
                  overflowY: "visible",
                  paddingTop: 4,
                  paddingBottom: 4,
                  // Ajout d'un paddingLeft pour laisser la place au ring à gauche du premier input
                  paddingLeft: 8,
                }}
              >
                <div className="relative flex-1 min-w-[120px]">
                  <input
                    type="text"
                    value={cityQuery}
                    onChange={(e) => setCityQuery(e.target.value)}
                    placeholder={t("satellite.cityPlaceholder")}
                    className={`bg-zinc-700 text-white px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple ${
                      cityError ? "border-red-500 border" : ""
                    }`}
                    style={{
                      // Ajout d'un zIndex pour que le ring passe au-dessus du parent scrollable
                      zIndex: 1,
                      position: "relative",
                    }}
                    onFocus={() => setCitySuggestions([])}
                  />
                  {cityError && (
                    <p className="text-red-500 text-sm mt-1 absolute">{cityError}</p>
                  )}
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
                <span className="text-white font-bold px-1 select-none">{t("or")}</span>
                <div className="relative flex-1 min-w-[120px]">
                  <input
                    type="text"
                    value={gridSquareInput}
                    onChange={(e) => handleGridSquareChange(e.target.value)}
                    onBlur={validateGridSquare}
                    placeholder={t("satellite.gridSquarePlaceholder")}
                    className={`bg-zinc-700 text-white px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple ${
                      gridSquareError ? "border-red-500 border" : ""
                    }`}
                    style={{
                      zIndex: 1,
                      position: "relative",
                    }}
                  />
                  {gridSquareError && (
                    <p className="text-red-500 text-sm mt-1 absolute">{gridSquareError}</p>
                  )}
                </div>
                <span className="text-white font-bold px-1 select-none">{t("or")}</span>
                <div className="flex-shrink-0 flex items-center">
                  <LocationButton
                    onClick={useCurrentLocation}
                    loading={locationLoading}
                    title={t("useMyLocation")}
                    size={32}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 sm:gap-2 mt-2 sm:mt-4">
                <div className="flex gap-1 sm:gap-2">
                  <div className="flex flex-col items-center w-1/2">
                    <label className="text-white font-bold mb-1">{t("satellite.latitude")}</label>
                    <input
                      type="text"
                      value={invalidGridSquare ? "..." : (isNaN(latitude) ? "..." : latitude.toFixed(5))}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (!isNaN(value) && value >= -90 && value <= 90) {
                          setLatitude(value);
                          setInvalidGridSquare(false);
                        }
                      }}
                      placeholder={t("satellite.latitude")}
                      className="bg-zinc-700 text-white px-4 py-2 rounded-md w-full text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple"
                    />
                  </div>
                  <div className="flex flex-col items-center w-1/2">
                    <label className="text-white font-bold mb-1">{t("satellite.longitude")}</label>
                    <input
                      type="text"
                      value={invalidGridSquare ? "..." : (isNaN(longitude) ? "..." : longitude.toFixed(5))}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (!isNaN(value) && value >= -180 && value <= 180) {
                          setLongitude(value);
                          setInvalidGridSquare(false);
                        }
                      }}
                      placeholder={t("satellite.longitude")}
                      className="bg-zinc-700 text-white px-4 py-2 rounded-md w-full text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple"
                    />
                  </div>
                </div>
                <p className="text-white text-xs sm:text-sm text-center mt-1 sm:mt-2">
                  {t("satellite.coordinatesExplanation")}
                </p>
              </div>
            </div>
            <div className="bg-nottooblack p-2 sm:p-4 rounded-md">
              <h2 className="text-white text-lg text-center mb-4">{t("satellite.trajectorySettings")}</h2>
              {/* ALIGNEMENT vertical elevation/azimuth */}
              <div className="flex flex-col md:flex-row gap-3 sm:gap-6 items-stretch justify-center">
                <div className="md:w-1/2 flex flex-col items-center justify-center w-full h-full">
                  <div className="flex flex-col h-full w-full">
                    <p className="text-white mb-3 text-center">{t("satellite.minElevation")}</p>
                    <div
                      className="relative flex justify-center items-center mx-auto h-full"
                      style={{ height: "225px", maxWidth: "100%" }} // Hauteur réduite
                    >
                      <div className="vertical-slider-container" style={{ height: "160px", width: "32px", position: "relative" }}>
                        <div 
                          className="slider-track-bg"
                          style={{
                            position: "absolute",
                            width: "6px",
                            height: "100%",
                            backgroundColor: "#333333",
                            borderRadius: "3px",
                            left: "50%",
                            transform: "translateX(-50%)"
                          }}
                        />
                        <div 
                          className="slider-track-fill"
                          style={{
                            position: "absolute",
                            width: "6px",
                            bottom: "0",
                            backgroundColor: "#b400ff",
                            borderRadius: "3px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            height: `${(elevation/90) * 100}%`
                          }}
                        />
                        <div
                          className="slider-thumb"
                          style={{
                            position: "absolute",
                            width: "16px",
                            height: "16px",
                            backgroundColor: "#b400ff",
                            borderRadius: "50%",
                            left: "50%",
                            bottom: `calc(${(elevation/90) * 100}% - 8px)`,
                            transform: "translateX(-50%)",
                            boxShadow: "0 0 5px rgba(180, 0, 255, 0.5)"
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            cursor: "pointer",
                            left: 0,
                            top: 0
                          }}
                          onMouseDown={(e) => {
                            const container = e.currentTarget;
                            const rect = container.getBoundingClientRect();
                            
                            const calculateElevation = (clientY: number) => {
                              const y = clientY - rect.top;
                              const percentage = 1 - Math.max(0, Math.min(1, y / rect.height));
                              const newValue = Math.round(percentage * 90);
                              setElevation(Math.max(0, Math.min(90, newValue)));
                            };
                            
                            calculateElevation(e.clientY);
                            
                            const handleMove = (moveEvent: MouseEvent) => {
                              calculateElevation(moveEvent.clientY);
                            };
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            
                            document.addEventListener('mousemove', handleMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const y = e.clientY - rect.top;
                            const percentage = 1 - Math.max(0, Math.min(1, y / rect.height));
                            const newValue = Math.round(percentage * 90);
                            setElevation(Math.max(0, Math.min(90, newValue)));
                          }}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            
                            const container = e.currentTarget;
                            const rect = container.getBoundingClientRect();
                            
                            const calculateElevation = (clientY: number) => {
                              if (!rect) return;
                              const y = clientY - rect.top;
                              const percentage = 1 - Math.max(0, Math.min(1, y / rect.height));
                              const newValue = Math.round(percentage * 90);
                              setElevation(Math.max(0, Math.min(90, newValue)));
                            };
                            
                            if (e.touches && e.touches[0]) {
                              calculateElevation(e.touches[0].clientY);
                            };
                            
                            const handleTouchMove = (touchEvent: TouchEvent) => {
                              touchEvent.preventDefault();
                              if (touchEvent.touches && touchEvent.touches[0]) {
                                calculateElevation(touchEvent.touches[0].clientY);
                              }
                            };
                            
                            const handleTouchEnd = () => {
                              document.removeEventListener('touchmove', handleTouchMove, { passive: false } as EventListenerOptions);
                              document.removeEventListener('touchend', handleTouchEnd);
                            };
                            
                            document.addEventListener('touchmove', handleTouchMove, { passive: false });
                            document.addEventListener('touchend', handleTouchEnd);
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="text-purple text-xs sm:text-sm"
                      style={{
                        marginTop: 8, // réduit pour s'adapter à la nouvelle hauteur
                        textAlign: "center",
                        minHeight: 20,
                      }}
                    >
                      {elevation}°
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 flex flex-col items-center justify-center w-full h-full">
                  <div className="flex flex-col h-full w-full items-center">
                    <p className="text-white mb-2 text-center pl-6" style={{ marginBottom: 8 }}>{t("satellite.azimuthFilter")}</p>
                    <AzimuthSelector
                      minAzimuth={minAzimuth}
                      maxAzimuth={maxAzimuth}
                      onChange={handleAzimuthChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bouton Predict */}
        <div className="mt-4 sm:mt-8 w-full flex flex-col items-center">
          <button
            onClick={getPredictions}
            className="w-full max-w-xs sm:max-w-fit px-[20px] sm:px-[40px] py-[12px] sm:py-[17px] rounded-full cursor-pointer border-0 bg-white text-purple shadow-[0_0_8px_rgba(0,0,0,0.05)] tracking-[1.5px] uppercase text-[14px] sm:text-[15px] transition-all duration-500 ease-in-out hover:tracking-[3px] hover:bg-purple hover:text-white hover:shadow-[0_7px_29px_0_rgb(93_24_220)] active:tracking-[3px] active:bg-purple active:text-white active:shadow-none active:translate-y-[10px]"
          >
            {t("satellite.predict")}
          </button>
          {error && <p className="text-red-500 mt-2 sm:mt-4 text-center text-sm">{error}</p>}
        </div>
        {/* Timeline/Table view toggles */}
        {allPredictions.length > 0 && (
          <div className="mt-2 sm:mt-4 flex flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center bg-nottooblack rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1 text-sm text-white ${
                  viewMode === "timeline" ? "bg-purple" : "bg-gray-800 hover:bg-purple"
                }`}
              >
                {t("satellite.timelineView")}
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 text-sm text-white ${
                  viewMode === "table" ? "bg-purple" : "bg-gray-800 hover:bg-purple"
                }`}
              >
                {t("satellite.tableView")}
              </button>
            </div>
            <div className="flex items-center bg-nottooblack rounded-md overflow-hidden">
              <button
                onClick={() => {
                  setUseLocalTime(false);
                  setUtcOffset(0); // UTC: offset = 0
                }}
                className={`px-3 py-1 text-sm text-white ${
                  !useLocalTime ? "bg-purple" : "bg-gray-800 hover:bg-purple"
                }`}
              >
                {t("satellite.utcTime")}
              </button>
              <button
                onClick={() => {
                  setUseLocalTime(true);
                  // Local time: offset = browser offset
                  const offset = -new Date().getTimezoneOffset() / 60;
                  setUtcOffset(offset);
                }}
                className={`px-3 py-1 text-sm text-white ${
                  useLocalTime ? "bg-purple" : "bg-gray-800 hover:bg-purple"
                }`}
              >
                {t("satellite.localTime")}
              </button>
            </div>
          </div>
        )}
        {/* Timeline/Table */}
        {allPredictions.length > 0 && (
          <div className="mt-4 sm:mt-6 w-full flex justify-center">
            <div className="w-full max-w-full sm:max-w-[1400px] overflow-visible">
              {allPredictions.every(pred => pred.passes.length === 0) ? (
                <div className="w-full text-center text-red-500 font-bold text-lg py-8">
                  {t("satellites.countdown.noPassPredicted")}
                </div>
              ) : viewMode === "timeline" ? (
                <div className="overflow-x-auto">
                  <SatelliteTimeline
                    key={JSON.stringify(allPredictions)}
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
                </div>
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
      <CookieBanner />
    </div>
  );
}

