#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');

const jsonFile = path.join(__dirname, '..', 'data', 'satellites.json');
const noradId = process.argv[2];
if (!noradId) {
  console.error('Usage: updateSingleSat <NORAD_ID>');
  process.exit(1);
}

async function updateSatellite() {
  try {
    const data = await fs.readFile(jsonFile, 'utf-8');
    const satellites = JSON.parse(data);
    const sat = satellites.find(s => String(s.norad_id) === String(noradId));
    if (!sat) {
      console.error(`Satellite with NORAD ID ${noradId} not found.`);
      process.exit(1);
    }
    
    let changed = false;
    
    // --- Update TLE from Celestrak ---
    try {
      const tleUrl = `https://celestrak.com/NORAD/elements/gp.php?CATNR=${noradId}`;
      const tleResponse = await axios.get(tleUrl);
      let tleLines = tleResponse.data.trim().split('\n');
      // Remove title line if present (does not start with "1 ")
      if (tleLines.length > 0 && !tleLines[0].startsWith('1 ')) {
        tleLines.shift();
      }
      if (tleLines.length >= 2) {
        if (sat.tle1 !== tleLines[0]) { sat.tle1 = tleLines[0]; changed = true; }
        if (sat.tle2 !== tleLines[1]) { sat.tle2 = tleLines[1]; changed = true; }
      }
    } catch (err) {
      console.error(`Error fetching TLE: ${err.message}`);
    }
    
    // --- Update transmitters ---
    try {
      const txUrl = `https://db.satnogs.org/api/transmitters/?satellite__norad_cat_id=${noradId}`;
      const txResponse = await axios.get(txUrl);
      const transmitters = Array.isArray(txResponse.data)
        ? txResponse.data
        : (txResponse.data.results || []);
      const modes = transmitters.map(tx => ({
        description: tx.description || (tx.mode ? `Mode ${tx.mode} Beacon` : ""),
        mode: tx.mode || null,
        status: tx.alive ? "active" : "inactive",
        uplink: tx.uplink_low ? (tx.uplink_high ? `${tx.uplink_low}-${tx.uplink_high}` : tx.uplink_low) : null,
        downlink: tx.downlink_low ? (tx.downlink_high ? `${tx.downlink_low}-${tx.downlink_high}` : tx.downlink_low) : null
      }));
      if (JSON.stringify(sat.transmitters) !== JSON.stringify(modes)) {
        sat.transmitters = modes;
        changed = true;
      }
    } catch (err) {
      console.error(`Error fetching transmitters: ${err.message}`);
    }
    
    // --- Update name, country and image ---
    try {
      const infoUrl = `https://db-dev.satnogs.org/api/satellites/?norad_cat_id=${noradId}`;
      const infoResponse = await axios.get(infoUrl);
      const results = infoResponse.data.results || [];
      if (results.length > 0) {
        const info = results[0];
        if (info.name && sat.name !== info.name) { sat.name = info.name; changed = true; }
        if (info.countries && sat.country !== info.countries) { sat.country = info.countries; changed = true; }
        if (info.image) {
          let imageUrl = info.image;
          if (!imageUrl.startsWith("https://db-satnogs.freetls.fastly.net/media/")) {
            imageUrl = "https://db-satnogs.freetls.fastly.net/media/" + imageUrl;
          }
          if (sat.image !== imageUrl) { sat.image = imageUrl; changed = true; }
        }
      }
    } catch (err) {
      console.error(`Error fetching satellite info: ${err.message}`);
    }
    
    if (changed) {
      await fs.writeFile(jsonFile, JSON.stringify(satellites, null, 2));
      console.log(`Satellite ${noradId} updated.`);
    } else {
      console.log(`Satellite ${noradId} is already up-to-date.`);
    }
    
  } catch (err) {
    console.error(`Error processing file: ${err.message}`);
  }
}

updateSatellite();
