import { twoline2satrec, propagate, gstime, eciToEcf, ecfToLookAngles } from "satellite.js";
import { getSatellites } from "@/src/lib/satelliteAPI";

const deg2rad = (deg) => deg * (Math.PI / 180);
const rad2deg = (rad) => rad * (180 / Math.PI);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let satId = searchParams.get("satId");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const height = searchParams.get("height");
    if (!satId) {
      return new Response(JSON.stringify({ error: "satId param required" }), { status: 400 });
    }
    satId = satId.trim();
    const satellites = await getSatellites();
    const satellite = satellites.find(s => s.id.trim().toUpperCase() === satId.toUpperCase());
    if (!satellite || !satellite.tle1 || !satellite.tle2) {
      return new Response(JSON.stringify({ error: "TLE not found for satellite: " + satId }), { status: 404 });
    }
    const { tle1, tle2 } = satellite;
    let satrec;
    try {
      satrec = twoline2satrec(tle1.trim(), tle2.trim());
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid TLE format" }), { status: 500 });
    }
    
    const now = new Date();
    const observerLat = lat ? parseFloat(lat) : 0;
    const observerLon = lon ? parseFloat(lon) : 0;
    const observerHeight = height ? parseFloat(height) : 0;
    const observerCoords = {
      latitude: deg2rad(observerLat),
      longitude: deg2rad(observerLon),
      height: observerHeight
    };
    
    let posAndVel;
    try {
      posAndVel = propagate(satrec, now);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Propagation failed for satellite " + satId }), { status: 500 });
    }
    if (!posAndVel || typeof posAndVel === "boolean" || !posAndVel.position) {
      return new Response(JSON.stringify({ azimuth: "N/A", elevation: "N/A", nextAOSCountdown: -1, nextLOSCountdown: -1 }), { status: 200 });
    }
    
    const gmst = gstime(now);
    const posEci = posAndVel.position;
    let posEcf;
    try {
      posEcf = eciToEcf(posEci, gmst);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Coord conversion error" }), { status: 500 });
    }
    
    let lookAngles;
    try {
      lookAngles = ecfToLookAngles(observerCoords, posEcf);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Look angles calculation error" }), { status: 500 });
    }
    
    const azimuth = rad2deg(lookAngles.azimuth);
    const elevation = rad2deg(lookAngles.elevation);
    
    // CALCUL DU NEXT AOS ET LOS : recherche plus précise pour premier passage
    let nextAOSCountdown = -1;
    let nextLOSCountdown = -1;
    const maxSeconds = 24 * 60 * 60; // 24 hours pour la recherche
    let isAboveHorizon = elevation > 0;

    // Première phase : recherche rapide avec pas de 60 secondes
    let roughAOS = -1;
    for (let t = 0; t < maxSeconds; t += 60) {
      const futureTime = new Date(now.getTime() + t * 1000);
      const futurePos = propagate(satrec, futureTime);
      if (!futurePos || typeof futurePos === "boolean" || !futurePos.position) continue;
      const gmstF = gstime(futureTime);
      const posEcfF = eciToEcf(futurePos.position, gmstF);
      const futureLook = ecfToLookAngles(observerCoords, posEcfF);
      const futureEl = rad2deg(futureLook.elevation);

      if (futureEl > 0 && roughAOS === -1 && !isAboveHorizon) {
        roughAOS = t;
        break; // On a trouvé un AOS approximatif
      }
    }

    // Si on a trouvé un AOS approximatif, on raffine la recherche avec un pas de 1 seconde
    if (roughAOS > 0) {
      // Commencer 2 minutes avant l'estimation brute
      const startRefinement = Math.max(0, roughAOS - 120);
      const endRefinement = roughAOS + 120; // Jusqu'à 2 minutes après
      
      for (let t = startRefinement; t <= endRefinement; t += 1) { // Pas de 1 seconde
        const futureTime = new Date(now.getTime() + t * 1000);
        const futurePos = propagate(satrec, futureTime);
        if (!futurePos || typeof futurePos === "boolean" || !futurePos.position) continue;
        const gmstF = gstime(futureTime);
        const posEcfF = eciToEcf(futurePos.position, gmstF);
        const futureLook = ecfToLookAngles(observerCoords, posEcfF);
        const futureEl = rad2deg(futureLook.elevation);

        if (futureEl > 0 && nextAOSCountdown === -1) {
          nextAOSCountdown = t; // Temps précis à la seconde près
          break;
        }
      }
    } else if (isAboveHorizon) {
      // Si le satellite est déjà visible, on cherche quand il va disparaître
      for (let t = 1; t < maxSeconds; t += 10) { // Pas de 10 secondes pour LOS
        const futureTime = new Date(now.getTime() + t * 1000);
        const futurePos = propagate(satrec, futureTime);
        if (!futurePos || typeof futurePos === "boolean" || !futurePos.position) continue;
        const gmstF = gstime(futureTime);
        const posEcfF = eciToEcf(futurePos.position, gmstF);
        const futureLook = ecfToLookAngles(observerCoords, posEcfF);
        const futureEl = rad2deg(futureLook.elevation);

        if (futureEl <= 0) {
          // On a trouvé un LOS approximatif, maintenant on raffine
          const startRefinement = Math.max(0, t - 60);
          const endRefinement = t + 60;
          
          for (let r = startRefinement; r <= endRefinement; r += 1) { // Pas de 1 seconde
            const refineTime = new Date(now.getTime() + r * 1000);
            const refinePos = propagate(satrec, refineTime);
            if (!refinePos || typeof refinePos === "boolean" || !refinePos.position) continue;
            const gmstR = gstime(refineTime);
            const posEcfR = eciToEcf(refinePos.position, gmstR);
            const refineLook = ecfToLookAngles(observerCoords, posEcfR);
            const refineEl = rad2deg(refineLook.elevation);

            if (refineEl <= 0) {
              nextLOSCountdown = r; // Temps précis à la seconde près
              break;
            }
          }
          
          if (nextLOSCountdown > 0) break; // Si on a trouvé un LOS précis, on sort
        }
      }
    }
    
    return new Response(JSON.stringify({
      azimuth: azimuth.toFixed(1),
      elevation: elevation.toFixed(1),
      nextAOSCountdown,
      nextLOSCountdown
    }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
