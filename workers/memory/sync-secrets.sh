#!/usr/bin/env bash
set -euo pipefail

if [ ! -f ".env" ]; then
  echo "❌ .env not found. Copy .env.example to .env and fill values."
  exit 1
fi

set -a
source .env
set +a

echo "➡️  Syncing secrets to Cloudflare Worker..."

# Check for required keys
missing=()
[ -z "${OPENAI_API_KEY:-}" ] && missing+=("OPENAI_API_KEY")
[ -z "${SUPABASE_URL:-}" ] && missing+=("SUPABASE_URL")
[ -z "${SUPABASE_ANON_KEY:-}" ] && missing+=("SUPABASE_ANON_KEY")

if [ ${#missing[@]} -gt 0 ]; then
  echo "❌ Missing required keys in .env: ${missing[*]}"
  exit 1
fi

echo "📝 Setting OPENAI_API_KEY..."
echo "$OPENAI_API_KEY" | wrangler secret put OPENAI_API_KEY

echo "📝 Setting SUPABASE_URL..."
echo "$SUPABASE_URL" | wrangler secret put SUPABASE_URL

echo "📝 Setting SUPABASE_ANON_KEY..."
echo "$SUPABASE_ANON_KEY" | wrangler secret put SUPABASE_ANON_KEY

echo "📝 Setting CHAT_MODEL..."
echo "${CHAT_MODEL:-gpt-4o-mini}" | wrangler secret put CHAT_MODEL

echo ""
echo "✅ All secrets synced successfully!"
echo ""
echo "Verify with: wrangler secret list"

