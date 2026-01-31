@echo off
setlocal

set "PORT=45819"

echo Configuring URLACL for LAN listen on port %PORT%...
echo NOTE: Run this script in an elevated (Admin) Command Prompt.
netsh http add urlacl url=http://+:%PORT%/ user="%USERDOMAIN%\%USERNAME%"

echo.
echo Adding Windows Firewall rule (Private profile)...
netsh advfirewall firewall add rule name="SpectroCAP Clipboard Host (TCP %PORT%)" ^
  dir=in action=allow protocol=TCP localport=%PORT% profile=private

echo.
echo Done.
pause
