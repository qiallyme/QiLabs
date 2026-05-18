# QiServer Service Truth Audit

Audit date: 2026-05-08

Scope: live qiserver truth verification for QiAccess Start Phase 2. This pass verified reachable private services and public edge behavior without changing deployment. Direct Docker and compose inspection on qiserver was attempted but blocked by SSH authentication.

## Command Summary

Live checks completed:

- `ssh -o BatchMode=yes -o ConnectTimeout=10 qiadmin@100.121.111.106 "hostname"`
  - Result: `Permission denied (publickey,password).`
- `Test-NetConnection 100.121.111.106 -Port 22`
  - Result: `TcpTestSucceeded : True`
- `curl.exe -I https://access.qially.com`
  - Result: `302 Found` to Cloudflare Access login
- Private port probes on `100.121.111.106`
  - Reachable: `22`, `9090`, `9443`, `9446`, `11434`, `3001`, `3002`
  - Not reachable: `8000`, `3000`, `7474`
- Page fingerprints
  - `https://100.121.111.106:9443` -> `Portainer`
  - `https://100.121.111.106:9090` -> Cockpit login page, hostname `qiserver`
  - `https://qiserver-1.cerberus-sirius.ts.net:9446` -> `Open WebUI`
  - `http://100.121.111.106:3002` -> `Welcome | Wiki.js`
  - `http://100.121.111.106:3001` -> `QiAccess` Next.js Homepage surface
- Ollama API
  - `http://100.121.111.106:11434/api/tags` returned `embeddinggemma:latest` and `llama3.2:latest`

Blocked checks:

- `docker ps --format ...`
- `find /srv ... compose.yml`
- `find /srv/qios ...`
- `docker compose ps` for Paperless
- Paperless webserver logs

Reason blocked: qiserver is reachable, but `qiadmin@100.121.111.106` rejected available SSH auth.

## Service Truth Table

| Service Name | Container Name | Image | Port Mapping | Status | Private URL | Public / Restricted URL | Compose Path | Data / Volume Paths | Exposure Class | Verification Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| qiserver | Not verified | Not verified | `22` reachable; host also serves `9090`, `9443`, `9446`, `11434`, `3001`, `3002` | Online | `100.121.111.106` | None verified | Not verified | Not verified | Private Only | Verified | SSH is reachable over Tailscale, but auth failed. Cockpit identified hostname `qiserver`. |
| Paperless | Not verified | Not verified | Expected `8000`; TCP probe failed | Offline | `https://100.121.111.106:8000` | None verified | Not verified | Not verified | Private Only | Broken | Expected endpoint did not respond. Compose folder, consume path, and media/data paths could not be inspected without SSH. |
| Wiki.js | Not verified | Not verified | `3002` reachable and returned HTTP `200` | Online | `http://100.121.111.106:3002` | `wiki.qially.com` referenced in page metadata, but DNS did not resolve during audit | Not verified | Not verified | Private Only | Verified | Live page title was `Welcome | Wiki.js`. Public hostname remains unverified. |
| Open WebUI | Not verified | Not verified | `9446` reachable and returned UI | Online | `https://qiserver-1.cerberus-sirius.ts.net:9446` | None verified | Not verified | Not verified | Private Only | Verified | Live page title was `Open WebUI`. Older direct `3000` assumption is not valid in the current server state. |
| Ollama | Not verified | Not verified | `11434` reachable; API responded | Online | `http://100.121.111.106:11434` | None | Not verified | Model store path not verified | Private Only | Verified | API exposed `embeddinggemma:latest` and `llama3.2:latest`. Open WebUI-to-Ollama connectivity was not directly confirmed from authenticated app state. |
| AnythingLLM | Not verified | Not verified | No verified runtime port found | Unknown | None verified | None | Not verified | Not verified | Private Only | Broken | The previous `3001` assumption is incorrect: `3001` is serving the legacy QiAccess Homepage surface instead. |
| Portainer | Not verified | Not verified | `9443` reachable and returned HTTP `200` | Online | `https://100.121.111.106:9443` | None | Not verified | Not verified | Private Only | Verified | Live page title was `Portainer`. |
| Cockpit | Not verified | Not verified | `9090` reachable and returned HTTP `200` | Online | `https://100.121.111.106:9090` | None | Not verified | Not verified | Private Only | Verified | Live page identified hostname `qiserver`. |
| Neo4j | Not verified | Not verified | Expected `7474`; TCP probe failed | Offline | `http://100.121.111.106:7474` | None | Not verified | Not verified | Private Only | Broken | No responding web console was found on the expected port. |
| Homepage | Not verified | Not verified live; legacy repo compose uses `ghcr.io/gethomepage/homepage:latest` | `3001` reachable and returned HTTP `200` | Online | `http://100.121.111.106:3001` | None verified | Legacy deploy path inferred as `/srv/qios/stacks/_qiaccess_start`; not SSH-verified | Legacy repo compose maps `./config`, `./config/images`, `./public`, and `/var/run/docker.sock`; actual qiserver host paths not verified | Private Only | Verified | Live page title was `QiAccess` and the page payload matched the legacy Homepage config from `local/config`. |
| QiAccess Start Deployment | Not verified | Not verified | Public edge reachable; protected origin not directly inspectable | Online | Likely private origin on `3001`, but not directly proven through Cloudflare Access | `https://access.qially.com` | Legacy qiserver stack path inferred as `/srv/qios/stacks/_qiaccess_start`; not SSH-verified | Not verified | Public Restricted | Pending | `access.qially.com` currently redirects to Cloudflare Access login. The strongest available evidence points to the protected origin still being the legacy Homepage-based QiAccess service on `3001`, not the current Vite SPA. |

## Deployment Truth Notes

- `access.qially.com` is currently protected by Cloudflare Access.
- The current root Vite SPA in `src/` is not proven to be what the public domain is serving.
- The live private service on `3001` is a Next.js Homepage surface titled `QiAccess`.
- That `3001` service strongly matches the legacy `local/docker-compose.yml` stack:
  - service name: `homepage`
  - image: `ghcr.io/gethomepage/homepage:latest`
  - port mapping: `3001:3000`
- `run_copy.bat` still points legacy config syncs at `/srv/qios/stacks/_qiaccess_start/config`, which reinforces the legacy deployment path clue but does not prove the current running compose state.

## Truth-Based Conclusions

1. Open WebUI is live, but not on the previously assumed direct `3000` URL.
2. Ollama is live and serving models.
3. Wiki.js is live on private port `3002`.
4. Portainer and Cockpit are live and reachable on their private admin ports.
5. Paperless is not reachable on the expected `8000` endpoint.
6. Neo4j is not reachable on the expected `7474` endpoint.
7. AnythingLLM is not verified, and the old `3001` mapping is wrong.
8. The public `access.qially.com` edge is live and restricted, but the protected origin still appears to be the legacy Homepage-based QiAccess stack rather than the new Vite SPA.

## Next Verification Needed

1. Gain working SSH access to qiserver as `qiadmin` so Docker/container truth can be collected.
2. Run `docker ps`, compose discovery, and `/srv/qios` path checks on qiserver.
3. Inspect the Paperless stack folder, compose status, consume path, media/data mounts, and logs.
4. Identify the actual AnythingLLM container and runtime URL, if it still exists.
5. Confirm what Cloudflare Access is routing `access.qially.com` to, then plan the cutover from the legacy Homepage stack to the Vite SPA.
