import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/store/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
      },
      backgroundImage: {
        "grid-radial":
          "radial-gradient(circle at center, rgba(244,244,245,0.9) 0%, rgba(244,244,245,0.5) 45%, rgba(63,63,70,0.15) 100%)",
        "glow-corner":
          "radial-gradient(120% 120% at 25% 10%, rgba(161,161,170,0.35) 0%, rgba(228,228,231,0.05) 55%, rgba(15,15,15,0) 100%)",
      },
      boxShadow: {
        "inner-neon":
          "inset 0 0 30px rgba(161, 161, 170, 0.35), inset 0 0 12px rgba(244, 244, 245, 0.12)",
      },
      animation: {
        "slow-spin": "slow-spin 18s linear infinite",
        "pulse-ambient": "pulse-ambient 6s ease-in-out infinite",
      },
      keyframes: {
        "slow-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-ambient": {
          "0%, 100%": {
            opacity: "0.45",
            filter: "drop-shadow(0 0 20px rgba(244,244,245,0.25))",
          },
          "50%": {
            opacity: "0.9",
            filter: "drop-shadow(0 0 35px rgba(244,244,245,0.45))",
          },
        },
      },
      colors: {
        brand: {
          DEFAULT: "#6366f1",
          foreground: "#f4f4f5",
          muted: "#312e81",
        },
        midnight: {
          50: "#f2f2ff",
          100: "#dcdcfe",
          200: "#b8b9fd",
          300: "#9395fc",
          400: "#6f72fb",
          500: "#4a4ef9",
          600: "#3a3ecc",
          700: "#2b2f9a",
          800: "#1b1f66",
          900: "#0c1033",
        },
      },
      backdropBlur: {
        "3xl": "36px",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
