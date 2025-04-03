const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration Space-Track API
const SPACE_TRACK_API = 'https://www.space-track.org/ajaxauth/login';
const SPACE_TRACK_QUERY = 'https://www.space-track.org/basicspacedata/query/class/satcat';
const SPACE_TRACK_LOGOUT = 'https://www.space-track.org/ajaxauth/logout';
const USERNAME = 'reputed-marts.5p@icloud.com';
const PASSWORD = 'fixjox-5tyhmi-mYgwin';

// Fonction pour se connecter à Space-Track et récupérer le statut d'un satellite
async function fetchSatelliteStatus(satelliteId) {
    try {
        const authResponse = await axios.post(SPACE_TRACK_API, `identity=${USERNAME}&password=${PASSWORD}`, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const cookies = authResponse.headers['set-cookie'];
        const apiUrl = `${SPACE_TRACK_QUERY}/NORAD_CAT_ID/${satelliteId}`;
        const response = await axios.get(apiUrl, {
            headers: { Cookie: cookies.join('; ') }
        });

        const data = response.data;
        return data && data.length > 0 ? (data[0].CURRENT === 'Y' ? 'alive' : 'inactive') : 'unknown';
    } catch (error) {
        return 'unknown';
    } finally {
        try {
            await axios.post(SPACE_TRACK_LOGOUT);
        } catch {}
    }
}

// Fonction pour ajouter un délai (en millisecondes)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction pour mettre à jour tous les satellites dans un fichier JSON avec gestion des limitations
async function updateAllSatellites(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const satellites = JSON.parse(fileContent);

        for (let i = 0; i < satellites.length; i++) {
            const satellite = satellites[i];
            console.log(`Mise à jour du satellite ${satellite.name} (${satellite.id})...`);
            satellite.status = await fetchSatelliteStatus(satellite.id);
            console.log(`Statut mis à jour : ${satellite.name} (${satellite.id}) -> ${satellite.status}`);

            if ((i + 1) % 30 === 0) {
                console.log(`Pause pour respecter la limite de 30 requêtes par minute...`);
                await delay(60000); // Pause de 60 secondes
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(satellites, null, 2));
        console.log(`Fichier JSON mis à jour : ${filePath}`);
    } catch (error) {
        console.error(`Erreur lors de la mise à jour des satellites dans ${filePath}:`, error.message);
    }
}

// Chemins des fichiers JSON
const amateurFilePath = path.join(__dirname, '../data/satellites/amateur.json');
const weatherFilePath = path.join(__dirname, '../data/satellites/weather.json');

// Exemple d'utilisation : Mise à jour de tous les satellites
(async () => {
    console.log('Début de la mise à jour des satellites amateurs...');
    await updateAllSatellites(amateurFilePath);
    console.log('Mise à jour terminée pour les satellites amateurs.');

    console.log('Début de la mise à jour des satellites météo...');
    await updateAllSatellites(weatherFilePath);
    console.log('Mise à jour terminée pour les satellites météo.');
})();
