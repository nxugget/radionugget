export function getGridSquare(lat: number, lon: number): string {
  // Constants for the character sets
  const A = "ABCDEFGHIJKLMNOPQR";
  const a = "abcdefghijklmnopqrst";

  // Adjust coordinates to positive values
  let lonAdj = lon + 180;
  let latAdj = lat + 90;

  // Calculate field (first two letters)
  let field = A[Math.floor(lonAdj / 20)] + A[Math.floor(latAdj / 10)];
  
  // Calculate square (two numbers)
  let square = 
    Math.floor((lonAdj % 20) / 2).toString() + 
    Math.floor((latAdj % 10)).toString();

  // Calculate subsquare (two lower-case letters)
  // Fixed calculation: need to use correct divisions and multiplications
  let subsquareLon = Math.floor(((lonAdj % 2) / 2) * 24);
  let subsquareLat = Math.floor(((latAdj % 1) / 1) * 24);
  
  // Ensure indices are within bounds
  if (subsquareLon < 0) subsquareLon = 0;
  if (subsquareLon >= a.length) subsquareLon = a.length - 1;
  if (subsquareLat < 0) subsquareLat = 0;
  if (subsquareLat >= a.length) subsquareLat = a.length - 1;
  
  let subsquare = a[subsquareLon] + a[subsquareLat];

  return field + square + subsquare;
}

/**
* Convertit un grid square en latitude/longitude (centre du carré).
*/
export function getGridSquareCoords(grid: string): { lat: number; lon: number } {
  if (grid.length < 4) throw new Error("Gridsquare invalide.");

  const A = "ABCDEFGHIJKLMNOPQR";
  const a = "abcdefghijklmnopqrst";

  let lon = (A.indexOf(grid[0].toUpperCase()) * 20) - 180;
  let lat = (A.indexOf(grid[1].toUpperCase()) * 10) - 90;
  
  lon += parseInt(grid[2]) * 2;
  lat += parseInt(grid[3]) * 1;
  
  if (grid.length >= 6) {
    lon += (a.indexOf(grid[4].toLowerCase()) / 12);
    lat += (a.indexOf(grid[5].toLowerCase()) / 24);
    
    // Add half of the subsquare size to get center
    lon += (1 / 24);
    lat += (1 / 48);
  } else {
    // Add half of the square size to get center
    lon += 1;
    lat += 0.5;
  }

  return { lat, lon }; // Return the center of the square
}
