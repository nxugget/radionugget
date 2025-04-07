// locales/en.ts
export default {
  home: "Accueil",
  notFound: "Introuvable",
  address: {
    placeholder: "Entrez une ville ou une adresse...",
    example: "Exemple: Reykjavik ou Zone 51"
  },
  gridSquare: {
    directSearchPlaceholder: "Recherche Grid Square...",
    invalid: "Gridsquare invalide"
  },
  navbar: {
    home: "Accueil",
    blog: "Blog",
    tools: "Outils",
    gridSquare: "Grid Square", 
    satellitePrediction: "Prédiction Satellite", 
    satelliteInfo: "Info Satellite",
    gallery: "Galerie",
    english: "English", 
    french: "Français"
  },
  gridSquareInfo: {
    question: "Qu'est-ce qu'une Grid Square ?",
    description1: "Une Grid Square est un système de coordonnées utilisé par les radioamateurs pour localiser précisément un point sur la Terre.",
    description2: "Plutôt que de donner des coordonnées GPS précises comme 37°14'3.60\" N -115°48'23.99\" W, on dira simplement DM27bf. C'est quand même plus pratique :).",
    description3: "Les grid squares divisent le globe en 324 grands territoires (10° par 20°), chacun subdivisé en 100 carrés. Des lettres supplémentaires affinent encore votre position en subdivisant chaque carré.",
  },
  gridSquareCalculator: {
    calculator: "Calculateur"
  },
  projects: {
    "1": { title: "Monter une station ADS-B reliée à FlightRadar" },
    "2": { title: "Réception automatique d'images satellites NOAA" },
    "3": { title: "Recevoir des images en provenance de l'ISS" },
    "4": { title: "Fabrication d'une antenne quadrifilaire (QFH)" },
  },
  footer: { 
    thanks: "Merci",
    illustration: "pour l'illustration de la page d'accueil",
    madeWith: "Fait avec",
    by: "par",
    myself: "moi-même"
  },
  locationError: "Impossible d'accéder à votre localisation",
  useMyLocation: "Utiliser ma position actuelle",
  or: "OU", // Ajout de la traduction pour "OU" en français
  betaDescription: "Cet outil est en version beta, si vous voyez des bugs ou des idées d'amélioration, je suis extrêmement preneur et réactif :) Vous pouvez m'envoyer un mail à cette adresse : contact@radionugget.com",
  satellites: {
    explorer: {
      title: "Explorateur de Satellites",
      loading: "Chargement...",
      searchPlaceholder: "Rechercher un satellite...",
      lastUpdate: "Dernière mise à jour:",
      lastTleUpdate: "Dernière mise à jour TLE:",
      noDescription: "Aucune description n'est disponible pour le moment.",
      status: "Statut:",
      frequency: "Fréquence:",
      photoNA: "Photo NA",
      source: "Source",
      focusMode: "Mode Focus",
      exitFocus: "Quitter Focus",
      polarChart: "Graphique Polaire",
      elevation: "Élévation:",
      azimuth: "Azimut:",
      enterValidGridSquare: "Renseignez une Grid Square valide",
      gridSquareLabel: "GridSquare:",
      setGrid: "Définir",
      invalidGridSquare: "Gridsquare invalide",
      satMap: "Carte Satellite",
      tleTitle: "TLE"
    },
    countdown: {
      losIn: "LOS dans",
      aosIn: "AOS dans",
      noPassPredicted: "Pas de passage prévu",
      noPassNext24h: "Pas de passage prévu (prochaine 24h)"
    },
    tle: {
      lineNumber1: "Numéro de ligne (toujours 1)",
      catalogNumber: "Numéro de catalogue satellite (ID NORAD)",
      classification: "Classification (U = Non classifié)",
      launchYear: "Désignation internationale (Année de lancement)",
      launchNumber: "Désignation internationale (Numéro de lancement)",
      launchPiece: "Désignation internationale (Partie du lancement)",
      epochYear: "Année d'époque (Deux derniers chiffres de l'année)",
      epochDay: "Époque (Jour de l'année plus partie fractionnelle)",
      firstTimeDerivative: "Première dérivée temporelle du mouvement moyen (rev/jour²)",
      secondTimeDerivative: "Seconde dérivée temporelle du mouvement moyen (point décimal implicite, rev/jour³)",
      bstarDrag: "Terme de traînée BSTAR (point décimal implicite)",
      ephemerisType: "Type d'éphéméride",
      elementSetNumber: "Numéro de jeu d'éléments",
      lineNumber2: "Numéro de ligne (toujours 2)",
      inclination: "Inclinaison (degrés)",
      rightAscension: "Ascension droite du nœud ascendant (degrés)",
      eccentricity: "Excentricité (point décimal implicite)",
      argumentOfPerigee: "Argument du périgée (degrés)",
      meanAnomaly: "Anomalie moyenne (degrés)",
      meanMotion: "Mouvement moyen (orbites par jour)",
      revolutionNumber: "Numéro de révolution à l'époque",
      noInfo: "Pas d'info"
    }
  },
  cookies: {
    message: "Pour sauvegarder tes favoris et ta position, cette page utilise des cookies. Ces derniers sont stockés uniquement sur ton appareil et personne d'autres n'y aura accès :)",
    accept: "Accepter"
  },
  satellite: {
    name: "Satellite",
    pass: "Passage",
    prediction: "Prédiction",
    predictableSatellites: "Satellites prédictibles",
    satellitesToPredict: "Satellites à prédire",
    chooseYourPosition: "Choisir votre position",
    cityPlaceholder: "Ville (ex: Paris)",
    gridSquarePlaceholder: "Grid Square (ex: JN18du)",
    latitude: "Latitude",
    longitude: "Longitude",
    coordinatesExplanation: "Les valeurs négatives indiquent le Sud pour la latitude et l'Ouest pour la longitude.",
    minElevation: "Élévation minimale (°)",
    predict: "PRÉDIRE",
    errorNoSelection: "Veuillez sélectionner au moins un satellite.",
    errorFetchingPredictions: "Erreur lors de la récupération des prédictions.",
    addSelected: "Ajouter le satellite sélectionné",
    removeSelected: "Retirer le satellite sélectionné",
    cleanAll: "Tout effacer",
    addToFavorites: "Ajouter aux favoris",
    search: "Rechercher...",
    filterAll: "Tous",
    filterWeather: "Météo",
    filterAmateur: "Amateur",
    filterFavorites: "Favoris",
    addAll: "Ajouter tout",
    timelineView: "Chronologie",
    tableView: "Tableau",
    utcTime: "Heure UTC",
    localTime: "Heure locale"
  }
} as const;