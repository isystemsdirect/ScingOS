#!/usr/bin/env node
const { execSync } = require('child_process');
try {
  execSync('node scripts/syncDocsToWiki.js', { stdio: 'inherit' });
} catch (e) {
  console.error('Sync script failed:', e.message || e);
  process.exit(1);
}
