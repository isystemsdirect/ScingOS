@echo off
setlocal EnableExtensions EnableDelayedExpansion

echo ============================================================
echo FIREBASE DATA CONNECT INIT (fix missing dataconnect.yaml)
echo Project display name: SCINGULAR AI
echo ============================================================

:: 0) Confirm we are at repo root
cd /d "%~dp0" || exit /b 1
cd

:: 1) Ensure Firebase CLI is available
where firebase >nul 2>nul
if errorlevel 1 (
  echo [FATAL] Firebase CLI not found on PATH.
  echo Install it first: npm i -g firebase-tools
  exit /b 1
)

:: 2) Show CLI version (Data Connect requires a modern firebase-tools)
firebase --version

:: 3) Ensure you're logged in (safe; no changes)
firebase login:list

:: 4) Initialize Data Connect (creates dataconnect\dataconnect.yaml + schema/ + connector/)
::    - Answer prompts to select the correct Firebase project
::    - Accept default directory "dataconnect" unless you have a strong reason not to
firebase init dataconnect

:: 5) Verify the signifier file now exists (this is what Studio is complaining about)
if exist "dataconnect\dataconnect.yaml" (
  echo [OK] Found dataconnect\dataconnect.yaml
) else (
  echo [FATAL] dataconnect\dataconnect.yaml still missing.
  echo Something prevented init from completing. Re-run: firebase init dataconnect
  exit /b 1
)

:: 6) Verify firebase.json includes the dataconnect.source pointer
findstr /i /c:"\"dataconnect\"" firebase.json >nul 2>nul
if errorlevel 1 (
  echo [WARN] firebase.json does not appear to reference dataconnect yet.
  echo Open firebase.json and ensure it contains:
  echo   "dataconnect": { "source": "dataconnect" }
) else (
  echo [OK] firebase.json references dataconnect
)

:: 7) Quick structure check (what Studio expects)
echo.
echo [STRUCTURE CHECK]
if exist "dataconnect" (
  dir /b dataconnect
) else (
  echo [WARN] missing dataconnect directory (init may not have run)
)
if exist "dataconnect\schema" (echo [OK] dataconnect\schema) else (echo [WARN] missing dataconnect\schema)
echo.
echo DONE. Re-open VS Code Firebase Data Connect Studio panel and it should detect the service.
echo ============================================================

endlocal
exit /b 0
