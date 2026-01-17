import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build settings
  build: {
    // Output directory (this is what gets uploaded to Hostinger)
    outDir: 'dist',

    // Generate sourcemaps for easier debugging
    sourcemap: false,

    // Minify for production
    minify: 'esbuild'
  },

  // Development server settings
  server: {
    port: 5173,
    open: true  // Automatically open browser
  }
})
