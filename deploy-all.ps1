param(
    [switch]$Deploy = $true
)

$ErrorActionPreference = "Continue" # Don't stop the whole thing if one build fails

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "🚀 QiLabs Mass Deployment & Build Protocol" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Set CI=true so Wrangler auto-creates new projects on blank slates without pausing for prompts
$env:CI = "true"

# Ensure Cloudflare Wrangler is authenticated
Write-Host "`n🔍 Checking Cloudflare authentication..."
$whoami = npx wrangler whoami 2>&1
if ($LASTEXITCODE -ne 0 -or $whoami -match "not authenticated" -or $whoami -match "not logged in") {
    Write-Host "⚠️ No active Cloudflare session detected. Initiating browser login..." -ForegroundColor Yellow
    npx wrangler login
} else {
    Write-Host "✅ Cloudflare session active." -ForegroundColor Green
}

# Ensure pnpm dependencies are up to date
Write-Host "`n📦 Running global pnpm install to map workspaces..."
pnpm install

$appsDir = "C:\QiLabs\apps"
$apps = Get-ChildItem -Path $appsDir -Directory | Where-Object { $_.Name -notmatch "_archive" }

foreach ($app in $apps) {
    if (Test-Path (Join-Path $app.FullName "package.json")) {
        # Intelligent naming derived from Qi rules
        $cleanName = $app.Name.ToLower() -replace "^q?i1?ne-?", "" -replace "^qi", ""
        if ($cleanName -eq "portal" -or $cleanName -eq "1ne-portal") { $cleanName = "one" }
        if ($cleanName -eq "cases") { $cleanName = "case" }

        Write-Host "`n📦 Initiating [$($app.Name)] -> Target: $cleanName.qially.com" -ForegroundColor Yellow
        
        Write-Host "🔨 Building..."
        # Using directory-based filter so we don't have to guess the package name
        $relativeDir = "apps/$($app.Name)"
        pnpm --filter "./$relativeDir" build
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Build failed for $($app.Name). Skipping deployment." -ForegroundColor Red
            continue
        }

        if ($Deploy) {
            $distPath = Join-Path $app.FullName "dist"
            if (Test-Path $distPath) {
                Write-Host "🚀 Pushing $cleanName to Cloudflare Pages edge..." -ForegroundColor Green
                npx wrangler pages deploy $distPath --project-name=$cleanName --branch=main
            } else {
                Write-Host "⚠️ Warning: No 'dist' folder found for $($app.Name). Might be a backend app or build failed to produce dist." -ForegroundColor DarkYellow
            }
            
            # Check for nested App API
            $apiDir = Join-Path $app.FullName "api"
            if (Test-Path (Join-Path $apiDir "wrangler.toml")) {
                Write-Host "⚡ Deploying App API Worker [$($app.Name)/api]..." -ForegroundColor Magenta
                Push-Location $apiDir
                npx wrangler deploy
                Pop-Location
            }
        }
    }
}

# Deploy Standalone Workers Architecture
Write-Host "`n=========================================================" -ForegroundColor Cyan
Write-Host "⚡ Deploying Global Workers & Orchestrators" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

$workersDir = "C:\QiLabs\workers"
if (Test-Path $workersDir) {
    $workers = Get-ChildItem -Path $workersDir -Directory
    foreach ($worker in $workers) {
        if (Test-Path (Join-Path $worker.FullName "wrangler.toml")) {
            Write-Host "⚡ Deploying Global Worker: [$($worker.Name)]..." -ForegroundColor Magenta
            Push-Location $worker.FullName
            npx wrangler deploy
            Pop-Location
        }
    }
}

Write-Host "`n✅ All UI Gateways and System Workers processed. System active." -ForegroundColor Cyan
