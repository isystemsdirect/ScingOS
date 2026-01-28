:: SCINGR_RUNTIME_PAYLOAD_AND_MSI_WIN10.cmd
:: Run from repo root in VS Code terminal (Windows 10 Pro).
:: Outcome: creates a runnable ScingR payload, installs it via WiX v6 MSI (per-user),
:: creates Start Menu shortcut, rebuilds MSI, installs silently, and verifies artifacts.

@echo off
setlocal EnableExtensions

set "ROOT=%CD%"
set "WIX_DIR=%ROOT%\win10-stack\installer\wix"
set "PAYLOAD_DIR=%ROOT%\win10-stack\installer\payload"
set "WXS=%WIX_DIR%\Package.wxs"
set "MSI=%WIX_DIR%\out\ScingR.msi"
set "LOG=%ROOT%\.tmp\scingr_install.log"

echo ============================================================
echo SCINGR RUNTIME + MSI (WIN10 PRO)
echo ============================================================
echo ROOT=%ROOT%

echo.
echo [0] Ensure folders
if not exist "%ROOT%\.tmp" mkdir "%ROOT%\.tmp" >nul 2>nul
if not exist "%PAYLOAD_DIR%" mkdir "%PAYLOAD_DIR%" >nul 2>nul
if not exist "%WIX_DIR%\out" mkdir "%WIX_DIR%\out" >nul 2>nul

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
echo [2] Create ScingR runtime payload (simple launcher + version marker)
set "RUN_CMD=%PAYLOAD_DIR%\scingr-run.cmd"
set "VER_TXT=%PAYLOAD_DIR%\scingr.version.txt"

echo @echo off> "%RUN_CMD%"
echo echo ScingR runtime is alive.>> "%RUN_CMD%"
echo echo TIME=%%DATE%% %%TIME%%>> "%RUN_CMD%"
echo echo USER=%%USERNAME%%>> "%RUN_CMD%"
echo echo MACHINE=%%COMPUTERNAME%%>> "%RUN_CMD%"
echo echo.>> "%RUN_CMD%"
echo pause>> "%RUN_CMD%"

echo ScingR scaffold runtime v0.0.1> "%VER_TXT%"

echo [OK] Payload created:
dir /b "%PAYLOAD_DIR%"

echo.
echo [3] Verify Package.wxs exists and references payload
if not exist "%WXS%" goto :missing_wxs
powershell -NoProfile -Command "Select-String -LiteralPath '%WXS%' -Pattern 'PayloadRunComponent|PayloadVersionComponent|fil_scingr_run|fil_scingr_ver|StartMenuComponent|scut_RunScingR' -SimpleMatch | Select-Object -First 20 | ForEach-Object { $_.Line }" 2>nul

goto :after_wxs

:missing_wxs
echo [FATAL] Missing: %WXS%
exit /b 1

:after_wxs

echo.
echo [4] Rebuild MSI
pushd "%WIX_DIR%" >nul
"%WIXEXE%" build "Package.wxs" -o "out\ScingR.msi"
set "BUILD_RC=%ERRORLEVEL%"
popd >nul

echo wix_build_rc=%BUILD_RC%
if not "%BUILD_RC%"=="0" goto :build_failed
if not exist "%MSI%" goto :msi_missing

echo [OK] MSI built: %MSI%

goto :after_build

:build_failed
echo [FATAL] wix build failed. Paste the wix output.
exit /b 1

:msi_missing
echo [FATAL] MSI missing after build: %MSI%
exit /b 1

:after_build

echo.
echo [5] Install MSI silently + log
if exist "%LOG%" del /q "%LOG%" >nul 2>nul
msiexec /i "%MSI%" /qn /norestart /l*v "%LOG%"
set "MSI_RC=%ERRORLEVEL%"
echo msiexec_return_code=%MSI_RC%

echo.
echo [6] Tail install log (last 60)
if not exist "%LOG%" goto :no_install_log
powershell -NoProfile -Command "Get-Content -LiteralPath '%LOG%' -Tail 60"
goto :after_install_log

:no_install_log
echo [WARN] No install log found: %LOG%

:after_install_log

echo.
echo [7] Verify installed artifacts
set "INST_DIR=%LocalAppData%\ScingR"
set "INST_RUN=%LocalAppData%\ScingR\scingr-run.cmd"
set "INST_VER=%LocalAppData%\ScingR\scingr.version.txt"
set "LNK=%AppData%\Microsoft\Windows\Start Menu\Programs\ScingR\Run ScingR.lnk"

echo install_dir=%INST_DIR%
if exist "%INST_RUN%" (echo [OK] %INST_RUN%)
if not exist "%INST_RUN%" echo [WARN] Missing %INST_RUN%
if exist "%INST_VER%" (echo [OK] %INST_VER%)
if not exist "%INST_VER%" echo [WARN] Missing %INST_VER%
if exist "%LNK%" (echo [OK] %LNK%)
if not exist "%LNK%" echo [WARN] Missing %LNK%

echo.
echo [8] Installed product entry (HKCU uninstall, best-effort)
powershell -NoProfile -Command "Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*' -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -match 'ScingR' } | Select-Object DisplayName,DisplayVersion,Publisher,InstallLocation,UninstallString | Format-List"

echo.
echo ============================================================
echo DONE.
echo Next manual check:
echo   Start Menu -> ScingR -> Run ScingR
echo ============================================================
endlocal
exit /b 0
