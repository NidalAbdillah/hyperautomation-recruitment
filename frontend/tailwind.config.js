import typography from "@tailwindcss/typography"; // <-- TAMBAHKAN IMPORT DI ATAS

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        helvetica: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        poppins: ['"Poppins"', "sans-serif"],
      },
    },
  },
  plugins: [
    typography, // <-- GUNAKAN VARIABEL HASIL IMPORT
  ],
};
