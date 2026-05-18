# qiserver Setup Runbook

This runbook serves as the operational manual for the `qiserver` node, capturing its current setup, configuration boundaries, and operational priorities.

## 1. Runtime Path Doctrine

*   `/srv/qios/repos`: For cloned Git repositories and active coding work.
*   `/srv/qios/stacks`: For Docker Compose runtime stacks. **Rule:** Do not create nested Git repos inside stacks.
*   `/srv/qios/data`: For persistent application data.

## 2. Current Installed Services & Local Ports

All primary application services currently bind to `localhost` (`127.0.0.1`) only to prevent unintended exposure:

*   **Paperless-ngx**: `127.0.0.1:8010` (mapped to 8000 internally)
*   **NocoDB**: `127.0.0.1:8088` (mapped to 8080 internally)
*   **Wiki.js**: `127.0.0.1:3002` (mapped to 3000 internally). Verified internal/admin Tailscale Serve route: `https://qiserver-1.cerberus-sirius.ts.net:9448`. Acts as the readable knowledge base.
*   **Private Server Launcher (gethomepage)**: `127.0.0.1:3001` (mapped to 3000 internally). **Note:** This is a local/tailnet utility only. Editing its `services.yaml` does not update the public `access.qially.com`.
*   **Portainer**: `127.0.0.1:9443` (mapped to 9443 internally)
*   **Open WebUI**: `127.0.0.1:3000` (mapped to 8080 internally)
*   **Neo4j**: `127.0.0.1:7474`, `127.0.0.1:7687`

## 3. Aider and Ollama Setup Status

*   **Ollama**: Installed natively on qiserver and locked down to listen exclusively on `127.0.0.1:11434`.
*   **Aider**: Installed under `/srv/qios/tools/aider`.
    *   **Rule:** Aider should be used inside cloned repos under `/srv/qios/repos`, never directly inside live runtime stack folders.
*   **Model Selection**:
    *   `qwen2.5-coder:3b` is the preferred interactive model for Aider.
    *   `qwen2.5-coder:7b` exists but is too heavy/slow for CPU-only interactive use.

## 4. Exposure & Security Concerns

*   **Tailscale**: Tailscale Serve correctly exposes Homepage, NocoDB, Open WebUI, and Wiki.js to the tailnet only.
*   **Wiki.js Public Route**: `https://wiki.qially.com` currently returns Bad Gateway and should be treated as degraded until the Cloudflare tunnel route is repaired.
*   **Admin/Control Services**: Must stay private/protected.
*   **Cockpit**: **WARNING** - Currently listening broadly on `*:9090`. This requires immediate restriction.
*   **Legacy Paperless**: A legacy compose file at `/home/qiadmin/docker-compose.yml` needs to be confirmed disabled/removed to prevent conflicts with the active stack at `/srv/qios/stacks/paperless`.

## 5. Paperless Ingestion Readiness Checklist

*   **Metadata First Rule**: Paperless metadata (tags, document types, starter correspondents) must be fully configured before bulk import.
*   **Ingestion Testing Rule**: Paperless should be tested with 10 diverse documents maximum (e.g., insurance, bills, legal) to tune the engine before any large or bulk ingestion occurs.

## 6. What Is Done

*   [x] Paperless stack is up and bound to localhost-only.
*   [x] NocoDB, Wiki.js, Homepage, Portainer, Open WebUI, and Neo4j stacks exist and are bound to localhost-only.
*   [x] Tailscale Serve is active and restricted to the tailnet.
*   [x] Ollama is installed and locked to `127.0.0.1:11434`.
*   [x] Aider is installed and configured.
*   [x] Repos/stacks/data path doctrine established.

## 7. What Remains Next

*   [ ] Restrict Cockpit (`*:9090`) to private/protected access only.
*   [ ] Confirm, disable, or remove the legacy Paperless stack (`/home/qiadmin/docker-compose.yml`).
*   [ ] Verify `n8n` installation and status.
*   [ ] Configure Paperless metadata (types, tags, correspondents, Unknown Review rule).
*   [ ] Execute the 10-document Paperless ingestion test and tune results.
*   [ ] Create a robust backup script for `/srv/qios/stacks` and `/srv/qios/data`.
*   [ ] Complete the server exposure audit and write the `qs` status command script.
