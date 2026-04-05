# Verify secrets are set, then guide through testing
# Run from anywhere - script auto-detects repo root

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QiOS RAG System - Verification & Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to repo root (scripts are in workers/scripts/)
$rootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $rootDir

# Step 1: Verify secrets
Write-Host "Step 1: Verifying secrets..." -ForegroundColor Yellow
Write-Host ""

$criticalWorkers = @(
    @{ name = "gina-embedder"; dir = "workers\cloud\embedder" }
    @{ name = "qimemory-worker"; dir = "workers\cloud\memory" }
    @{ name = "gina-orchestrator"; dir = "workers\cloud\orchestrator" }
)

$allSecretsSet = $true

foreach ($worker in $criticalWorkers) {
    $workerName = $worker.name
    $workerDir = $worker.dir
    
    Write-Host "Checking $workerName..." -ForegroundColor Cyan
    
    if (Test-Path $workerDir) {
        Set-Location $workerDir
        
        $secretList = npx wrangler secret list 2>&1 | Out-String
        
        if ($secretList -match "No secrets") {
            Write-Host "  [WARN] No secrets found" -ForegroundColor Yellow
            $allSecretsSet = $false
        } else {
            Write-Host "  [OK] Secrets configured" -ForegroundColor Green
            # Show secret names (but not values)
            $secretList -split "`n" | Where-Object { $_ -match "^\s+\w+" } | ForEach-Object {
                $secretName = ($_ -split "\s+")[0]
                if ($secretName) {
                    Write-Host "    - $secretName" -ForegroundColor Gray
                }
            }
        }
        
        Set-Location $rootDir
    } else {
        Write-Host "  [ERROR] Directory not found: $workerDir" -ForegroundColor Red
        $allSecretsSet = $false
    }
    
    Write-Host ""
}

if (-not $allSecretsSet) {
    Write-Host "[WARN] Some secrets may be missing. Run .\scripts\set-critical-secrets.ps1 to set them." -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Deploy workers
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Step 2: Deploy Workers" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ready to deploy? (Y/n)" -ForegroundColor Cyan
$deploy = Read-Host

if ($deploy -ne "n" -and $deploy -ne "N") {
    foreach ($worker in $criticalWorkers) {
        $workerName = $worker.name
        $workerDir = $worker.dir
        
        Write-Host ""
        Write-Host "Deploying $workerName..." -ForegroundColor Yellow
        
        if (Test-Path $workerDir) {
            Set-Location $workerDir
            npx wrangler deploy
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] $workerName deployed" -ForegroundColor Green
            } else {
                Write-Host "[FAIL] $workerName deployment failed" -ForegroundColor Red
            }
            Set-Location $rootDir
        }
    }
} else {
    Write-Host "Skipping deployment. Run .\scripts\deploy-critical.ps1 when ready." -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Step 3: Check Embeddings in Supabase" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Run this SQL query in Supabase:" -ForegroundColor Cyan
Write-Host ""
Write-Host "select" -ForegroundColor White
Write-Host "  count(*) as total," -ForegroundColor White
Write-Host "  count(*) filter (where embedding_status = 'pending') as pending," -ForegroundColor White
Write-Host "  count(*) filter (where embedding is not null) as with_embedding" -ForegroundColor White
Write-Host "from public.semantic_profile;" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter after checking..." -ForegroundColor Yellow
$null = Read-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Step 4: Test Endpoints" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ready to test endpoints? (Y/n)" -ForegroundColor Cyan
$test = Read-Host

if ($test -ne "n" -and $test -ne "N") {
    Write-Host ""
    Write-Host "Running endpoint tests..." -ForegroundColor Cyan
    Write-Host ""
    
    # Run the test script
    .\scripts\test-with-curl.ps1
} else {
    Write-Host "Skipping tests. Run .\scripts\test-with-curl.ps1 when ready." -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

