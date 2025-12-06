import { Poppins, Roboto, Fira_Code } from "next/font/google";
import localFont from "next/font/local";

// Google Fonts avec next/font (meilleur que @import)
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap", // Utilise fallback pendant que la font charge
  fallback: ["system-ui", "sans-serif"],
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  fallback: ["monospace"],
});

// Local font (self-hosted)
export const alien = localFont({
  src: [
    {
      path: "../../public/fonts/alien.ttf",
      weight: "400",
    },
  ],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
