import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use PostCSS (postcss.config.cjs) to run Tailwind. Do not use the @tailwindcss/vite
// plugin here to avoid double-processing and @apply-related errors.
export default defineConfig({
  plugins: [react()],
})
