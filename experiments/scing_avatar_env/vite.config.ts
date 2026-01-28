import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(path.resolve(process.cwd(), 'package.json'))
const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react-swc').default

const cwd = process.cwd()
const toPosixPath = (p: string) => p.split(path.sep).join('/')

// Anchor shared imports to the ScingOS repo root. Inferring via node_modules can
// accidentally select the experiment folder (breaking @scingos-src/*).
const repoCandidates = [path.resolve(cwd, '..', '..'), path.resolve(cwd, '..', '..', '..')]
const repoRoot =
  repoCandidates.find(
    (root) =>
      fs.existsSync(path.join(root, 'src')) &&
      fs.existsSync(path.join(root, 'mobius', 'package.json')) &&
      fs.existsSync(path.join(root, 'package.json')),
  ) ?? repoCandidates[0]

const scingosSrcPosix = toPosixPath(path.join(repoRoot, 'src'))
const scingosMobiusPosix = toPosixPath(path.join(repoRoot, 'mobius'))

const workspaceNodeModules = fs.existsSync(path.join(repoRoot, 'node_modules', 'react', 'index.js'))
  ? path.join(repoRoot, 'node_modules')
  : path.join(cwd, 'node_modules')
const workspaceNodeModulesPosix = toPosixPath(workspaceNodeModules)

export default defineConfig({
  plugins: [react()],
  resolve: {
    // When running via the junction workspace, keep symlink paths so
    // module resolution climbs to the workspace root node_modules.
    preserveSymlinks: true,
    // Resolve React from the workspace root node_modules.
    alias: [
      { find: /^react$/, replacement: `${workspaceNodeModulesPosix}/react/index.js` },
      { find: /^react\/jsx-runtime$/, replacement: `${workspaceNodeModulesPosix}/react/jsx-runtime.js` },
      { find: /^react\/jsx-dev-runtime$/, replacement: `${workspaceNodeModulesPosix}/react/jsx-dev-runtime.js` },
      { find: /^react-dom$/, replacement: `${workspaceNodeModulesPosix}/react-dom/index.js` },
      { find: /^react-dom\/client$/, replacement: `${workspaceNodeModulesPosix}/react-dom/client.js` },
      { find: /^three$/, replacement: `${workspaceNodeModulesPosix}/three/build/three.module.js` },
      { find: /^@scingos-src$/, replacement: scingosSrcPosix },
      { find: /^@scingos-src\/(.*)$/, replacement: `${scingosSrcPosix}/$1` },
      { find: /^@scingos\/mobius$/, replacement: scingosMobiusPosix },
      { find: /^@scingos\/mobius\/(.*)$/, replacement: `${scingosMobiusPosix}/$1` },
    ],
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
