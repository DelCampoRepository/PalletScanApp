/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: '#14201A',
        pulp: '#C7D93E',
        paper: '#F3F1E7',
        rust: '#C1502E',
        steel: '#4B5D55',
        line: '#DCD7C4',
      },
      fontFamily: {
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
}