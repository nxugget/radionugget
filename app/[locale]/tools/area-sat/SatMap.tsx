"use client";

import { useEffect, useRef, useState } from "react";
import { twoline2satrec, propagate, gstime, eciToGeodetic, EciVec3 } from "satellite.js";
import dynamic from "next/dynamic";

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
  return value && typeof value === "object" && "x" in value && "y" in value && "z" in value;
}

// Colors matching PolarChart
const COLORS = {
  PAST_ORBIT: '#dc2626', // Red for LOS - matching text-red-600
  FUTURE_ORBIT: '#228B22', // Green for AOS - matching text-[#228B22]
  AREA_SAT: 'white' // Changed to white for the areaSat marker
};

// Define styles as a JavaScript object to keep everything in one file
const styles = {
  mapContainer: {
    width: "100%",
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    padding: "0",
    margin: "0",
    height: "100%", // Ensure the container has height
    minHeight: "300px", // Add a minimum height to ensure visibility
  } as React.CSSProperties,
  leafletMap: {
    width: "100%",
    backgroundColor: "#111",
    zIndex: 1,
    margin: "0",
    padding: "0",
    height: "100%", // Ensure the map has height
    minHeight: "300px", // Add a minimum height to ensure visibility
  } as React.CSSProperties,
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
  } as React.CSSProperties,
};

// Create the component that will be dynamically loaded
const AreaSatMapComponent = ({ areaSatId, tle1, tle2 }: AreaSatMapProps) => {
  // We need to import Leaflet inside the component to avoid SSR issues
  const L = require("leaflet");
  require("leaflet/dist/leaflet.css");
  
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const areaSatMarkerRef = useRef<any>(null);
  const orbitPathsRef = useRef<any[]>([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  const satrec = useRef<any>(null);

  // Ajout d'un état pour forcer le resize sur mobile
  const [forceResize, setForceResize] = useState(false);

  // Constants
  const CALC_POINTS_INTERVAL = 1000 * 30; // Reduced to 30 seconds per point for smoother orbits
  const ORBIT_DURATION_PAST = 1000 * 60 * 60; // 1 hour of past orbit
  const ORBIT_DURATION_FUTURE = 1000 * 60 * 90; // 1.5 hours of future orbit
  const POSITION_UPDATE_INTERVAL = 1000; // Update position every second
  const TRAJECTORY_UPDATE_INTERVAL = 10000; // Update trajectory every 10 seconds

  // Function to calculate areaSat position at a given time
  const calculatePosition = (satrecObj: any, date: Date): GeoPoint | null => {
    try {
      const positionAndVelocity = propagate(satrecObj, date);
      
      // Check if positionAndVelocity is a valid object with a position property
      if (!positionAndVelocity || typeof positionAndVelocity === 'boolean' || !positionAndVelocity.position) {
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
    // Add Leaflet specific CSS to handle zoom controls and other elements
    const leafletStyles = `
      .leaflet-container {
        width: 100% !important;
        height: 100% !important;
        min-height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
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

    // Create a style element and append it to the head
    const styleElement = document.createElement('style');
    styleElement.textContent = leafletStyles;
    document.head.appendChild(styleElement);

    return () => {
      // Clean up the style element when component unmounts
      document.head.removeChild(styleElement);
    };
  }, []);

  // Inject responsive CSS for map height (mobile/desktop)
  useEffect(() => {
    const responsiveStyle = document.createElement("style");
    responsiveStyle.textContent = `
      /* Mobile: force explicit height */
      @media (max-width: 640px) {
        .area-sat-map-container, .area-sat-leaflet-map {
          height: 300px !important; /* Increased from 220px */
          min-height: 300px !important; /* Increased from 220px */
          max-height: 350px !important; /* Increased from 300px */
        }
      }
      /* Desktop: fill parent */
      @media (min-width: 641px) {
        .area-sat-map-container, .area-sat-leaflet-map {
          height: 100% !important;
          min-height: 300px !important; /* Increased from 220px */
          max-height: 100vh !important;
        }
      }
    `;
    document.head.appendChild(responsiveStyle);
    return () => {
      document.head.removeChild(responsiveStyle);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInitialized) return;

    console.log("Initializing map..."); // Add debug log

    const timer = setTimeout(() => {
      try {
        // Custom dark style for map tiles
        const darkMapUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
        
        // Définir les limites de la carte pour éviter le défilement au-delà des bords du monde
        const southWest = L.latLng(-85, -180);
        const northEast = L.latLng(85, 180);
        const bounds = L.latLngBounds(southWest, northEast);

        // Calculer la position initiale du satellite si possible
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
              initialZoom = 3; // Zoom légèrement sur la position du satellite
            }
          } catch {
            // fallback: [0,0], zoom 1
          }
        }

        // Create map instance with modified options
        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          minZoom: 1,
          maxZoom: 10,
          worldCopyJump: true,
          attributionControl: false,
          maxBounds: bounds,
          maxBoundsViscosity: 1.0,
          dragging: true, // Enable dragging for all devices
          tap: true, // Enable tap for all devices
          crs: L.CRS.EPSG3857,
        });

        // Add dark-themed tile layer
        const tileLayer = L.tileLayer(darkMapUrl, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Force multiple resize operations to ensure the map renders properly
        tileLayer.on("load", () => {
          console.log("Map tiles loaded"); // Add debug log
          setTimeout(() => {
            map.invalidateSize({ animate: false, pan: false });
            console.log("Map resized after tiles loaded"); // Add debug log
          }, 100);
        });

        // Additional resize after a short delay
        setTimeout(() => {
          if (map) {
            map.invalidateSize({ animate: false, pan: false });
            console.log("Map resized after timeout"); // Add debug log
          }
        }, 500);

        // Store map reference
        mapRef.current = map;
        setMapInitialized(true);
        console.log("Map initialized successfully"); // Add debug log

        // Correction mobile : forcer un resize si la taille change
        if (L.Browser.mobile) {
          window.addEventListener("resize", () => {
            map.invalidateSize();
          });
        }

        // Correction : forcer le resize si le conteneur change de taille (ex: orientation)
        const resizeObserver = new window.ResizeObserver(() => {
          map.invalidateSize();
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
        setMapInitialized(false);
      }
      // Nettoyage de l'event resize mobile
      if (L.Browser.mobile) {
        window.removeEventListener("resize", () => {
          if (mapRef.current) mapRef.current.invalidateSize();
        });
      }
    };
  }, [L, tle1, tle2]);

  // Correction : forcer le resize après le premier rendu pour mobile
  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => {
      mapRef.current.invalidateSize();
    }, 500);

    // Ajout : forcer le resize sur orientationchange (utile sur mobile)
    const handleResize = () => {
      if (mapRef.current) mapRef.current.invalidateSize();
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

    // Clean up existing paths and markers when TLEs change
    return () => {
      if (mapRef.current) {
        // Clean up paths
        orbitPathsRef.current.forEach(path => {
          if (path) path.removeFrom(mapRef.current);
        });
        orbitPathsRef.current = [];
        
        // Clean up marker
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
    
    // Clear existing paths
    orbitPathsRef.current.forEach(path => {
      if (path) path.removeFrom(map);
    });
    orbitPathsRef.current = [];

    const now = new Date();

    // Calculate past orbit points
    const pastSegments: Array<[number, number][]> = [[]];
    let currentPastSegment = 0;
    const pastStartTime = new Date(now.getTime() - ORBIT_DURATION_PAST);

    // Create points for the past orbit path
    for (let time = pastStartTime.getTime(); time <= now.getTime(); time += CALC_POINTS_INTERVAL) {
      const date = new Date(time);
      const position = calculatePosition(satrec.current, date);
      
      if (position) {
        // Handle the antimeridian crossing
        if (pastSegments[currentPastSegment].length > 0) {
          const prevPoint = pastSegments[currentPastSegment][pastSegments[currentPastSegment].length - 1];
          
          // If there's a big jump in longitude, it indicates crossing the antimeridian
          if (Math.abs(prevPoint[1] - position.lng) > 180) {
            // Start a new segment
            currentPastSegment++;
            pastSegments[currentPastSegment] = [];
          }
        }
        
        pastSegments[currentPastSegment].push([position.lat, position.lng]);
      }
    }

    // Add the past orbit paths to the map with smooth curves
    pastSegments.forEach(segment => {
      if (segment.length > 1) {
        const path = L.polyline(segment, {
          color: COLORS.PAST_ORBIT,
          weight: 2,
          opacity: 0.7,
          dashArray: '5, 5', // Past orbit is dashed
          smoothFactor: 1, // Smooth the curve (lower = smoother)
          lineJoin: 'round', // Use round joints between segments
          lineCap: 'round', // Use round caps at the ends of the line
        }).addTo(map);
        
        orbitPathsRef.current.push(path);
      }
    });

    // Calculate future orbit points
    const futureSegments: Array<[number, number][]> = [[]];
    let currentFutureSegment = 0;
    const futureEndTime = new Date(now.getTime() + ORBIT_DURATION_FUTURE);

    // Create points for the future orbit path
    for (let time = now.getTime(); time <= futureEndTime.getTime(); time += CALC_POINTS_INTERVAL) {
      const date = new Date(time);
      const position = calculatePosition(satrec.current, date);
      
      if (position) {
        // Handle the antimeridian crossing
        if (futureSegments[currentFutureSegment].length > 0) {
          const prevPoint = futureSegments[currentFutureSegment][futureSegments[currentFutureSegment].length - 1];
          
          // If there's a big jump in longitude, it indicates crossing the antimeridian
          if (Math.abs(prevPoint[1] - position.lng) > 180) {
            // Start a new segment
            currentFutureSegment++;
            futureSegments[currentFutureSegment] = [];
          }
        }
        
        futureSegments[currentFutureSegment].push([position.lat, position.lng]);
      }
    }

    // Add the future orbit paths to the map with smooth curves
    futureSegments.forEach(segment => {
      if (segment.length > 1) {
        const path = L.polyline(segment, {
          color: COLORS.FUTURE_ORBIT,
          weight: 2,
          opacity: 0.8,
          // No dashArray for future orbit (solid line)
          smoothFactor: 1, // Smooth the curve (lower = smoother)
          lineJoin: 'round', // Use round joints between segments
          lineCap: 'round', // Use round caps at the ends of the line
        }).addTo(map);
        
        orbitPathsRef.current.push(path);
      }
    });
  };

  // Set up areaSat tracking and regular updates
  useEffect(() => {
    if (!mapInitialized || !mapRef.current || !satrec.current) return;

    console.log("Setting up satellite tracking..."); // Add debug log

    // Correction : s'assurer que le conteneur a une taille correcte avant d'ajouter les éléments
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize({ animate: false, pan: false });
        console.log("Map resized before adding satellite marker"); // Add debug log
      }
    }, 200);

    // Create custom areaSat icon with white color - Fix the icon path
    const areaSatIcon = L.icon({
      iconUrl: '/images/icon/satellite-icon.svg', // Verify this path exists
      iconSize: [32, 32], 
      iconAnchor: [16, 16],
      className: 'areaSat-icon white-areaSat'
    });

    // Add custom styling for white areaSat icon
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .white-areaSat {
        filter: brightness(0) invert(1) drop-shadow(0 0 3px rgba(0, 0, 0, 0.7));
      }
      /* Ensure container visibility */
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

    // Initial orbit path drawing
    updateOrbitPaths();

    // Initial areaSat marker (icon only, no point)
    const currentPosition = calculatePosition(satrec.current, new Date());
    if (currentPosition && mapRef.current) {
      areaSatMarkerRef.current = L.marker([currentPosition.lat, currentPosition.lng], {
        icon: areaSatIcon,
        title: areaSatId
      }).addTo(mapRef.current);

    }

    // Update the areaSat position regularly
    const positionInterval = setInterval(() => {
      if (!mapRef.current || !satrec.current) return;
      
      const position = calculatePosition(satrec.current, new Date());
      if (position && areaSatMarkerRef.current) {
        areaSatMarkerRef.current.setLatLng([position.lat, position.lng]);
      }
    }, POSITION_UPDATE_INTERVAL);

    // Update the orbit paths regularly to reflect the current time
    const trajectoryInterval = setInterval(() => {
      updateOrbitPaths();
    }, TRAJECTORY_UPDATE_INTERVAL);

    return () => {
      clearInterval(positionInterval);
      clearInterval(trajectoryInterval);
      document.head.removeChild(styleElement); // Clean up style element
    };
  }, [mapInitialized, areaSatId]);

  // Correction : styles pour garantir la taille sur mobile et desktop
  return (
    <div
      className="area-sat-map-container"
      style={styles.mapContainer}
    >
      <div
        ref={mapContainerRef}
        className="area-sat-leaflet-map"
        style={styles.leafletMap}
      />
    </div>
  );
};

// Disable SSR for this component since Leaflet requires browser-only APIs
const AreaSatMap = dynamic(() => Promise.resolve(AreaSatMapComponent), {
  ssr: false,
  loading: () => (
    <div style={styles.loadingContainer}>
      <p>Loading map...</p>
    </div>
  ),
});

export default AreaSatMap;
