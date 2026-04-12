---
title: "QiD Specification (QiDecimal IDs)"
qi_realm: QiSystem
qi_orbit: Schema
qi_system: IDs
qi_decimal: 5.01.03.01
type: spec
version: 1.0.0
---

# QiD Specification (QiDecimal IDs)

**QiD** (QiDecimal ID, pronounced "Kid") is the canonical, immutable identifier for every QiNode and QiBit.

---

## 1. Purpose

QiD must:

- Be globally unique within the QiMultiverse
- Encode enough structure to be interpretable by humans and machines
- Stay stable for the lifetime of the node
- Be short, sortable, and easy to copy

---

## 2. Format

QiD uses a dotted-decimal structure:

```text
R.OO.SS.NNN
```

Where:

* `R`   – Realm code (1 digit)
* `OO`  – Orbit code (2 digits)
* `SS`  – System code (2 digits)
* `NNN` – Sequence number (3+ digits, zero-padded as needed)

Example:

```text
2.03.01.007
```

---

## 3. Realm Codes

| Realm      | Code (`R`) |
| ---------- | ---------: |
| QiOne      |          1 |
| QiClients  |          2 |
| QiProjects |          3 |
| QiArchive  |          4 |
| QiSystem   |          5 |
| QiExternal |          6 |

Example:

* `1.x.x.x` → QiOne personal universe
* `2.x.x.x` → QiClients universe

---

## 4. Orbit Codes (`OO`)

Each Realm maintains its own orbit code mapping.

### 4.1 QiOne Orbit Codes

| Orbit                     | Code (`OO`) |
| ------------------------- | ----------: |
| Self & Health             |          01 |
| Work & Career             |          02 |
| Home & Environment        |          03 |
| Relationships & Community |          04 |
| Spiritual & Metaphysical  |          05 |
| Finances & Security       |          06 |
| Learning & Ideas          |          07 |
| Projects & Goals          |          08 |
| Unknown / Processing      |          09 |

Other Realms (QiClients, QiProjects, etc.) can assign orbit codes dynamically per instance, e.g.:

```text
QiClients:
  Luis       -> OO = 01
  Blanca     -> OO = 02
  ZJK        -> OO = 03
  DogWalking -> OO = 04
```

These mappings are stored in `QiSystem/schema/orbits.*`.

---

## 5. System Codes (`SS`)

Systems are shared across Realms. Sample core system codes:

| System         | Code (`SS`) |
| -------------- | ----------: |
| Journal        |          01 |
| Tasks          |          02 |
| Docs           |          03 |
| Events         |          04 |
| Timeline       |          05 |
| Knowledge      |          06 |
| Media          |          07 |
| Exhibits       |          08 |
| Threads        |          09 |
| Memory-Fact    |          10 |
| Memory-Event   |          11 |
| Memory-Insight |          12 |
| Memory-Plan    |          13 |
| Memory-Link    |          14 |
| Memory-Config  |          15 |

This table can grow, but codes are stable once assigned.

**Note:** Memory-* systems (10-15) are used by Gina to store AI-generated memories, insights, and summaries. They follow the same QiNode schema as user-created nodes.

---

## 6. Sequence Number (`NNN`)

`NNN` is a simple, zero-padded integer sequence **unique per (Realm, Orbit, System)**.

Example generation rule:

* For QiOne → Work & Career → Journal:

  * First QiNode: `1.02.01.001`
  * Second QiNode: `1.02.01.002`
  * etc.

* For QiClients → Luis → Docs:

  * First QiNode: `2.01.03.001`
  * Second QiNode: `2.01.03.002`

This keeps QiD human-readable while allowing chronological sorting.

---

## 7. Chunk and Variant Suffixes

When a QiNode is broken into chunks (for embeddings, partial views, etc.), optional suffixes MAY be used:

```text
R.OO.SS.NNNcCC
```

Where:

* `c` is a literal character
* `CC` is a chunk index (e.g., `01`, `02`)

Example:

* `1.02.01.007c01` – first chunk of QiNode `1.02.01.007`
* `1.02.01.007c02` – second chunk

Variants (AI summaries, translations, derived forms) can use additional suffix patterns (e.g., `-v1`, `-en`, `-ps`) but the base QiD always refers to the *parent* QiNode.

---

## 8. QiD Generation Rules

1. Determine Realm (`R`).
2. Resolve or assign Orbit code (`OO`).
3. Determine System code (`SS`).
4. Look up the latest sequence `NNN` for `(R, OO, SS)` and increment by 1.
5. Assemble `QiD = "R.OO.SS.NNN"`.
6. Persist QiD in the QiNode front matter and index records.

QiD is **never recycled**, even if nodes are archived or deleted.

---

## 9. Usage

* All linking between QiNodes uses QiD as the primary key.
* Entanglement fields store QiD references:

  * `entanglement.origin_qid`
  * `entanglement.influence_qid`
  * `entanglement.companion_qid`
* Vector indexes store `qid` alongside embeddings for retrieval.
* Exports (e.g., .zip vaults) preserve QiD in filenames and front matter for re-import.

