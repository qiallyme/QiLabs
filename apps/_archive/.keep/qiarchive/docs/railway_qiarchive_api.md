# Railway Deployment: QiArchive API

This guide details how to stand up the QiArchive Cloud API and its associated database on Railway.

## 1. Create Services

### Service A: `qiarchive-postgres`

1. Go to your Railway Project.
2. Click **+ New** -> **Database** -> **Add PostgreSQL**.
3. Rename the service to `qiarchive-postgres` for clarity.

### Service B: `qiarchive-api`

1. Click **+ New** -> **GitHub Repo**.
2. Select your `QiArchive` repository.
3. Once created, rename the service to `qiarchive-api`.

## 2. Configure `qiarchive-api`

### General Settings

- **Root Directory**: `apps/api`
- **Port**: `8000`
- **Public Networking**: Enabled (Railway will provide a `*.up.railway.app` URL).

### Environment Variables

Set the following variables in the **Variables** tab:

- `DATABASE_URL`: `${{qiarchive-postgres.DATABASE_URL}}` (This automatically wires the internal Postgres URL).
- `APP_ENV`: `production`
- `LOG_LEVEL`: `INFO`
- `PAPERLESS_URL`: `https://paperless-ngx-production-feda.up.railway.app`

## 3. Verify Deployment

Once the deployment finishes, visit `https://your-api-url.up.railway.app/` (the health check endpoint). It should return:

```json
{"status": "healthy", "env": "production"}
```

You can view the interactive documentation at `https://your-api-url.up.railway.app/docs`.

## 4. Local Agent Integration

Update the local agent's `.env` to point to this new API:
`QIARCHIVE_CLOUD_API_URL=https://your-api-url.up.railway.app`
