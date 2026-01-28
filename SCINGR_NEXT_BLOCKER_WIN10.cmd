:: SCINGR_NEXT_BLOCKER_WIN10.cmd
:: Rebuild MSI -> install (quiet) with verbose log -> show log tail + quick checks.
@echo off
setlocal EnableExtensions

set "ROOT=%CD%"
set "MSI=%ROOT%\win10-stack\installer\wix\out\ScingR.msi"
set "LOG=%ROOT%\.tmp\scingr_install.log"

if not exist "%ROOT%\.tmp" mkdir "%ROOT%\.tmp" >nul 2>nul

echo ============================================================
echo SCINGR NEXT BLOCKER CHECK (Win10 Pro)
echo ============================================================
echo ROOT=%ROOT%
echo MSI =%MSI%
echo LOG =%LOG%
echo.

echo [1] Locate WiX CLI (wix.exe)
set "PF86=%ProgramFiles(x86)%"
set "WIXEXE="
for /f "delims=" %%I in ('where wix 2^>nul') do if not defined WIXEXE set "WIXEXE=%%I"
if not defined WIXEXE if exist "%ProgramFiles%\WiX Toolset v6.0\bin\wix.exe" set "WIXEXE=%ProgramFiles%\WiX Toolset v6.0\bin\wix.exe"
if not defined WIXEXE if exist "%PF86%\WiX Toolset v6.0\bin\wix.exe" set "WIXEXE=%PF86%\WiX Toolset v6.0\bin\wix.exe"

if not defined WIXEXE goto :wix_not_found
goto :wix_found

:wix_not_found
echo [FATAL] wix.exe not found (neither on PATH nor in default install locations).
exit /b 1

:wix_found
echo wix_exe=%WIXEXE%
for /f "delims=" %%A in ('"%WIXEXE%" --version 2^>nul') do echo wix_version=%%A
echo.

echo [2] Rebuild MSI from Package.wxs
pushd "%ROOT%\win10-stack\installer\wix" >nul
"%WIXEXE%" build "Package.wxs" -o "out\ScingR.msi"
set "BUILD_RC=%ERRORLEVEL%"
popd >nul
echo wix_build_rc=%BUILD_RC%
if not "%BUILD_RC%"=="0" goto :build_failed
if not exist "%MSI%" goto :msi_missing

echo [OK] MSI exists.
echo.

goto :after_build_checks

:build_failed
echo [FATAL] wix build failed. Paste the wix output above.
exit /b 1

:msi_missing
echo [FATAL] MSI not produced: %MSI%
exit /b 1

:after_build_checks

echo [3] Install (quiet) with verbose log
del /q "%LOG%" >nul 2>nul
msiexec /i "%MSI%" /qn /norestart /l*v "%LOG%"
set "MSI_RC=%ERRORLEVEL%"
echo msiexec_return_code=%MSI_RC%
echo.

echo [4] Tail install log
if not exist "%LOG%" goto :no_install_log
echo ---- LOG TAIL (last 80 lines) ----
powershell -NoProfile -Command "Get-Content -LiteralPath '%LOG%' -Tail 80"
goto :after_install_log

:no_install_log
echo [WARN] Install log not found at: %LOG%

:after_install_log
echo.

echo [5] Quick verification: uninstall registry entries (Scing/ScingR)
powershell -NoProfile -Command "Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*' -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -match 'ScingR|Scing' } | Select-Object DisplayName,DisplayVersion,Publisher,InstallLocation,UninstallString | Format-List"
powershell -NoProfile -Command "Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*' -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -match 'ScingR|Scing' } | Select-Object DisplayName,DisplayVersion,Publisher,InstallLocation,UninstallString | Format-List"
powershell -NoProfile -Command "Get-ItemProperty 'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*' -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -match 'ScingR|Scing' } | Select-Object DisplayName,DisplayVersion,Publisher,InstallLocation,UninstallString | Format-List"

echo.
echo [6] Service/process scan (best-effort)
powershell -NoProfile -Command "Get-Service | Where-Object { $_.Name -match 'Scing|ScingR' -or $_.DisplayName -match 'Scing|ScingR' } | Select-Object Name,Status,StartType,DisplayName | Format-Table -AutoSize"
powershell -NoProfile -Command "$p=Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -match 'scing|scingr' }; if($p){ $p | Select-Object Id,ProcessName,Path | Format-Table -AutoSize } else { 'No scing/scingr processes detected.' }"

echo.
echo ============================================================
echo DONE
echo ============================================================
endlocal
exit /b 0
