export function getFavorites(): string[] {
  if (typeof document === "undefined") return [];
  const cookie = document.cookie.split(";").find(c => c.trim().startsWith("favorites="));
  if (!cookie) return [];
  try {
    return JSON.parse(cookie.split("=")[1]);
  } catch {
    return [];
  }
}

export function setFavorites(favorites: string[]): void {
  if (typeof document !== "undefined") {
    const d = new Date();
    d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `favorites=${JSON.stringify(favorites)};${expires};path=/`;
  }
}
