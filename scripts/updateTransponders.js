const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const DATA_DIR = path.join(__dirname, '..', 'data', 'satellites');
const FILES_TO_PROCESS = ['amateur.json', 'weather.json'];
const MAX_CONCURRENT_REQUESTS = 5; // Nombre de requêtes parallèles
const MIN_DELAY = 300; // Délai minimum entre les requêtes (ms)
const MAX_DELAY = 1000; // Délai maximum entre les requêtes (ms)
const MAX_RETRIES = 3; // Nombre maximum de tentatives en cas d'échec

// Liste d'user agents pour randomiser
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:90.0) Gecko/20100101 Firefox/90.0',
  'Mozilla/5.0 (X11; Linux i686; rv:89.0) Gecko/20100101 Firefox/89.0',
];

// Helper to clean NORAD ID for URL (remove trailing 'U' and leading zeros)
function cleanNoradId(id) {
  return id.replace(/U$/, '').replace(/^0+/, '');
}

// Helper to get random delay
function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

// Helper to get random user agent
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Fonction pour attendre un délai aléatoire
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchTransponders(noradId, retries = 0) {
  const url = `https://www.n2yo.com/satellite/?s=${noradId}`;
  
  try {
    if (retries > 0) {
      console.log(`Retry #${retries} for NORAD ID: ${noradId}`);
      // Attendre plus longtemps entre les tentatives
      await sleep(getRandomDelay() * 2);
    }
    
    console.log(`Fetching data for NORAD ID: ${noradId} from ${url}`);
    
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.n2yo.com/'
      },
      timeout: 10000 // 10 secondes de timeout
    });
    
    const $ = cheerio.load(html);
    
    const modes = [];
    
    // Cibler spécifiquement les divs avec le style exact utilisé par n2yo.com
    $("div[style*='border: 1px dashed gray']").each((i, element) => {
      const divText = $(element).text();
      
      console.log(`Found transponder div for ${noradId}: ${divText.substring(0, 150).replace(/\n/g, '|')}`);
      
      // Extractions améliorées basées sur le format exact de n2yo.com
      const uplinkMatch = divText.match(/Uplink\s*\(MHz\):\s*([\d\.\-]+)/i);
      const downlinkMatch = divText.match(/Downlink\s*\(MHz\):\s*([\d\.\-]+)/i);
      const beaconMatch = divText.match(/Beacon\s*\(MHz\):\s*([\d\.]+)/i);
      const modeMatch = divText.match(/Mode:\s*([A-Z0-9\/ \-]+)/i);
      const statusMatch = divText.match(/Status:\s*(Active|Inactive)/i);
      
      const uplink = uplinkMatch ? uplinkMatch[1].trim() : "";
      const downlink = downlinkMatch ? downlinkMatch[1].trim() : "";
      const beacon = beaconMatch ? beaconMatch[1].trim() : "";
      const mode = modeMatch ? modeMatch[1].trim() : "";
      const status = statusMatch ? statusMatch[1].toLowerCase() : "inactive";
      
      console.log(`Extracted transponder data:
        Uplink: "${uplink}"
        Downlink: "${downlink}"
        Beacon: "${beacon}"
        Mode: "${mode}"
        Status: "${status}"
      `);
      
      // Vérifier si nous avons extrait des données significatives
      if (uplink || downlink || beacon || mode) {
        modes.push({
          status,
          uplink,
          downlink,
          beacon,
          mode
        });
      }
    });
    
    // Si aucun transpondeur n'est trouvé avec cette méthode, utiliser une méthode de secours
    if (modes.length === 0) {
      console.log(`No transponders found with primary method for ${noradId}. Trying backup method.`);
      
      // Rechercher des divs avec fond gris clair comme montré dans l'exemple
      $("div[style*='background-color:#ebebeb']").each((i, element) => {
        const divText = $(element).text();
        
        console.log(`Found potential transponder div with background color for ${noradId}`);
        
        // Même logique d'extraction mais sur ces divs
        const uplinkMatch = divText.match(/Uplink\s*\(MHz\):\s*([\d\.\-]+)/i);
        const downlinkMatch = divText.match(/Downlink\s*\(MHz\):\s*([\d\.\-]+)/i);
        const beaconMatch = divText.match(/Beacon\s*\(MHz\):\s*([\d\.]+)/i);
        const modeMatch = divText.match(/Mode:\s*([A-Z0-9\/ \-]+)/i);
        const statusMatch = divText.match(/Status:\s*(Active|Inactive)/i);
        
        const uplink = uplinkMatch ? uplinkMatch[1].trim() : "";
        const downlink = downlinkMatch ? downlinkMatch[1].trim() : "";
        const beacon = beaconMatch ? beaconMatch[1].trim() : "";
        const mode = modeMatch ? modeMatch[1].trim() : "";
        const status = statusMatch ? statusMatch[1].toLowerCase() : "inactive";
        
        if (uplink || downlink || beacon || mode) {
          modes.push({
            status,
            uplink,
            downlink,
            beacon,
            mode
          });
        }
      });
    }
    
    // Si aucune des méthodes n'a trouvé de transpondeurs, essayer une analyse de texte générale
    if (modes.length === 0) {
      console.log(`Using text pattern matching for ${noradId}`);
      
      const pageText = $('body').text();
      
      // Rechercher des patterns numériques qui ressemblent à des fréquences
      const frequencyPattern = /(\d{2,3}(?:\.\d+)?)\s*(?:MHz|GHz|kHz)/gi;
      let match;
      const frequencies = [];
      
      while ((match = frequencyPattern.exec(pageText)) !== null) {
        frequencies.push(match[0]);
      }
      
      if (frequencies.length > 0) {
        console.log(`Found ${frequencies.length} potential frequencies: ${frequencies.slice(0, 3).join(', ')}...`);
        
        // Ajouter un mode simple avec toutes les fréquences trouvées
        modes.push({
          status: "unknown",
          uplink: "",
          downlink: "",
          beacon: "",
          mode: ""
        });
      }
    }
    
    if (modes.length > 0) {
      console.log(`Found ${modes.length} transponder modes for NORAD ID: ${noradId}`);
      return { modes };
    } else {
      console.log(`No transponder data found for NORAD ID: ${noradId}`);
      return {};
    }
  } catch (error) {
    console.error(`Error fetching data for NORAD ID ${noradId}: ${error.message}`);
    
    // Réessayer si nous n'avons pas atteint le nombre maximum de tentatives
    if (retries < MAX_RETRIES) {
      return fetchTransponders(noradId, retries + 1);
    }
    
    return {};
  }
}

// Limiter le nombre de promesses exécutées simultanément
async function executeWithConcurrencyLimit(tasks, limit) {
  const results = [];
  const executing = [];
  
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    
    if (limit <= tasks.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  
  return Promise.all(results);
}

async function processFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    console.log(`Processing file: ${filePath}`);
    const data = await fs.readFile(filePath, 'utf-8');
    const satellites = JSON.parse(data);
    
    let updatedCount = 0;
    let noDataCount = 0;
    
    // Créer les tâches pour chaque satellite
    const tasks = satellites.map((sat, index) => async () => {
      const noradId = cleanNoradId(sat.id);
      
      console.log(`Processing satellite: ${sat.name} (NORAD ID: ${noradId})`);
      
      const transponders = await fetchTransponders(noradId);
      
      // Ajouter un délai aléatoire entre les requêtes
      await sleep(getRandomDelay());
      
      if (Object.keys(transponders).length > 0) {
        satellites[index].transponders = transponders;
        updatedCount++;
        return { status: 'updated', id: noradId };
      } else {
        if (!satellites[index].transponders) {
          satellites[index].transponders = {};
        }
        noDataCount++;
        return { status: 'no_data', id: noradId };
      }
    });
    
    // Exécuter les tâches avec concurrence limitée
    const results = await executeWithConcurrencyLimit(tasks, MAX_CONCURRENT_REQUESTS);
    
    // Compter les résultats
    const updated = results.filter(r => r.status === 'updated').length;
    const noData = results.filter(r => r.status === 'no_data').length;
    
    console.log(`Satellite data processing complete. Updated: ${updated}, No data: ${noData}`);
    
    // Écrire les données mises à jour dans le fichier
    await fs.writeFile(filePath, JSON.stringify(satellites, null, 2), 'utf-8');
    
    console.log(`File ${filename} processed and saved.`);
    
    return { updated, noData };
  } catch (error) {
    console.error(`Error processing file ${filename}: ${error.message}`);
    return { updated: 0, noData: 0, error: true };
  }
}

// Main function to process all files
async function updateAllTransponders() {
  console.log('Starting transponder data update with parallelism...');
  console.log(`Using max ${MAX_CONCURRENT_REQUESTS} concurrent requests`);
  
  const results = {};
  
  for (const file of FILES_TO_PROCESS) {
    const startTime = Date.now();
    results[file] = await processFile(file);
    const duration = (Date.now() - startTime) / 1000;
    console.log(`File ${file} processed in ${duration.toFixed(2)} seconds`);
  }
  
  console.log('Transponder update process completed.');
  console.log('Summary:');
  for (const file in results) {
    const { updated, noData, error } = results[file];
    if (error) {
      console.log(`${file}: ERROR`);
    } else {
      console.log(`${file}: Updated: ${updated}, No data: ${noData}`);
    }
  }
}

// Run the update process
updateAllTransponders().catch(err => {
  console.error('Error in main process:', err);
  process.exit(1);
});
