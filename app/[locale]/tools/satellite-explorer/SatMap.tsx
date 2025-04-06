"use client";

import { useEffect, useRef, useState } from "react";
import { twoline2satrec, propagate, gstime, eciToGeodetic, EciVec3 } from "satellite.js";
import dynamic from "next/dynamic";

// Define interfaces outside the dynamic import
interface SatMapProps {
  satelliteId: string;
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
  SATELLITE: 'white' // Changed to white for the satellite marker
};

// Define styles as a JavaScript object to keep everything in one file
const styles = {
  mapContainer: {
    width: "100%",
    height: "100%", // Changé de 400px à 100% pour remplir le conteneur parent
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    padding: "0",
    margin: "0",
  } as React.CSSProperties,
  leafletMap: {
    width: "100%",
    height: "100%",
    backgroundColor: "#111",
    zIndex: 1,
    margin: "0",
    padding: "0",
  } as React.CSSProperties,
  loadingContainer: {
    width: "100%",
    height: "100%", // Changé pour s'adapter au conteneur parent
    minHeight: "400px", // Hauteur minimale pour les petits écrans
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    color: "white",
    borderRadius: "8px",
  } as React.CSSProperties,
};

// Create the component that will be dynamically loaded
const SatMapComponent = ({ satelliteId, tle1, tle2 }: SatMapProps) => {
  // We need to import Leaflet inside the component to avoid SSR issues
  const L = require("leaflet");
  require("leaflet/dist/leaflet.css");
  
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const satelliteMarkerRef = useRef<any>(null);
  const orbitPathsRef = useRef<any[]>([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  const satrec = useRef<any>(null);

  // Constants
  const CALC_POINTS_INTERVAL = 1000 * 30; // Reduced to 30 seconds per point for smoother orbits
  const ORBIT_DURATION_PAST = 1000 * 60 * 60; // 1 hour of past orbit
  const ORBIT_DURATION_FUTURE = 1000 * 60 * 90; // 1.5 hours of future orbit
  const POSITION_UPDATE_INTERVAL = 1000; // Update position every second
  const TRAJECTORY_UPDATE_INTERVAL = 10000; // Update trajectory every 10 seconds

  // Function to calculate satellite position at a given time
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
        width: 100%;
        height: 100%;
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
      /* Custom satellite icon styles */
      .satellite-icon {
        filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.7));
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

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInitialized) return;

    // Add a small delay to ensure the DOM is fully rendered
    const timer = setTimeout(() => {
      try {
        // Custom dark style for map tiles
        const darkMapUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
        
        // Définir les limites de la carte pour éviter le défilement au-delà des bords du monde
        const southWest = L.latLng(-90, -180);
        const northEast = L.latLng(90, 180);
        const bounds = L.latLngBounds(southWest, northEast);
        
        // Create map instance with modified options
        const map = L.map(mapContainerRef.current, {
          center: [0, 0],
          zoom: 1, // Ajusté pour mieux s'adapter aux mobiles
          minZoom: 1,
          maxZoom: 10,
          worldCopyJump: false, // Désactiver la répétition de la carte
          attributionControl: false,
          maxBounds: bounds, // Ajouter les limites maximales
          maxBoundsViscosity: 1.0, // Rendre les limites totalement inflexibles
          dragging: !L.Browser.mobile, // Désactive le glissement sur mobile par défaut
          tap: !L.Browser.mobile, // Désactive les événements de tap sur mobile
        });

        // Add touch support for mobile
        if (L.Browser.mobile) {
          map.dragging.enable();
          map.tap.enable();
        }

        // Add dark-themed tile layer
        L.tileLayer(darkMapUrl, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Ensure the map is properly sized
        map.invalidateSize();
        
        // Store map reference
        mapRef.current = map;
        setMapInitialized(true);
        
        console.log("Map initialized successfully");
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
    };
  }, [L]);

  // Initialize satellite tracking when TLEs are provided
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
        if (satelliteMarkerRef.current) {
          satelliteMarkerRef.current.removeFrom(mapRef.current);
          satelliteMarkerRef.current = null;
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

  // Set up satellite tracking and regular updates
  useEffect(() => {
    if (!mapInitialized || !mapRef.current || !satrec.current) return;
    
    // Create custom satellite icon with white color - Fix the icon path
    const satelliteIcon = L.icon({
      iconUrl: '/images/icon/satellite-icon.svg', // Match the path where we created the SVG
      iconSize: [32, 32], 
      iconAnchor: [16, 16],
      className: 'satellite-icon white-satellite' // Add class for white styling
    });

    // Add custom styling for white satellite icon
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .white-satellite {
        filter: brightness(0) invert(1) drop-shadow(0 0 3px rgba(0, 0, 0, 0.7));
      }
    `;
    document.head.appendChild(styleElement);

    // Initial orbit path drawing
    updateOrbitPaths();

    // Initial satellite marker (icon only, no point)
    const currentPosition = calculatePosition(satrec.current, new Date());
    if (currentPosition && mapRef.current) {
      satelliteMarkerRef.current = L.marker([currentPosition.lat, currentPosition.lng], {
        icon: satelliteIcon,
        title: satelliteId
      }).addTo(mapRef.current);

      // Center the map on the satellite initially
      mapRef.current.setView([currentPosition.lat, currentPosition.lng], 3);
    }

    // Update the satellite position regularly
    const positionInterval = setInterval(() => {
      if (!mapRef.current || !satrec.current) return;
      
      const position = calculatePosition(satrec.current, new Date());
      if (position && satelliteMarkerRef.current) {
        satelliteMarkerRef.current.setLatLng([position.lat, position.lng]);
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
  }, [mapInitialized, satelliteId]);

  return (
    <div style={styles.mapContainer}>
      <div ref={mapContainerRef} style={styles.leafletMap} />
    </div>
  );
};

// Disable SSR for this component since Leaflet requires browser-only APIs
const SatMap = dynamic(() => Promise.resolve(SatMapComponent), {
  ssr: false,
  loading: () => (
    <div style={styles.loadingContainer}>
      <p>Loading map...</p>
    </div>
  ),
});

export default SatMap;
