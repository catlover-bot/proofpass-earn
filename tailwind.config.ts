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
        ink: "#172033",
        mint: "#2f9f8f",
        gold: "#d99d2b"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
