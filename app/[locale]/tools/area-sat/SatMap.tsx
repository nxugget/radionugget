"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  twoline2satrec,
  propagate,
  gstime,
  eciToGeodetic,
  EciVec3,
} from "satellite.js";


// Define interfaces outside the dynamic import
interface AreaSatMapProps {
  areaSatId: string;
  tle1: string;
  tle2: string;
}

interface GeoPoint {
  lat: number;
  lng: number;
  alt: number; // altitude in km
  time: Date; // Add timestamp to track when this position occurs
}

// Function to check if a value is a valid EciVec3 object
function isValidEciVec3(value: any): value is EciVec3<number> {
  return (
    value && typeof value === "object" && "x" in value && "y" in value && "z" in value
  );
}

// Colors matching PolarChart
const COLORS = {
  PAST_ORBIT: "#dc2626", // Red for LOS - matching text-red-600
  FUTURE_ORBIT: "#228B22", // Green for AOS - matching text-[#228B22]
  AREA_SAT: "white", // Changed to white for the areaSat marker
};

// Define styles as a JavaScript object to keep everything in one file
const styles = {
  mapContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    padding: "0",
    margin: "0",
  } as CSSProperties,
  leafletMap: {
    width: "100%",
    height: "100%",
    backgroundColor: "#111",
    zIndex: 1,
    margin: "0",
    padding: "0",
  } as CSSProperties,
  loadingContainer: {
    width: "100%",
    height: "100%",
    minHeight: "300px", // Increased from 0 to ensure visibility
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    color: "white",
    borderRadius: "8px",
  } as CSSProperties,
};

// Create the component that will be dynamically loaded
const AreaSatMapComponent = ({ areaSatId, tle1, tle2 }: AreaSatMapProps) => {
  // sécurité supplémentaire côté client
  if (typeof window === "undefined") return null;

  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const areaSatMarkerRef = useRef<any>(null);
  const orbitPathsRef = useRef<any[]>([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const satrec = useRef<any>(null);

  // Attendre que le composant soit monté avant d'initialiser la carte
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Ajout d'un état pour forcer le resize sur mobile (si besoin)
  const [forceResize, setForceResize] = useState(false);

  // Constants
  const CALC_POINTS_INTERVAL = 1000 * 30; // 30s entre points pour l'orbite
  const ORBIT_DURATION_PAST = 1000 * 60 * 60; // 1h passée
  const ORBIT_DURATION_FUTURE = 1000 * 60 * 90; // 1.5h future
  const POSITION_UPDATE_INTERVAL = 1000; // maj position toutes les secondes
  const TRAJECTORY_UPDATE_INTERVAL = 10000; // maj trajectoire toutes les 10s

  // Function to calculate areaSat position at a given time
  const calculatePosition = (satrecObj: any, date: Date): GeoPoint | null => {
    try {
      const positionAndVelocity = propagate(satrecObj, date);

      // Check if positionAndVelocity is a valid object with a position property
      if (
        !positionAndVelocity ||
        typeof positionAndVelocity === "boolean" ||
        !positionAndVelocity.position
      ) {
        return null;
      }

      // Check if the position is a valid EciVec3 object
      if (!isValidEciVec3(positionAndVelocity.position)) {
        return null;
      }

      const gmst = gstime(date);
      const position = eciToGeodetic(positionAndVelocity.position, gmst);

      return {
        lat: (position.latitude * 180) / Math.PI,
        lng: (position.longitude * 180) / Math.PI,
        alt: position.height,
        time: date,
      };
    } catch (e) {
      console.error("Error calculating position:", e);
      return null;
    }
  };

  // Handle Leaflet CSS injection
  useEffect(() => {
    const leafletStyles = `
      .area-sat-map-container {
        width: 100% !important;
        height: 100% !important;
        display: block !important;
      }
      .area-sat-leaflet-map {
        width: 100% !important;
        height: 100% !important;
        display: block !important;
      }
      .leaflet-container {
        width: 100% !important;
        height: 100% !important;
        background: #111 !important;
        border-radius: 8px;
      }
      .leaflet-control-container .leaflet-top,
      .leaflet-control-container .leaflet-bottom {
        z-index: 2;
      }
      .leaflet-bar {
        background-color: #333;
      }
      .leaflet-bar a {
        background-color: #333;
        color: white;
        border-color: #555;
      }
      .leaflet-bar a:hover {
        background-color: #444;
      }
      /* Custom areaSat icon styles */
      .areaSat-icon {
        filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.7));
      }
      /* Remove map edge fade/borders */
      .leaflet-tile {
        background: #111 !important;
      }
    `;

    const styleElement = document.createElement("style");
    styleElement.textContent = leafletStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Simplify: no responsive CSS override needed
  // Parent container controls the height

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInitialized || !isReady) return;

    console.log("Initializing map...");

    const timer = setTimeout(() => {
      try {
        const darkMapUrl =
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

        const southWest = L.latLng(-85, -180);
        const northEast = L.latLng(85, 180);
        const bounds = L.latLngBounds(southWest, northEast);

        let initialCenter: [number, number] = [0, 0];
        let initialZoom = 1;

        if (tle1 && tle2) {
          try {
            const satrecObj = twoline2satrec(tle1.trim(), tle2.trim());
            const now = new Date();
            const positionAndVelocity = propagate(satrecObj, now);
            if (
              positionAndVelocity &&
              typeof positionAndVelocity !== "boolean" &&
              positionAndVelocity.position &&
              isValidEciVec3(positionAndVelocity.position)
            ) {
              const gmst = gstime(now);
              const pos = eciToGeodetic(positionAndVelocity.position, gmst);
              initialCenter = [
                (pos.latitude * 180) / Math.PI,
                (pos.longitude * 180) / Math.PI,
              ];
              initialZoom = 3;
            }
          } catch {
            // fallback: [0,0], zoom 1
          }
        }

        if (!mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          minZoom: 1,
          maxZoom: 10,
          worldCopyJump: true,
          attributionControl: false,
          maxBounds: bounds,
          maxBoundsViscosity: 1.0,
          dragging: true,
          crs: L.CRS.EPSG3857,
        });

        const tileLayer = L.tileLayer(darkMapUrl, {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        tileLayer.on("load", () => {
          console.log("Map tiles loaded");
          setTimeout(() => {
            map.invalidateSize({ animate: false, pan: false });
            console.log("Map resized after tiles loaded");
          }, 100);
        });

        setTimeout(() => {
          if (map) {
            map.invalidateSize({ animate: false, pan: false });
            console.log("Map resized after timeout");
          }
        }, 500);

        mapRef.current = map;
        setMapInitialized(true);
        console.log("Map initialized successfully");

        if (L.Browser.mobile) {
          const handleResize = () => {
            try {
              if (map) map.invalidateSize();
            } catch (e) {
              // Ignore resize errors
            }
          };
          window.addEventListener("resize", handleResize);
        }

        const resizeObserver = new window.ResizeObserver(() => {
          try {
            if (map) map.invalidateSize();
          } catch (e) {
            // Ignore resize errors
          }
        });
        if (mapContainerRef.current) {
          resizeObserver.observe(mapContainerRef.current);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [tle1, tle2, isReady]);

  // Correction : forcer le resize après le premier rendu pour mobile
  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => {
      try {
        if (mapRef.current) mapRef.current.invalidateSize();
      } catch (e) {
        // Ignore resize errors
      }
    }, 500);

    const handleResize = () => {
      try {
        if (mapRef.current) mapRef.current.invalidateSize();
      } catch (e) {
        // Ignore resize errors
      }
    };

    window.addEventListener("orientationchange", handleResize);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("orientationchange", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, [mapInitialized]);

  // Initialize areaSat tracking when TLEs are provided
  useEffect(() => {
    if (!tle1 || !tle2) return;

    try {
      satrec.current = twoline2satrec(tle1.trim(), tle2.trim());
    } catch (e) {
      console.error("Invalid TLE format:", e);
      satrec.current = null;
    }

    return () => {
      if (mapRef.current) {
        orbitPathsRef.current.forEach((path) => {
          if (path) path.removeFrom(mapRef.current);
        });
        orbitPathsRef.current = [];

        if (areaSatMarkerRef.current) {
          areaSatMarkerRef.current.removeFrom(mapRef.current);
          areaSatMarkerRef.current = null;
        }
      }
    };
  }, [tle1, tle2]);

  // Function to update orbit paths based on current time
  const updateOrbitPaths = () => {
    if (!mapRef.current || !satrec.current) return;

    const map = mapRef.current;

    orbitPathsRef.current.forEach((path) => {
      if (path) path.removeFrom(map);
    });
    orbitPathsRef.current = [];

    const now = new Date();

    const pastSegments: Array<[number, number][]> = [[]];
    let currentPastSegment = 0;
    const pastStartTime = new Date(now.getTime() - ORBIT_DURATION_PAST);

    for (
      let time = pastStartTime.getTime();
      time <= now.getTime();
      time += CALC_POINTS_INTERVAL
    ) {
      const date = new Date(time);
      const position = calculatePosition(satrec.current, date);

      if (position) {
        if (pastSegments[currentPastSegment].length > 0) {
          const prevPoint =
            pastSegments[currentPastSegment][
              pastSegments[currentPastSegment].length - 1
            ];

          if (Math.abs(prevPoint[1] - position.lng) > 180) {
            currentPastSegment++;
            pastSegments[currentPastSegment] = [];
          }
        }

        pastSegments[currentPastSegment].push([position.lat, position.lng]);
      }
    }

    pastSegments.forEach((segment) => {
      if (segment.length > 1) {
        const path = L.polyline(segment, {
          color: COLORS.PAST_ORBIT,
          weight: 2,
          opacity: 0.7,
          dashArray: "5, 5",
          smoothFactor: 1,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(map);

        orbitPathsRef.current.push(path);
      }
    });

    const futureSegments: Array<[number, number][]> = [[]];
    let currentFutureSegment = 0;
    const futureEndTime = new Date(now.getTime() + ORBIT_DURATION_FUTURE);

    for (
      let time = now.getTime();
      time <= futureEndTime.getTime();
      time += CALC_POINTS_INTERVAL
    ) {
      const date = new Date(time);
      const position = calculatePosition(satrec.current, date);

      if (position) {
        if (futureSegments[currentFutureSegment].length > 0) {
          const prevPoint =
            futureSegments[currentFutureSegment][
              futureSegments[currentFutureSegment].length - 1
            ];

          if (Math.abs(prevPoint[1] - position.lng) > 180) {
            currentFutureSegment++;
            futureSegments[currentFutureSegment] = [];
          }
        }

        futureSegments[currentFutureSegment].push([position.lat, position.lng]);
      }
    }

    futureSegments.forEach((segment) => {
      if (segment.length > 1) {
        const path = L.polyline(segment, {
          color: COLORS.FUTURE_ORBIT,
          weight: 2,
          opacity: 0.8,
          smoothFactor: 1,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(map);

        orbitPathsRef.current.push(path);
      }
    });
  };

  // Set up areaSat tracking and regular updates
  useEffect(() => {
    if (!mapInitialized || !mapRef.current || !satrec.current) return;

    console.log("Setting up satellite tracking...");

    setTimeout(() => {
      try {
        if (mapRef.current) {
          mapRef.current.invalidateSize({ animate: false, pan: false });
          console.log("Map resized before adding satellite marker");
        }
      } catch (e) {
        console.log("Resize error (safe to ignore):", e);
      }
    }, 200);

    const areaSatIcon = L.icon({
      iconUrl: "/images/icon/satellite-icon.svg",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: "areaSat-icon white-areaSat",
    });

    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .white-areaSat {
        filter: brightness(0) invert(1) drop-shadow(0 0 3px rgba(0, 0, 0, 0.7));
      }
      .area-sat-map-container {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .area-sat-leaflet-map {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(styleElement);

    updateOrbitPaths();

    const currentPosition = calculatePosition(satrec.current, new Date());
    if (currentPosition && mapRef.current) {
      areaSatMarkerRef.current = L.marker(
        [currentPosition.lat, currentPosition.lng],
        {
          icon: areaSatIcon,
          title: areaSatId,
        }
      ).addTo(mapRef.current);
    }

    const positionInterval = setInterval(() => {
      if (!mapRef.current || !satrec.current) return;

      const position = calculatePosition(satrec.current, new Date());
      if (position && areaSatMarkerRef.current) {
        areaSatMarkerRef.current.setLatLng([position.lat, position.lng]);
      }
    }, POSITION_UPDATE_INTERVAL);

    const trajectoryInterval = setInterval(() => {
      updateOrbitPaths();
    }, TRAJECTORY_UPDATE_INTERVAL);

    return () => {
      clearInterval(positionInterval);
      clearInterval(trajectoryInterval);
      document.head.removeChild(styleElement);
    };
  }, [mapInitialized, areaSatId]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[300px] bg-gray-900 rounded-md">
        <div className="text-white">Initialisation...</div>
      </div>
    );
  }

  return (
    <div className="area-sat-map-container" style={styles.mapContainer}>
      <div
        ref={mapContainerRef}
        className="area-sat-leaflet-map"
        style={styles.leafletMap}
      />
    </div>
  );
};

export default AreaSatMapComponent;

