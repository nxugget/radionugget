const fs = require('fs');
const https = require('https');
const path = require('path');
const { URL } = require('url');

const SOURCES = [
  { url: "https://celestrak.org/NORAD/elements/amateur.txt", category: "amateur" },
  { url: "https://celestrak.org/NORAD/elements/weather.txt", category: "weather" }
];

const FILE_PATHS = [
  path.join(__dirname, "..", "data", "satellites", "amateur.json"),
  path.join(__dirname, "..", "data", "satellites", "weather.json")
];

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

function simplifyName(name) {
  return name.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

async function updateTLE() {
  console.log("🔄 Updating TLE data...");

  try {
    for (const source of SOURCES) {
      console.log(`📡 Fetching TLE for ${source.category}...`);
      const sats = await fetchTLE(source.url, source.category);

      const filePath = FILE_PATHS.find(fp => fp.includes(source.category));
      if (!filePath) {
        console.error(`❌ No file path found for category: ${source.category}`);
        continue;
      }

      const updatedSatellites = sats.map((sat) => ({
        ...sat,
        description: sat.description || "",
        frequency: Array.isArray(sat.frequency) ? sat.frequency : [],
        modulation: sat.modulation || "",
        image: sat.image || `/images/satellites/${simplifyName(sat.name)}.png`
      }));

      fs.writeFileSync(filePath, JSON.stringify(updatedSatellites, null, 2), "utf8");
      console.log(`✅ Updated ${filePath}`);
    }

    console.log("✅ Update completed!");
  } catch (error) {
    console.error("❌ Error updating TLE:", error);
  }
}

updateTLE();
