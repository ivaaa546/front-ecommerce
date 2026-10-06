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
          DEFAULT: "#171717", // Monochrome action color
          hover: "#404040",
          light: "#FFFFFF",   // Foreground on dark surfaces
        },
        background: "#FAFAFA", // Off-white de fondo base
        foreground: "#111111",
        surface: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
export default config;
