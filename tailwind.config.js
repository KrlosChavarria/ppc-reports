/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gads: "#4285F4",
        meta: "#0866FF",
        ink: "#16181D",
        paper: "#F7F7F5",
      },
    },
  },
  plugins: [],
};
