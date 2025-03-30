const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

// Sources TLE pour chaque catégorie
const SOURCES = [
  { url: "https://celestrak.org/NORAD/elements/amateur.txt", category: "amateur" },
  { url: "https://celestrak.org/NORAD/elements/weather.txt", category: "weather" }
];

// Télécharge le contenu brut depuis une URL
function fetchTLE(url) {
  return new Promise((resolve, reject) => {
    let data = "";
    https.get(new URL(url), res => {
      res.on('data', chunk => data += chunk );
      res.on('end', () => resolve(data));
    }).on('error', err => reject(err));
  });
}

// Parse les données téléchargées et retourne un objet mapping { id: { tle1, tle2 } }
function parseTLEData(rawData) {
  const lines = rawData.trim().split("\n");
  const mapping = {};
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("1 ")) {
      const tle1 = lines[i].trim();
      const tle2 = lines[i + 1] ? lines[i + 1].trim() : "";
      const id = tle1.split(" ")[1]; // le deuxième champ correspond à l'identifiant
      mapping[id] = { tle1, tle2 };
      i++; // sauter la seconde ligne
    }
  }
  return mapping;
}

// Télécharge les TLE pour chaque source et agrège les résultats
async function downloadNewTLE() {
  let overallTLE = {};
  for (const source of SOURCES) {
    console.log(`🔄 Fetching TLE for ${source.category} from ${source.url}...`);
    try {
      const rawData = await fetchTLE(source.url);
      const parsed = parseTLEData(rawData);
      console.log(`✅ Fetched ${Object.keys(parsed).length} TLE entries for ${source.category}`);
      overallTLE = { ...overallTLE, ...parsed };
    } catch (error) {
      console.error(`❌ Error fetching TLE for ${source.category}:`, error);
    }
  }
  return overallTLE;
}

// Met à jour les fichiers en remplaçant uniquement tle1 et tle2 si une nouvelle TLE existe
function updateFileTLE(filePath, newTLEData) {
  console.log(`⏳ Updating file: ${filePath}`);
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let updatedCount = 0;
  jsonData.forEach(satellite => {
    if (newTLEData[satellite.id]) {
      satellite.tle1 = newTLEData[satellite.id].tle1;
      satellite.tle2 = newTLEData[satellite.id].tle2;
      updatedCount++;
    }
  });
  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
  console.log(`✅ Updated ${updatedCount} satellites in file: ${filePath}`);
}

// Fonction principale qui télécharge les nouvelles TLE et met à jour les fichiers
async function main() {
  const newTLEData = await downloadNewTLE();
  // Chemins des fichiers de satellites
  const amateurFile = path.join(__dirname, '..', 'data', 'satellites', 'amateur.json');
  const weatherFile = path.join(__dirname, '..', 'data', 'satellites', 'weather.json');
  updateFileTLE(amateurFile, newTLEData);
  updateFileTLE(weatherFile, newTLEData);
}

main();
