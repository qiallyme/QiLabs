@echo off
echo ============================================
echo   QiPics - Building Portable Executable
echo ============================================
echo.

REM Check if venv exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found
    echo Please run setup_venv.bat first
    pause
    exit /b 1
)

call venv\Scripts\activate.bat

echo Installing PyInstaller...
pip install pyinstaller

echo.
echo Building executable...
pyinstaller --name="QiPics" ^
    --onefile ^
    --windowed ^
    --icon=icon.ico ^
    --add-data="example_images.csv;." ^
    app.py

if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Build Complete!
echo ============================================
echo.
echo Executable created at: dist\QiPics.exe
echo.
echo You can distribute this single file - no Python needed!
echo.
pause

