"use server";

import fs from "fs";
import path from "path";
import {
  twoline2satrec,
  propagate,
  gstime,
  eciToEcf,
  ecfToLookAngles,
} from "satellite.js";

function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function rad2deg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export interface Satellite {
  name: string;
  id: string;
  category?: string;
}

export interface SatellitePassData {
  startTime: string;
  endTime: string;
  maxElevation: number;
}

export interface TleSatellite extends Satellite {
  tle1: string;
  tle2: string;
}

const TLE_FILE_PATH = path.join(process.cwd(), "src", "data", "tle.json");

/**
 * Récupère la liste des satellites disponibles avec filtre optionnel.
 */
export async function getSatellites(category?: string): Promise<Satellite[]> {
  if (!fs.existsSync(TLE_FILE_PATH)) {
    throw new Error("TLE data file not found. Please run the TLE update script.");
  }
  const data = fs.readFileSync(TLE_FILE_PATH, "utf8");
  const tleSatellites: TleSatellite[] = JSON.parse(data);

  let satellites = tleSatellites.map(({ name, id, category }) => ({ name, id, category }));

  if (category) {
    satellites = satellites.filter((sat) => sat.category === category);
  }

  return satellites;
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
  endTime: number = startTime + 86400 // 24h de prévisions
): Promise<SatellitePassData[]> {
  const data = fs.readFileSync(TLE_FILE_PATH, "utf8");
  const tleSatellites = JSON.parse(data);
  const tle = tleSatellites.find((s: any) => s.id === satelliteId);
  if (!tle) throw new Error("Satellite TLE not found");

  const satrec = twoline2satrec(tle.tle1, tle.tle2);
  const observerGd = {
    latitude: deg2rad(latitude),
    longitude: deg2rad(longitude),
    height: elevation / 1000,
  };

  const passes: SatellitePassData[] = [];
  let step = 60; // Vérification toutes les 60 secondes
  let currentPass: SatellitePassData | null = null;

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

    if (elevationDeg > elevation) { // Utilise l'élévation minimale spécifiée
      if (!currentPass) {
        // Début d'un passage
        currentPass = {
          startTime: new Date((t + utcOffset * 3600) * 1000).toISOString(),
          endTime: new Date((t + utcOffset * 3600) * 1000).toISOString(),
          maxElevation: elevationDeg,
        };
      } else {
        // Mise à jour de la fin du passage et de l'élévation max
        currentPass.endTime = new Date((t + utcOffset * 3600) * 1000).toISOString();
        currentPass.maxElevation = Math.max(currentPass.maxElevation, elevationDeg);
      }
    } else if (currentPass) {
      // Fin d'un passage, on l'ajoute
      passes.push(currentPass);
      currentPass = null;
    }
  }

  if (currentPass) {
    passes.push(currentPass);
  }

  return passes;
}

