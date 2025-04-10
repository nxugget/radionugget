"use server";

import { twoline2satrec, propagate, gstime, eciToEcf, ecfToLookAngles } from "satellite.js";
import amateurData from "@/data/satellites/amateur.json";
import weatherData from "@/data/satellites/weather.json";

function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function rad2deg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export interface Satellite {
  id: string;
  name: string;
  tle1: string;
  tle2: string;
  description: string;
  frequency: string[];
  modulation: string;
  image: string;
  category: string;
}

export interface SatellitePassData {
  startTime: string;
  endTime: string;
  maxElevation: number;
  aosAzimuth: number; // Obligatoire
  losAzimuth: number; // Obligatoire
}

export async function getSatellites(): Promise<Satellite[]> {
  // Combine satellites from all subfolder JSON files
  return [
    ...amateurData.map((data) => ({
      id: data.id,
      name: data.name,
      tle1: data.tle1,
      tle2: data.tle2,
      description: data.description,
      frequency: [], // Provide default or mapped values
      modulation: "", // Provide default or mapped values
      image: data.image,
      category: data.category,
    })),
    ...weatherData.map((data) => ({
      id: data.id,
      name: data.name,
      tle1: data.tle1,
      tle2: data.tle2,
      description: data.description,
      frequency: [], // Provide default or mapped values
      modulation: "", // Provide default or mapped values
      image: data.image,
      category: data.category,
    }))
  ];
}

/**
 * Prévoit les passages d'un satellite entre deux moments donnés.
 */
export async function getSatellitePasses(
  satelliteId: string,
  latitude: number,
  longitude: number,
  elevation: number,
  utcOffset: number,
  startTime: number = Math.floor(Date.now() / 1000),
  endTime: number = startTime + 86400, // 24h de prévisions
  minAzimuth: number = 0, // Ajout du paramètre pour l'azimut minimum
  maxAzimuth: number = 360 // Ajout du paramètre pour l'azimut maximum
): Promise<SatellitePassData[]> {
  const satellites = await getSatellites();
  const tle = satellites.find((s) => s.id === satelliteId);
  if (!tle) throw new Error("Satellite TLE not found");

  const satrec = twoline2satrec(tle.tle1, tle.tle2);
  const observerGd = {
    latitude: deg2rad(latitude),
    longitude: deg2rad(longitude),
    height: elevation / 1000,
  };

  const passes: SatellitePassData[] = [];
  const step = 60; // Vérification toutes les 60 secondes
  let currentPass: SatellitePassData | null = null;
  let passAzimuthsWithinRange = false; // Pour suivre si le passage inclut des azimuts dans la plage spécifiée

  // Fonction pour vérifier si un azimut est dans la plage demandée
  const isAzimuthInRange = (azimuth: number): boolean => {
    // Normaliser l'azimut à des valeurs entre 0 et 360
    const normalizedAzimuth = ((azimuth % 360) + 360) % 360;
    
    // Cas particulier: plage complète
    if (minAzimuth === 0 && maxAzimuth === 360) return true;
    
    // Si la plage ne traverse pas le nord (0°/360°)
    if (minAzimuth <= maxAzimuth) {
      return normalizedAzimuth >= minAzimuth && normalizedAzimuth <= maxAzimuth;
    } 
    // Si la plage traverse le nord (ex: 330° à 30°)
    else {
      return normalizedAzimuth >= minAzimuth || normalizedAzimuth <= maxAzimuth;
    }
  };

  for (let t = startTime; t <= endTime; t += step) {
    const date = new Date(t * 1000);
    const positionAndVelocity = propagate(satrec, date);

    if (!positionAndVelocity || typeof positionAndVelocity === "boolean" || !positionAndVelocity.position) {
      continue; // On saute cette itération si la propagation échoue
    }

    const positionEci = positionAndVelocity.position as { x: number; y: number; z: number };
    const gmst = gstime(date);
    const positionEcf = eciToEcf(positionEci, gmst);
    const lookAngles = ecfToLookAngles(observerGd, positionEcf);
    const elevationDeg = rad2deg(lookAngles.elevation);
    const azimuthDeg = rad2deg(lookAngles.azimuth);

    if (elevationDeg > elevation) {
      const azimuthInRange = isAzimuthInRange(azimuthDeg);
      
      if (!currentPass) {
        currentPass = {
          startTime: new Date((t + utcOffset * 3600) * 1000).toISOString(),
          endTime: new Date((t + utcOffset * 3600) * 1000).toISOString(),
          maxElevation: elevationDeg,
          aosAzimuth: azimuthDeg,
          losAzimuth: azimuthDeg,
        };
        passAzimuthsWithinRange = azimuthInRange;
      } else {
        currentPass.endTime = new Date((t + utcOffset * 3600) * 1000).toISOString();
        currentPass.maxElevation = Math.max(currentPass.maxElevation, elevationDeg);
        currentPass.losAzimuth = azimuthDeg;
        
        // Si un des points du passage est dans la plage d'azimut, on considère le passage comme valide
        if (azimuthInRange) {
          passAzimuthsWithinRange = true;
        }
      }
    } else if (currentPass) {
      // Fin d'un passage, on l'ajoute seulement s'il contenait des azimuts dans la plage demandée
      if (passAzimuthsWithinRange) {
        passes.push(currentPass);
      }
      currentPass = null;
      passAzimuthsWithinRange = false;
    }
  }

  if (currentPass && passAzimuthsWithinRange) {
    passes.push(currentPass);
  }

  return passes;
}

