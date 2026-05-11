# PowerShell script to start the QiOS Local Core Worker
# Usage: .\start_worker.ps1

Write-Host "Starting QiOS Local Core Worker..." -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment is activated
if (-not $env:VIRTUAL_ENV) {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "C:\QiOS_v1\data\Clients\Zaitullah_Project\.venv\Scripts\Activate.ps1"
}

# Check for OPENAI_API_KEY
if (-not $env:OPENAI_API_KEY) {
    Write-Host "[WARN] OPENAI_API_KEY not set. Embeddings will fail." -ForegroundColor Yellow
    Write-Host "Set it with: `$env:OPENAI_API_KEY = 'your-key-here'" -ForegroundColor Yellow
    Write-Host ""
}

# Change to worker directory
Set-Location "C:\QiOS_v1\workers\local_core"

Write-Host "Starting worker process..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the worker" -ForegroundColor Gray
Write-Host ""

# Start the worker
python worker.py

