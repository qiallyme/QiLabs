---
title: "Laws of Qi"
qi_realm: QiSystem
qi_orbit: Doctrine
qi_system: Schema
qi_decimal: 5.01.01.01
type: doctrine
version: 1.0.0
---

# The Laws of Qi

These are the foundational rules that govern the QiNote Multiverse. They are **immutable**.

---

## Law 0 – The QiMultiverse Exists

- The **QiMultiverse** is the complete collection of all universes (Realms) a user can exist in.
- Nothing exists outside the QiMultiverse.
- All structure, data, and behavior are contained within it.

---

## Law 1 – Realms Are Cosmic, Fixed, Immutable

- A **QiRealm** is a foundational universe that defines identity, boundaries, and permissions.
- Realms cannot be:
  - created
  - duplicated
  - renamed
  - deleted
- Canonical Realms:

  1. **QiOne** — personal universe (self, life, story)
  2. **QiClients** — client universes
  3. **QiProjects** — project and venture universes
  4. **QiArchive** — cold storage universe
  5. **QiSystem** — internal schemas, config, logs
  6. **QiExternal** — imports, scraped data, external sources

---

## Law 2 – Realms Contain QiOrbits

- A **QiOrbit** is a contextual gravitational field within a Realm.
- Orbits encode meaning and life-domain context.
- Orbits may vary per Realm, except **QiOne**, whose orbits are fixed.

**QiOne has exactly nine Orbits:**

1. Self & Health  
2. Work & Career  
3. Home & Environment  
4. Relationships & Community  
5. Spiritual & Metaphysical  
6. Finances & Security  
7. Learning & Ideas  
8. Projects & Goals  
9. Unknown / Processing  

These nine Orbits are permanent and define the dimensionality of the personal universe.

Other Realms (QiClients, QiProjects, etc.) define their own Orbits.

---

## Law 3 – Orbits Contain QiSystems

- A **QiSystem** defines how QiNodes behave (their structural type or workflow).
- Systems represent behavioral categories such as:

  - Tasks
  - Journal
  - Docs
  - Events
  - Timeline
  - Knowledge
  - Media
  - Exhibits
  - Threads
  - Workflows

- Systems are reusable patterns shared across Realms and Orbits.
- Orbits = *meaning*; Systems = *behavior*.

---

## Law 4 – QiNodes & QiBits Are the Atomic Units

- Everything inside QiNote is represented as a **QiNode** or **QiBit**.

  - **QiBit** – smallest atomic unit (e.g., a chunk, capture, or minimal note).
  - **QiNode** – a semantic, user-facing node (a note, record, document, event).

- Every QiNode/QiBit MUST have:

  - `QiD` (QiDecimal ID) – immutable identity
  - Realm (QiRealm)
  - Orbit (QiOrbit)
  - System (QiSystem)
  - Entanglement:
    - Origin (Why)
    - Influence (How)
    - Companion (Parallel)
  - Timestamp metadata
  - Indexing metadata (chunk ids, embedding ids)
  - Source metadata (files, transcripts, external references) as applicable

---

## Law 5 – Entanglement Is Limited to Triads

- Every QiNode maintains exactly three relational anchors:

  - **Origin** – the cause, parent, or prior node that sparked this node.
  - **Influence** – the future node, result, or outcome influenced by this node.
  - **Companion** – a parallel, sibling, or associative node.

- This **Triadic Entanglement** maintains graph clarity and prevents "link spaghetti".
- Loops and complex structures emerge from many triads, not unbounded linking.

---

## Law 6 – QiDecimal (QiD) Is Permanent Identity

- Each QiNode/QiBit is assigned a **QiDecimal ID (QiD)** at creation.
- QiD:

  - is immutable
  - never re-used
  - is unique within the QiMultiverse
  - encodes Realm, Orbit, System, and sequence
  - is short, human-readable, and pronounceable ("QiD" ~ "Kid")

- QiD is used for:

  - indexing
  - linking
  - RAG retrieval
  - exports/imports
  - conflict resolution

---

## Law 7 – RAG & Indexing Are Native to QiNote

- QiNote is a **local-first AI knowledge base** with built-in RAG.
- Every QiNode:

  - can be chunked for embeddings
  - can be embedded as vectors
  - can be searched semantically
  - participates in RAG responses

- Embedding and indexing are default behaviors, not optional add-ons.

---

## Law 8 – The QiGraph Is the Source of Truth

- The **QiGraph** is the logical representation of the Multiverse:

  - Nodes = Realms, Orbits, Systems, QiNodes/QiBits
  - Edges = entanglement and structural relations

- The QiGraph underlies:

  - 2D and 3D visualization
  - search and RAG
  - timelines
  - insights and pattern discovery

- All interfaces (note view, timeline, tables, graph) are projections of the same underlying QiGraph.

---

These Laws constitute the **QiEOS** for the QiNote system. All other design decisions MUST align with them.

