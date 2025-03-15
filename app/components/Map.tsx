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

// Limites du monde
const WORLD_BOUNDS: LatLngBoundsExpression = [
  [-90, -180],
  [90, 180],
];

/**
 * Calcule le Grid Square selon le niveau de détail.
 * - Niveau 1 : 2 lettres (grandes zones)
 * - Niveau 2 : +2 chiffres (zones intermédiaires)
 * - Niveau 3 : +2 lettres (zones fines)
 */
const getGridSquare = (lat: number, lon: number, detailLevel: number) => {
  const fieldLon = Math.floor((lon + 180) / 20);
  const fieldLat = Math.floor((lat + 90) / 10);
  let gridSquare = `${String.fromCharCode(65 + fieldLon)}${String.fromCharCode(65 + fieldLat)}`;

  if (detailLevel >= 2) {
    const squareLon = Math.floor(((lon + 180) % 20) / 2);
    const squareLat = Math.floor(((lat + 90) % 10) / 1);
    gridSquare += `${squareLon}${squareLat}`;
  }

  if (detailLevel === 3) {
    const subLon = Math.floor((((lon + 180) % 2) / 2) * 24);
    const subLat = Math.floor((((lat + 90) % 1) / 1) * 24);
    gridSquare += `${String.fromCharCode(97 + subLon)}${String.fromCharCode(97 + subLat)}`;
  }

  return gridSquare;
};

/**
 * Détermine le niveau de détail en fonction du zoom.
 * - Zoom < 4  => Niveau 1 (grandes zones)
 * - 4 <= Zoom < 8 => Niveau 2 (intermédiaire)
 * - Zoom >= 8 => Niveau 3 (fines zones)
 */
const getDetailLevel = (zoom: number) => {
  if (zoom < 4) return 1;
  if (zoom < 8) return 2;
  return 3;
};

/**
 * Label affiché au centre de chaque rectangle de la grille.
 * On l'affiche en rouge, un peu plus gros, et on varie légèrement
 * la taille selon le niveau de détail.
 */
const GridLabel = ({
  position,
  label,
  detailLevel,
}: {
  position: [number, number];
  label: string;
  detailLevel: number;
}) => {
  // Ajustement de la taille de police et de l'icône selon le niveau de détail
  const sizeMapping: Record<number, { iconSize: [number, number]; fontSize: string }> = {
    1: { iconSize: [50, 20], fontSize: "14px" },
    2: { iconSize: [40, 16], fontSize: "12px" },
    3: { iconSize: [30, 14], fontSize: "10px" },
  };

  const { iconSize, fontSize } = sizeMapping[detailLevel] || sizeMapping[2];

  const icon = L.divIcon({
    html: `<div class="grid-label" style="font-size:${fontSize};">${label}</div>`,
    className: "",
    iconSize: iconSize,
    // On ancre le label au milieu pour qu'il soit centré
    iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
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
        grid: getGridSquare(e.latlng.lat, e.latlng.lng, 3),
      });
    },
  });
  return null;
};

/**
 * Calcule et affiche dynamiquement la grille selon le niveau de zoom,
 * avec des pas (latStep / lonStep) adaptés pour limiter le nombre de cases.
 */
const GridLayer = () => {
  const map = useMap();
  const [gridSquares, setGridSquares] = useState<
    { bounds: LatLngBoundsExpression; label: string; center: [number, number] }[]
  >([]);
  const [currentDetailLevel, setCurrentDetailLevel] = useState(getDetailLevel(map.getZoom()));

  useEffect(() => {
    const updateGrid = () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      const detailLevel = getDetailLevel(zoom);
      setCurrentDetailLevel(detailLevel);

      let latStep: number, lonStep: number;

      if (detailLevel === 1) {
        // Grandes zones
        latStep = 10;
        lonStep = 20;
      } else if (detailLevel === 2) {
        // Zones intermédiaires
        latStep = 5;
        lonStep = 10;
      } else {
        // Zones fines (uniquement quand zoom >= 8)
        latStep = 1;
        lonStep = 2;
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
          const label = getGridSquare(lat, lon, detailLevel);
          const squareBounds: LatLngBoundsExpression = [
            [lat, lon],
            [lat + latStep, lon + lonStep],
          ];
          // Centre du rectangle pour positionner le label
          const center: [number, number] = [
            lat + latStep / 2,
            lon + lonStep / 2,
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
              color: "red",     // Même couleur que le label
              weight: 1,
              fillOpacity: 0,
              opacity: 0.8,     // Lignes un peu plus opaques
            }}
          />
          <GridLabel
            position={square.center}
            label={square.label}
            detailLevel={currentDetailLevel}
          />
        </React.Fragment>
      ))}
    </>
  );
};

/**
 * Composant principal de la carte, intégrant :
 * - Les tuiles de fond
 * - Le tracker de souris
 * - La couche de grille
 */
export default function Map({
  center,
  setMousePosition,
}: {
  center: [number, number];
  setMousePosition: (pos: any) => void;
}) {
  return (
    <>
      <MapContainer
        center={center}
        zoom={3}
        minZoom={2.5}
        maxZoom={12}
        maxBounds={WORLD_BOUNDS}
        scrollWheelZoom={true}
        className="h-[85vh] w-full rounded-lg"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <TileLayer
          url="https://tileserver.aurora.openmundi.com/tiles/{z}/{x}/{y}.png"
          opacity={0.5}
        />
        <MouseTracker setMousePosition={setMousePosition} />
        <GridLayer />
      </MapContainer>

      <style jsx global>{`
        .grid-label {
          color: red; /* Même couleur que la grille */
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
