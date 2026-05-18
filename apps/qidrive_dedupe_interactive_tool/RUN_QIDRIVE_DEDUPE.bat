@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    py qidrive_dedupe_interactive.py
    pause
    exit /b
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python qidrive_dedupe_interactive.py
    pause
    exit /b
)

echo Python was not found in PATH.
echo Open this folder in PowerShell and run the script with your known Python path.
pause
