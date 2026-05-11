# QiOS Local Core - Quick Start Script (PowerShell)
# Run this to check prerequisites and start the service

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QiOS Local Core - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "[1/5] Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python not found. Install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check Ollama
Write-Host "[2/5] Checking Ollama..." -ForegroundColor Yellow
try {
    $ollamaCheck = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✓ Ollama is running" -ForegroundColor Green
    
    $models = ($ollamaCheck.Content | ConvertFrom-Json).models
    $modelNames = $models.name
    
    $hasEmbedding = $modelNames -like "*nomic-embed-text*"
    $hasLLM = $modelNames -like "*llama3.2*"
    
    if ($hasEmbedding) {
        Write-Host "  ✓ nomic-embed-text model available" -ForegroundColor Green
    } else {
        Write-Host "  ✗ nomic-embed-text not found. Run: ollama pull nomic-embed-text" -ForegroundColor Red
    }
    
    if ($hasLLM) {
        Write-Host "  ✓ llama3.2 model available" -ForegroundColor Green
    } else {
        Write-Host "  ✗ llama3.2 not found. Run: ollama pull llama3.2" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ Ollama not running or not accessible" -ForegroundColor Red
    Write-Host "    Start Ollama: ollama serve" -ForegroundColor Yellow
    Write-Host "    Or install: https://ollama.com/download" -ForegroundColor Yellow
}

# Check .env file
Write-Host "[3/5] Checking environment variables..." -ForegroundColor Yellow
$envPath = "..\..\.env"
if (Test-Path $envPath) {
    Write-Host "  ✓ .env file found" -ForegroundColor Green
    
    # Check for required vars (basic check)
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match "SUPABASE_URL" -and $envContent -match "SUPABASE_SERVICE_ROLE_KEY") {
        Write-Host "  ✓ Supabase variables present" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Supabase variables may be missing" -ForegroundColor Yellow
    }
    
    if ($envContent -match "OLLAMA_BASE_URL") {
        Write-Host "  ✓ Ollama variables present" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Ollama variables may be missing" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ .env file not found at $envPath" -ForegroundColor Red
    Write-Host "    Create .env file with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OLLAMA_BASE_URL" -ForegroundColor Yellow
}

# Check dependencies
Write-Host "[4/5] Checking Python dependencies..." -ForegroundColor Yellow
try {
    python -c "import fastapi, httpx, supabase" 2>&1 | Out-Null
    Write-Host "  ✓ Required packages installed" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Missing packages. Run: pip install -r requirements.txt" -ForegroundColor Red
    Write-Host "    Or: pip install fastapi uvicorn httpx supabase python-dotenv" -ForegroundColor Yellow
}

# Check if service is already running
Write-Host "[5/5] Checking if service is running..." -ForegroundColor Yellow
try {
    $serviceCheck = Invoke-WebRequest -Uri "http://localhost:7130/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✓ Service is already running on port 7130" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service is ready! Test with:" -ForegroundColor Cyan
    Write-Host "  python tests/test_sanity_checks.py" -ForegroundColor White
    exit 0
} catch {
    Write-Host "  ⚠ Service not running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ready to start service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Start the service with:" -ForegroundColor Yellow
Write-Host "  python qios_local_core.py" -ForegroundColor White
Write-Host ""
Write-Host "Or run tests first:" -ForegroundColor Yellow
Write-Host "  python tests/test_sanity_checks.py" -ForegroundColor White
Write-Host ""

