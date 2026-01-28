@echo off
setlocal EnableExtensions

cd /d "%~dp0" || exit /b 1

echo ============================================================
echo FIREBASE: LINK PROJECT + INIT DATA CONNECT
echo PROJECT ID: studio-3494288633-91d2b
echo ============================================================

where powershell >nul 2>nul
if errorlevel 1 (
  echo [FATAL] powershell not found on PATH.
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0CB_FIREBASE_DATACONNECT_FIX_SCINGULAR_AI_WIN10.ps1"
set rc=%errorlevel%
exit /b %rc%
