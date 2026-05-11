@echo off
echo QiVideo High-Quality Processing
echo ===============================

echo.
echo This script will run high-quality video processing that preserves
echo and enhances both audio and video quality.
echo.
echo Features:
echo - Preserves original video quality
echo - Enhances audio to 320k AAC
echo - Uses 10-bit color depth
echo - Advanced x264 encoding settings
echo - Optimized for quality over speed
echo.

set /p workdir="Enter work directory (or press Enter for S:\): "
if "%workdir%"=="" set workdir=S:\

echo.
echo Starting high-quality processing for: %workdir%
echo.
echo Note: This will take longer than regular processing but will
echo produce much higher quality results.
echo.

python app.py hq-combine --workdir "%workdir%"

echo.
echo High-quality processing complete!
pause

