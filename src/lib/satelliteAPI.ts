"use server";

import { twoline2satrec, propagate, gstime, eciToEcf, ecfToLookAngles } from "satellite.js";
import satelliteData from "@/data/satellites.json";

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
  transmitters: any[]; 
  country?: string; // Added optional country property
}

export interface SatellitePassData {
  startTime: string;
  endTime: string;
  maxElevation: number;
  aosAzimuth: number; 
  losAzimuth: number; 
}

export async function getSatellites(): Promise<Satellite[]> {
  // Use the imported satelliteData instead of fetch
  const data = satelliteData;
  return data.map((sat: any) => ({
    id: sat.norad_id, // ensure id is mapped correctly
    name: sat.name,
    image: sat.image,
    country: sat.country, // explicitly map the country value
    tle1: sat.tle1,
    tle2: sat.tle2,
    description: sat.description || "",
    frequency: sat.transmitters ? sat.transmitters.map((tx: any) => tx.downlink) : [],
    modulation: sat.transmitters && sat.transmitters.length > 0 ? sat.transmitters[0].mode : "",
    category: sat.category || "",
    transmitters: sat.transmitters || [] // Pass through all transmitters
  }));
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
  let passMaxElevation = 0; // Pour suivre l'élévation maximale pendant un passage
  let passStartAzimuth = 0; // Pour enregistrer l'azimut au début du passage
  let passEndAzimuth = 0; // Pour enregistrer l'azimut à la fin du passage

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
      if (!currentPass) {
        // Début d'un nouveau passage
        passStartAzimuth = azimuthDeg; // Enregistrer l'azimut de début
        passMaxElevation = elevationDeg;
        
        currentPass = {
          startTime: new Date((t + utcOffset * 3600) * 1000).toISOString(),
          endTime: new Date((t + utcOffset * 3600) * 1000).toISOString(),
          maxElevation: elevationDeg,
          aosAzimuth: azimuthDeg,
          losAzimuth: azimuthDeg,
        };
      } else {
        // Mise à jour du passage en cours
        currentPass.endTime = new Date((t + utcOffset * 3600) * 1000).toISOString();
        currentPass.losAzimuth = azimuthDeg; // Mettre à jour l'azimut de fin
        
        // Mettre à jour l'élévation maximale si nécessaire
        if (elevationDeg > passMaxElevation) {
          passMaxElevation = elevationDeg;
          currentPass.maxElevation = elevationDeg;
        }
        
        // Enregistrer l'azimut actuel comme potentiel azimut de fin
        passEndAzimuth = azimuthDeg;
      }
    } else if (currentPass) {
      // Fin d'un passage - vérifier si les azimuts de début ET de fin sont dans la plage
      const startInRange = isAzimuthInRange(passStartAzimuth);
      const endInRange = isAzimuthInRange(passEndAzimuth);
      
      // Ajouter le passage seulement si les deux azimuts sont dans la plage demandée
      if (startInRange && endInRange) {
        passes.push(currentPass);
      }
      
      // Réinitialisation pour le prochain passage
      currentPass = null;
      passMaxElevation = 0;
      passStartAzimuth = 0;
      passEndAzimuth = 0;
    }
  }

  // Pour le dernier passage en cours si la simulation se termine pendant un passage
  if (currentPass) {
    const startInRange = isAzimuthInRange(passStartAzimuth);
    const endInRange = isAzimuthInRange(passEndAzimuth);
    
    if (startInRange && endInRange) {
      passes.push(currentPass);
    }
  }

  return passes;
}

