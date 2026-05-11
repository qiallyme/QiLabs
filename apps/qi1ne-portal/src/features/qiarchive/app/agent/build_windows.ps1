$ErrorActionPreference = "Stop"

# Ensure venv is active before running, or adjust python path
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Clean old builds
if (Test-Path ".\dist") { Remove-Item ".\dist" -Recurse -Force }
if (Test-Path ".\build") { Remove-Item ".\build" -Recurse -Force }

# Build one-folder portable app
pyinstaller `
  --noconfirm `
  --clean `
  --onedir `
  --name "QID_CLI" `
  --icon "_assets\qid.ico" `
  "qid.py"

# Create portable bundle folder
$Out = ".\dist\QID_CLI_PORTABLE"
New-Item -ItemType Directory -Force -Path $Out | Out-Null

Copy-Item ".\dist\QID_CLI\*" $Out -Recurse -Force
Copy-Item ".\_qid_registry.json" $Out -Force
Copy-Item ".\_qid_state.json" $Out -Force

# Support dirs (logs/backups/wal) - keep empty dirs in package
New-Item -ItemType Directory -Force -Path (Join-Path $Out "_logs") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Out "_wal") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Out "_backups\daily") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Out "_backups\rolling") | Out-Null

# Launchers
Copy-Item ".\desktop\qid_launcher.bat" $Out -Force
Copy-Item ".\desktop\qid_ui.bat" $Out -Force
Copy-Item ".\desktop\create_shortcut.ps1" $Out -Force
Copy-Item ".\desktop\create_shortcut.vbs" $Out -Force
Copy-Item ".\README.md" $Out -Force
Copy-Item ".\LICENSE" $Out -Force

Write-Host "`nOK: Portable build at $Out"
Write-Host "Run: $Out\QID_CLI.exe  (CLI) or use qid_ui.bat"
