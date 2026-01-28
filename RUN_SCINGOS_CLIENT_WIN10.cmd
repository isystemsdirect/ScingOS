@echo off
setlocal
cd /d "%~dp0client" || exit /b 1

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm.cmd not found on PATH.
  echo Install Node.js (includes npm) then re-run.
  exit /b 1
)

echo [ScingOS Client] Installing deps (if needed)...
npm.cmd install --no-fund --no-audit
if errorlevel 1 exit /b 1

echo [ScingOS Client] Starting Next.js dev server...
echo Open http://localhost:3000
npm.cmd run dev
