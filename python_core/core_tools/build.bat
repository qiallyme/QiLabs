@echo off
:: Ensure pyinstaller is installed
pip install pyinstaller >nul 2>&1

:: Run the automated builder script
python builder.py

pause