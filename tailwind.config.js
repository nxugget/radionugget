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
        nottooblack: "#1a1a1a",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"], // From next/font
        roboto: ["var(--font-roboto)", "sans-serif"], // From next/font
        alien: ["var(--font-alien)", "sans-serif"], // From next/font/local
        fira: ["var(--font-fira-code)", "monospace"], // From next/font
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

