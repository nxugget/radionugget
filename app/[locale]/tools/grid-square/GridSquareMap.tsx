"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
  Rectangle,
  Marker,
} from "react-leaflet";
import { LatLngBoundsExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getGridSquare as libGetGridSquare } from "@/src/lib/gridSquare";

// Limites du monde
const WORLD_BOUNDS: LatLngBoundsExpression = [
  [-90, -180],
  [90, 180],
];

/**
 * Calcule le Grid Square selon le niveau de détail.
 * - Niveau 1 : 2 lettres (grandes zones) => ex. "IN"
 * - Niveau 2 : +2 chiffres (zones intermédiaires) => ex. "IN94"
 * - Niveau 3 : +2 lettres (zones fines) => ex. "IN94SK"
 */
const getGridSquare = (lat: number, lon: number, detailLevel: number) => {
  if (detailLevel === 3) {
    // For full grid square, use the library function to ensure consistency
    return libGetGridSquare(lat, lon);
  }

  // For lower detail levels, continue using the existing implementation
  // 1) Calcule les 2 lettres de base (Field)
  const fieldLon = Math.floor((lon + 180) / 20);
  const fieldLat = Math.floor((lat + 90) / 10);
  let gridSquare = `${String.fromCharCode(65 + fieldLon)}${String.fromCharCode(65 + fieldLat)}`;

  // 2) Ajoute les 2 chiffres (Square) si on est au moins au niveau 2
  if (detailLevel >= 2) {
    const squareLon = Math.floor(((lon + 180) % 20) / 2);
    const squareLat = Math.floor(((lat + 90) % 10) / 1);
    gridSquare += `${squareLon}${squareLat}`;
  }

  return gridSquare;
};

/**
 * Détermine le niveau de détail en fonction du zoom.
 * - Zoom < 7  => Niveau 1 (2 lettres)
 * - 7 <= Zoom < 11 => Niveau 2 (ex. "IN94")
 * - Zoom >= 11 => Niveau 3 (ex. "IN94SK")
 */
const getDetailLevel = (zoom: number) => {
  if (zoom < 7) return 1;
  if (zoom < 11) return 2;
  return 3;
};

/**
 * Label affiché au centre de chaque rectangle de la grille.
 * On l'affiche avec la même couleur/transparence que la grille,
 * tout en ajustant la taille de la police selon le niveau de détail.
 */
const GridLabel = ({
  position,
  label,
  zoomLevel,
}: {
  position: [number, number];
  label: string;
  zoomLevel: number;
}) => {
  // Augmenter la taille de la police en ajustant les limites
  const baseFontSize = zoomLevel * 3; // Augmenter le facteur de base
  const fontSize = Math.max(18, Math.min(32, baseFontSize - label.length * 1.2)); // Ajuster les limites min/max

  const icon = L.divIcon({
    html: `<div class="grid-label grid-square-label">${label}</div>`,
    className: "",
    iconSize: [fontSize * label.length, fontSize], // Ajuster la taille de l'icône
    iconAnchor: [fontSize * label.length / 2, fontSize / 2], // Centrer dynamiquement
  });

  return <Marker position={position} icon={icon} interactive={false} />;
};

/**
 * Composant qui suit la souris et calcule le GridSquare en temps réel
 * pour l'afficher dans un éventuel panneau de contrôle (setMousePosition).
 */
const MouseTracker = ({
  setMousePosition,
}: {
  setMousePosition: (pos: { lat: number; lon: number; grid: string }) => void;
}) => {
  useMapEvents({
    mousemove: (e) => {
      setMousePosition({
        lat: e.latlng.lat,
        lon: e.latlng.lng,
        grid: libGetGridSquare(e.latlng.lat, e.latlng.lng), // Use library function here for consistency
      });
    },
  });
  return null;
};

/**
 * Calcule et affiche dynamiquement la grille selon le niveau de zoom,
 * avec des pas (latStep / lonStep) adaptés à chaque niveau.
 */
const GridLayer = () => {
  const map = useMap();
  const [gridSquares, setGridSquares] = useState<{
    bounds: LatLngBoundsExpression;
    label: string;
    center: [number, number];
  }[]>([]);
  const [currentDetailLevel, setCurrentDetailLevel] = useState(getDetailLevel(map.getZoom()));
  const [currentZoomLevel, setCurrentZoomLevel] = useState(map.getZoom());

  useEffect(() => {
    const updateGrid = () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      const detailLevel = getDetailLevel(zoom);
      setCurrentDetailLevel(detailLevel);
      setCurrentZoomLevel(zoom);

      let latStep: number, lonStep: number;

      if (detailLevel === 1) {
        latStep = 10;
        lonStep = 20;
      } else if (detailLevel === 2) {
        latStep = 1;
        lonStep = 2;
      } else {
        latStep = 1 / 24;
        lonStep = 2 / 24;
      }

      const startLat = Math.floor(bounds.getSouth() / latStep) * latStep;
      const endLat = Math.ceil(bounds.getNorth() / latStep) * latStep;
      const startLon = Math.floor(bounds.getWest() / lonStep) * lonStep;
      const endLon = Math.ceil(bounds.getEast() / lonStep) * lonStep;

      const newGridSquares: {
        bounds: LatLngBoundsExpression;
        label: string;
        center: [number, number];
      }[] = [];

      for (let lat = startLat; lat < endLat; lat += latStep) {
        for (let lon = startLon; lon < endLon; lon += lonStep) {
          const label = getGridSquare(lat + latStep / 2, lon + lonStep / 2, detailLevel);
          const squareBounds: LatLngBoundsExpression = [
            [lat, lon],
            [lat + latStep, lon + lonStep],
          ];
          // Correction : calcul précis des coordonnées centrales
          const center: [number, number] = [
            (lat + (lat + latStep)) / 2, // Moyenne des limites sud et nord
            (lon + (lon + lonStep)) / 2, // Moyenne des limites ouest et est
          ];
          newGridSquares.push({ bounds: squareBounds, label, center });
        }
      }

      setGridSquares(newGridSquares);
    };

    updateGrid();
    map.on("zoomend", updateGrid);
    map.on("moveend", updateGrid);

    return () => {
      map.off("zoomend", updateGrid);
      map.off("moveend", updateGrid);
    };
  }, [map]);

  return (
    <>
      {gridSquares.map((square, index) => (
        <React.Fragment key={index}>
          <Rectangle
            bounds={square.bounds}
            pathOptions={{
              color: "rgba(255, 170, 0, 0.8)",
              weight: 1,
              fillOpacity: 0,
              opacity: 0.4,
            }}
          />
          <GridLabel
            position={square.center}
            label={square.label}
            zoomLevel={currentZoomLevel} // Pass zoom level to GridLabel
          />
        </React.Fragment>
      ))}
    </>
  );
};

// Nouveau composant pour recadrer la carte
function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function Map({
  center,
  zoom, // Nouvelle prop
  setMousePosition,
  className, // new optional prop
}: {
  center: [number, number];
  zoom: number;
  setMousePosition: (pos: any) => void;
  className?: string;
}) {
  return (
    <>
      <MapContainer
        id="map"
        center={center}
        zoom={zoom}
        minZoom={2.5}
        maxZoom={15}
        maxBounds={WORLD_BOUNDS}
        scrollWheelZoom={true}
        className={className || "h-[calc(100vh-4rem)] w-full rounded-lg sm:h-[calc(70vh-4rem)]"} // use provided or default className
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          errorTileUrl="https://via.placeholder.com/256?text=Tile+Error" // Gestion des erreurs de tuiles
        />
        <RecenterMap center={center} zoom={zoom} />
        <MouseTracker setMousePosition={setMousePosition} />
        <GridLayer />
      </MapContainer>

      <style jsx global>{`
        .grid-label {
          display: flex;
          justify-content: center;
          align-items: center;
          color: rgba(255, 170, 0, 0.8);
          text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          white-space: nowrap;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
