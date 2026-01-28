:: SCINGR_WIX_LOCATE_AND_RUN_WIN10.cmd
:: Windows 10 Pro + VS Code terminal friendly
:: Purpose: auto-locate Package.wxs (WiX) anywhere in repo, detect missing submodules, then build/install/verify.

@echo off
setlocal EnableExtensions

echo ============================================================
echo   SCINGR WiX LOCATE + RUN (Windows 10 Pro)
echo ============================================================

set "REPO_ROOT=%CD%"
echo REPO_ROOT=%REPO_ROOT%

echo.
echo [0] Repo root sanity...
if exist "%REPO_ROOT%\.git\" (
  echo [OK] .git detected.
) else (
  echo [WARN] .git not found here. If you opened a subfolder in VS Code, go to repo root and rerun.
)

echo.
echo [1] Checking for submodules (.gitmodules)...
if exist "%REPO_ROOT%\.gitmodules" goto HAS_GITMODULES
echo [OK] No .gitmodules found.
goto AFTER_GITMODULES

:HAS_GITMODULES
echo [INFO] .gitmodules found:
type "%REPO_ROOT%\.gitmodules"
echo.
echo [ACTION] Initializing submodules (safe)...
git submodule update --init --recursive
if errorlevel 1 (
  echo [WARN] submodule init returned non-zero. Continue to search anyway.
)

:AFTER_GITMODULES

echo.
echo [2] Searching for Package.wxs anywhere under repo...
set "PACKAGE_WXS="
set "WXS_TMP=%TEMP%\scingr_package_wxs_path.txt"
del /q "%WXS_TMP%" >nul 2>nul
powershell -NoProfile -Command "Get-ChildItem -LiteralPath '%REPO_ROOT%' -Recurse -Filter 'Package.wxs' -File -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName" > "%WXS_TMP%"
set "WXS_SIZE=0"
for %%A in ("%WXS_TMP%") do set "WXS_SIZE=%%~zA"
if not "%WXS_SIZE%"=="0" set /p "PACKAGE_WXS=" < "%WXS_TMP%"
del /q "%WXS_TMP%" >nul 2>nul

if not defined PACKAGE_WXS (
  echo [FATAL] Package.wxs not found under:
  echo   %REPO_ROOT%
  echo.
  echo This means ScingR's WiX installer sources are NOT present in this checkout.
  echo Next actions (run in VS Code terminal):
  echo   1) git pull
  echo   2) If you expected a submodule: confirm it exists in .gitmodules and rerun
  echo   3) Otherwise, you are in the wrong repo/folder for the installer sources
  exit /b 1
)

echo [OK] Found Package.wxs:
echo   %PACKAGE_WXS%

for %%D in ("%PACKAGE_WXS%") do set "WIX_DIR=%%~dpD"
set "WIX_DIR=%WIX_DIR:~0,-1%"
set "OUT_DIR=%WIX_DIR%\out"
set "MSI_PATH=%OUT_DIR%\ScingR.msi"

echo WIX_DIR=%WIX_DIR%
echo OUT_DIR=%OUT_DIR%
echo MSI_PATH=%MSI_PATH%

echo.
echo [3] Tooling check (WiX + Windows Installer)...
where msiexec >nul 2>nul || (echo [FATAL] msiexec not found & exit /b 1)
where candle  >nul 2>nul || (echo [FATAL] WiX candle not found in PATH (install WiX Toolset) & exit /b 1)
where light   >nul 2>nul || (echo [FATAL] WiX light not found in PATH (install WiX Toolset) & exit /b 1)

echo.
echo [4] Clearing stuck installers (msiexec) if present...
tasklist /FI "IMAGENAME eq msiexec.exe" | find /I "msiexec.exe" >nul
if not errorlevel 1 (
  echo [WARN] msiexec.exe is running. Force stopping...
  taskkill /IM msiexec.exe /F >nul 2>nul
  timeout /t 2 /nobreak >nul
) else (
  echo [OK] No msiexec.exe running.
)

echo.
echo [5] Showing TOP/BOTTOM of Package.wxs (WIX0104 root mismatch check)...
powershell -NoProfile -Command ^
  "$p='%PACKAGE_WXS%';" ^
  "$c=Get-Content -LiteralPath $p;" ^
  "Write-Host '---TOP---'; ($c | Select-Object -First 30) | ForEach-Object { $_ };" ^
  "Write-Host '---BOTTOM---'; ($c | Select-Object -Last 30) | ForEach-Object { $_ };"

echo.
echo [6] Auto-fix ONLY for the common mismatch: starts with ^<Wix^> ends with ^</Package^> ...
powershell -NoProfile -Command ^
  "$p='%PACKAGE_WXS%';" ^
  "$raw=Get-Content -LiteralPath $p -Raw;" ^
  "if($raw -match '^\s*<Wix\b' -and $raw -match '</Package>\s*$' -and $raw -notmatch '</Wix>\s*$'){" ^
  "  $raw2 = $raw -replace '</Package>\s*$', '</Wix>';" ^
  "  Set-Content -LiteralPath $p -Value $raw2 -Encoding UTF8;" ^
  "  Write-Host '[FIXED] Replaced trailing </Package> with </Wix>.';" ^
  "} else { Write-Host '[SKIP] Auto-fix not applicable.'; }"

echo.
echo [7] Building MSI with WiX (candle/light)...
if not exist "%OUT_DIR%\" mkdir "%OUT_DIR%" >nul 2>nul
del /q "%OUT_DIR%\*.wixobj" "%OUT_DIR%\*.wixpdb" "%OUT_DIR%\*.msi" >nul 2>nul

pushd "%WIX_DIR%" >nul
candle -nologo -out "%OUT_DIR%\Package.wixobj" "%PACKAGE_WXS%"
if errorlevel 1 (
  echo [FATAL] candle failed. Copy/paste the candle output to chat.
  popd >nul
  exit /b 1
)

light -nologo -out "%MSI_PATH%" "%OUT_DIR%\Package.wixobj"
if errorlevel 1 (
  echo [FATAL] light failed. Copy/paste the light output to chat.
  popd >nul
  exit /b 1
)
popd >nul

if not exist "%MSI_PATH%" (
  echo [FATAL] MSI not produced at: %MSI_PATH%
  exit /b 1
)

echo [OK] Built MSI:
echo   %MSI_PATH%

echo.
echo [8] Installing ScingR (quiet)...
msiexec /i "%MSI_PATH%" /qn /norestart
set "MSI_RC=%ERRORLEVEL%"
echo msiexec_return_code=%MSI_RC%

echo.
echo [9] Service scan for Scing/ScingR...
powershell -NoProfile -Command ^
  "Get-Service | Where-Object { $_.Name -match 'Scing|ScingR' -or $_.DisplayName -match 'Scing|ScingR' } |" ^
  "Select-Object Name,Status,StartType,DisplayName | Format-Table -AutoSize"

echo.
echo [10] Process check...
powershell -NoProfile -Command ^
  "$p=Get-Process | Where-Object { $_.ProcessName -match 'scing|scingr' };" ^
  "if($p){ $p | Select-Object Id,ProcessName,Path | Format-Table -AutoSize } else { Write-Host 'No scing/scingr processes detected.' }"

echo.
echo ============================================================
echo DONE.
echo If anything fails, paste into chat:
echo  - candle/light error text
echo  - msiexec_return_code
echo  - service table output
echo ============================================================

endlocal
exit /b 0
