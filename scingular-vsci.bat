@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM   SCINGULAR — VISUAL STUDIO CODE MAIN PROJECT BOOTSTRAP
REM   Full setup, sync scripts, tasks, and CI workflow installer
REM ============================================================

echo Initializing SCINGULAR project environment...

REM ------------------------------------------------------------
REM   Ensure directory structure
REM ------------------------------------------------------------
if not exist ".vscode" mkdir .vscode
if not exist "scripts" mkdir scripts
if not exist "docs" mkdir docs
if not exist ".github" mkdir .github
if not exist ".github\workflows" mkdir .github\workflows

REM ------------------------------------------------------------
REM   VS Code Tasks
REM ------------------------------------------------------------
> .vscode\tasks.json (
echo {
echo   "version": "2.0.0",
echo   "tasks": [
echo     {
echo       "label": "SyncDocs",
echo       "type": "shell",
echo       "command": "node scripts/syncDocsToWiki.js",
echo       "problemMatcher": []
echo     },
echo     {
echo       "label": "SyncWiki",
echo       "type": "shell",
echo       "command": "node scripts/syncWikiToDocs.js",
echo       "problemMatcher": []
echo     }
echo   ]
echo }
)

REM ------------------------------------------------------------
REM   DOCS → WIKI SYNC SCRIPT
REM ------------------------------------------------------------
> scripts\syncDocsToWiki.js (
echo import { execSync } from "node:child_process";
echo import fs from "node:fs";
echo
echo const WIKI = "ScingOS.wiki";
echo const SOURCE = "docs/The_SCINGULAR_Ecosystem_Dynamic_Library.md";
echo const TARGET = "The-SCINGULAR-Ecosystem-Dynamic-Library.md";
echo
echo function sh(cmd) { execSync(cmd, { stdio: "inherit" }); }
echo
echo if ^(!fs.existsSync(SOURCE)^) {
echo   console.error("Dynamic Library document missing.");
echo   process.exit(1);
echo }
echo
echo if ^(!fs.existsSync(WIKI)^) {
echo   sh("git clone https://github.com/isystemsdirect/ScingOS.wiki.git");
echo }
echo
echo sh(`cd ${WIKI} && git pull`);
echo fs.copyFileSync(SOURCE, `${WIKI}/${TARGET}`);
echo
echo sh(`cd ${WIKI} && git add ${TARGET}`);
echo sh(`cd ${WIKI} && git commit -m "Sync Dynamic Library" ^|^| true`);
echo sh(`cd ${WIKI} && git push`);
echo
echo console.log("Docs → Wiki sync complete.");
)

REM ------------------------------------------------------------
REM   WIKI → DOCS SYNC SCRIPT
REM ------------------------------------------------------------
> scripts\syncWikiToDocs.js (
echo import { execSync } from "node:child_process";
echo import fs from "node:fs";
echo
echo const WIKI = "ScingOS.wiki";
echo const SOURCE = "The-SCINGULAR-Ecosystem-Dynamic-Library.md";
echo const TARGET = "docs/The_SCINGULAR_Ecosystem_Dynamic_Library.md";
echo
echo function sh(cmd) { execSync(cmd, { stdio: "inherit" }); }
echo
echo if ^(!fs.existsSync(WIKI)^) {
echo   sh("git clone https://github.com/isystemsdirect/ScingOS.wiki.git");
echo }
echo
echo sh(`cd ${WIKI} && git pull`);
echo fs.copyFileSync(`${WIKI}/${SOURCE}`, TARGET);
echo
echo console.log("Wiki → Docs sync complete.");
)

REM ------------------------------------------------------------
REM   CI WORKFLOW
REM ------------------------------------------------------------
> .github\workflows\scing-vscode-pipeline.yml (
echo name: VSCode Project Pipeline
echo
echo on:
echo   push:
echo     branches: [ main ]
echo   workflow_dispatch:
echo
echo permissions:
echo   contents: write
echo
echo jobs:
echo   sync-docs:
echo     runs-on: ubuntu-latest
echo     steps:
echo       - uses: actions/checkout@v4
echo
echo       - name: Clone wiki
echo         env:
echo           GH_PAT: ${{ secrets.GH_PAT }}
echo         run: git clone https://x-access-token:${GH_PAT}@github.com/isystemsdirect/ScingOS.wiki.git
echo
echo       - name: Copy docs to wiki
echo         run: cp docs/The_SCINGULAR_Ecosystem_Dynamic_Library.md ScingOS.wiki/The-SCINGULAR-Ecosystem-Dynamic-Library.md
echo
echo       - name: Commit and push
echo         env:
echo           GH_PAT: ${{ secrets.GH_PAT }}
echo         run: ^|
echo           cd ScingOS.wiki
echo           git add .
echo           git commit -m "Auto-sync Dynamic Library" ^|^| exit 0
echo           git push https://x-access-token:${GH_PAT}@github.com/isystemsdirect/ScingOS.wiki.git HEAD:main
echo )

REM ------------------------------------------------------------
REM   Editor Configuration
REM ------------------------------------------------------------
> .editorconfig (
echo root = true
echo [*]
echo indent_style = space
echo indent_size = 2
echo charset = utf-8
echo end_of_line = lf
echo insert_final_newline = true
echo )

echo.
echo ========== VISUAL STUDIO CODE PROJECT INITIALIZED ==========
echo.
pause

endlocal

@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM   SCINGULAR VSCI — VISUAL STUDIO CODE MAIN PROJECT SETUP
REM   One-file execution for full project automation + tooling
REM ============================================================

echo Initializing SCINGULAR VS Code Project...

REM ------------------------------------------------------------
REM  Ensure directories exist
REM ------------------------------------------------------------
if not exist ".vscode" mkdir .vscode
if not exist "scripts" mkdir scripts
if not exist "docs" mkdir docs
if not exist ".github" mkdir .github
if not exist ".github\workflows" mkdir .github\workflows

REM ------------------------------------------------------------
REM  CREATE VS CODE TASKS
REM ------------------------------------------------------------
echo Writing VS Code tasks...
> .vscode\tasks.json (
echo {
echo   "version": "2.0.0",
echo   "tasks": [
echo     {
echo       "label": "Sync Dynamic Library",
echo       "type": "shell",
echo       "command": "node scripts/syncDocsToWiki.js",
echo       "problemMatcher": []
echo     }
echo   ]
echo }
)

REM ------------------------------------------------------------
REM  SYNC SCRIPT (DOCS → WIKI)
REM ------------------------------------------------------------
echo Writing syncDocsToWiki.js...
> scripts\syncDocsToWiki.js (
echo import { execSync } from "node:child_process";
echo import fs from "node:fs";
echo
echo const WIKI = "ScingOS.wiki";
echo const DOC = "docs/The_SCINGULAR_Ecosystem_Dynamic_Library.md";
echo const TARGET = "The-SCINGULAR-Ecosystem-Dynamic-Library.md";
echo
echo function run(cmd) { execSync(cmd, { stdio: "inherit" }); }
echo
echo if ^(!fs.existsSync(DOC)^) {
echo   console.error("Missing Dynamic Library document");
echo   process.exit(1);
echo }
echo
echo if ^(!fs.existsSync(WIKI)^) {
echo   run(`git clone https://github.com/isystemsdirect/ScingOS.wiki.git`);
echo }
echo
echo run(`cd ${WIKI} && git pull`);
echo fs.copyFileSync(DOC, `${WIKI}/${TARGET}`);
echo
echo run(`cd ${WIKI} && git add ${TARGET}`);
echo run(`cd ${WIKI} && git commit -m "Sync Dynamic Library" ^|^| true`);
echo run(`cd ${WIKI} && git push`);
echo
echo console.log("Dynamic Library Synced.");
)

REM ------------------------------------------------------------
REM  SYNC SCRIPT (WIKI → DOCS OPTIONAL)
REM ------------------------------------------------------------
echo Writing syncWikiToDocs.js...
> scripts\syncWikiToDocs.js (
echo import { execSync } from "node:child_process";
echo import fs from "node:fs";
echo
echo const WIKI = "ScingOS.wiki";
echo const SOURCE = "The-SCINGULAR-Ecosystem-Dynamic-Library.md";
echo const TARGET = "docs/The_SCINGULAR_Ecosystem_Dynamic_Library.md";
echo
echo function run(cmd) { execSync(cmd, { stdio: "inherit" }); }
echo
echo if ^(!fs.existsSync(WIKI)^) {
echo   run(`git clone https://github.com/isystemsdirect/ScingOS.wiki.git`);
echo }
echo
echo run(`cd ${WIKI} && git pull`);
echo fs.copyFileSync(`${WIKI}/${SOURCE}`, TARGET);
echo
echo console.log("Wiki Synced → Docs.");
)

REM ------------------------------------------------------------
REM  WRITE CI WORKFLOW
REM ------------------------------------------------------------
echo Writing CI workflow...
> .github\workflows\scing-vscode-pipeline.yml (
echo name: SCINGULAR VSCode Pipeline
echo
echo on:
echo   push:
echo     branches: [ main ]
echo   workflow_dispatch:
echo
echo permissions:
echo   contents: write
echo
echo jobs:
echo   sync:
echo     runs-on: ubuntu-latest
echo
echo     steps:
echo       - uses: actions/checkout@v4
echo
echo       - name: Clone wiki
echo         env:
echo           GH_PAT: ${{ secrets.GH_PAT }}
echo         run: git clone https://x-access-token:${GH_PAT}@github.com/isystemsdirect/ScingOS.wiki.git
echo
echo       - name: Copy docs → wiki
echo         run: cp docs/The_SCINGULAR_Ecosystem_Dynamic_Library.md ScingOS.wiki/The-SCINGULAR-Ecosystem-Dynamic-Library.md
echo
echo       - name: Commit and Push
echo         env:
echo           GH_PAT: ${{ secrets.GH_PAT }}
echo         run: ^|
echo           cd ScingOS.wiki
echo           git add .
echo           git commit -m "Auto-sync Dynamic Library" ^|^| exit 0
echo           git push https://x-access-token:${GH_PAT}@github.com/isystemsdirect/ScingOS.wiki.git HEAD:main
echo )

REM ------------------------------------------------------------
REM  EDITOR SETTINGS (Optional but recommended)
REM ------------------------------------------------------------
echo Writing editorconfig...
> .editorconfig (
echo root = true
echo
echo [*]
echo charset = utf-8
echo end_of_line = lf
echo indent_style = space
echo indent_size = 2
echo insert_final_newline = true
echo )

REM ------------------------------------------------------------
REM  FINAL
REM ------------------------------------------------------------
echo.
echo === VSCI EXECUTION COMPLETE — VS CODE PROJECT READY ===
echo.
pause
