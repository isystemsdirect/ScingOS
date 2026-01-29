@echo off
cd /d %~dp0
call gradlew.bat :app:assembleDebug --no-daemon
if exist app\build\outputs\apk\debug\app-debug.apk (
    echo BUILD SUCCESS
    dir /s app\build\outputs\apk\debug\app-debug.apk
) else (
    echo BUILD FAILED
    exit /b 1
)
