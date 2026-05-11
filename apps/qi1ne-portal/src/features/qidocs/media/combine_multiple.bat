@echo off
echo QiVideo Combine Multiple Folders
echo ================================

echo.
echo This script will help you combine multiple folders simultaneously.
echo Each folder will be processed in a separate window.
echo.

set /p folder1="Enter first folder path (or press Enter to skip): "
if not "%folder1%"=="" (
    echo Starting combine for: %folder1%
    start "Combine Folder 1" powershell -Command "cd '%~dp0'; python app.py combine-drive --drive-path '%folder1%'"
)

set /p folder2="Enter second folder path (or press Enter to skip): "
if not "%folder2%"=="" (
    echo Starting combine for: %folder2%
    start "Combine Folder 2" powershell -Command "cd '%~dp0'; python app.py combine-drive --drive-path '%folder2%'"
)

set /p folder3="Enter third folder path (or press Enter to skip): "
if not "%folder3%"=="" (
    echo Starting combine for: %folder3%
    start "Combine Folder 3" powershell -Command "cd '%~dp0'; python app.py combine-drive --drive-path '%folder3%'"
)

echo.
echo All combine operations started!
echo Check the individual windows for progress.
echo.
pause
