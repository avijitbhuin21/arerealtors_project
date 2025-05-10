/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xxs: "425px",
        xxss: "470px",
      },
      fontSize: {
        lg: ["1.5rem", "2rem"], // Modifying text-lg to be larger with adjusted line height
      },
      colors: {
        customblack: "#272727",
        modalprimary: "#ea580c",
        "modalprimary-dark": "#d24b09",
        modalsecondary: "#272727",
        primary: {
          DEFAULT: "#FF6B00",
          dark: "#CC5500",
          light: "#FF8533",
        },
        secondary: {
          DEFAULT: "#1A1A1A",
          light: "#333333",
        },
        orange: {
          DEFAULT: "#EA580C",
          50: "#FEF3EE",
          100: "#FDE3D5",
          200: "#FBC7AB",
          300: "#F9A982",
          400: "#F78B58",
          500: "#EA580C", // Our main orange color
          600: "#C54A0A",
          700: "#9F3C08",
          800: "#792E06",
          900: "#541F04",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mulish: ["Mulish", "sans-serif"],
      },
    },
  },
  plugins: [],
};
