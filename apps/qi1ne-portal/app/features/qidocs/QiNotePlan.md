---
title: QiNote Master Build Plan (QiOne-grade)
Goal: QiNote = local-first AI knowledge base + ingestion + OCR + QiMeta/QiDecimal governance + multi-index RAG + knowledge graph + desktop/web/PWA shells + agent orchestration.
This plan assumes:
- You will dump repos into a “_lab” folder.
- Cursor is the implementation gremlin.
- Gina (Worker) is your orchestration runtime.
---
## Everything below is structured to match:

Naming + slugs + doc_types + atomicity + attachments + linking + safety + integration + QiMeta + registry system. (yes, I read your constitution, unfortunately)

0) Your “Repos Dump” Folder Layout

Make this exactly. Don’t freestyle. Your future self will thank me instead of hexing you.

QiOS/
  apps/
    qinote/                 # The actual product repo
    qimind/                 # Desktop shell later
    qicockpit/              # Admin portal later
  data/
    qivault/                # Your markdown vaults (personal + clients)
    registries/             # QiRealms/QiTags/QiMeta seeds, CSV/JSON
  _lab/
    repos_raw/              # your GitHub downloads go HERE
    repos_selected/         # we copy only useful bits here
    notes/                  # analysis notes per repo
  sys/
    workers/
      gina/                 # CF worker + ingestion + RAG router
  docs/
    eos/                    # your governance markdown


Rule: _lab/repos_raw is read-only. We copy pieces out into repos_selected so we don’t marry random repo structure.

1) QiNote Product Scope (What “everything you dreamt of” means)

No fluff. Real feature targets:

1.1 Core App Surfaces

QiNote Web App (primary)

React/Vite or SolidJS, Tailwind, Supabase client

QiNote PWA (client portals later)

offline cache + sync

QiMind Desktop (phase 2)

Electron/Tauri wrapper around QiNote + MCP tools

QiCockpit Modules (phase 2+)

ingestion monitor, registry editor, client switcher

1.2 Core Capabilities

Local-first vault selection + hot cache sync

Ingestion pipeline:

file drop → OCR/parse → rename → front matter → QiMeta → chunk → embed → index

Multi-index RAG (routes by realm/domain/visibility)

Knowledge graph (nodes=files/chunks, edges=links/tags/realms/entities)

Agent layer (Dify/AutoGen style jobs but inside your Worker)

Governance enforcement (validators, safe renames, no silent breakage)

2) System Architecture (One diagram, no lies)
[User] 
  -> QiNote UI (web/pwa)
      -> Local Vault Picker (paths)
      -> Supabase Auth
      -> Search UI (RAG + filters)
      -> Graph UI
      -> Ingestion UI

QiNote UI
  -> Gina Worker API (Cloudflare)
      -> Ingestion Worker
          -> OCR service
          -> Parser (md/pdf/img/audio)
          -> Renamer
          -> Front-matter generator
          -> QiMeta projector
          -> Chunker
          -> Embedder
          -> RAG Router (multi index)
      -> Query Worker
          -> vector search per index
          -> merge + rerank
          -> citations
      -> Registry Worker
          -> realms/tags/classes/aliases
          -> validations

Supabase
  -> qi_os schema (registries)
  -> qinote schema (files, chunks, embeddings, events)
  -> storage buckets (_docs/_media/_raw)

3) Database Schema (minimum viable, but real)
3.1 qi_os (registry layer)

You already specced this. Keep it sacred:

qi_realms

qi_tag_classes

qi_tags

qi_tag_aliases

qi_rag_indexes

3.2 qinote (execution layer)

Tables:

files

chunks

embeddings

ingest_jobs

events

entities (optional v1)

Minimal columns:

files

id uuid pk

file_name text (matches disk)

slug text

qi_decimal text

qid text

realm_slug text

realm_tag text

file_doc_type text

node_type text

tags text[]

ai_visibility text

security_realm text

source_path text

hash text

created_at timestamptz

updated_at timestamptz

chunks

id uuid pk

file_id uuid fk

chunk_index int

chunk_text text

chunk_hash text

qimeta jsonb

embeddings

id uuid pk

chunk_id uuid fk

embedding vector(1536 or 3072)

rag_index text

model text

created_at timestamptz

ingest_jobs

id uuid pk

status text

stage text

source_path text

error text

started_at

finished_at

4) Ingestion Pipeline (the heart)

Stages (each stage is an agent function):

detect

watch _raw/, _docs/, dropped files

extract

OCR for PDFs/images

Whisper for audio

plain read for text/md

normalize

clean text, remove junk, preserve sections

classify

realm + doc_type + tags + ai_visibility + security

rename + move

apply QiDecimal/date naming rules

move to correct folder

front_matter

generate or validate

qimeta

project QiMeta onto file + chunks

chunk

semantic chunks + stable chunk ids

embed

store embeddings

route/index

decide rag_index via routing table

commit

write DB rows + update links if renamed

Critical safety: no silent rename without link fix. Ever.
That’s literally in your laws.

5) Repo Triage Method (how we use your downloads)

When you download repos, we do this for each:

Repo Note Template (_lab/notes/<repo>.md)

---
title: Repo Triage – <repo>
slug: repo_triage_<repo>
realm_slug: tech
file_doc_type: log
tags: [tech, lab, repo]
---

## What it offers
- ...

## What we steal
- ...

## Where it goes
- QiNote UI / Worker / Graph / OCR / Desktop

## Risks
- ...

## Decision
- keep / ignore / revisit


Cursor will help fill those triage notes. I’ll give you prompts.

6) Cursor Orchestration Prompts (copy these exactly)
6.1 “Scan all repos and triage”

Cursor Prompt:

You are a senior AI engineer helping build QiNote (local-first knowledge base + RAG + governance).  
Scan the folder `_lab/repos_raw/` and for each repo create a triage note in `_lab/notes/` using this template:

- What it offers (features, tech)
- What we should steal (specific modules/files)
- Where it maps in QiNote
- Risks/compatibility
- Decision (keep/ignore)

Do not modify any repo code. Produce only triage markdown notes.

6.2 “Extract useful modules into repos_selected”
Based on triage notes in `_lab/notes/`, copy ONLY the useful code/assets from `_lab/repos_raw/<repo>` into `_lab/repos_selected/<repo>`.

Do not preserve full repo structure.  
Create a short README in each selected folder explaining:
- what was copied
- why
- intended target module in QiNote

6.3 “Scaffold QiNote app repo”
Create a new Vite + React + Tailwind app in `apps/qinote/`.

Requirements:
- Supabase auth
- Vault picker UI (local-first, store paths in settings)
- Pages: Inbox, Search, Graph, Registry, Settings
- Glassmorphism UI
- Routing via React Router
- State management via Zustand
- Typescript preferred
- Follow QiNote EOS naming and doc_type conventions for internal docs

6.4 “Build Supabase schema + migrations”
Generate SQL migrations for Supabase to create:
1) qi_os schema tables: qi_realms, qi_tag_classes, qi_tags, qi_tag_aliases, qi_rag_indexes
2) qinote schema tables: files, chunks, embeddings, ingest_jobs, events

Include constraints that enforce:
- realm_slug must exist in qi_realms
- tags must exist in qi_tags
- file_doc_type must be valid per registry

6.5 “Implement Gina Worker ingestion pipeline”
In `sys/workers/gina/`, implement a Cloudflare Worker API with routes:

POST /ingest
- accepts { source_path, security_realm }
- runs pipeline stages: detect->extract->normalize->classify->rename->front_matter->qimeta->chunk->embed->route/index->commit
- stores job status in qinote.ingest_jobs

GET /ingest/:id
- returns job + stage + errors

POST /query
- accepts { query, filters }
- routes to correct rag_index(es)
- merges and reranks
- returns citations with qimeta

Use Supabase client in Worker.

6.6 “Build RAG router + multi-index”
Create a routing config file `data/registries/qione_rag_routes.json` with rules:
- realm_slug
- domain tags
- doc_type
- ai_visibility
- security_realm
into rag_index names.

Implement router in Worker:
routeChunk(qimeta) -> rag_index

6.7 “Knowledge graph UI”
Implement Graph page in QiNote:
- fetch nodes from qinote.files and qinote.chunks
- edges from markdown links and shared tags/realms/entities
- use a force-directed graph library
- allow filtering by realm_tag, tags, doc_type, client
- clicking node opens file detail view

6.8 “Validator CLI”
Create a Python CLI tool `apps/qinote/tools/validate_qinote.py` that:
- scans a vault folder
- validates front matter
- validates filename <-> slug <-> title consistency
- validates qi_decimal immutability for constitutional files
- validates tags against registry
- outputs a report and non-zero exit on failure

7) MVP Milestones (so you don’t drown)
Milestone 1: “QiNote can ingest stuff”

QiNote UI runs

vault picker works

drop PDF/image/audio

Worker ingests → DB rows → embeddings

Search returns results

Milestone 2: “QiNote knows what it’s looking at”

registries in Supabase

classifier respects registries

validation pipeline blocks garbage

Milestone 3: “QiNote is a brain, not a folder”

multi-index RAG routing

graph UI

timeline view

agent jobs

Milestone 4: Multi-tenant + client OS

per-client vault + index separation

portals read-only views

permissions via ai_visibility/security_realm

8) What I need from you (no follow-ups, just facts)

When you’ve dumped repos into _lab/repos_raw, your next message should be:

repos downloaded. here’s the folder name and top-level list:
- ...
start triage plan.


Then we execute prompts 6.1 → 6.8 in order and start stitching.

You want QiNote to be a living OS brain.