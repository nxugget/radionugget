// satelliteAPI.ts

interface SatellitePass {
  startUTC: number;
  endUTC: number;
  maxEl: number;
}

export async function fetchSatellitePasses(
  satelliteId: string,
  lat: number,
  lon: number,
  elevation: number,
  count: number
) {
  const API_KEY = "MW3QMW-54CFE9-M3FN58-5FPP"; // Mets ta vraie clé API ici
  const alt = 10;
  const url = `https://api.n2yo.com/rest/v1/satellite/passes/${satelliteId}/${lat}/${lon}/${alt}/${count}/&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.passes || data.passes.length === 0) {
      throw new Error("Aucune donnée de passage trouvée.");
    }
    return data.passes.map((pass: SatellitePass) => ({
      startTime: new Date(pass.startUTC * 1000).toUTCString(),
      endTime: new Date(pass.endUTC * 1000).toUTCString(),
      maxElevation: pass.maxEl,
    }));
  } catch (error) {
    throw new Error("Erreur lors de la récupération des prédictions.");
  }
}

export async function fetchFilteredSatellites() {
  const TLE_WEATHER_URL = "https://celestrak.org/NORAD/elements/weather.txt";
  const TLE_RADIO_URL = "https://celestrak.org/NORAD/elements/amateur.txt";

  const fetchTLE = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      const lines = text.split("\n");
      let satellites = [];
      for (let i = 0; i < lines.length; i += 3) {
        if (lines[i].trim()) {
          satellites.push({
            name: lines[i].trim(),
            id: lines[i + 1].substring(2, 7),
          });
        }
      }
      return satellites;
    } catch {
      return [];
    }
  };

  const weatherSatellites = await fetchTLE(TLE_WEATHER_URL);
  const radioSatellites = await fetchTLE(TLE_RADIO_URL);

  const weatherSatellitesWithCat = weatherSatellites.map((sat) => ({
    ...sat,
    category: "weather",
  }));
  const radioSatellitesWithCat = radioSatellites.map((sat) => ({
    ...sat,
    category: "amateur",
  }));

  return [...weatherSatellitesWithCat, ...radioSatellitesWithCat];
}

export async function fetchSatellitesList() {
  const TLE_URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle";

  try {
    const response = await fetch(TLE_URL);
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    const lines = text.split("\n");
    let satellites = [];
    for (let i = 0; i < lines.length; i += 3) {
      if (lines[i].trim()) {
        satellites.push({
          name: lines[i].trim(),
          id: lines[i + 1].substring(2, 7),
        });
      }
    }
    return satellites;
  } catch {
    return [];
  }
}
