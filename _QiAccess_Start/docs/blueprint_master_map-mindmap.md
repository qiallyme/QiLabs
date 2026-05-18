---
mindmap-plugin: markdown
---


# Knowledge System Map


## 10_core


<sub>Foundation / Rules / Structure / Source-of-Truth Doctrine</sub>


### Purpose

- Defines how the knowledge system thinks
- Holds governance
- Holds standards
- Holds registries
- Holds system maps
- Holds naming and metadata rules
- Holds QiCode doctrine
- Holds source-of-truth rules
- Describes the knowledge base from inside the knowledge base

### 10_governance


<sub>Principles / Rules / Policies / Decisions / Registries</sub>


#### Purpose

- Defines authority
- Defines operating principles
- Defines system rules
- Defines policy boundaries
- Tracks architectural decisions
- Maintains official registries

#### 10_principles.md

- Core principles
- Source-of-truth principle
- Clarity over cleverness
- Static-first principle
- Local-first where practical
- Derived systems are not truth
- One clear home per concern

#### 20_rules.md

- Folder rules
- Naming rules
- Placement rules
- Canonical truth rules
- Derived artifact rules
- AI retrieval boundaries
- “No floating root doctrine” rule

#### 30_standards


<sub>Machine-readable and human-readable standards</sub>


##### 10_content_metadata_profile.yaml

- Required front matter fields
- Optional front matter fields
- Display fields
- Hidden fields
- AI indexing fields
- Version fields
- Source-tracing fields

##### 20_metadata_rules.yaml

- Metadata validation rules
- Required fields by document type
- Status values
- Domain values
- Section values
- Tag rules
- Date rules

##### 30_naming_rules.yaml

- Folder naming rules
- File naming rules
- Slug rules
- Display name rules
- Numeric prefix rules
- Human-readable title rules

##### 40_pdf_standards.yaml

- PDF naming rules
- PDF metadata rules
- OCR expectations
- Exhibit handling
- Court/e-filing safety notes
- Compression/export rules

##### 50_repo_rules.yaml

- Repo structure rules
- App folder rules
- Script placement rules
- README requirements
- AI/tooling manifest requirements
- Build artifact exclusions

##### 60_qicode_standard.md

- QiCode purpose
- QiCode format
- QiCode derivation
- QiCode type prefixes
- QiCode depth rules
- QiCode examples

##### 70_numbering_standard.md

- Decimal-style folder ordering
- Prefix spacing
- Insertion rules
- UI display rules
- Sort order rules
- Prefix hiding rules

##### 80_date_version_standard.md

- `YYYYMMDD` date rule
- Created date rule
- Event date rule
- Ingestion date rule
- Version increment rules
- Updated date rule

##### _index.md

- Standards overview
- Standard categories
- How to apply standards
- Links to active standards

#### 40_policies


<sub>System-level policy boundaries</sub>


##### 10_access_policy.md

- Public vs private access
- Admin tool exposure rules
- Cloudflare Access rules
- Tailscale/private-only rules

##### 20_ai_usage_policy.md

- What AI can read
- What AI should not ingest
- Sensitive corpus restrictions
- Local model preference
- Human review requirements

##### 30_data_safety_policy.md

- Legal data handling
- Medical/care data handling
- Finance data handling
- Private identity documents
- Backup and export caution

##### _index.md

- Policy overview
- Active policy list
- Policy review rules

#### 50_decisions


<sub>Architecture Decision Records / ADRs</sub>


##### ADR-0000_template.md

- ADR template
- Decision status
- Context
- Decision
- Consequences
- Review date

##### ADR-0001_blueprint_scope.md

- Defines scope of current knowledge system
- Separates current personal/family/care system from older business-first blueprint

##### ADR-0002_single_domain_rule.md

- Every durable artifact has one primary home
- Cross-links are allowed
- Duplicate truth is not allowed

##### ADR-0003_markdown_first_kb.md

- Markdown files remain portable source
- QiAccess renders knowledge
- Wiki.js may remain optional or transitional

##### ADR-0004_qiarchive_as_ai_memory_pipeline.md

- QiArchive replaces vague “nexus core”
- QiArchive owns ingestion, extraction, chunking, embeddings, graphs, retrieval, and memory artifacts

##### ADR-0005_qicode_decimal_identity.md

- QiCode format
- Date inclusion
- Version rule
- ULID/UUID permanent identity rule

##### _index.md

- ADR list
- Decision status
- Decision review queue

#### 60_registry


<sub>Official controlled lists and lookup tables</sub>


##### 10_band_registry.yaml

- Top-level band definitions
- Domain order
- Display names
- Sort codes
- Descriptions

##### 20_domain_registry.yaml

- `10_core`
- `20_qinexus`
- `30_qiarchive`
- `40_system`
- Domain display names
- Domain descriptions
- Domain ownership

##### 30_folder_registry.yaml

- Folder codes
- Folder slugs
- Display names
- Parent-child relationships
- Allowed child types

##### 40_doc_type_registry.yaml

- doctrine
- standard
- policy
- decision
- registry
- system_map
- runbook
- audit
- log
- backup_manifest
- graph_artifact
- vector_artifact
- extraction_artifact
- retrieval_profile

##### 50_qicode_prefix_registry.yaml

- `QK` QiKnowledge article
- `QC` QiCore doctrine
- `QD` QiDecision / ADR
- `QR` QiRegistry
- `QS` QiSystem record
- `QA` QiArchive artifact
- `QV` QiVector artifact
- `QG` QiGraph artifact
- `QT` Transcript artifact
- `QX` Extracted text artifact
- `QL` QiLog
- `QB` QiBackup
- `QH` Health check
- `QF` Generated report
- `QE` Evidence artifact

##### _index.md

- Registry overview
- Registry maintenance rules
- Registry validation rules

##### _index.md

- Governance overview
- Principles
- Rules
- Standards
- Policies
- Decisions
- Registries

---


### 20_structure


<sub>System Maps / Identity / Components / Boundaries / Runtime</sub>


#### Purpose

- Describes how the knowledge system is structured
- Holds maps of the full system
- Defines how the parts relate
- Describes QiAccess as renderer/front door
- Describes Core, QiNexus, QiArchive, and System boundaries

#### 10_knowledge_system_map.md


<sub>This Markmind map</sub>

- Lives inside Core
- Describes the knowledge system from within the system
- Maps Core, QiNexus, QiArchive, and System
- Does not float above the four root domains
- Source map for review before finalization

#### 20_identity.md

- What QiAccess is
- What QiNexus is
- What QiArchive is
- What GINA is
- What Core is
- What System is
- What the knowledge base is not

#### 30_system_model.md

- Core as rules and structure
- QiNexus as human workspace
- QiArchive as AI memory pipeline
- System as operations/health layer
- QiAccess as front door and renderer
- GINA as retrieval/reasoning interface

#### 40_component_map.md

- QiAccess app
- Knowledge base module
- Markdown source files
- Asset folders
- Generated indexes
- Graphify outputs
- Qdrant collections
- Paperless records
- Google Drive / QiNexus source material
- Wiki.js optional reader/editor

#### 50_service_boundaries.md

- QiAccess boundary
- Wiki.js boundary
- Paperless boundary
- Qdrant boundary
- Ollama boundary
- Graphify boundary
- Google Drive boundary
- qiserver boundary
- Cloudflare/Tailscale boundary

#### 60_data_flow.md

- Source file created
- Metadata generated
- QiCode derived
- Index generated
- Article rendered in QiAccess
- Selected source ingested into QiArchive
- Text extracted
- Chunks created
- Embeddings generated
- Graphs generated
- GINA retrieves with source traceability

#### 70_device_model.md

- qiserver
- main Windows machine
- mobile devices
- Google Drive sync/local stream
- Tailscale devices
- Cloudflare-facing surface
- private LAN surface

#### 80_runtime_zones.md

- Public safe
- Public restricted
- Private only
- Local-only
- Server-hosted
- Cloud-backed
- Generated/derived

#### 90_qiaccess_kb_module.md

- QiAccess renders Markdown-backed KB
- Tree navigation
- Search
- Breadcrumbs
- Tags
- Status badges
- QiCode display
- Version display
- Asset rendering
- YAML artifact rendering
- Generated index loading

#### 100_markmind_and_graph_views.md

- Markmind maps
- Markmap exports
- Graphify relationship maps
- Visual system maps
- Generated map storage
- Map refresh rules

#### _index.md

- Structure overview
- System maps
- Identity docs
- Runtime model
- Component model

---


### 30_data


<sub>Object Model / Metadata / Storage / Naming / QiCode / Vectorization</sub>


#### Purpose

- Defines how knowledge objects are modeled
- Defines metadata and front matter
- Defines folder and file placement
- Defines QiCode and numbering standards
- Defines export and vectorization rules

#### 10_infrastructure_layout.md

- Repo layout
- Docs layout
- Assets layout
- Scripts layout
- Generated data layout
- Public/static output layout

#### 20_bands.md

- Core band
- QiNexus band
- QiArchive band
- System band
- Band descriptions
- Band responsibilities

#### 30_domains.md

- Domain model
- Domain codes
- Domain ownership
- Domain display rules
- Domain-to-folder mapping

#### 40_subdomains.md

- Section model
- Subsection model
- Category model
- When to use metadata instead of deeper folders

#### 50_namespace_registry.md

- Namespace rules
- QiCode prefixes
- Artifact namespaces
- App namespaces
- System namespaces

#### 60_directory_tree.md

- Canonical directory tree
- Folder codes
- Folder display names
- Allowed nesting depth
- Folder expansion rules

#### 70_object_model.md

- Knowledge article object
- Doctrine object
- Registry object
- Decision object
- Audit object
- Log object
- Backup object
- Graph artifact
- Vector artifact
- Source document reference
- Chunk object
- Retrieval profile

#### 80_objects.md

- Object examples
- Object lifecycle
- Object source-tracing
- Object status
- Object relationships

#### 90_schema.md

- JSON schema concepts
- YAML schema concepts
- Front matter schema
- Registry schema
- Validation rules

#### 100_metadata.md

- Required metadata
- Optional metadata
- Generated metadata
- Hidden metadata
- UI metadata
- AI retrieval metadata

#### 110_front_matter.md

- Minimal manual front matter
- Auto-generated fields
- Required fields by doc type
- Example front matter
- Repair rules

#### 120_storage.md

- Source storage
- Asset storage
- Generated storage
- QiArchive storage
- Backup storage
- Drive sync rules
- Repo storage rules

#### 130_placement_rules.md

- Where new docs go
- Where source files go
- Where generated files go
- Where logs go
- Where audits go
- Where graph/vector artifacts go
- Where personal/finance/legal/care files go

#### 140_exports.md

- Markdown export rules
- Wiki.js export rules
- JSON export rules
- Graph export rules
- Search index export rules
- Static site export rules

#### 150_qievidence.md

- Evidence artifact model
- Legal/case evidence references
- Source traceability
- Date anchoring
- Chain of custody notes
- Exhibit mapping

#### 160_vectorization_pipeline.md

- What gets vectorized
- What does not get vectorized
- Chunking rules
- Embedding rules
- Qdrant collection rules
- Rebuild rules
- Source traceability rules

#### 170_numbering_doctrine.md

- All folders numbered
- Numeric prefixes control order
- Prefixes are hidden in UI
- Display names are clean
- Decimal spacing
- Insertion numbers
- `00` for inbox/intake only

#### 180_qicode_doctrine.md

- QiCode purpose
- QiCode type prefixes
- Standard knowledge pattern
- Event record pattern
- Date in QiCode
- Version in QiCode
- ULID/UUID permanent ID
- Derivation from path

#### 190_date_version_rules.md

- `YYYYMMDD` rule
- Created date
- Published date
- Event date
- Ingestion date
- Processing date
- Version increments
- Updated timestamps

#### 200_deep_nesting_rules.md

- Maximum normal QiCode depth
- Domain / section / optional subsection / item
- Metadata instead of infinite nesting
- Path as physical address
- QiCode as conceptual shelfmark
- ULID/UUID as permanent identity

#### _index.md

- Data model overview
- Metadata model
- QiCode model
- Vectorization model
- Storage rules

---


### 40_service_apps


<sub>Purpose-Based Tools / Service Knowledge</sub>


#### Purpose

- Documents tools and services used by the system
- Explains what each service does
- Defines access rules
- Defines whether service is source, renderer, processor, or derived layer

#### 10_infrastructure


##### 10_cloudflare.md

- DNS
- Cloudflare Access
- Public restricted access
- Static hosting
- Tunnel/proxy notes

##### 20_gethomepage.md

- Server dashboard
- Service cards
- Internal links
- Local homepage role

##### 30_tailscale.md

- Private access
- Tailnet routing
- Private-only service rules
- Device access

##### 40_portainer.md

- Docker management
- Admin surface
- Private-only rule
- Container control risk

##### 50_cockpit.md

- Server admin console
- Private-only rule
- qiserver management

##### _index.md

- Infrastructure service overview

#### 20_ai_compute


##### 10_aider.md

- Code assistant
- Repo editing
- Agent workflows
- Context limitations

##### 20_ollama.md

- Local model runtime
- LAN API use
- Model management
- Privacy benefits

##### 30_qdrant.md

- Vector database
- Collections
- Embeddings
- Retrieval layer

##### 40_open_webui.md

- AI chat UI
- Local model access
- qiserver integration

##### 50_graphify.md

- Knowledge graph generation
- Graph reports
- Graph HTML
- Graph JSON
- Derived map layer
- Not source of truth

##### _index.md

- AI/compute service overview

#### 30_capture


##### 10_obsidian_qidocs.md

- Markdown editing
- Local-first notes
- Plugin use
- Manual review

##### 20_wikijs.md

- Optional reader/editor
- Transitional knowledge interface
- Not required as final source of truth

##### 30_paperless.md

- Document intake
- OCR
- Tags/correspondents
- Archive records
- Source references for QiArchive

##### 40_google_drive.md

- Storage backbone
- QiNexus source terrain
- Sync considerations
- Drive import manifests

##### _index.md

- Capture service overview

#### 40_productivity


##### 10_n8n.md

- Automation
- Workflow orchestration
- Ingestion triggers
- Report generation

##### 20_qiledger.md

- Finance tracking
- General ledger concepts
- Export integration

##### 30_solidtime.md

- Time tracking
- Work logs
- API possibilities

##### _index.md

- Productivity service overview

#### _index.md

- Service app map
- Service roles
- Service access classes

---


### 50_operations


<sub>Runbooks / Scripts / Templates / Execution</sub>


#### Purpose

- Holds operating instructions
- Holds build scripts doctrine
- Holds templates
- Holds runbooks
- Holds repeatable procedures

#### 10_cases.md

- Operating cases
- Use case examples
- Workflow examples
- System scenario notes

#### 20_templates.md

- Article template
- Index template
- ADR template
- Audit template
- Runbook template
- QiArchive manifest template

#### 30_qiserver_setup_runbook.md

- qiserver baseline
- Docker stack layout
- Portainer
- Cockpit
- Tailscale
- Backup basics
- Service health checks

#### 40_kb_build_script_doctrine.md

- Scan Markdown tree
- Extract numeric prefixes
- Derive metadata
- Generate QiCodes
- Repair missing front matter
- Generate tree nav
- Generate search index
- Validate assets
- Validate links
- Generate reports

#### 50_qicode_generation_runbook.md

- Path parsing
- Folder code extraction
- File code extraction
- Date selection
- Version selection
- Prefix selection by doc type
- Front matter write-back

#### 60_kb_validation_runbook.md

- Broken link checks
- Missing metadata checks
- Duplicate QiCode checks
- Duplicate slug checks
- Missing asset checks
- Stale generated file checks

#### 70_ingestion_runbook.md

- Select source
- Validate sensitivity
- Extract text
- Chunk
- Embed
- Graph if needed
- Register source map
- Store in QiArchive

#### _index.md

- Operations overview
- Active runbooks
- Template library

---


### 60_knowledge


<sub>Glossary / Changelog / Shared Understanding</sub>


#### Purpose

- Holds shared language
- Holds change history
- Explains terms
- Tracks conceptual evolution

#### 10_changelog.md

- Major system changes
- Naming changes
- Folder model changes
- Architecture shifts
- Deprecated concepts

#### 20_glossary.md

- QiAccess
- QiNexus
- QiArchive
- Core
- System
- GINA
- QiCode
- QiDecimal
- Source terrain
- Processed memory
- Derived artifact
- Canonical truth

#### 30_concept_index.md

- Core concepts
- Linked doctrine pages
- Related maps
- Frequently referenced terms

#### _index.md

- Knowledge overview
- Glossary
- Changelog
- Concept index

---


## 20_qinexus


<sub>Living Human Workspace / Source Terrain</sub>


### Purpose

- Holds Cody’s working life structure
- Organizes human-facing material
- Supports daily action
- Keeps files findable by function
- Acts as source terrain for selected AI ingestion
- Remains human-first, not machine-first

### Rule

- QiNexus is not GINA’s processed brain
- QiNexus is the organized source terrain
- QiArchive processes selected QiNexus material into retrievable memory

### 00_inbox


<sub>Temporary Landing Zone</sub>


#### Purpose

- Temporary capture
- Unprocessed files
- Notes waiting for placement
- Screenshots waiting for naming
- Downloads waiting for sorting

#### Proposed Contents

- `10_quick_captures/`
- `20_unsorted_files/`
- `30_pending_review/`
- `40_mobile_uploads/`
- `_index.md`

### 10_workbench


<sub>Active Work / Projects / Tasks / Drafts</sub>


#### Purpose

- Active projects
- Current tasks
- Working drafts
- Short-term builds
- Research in progress

#### Proposed Contents

- `10_active_projects/`
- `20_task_lists/`
- `30_drafts/`
- `40_builds/`
- `50_research_in_progress/`
- `_index.md`

### 20_timeline


<sub>Chronology / Logs / Journals / Event Trails</sub>


#### Purpose

- Time-based records
- Event logs
- Daily/weekly notes
- Personal chronology
- Legal/finance/care timelines

#### Proposed Contents

- `10_daily_notes/`
- `20_weekly_notes/`
- `30_event_trails/`
- `40_care_logs/`
- `50_legal_timelines/`
- `60_finance_timelines/`
- `70_system_timelines/`
- `_index.md`

### 30_life


<sub>Personal Operations / Home / Wellness / Routines</sub>


#### Purpose

- Home operations
- Personal routines
- Wellness systems
- Household needs
- Life planning

#### Proposed Contents

- `10_home/`
- `20_routines/`
- `30_wellness/`
- `40_planning/`
- `50_personal_guides/`
- `_index.md`

### 40_people


<sub>Family / Support Network / Relationship Context</sub>


#### Purpose

- Family coordination
- Support network notes
- Care coordination
- Communication plans
- Relationship context

#### Proposed Contents

- `10_family/`
- `20_support_network/`
- `30_care_coordination/`
- `40_communication_plans/`
- `50_relationship_context/`
- `_index.md`

### 50_business


<sub>Brand / Revenue / Client / Business Materials</sub>


#### Purpose

- Business materials
- Brand notes
- Revenue systems
- Client references
- Offers/products

#### Proposed Contents

- `10_brand/`
- `20_revenue/`
- `30_clients/`
- `40_offers_products/`
- `50_marketing_assets/`
- `60_business_operations/`
- `_index.md`

### 60_finance


<sub>Money / Bills / Reports / Reconciliations</sub>


#### Purpose

- Budgets
- Bills
- Accounts
- Statements
- Reconciliations
- Reports
- General ledger work

#### Proposed Contents

- `10_budget/`
- `20_bills/`
- `30_accounts/`
- `40_statements/`
- `50_reconciliations/`
- `60_reports/`
- `70_general_ledger/`
- `80_tax/`
- `_index.md`

### 70_legal


<sub>Legal Matters / Filings / Evidence / Research</sub>


#### Purpose

- Legal matters
- Court filings
- Evidence
- Timelines
- Motions
- Research
- Complaints

#### Proposed Contents

- `10_matters/`
- `20_filings/`
- `30_evidence/`
- `40_timelines/`
- `50_motions_drafts/`
- `60_research/`
- `70_regulatory_complaints/`
- `80_exhibits/`
- `_index.md`

### 80_tech


<sub>Servers / Apps / Code Notes / Infrastructure</sub>


#### Purpose

- qiserver notes
- App architecture
- Repo notes
- Scripts
- Deployments
- Tooling docs
- Dev runbooks

#### Proposed Contents

- `10_qiserver/`
- `20_apps/`
- `30_repos/`
- `40_scripts/`
- `50_deployments/`
- `60_tooling/`
- `70_dev_runbooks/`
- `_index.md`

### 90_assets


<sub>Reusable Media / Templates / Design / Brand Assets</sub>


#### Purpose

- Reusable visual/audio/template assets
- Brand assets
- Screenshots
- Diagrams
- Media

#### Proposed Contents

- `10_images/`
- `20_video/`
- `30_audio/`
- `40_templates/`
- `50_branding/`
- `60_icons/`
- `70_diagrams/`
- `80_screenshots/`
- `_index.md`

### 100_data


<sub>Structured Source Material / Exports / Datasets</sub>


#### Purpose

- CSV files
- JSON exports
- Database exports
- Raw structured data
- Data logs
- Source datasets

#### Proposed Contents

- `10_csv/`
- `20_json/`
- `30_database_exports/`
- `40_logs/`
- `50_datasets/`
- `60_source_tables/`
- `_index.md`

### 110_reference


<sub>External Knowledge / Guides / Laws / Articles / Examples</sub>


#### Purpose

- External references
- Research articles
- Legal references
- Technical docs
- Examples
- Citations

#### Proposed Contents

- `10_articles/`
- `20_research/`
- `30_legal_references/`
- `40_technical_guides/`
- `50_examples/`
- `60_citations/`
- `70_external_docs/`
- `_index.md`

### 120_archive


<sub>Inactive / Historical / Completed / Frozen Material</sub>


#### Purpose

- Completed work
- Deprecated docs
- Historical files
- Frozen exports
- Old working sets
- Superseded material

#### Proposed Contents

- `10_completed_projects/`
- `20_deprecated_docs/`
- `30_historical_files/`
- `40_frozen_exports/`
- `50_old_working_sets/`
- `60_superseded_material/`
- `_index.md`

### 130_system


<sub>QiNexus Rules / Indexes / Manifests / Local Structure</sub>


#### Purpose

- QiNexus local rules
- Folder manifests
- Placement guides
- Local indexes
- Sync notes
- Structure docs

#### Proposed Contents

- `10_qinexus_rules.md`
- `20_folder_manifest.yaml`
- `30_placement_guide.md`
- `40_local_indexes/`
- `50_sync_notes.md`
- `60_structure_docs/`
- `_index.md`

### _index.md

- QiNexus overview
- Human workspace doctrine
- Source terrain explanation
- Placement rules
- Link to QiArchive ingestion rules

---


## 30_qiarchive


<sub>AI Memory Pipeline / Ingestion / Embeddings / Graphs / Retrieval</sub>


### Purpose

- Converts selected source material into AI-readable memory
- Stores ingestion records
- Stores extraction outputs
- Stores chunk manifests
- Stores embedding metadata
- Stores graph exports
- Stores retrieval profiles
- Supports GINA’s memory and recall
- Preserves traceability back to source material

### Rule

- QiArchive is not a dumping ground
- QiArchive is not the same as old-file archive
- QiArchive is the processed knowledge substrate
- Every processed item traces back to a source

### 10_ingestion


<sub>Where source material enters the AI pipeline</sub>


#### Purpose

- Track source imports
- Track source manifests
- Track skipped files
- Track ingestion dates
- Track source-to-archive mapping

#### 10_paperless

- Paperless document manifests
- Paperless document IDs
- OCR references
- Source links
- Import dates
- Processing status
- `_index.md`

#### 20_drive_imports

- Google Drive import manifests
- QiNexus source mappings
- Folder scan records
- Import batches
- Skipped-file reports
- `_index.md`

#### 30_manual_uploads

- Manually added files
- One-off imports
- Temporary review files
- Upload notes
- `_index.md`

#### 40_email_exports

- Gmail exports
- Attachment manifests
- Message metadata
- Thread summaries
- Source references
- `_index.md`

#### 50_web_clips

- Saved pages
- Article captures
- Citation captures
- Download records
- `_index.md`

#### _index.md

- Ingestion overview
- Ingestion rules
- Sensitivity gate
- Source traceability requirements

### 20_extraction


<sub>Raw material converted into usable text/metadata</sub>


#### Purpose

- Hold extracted text
- Hold OCR output
- Hold transcripts
- Hold metadata extraction
- Preserve source references

#### 10_ocr_text

- OCR output
- Paperless text exports
- Image text extraction
- Scan corrections
- `_index.md`

#### 20_markdown_exports

- Converted Markdown files
- Wiki.js exports
- HTML-to-Markdown exports
- PDF-to-Markdown outputs
- `_index.md`

#### 30_transcripts

- Audio transcripts
- Video transcripts
- Meeting transcripts
- Voice note transcripts
- `_index.md`

#### 40_metadata

- Extracted metadata
- File metadata
- Document dates
- Entity hints
- Source fingerprints
- `_index.md`

#### 50_clean_text

- Normalized text
- Deduplicated text
- Cleaned OCR
- Human-reviewed corrections
- `_index.md`

#### _index.md

- Extraction overview
- Extraction quality rules
- Correction workflow

### 30_chunking


<sub>How source text becomes retrievable units</sub>


#### Purpose

- Define chunking rules
- Store chunk manifests
- Map chunks back to source
- Track chunk hashes
- Support retrieval and citation

#### 10_chunk_manifests

- Chunk IDs
- Source document IDs
- Chunk boundaries
- Token counts
- Chunk hashes
- `_index.md`

#### 20_chunk_rules

- Chunking strategy
- Overlap rules
- Document-type rules
- Sensitive-content handling
- `_index.md`

#### 30_source_maps

- Chunk-to-source mappings
- Source-to-chunk mappings
- Page references
- Section references
- Original file references
- `_index.md`

#### 40_quality_checks

- Missing chunk checks
- Oversized chunk checks
- Duplicate chunk checks
- Broken source-map checks
- `_index.md`

#### _index.md

- Chunking overview
- Chunking standards
- Source mapping rules

### 40_embeddings


<sub>Vector Memory / Qdrant / Embedding Metadata</sub>


#### Purpose

- Track vector memory
- Track embedding models
- Track Qdrant collections
- Track rebuilds
- Track stale embeddings

#### 10_qdrant

- Collection manifests
- Collection names
- Vector counts
- Index status
- Rebuild notes
- `_index.md`

#### 20_embedding_models

- Active embedding models
- Previous embedding models
- Model dimensions
- Model compatibility notes
- `_index.md`

#### 30_collection_manifests

- Collection purpose
- Source scope
- Last rebuild
- Included domains
- Excluded domains
- `_index.md`

#### 40_rebuild_logs

- Index rebuild logs
- Failed embeddings
- Skipped files
- Reprocessing notes
- Stale index warnings
- `_index.md`

#### 50_vector_quality_tests

- Retrieval tests
- Similarity checks
- Duplicate vector checks
- Missing embedding checks
- `_index.md`

#### _index.md

- Embeddings overview
- Vector collection rules
- Rebuild rules

### 50_graphs


<sub>Knowledge Graphs / Visual Maps / Relationship Exports</sub>


#### Purpose

- Store graph artifacts
- Store visual maps
- Store relationship exports
- Store Graphify outputs
- Store entity/topic maps

#### 10_graphify

- `graph.html`
- `graph.json`
- `GRAPH_REPORT.md`
- Graphify run logs
- Graphify source scopes
- `_index.md`

#### 20_markmap

- Markdown mind maps
- Visual system maps
- Tree maps
- Blueprint maps
- `_index.md`

#### 30_entity_maps

- People/entity maps
- Service maps
- Project maps
- Case maps
- Topic maps
- `_index.md`

#### 40_relationship_exports

- Node exports
- Edge exports
- Source relationship data
- Cross-reference maps
- `_index.md`

#### 50_graph_quality_reports

- Orphan node reports
- Broken edge reports
- High-degree node reports
- Duplicate entity reports
- `_index.md`

#### _index.md

- Graph overview
- Graph generation rules
- Graph validation rules

### 60_retrieval


<sub>RAG Profiles / Query Testing / Prompt Context</sub>


#### Purpose

- Define how GINA retrieves
- Store RAG profiles
- Store query logs
- Store retrieval tests
- Store prompt context bundles

#### 10_rag_profiles

- Retrieval profiles
- Domain-specific search settings
- System prompts for retrieval
- Access rules
- `_index.md`

#### 20_query_logs

- Retrieval query logs
- Failed query logs
- Useful query examples
- Search quality notes
- `_index.md`

#### 30_retrieval_tests

- Test questions
- Expected answers
- Source validation
- Retrieval accuracy checks
- `_index.md`

#### 40_prompt_contexts

- Context packs
- Agent instructions
- System context bundles
- Domain-specific prompt frames
- `_index.md`

#### 50_source_citation_tests

- Citation accuracy checks
- Source grounding tests
- Missing citation reports
- Unsupported-answer reports
- `_index.md`

#### _index.md

- Retrieval overview
- RAG rules
- Testing rules

### 70_memory


<sub>GINA Durable Memory / Session Artifacts / Preference Maps</sub>


#### Purpose

- Store approved durable memory artifacts
- Store session summaries
- Store preference maps
- Store GINA profile docs
- Store restart prompts

#### 10_gina_profiles

- GINA operating profile
- Assistant behavior rules
- Domain priorities
- System boundaries
- `_index.md`

#### 20_durable_facts

- Long-term stable facts
- Approved memory records
- User preferences
- System constants
- `_index.md`

#### 30_session_summaries

- Receipt-ready summaries
- Conversation artifacts
- Restart prompts
- Decision summaries
- `_index.md`

#### 40_preference_maps

- Cody preferences
- System design preferences
- Writing preferences
- Tooling preferences
- Workflow preferences
- `_index.md`

#### 50_context_packs

- Legal context packs
- Finance context packs
- Mom’s Care context packs
- QiAccess context packs
- qiserver context packs
- `_index.md`

#### _index.md

- Memory overview
- Durable memory rules
- Human review requirements

### 80_sync_backups


<sub>Snapshots / Backup Manifests / Restore Points</sub>


#### Purpose

- Track backup snapshots
- Track index snapshots
- Track restore points
- Track generated registry backups
- Track AI memory recovery points

#### 10_index_snapshots

- Search index snapshots
- Vector index snapshots
- Graph snapshots
- Generated registry snapshots
- `_index.md`

#### 20_backup_manifests

- Backup records
- Backup locations
- Backup dates
- Backup verification notes
- `_index.md`

#### 30_restore_points

- Restore instructions
- Known-good states
- Rollback notes
- Recovery checkpoints
- `_index.md`

#### 40_sync_manifests

- Drive sync manifests
- Repo sync manifests
- Paperless sync manifests
- Generated file sync records
- `_index.md`

#### _index.md

- Sync/backup overview
- Restore rules
- Backup validation rules

### _index.md

- QiArchive overview
- AI memory pipeline doctrine
- Source traceability rule
- Retrieval boundaries

---


## 40_system


<sub>Operational Health / Logs / Audits / Backups / Generated Reports</sub>


### Purpose

- Tracks system health
- Holds logs
- Holds audits
- Holds backup metadata
- Holds generated reports
- Tracks stale, broken, risky, or review-needed items

### Rule

- System artifacts are operational records
- Audits do not need their own root universe
- Logs, audits, and backups belong here unless they are part of QiArchive processing

### 10_logs


<sub>Operational logs</sub>


#### Purpose

- Build logs
- Sync logs
- Deployment logs
- Agent run logs
- Import logs
- Error logs
- Maintenance logs

#### Proposed Contents

- `10_build_logs/`
- `20_sync_logs/`
- `30_deployment_logs/`
- `40_agent_run_logs/`
- `50_import_logs/`
- `60_error_logs/`
- `70_maintenance_logs/`
- `_index.md`

### 20_audits


<sub>System audits and truth checks</sub>


#### Purpose

- Current-state audits
- Service audits
- Content audits
- Security audits
- Folder audits
- Stale document audits

#### Proposed Contents

- `10_qiaccess_start_current_state_audit.md`
- `20_qiserver_service_truth_audit.md`
- `30_content_audits/`
- `40_folder_audits/`
- `50_service_audits/`
- `60_security_audits/`
- `70_stale_document_audits/`
- `_index.md`

### 30_backups


<sub>Backup strategy and verification</sub>


#### Purpose

- Backup strategy
- Backup records
- Backup verification
- Restore notes
- Local backup metadata
- Cloud backup metadata

#### Proposed Contents

- `10_backup_strategy.md`
- `20_backup_records/`
- `30_backup_verification/`
- `40_restore_notes/`
- `50_local_backup_metadata/`
- `60_cloud_backup_metadata/`
- `_index.md`

### 40_health_checks


<sub>System health and uptime checks</sub>


#### Purpose

- qiserver health checks
- Docker service status
- App uptime
- Link checks
- Broken asset checks
- Broken Markdown link checks

#### Proposed Contents

- `10_qiserver_health/`
- `20_docker_service_status/`
- `30_app_uptime/`
- `40_link_checks/`
- `50_asset_checks/`
- `60_markdown_link_checks/`
- `_index.md`

### 50_generated_reports


<sub>Generated validation and build reports</sub>


#### Purpose

- KB build reports
- Search index reports
- Graph generation reports
- Link validation reports
- Metadata validation reports
- Front matter reports

#### Proposed Contents

- `10_kb_build_reports/`
- `20_search_index_reports/`
- `30_graph_generation_reports/`
- `40_link_validation_reports/`
- `50_metadata_validation_reports/`
- `60_front_matter_reports/`
- `70_qicode_registry_reports/`
- `_index.md`

### 60_generated_indexes


<sub>Generated indexes and registries</sub>


#### Purpose

- Store generated app-readable indexes
- Store generated registry exports
- Store search indexes
- Store tree indexes
- Store tag indexes

#### Proposed Contents

- `10_kb_index_generated.json`
- `20_kb_tree_generated.json`
- `30_kb_search_generated.json`
- `40_kb_tags_generated.json`
- `50_kb_assets_generated.json`
- `60_qicode_registry_generated.json`
- `_index.md`

### 70_maintenance


<sub>Recurring maintenance procedures</sub>


#### Purpose

- Cleanup tasks
- Rebuild tasks
- Review cycles
- Stale artifact cleanup
- Archive review

#### Proposed Contents

- `10_cleanup_tasks.md`
- `20_rebuild_tasks.md`
- `30_review_cycles.md`
- `40_stale_artifact_cleanup.md`
- `50_archive_review.md`
- `_index.md`

### _index.md

- System overview
- Logs
- Audits
- Backups
- Health checks
- Generated reports
- Maintenance
