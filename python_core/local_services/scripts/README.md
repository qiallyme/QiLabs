# Workers Scripts

PowerShell scripts for managing and deploying QiOS Cloudflare Workers.

## Location

All scripts are in `workers/scripts/` and can be run from anywhere - they auto-detect the repository root.

## Available Scripts

### Deployment

- **`deploy-all.ps1`** - Deploy all 7 cloud workers (orchestrator, memory, embedder, ingestion, self_heal, metadata_naming, semantic_router) from `workers/cloud/`
- **`deploy-critical.ps1`** - Deploy only the 3 critical RAG workers (embedder, memory, orchestrator) from `workers/cloud/`

### Secrets Management

- **`check-secrets.ps1`** - Check which secrets are configured for each worker
- **`set-secrets-from-env.ps1`** - Set all worker secrets from `.env` file
- **`set-critical-secrets.ps1`** - Set secrets for critical workers only
- **`sync-secrets.ps1`** - Sync secrets (moved from memory worker)

### Testing & Verification

- **`verify-and-test.ps1`** - Complete verification and testing workflow (secrets → deploy → test)
- **`test-rag-system.ps1`** - Three-step RAG system test (embeddings → memory → orchestrator)
- **`test-with-curl.ps1`** - Test RAG endpoints using curl.exe
- **`check-auth.ps1`** - Check Cloudflare API token authentication

## Usage

All scripts can be run from any directory:

```powershell
# From repo root
.\workers\scripts\deploy-all.ps1

# From workers directory
.\scripts\deploy-all.ps1

# From scripts directory
.\deploy-all.ps1
```

## Documentation

See `workers/docs/` for detailed guides:
- `QUICK_START.md` - Quick setup guide
- `DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `TEST_RAG_SYSTEM.md` - RAG testing guide
- `FIX_AUTH.md` - Authentication troubleshooting
- `CHECK_RLS.md` - Row Level Security checks

