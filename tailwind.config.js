/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}" 
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: "#b400ff",
          50: "#f5e6ff",
          100: "#e6b3ff",
          200: "#d580ff",
          300: "#c94dff",
          400: "#b400ff",
          500: "#9900dd",
          600: "#8800cc",
          700: "#6600aa",
          800: "#440077",
          900: "#220044",
        },
        orange: {
          DEFAULT: "#ffaa00",
          50: "#fff5e0",
          100: "#ffe4a3",
          200: "#ffd166",
          300: "#ffc14d",
          400: "#ffaa00",
          500: "#e69900",
          600: "#cc8800",
        },
        surface: {
          0: "#000000",
          1: "#0a0a0f",
          2: "#111118",
          3: "#1a1a24",
          4: "#22222e",
        },
        nottooblack: "#1a1a1a",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        roboto: ["var(--font-roboto)", "sans-serif"],
        alien: ["var(--font-alien)", "sans-serif"],
        fira: ["var(--font-fira-code)", "monospace"],
      },
      backgroundImage: {
        grid: "linear-gradient(-90deg, transparent calc(var(--gap) - var(--line)), var(--color) calc(var(--gap) - var(--line) + 1px), var(--color) var(--gap)), linear-gradient(0deg, transparent calc(var(--gap) - var(--line)), var(--color) calc(var(--gap) - var(--line) + 1px), var(--color) var(--gap))",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backgroundSize: {
        grid: "var(--gap) var(--gap)"
      },
      screens: {
        'xs': '480px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(180, 0, 255, 0.1)',
        'glow': '0 0 25px rgba(180, 0, 255, 0.15)',
        'glow-lg': '0 0 40px rgba(180, 0, 255, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(180, 0, 255, 0.1)',
        'float': '0 20px 60px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-up-in': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-up-in': 'slide-up-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
