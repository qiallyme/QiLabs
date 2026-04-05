@echo off
setlocal enabledelayedexpansion
title QiNode: Sovereign Spark

echo 🧬 [IGNITION] Starting...

:: 1. Force Lightweight GNU Toolchain
where rustc >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ Rust not found. Installing Lightweight GNU Toolchain...
    winget install --id Rustlang.Rustup --accept-source-agreements --accept-package-agreements
)

:: 2. CRITICAL: Switch from MSVC to GNU (Avoids Visual Studio Error)
echo ⚙️  Switching to GNU Toolchain (No Visual Studio Required)...
rustup default stable-x86_64-pc-windows-gnu

:: 3. Inject Path
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"

:: 4. Morphogenesis
echo 🛠  Compiling seed.rs...
rustc seed.rs -o qiondria_init.exe
if %errorlevel% neq 0 (
    echo ❌ [ERROR] Compilation failed. Ensure seed.rs is in this folder.
    pause
    exit /b
)

:: 5. Ignition
echo 🚀 Spawning Genesis Cell...
qiondria_init.exe

:: 6. SURGICAL CLEANUP (New)
:: This removes the 'trash' automatically so the user never sees it.
if exist qiondria_init.exe (
    del /f /q qiondria_init.exe
    if exist qiondria_init.pdb del /f /q qiondria_init.pdb
    echo 🧹 Temporary expansion files purged.
)

echo.
echo ✨ [COMPLETE] QiNode Universe Expanded.
pause
