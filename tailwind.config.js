/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}" 
  ],
  theme: {
    extend: {
      colors: {
        purple: "#b400ff",
        orange: "#ffaa00",
        nottooblack: "#1a1a1a"
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"], // Default
        roboto: ["Roboto", "sans-serif"], // Pour le contenu des articles
        alien: ["Alien", "sans-serif"], // Pour les titres using alien.ttf
        fira: ["Fira Code", "monospace"], // Pour le code
      },
      backgroundImage: {
        grid: "linear-gradient(-90deg, transparent calc(var(--gap) - var(--line)), var(--color) calc(var(--gap) - var(--line) + 1px), var(--color) var(--gap)), linear-gradient(0deg, transparent calc(var(--gap) - var(--line)), var(--color) calc(var(--gap) - var(--line) + 1px), var(--color) var(--gap))"
      },
      backgroundSize: {
        grid: "var(--gap) var(--gap)"
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
};
