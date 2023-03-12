/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Josefin Sans", "sans-serif"],
        umbra: ["Umbra", "sans-serif"],
      },
      dropShadow: {
        'xl': '0 35px 35px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: false,
  },
};
