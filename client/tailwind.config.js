/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        ripple: {
          "0%": {
            transform: "scale(0, 0)",
            opacity: "1",
          },
          "20%": {
            transform: "scale(25, 25)",
            opacity: "1",
          },
          "100%": {
            opacity: "0.5",
            transform: "scale(100, 100)",
          },
        },
      },
      animation: {
        ripple: "ripple 2s linear infinite",
      },
      fontFamily: {
        sans: ["Signika", "sans-serif"],
        Galada: ["Galada", "sans-serif"],
        Exo2: ["Exo\\ 2", "sans-serif"],
        FlowCircular: ["Flow\\ Circular", "sans-serif"],
      },
    },
  },
  plugins: [],
};