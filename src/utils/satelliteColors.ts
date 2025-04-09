// Définition des couleurs pour les satellites - palette personnalisée
export const satelliteColors = [
  "#FF6B6B", // Rouge corail
  "#4ECDC4", // Turquoise
  "#45B7D1", // Bleu ciel
  "#FFA733", // Orange pastel
  "#7DCE82", // Vert menthe
  "#9D5CFF", // Violet lavande
  "#FF9FB2", // Rose pêche
  "#58C3FF", // Bleu azur
  "#FFDA77", // Jaune pâle
  "#B8F7D4", // Vert pastel
  "#FF7E5F", // Vermillon
  "#6A5ACD"  // Bleu ardoise
];

// Fonction utilitaire pour obtenir une couleur cohérente pour le même satellite
export const getSatelliteColorMap = (satellites: string[]): { [key: string]: string } => {
  const colorMap: { [key: string]: string } = {};
  satellites.forEach((sat, index) => {
    colorMap[sat] = satelliteColors[index % satelliteColors.length];
  });
  return colorMap;
};
