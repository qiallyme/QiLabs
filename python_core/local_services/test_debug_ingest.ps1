# Test script for debug/ingest_once endpoint
# Usage: .\test_debug_ingest.ps1

Write-Host "Testing debug/ingest_once endpoint..." -ForegroundColor Cyan
Write-Host ""

# Get initial queue status
Write-Host "1. Initial queue status:" -ForegroundColor Yellow
try {
    $initial = Invoke-RestMethod -Uri "http://localhost:7130/queue" -Method GET
    Write-Host "   Pending: $($initial.pending)" -ForegroundColor White
    Write-Host "   Complete: $($initial.complete)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "   ERROR: Could not get queue status" -ForegroundColor Red
    Write-Host "   Make sure the backend is running on http://localhost:7130" -ForegroundColor Yellow
    exit 1
}

# Process one item
Write-Host "2. Processing one item..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:7130/debug/ingest_once" -Method POST -ContentType "application/json" -Body "{}"
    
    if ($result.ok) {
        Write-Host "   SUCCESS!" -ForegroundColor Green
        Write-Host "   Item ID: $($result.item_id)" -ForegroundColor White
        Write-Host "   File: $($result.file_path)" -ForegroundColor White
        Write-Host "   Chunks: $($result.chunks)" -ForegroundColor White
        Write-Host "   Embeddings written: $($result.embeddings_written)" -ForegroundColor White
        if ($result.errors -and $result.errors.Count -gt 0) {
            Write-Host "   Errors: $($result.errors -join ', ')" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   FAILED: $($result.error)" -ForegroundColor Red
        if ($result.traceback) {
            Write-Host "   Traceback:" -ForegroundColor Red
            Write-Host $result.traceback -ForegroundColor Gray
        }
    }
    Write-Host ""
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Get final queue status
Write-Host "3. Final queue status:" -ForegroundColor Yellow
try {
    $final = Invoke-RestMethod -Uri "http://localhost:7130/queue" -Method GET
    Write-Host "   Pending: $($final.pending) (was $($initial.pending))" -ForegroundColor White
    Write-Host "   Complete: $($final.complete) (was $($initial.complete))" -ForegroundColor White
    Write-Host ""
    
    if ($final.pending -lt $initial.pending -and $final.complete -gt $initial.complete) {
        Write-Host "   ✓ Queue updated correctly!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Queue did not change as expected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERROR: Could not get final queue status" -ForegroundColor Red
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Cyan

