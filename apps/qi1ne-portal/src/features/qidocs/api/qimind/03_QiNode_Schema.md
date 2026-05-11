---
title: "QiNode Schema"
qi_realm: QiSystem
qi_orbit: Schema
qi_system: Nodes
qi_decimal: 5.01.04.01
type: schema
version: 1.0.0
---

# QiNode Schema

This document defines the canonical fields for QiNodes and QiBits.

---

## 1. High-Level Model

A **QiNode** is a semantic, user-facing node (note, record, document, event).  
A **QiBit** is the minimal atomic unit (may be a chunk or simple capture) that still carries a QiD.

QiNodes and QiBits share the same base schema, with some fields optional for QiBits.

---

## 2. Core Fields (Human-Oriented)

| Field            | Type       | Required | Description                                      |
|------------------|------------|----------|--------------------------------------------------|
| `title`          | string     | Yes      | Human-readable name                              |
| `qid`            | string     | Yes      | QiDecimal ID (QiD)                               |
| `realm`          | string     | Yes      | QiRealm name (`QiOne`, `QiClients`, etc.)        |
| `orbit`          | string     | Yes      | Orbit name (e.g., `Work-Career`, `Luis`)         |
| `system`         | string     | Yes      | System name (e.g., `Journal`, `Tasks`)           |
| `status`         | string     | No       | Lifecycle status (Inbox, Active, Done, etc.)     |
| `tags`           | string[]   | No       | Free-form tags (mood, topics, entities)          |
| `summary`        | string     | No       | Optional AI or manual summary                    |
| `body`           | string     | No       | Markdown/MDX content                             |

---

## 3. Entanglement Fields

```yaml
entanglement:
  origin_qid: "1.02.01.001"      # single QiD
  influence_qid: "1.02.01.009"   # single QiD
  companion_qid: "1.07.01.003"   # single QiD
```

* `origin_qid` – What sparked this node (Why)
* `influence_qid` – What this node drives or affects (How)
* `companion_qid` – Parallel or sibling node (Also relates to)

All are optional but strongly recommended.

---

## 4. Temporal & Authorship Metadata

```yaml
time:
  created_at: "2025-11-15T03:02:00Z"
  updated_at: "2025-11-15T03:05:22Z"
  occurred_at: "2025-11-15T02:55:00Z"  # when the event actually happened

credits:
  author: "QiOne"
  created_by: "user"        # or "system" / "ai"
  device: "Desktop"
```

---

## 5. Source & Attachment Metadata

```yaml
source:
  type: "journal"           # or "audio", "pdf", "image", "import"
  files:
    - path: "media/audio/2025-11-15_0032.m4a"
      kind: "audio"
    - path: "media/transcripts/2025-11-15_0032.md"
      kind: "transcript"
  external_refs:
    - url: "https://example.com"
      label: "Reference article"
```

---

## 6. Indexing & AI Metadata

```yaml
indexing:
  embedding_ids:
    - "emb_2025-11-15_0001"
  chunk_ids:
    - "1.02.01.007c01"
    - "1.02.01.007c02"
  last_embedded_at: "2025-11-15T03:06:00Z"
  model_version: "v1-qinote-emb"

ai:
  reflective_score: 3        # 3, 6, or 9
  ai_tags:
    - "anxiety"
    - "money"
    - "dad"
  insights:
    - "Recurring pattern of money stress triggered by family calls."
```

---

## 7. Example QiNode (Full Front Matter)

```yaml
---
title: "Money panic after call with dad"
qid: "1.06.01.007"
realm: "QiOne"
orbit: "Finances-Security"
system: "Journal"
status: "Active"
tags:
  - "anxiety"
  - "family"
  - "money"
summary: "Journal entry exploring recurring money anxiety triggered by a call with dad."

entanglement:
  origin_qid: "1.04.01.002"
  influence_qid: "1.06.02.001"
  companion_qid: "1.07.01.003"

time:
  created_at: "2025-11-15T03:02:00Z"
  updated_at: "2025-11-15T03:05:22Z"
  occurred_at: "2025-11-15T02:55:00Z"

credits:
  author: "QiOne"
  created_by: "user"
  device: "Desktop"

source:
  type: "journal"
  files:
    - path: "media/audio/2025-11-15_0032.m4a"
      kind: "audio"
    - path: "media/transcripts/2025-11-15_0032.md"
      kind: "transcript"

indexing:
  embedding_ids:
    - "emb_2025-11-15_0001"
  chunk_ids:
    - "1.06.01.007c01"
  last_embedded_at: "2025-11-15T03:06:00Z"
  model_version: "v1-qinote-emb"

ai:
  reflective_score: 6
  ai_tags:
    - "panic"
    - "scarcity"
  insights:
    - "Pattern: calls with dad often precede late-night financial spirals."
---

Body of the note in Markdown...
```

---

## 8. JSON Schema (Simplified)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "QiNode",
  "type": "object",
  "required": ["title", "qid", "realm", "orbit", "system"],
  "properties": {
    "title": { "type": "string" },
    "qid": { "type": "string" },
    "realm": { "type": "string" },
    "orbit": { "type": "string" },
    "system": { "type": "string" },
    "status": { "type": "string" },
    "tags": { "type": "array", "items": { "type": "string" } },
    "summary": { "type": "string" },
    "body": { "type": "string" },
    "entanglement": {
      "type": "object",
      "properties": {
        "origin_qid": { "type": "string" },
        "influence_qid": { "type": "string" },
        "companion_qid": { "type": "string" }
      },
      "additionalProperties": false
    },
    "time": {
      "type": "object",
      "properties": {
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" },
        "occurred_at": { "type": "string", "format": "date-time" }
      },
      "additionalProperties": false
    },
    "credits": {
      "type": "object",
      "properties": {
        "author": { "type": "string" },
        "created_by": { "type": "string" },
        "device": { "type": "string" }
      },
      "additionalProperties": false
    },
    "source": {
      "type": "object",
      "properties": {
        "type": { "type": "string" },
        "files": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "path": { "type": "string" },
              "kind": { "type": "string" }
            },
            "required": ["path"],
            "additionalProperties": false
          }
        },
        "external_refs": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "url": { "type": "string", "format": "uri" },
              "label": { "type": "string" }
            },
            "required": ["url"],
            "additionalProperties": false
          }
        }
      },
      "additionalProperties": false
    },
    "indexing": {
      "type": "object",
      "properties": {
        "embedding_ids": {
          "type": "array",
          "items": { "type": "string" }
        },
        "chunk_ids": {
          "type": "array",
          "items": { "type": "string" }
        },
        "last_embedded_at": { "type": "string", "format": "date-time" },
        "model_version": { "type": "string" }
      },
      "additionalProperties": false
    },
    "ai": {
      "type": "object",
      "properties": {
        "reflective_score": { "type": "integer" },
        "ai_tags": {
          "type": "array",
          "items": { "type": "string" }
        },
        "insights": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

