import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Keep src for compatibility if you kept components there
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Clash Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        light: {
          bg: "#F5F5F7",
          secondary: "#FFFFFF",
          text: "#1D1D1F",
          textSec: "#86868B",
        },
        dark: {
          bg: "#1B1B1B",
          secondary: "#252422",
          tertiary: "#2F2E2B",
          text: "#F8F8F8",
          textSec: "#8D8D8D",
        },
        accent: {
          DEFAULT: "#1C1A18",
          dark: "#D1D1D6",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
