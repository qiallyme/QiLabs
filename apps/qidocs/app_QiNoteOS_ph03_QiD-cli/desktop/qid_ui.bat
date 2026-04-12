@echo off
setlocal
cd /d "%~dp0.."
python qid.py
endlocal
@echo off
cd /d "%~dp0.."
python qid.py ui
