# Set all worker secrets from .env file
# Run from anywhere - script auto-detects repo root

Write-Host "Setting secrets from .env file..." -ForegroundColor Cyan
Write-Host ""

# Navigate to repo root (scripts are in workers/scripts/)
$rootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$envFile = Join-Path $rootDir ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "[ERROR] .env file not found at: $envFile" -ForegroundColor Red
    Write-Host "Please ensure .env exists in the root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "Reading .env file from: $envFile" -ForegroundColor Gray
Write-Host ""

# Parse .env file
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    # Skip empty lines and comments
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            # Remove quotes if present
            if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            if ($value.StartsWith("'") -and $value.EndsWith("'")) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            $envVars[$key] = $value
        }
    }
}

# Worker secret mappings
$workerSecrets = @{
    orchestrator = @{
        SUPABASE_URL = $envVars["SUPABASE_URL"]
        SUPABASE_SERVICE_ROLE_KEY = $envVars["SUPABASE_SERVICE_ROLE_KEY"]
        OPENAI_API_KEY = $envVars["OPENAI_API_KEY"]
        MEMORY_WORKER_URL = $envVars["MEMORY_WORKER_URL"]
    }
    memory = @{
        SUPABASE_URL = $envVars["SUPABASE_URL"]
        SUPABASE_ANON_KEY = $envVars["SUPABASE_ANON_KEY"]
        OPENAI_API_KEY = $envVars["OPENAI_API_KEY"]
    }
    embedder = @{
        SUPABASE_URL = $envVars["SUPABASE_URL"]
        SUPABASE_SERVICE_ROLE_KEY = $envVars["SUPABASE_SERVICE_ROLE_KEY"]
        OPENAI_API_KEY = $envVars["OPENAI_API_KEY"]
    }
    ingestion = @{
        SUPABASE_URL = $envVars["SUPABASE_URL"]
        SUPABASE_SERVICE_ROLE_KEY = $envVars["SUPABASE_SERVICE_ROLE_KEY"]
    }
    self_heal = @{
        SUPABASE_URL = $envVars["SUPABASE_URL"]
        SUPABASE_SERVICE_ROLE_KEY = $envVars["SUPABASE_SERVICE_ROLE_KEY"]
    }
    metadata_naming = @{
        SUPABASE_URL = $envVars["SUPABASE_URL"]
        SUPABASE_SERVICE_ROLE_KEY = $envVars["SUPABASE_SERVICE_ROLE_KEY"]
    }
    semantic_router = @{
        SUPABASE_URL = $envVars["SUPABASE_URL"]
        SUPABASE_SERVICE_ROLE_KEY = $envVars["SUPABASE_SERVICE_ROLE_KEY"]
    }
}

# Set secrets for each worker
foreach ($workerName in $workerSecrets.Keys) {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "Setting secrets for: $workerName" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    
    $workerPath = "workers\cloud\$workerName"
    
    if (-not (Test-Path $workerPath)) {
        Write-Host "[WARN] Worker directory not found: $workerPath" -ForegroundColor Yellow
        Write-Host ""
        continue
    }
    
    Set-Location $rootDir
    Set-Location $workerPath
    
    $secrets = $workerSecrets[$workerName]
    foreach ($secretName in $secrets.Keys) {
        $secretValue = $secrets[$secretName]
        
        if ([string]::IsNullOrWhiteSpace($secretValue) -or $secretValue -match "your-.*-here" -or $secretValue -match "https://your-") {
            Write-Host "  [SKIP] $secretName - value not set or is placeholder" -ForegroundColor Gray
            continue
        }
        
        Write-Host "  Setting $secretName..." -ForegroundColor Cyan
        
        # Create a temporary file with the secret value
        $tempFile = [System.IO.Path]::GetTempFileName()
        try {
            # Write the secret value to temp file
            $secretValue | Out-File -FilePath $tempFile -Encoding utf8 -NoNewline
            
            # Use Get-Content to pipe to wrangler
            Get-Content $tempFile -Raw | & npx wrangler secret put $secretName 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [OK] $secretName set successfully" -ForegroundColor Green
            } else {
                # Fallback: try with echo (Windows)
                Write-Host "  [RETRY] Trying alternative method..." -ForegroundColor Yellow
                cmd /c "echo $secretValue | npx wrangler secret put $secretName" 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  [OK] $secretName set successfully" -ForegroundColor Green
                } else {
                    Write-Host "  [FAIL] Failed to set $secretName" -ForegroundColor Red
                    Write-Host "  [INFO] You may need to set this manually:" -ForegroundColor Yellow
                    Write-Host "    npx wrangler secret put $secretName" -ForegroundColor Gray
                }
            }
        } finally {
            # Clean up temp file
            if (Test-Path $tempFile) {
                Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
            }
        }
    }
    
    Set-Location $rootDir
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Summary" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Secrets have been set from .env file." -ForegroundColor Cyan
Write-Host "Run .\scripts\check-secrets.ps1 to verify." -ForegroundColor White

