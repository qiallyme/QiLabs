# QiVideo Combine Multiple Folders PowerShell Script
Write-Host "QiVideo Combine Multiple Folders" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Function to start combine process
function Start-CombineProcess {
    param(
        [string]$FolderPath,
        [string]$WindowTitle
    )
    
    if (Test-Path $FolderPath) {
        Write-Host "Starting combine for: $FolderPath" -ForegroundColor Green
        Start-Process powershell -ArgumentList "-Command", "cd '$scriptDir'; python app.py combine-drive --drive-path '$FolderPath'" -WindowStyle Normal
        return $true
    } else {
        Write-Host "Path does not exist: $FolderPath" -ForegroundColor Red
        return $false
    }
}

# Get folder paths from user
$folders = @()

Write-Host "Enter folder paths to combine (press Enter on empty line to finish):" -ForegroundColor Yellow
$counter = 1

do {
    $folder = Read-Host "Folder $counter path"
    if ($folder -ne "") {
        $folders += $folder
        $counter++
    }
} while ($folder -ne "")

if ($folders.Count -eq 0) {
    Write-Host "No folders specified. Exiting." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Starting combine operations for $($folders.Count) folders..." -ForegroundColor Cyan

# Start combine processes
$started = 0
for ($i = 0; $i -lt $folders.Count; $i++) {
    $windowTitle = "Combine Folder $($i + 1)"
    if (Start-CombineProcess -FolderPath $folders[$i] -WindowTitle $windowTitle) {
        $started++
    }
}

Write-Host ""
Write-Host "Started $started combine operations!" -ForegroundColor Green
Write-Host "Check the individual windows for progress." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
