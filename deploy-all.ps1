param(
    [switch]$Deploy = $true
)

$ErrorActionPreference = "Stop"

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
    $pkgJson = Join-Path $app.FullName "package.json"
    
    if (Test-Path $pkgJson) {
        # Intelligent naming derived from Qi rules
        # Strips prefix (e.g. 'qi1ne-portal' -> 'one', 'qicare' -> 'care')
        $cleanName = $app.Name.ToLower() -replace "^q?i1?ne-?", "" -replace "^qi", ""
        if ($cleanName -eq "portal") { $cleanName = "one" }
        if ($cleanName -eq "cases") { $cleanName = "case" }

        Write-Host "`n📦 Initiating [$($app.Name)] -> Target: $cleanName.qially.com" -ForegroundColor Yellow
        
        Write-Host "🔨 Building..."
        try {
            $process = Start-Process -FilePath "pnpm" -ArgumentList "--filter", $($app.Name), "build" -NoNewWindow -Wait -PassThru
            if ($process.ExitCode -ne 0) {
                Write-Host "❌ Build failed for $($app.Name). Skipping deployment." -ForegroundColor Red
                continue
            }
        } catch {
            Write-Host "❌ Failed to run build command." -ForegroundColor Red
            continue
        }

        if ($Deploy) {
            $distPath = Join-Path $app.FullName "dist"
            if (Test-Path $distPath) {
                Write-Host "🚀 Pushing $cleanName to Cloudflare Pages edge..." -ForegroundColor Green
                # Deploy to Pages (CI=true makes it auto-create smoothly)
                npx wrangler pages deploy $distPath --project-name=$cleanName --branch=main
            } else {
                Write-Host "⚠️ Warning: No 'dist' folder generated for $($app.Name). Might be a backend app." -ForegroundColor DarkYellow
            }
            
            # Check if this app has a nested API Worker
            $apiWrangler = Join-Path $app.FullName "api\wrangler.toml"
            if (Test-Path $apiWrangler) {
                Write-Host "⚡ Deploying App API Worker [$($app.Name)/api]..." -ForegroundColor Magenta
                Push-Location (Join-Path $app.FullName "api")
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
        $wranglerPath = Join-Path $worker.FullName "wrangler.toml"
        if (Test-Path $wranglerPath) {
            Write-Host "⚡ Deploying Global Worker: [$($worker.Name)]..." -ForegroundColor Magenta
            Push-Location $worker.FullName
            npx wrangler deploy
            Pop-Location
        }
    }
}

Write-Host "`n✅ All UI Gateways and System Workers processed. System active." -ForegroundColor Cyan
