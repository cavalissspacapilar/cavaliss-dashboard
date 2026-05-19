import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#D4A017",
          50: "#FDF8E7",
          100: "#FAEFC4",
          200: "#F5DC89",
          300: "#EDCA4E",
          400: "#E8B94A",
          500: "#D4A017",
          600: "#B08012",
          700: "#8C6010",
          800: "#684508",
          900: "#4A2E04",
        },
        cavaliss: {
          pink: "#C2185B",
          "pink-light": "#E91E8C",
          "pink-dark": "#880E4F",
          rose: "#F06292",
        },
        dark: {
          DEFAULT: "#0a0a0a",
          50: "#1a1a1a",
          100: "#141414",
          200: "#111111",
          300: "#0f0f0f",
          400: "#0d0d0d",
        },
      },
      animation: {
        "gradient-shift": "gradientShift 20s ease infinite",
        "pulse-gold": "pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        typing: "typing 1.4s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin 10s linear infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "particle-1": "particle1 4s ease-in-out infinite",
        "particle-2": "particle2 5s ease-in-out infinite 0.5s",
        "particle-3": "particle3 6s ease-in-out infinite 1s",
        "particle-4": "particle4 4.5s ease-in-out infinite 1.5s",
        "badge-bounce": "badgeBounce 0.6s ease-out",
        ripple: "ripple 0.6s ease-out",
      },
      keyframes: {
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        pulseGold: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        typing: {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(212,160,23,0.3), 0 0 10px rgba(212,160,23,0.1)" },
          "100%": { boxShadow: "0 0 20px rgba(212,160,23,0.6), 0 0 40px rgba(212,160,23,0.3)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.93)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        particle1: {
          "0%, 100%": { transform: "translate(0,0) scale(1)", opacity: "0.7" },
          "33%": { transform: "translate(8px,-12px) scale(1.2)", opacity: "1" },
          "66%": { transform: "translate(-6px,-6px) scale(0.8)", opacity: "0.5" },
        },
        particle2: {
          "0%, 100%": { transform: "translate(0,0) scale(0.8)", opacity: "0.5" },
          "50%": { transform: "translate(-10px,-8px) scale(1.3)", opacity: "1" },
        },
        particle3: {
          "0%, 100%": { transform: "translate(0,0)", opacity: "0.6" },
          "40%": { transform: "translate(6px,-14px)", opacity: "1" },
          "70%": { transform: "translate(-4px,-4px)", opacity: "0.4" },
        },
        particle4: {
          "0%, 100%": { transform: "translate(0,0) scale(1)", opacity: "0.4" },
          "60%": { transform: "translate(10px,-10px) scale(1.1)", opacity: "0.9" },
        },
        badgeBounce: {
          "0%": { transform: "scale(0)" },
          "60%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.6" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
