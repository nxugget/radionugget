// Définition des couleurs pour les satellites - palette lumineuse, variée et inspirée de l'espace
export const satelliteColors = [
  "#A3BFFA", // Bleu clair stellaire
  "#FFD166", // Jaune comète
  "#B983FF", // Violet nébuleuse
  "#5DFDCB", // Vert turquoise cosmique
  "#FF6B6B", // Rouge corail (supernova)
  "#F3E8FF", // Blanc violet (voie lactée)
  "#4361EE", // Bleu étoilé
  "#FF9F1C", // Orange solaire
  "#3A86FF", // Bleu profond
  "#FF61A6", // Rose galaxie
  "#C1C8E4", // Gris lunaire lumineux
  "#00F5D4"  // Vert-bleu néon
];

// Fonction utilitaire pour obtenir une couleur cohérente pour le même satellite
export const getSatelliteColorMap = (satellites: string[]): { [key: string]: string } => {
  const colorMap: { [key: string]: string } = {};
  satellites.forEach((sat, index) => {
    colorMap[sat] = satelliteColors[index % satelliteColors.length];
  });
  return colorMap;
};
