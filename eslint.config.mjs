import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "coverage/**",
      "next-env.d.ts",
      "package-lock.json",
      "tsconfig.tsbuildinfo",
      "proofpass-earn/**",
      "tmp/**",
      "temp/**",
      "patches/**",
      "*.patch",
      "*.tmp.*"
    ]
  }
];

export default eslintConfig;
