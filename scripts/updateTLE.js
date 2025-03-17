const fs = require('fs');
const https = require('https');
const path = require('path');
const { URL } = require('url');

const SOURCES = [
  { url: "https://celestrak.org/NORAD/elements/amateur.txt", category: "amateur" },
  { url: "https://celestrak.org/NORAD/elements/weather.txt", category: "weather" }
];

const TLE_FILE_PATH = path.join(__dirname, "../data/tle.json");

function fetchTLE(url, category) {
  return new Promise((resolve, reject) => {
    function requestWithRedirects(currentUrl) {
      const req = https.request(new URL(currentUrl), (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`🔁 Redirect detected for ${category}: ${res.headers.location}`);
          return requestWithRedirects(res.headers.location);
        }

        let data = "";

        res.on("data", chunk => { data += chunk; });
        res.on("end", () => {
          console.log(`📜 Raw data downloaded (${category}):`);
          console.log(data.substring(0, 500));

          const lines = data.trim().split("\n");
          const satellites = [];

          for (let i = 0; i < lines.length - 2; i++) {
            if (lines[i].startsWith("1 ") && lines[i + 1].startsWith("2 ")) {
              const tle1 = lines[i].trim();
              const tle2 = lines[i + 1].trim();
              const name = lines[i - 1] ? lines[i - 1].trim() : "Unknown Satellite";
              const id = tle1.split(" ")[1];

              satellites.push({
                id,
                name,
                tle1,
                tle2,
                category
              });

              i++;
            }
          }

          resolve(satellites);
        });
      });

      req.on("error", err => reject(err));
      req.end();
    }

    requestWithRedirects(url);
  });
}

async function updateTLE() {
  console.log("🔄 Updating TLE data...");

  try {
    const allSatellites = [];

    for (const source of SOURCES) {
      console.log(`📡 Fetching TLE for ${source.category}...`);
      const sats = await fetchTLE(source.url, source.category);
      allSatellites.push(...sats);
    }

    fs.writeFileSync(TLE_FILE_PATH, JSON.stringify(allSatellites, null, 2));

    console.log(`✅ Update completed! ${allSatellites.length} satellites saved.`);
  } catch (error) {
    console.error("❌ Error updating TLE:", error);
  }
}

updateTLE();
