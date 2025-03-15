export function getGridSquare(lat: number, lon: number): string {
    const A = "ABCDEFGHIJKLMNOPQR";
    const a = "abcdefghijklmnopqrst";
  
    let lonAdj = lon + 180;
    let latAdj = lat + 90;
  
    let field = A[Math.floor(lonAdj / 20)] + A[Math.floor(latAdj / 10)];
    let square =
      Math.floor((lonAdj % 20) / 2).toString() + Math.floor((latAdj % 10)).toString();
  
    // Vérification de la validité du subsquare
    let subsquareIndex1 = Math.floor((lonAdj % 2) * 12);
    let subsquareIndex2 = Math.floor((latAdj % 1) * 24);
  
    let subsquare =
      (subsquareIndex1 >= 0 && subsquareIndex1 < a.length ? a[subsquareIndex1] : "a") +
      (subsquareIndex2 >= 0 && subsquareIndex2 < a.length ? a[subsquareIndex2] : "a");
  
    return field + square + subsquare;
  }
  