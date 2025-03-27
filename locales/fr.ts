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
  },
  navbar: {
    home: "Accueil",
    blog: "Blog",
    tools: "Outils",
    gridSquare: "Grid Square", 
    satellitePrediction: "Prédiction Satellite", 
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
  footer: {  // new footer translations
    thanks: "Merci",
    solhey: "Sol'hey",
    illustration: "pour l'illustration de la page d'accueil",
    madeWith: "Fait avec",
    by: "par",
    myself: "moi-même"
  }
} as const;