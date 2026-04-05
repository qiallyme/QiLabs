@echo off
title QiPics - AI Image Generator

REM Check if venv exists
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found!
    echo Please run setup_venv.bat first
    echo.
    pause
    exit /b 1
)

REM Activate venv and run app
call venv\Scripts\activate.bat
python app.py

REM Keep window open if error occurs
if errorlevel 1 (
    echo.
    echo Application closed with errors
    pause
)

