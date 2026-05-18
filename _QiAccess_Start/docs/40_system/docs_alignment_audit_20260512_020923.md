# QiAccess Docs Alignment Audit

Generated: `2026-05-12T02:09:24`
Root: `C:\QiLabs\_QiAccess_Start\docs`

## Summary

- Files scanned: **206**
- Likely stale files: **26**
- Mixed review files: **19**
- Current/aligned files: **13**
- Total findings: **1567**

## Highest Priority Review Files

| File | Status | Legacy Hits | Current Hits |
|---|---:|---:|---:|
| `00_blueprint/adr/ADR-0004_single_account_modular_mode.md` | likely_stale | 18 | 0 |
| `00_blueprint/04_data/03_structure/30_namespaces/namespace_registry.md` | likely_stale | 7 | 0 |
| `00_blueprint/registry/domain_registry.yaml` | likely_stale | 5 | 0 |
| `00_blueprint/04_data/10_schema/objects.md` | likely_stale | 5 | 0 |
| `00_blueprint/04_data/03_structure/10_bands/bands.md` | likely_stale | 4 | 0 |
| `00_blueprint/08_appendices/20_legacy/legacy_csv_migration_plan.md` | likely_stale | 3 | 0 |
| `00_blueprint/07_operations/10_clients/clients.md` | likely_stale | 3 | 0 |
| `00_blueprint/06_applications/50_interfaces/interfaces.md` | likely_stale | 3 | 0 |
| `00_blueprint/04_data/10_schema/schema.md` | likely_stale | 3 | 0 |
| `00_blueprint/04_data/30_storage/storage.md` | likely_stale | 3 | 0 |
| `00_blueprint/registry/band_registry.yaml` | likely_stale | 2 | 0 |
| `00_blueprint/registry/sensitivity_classification.yaml` | likely_stale | 2 | 0 |
| `00_blueprint/07_operations/20_cases/cases.md` | likely_stale | 2 | 0 |
| `00_blueprint/07_operations/40_products/products.md` | likely_stale | 2 | 0 |
| `00_blueprint/07_operations/50_templates/templates.md` | likely_stale | 2 | 0 |
| `00_blueprint/04_data/03_structure/20_domains/domains.md` | likely_stale | 2 | 0 |
| `00_blueprint/standards/naming_rules.yaml` | likely_stale | 1 | 0 |
| `00_blueprint/templates/README.md` | likely_stale | 1 | 0 |
| `00_blueprint/05_compute/10_apis/apis.md` | likely_stale | 1 | 0 |
| `00_blueprint/05_compute/50_integrations/integrations.md` | likely_stale | 1 | 0 |
| `00_blueprint/04_data/03_structure/index.md` | likely_stale | 1 | 0 |
| `00_blueprint/04_data/20_metadata/metadata.md` | likely_stale | 1 | 0 |
| `00_blueprint/04_data/40_domain_addenda/qievidence.md` | likely_stale | 1 | 0 |
| `00_blueprint/04_data/03_structure/40_objects/object_model.md` | likely_stale | 1 | 0 |
| `00_blueprint/04_data/03_structure/40_objects/placement_rules.md` | likely_stale | 1 | 0 |
| `00_blueprint/02_architecture/30_runtime/device_model.md` | likely_stale | 1 | 0 |
| `00_blueprint/02_architecture/10_identity/identity.md` | mixed_review | 11 | 1 |
| `00_blueprint/06_applications/30_admin/admin.md` | mixed_review | 9 | 3 |
| `00_blueprint/08_appendices/20_legacy/qiaccess_start_legacy_quarantine.md` | mixed_review | 8 | 7 |
| `00_blueprint/02_architecture/30_runtime/service_boundaries.md` | mixed_review | 5 | 2 |
| `00_blueprint/06_applications/20_portal/portal.md` | mixed_review | 4 | 3 |
| `00_blueprint/01_governance/20_policy/policies.md` | mixed_review | 4 | 3 |
| `00_blueprint/08_appendices/10_reference/glossary.md` | mixed_review | 4 | 4 |
| `00_blueprint/06_applications/10_web/web.md` | mixed_review | 3 | 1 |
| `00_blueprint/02_architecture/20_system/component_map.md` | mixed_review | 3 | 1 |
| `00_blueprint/README.md` | mixed_review | 3 | 5 |
| `00_blueprint/06_applications/index.md` | mixed_review | 2 | 2 |
| `00_blueprint/05_compute/40_runtime/tech_stack.md` | mixed_review | 1 | 1 |
| `00_blueprint/01_governance/20_policy/agent_rules.md` | mixed_review | 1 | 1 |
| `00_blueprint/08_appendices/10_reference/changelog.md` | mixed_review | 1 | 3 |

## Findings

### `00_audit/QiAccess_Start_Current_State_Audit.md:1`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> # QiAccess Start Current State Audit

### `00_audit/QiAccess_Start_Current_State_Audit.md:5`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> Audit scope: current QiAccess Start app, adjacent legacy surfaces in this repo, deployment clues, and qiserver verification attempts.

### `00_audit/QiAccess_Start_Current_State_Audit.md:5`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> Audit scope: current QiAccess Start app, adjacent legacy surfaces in this repo, deployment clues, and qiserver verification attempts.

### `00_audit/QiAccess_Start_Current_State_Audit.md:120`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - qiserver: `http://qiserver`

### `00_audit/QiAccess_Start_Current_State_Audit.md:125`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOllama\b`

> - Ollama

### `00_audit/QiAccess_Start_Current_State_Audit.md:126`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOpen WebUI\b`

> - Open WebUI

### `00_audit/QiAccess_Start_Current_State_Audit.md:128`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPortainer\b`

> - Portainer

### `00_audit/QiAccess_Start_Current_State_Audit.md:140`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> - Paperless

### `00_audit/QiAccess_Start_Current_State_Audit.md:141`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bn8n\b`

> - Qi Queue / n8n-like intake plane

### `00_audit/QiAccess_Start_Current_State_Audit.md:145`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bWiki\.js\b`

> - Wiki.js

### `00_audit/QiAccess_Start_Current_State_Audit.md:147`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> - Paperless as first-class ingestion target

### `00_audit/QiAccess_Start_Current_State_Audit.md:158`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - Legacy qiserver sync path: `run_copy.bat` copies `local/config/*` to `/srv/qios/stacks/_qiaccess_start/config`

### `00_audit/QiAccess_Start_Current_State_Audit.md:158`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios`

> - Legacy qiserver sync path: `run_copy.bat` copies `local/config/*` to `/srv/qios/stacks/_qiaccess_start/config`

### `00_audit/QiAccess_Start_Current_State_Audit.md:158`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios/stacks`

> - Legacy qiserver sync path: `run_copy.bat` copies `local/config/*` to `/srv/qios/stacks/_qiaccess_start/config`

### `00_audit/QiAccess_Start_Current_State_Audit.md:165`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - Old Homepage stack appears intended to run on qiserver from `/srv/qios/stacks/_qiaccess_start`.

### `00_audit/QiAccess_Start_Current_State_Audit.md:165`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios`

> - Old Homepage stack appears intended to run on qiserver from `/srv/qios/stacks/_qiaccess_start`.

### `00_audit/QiAccess_Start_Current_State_Audit.md:165`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios/stacks`

> - Old Homepage stack appears intended to run on qiserver from `/srv/qios/stacks/_qiaccess_start`.

### `00_audit/QiAccess_Start_Current_State_Audit.md:170`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - Exact restart command used on qiserver

### `00_audit/QiAccess_Start_Current_State_Audit.md:250`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bfront door\b`

> - QiAccess is treated as a front door, not a system of record.

### `00_audit/QiAccess_Start_Current_State_Audit.md:256`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - qiserver, Open WebUI, Ollama, Portainer, Cockpit, and Google Drive are already part of the current mental model.

### `00_audit/QiAccess_Start_Current_State_Audit.md:256`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOllama\b`

> - qiserver, Open WebUI, Ollama, Portainer, Cockpit, and Google Drive are already part of the current mental model.

### `00_audit/QiAccess_Start_Current_State_Audit.md:256`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOpen WebUI\b`

> - qiserver, Open WebUI, Ollama, Portainer, Cockpit, and Google Drive are already part of the current mental model.

### `00_audit/QiAccess_Start_Current_State_Audit.md:256`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPortainer\b`

> - qiserver, Open WebUI, Ollama, Portainer, Cockpit, and Google Drive are already part of the current mental model.

### `00_audit/QiAccess_Start_Current_State_Audit.md:287`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> - No explicit Paperless intake flow

### `00_audit/QiAccess_Start_Current_State_Audit.md:335`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - `run_copy.bat` is a real sync script targeting qiserver

### `00_audit/QiAccess_Start_Current_State_Audit.md:341`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - qiserver Homepage stack path implied by `run_copy.bat`

### `00_audit/QiAccess_Start_Current_State_Audit.md:389`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> - Paperless consume target

### `00_audit/QiAccess_Start_Current_State_Audit.md:394`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - explicit qiserver, Paperless, Open WebUI, Portainer, Cockpit, storage, diagnostics surfaces

### `00_audit/QiAccess_Start_Current_State_Audit.md:394`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> - explicit qiserver, Paperless, Open WebUI, Portainer, Cockpit, storage, diagnostics surfaces

### `00_audit/QiAccess_Start_Current_State_Audit.md:394`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOpen WebUI\b`

> - explicit qiserver, Paperless, Open WebUI, Portainer, Cockpit, storage, diagnostics surfaces

### `00_audit/QiAccess_Start_Current_State_Audit.md:394`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPortainer\b`

> - explicit qiserver, Paperless, Open WebUI, Portainer, Cockpit, storage, diagnostics surfaces

### `00_audit/QiAccess_Start_Current_State_Audit.md:397`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bWiki\.js\b`

> - explicit Wiki.js linking, not generic note textarea only

### `00_audit/QiAccess_Start_Current_State_Audit.md:407`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> - first real pipeline should be Capture -> Paperless consume / QiNexus inbox / note timeline

### `00_audit/QiAccess_Start_Current_State_Audit.md:414`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - It appears to be tied to a real qiserver stack path.

### `00_audit/QiAccess_Start_Current_State_Audit.md:417`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios`

> - It targets `/srv/qios/stacks/_qiaccess_start/config`, which may still matter for live operations.

### `00_audit/QiAccess_Start_Current_State_Audit.md:417`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios/stacks`

> - It targets `/srv/qios/stacks/_qiaccess_start/config`, which may still matter for live operations.

### `00_audit/QiAccess_Start_Current_State_Audit.md:425`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> 5. Any assumptions about qiserver live state

### `00_audit/QiAccess_Start_Current_State_Audit.md:435`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> 6. Add a static `Capture` surface focused on Paperless consume, QiNexus inbox, and timeline-note entry points.

### `00_audit/QiAccess_Start_Current_State_Audit.md:436`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> 7. Re-attempt qiserver live verification with working SSH credentials so Paperless, Open WebUI, Ollama, and deployment paths can be confirmed before deeper integration.

### `00_audit/QiAccess_Start_Current_State_Audit.md:436`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> 7. Re-attempt qiserver live verification with working SSH credentials so Paperless, Open WebUI, Ollama, and deployment paths can be confirmed before deeper integration.

### `00_audit/QiAccess_Start_Current_State_Audit.md:436`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOllama\b`

> 7. Re-attempt qiserver live verification with working SSH credentials so Paperless, Open WebUI, Ollama, and deployment paths can be confirmed before deeper integration.

### `00_audit/QiAccess_Start_Current_State_Audit.md:436`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOpen WebUI\b`

> 7. Re-attempt qiserver live verification with working SSH credentials so Paperless, Open WebUI, Ollama, and deployment paths can be confirmed before deeper integration.

### `00_audit/QiAccess_Start_Current_State_Audit.md:455`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - Old qiserver homepage stack still exists in `local/` and appears to deploy config to `/srv/qios/stacks/_qiaccess_start`.

### `00_audit/QiAccess_Start_Current_State_Audit.md:455`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios`

> - Old qiserver homepage stack still exists in `local/` and appears to deploy config to `/srv/qios/stacks/_qiaccess_start`.

### `00_audit/QiAccess_Start_Current_State_Audit.md:455`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios/stacks`

> - Old qiserver homepage stack still exists in `local/` and appears to deploy config to `/srv/qios/stacks/_qiaccess_start`.

### `00_audit/QiAccess_Start_Current_State_Audit.md:467`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - Legacy Homepage restart on qiserver would be from `/srv/qios/stacks/_qiaccess_start`

### `00_audit/QiAccess_Start_Current_State_Audit.md:467`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios`

> - Legacy Homepage restart on qiserver would be from `/srv/qios/stacks/_qiaccess_start`

### `00_audit/QiAccess_Start_Current_State_Audit.md:467`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios/stacks`

> - Legacy Homepage restart on qiserver would be from `/srv/qios/stacks/_qiaccess_start`

### `00_audit/QiAccess_Start_Current_State_Audit.md:470`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> ## qiserver audit status

### `00_audit/QiAccess_Start_Current_State_Audit.md:480`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - compose stack locations on qiserver

### `00_audit/QiAccess_Start_Current_State_Audit.md:481`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios`

> - service folder tree under `/srv/qios`

### `00_audit/QiAccess_Start_Current_State_Audit.md:482`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> - Paperless container status/logs

### `00_audit/QiAccess_Start_Current_State_Audit.md:483`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOllama\b`

> - Open WebUI/Ollama live state

### `00_audit/QiAccess_Start_Current_State_Audit.md:483`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOpen WebUI\b`

> - Open WebUI/Ollama live state

### `00_audit/QiAccess_Start_Current_State_Audit.md:484`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOllama\b`

> - installed Ollama models

### `00_audit/QiAccess_Start_Current_State_Audit.md:485`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOllama\b`

> - whether Open WebUI currently sees Ollama

### `00_audit/QiAccess_Start_Current_State_Audit.md:485`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOpen WebUI\b`

> - whether Open WebUI currently sees Ollama

### `00_audit/QiAccess_Start_Current_State_Audit.md:498`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bWiki\.js\b`

> - `/knowledge` -> keep, but refocus on Wiki.js and knowledge links

### `00_audit/QiAccess_Start_Current_State_Audit.md:504`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> 6. Do not touch qiserver deployment, DNS, or worker routing until live server access is verified.

### `00_audit/QiAccess_Start_Current_State_Audit.md:514`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> - make Paperless/QiNexus ingestion the first explicit operational workflow

### `00_audit/QiServer_Service_Truth_Audit.md:1`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> # QiServer Service Truth Audit

### `00_audit/QiServer_Service_Truth_Audit.md:5`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> Scope: live qiserver truth verification for QiAccess Start Phase 2. This pass verified reachable private services and public edge behavior without changing deployment. Direct Docker and compose inspection on qiserver was attempted but blocked by SSH authentication.

### `00_audit/QiServer_Service_Truth_Audit.md:5`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> Scope: live qiserver truth verification for QiAccess Start Phase 2. This pass verified reachable private services and public edge behavior without changing deployment. Direct Docker and compose inspection on qiserver was attempted but blocked by SSH authentication.

### `00_audit/QiServer_Service_Truth_Audit.md:21`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPortainer\b`

> - `https://100.121.111.106:9443` -> `Portainer`

### `00_audit/QiServer_Service_Truth_Audit.md:22`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - `https://100.121.111.106:9090` -> Cockpit login page, hostname `qiserver`

### `00_audit/QiServer_Service_Truth_Audit.md:23`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - `https://qiserver-1.cerberus-sirius.ts.net:9446` -> `Open WebUI`

### `00_audit/QiServer_Service_Truth_Audit.md:23`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOpen WebUI\b`

> - `https://qiserver-1.cerberus-sirius.ts.net:9446` -> `Open WebUI`

### `00_audit/QiServer_Service_Truth_Audit.md:24`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bWiki\.js\b`

> - `http://100.121.111.106:3002` -> `Welcome | Wiki.js`

### `00_audit/QiServer_Service_Truth_Audit.md:26`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOllama\b`

> - Ollama API

### `00_audit/QiServer_Service_Truth_Audit.md:33`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios`

> - `find /srv/qios ...`

### `00_audit/QiServer_Service_Truth_Audit.md:34`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> - `docker compose ps` for Paperless

### `00_audit/QiServer_Service_Truth_Audit.md:35`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> - Paperless webserver logs

### `00_audit/QiServer_Service_Truth_Audit.md:37`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> Reason blocked: qiserver is reachable, but `qiadmin@100.121.111.106` rejected available SSH auth.

### `00_audit/QiServer_Service_Truth_Audit.md:43`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> | qiserver | Not verified | Not verified | `22` reachable; host also serves `9090`, `9443`, `9446`, `11434`, `3001`, `3002` | Online | `100.121.111.106` | None verified | Not verified | Not verified | Private Only | Verified | SSH is reachable over Tailscale, but auth failed. Cockpit identified host

### `00_audit/QiServer_Service_Truth_Audit.md:43`

- Severity: `current_marker`
- Category: `access_boundary`
- Match: `\bPrivate Only\b`

> | qiserver | Not verified | Not verified | `22` reachable; host also serves `9090`, `9443`, `9446`, `11434`, `3001`, `3002` | Online | `100.121.111.106` | None verified | Not verified | Not verified | Private Only | Verified | SSH is reachable over Tailscale, but auth failed. Cockpit identified host

### `00_audit/QiServer_Service_Truth_Audit.md:44`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> | Paperless | Not verified | Not verified | Expected `8000`; TCP probe failed | Offline | `https://100.121.111.106:8000` | None verified | Not verified | Not verified | Private Only | Broken | Expected endpoint did not respond. Compose folder, consume path, and media/data paths could not be inspecte

### `00_audit/QiServer_Service_Truth_Audit.md:44`

- Severity: `current_marker`
- Category: `access_boundary`
- Match: `\bPrivate Only\b`

> | Paperless | Not verified | Not verified | Expected `8000`; TCP probe failed | Offline | `https://100.121.111.106:8000` | None verified | Not verified | Not verified | Private Only | Broken | Expected endpoint did not respond. Compose folder, consume path, and media/data paths could not be inspecte

### `00_audit/QiServer_Service_Truth_Audit.md:45`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bWiki\.js\b`

> | Wiki.js | Not verified | Not verified | `3002` reachable and returned HTTP `200` | Online | `http://100.121.111.106:3002` | `wiki.qially.com` referenced in page metadata, but DNS did not resolve during audit | Not verified | Not verified | Private Only | Verified | Live page title was `Welcome | W

### `00_audit/QiServer_Service_Truth_Audit.md:45`

- Severity: `current_marker`
- Category: `access_boundary`
- Match: `\bPrivate Only\b`

> | Wiki.js | Not verified | Not verified | `3002` reachable and returned HTTP `200` | Online | `http://100.121.111.106:3002` | `wiki.qially.com` referenced in page metadata, but DNS did not resolve during audit | Not verified | Not verified | Private Only | Verified | Live page title was `Welcome | W

### `00_audit/QiServer_Service_Truth_Audit.md:46`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> | Open WebUI | Not verified | Not verified | `9446` reachable and returned UI | Online | `https://qiserver-1.cerberus-sirius.ts.net:9446` | None verified | Not verified | Not verified | Private Only | Verified | Live page title was `Open WebUI`. Older direct `3000` assumption is not valid in the cur

### `00_audit/QiServer_Service_Truth_Audit.md:46`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOpen WebUI\b`

> | Open WebUI | Not verified | Not verified | `9446` reachable and returned UI | Online | `https://qiserver-1.cerberus-sirius.ts.net:9446` | None verified | Not verified | Not verified | Private Only | Verified | Live page title was `Open WebUI`. Older direct `3000` assumption is not valid in the cur

### `00_audit/QiServer_Service_Truth_Audit.md:46`

- Severity: `current_marker`
- Category: `access_boundary`
- Match: `\bPrivate Only\b`

> | Open WebUI | Not verified | Not verified | `9446` reachable and returned UI | Online | `https://qiserver-1.cerberus-sirius.ts.net:9446` | None verified | Not verified | Not verified | Private Only | Verified | Live page title was `Open WebUI`. Older direct `3000` assumption is not valid in the cur

### `00_audit/QiServer_Service_Truth_Audit.md:47`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOllama\b`

> | Ollama | Not verified | Not verified | `11434` reachable; API responded | Online | `http://100.121.111.106:11434` | None | Not verified | Model store path not verified | Private Only | Verified | API exposed `embeddinggemma:latest` and `llama3.2:latest`. Open WebUI-to-Ollama connectivity was not d

### `00_audit/QiServer_Service_Truth_Audit.md:47`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOpen WebUI\b`

> | Ollama | Not verified | Not verified | `11434` reachable; API responded | Online | `http://100.121.111.106:11434` | None | Not verified | Model store path not verified | Private Only | Verified | API exposed `embeddinggemma:latest` and `llama3.2:latest`. Open WebUI-to-Ollama connectivity was not d

### `00_audit/QiServer_Service_Truth_Audit.md:47`

- Severity: `current_marker`
- Category: `access_boundary`
- Match: `\bPrivate Only\b`

> | Ollama | Not verified | Not verified | `11434` reachable; API responded | Online | `http://100.121.111.106:11434` | None | Not verified | Model store path not verified | Private Only | Verified | API exposed `embeddinggemma:latest` and `llama3.2:latest`. Open WebUI-to-Ollama connectivity was not d

### `00_audit/QiServer_Service_Truth_Audit.md:48`

- Severity: `current_marker`
- Category: `access_boundary`
- Match: `\bPrivate Only\b`

> | AnythingLLM | Not verified | Not verified | No verified runtime port found | Unknown | None verified | None | Not verified | Not verified | Private Only | Broken | The previous `3001` assumption is incorrect: `3001` is serving the legacy QiAccess Homepage surface instead. |

### `00_audit/QiServer_Service_Truth_Audit.md:49`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPortainer\b`

> | Portainer | Not verified | Not verified | `9443` reachable and returned HTTP `200` | Online | `https://100.121.111.106:9443` | None | Not verified | Not verified | Private Only | Verified | Live page title was `Portainer`. |

### `00_audit/QiServer_Service_Truth_Audit.md:49`

- Severity: `current_marker`
- Category: `access_boundary`
- Match: `\bPrivate Only\b`

> | Portainer | Not verified | Not verified | `9443` reachable and returned HTTP `200` | Online | `https://100.121.111.106:9443` | None | Not verified | Not verified | Private Only | Verified | Live page title was `Portainer`. |

### `00_audit/QiServer_Service_Truth_Audit.md:50`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> | Cockpit | Not verified | Not verified | `9090` reachable and returned HTTP `200` | Online | `https://100.121.111.106:9090` | None | Not verified | Not verified | Private Only | Verified | Live page identified hostname `qiserver`. |

### `00_audit/QiServer_Service_Truth_Audit.md:50`

- Severity: `current_marker`
- Category: `access_boundary`
- Match: `\bPrivate Only\b`

> | Cockpit | Not verified | Not verified | `9090` reachable and returned HTTP `200` | Online | `https://100.121.111.106:9090` | None | Not verified | Not verified | Private Only | Verified | Live page identified hostname `qiserver`. |

### `00_audit/QiServer_Service_Truth_Audit.md:51`

- Severity: `current_marker`
- Category: `access_boundary`
- Match: `\bPrivate Only\b`

> | Neo4j | Not verified | Not verified | Expected `7474`; TCP probe failed | Offline | `http://100.121.111.106:7474` | None | Not verified | Not verified | Private Only | Broken | No responding web console was found on the expected port. |

### `00_audit/QiServer_Service_Truth_Audit.md:52`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> | Homepage | Not verified | Not verified live; legacy repo compose uses `ghcr.io/gethomepage/homepage:latest` | `3001` reachable and returned HTTP `200` | Online | `http://100.121.111.106:3001` | None verified | Legacy deploy path inferred as `/srv/qios/stacks/_qiaccess_start`; not SSH-verified | Le

### `00_audit/QiServer_Service_Truth_Audit.md:52`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios`

> | Homepage | Not verified | Not verified live; legacy repo compose uses `ghcr.io/gethomepage/homepage:latest` | `3001` reachable and returned HTTP `200` | Online | `http://100.121.111.106:3001` | None verified | Legacy deploy path inferred as `/srv/qios/stacks/_qiaccess_start`; not SSH-verified | Le

### `00_audit/QiServer_Service_Truth_Audit.md:52`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios/stacks`

> | Homepage | Not verified | Not verified live; legacy repo compose uses `ghcr.io/gethomepage/homepage:latest` | `3001` reachable and returned HTTP `200` | Online | `http://100.121.111.106:3001` | None verified | Legacy deploy path inferred as `/srv/qios/stacks/_qiaccess_start`; not SSH-verified | Le

### `00_audit/QiServer_Service_Truth_Audit.md:52`

- Severity: `current_marker`
- Category: `access_boundary`
- Match: `\bPrivate Only\b`

> | Homepage | Not verified | Not verified live; legacy repo compose uses `ghcr.io/gethomepage/homepage:latest` | `3001` reachable and returned HTTP `200` | Online | `http://100.121.111.106:3001` | None verified | Legacy deploy path inferred as `/srv/qios/stacks/_qiaccess_start`; not SSH-verified | Le

### `00_audit/QiServer_Service_Truth_Audit.md:53`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> | QiAccess Start Deployment | Not verified | Not verified | Public edge reachable; protected origin not directly inspectable | Online | Likely private origin on `3001`, but not directly proven through Cloudflare Access | `https://access.qially.com` | Legacy qiserver stack path inferred as `/srv/qios

### `00_audit/QiServer_Service_Truth_Audit.md:53`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> | QiAccess Start Deployment | Not verified | Not verified | Public edge reachable; protected origin not directly inspectable | Online | Likely private origin on `3001`, but not directly proven through Cloudflare Access | `https://access.qially.com` | Legacy qiserver stack path inferred as `/srv/qios

### `00_audit/QiServer_Service_Truth_Audit.md:53`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios`

> | QiAccess Start Deployment | Not verified | Not verified | Public edge reachable; protected origin not directly inspectable | Online | Likely private origin on `3001`, but not directly proven through Cloudflare Access | `https://access.qially.com` | Legacy qiserver stack path inferred as `/srv/qios

### `00_audit/QiServer_Service_Truth_Audit.md:53`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios/stacks`

> | QiAccess Start Deployment | Not verified | Not verified | Public edge reachable; protected origin not directly inspectable | Online | Likely private origin on `3001`, but not directly proven through Cloudflare Access | `https://access.qially.com` | Legacy qiserver stack path inferred as `/srv/qios

### `00_audit/QiServer_Service_Truth_Audit.md:53`

- Severity: `current_marker`
- Category: `access_boundary`
- Match: `\bPublic Restricted\b`

> | QiAccess Start Deployment | Not verified | Not verified | Public edge reachable; protected origin not directly inspectable | Online | Likely private origin on `3001`, but not directly proven through Cloudflare Access | `https://access.qially.com` | Legacy qiserver stack path inferred as `/srv/qios

### `00_audit/QiServer_Service_Truth_Audit.md:64`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios`

> - `run_copy.bat` still points legacy config syncs at `/srv/qios/stacks/_qiaccess_start/config`, which reinforces the legacy deployment path clue but does not prove the current running compose state.

### `00_audit/QiServer_Service_Truth_Audit.md:64`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios/stacks`

> - `run_copy.bat` still points legacy config syncs at `/srv/qios/stacks/_qiaccess_start/config`, which reinforces the legacy deployment path clue but does not prove the current running compose state.

### `00_audit/QiServer_Service_Truth_Audit.md:68`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOpen WebUI\b`

> 1. Open WebUI is live, but not on the previously assumed direct `3000` URL.

### `00_audit/QiServer_Service_Truth_Audit.md:69`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bOllama\b`

> 2. Ollama is live and serving models.

### `00_audit/QiServer_Service_Truth_Audit.md:70`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bWiki\.js\b`

> 3. Wiki.js is live on private port `3002`.

### `00_audit/QiServer_Service_Truth_Audit.md:71`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPortainer\b`

> 4. Portainer and Cockpit are live and reachable on their private admin ports.

### `00_audit/QiServer_Service_Truth_Audit.md:72`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> 5. Paperless is not reachable on the expected `8000` endpoint.

### `00_audit/QiServer_Service_Truth_Audit.md:79`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> 1. Gain working SSH access to qiserver as `qiadmin` so Docker/container truth can be collected.

### `00_audit/QiServer_Service_Truth_Audit.md:80`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> 2. Run `docker ps`, compose discovery, and `/srv/qios` path checks on qiserver.

### `00_audit/QiServer_Service_Truth_Audit.md:80`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `/srv/qios`

> 2. Run `docker ps`, compose discovery, and `/srv/qios` path checks on qiserver.

### `00_audit/QiServer_Service_Truth_Audit.md:81`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> 3. Inspect the Paperless stack folder, compose status, consume path, media/data mounts, and logs.

### `00_blueprint/file-index.json`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/file-index.json`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/file-index.json`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/file-index.json`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/file-index.json`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/file-index.json`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/index.md:1`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> # QiAccess Start Master Blueprint

### `00_blueprint/index.md:3`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> QiAccess Start is the active master blueprint for this docset.

### `00_blueprint/index.md:5`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bfront door\b`

> It defines one cognitive front door with seven roots only:

### `00_blueprint/index.md:19`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> 1. the merged QiAccess Start pages in this master blueprint

### `00_blueprint/index.md:26`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> - the seven-root QiAccess Start operating model

### `00_blueprint/index.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/index.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/index.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/index.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/index.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/index.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/mkdocs.yml:1`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> site_name: QiAccess Start Master Blueprint

### `00_blueprint/mkdocs.yml:2`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> site_description: Active master blueprint for the QiAccess Start portal with retained QiOS governance controls

### `00_blueprint/mkdocs.yml:4`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> copyright: "QiAccess Start 2026 - master blueprint"

### `00_blueprint/mkdocs.yml:130`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> - QiAccess Start Portal: 06_applications/20_portal/portal.md

### `00_blueprint/mkdocs.yml`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/mkdocs.yml`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/mkdocs.yml`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/mkdocs.yml`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/mkdocs.yml`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/QiAccess_Start_Blueprint.md:1`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> # QiAccess Start Blueprint

### `00_blueprint/QiAccess_Start_Blueprint.md:3`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> QiAccess Start is Cody's cognitive front door.

### `00_blueprint/QiAccess_Start_Blueprint.md:3`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bfront door\b`

> QiAccess Start is Cody's cognitive front door.

### `00_blueprint/QiAccess_Start_Blueprint.md:20`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bWiki\.js\b`

> - `Knowledge`: link to manuals, Wiki.js, repo docs, and reference material

### `00_blueprint/QiAccess_Start_Blueprint.md:78`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bPaperless\b`

> 7. Paperless ingestion becomes the first proven intake pipeline

### `00_blueprint/QiAccess_Start_Blueprint.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/QiAccess_Start_Blueprint.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/QiAccess_Start_Blueprint.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/QiAccess_Start_Blueprint.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/QiAccess_Start_Blueprint.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/qi_os_home_blueprint.md:84`

- Severity: `legacy_review`
- Category: `client_portal_language`
- Match: `\btenant\b`

> The older business, tenant, and client-platform blueprint is quarantined.

### `00_blueprint/qi_os_home_blueprint.md:1`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> # QiAccess Start Operating Blueprint

### `00_blueprint/qi_os_home_blueprint.md:4`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> **Primary runtime:** qiserver

### `00_blueprint/qi_os_home_blueprint.md:5`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bWiki\.js\b`

> **Knowledge base:** Wiki.js plus repo docs

### `00_blueprint/qi_os_home_blueprint.md:10`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> QiAccess Start is Cody's cognitive front door.

### `00_blueprint/qi_os_home_blueprint.md:10`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bfront door\b`

> QiAccess Start is Cody's cognitive front door.

### `00_blueprint/qi_os_home_blueprint.md:24`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> QiAccess Start has seven top-level roots only:

### `00_blueprint/qi_os_home_blueprint.md:72`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> The following legacy QiOS rules remain active because they still serve QiAccess Start:

### `00_blueprint/qi_os_home_blueprint.md:86`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bfront door\b`

> Keep the useful governance DNA. Do not let the retired model override the seven-root cognitive front door.

### `00_blueprint/qi_os_home_blueprint.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/qi_os_home_blueprint.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/qi_os_home_blueprint.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/qi_os_home_blueprint.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/qi_os_home_blueprint.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/README.md:15`

- Severity: `legacy_review`
- Category: `client_portal_language`
- Match: `\btenant\b`

> The old QiOS material is not discarded, but it is no longer allowed to compete with the active doctrine. Useful governance, standards, registry discipline, and architecture policies remain in force. Legacy multi-tenant and client-platform assumptions are retained only as quarantined reference materi

### `00_blueprint/README.md:15`

- Severity: `legacy_review`
- Category: `client_portal_language`
- Match: `\bmulti-tenant\b`

> The old QiOS material is not discarded, but it is no longer allowed to compete with the active doctrine. Useful governance, standards, registry discipline, and architecture policies remain in force. Legacy multi-tenant and client-platform assumptions are retained only as quarantined reference materi

### `00_blueprint/README.md:55`

- Severity: `legacy_review`
- Category: `client_portal_language`
- Match: `\btenant\b`

> Use the quarantine appendix before promoting older QiOS, QiOne, tenant, client, or product-delivery doctrine back into the active blueprint:

### `00_blueprint/README.md:1`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> # QiAccess Start Master Blueprint

### `00_blueprint/README.md:3`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> This repository is the active master blueprint for QiAccess Start.

### `00_blueprint/README.md:5`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> QiAccess Start is Cody's cognitive front door:

### `00_blueprint/README.md:5`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bfront door\b`

> QiAccess Start is Cody's cognitive front door:

### `00_blueprint/README.md:39`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> - `docs/02_architecture/`: active QiAccess Start system model and runtime framing

### `00_blueprint/README.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/README.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/README.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/README.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/README.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/tech_stack_markmind.md:13`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bNocoDB\b`

> #### NocoDB

### `00_blueprint/tech_stack_markmind.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/tech_stack_markmind.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/tech_stack_markmind.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/tech_stack_markmind.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/tech_stack_markmind.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `01_notes/Legacy_Surface_Disposition.md:5`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> - `local/` is the legacy Homepage/qiserver stack; do not delete yet.

### `00_blueprint/00_genesis/00_genesis.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/00_genesis/00_genesis.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/00_genesis/00_genesis.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/00_genesis/00_genesis.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/00_genesis/00_genesis.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/00_genesis/00_genesis.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/00_genesis/_Index_of_00_genesis.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/00_genesis/_Index_of_00_genesis.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/00_genesis/_Index_of_00_genesis.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/00_genesis/_Index_of_00_genesis.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/00_genesis/_Index_of_00_genesis.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/00_genesis/_Index_of_00_genesis.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/01_governance.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/01_governance.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/01_governance.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/01_governance.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/01_governance.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/01_governance.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/index.md:3`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> Governance is the constitutional layer for QiAccess Start.

### `00_blueprint/01_governance/index.md:15`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> Governance must support the active seven-root QiAccess Start model.

### `00_blueprint/01_governance/index.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/index.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/index.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/index.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/index.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/index.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/_Index_of_01_governance.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/_Index_of_01_governance.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/_Index_of_01_governance.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/_Index_of_01_governance.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/_Index_of_01_governance.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/01_governance/_Index_of_01_governance.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/02_architecture.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/02_architecture.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/02_architecture.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/02_architecture.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/02_architecture.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/02_architecture.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/index.md:3`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> This section defines how QiAccess Start is structured as a working system rather than as an abstract platform stack.

### `00_blueprint/02_architecture/index.md:9`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> | **QiAccess Start** | The portal and cognitive front door |

### `00_blueprint/02_architecture/index.md:9`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bfront door\b`

> | **QiAccess Start** | The portal and cognitive front door |

### `00_blueprint/02_architecture/index.md:10`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> | **qiserver** | Primary self-hosted runtime and service host |

### `00_blueprint/02_architecture/index.md:10`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bself-hosted runtime\b`

> | **qiserver** | Primary self-hosted runtime and service host |

### `00_blueprint/02_architecture/index.md:12`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bWiki\.js\b`

> | **Wiki.js and repo docs** | Knowledge surfaces and readable source material |

### `00_blueprint/02_architecture/index.md:21`

- Severity: `current_marker`
- Category: `qiserver_runtime`
- Match: `\bqiserver\b`

> | Runtime host | qiserver and protected internal services |

### `00_blueprint/02_architecture/index.md:23`

- Severity: `current_marker`
- Category: `current_services`
- Match: `\bWiki\.js\b`

> | Knowledge base | Wiki.js plus repo documentation |

### `00_blueprint/02_architecture/index.md:29`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> QiAccess Start separates:

### `00_blueprint/02_architecture/index.md:38`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> - **System Model**: the QiAccess Start operating model

### `00_blueprint/02_architecture/index.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/index.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/index.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/index.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/index.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/_Index_of_02_architecture.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/_Index_of_02_architecture.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/_Index_of_02_architecture.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/_Index_of_02_architecture.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/_Index_of_02_architecture.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/02_architecture/_Index_of_02_architecture.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/04_data.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/04_data.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/04_data.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/04_data.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/04_data.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/04_data.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/index.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/index.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/index.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/index.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/index.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/index.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/_Index_of_04_data.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/_Index_of_04_data.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/_Index_of_04_data.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/_Index_of_04_data.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/_Index_of_04_data.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/04_data/_Index_of_04_data.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/05_compute.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/05_compute.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/05_compute.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/05_compute.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/05_compute.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/05_compute.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/index.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/index.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/index.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/index.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/index.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/index.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/_Index_of_05_compute.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/_Index_of_05_compute.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/_Index_of_05_compute.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/_Index_of_05_compute.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/_Index_of_05_compute.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/05_compute/_Index_of_05_compute.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/06_applications.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/06_applications.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/06_applications.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/06_applications.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/06_applications.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/06_applications.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/index.md:36`

- Severity: `legacy_review`
- Category: `client_portal_language`
- Match: `\btenant\b`

> If they still describe the older QiOne or multi-tenant portal model, they must be treated as reference-only until revalidated against the active blueprint.

### `00_blueprint/06_applications/index.md:36`

- Severity: `legacy_review`
- Category: `client_portal_language`
- Match: `\bmulti-tenant\b`

> If they still describe the older QiOne or multi-tenant portal model, they must be treated as reference-only until revalidated against the active blueprint.

### `00_blueprint/06_applications/index.md:3`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> This section defines the active user-facing surfaces for QiAccess Start.

### `00_blueprint/06_applications/index.md:12`

- Severity: `current_marker`
- Category: `qiaccess_start`
- Match: `\bQiAccess Start\b`

> QiAccess Start is the active portal.

### `00_blueprint/06_applications/index.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/index.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/index.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/index.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/index.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/index.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/_Index_of_06_applications.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/_Index_of_06_applications.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/_Index_of_06_applications.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_localhost`
- Match: `127\.0\.0\.1:8010`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/_Index_of_06_applications.md`

- Severity: `review`
- Category: `missing_current_fact::qidocs_wikijs_boundary`
- Match: `QiDocs|MkDocs|Wiki\.js`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/_Index_of_06_applications.md`

- Severity: `review`
- Category: `missing_current_fact::aider_repo_rule`
- Match: `Aider|nested git|/srv/qios/repos`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/06_applications/_Index_of_06_applications.md`

- Severity: `review`
- Category: `missing_current_fact::paperless_10_doc_test`
- Match: `10 documents|max 10|ten documents`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/07_operations/07_operations.md`

- Severity: `review`
- Category: `missing_current_fact::repos_stacks_data_split`
- Match: `/srv/qios/repos|/srv/qios/stacks|/srv/qios/data`

> Important current doctrine/fact not found in this likely target file.

### `00_blueprint/07_operations/07_operations.md`

- Severity: `review`
- Category: `missing_current_fact::ollama_localhost`
- Match: `127\.0\.0\.1:11434`

> Important current doctrine/fact not found in this likely target file.

_Showing first 300 findings out of 1567. See CSV for full detail._
