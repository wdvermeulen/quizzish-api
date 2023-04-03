/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-josefin)"],
      },
      boxShadow: {
        xl: "0 0 1px hsl(var(--a) / 100%), 1px 1px 1px hsl(var(--a) / 100%), 2px 2px 1.5px hsl(var(--a) / 80%), 3px 3px 2px hsl(var(--a) / 60%), 4px 4px 2.5px hsl(var(--a) / 40%), 5px 5px 3px hsl(var(--a) / 20%), inset 1px 1px 1px hsl(var(--b1) / 20%)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: false,
  },
};
