#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');

const jsonFile = path.join(__dirname, '..', 'data', 'satellites.json');

async function updateTransmitters() {
  try {
    const data = await fs.readFile(jsonFile, 'utf-8');
    const satellites = JSON.parse(data);
    let updatedCount = 0;
    
    for (const sat of satellites) {
      const norad = sat.norad_id;
      if (!norad) continue;
      const url = `https://db.satnogs.org/api/transmitters/?satellite__norad_cat_id=${norad}`;
      
      try {
        const response = await axios.get(url);
        const transmitters = Array.isArray(response.data)
          ? response.data
          : (response.data.results || []);
        const modes = transmitters.map(tx => ({
          description: tx.description || (tx.mode ? `Mode ${tx.mode} Beacon` : ""),
          mode: tx.mode || null,
          status: tx.alive ? "active" : "inactive",
          uplink: tx.uplink_low ? (tx.uplink_high ? `${tx.uplink_low}-${tx.uplink_high}` : tx.uplink_low) : null,
          downlink: tx.downlink_low ? (tx.downlink_high ? `${tx.downlink_low}-${tx.downlink_high}` : tx.downlink_low) : null
        }));
        
        // Compare existing transmitters with new ones
        if (JSON.stringify(sat.transmitters) !== JSON.stringify(modes)) {
          sat.transmitters = modes;
          updatedCount++;
        }
      } catch (err) {
        console.error(`Error fetching data for NORAD ${norad}: ${err.message}`);
      }
    }
    
    // Toujours mettre à jour la date, même si aucun satellite n'a changé
    const updatePath = path.join(__dirname, '..', 'public', 'transponders-last-update.json');
    await fs.writeFile(
      updatePath,
      JSON.stringify({ updated_at: new Date().toISOString() }, null, 2)
    );
    console.log('transponders-last-update.json updated.');
    if (updatedCount > 0) {
      await fs.writeFile(jsonFile, JSON.stringify(satellites, null, 2));
      console.log(`Updated ${updatedCount} satellite(s).`);
    }
  } catch (err) {
    console.error(`Error processing file: ${err.message}`);
  }
}

updateTransmitters();
