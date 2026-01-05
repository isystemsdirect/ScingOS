import { execSync } from "node:child_process";
import fs from "node:fs";

const MAIN_REPO = "isystemsdirect/ScingOS";
const WIKI_REPO_GIT = `https://github.com/${MAIN_REPO}.wiki.git`;
const WIKI_DIR = "ScingOS.wiki";

const DOCS_FILE = "docs/The_SCINGULAR_Ecosystem_Dynamic_Library.md";
const WIKI_FILE = "The-SCINGULAR-Ecosystem-Dynamic-Library.md";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

if (!fs.existsSync(DOCS_FILE)) {
  console.error("Missing:", DOCS_FILE);
  process.exit(1);
}

if (!fs.existsSync(WIKI_DIR)) {
  run(`git clone ${WIKI_REPO_GIT}`);
}

run(`cd ${WIKI_DIR} && git pull`);
fs.copyFileSync(DOCS_FILE, `${WIKI_DIR}/${WIKI_FILE}`);

run(`cd ${WIKI_DIR} && git add ${WIKI_FILE}`);
run(`cd ${WIKI_DIR} && git commit -m "Sync Dynamic Library" || true`);
run(`cd ${WIKI_DIR} && git push`);

console.log("✔ Sync complete.");
