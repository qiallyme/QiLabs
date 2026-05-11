# PowerShell script to test queue admin endpoints
# Usage: .\test_queue_admin.ps1

$baseUrl = "http://localhost:7130"

Write-Host "Testing Queue Admin Endpoints" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check current queue status
Write-Host "1. Current queue status:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/queue" -Method GET
    $response | ConvertTo-Json
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
Write-Host ""

# 2. Get sample items
Write-Host "2. Sample pending items (limit 5):" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/queue/items?limit=5&status=pending" -Method GET
    Write-Host "Found $($response.count) items" -ForegroundColor Green
    $response.items | Select-Object -First 3 | ConvertTo-Json
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
Write-Host ""

# 3. Reset queue (WARNING: This deletes everything!)
Write-Host "3. Reset queue (DELETE ALL ITEMS):" -ForegroundColor Yellow
$confirm = Read-Host "Are you sure you want to delete all queue items? (yes/no)"
if ($confirm -eq "yes") {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/queue/reset" -Method POST
        Write-Host "SUCCESS: Deleted $($response.deleted) items" -ForegroundColor Green
        $response | ConvertTo-Json
    } catch {
        Write-Host "ERROR: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Cancelled" -ForegroundColor Gray
}
Write-Host ""

# 4. Check queue status after reset
Write-Host "4. Queue status after reset:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/queue" -Method GET
    $response | ConvertTo-Json
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
Write-Host ""

# 5. Retry errors (if any)
Write-Host "5. Retry failed items:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/queue/retry_errors" -Method POST
    Write-Host "Retried $($response.retried) items" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "Done!" -ForegroundColor Cyan

