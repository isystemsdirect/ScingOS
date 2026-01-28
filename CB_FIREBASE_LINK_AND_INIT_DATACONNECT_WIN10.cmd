@echo off
setlocal EnableExtensions

cd /d G:\GIT\isystemsdirect\ScingOS

echo ============================================================
echo FIREBASE: LINK REPO + INIT DATA CONNECT
echo ============================================================

where firebase >nul 2>nul
if errorlevel 1 (
  echo [FATAL] Firebase CLI not found on PATH.
  echo Install: npm i -g firebase-tools
  exit /b 1
)

echo [1] Firebase CLI version
firebase --version

echo.
echo [2] Logged-in accounts
firebase login:list

echo.
echo [3] List projects (find Project Number 3494288633; Display Name likely "SCINGULAR AI")
firebase projects:list

echo.
echo [4] Link this repo to the correct project (interactive)
echo - When prompted, select the project whose NUMBER is 3494288633
firebase use --add

echo.
echo [5] Initialize Data Connect (creates dataconnect\dataconnect.yaml)
firebase init dataconnect

echo.
echo [6] Verify Studio signifier file exists
if exist "dataconnect\dataconnect.yaml" (
  echo [OK] dataconnect\dataconnect.yaml exists.
) else (
  echo [FATAL] dataconnect\dataconnect.yaml missing after init.
  exit /b 1
)

echo.
echo DONE. Re-open/refresh Firebase Studio Data Connect panel.
echo ============================================================

endlocal
exit /b 0
