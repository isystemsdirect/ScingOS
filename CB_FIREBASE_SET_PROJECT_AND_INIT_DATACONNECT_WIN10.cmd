@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0" || exit /b 1

echo ============================================================
echo FIREBASE: MAP PROJECT NUMBER -> PROJECT ID, LINK REPO, INIT DC
echo Project display name: SCINGULAR AI
echo Target project number: 3494288633
echo ============================================================

where firebase >nul 2>nul
if errorlevel 1 (
  echo [FATAL] firebase CLI not found. Install: npm i -g firebase-tools
  exit /b 1
)

echo [1] Firebase CLI version
firebase --version

echo.
echo [2] Logged-in accounts
firebase login:list

echo.
echo [3] List accessible Firebase projects (find Project Number 3494288633)
firebase projects:list

echo.
echo ============================================================
echo ACTION NEEDED:
echo - In the output above, find the row where Project Number = 3494288633
echo - Copy the corresponding Project ID (string)
echo - Then run: firebase use --add
echo ============================================================
echo.
echo When prompted, select the Project ID that matches number 3494288633.
echo.
echo [4] Initialize Data Connect (creates dataconnect\dataconnect.yaml)
echo firebase init dataconnect
echo.
echo [5] After init, verify:
echo dir dataconnect
echo type dataconnect\dataconnect.yaml
echo ============================================================
echo DONE
echo ============================================================

endlocal
exit /b 0
