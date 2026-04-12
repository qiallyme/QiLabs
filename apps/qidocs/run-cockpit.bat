@echo off
REM === Run QiCockpit dev environment and open browser ===

cd /d "C:\Users\codyr\OneDrive\Documents\QiDev\QiCockpit"

REM Start dev servers (cockpit + worker) in a new terminal window
start "QiCockpit Dev" cmd /k "npm run dev"

REM Give Vite a few seconds to boot
timeout /t 7 /nobreak >nul

REM Open Cockpit in your default browser
start "" "http://localhost:5173/"

