/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        lights: {
          "0%": {
            color: "hsl(230, 40%, 80%)",
            textShadow: [
              "0 0 1em hsla(320, 100%, 50%, 0.2)",
              "0 0 0.125em hsla(320, 100%, 60%, 0.3)",
              "-1em -0.125em 0.5em hsla(40, 100%, 60%, 0)",
              "1em 0.125em 0.5em hsla(200, 100%, 60%, 0)",
            ],
          },
          "30%": {
            color: "hsl(230, 80%, 90%)",
            textShadow: [
              "0 0 1em hsla(320, 100%, 50%, 0.5)",
              "0 0 0.125em hsla(320, 100%, 60%, 0.5)",
              "-0.5em -0.125em 0.25em hsla(40, 100%, 60%, 0.2)",
              "0.5em 0.125em 0.25em hsla(200, 100%, 60%, 0.4)",
            ],
          },
          "40%": {
            color: "hsl(230, 100%, 95%)",
            textShadow: [
              "0 0 1em hsla(320, 100%, 50%, 0.5)",
              "0 0 0.125em hsla(320, 100%, 90%, 0.5)",
              "-0.25em -0.125em 0.125em hsla(40, 100%, 60%, 0.2)",
              "0.25em 0.125em 0.125em hsla(200, 100%, 60%, 0.4)",
            ],
          },
          "70%": {
            color: "hsl(230, 80%, 90%)",
            textShadow: [
              "0 0 1em hsla(320, 100%, 50%, 0.5)",
              "0 0 0.125em hsla(320, 100%, 60%, 0.5)",
              "0.5em -0.125em 0.25em hsla(40, 100%, 60%, 0.2)",
              "-0.5em 0.125em 0.25em hsla(200, 100%, 60%, 0.4)",
            ],
          },
          "100%": {
            color: "hsl(230, 40%, 80%)",
            textShadow: [
              "0 0 1em hsla(320, 100%, 50%, 0.2)",
              "0 0 0.125em hsla(320, 100%, 60%, 0.3)",
              "1em -0.125em 0.5em hsla(40, 100%, 60%, 0)",
              "-1em 0.125em 0.5em hsla(200, 100%, 60%, 0)",
            ],
          },
        },
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
        lights: "lights 2s linear infinite",
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