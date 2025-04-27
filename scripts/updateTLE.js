const fs = require('fs');
const path = require('path');

// Chemin vers le fichier satellites.json
const dataPath = path.join(__dirname, '../data/satellites.json');

// Fonction pour récupérer le TLE via CelesTrak pour un numéro NORAD donné
async function fetchTLE(noradId) {
  const url = `https://celestrak.com/NORAD/elements/gp.php?CATNR=${noradId}&FORMAT=tle`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur lors de la récupération du TLE pour NORAD ${noradId}`);
  const text = await res.text();
  // On attend 2 lignes de TLE après une éventuelle première ligne titre
  const lines = text.trim().split('\n').filter(l => l.trim() !== '');
  if (lines.length >= 2) {
    // Si une ligne de titre est présente, on décalera d'une ligne
    return lines.length === 2 ? { tle1: lines[0], tle2: lines[1] } : { tle1: lines[1], tle2: lines[2] };
  }
  throw new Error(`TLE incomplet pour NORAD ${noradId}`);
}

// Mise à jour des TLE pour chaque satellite
(async () => {
  try {
    const satellites = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    let updated = false;
    for (let sat of satellites) {
      if (!sat.norad_id) continue;
      try {
        const newTLE = await fetchTLE(sat.norad_id);
        // Mettez à jour uniquement si l'un des TLE diffère
        if (newTLE.tle1 !== sat.tle1 || newTLE.tle2 !== sat.tle2) {
          console.log(`Mise à jour NORAD ${sat.norad_id} (${sat.name})`);
          sat.tle1 = newTLE.tle1;
          sat.tle2 = newTLE.tle2;
          updated = true;
        } else {
          console.log(`Aucune mise à jour pour NORAD ${sat.norad_id}`);
        }
      } catch (err) {
        console.error(`Erreur pour NORAD ${sat.norad_id} : ${err.message}`);
      }
      // Petite pause pour éviter de saturer l'API (optionnel)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (updated) {
      fs.writeFileSync(dataPath, JSON.stringify(satellites, null, 2), 'utf8');
      console.log('Fichier satellites.json mis à jour.');
      // Ajout : mise à jour du fichier tle-last-update.json
      const tleUpdatePath = path.join(__dirname, '../public/tle-last-update.json');
      fs.writeFileSync(
        tleUpdatePath,
        JSON.stringify({ updated_at: new Date().toISOString() }, null, 2),
        'utf8'
      );
      console.log('Fichier tle-last-update.json mis à jour.');
    } else {
      console.log('Aucune modification détectée.');
    }
  } catch (err) {
    console.error(`Erreur globale : ${err.message}`);
  }
})();
