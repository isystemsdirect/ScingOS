@echo off
setlocal enabledelayedexpansion

REM === SpectroCAP Clipboard Host (Win10) build + run ===
REM Runs Release build, then launches the EXE.
REM If LAN binding fails due to URLACL, app will log the exact netsh command.

REM Set repo root relative to this script location
set "REPO=%~dp0"
pushd "%REPO%"

set "PROJ=apps\windows\spectrocap-windows\SpectroCAP.Windows.ClipboardHost\SpectroCAP.Windows.ClipboardHost.csproj"
set "OUT=apps\windows\spectrocap-windows\SpectroCAP.Windows.ClipboardHost\bin\Release\net8.0-windows\SpectroCAP.ClipboardHost.exe"

echo [1/2] Building Release...
dotnet build "%PROJ%" -c Release
if errorlevel 1 (
  echo Build failed. Fix errors above.
  popd
  exit /b 1
)

if not exist "%OUT%" (
  echo EXE not found: %OUT%
  popd
  exit /b 1
)

echo [2/2] Launching...
start "" "%OUT%"

popd
endlocal
