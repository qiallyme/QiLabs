import{_ as a,o as s,c as e,ag as p}from"./chunks/framework.NIzFHKo_.js";const m=JSON.parse('{"title":"Component Map","description":"","frontmatter":{},"headers":[],"relativePath":"10_core/20_structure/30_component_map.md","filePath":"10_core/20_structure/30_component_map.md"}'),t={name:"10_core/20_structure/30_component_map.md"};function i(o,n,c,l,d,r){return s(),e("div",null,[...n[0]||(n[0]=[p(`<h1 id="component-map" tabindex="-1">Component Map <a class="header-anchor" href="#component-map" aria-label="Permalink to &quot;Component Map&quot;">​</a></h1><blockquote><p>Quarantine notice: this diagram reflects the older QiOS and QiOne layer model. It is retained for salvage, not as the active QiAccess Start component map. See <code>08_appendices/20_legacy/qiaccess_start_legacy_quarantine.md</code>.</p></blockquote><h2 id="system-components" tabindex="-1">System Components <a class="header-anchor" href="#system-components" aria-label="Permalink to &quot;System Components&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────┐</span></span>
<span class="line"><span>│              DELIVERY LAYER                  │</span></span>
<span class="line"><span>│  QiPortals · Web · Admin · Search · Setup    │</span></span>
<span class="line"><span>└────────────────────┬────────────────────────┘</span></span>
<span class="line"><span>                     │</span></span>
<span class="line"><span>┌────────────────────▼────────────────────────┐</span></span>
<span class="line"><span>│             APPLICATION LAYER                │</span></span>
<span class="line"><span>│     QiOne Portal · Tools · Interfaces        │</span></span>
<span class="line"><span>└────────────────────┬────────────────────────┘</span></span>
<span class="line"><span>                     │</span></span>
<span class="line"><span>┌────────────────────▼────────────────────────┐</span></span>
<span class="line"><span>│              PLATFORM LAYER                  │</span></span>
<span class="line"><span>│       qione: tenants · members · RBAC        │</span></span>
<span class="line"><span>│         Supabase Auth: identity              │</span></span>
<span class="line"><span>└────────────────────┬────────────────────────┘</span></span>
<span class="line"><span>                     │</span></span>
<span class="line"><span>┌────────────────────▼────────────────────────┐</span></span>
<span class="line"><span>│               DOMAIN LAYER                   │</span></span>
<span class="line"><span>│  qicase · qihome · qitax · qivault          │</span></span>
<span class="line"><span>│  qichronicle · qicms · qiknowledge          │</span></span>
<span class="line"><span>└────────────────────┬────────────────────────┘</span></span>
<span class="line"><span>                     │</span></span>
<span class="line"><span>┌────────────────────▼────────────────────────┐</span></span>
<span class="line"><span>│                CORE LAYER                    │</span></span>
<span class="line"><span>│  qiarchive: registration + identity spine    │</span></span>
<span class="line"><span>│  qigraph: derived graph (Neo4j projection)   │</span></span>
<span class="line"><span>│  qially: AI sessions + memory embeddings     │</span></span>
<span class="line"><span>│  qisys: jobs + workers + system events       │</span></span>
<span class="line"><span>└─────────────────────────────────────────────┘</span></span></code></pre></div><h2 id="local-↔-cloud-component-boundary" tabindex="-1">Local ↔ Cloud Component Boundary <a class="header-anchor" href="#local-↔-cloud-component-boundary" aria-label="Permalink to &quot;Local ↔ Cloud Component Boundary&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>LOCAL MACHINE                    CLOUD (Supabase)</span></span>
<span class="line"><span>─────────────────                ────────────────</span></span>
<span class="line"><span>File watcher          →          qiarchive.archive_files</span></span>
<span class="line"><span>Ingest pipeline       →          qiarchive.ingest_jobs</span></span>
<span class="line"><span>OCR + Extractor       →          qiarchive.archive_chunks</span></span>
<span class="line"><span>Embedding engine      →          pgvector (archive_chunks.embedding)</span></span>
<span class="line"><span>Local API             ↔          App APIs</span></span></code></pre></div><h2 id="key-component-relationships" tabindex="-1">Key Component Relationships <a class="header-anchor" href="#key-component-relationships" aria-label="Permalink to &quot;Key Component Relationships&quot;">​</a></h2><table tabindex="0"><thead><tr><th>From</th><th>To</th><th>Relationship</th></tr></thead><tbody><tr><td><code>qiarchive</code></td><td>All domain schemas</td><td>Provides <code>archive_id</code> FK anchor</td></tr><tr><td><code>qione.tenants</code></td><td>All domain schemas</td><td>Provides <code>tenant_id</code> FK for RLS</td></tr><tr><td><code>auth.users</code></td><td><code>qione.tenant_members</code></td><td>Identity mapping</td></tr><tr><td><code>qiarchive.archive_chunks</code></td><td><code>qilly.memory_embeddings</code></td><td>Embedding lineage</td></tr><tr><td><code>qigraph.master_index</code></td><td>All schemas</td><td>Cross-domain object index</td></tr></tbody></table>`,8)])])}const u=a(t,[["render",i]]);export{m as __pageData,u as default};
