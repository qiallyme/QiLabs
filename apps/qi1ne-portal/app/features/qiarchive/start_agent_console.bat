@echo off
setlocal
cd /d "%~dp0"
echo Starting QiArchive Agent Console...

REM Launch the status pill in the background
start /b "" "C:\Python314\python.exe" "app\agent\status_overlay.py"

REM Launch the web console
"C:\Python314\python.exe" "app\agent\console.py"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR: Failed to start the agent.
    pause
)
