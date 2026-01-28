@echo off
setlocal EnableExtensions

cd /d "%~dp0" || exit /b 1

where firebase >nul 2>nul
if errorlevel 1 (
  echo [FATAL] firebase CLI not found on PATH.
  echo Install: npm i -g firebase-tools
  exit /b 1
)

where powershell >nul 2>nul
if errorlevel 1 (
  echo [FATAL] powershell not found on PATH.
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0CB_FIREBASE_DATACONNECT_VERIFY_AND_ACTIVATE_WIN10.ps1"
exit /b %errorlevel%
