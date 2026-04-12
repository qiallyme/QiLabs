# Test QiOS RAG System - Three-Step Verification
# Run from anywhere - script auto-detects repo root

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QiOS RAG System Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to repo root (scripts are in workers/scripts/)
$rootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$envFile = Join-Path $rootDir ".env"

if (Test-Path $envFile) {
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
    
    $memoryUrl = $envVars["MEMORY_WORKER_URL"]
    $orchestratorUrl = $envVars["GINA_ORCHESTRATOR_URL"]
} else {
    Write-Host "[WARN] .env file not found, using defaults" -ForegroundColor Yellow
    $memoryUrl = "https://gina-memory.qios-gina.workers.dev"
    $orchestratorUrl = "https://gina-orchestrator.qios-gina.workers.dev"
}

Write-Host "Memory Worker URL: $memoryUrl" -ForegroundColor Gray
Write-Host "Orchestrator URL: $orchestratorUrl" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# STEP 1: Check Embeddings in Supabase
# ============================================================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "STEP 1: Check Embeddings in Supabase" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Run this SQL query in Supabase SQL Editor:" -ForegroundColor Cyan
Write-Host ""
Write-Host "select" -ForegroundColor White
Write-Host "  count(*) as total," -ForegroundColor White
Write-Host "  count(*) filter (where embedding is not null) as with_embedding" -ForegroundColor White
Write-Host "from public.semantic_profile;" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter after you've run the query and seen the results..." -ForegroundColor Yellow
$null = Read-Host

Write-Host ""
Write-Host "What did you see?" -ForegroundColor Cyan
Write-Host "  - If with_embedding > 0: Embeddings are being created!" -ForegroundColor Green
Write-Host "  - If with_embedding = 0: Embedder may be failing (check logs)" -ForegroundColor Red
Write-Host ""
Write-Host "Press Enter to continue to Step 2..." -ForegroundColor Yellow
$null = Read-Host

# ============================================================================
# STEP 2: Test Memory Worker /query Endpoint
# ============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "STEP 2: Test Memory Worker /query" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

$queryBody = @{
    query = "What is QiOS Genesis?"
    matchCount = 5
    realm = "QiVault"
    realmSlug = $null
    pathPrefix = ""
} | ConvertTo-Json

Write-Host "Testing: POST $memoryUrl/query" -ForegroundColor Cyan
Write-Host "Body: $queryBody" -ForegroundColor Gray
Write-Host ""

# Try PowerShell Invoke-RestMethod first, fallback to curl.exe
try {
    $response = Invoke-RestMethod -Uri "$memoryUrl/query" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $queryBody `
        -ErrorAction Stop
    
    Write-Host "[OK] Memory worker responded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
    $matchCount = if ($response.matches) { $response.matches.Count } else { 0 }
    Write-Host ""
    if ($matchCount -gt 0) {
        Write-Host "[SUCCESS] Found $matchCount matches!" -ForegroundColor Green
    } else {
        Write-Host "[WARN] No matches found. This could mean:" -ForegroundColor Yellow
        Write-Host "  - Embeddings are null (check Step 1)" -ForegroundColor Yellow
        Write-Host "  - Filters are too strict (realm/pathPrefix)" -ForegroundColor Yellow
        Write-Host "  - No matching content in semantic_profile" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Memory worker request failed!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Response Body: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Try with curl.exe instead:" -ForegroundColor Yellow
    $curlBody = $queryBody -replace '"', '\"'
    Write-Host "curl.exe -X POST `"$memoryUrl/query`" -H `"Content-Type: application/json`" -d `"$curlBody`"" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Press Enter to continue to Step 3..." -ForegroundColor Yellow
$null = Read-Host

# ============================================================================
# STEP 3: Test Orchestrator /api/gina/chat
# ============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "STEP 3: Test Gina /api/gina/chat" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

$chatBody = @{
    message = "Explain QiOS Genesis to me in simple terms."
    realm = "QiVault"
    realmSlug = $null
    pathPrefix = ""
    enableRag = $true
} | ConvertTo-Json

Write-Host "Testing: POST $orchestratorUrl/api/gina/chat" -ForegroundColor Cyan
Write-Host "Body: $chatBody" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$orchestratorUrl/api/gina/chat" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $chatBody `
        -ErrorAction Stop
    
    Write-Host "[OK] Gina responded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Gina's Answer:" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    if ($response.answer) {
        Write-Host $response.answer -ForegroundColor White
    } elseif ($response.reply) {
        Write-Host $response.reply -ForegroundColor White
    } else {
        Write-Host "(No answer field found in response)" -ForegroundColor Yellow
    }
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host ""
    
    if ($response.meta) {
        Write-Host "Metadata:" -ForegroundColor Cyan
        $response.meta | ConvertTo-Json | Write-Host
        Write-Host ""
        
        if ($response.meta.rag_used) {
            Write-Host "[SUCCESS] RAG was used! (rag_used = true)" -ForegroundColor Green
        } else {
            Write-Host "[WARN] RAG may not have been used (rag_used = false or missing)" -ForegroundColor Yellow
        }
        
        if ($response.meta.match_count) {
            Write-Host "Match count: $($response.meta.match_count)" -ForegroundColor Gray
        }
    }
    
    if ($response.matches) {
        Write-Host ""
        Write-Host "RAG Matches: $($response.matches.Count)" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "[ERROR] Gina request failed!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Response Body: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Try with curl.exe instead:" -ForegroundColor Yellow
    $curlBody = $chatBody -replace '"', '\"'
    Write-Host "curl.exe -X POST `"$orchestratorUrl/api/gina/chat`" -H `"Content-Type: application/json`" -d `"$curlBody`"" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  1. Check embeddings count in Supabase" -ForegroundColor White
Write-Host "  2. Memory worker /query endpoint" -ForegroundColor White
Write-Host "  3. Gina orchestrator /api/gina/chat endpoint" -ForegroundColor White
Write-Host ""
Write-Host "If any step failed, check:" -ForegroundColor Yellow
Write-Host "  - Worker logs in Cloudflare Dashboard" -ForegroundColor White
Write-Host "  - Secrets are set correctly (run .\scripts\check-secrets.ps1)" -ForegroundColor White
Write-Host "  - Workers are deployed (run .\scripts\deploy-all.ps1)" -ForegroundColor White

