import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#102033",
        navy: "#192a56",
        mint: "#1f9e8a",
        cyan: "#2a9fd6",
        violet: "#7667d9",
        gold: "#c48a25",
        paper: "#fbfaf7"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(16, 32, 51, 0.08)",
        lift: "0 24px 70px rgba(16, 32, 51, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
