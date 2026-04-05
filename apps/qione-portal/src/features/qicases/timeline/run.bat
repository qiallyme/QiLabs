@echo off
title QiOne Timeline - Sync
echo ====================================================
echo   MONOREPO DETECTED: USING PNPM
echo ====================================================

echo [1/3] Checking Python Dependencies...
python -m pip install markdown >nul 2>&1

echo [2/3] Running Differential Builder...
python build_and_dev.py
if %ERRORLEVEL% NEQ 0 (
    echo ! ERROR: Python build failed.
    pause
    exit /b
)

echo.
echo [3/3] Launching Vite via PNPM...
:: Use pnpm dev to ensure the monorepo workspace is correctly mapped
call pnpm dev

echo.
pause