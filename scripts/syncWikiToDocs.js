import { execSync } from "node:child_process";
import fs from "node:fs";

const WIKI = "ScingOS.wiki";
const SOURCE = "The-SCINGULAR-Ecosystem-Dynamic-Library.md";
const TARGET = "docs/The_SCINGULAR_Ecosystem_Dynamic_Library.md";

function sh(cmd) { execSync(cmd, { stdio: "inherit" }); }

if (!fs.existsSync(WIKI)) {
  sh("git clone https://github.com/isystemsdirect/ScingOS.wiki.git");
}

sh(`cd ${WIKI} && git pull`);
fs.copyFileSync(`${WIKI}/${SOURCE}`, TARGET);

console.log("Wiki → Docs sync complete.");
