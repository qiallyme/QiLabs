@echo off
setlocal
set "ROOT=%~dp0"

if not exist "%ROOT%.venv\Scripts\python.exe" (
  echo [!] No venv found. Running setup...
  powershell -ExecutionPolicy Bypass -File "%ROOT%scripts\venv_setup.ps1" || exit /b 1
)

call "%ROOT%.venv\Scripts\activate"
python "%ROOT%app.py" %*
