import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Hotfix: disable HMR/Fast Refresh to avoid hook-state corruption crashes
    // ("Rendered more hooks than during the previous render") during development.
    hmr: false,
  },
})
