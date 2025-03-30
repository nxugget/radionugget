
/**
 * Validates if a given string is a credible Grid Square.
 * A valid Grid Square follows the Maidenhead Locator System:
 * - 2 uppercase letters (A-R) for the field.
 * - 2 digits (0-9) for the square.
 * - Optionally, 2 lowercase letters (a-x) for the subsquare.
 * 
 * @param gridSquare - The string to validate.
 * @returns True if the string is a valid Grid Square, false otherwise.
 */
export function isValidGridSquare(gridSquare: string): boolean {
  const gridSquarePattern = /^[A-R]{2}[0-9]{2}([a-x]{2})?$/;
  return gridSquarePattern.test(gridSquare);
}
