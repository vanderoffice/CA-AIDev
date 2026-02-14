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
      // Typography plugin dark theme overrides for chat prose
      typography: {
        invert: {
          css: {
            '--tw-prose-body': '#d4d4d4',
            '--tw-prose-headings': '#f5f5f5',
            '--tw-prose-links': '#38bdf8',
            '--tw-prose-bold': '#f5f5f5',
            '--tw-prose-code': '#e2e8f0',
            '--tw-prose-pre-bg': '#171717',
            '--tw-prose-pre-code': '#d4d4d4',
            '--tw-prose-quotes': '#a3a3a3',
            '--tw-prose-quote-borders': '#525252',
            '--tw-prose-counters': '#a3a3a3',
            '--tw-prose-bullets': '#737373',
            '--tw-prose-hr': '#404040',
            '--tw-prose-th-borders': '#525252',
            '--tw-prose-td-borders': '#404040',
            '--tw-prose-captions': '#a3a3a3',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
