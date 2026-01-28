:: VSC_SCINGR_BRINGUP.cmd
:: Run this from VS Code -> Terminal (Cmd) on Windows.
:: Purpose: validate toolchain, fix the known WiX XML failure, build MSI, install, start, verify.

@echo off
setlocal EnableExtensions EnableDelayedExpansion

echo ============================================================
echo   VSC-FIRST SCINGR BRING-UP (Windows)
echo ============================================================

:: ---------------------------
:: 0) SET REPO ROOT (VSC)
:: ---------------------------
:: In VS Code: open the ScingOS repo folder, then run this script.
set "REPO_ROOT=%CD%"
echo REPO_ROOT=%REPO_ROOT%

set "WIX_DIR="
if exist "%REPO_ROOT%\win11-stack\installer\wix\Package.wxs" set "WIX_DIR=%REPO_ROOT%\win11-stack\installer\wix"
if not defined WIX_DIR if exist "%REPO_ROOT%\win10-stack\installer\wix\Package.wxs" set "WIX_DIR=%REPO_ROOT%\win10-stack\installer\wix"

if not defined WIX_DIR (
  echo [FATAL] Could not find Package.wxs in expected locations:
  echo   %REPO_ROOT%\win11-stack\installer\wix\Package.wxs
  echo   %REPO_ROOT%\win10-stack\installer\wix\Package.wxs
  echo Run SCINGR_REPO_AUDIT_AND_SCAFFOLD_WIN10.ps1 to scaffold if missing.
  exit /b 1
)

set "PACKAGE_WXS=%WIX_DIR%\Package.wxs"
set "OUT_DIR=%WIX_DIR%\out"
set "MSI_PATH=%OUT_DIR%\ScingR.msi"

:: ---------------------------
:: 1) TOOLING CHECK (VSC)
:: ---------------------------
echo.
echo [1/9] Tooling check...
where git >nul 2>nul && (for /f "delims=" %%A in ('git --version') do echo [OK] %%A) || echo [WARN] git not found
where node >nul 2>nul && (for /f "delims=" %%A in ('node -v') do echo [OK] node %%A) || echo [WARN] node not found
where npm  >nul 2>nul && (for /f "delims=" %%A in ('npm -v') do echo [OK] npm  %%A) || echo [WARN] npm not found
where dotnet >nul 2>nul && (for /f "delims=" %%A in ('dotnet --version') do echo [OK] dotnet %%A) || echo [WARN] dotnet not found
where msiexec >nul 2>nul && echo [OK] msiexec present || (echo [FATAL] msiexec missing & exit /b 1)

set "WIX_MODE="
set "WIX_EXE="

where candle >nul 2>nul
if not errorlevel 1 (
  where light >nul 2>nul
  if not errorlevel 1 (
    set "WIX_MODE=v3"
    echo [OK] WiX candle found
    echo [OK] WiX light found
  )
)

if not defined WIX_MODE (
  where wix >nul 2>nul
  if not errorlevel 1 (
    for /f "delims=" %%A in ('where wix 2^>nul') do (
      if not defined WIX_EXE set "WIX_EXE=%%A"
    )
  )
)

if not defined WIX_MODE (
  if defined WIX_EXE (
    set "WIX_MODE=cli"
    echo [OK] WiX CLI found: %WIX_EXE%
  )
)

if not defined WIX_MODE (
  if exist "%ProgramFiles%\WiX Toolset v6.0\bin\wix.exe" (
    set "WIX_EXE=%ProgramFiles%\WiX Toolset v6.0\bin\wix.exe"
    set "WIX_MODE=cli"
  )
)

if "%WIX_MODE%"=="cli" if defined WIX_EXE echo [OK] WiX CLI found: %WIX_EXE%

if not defined WIX_MODE (
  echo [FATAL] WiX tooling not found.
  echo         Install WiX Toolset v3: candle/light OR WiX CLI: wix.exe, then rerun.
  exit /b 1
)

:: ---------------------------------------------------
:: 2) STOP STUCK INSTALLERS (common cause: MSI 1618)
:: ---------------------------------------------------
echo.
echo [2/9] Clearing stuck msiexec if present...
tasklist /FI "IMAGENAME eq msiexec.exe" | find /I "msiexec.exe" >nul
if not errorlevel 1 (
  echo [WARN] msiexec.exe is running.
  echo        To force-kill msiexec.exe if you are stuck on MSI 1618, rerun with:
  echo        set SCINGR_FORCE_KILL_MSIS=1
  if "%SCINGR_FORCE_KILL_MSIS%"=="1" (
    echo [WARN] Force-stopping msiexec.exe...
    taskkill /IM msiexec.exe /F >nul 2>nul
    timeout /t 2 /nobreak >nul
  ) else (
    echo [OK] Leaving msiexec.exe running.
  )
) else (
  echo [OK] No msiexec.exe running.
)

:: -----------------------------------------
:: 3) CONFIRM Package.wxs EXISTS (KNOWN ISSUE)
:: -----------------------------------------
echo.
echo [3/9] Verifying Package.wxs...
if not exist "%PACKAGE_WXS%" (
  echo [FATAL] Missing: %PACKAGE_WXS%
  exit /b 1
)

:: ---------------------------------------------------------
:: 4) FAST XML ROOT/TAG SANITY CHECK (catches your WIX0104)
:: ---------------------------------------------------------
echo.
echo [4/9] Quick XML sanity check (root tag + closing tag)...
powershell -NoProfile -Command ^
  "$p='%PACKAGE_WXS%';" ^
  "Write-Host '---TOP---';" ^
  "Get-Content -LiteralPath $p | Select-Object -First 25;" ^
  "Write-Host '---BOTTOM---';" ^
  "Get-Content -LiteralPath $p | Select-Object -Last 25;"

echo.
echo [ACTION] If you see ^<Wix^> at top, bottom MUST end with ^</Wix^>.
echo          If you see ^<Package^> at top, bottom MUST end with ^</Package^>.
echo          Mismatched root = build will fail (WIX0104).

:: -------------------------------------------------
:: 5) OPTIONAL AUTO-FIX: normalize root to <Wix>...</Wix>
:: -------------------------------------------------
echo.
echo [5/9] OPTIONAL auto-fix for common mismatch (safe text edit)...
echo This will ONLY run if the file starts with ^<Wix^> but ends with ^</Package^>.
powershell -NoProfile -Command ^
  "$p='%PACKAGE_WXS%';" ^
  "$c=Get-Content -LiteralPath $p -Raw;" ^
  "if($c -match '^\s*<Wix\b' -and $c -match '</Package>\s*$' -and $c -notmatch '</Wix>\s*$'){" ^
  "  $c2 = $c -replace '</Package>\s*$', '</Wix>'; " ^
  "  Set-Content -LiteralPath $p -Value $c2 -Encoding UTF8; " ^
  "  Write-Host '[FIXED] Replaced trailing </Package> with </Wix>.';" ^
  "} else { Write-Host '[SKIP] No matching auto-fix condition.'; }"

:: -----------------------------------------
:: 6) BUILD MSI (WiX)
:: -----------------------------------------
echo.
echo [6/9] Building MSI with WiX...
if not exist "%OUT_DIR%\" mkdir "%OUT_DIR%" >nul 2>nul
del /q "%OUT_DIR%\*.wixobj" "%OUT_DIR%\*.wixpdb" "%OUT_DIR%\*.msi" >nul 2>nul

pushd "%WIX_DIR%" >nul
if "%WIX_MODE%"=="v3" (
  candle -nologo -out "%OUT_DIR%\Package.wixobj" "%PACKAGE_WXS%"
  if errorlevel 1 (
    echo [FATAL] candle failed. The error above is the real blocker.
    popd >nul
    exit /b 1
  )

  light -nologo -out "%MSI_PATH%" "%OUT_DIR%\Package.wixobj"
  if errorlevel 1 (
    echo [FATAL] light failed. Review extensions/references/paths above.
    popd >nul
    exit /b 1
  )
) else (
  "%WIX_EXE%" build "%PACKAGE_WXS%" -o "%MSI_PATH%"
  if errorlevel 1 (
    echo [FATAL] wix build failed. The error above is the real blocker.
    popd >nul
    exit /b 1
  )
)
popd >nul

if not exist "%MSI_PATH%" (
  echo [FATAL] MSI not produced at: %MSI_PATH%
  exit /b 1
)

echo [OK] Built: %MSI_PATH%

:: -----------------------------------------
:: 7) INSTALL (quiet) + CAPTURE RETURN CODE
:: -----------------------------------------
echo.
echo [7/9] Installing ScingR (quiet)...
set "MSI_LOG=%REPO_ROOT%\.tmp\scingr_install.log"
if not exist "%REPO_ROOT%\.tmp\" mkdir "%REPO_ROOT%\.tmp" >nul 2>nul
msiexec /i "%MSI_PATH%" /qn /norestart /l*v "%MSI_LOG%"
set "MSI_RC=%ERRORLEVEL%"
echo msiexec_return_code=%MSI_RC%
if not "%MSI_RC%"=="0" (
  echo [INFO] MSI verbose log: %MSI_LOG%
)

:: -----------------------------------------
:: 8) DETECT + START SERVICE (best-effort)
:: -----------------------------------------
echo.
echo [8/9] Finding ScingR/Scing services...
powershell -NoProfile -Command ^
  "Get-Service | Where-Object { $_.Name -match 'Scing|ScingR' -or $_.DisplayName -match 'Scing|ScingR' } |" ^
  "Select-Object Name,Status,StartType,DisplayName | Format-Table -AutoSize"

echo.
echo [INFO] Attempting start for any matching services not running...
powershell -NoProfile -Command ^
  "$svcs=Get-Service | Where-Object { $_.Name -match 'Scing|ScingR' -or $_.DisplayName -match 'Scing|ScingR' };" ^
  "foreach($s in $svcs){ if($s.Status -ne 'Running'){ try{ Start-Service $s.Name -ErrorAction Stop; Write-Host ('Started: '+$s.Name) } catch { Write-Host ('FAILED: '+$s.Name+' :: '+$_.Exception.Message) } } }"

:: -----------------------------------------
:: 9) PROCESS CHECK
:: -----------------------------------------
echo.
echo [9/9] Process check...
powershell -NoProfile -Command ^
  "$p=Get-Process | Where-Object { $_.ProcessName -match 'scing|scingr' };" ^
  "if($p){ $p | Select-Object Id,ProcessName,Path | Format-Table -AutoSize } else { Write-Host 'No scing/scingr processes detected.' }"

echo.
echo ============================================================
echo FINISH
echo If it failed, copy/paste into chat:
echo  - The candle/light error output (most important)
echo  - msiexec_return_code
echo  - The service table output (if any)
echo ============================================================

endlocal
exit /b 0
