import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#111111", // Negro principal
        accent: {
          DEFAULT: "#8A6818", // Dorado profundo con ratio de contraste > 5.1:1 sobre blanco (cumple WCAG AA)
          hover: "#725513",
          light: "#C9A84C",   // Dorado cálido para fondos oscuros o acentos decorativos
        },
        background: "#F9F9F9", // Off-white de fondo base
        foreground: "#111111",
        surface: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
export default config;
