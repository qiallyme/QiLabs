Param(
  [string]$EnvPath = ".env"
)

if (!(Test-Path $EnvPath)) {
  Write-Host "❌ $EnvPath not found. Copy .env.example to .env and fill values." -ForegroundColor Red
  exit 1
}

$vars = Get-Content $EnvPath | Where-Object { $_ -and $_ -notmatch '^\s*#' }
$map = @{}

foreach ($line in $vars) {
  $kv = $line -split "=", 2
  if ($kv.Length -eq 2) {
    $map[$kv[0].Trim()] = $kv[1].Trim()
  }
}

Write-Host "➡️  Syncing secrets to Cloudflare Worker..." -ForegroundColor Cyan

# Check for required keys
$missing = @()
if (!$map.ContainsKey("OPENAI_API_KEY") -or [string]::IsNullOrWhiteSpace($map["OPENAI_API_KEY"])) {
  $missing += "OPENAI_API_KEY"
}
if (!$map.ContainsKey("SUPABASE_URL") -or [string]::IsNullOrWhiteSpace($map["SUPABASE_URL"])) {
  $missing += "SUPABASE_URL"
}
if (!$map.ContainsKey("SUPABASE_ANON_KEY") -or [string]::IsNullOrWhiteSpace($map["SUPABASE_ANON_KEY"])) {
  $missing += "SUPABASE_ANON_KEY"
}

if ($missing.Count -gt 0) {
  Write-Host "❌ Missing required keys in .env: $($missing -join ', ')" -ForegroundColor Red
  exit 1
}

Write-Host "📝 Setting OPENAI_API_KEY..." -ForegroundColor Yellow
$map["OPENAI_API_KEY"] | wrangler secret put OPENAI_API_KEY

Write-Host "📝 Setting SUPABASE_URL..." -ForegroundColor Yellow
$map["SUPABASE_URL"] | wrangler secret put SUPABASE_URL

Write-Host "📝 Setting SUPABASE_ANON_KEY..." -ForegroundColor Yellow
$map["SUPABASE_ANON_KEY"] | wrangler secret put SUPABASE_ANON_KEY

Write-Host "📝 Setting CHAT_MODEL..." -ForegroundColor Yellow
if ($map.ContainsKey("CHAT_MODEL") -and ![string]::IsNullOrWhiteSpace($map["CHAT_MODEL"])) {
  $map["CHAT_MODEL"] | wrangler secret put CHAT_MODEL
} else {
  "gpt-4o-mini" | wrangler secret put CHAT_MODEL
}

Write-Host ""
Write-Host "✅ All secrets synced successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Verify with: wrangler secret list" -ForegroundColor Cyan

