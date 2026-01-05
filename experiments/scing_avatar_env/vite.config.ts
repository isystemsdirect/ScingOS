import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // When importing shared TSX from the monorepo root, ensure React resolves
    // from THIS Vite app's node_modules (the repo root may not have React installed).
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
    },
  },
  server: {
    port: 5173,
    fs: {
      // Allow importing shared repo code (../..)
      allow: ['..', '../..'],
    },
    // Hotfix: disable HMR/Fast Refresh to avoid hook-state corruption crashes
    // ("Rendered more hooks than during the previous render") during development.
    hmr: false,
  },
})
