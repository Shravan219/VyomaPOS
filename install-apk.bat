@echo off
setlocal
echo ===================================================
echo   VyomaPOS - Xtra Rooftop - Android APK Installer
echo ===================================================

node "%~dp0scripts\install-apk.cjs" %*
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Press any key to exit...
    pause >nul
)
