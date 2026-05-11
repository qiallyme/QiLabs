# Test RAG endpoints using curl.exe (Windows native)
# Run from anywhere - script auto-detects repo root

Write-Host "Testing RAG endpoints with curl.exe..." -ForegroundColor Cyan
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

Write-Host "Memory Worker: $memoryUrl" -ForegroundColor Gray
Write-Host "Orchestrator: $orchestratorUrl" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# Test Memory Worker
# ============================================================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Testing Memory Worker /query" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

$queryJson = '{"query":"What is QiOS Genesis?","matchCount":5,"realm":"QiVault","realmSlug":null,"pathPrefix":""}'

Write-Host "Command:" -ForegroundColor Cyan
Write-Host "curl.exe -X POST `"$memoryUrl/query`" -H `"Content-Type: application/json`" -d `"$queryJson`"" -ForegroundColor Gray
Write-Host ""

$response = curl.exe -X POST "$memoryUrl/query" -H "Content-Type: application/json" -d $queryJson 2>&1

Write-Host "Response:" -ForegroundColor Cyan
Write-Host $response
Write-Host ""

# ============================================================================
# Test Orchestrator
# ============================================================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Testing Orchestrator /api/gina/chat" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

$chatJson = '{"message":"Explain QiOS Genesis to me in simple terms.","realm":"QiVault","realmSlug":null,"pathPrefix":"","enableRag":true}'

Write-Host "Command:" -ForegroundColor Cyan
Write-Host "curl.exe -X POST `"$orchestratorUrl/api/gina/chat`" -H `"Content-Type: application/json`" -d `"$chatJson`"" -ForegroundColor Gray
Write-Host ""

$response = curl.exe -X POST "$orchestratorUrl/api/gina/chat" -H "Content-Type: application/json" -d $chatJson 2>&1

Write-Host "Response:" -ForegroundColor Cyan
Write-Host $response
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

