-- Seed core events (human language reasons)
insert into public.system_event (event_code, severity, description, suggested_fix)
values
  ('AUTH.MISSING_GINA_KEY','critical','GINA API key missing or invalid.','Set GINA service key in orchestrator env and re-run health check.'),
  ('RULE.DUPLICATE_ID','error','Duplicate rule_id detected in rule registry.','Deduplicate qios_rules_v1_1.csv and re-seed rules.'),
  ('WKR.QUEUE_STALL','warn','Worker queue depth rising without progress.','Check dependency workers and throttling settings.'),
  ('WKR.HEARTBEAT_LOST','error','Worker heartbeat missing beyond threshold.','Restart worker or check orchestrator connectivity.'),
  ('DB.MIGRATION_REQUIRED','warn','DB schema version mismatch.','Run latest schema patch and seeds.'),
  ('FS.ROOT_MISSING','error','Filesystem root missing or inaccessible.','Confirm QiOS root path in Universe Config.'),
  ('SEM.EMBEDDING_FAIL','error','Embedding worker failed during vectorization.','Check model endpoint + file type legality.')
on conflict (event_code) do update set
  severity = excluded.severity,
  description = excluded.description,
  suggested_fix = excluded.suggested_fix;

-- Seed baseline workers
insert into public.worker_status (worker_id, name, layer, state, depends_on)
values
  ('orchestrator','GINA Orchestrator',null,'gray','{}'),
  ('ingestion','Semantic Ingestion Worker',6,'gray','{"orchestrator"}'),
  ('linter','QiOS Linter Dispatcher',0,'gray','{"orchestrator"}'),
  ('metadata_naming','Metadata + Naming Enforcer',5,'gray','{"linter"}'),
  ('semantic_router','Semantic Routing Worker',6,'gray','{"ingestion"}'),
  ('self_heal','Self-Healing Worker',7,'gray','{"semantic_router"}'),
  ('readme_autogen','README Auto-Generator',2,'gray','{"linter"}')
on conflict (worker_id) do update set
  name = excluded.name,
  layer = excluded.layer,
  depends_on = excluded.depends_on,
  updated_at = now();

