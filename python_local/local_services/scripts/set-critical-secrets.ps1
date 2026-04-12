# Set secrets for the 3 critical workers: embedder, memory, orchestrator
# Run from anywhere - script auto-detects repo root

Write-Host "Setting secrets for critical workers..." -ForegroundColor Cyan
Write-Host ""

# Navigate to repo root (scripts are in workers/scripts/)
$rootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$envFile = Join-Path $rootDir ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "[ERROR] .env file not found at: $envFile" -ForegroundColor Red
    exit 1
}

# Parse .env file
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
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

# Critical workers and their required secrets
$criticalWorkers = @{
    embedder = @{
        name = "gina-embedder"
        secrets = @(
            @{ name = "SUPABASE_URL"; value = $envVars["SUPABASE_URL"] }
            @{ name = "SUPABASE_SERVICE_ROLE_KEY"; value = $envVars["SUPABASE_SERVICE_ROLE_KEY"] }
            @{ name = "OPENAI_API_KEY"; value = $envVars["OPENAI_API_KEY"] }
        )
    }
    memory = @{
        name = "qimemory-worker"
        secrets = @(
            @{ name = "SUPABASE_URL"; value = $envVars["SUPABASE_URL"] }
            @{ name = "SUPABASE_ANON_KEY"; value = $envVars["SUPABASE_ANON_KEY"] }
            @{ name = "OPENAI_API_KEY"; value = $envVars["OPENAI_API_KEY"] }
            @{ name = "CHAT_MODEL"; value = "gpt-4o-mini" }
        )
    }
    orchestrator = @{
        name = "gina-orchestrator"
        secrets = @(
            @{ name = "MEMORY_WORKER_URL"; value = $envVars["MEMORY_WORKER_URL"] }
            @{ name = "OPENAI_API_KEY"; value = $envVars["OPENAI_API_KEY"] }
            @{ name = "CHAT_MODEL"; value = "gpt-4o-mini" }
            @{ name = "SUPABASE_URL"; value = $envVars["SUPABASE_URL"] }
            @{ name = "SUPABASE_SERVICE_ROLE_KEY"; value = $envVars["SUPABASE_SERVICE_ROLE_KEY"] }
        )
    }
}

foreach ($workerKey in $criticalWorkers.Keys) {
    $worker = $criticalWorkers[$workerKey]
    $workerName = $worker.name
    $workerDir = "workers\cloud\$workerKey"
    
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "Worker: $workerName" -ForegroundColor Yellow
    Write-Host "Directory: $workerDir" -ForegroundColor Gray
    Write-Host "========================================" -ForegroundColor Yellow
    
    if (-not (Test-Path $workerDir)) {
        Write-Host "[WARN] Directory not found: $workerDir" -ForegroundColor Yellow
        Write-Host ""
        continue
    }
    
    Set-Location $rootDir
    Set-Location $workerDir
    
    foreach ($secret in $worker.secrets) {
        $secretName = $secret.name
        $secretValue = $secret.value
        
        if ([string]::IsNullOrWhiteSpace($secretValue) -or $secretValue -match "your-.*-here" -or $secretValue -match "https://your-") {
            Write-Host "  [SKIP] $secretName - value not set or is placeholder" -ForegroundColor Gray
            continue
        }
        
        Write-Host "  Setting $secretName..." -ForegroundColor Cyan
        
        # Try to set secret using wrangler
        try {
            # Create temp file with secret value
            $tempFile = [System.IO.Path]::GetTempFileName()
            $secretValue | Out-File -FilePath $tempFile -Encoding utf8 -NoNewline
            
            # Try piping to wrangler
            Get-Content $tempFile -Raw | & npx wrangler secret put $secretName 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [OK] $secretName set successfully" -ForegroundColor Green
            } else {
                # Fallback: use cmd echo
                $secretValue | cmd /c "npx wrangler secret put $secretName" 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  [OK] $secretName set successfully" -ForegroundColor Green
                } else {
                    Write-Host "  [MANUAL] Please set manually:" -ForegroundColor Yellow
                    Write-Host "    npx wrangler secret put $secretName" -ForegroundColor Gray
                    Write-Host "    (Then paste the value when prompted)" -ForegroundColor Gray
                }
            }
            
            Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "  [MANUAL] Please set manually:" -ForegroundColor Yellow
            Write-Host "    npx wrangler secret put $secretName" -ForegroundColor Gray
        }
    }
    
    Set-Location $rootDir
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Next Steps" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Redeploy the workers:" -ForegroundColor Cyan
Write-Host "   cd C:\QiOS_v1" -ForegroundColor White
Write-Host "   npx wrangler deploy workers/cloud/embedder" -ForegroundColor White
Write-Host "   npx wrangler deploy workers/cloud/memory" -ForegroundColor White
Write-Host "   npx wrangler deploy workers/cloud/orchestrator" -ForegroundColor White
Write-Host ""
Write-Host "2. Check worker logs if errors persist:" -ForegroundColor Cyan
Write-Host "   npx wrangler tail gina-embedder" -ForegroundColor White
Write-Host ""
Write-Host "3. Verify secrets:" -ForegroundColor Cyan
Write-Host "   .\scripts\check-secrets.ps1" -ForegroundColor White

