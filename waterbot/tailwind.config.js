/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan for class names
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom font families (matching Google Fonts loaded in index.html)
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // Custom colors for WaterBot (blue theme for water)
      colors: {
        'water-blue': '#0ea5e9',
        'water-dark': '#0284c7',
      },
    },
  },
  plugins: [],
}
