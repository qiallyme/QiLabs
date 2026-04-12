---
title: "QiMultiverse Tree"
qi_realm: QiSystem
qi_orbit: Architecture
qi_system: Schema
qi_decimal: 5.01.02.01
type: structure
version: 1.0.0
---

# QiMultiverse Tree

This document defines the canonical **directory and conceptual tree** for QiNote.

---

## 1. Conceptual Hierarchy

QiNote uses a five-level conceptual hierarchy:

1. **QiMultiverse** – all universes
2. **QiRealm** – fixed universes (identity boundaries)
3. **QiOrbit** – contextual domains within a realm
4. **QiSystem** – structural/behavioral categories
5. **QiNode / QiBit** – atomic units of content

In notation:

```text
QiMultiverse
  └─ QiRealm
       └─ QiOrbit
             └─ QiSystem
                   └─ QiNode / QiBit
```

---

## 2. Canonical Realms

The QiMultiverse contains exactly six Realms:

* `QiOne`       – Personal universe
* `QiClients`   – All client universes
* `QiProjects`  – Projects and ventures
* `QiArchive`   – Cold storage universe
* `QiSystem`    – Internal schemas, configs, logs
* `QiExternal`  – Imports, scraped data, external mirrors

---

## 3. Filesystem Layout (Canonical Root Tree)

At the filesystem level:

```text
QiMultiverse/
├── QiOne/
│   ├── 1_Self-Health/
│   ├── 2_Work-Career/
│   ├── 3_Home-Environment/
│   ├── 4_Relationships-Community/
│   ├── 5_Spiritual-Metaphysical/
│   ├── 6_Finances-Security/
│   ├── 7_Learning-Ideas/
│   ├── 8_Projects-Goals/
│   └── 9_Unknown-Processing/
│
├── QiClients/
│   ├── _templates/               # optional standard client orbit templates
│   ├── Luis/
│   ├── Blanca/
│   ├── ZJK/
│   ├── DogWalking/
│   └── _other/
│
├── QiProjects/
│   ├── _templates/
│   ├── Lumara/
│   ├── QiNote/
│   ├── QiSuite/
│   ├── 713Series/
│   └── Innovahire/
│
├── QiArchive/
│   ├── 2025/
│   ├── 2024/
│   ├── 2023/
│   └── pre-2023/
│
├── QiSystem/
│   ├── schema/
│   ├── embeddings/
│   ├── configs/
│   └── logs/
│
└── QiExternal/
    ├── imports/
    └── raw/
```

---

## 4. QiOne Orbits (Fixed)

Inside `QiOne/`:

```text
QiOne/
├── 1_Self-Health/
├── 2_Work-Career/
├── 3_Home-Environment/
├── 4_Relationships-Community/
├── 5_Spiritual-Metaphysical/
├── 6_Finances-Security/
├── 7_Learning-Ideas/
├── 8_Projects-Goals/
└── 9_Unknown-Processing/
```

Each Orbit can internally group by **QiSystem** if needed:

Example:

```text
QiOne/2_Work-Career/
├── Tasks/
├── Journal/
├── Docs/
└── Timeline/
```

The app may implement these as virtual groupings, but the conceptual mapping remains.

---

## 5. QiClients Realm

Each client is represented as a QiOrbit inside `QiClients/`:

```text
QiClients/
├── Luis/
│   ├── Tasks/
│   ├── Docs/
│   ├── Timeline/
│   └── Exhibits/
├── Blanca/
│   ├── Tasks/
│   ├── Docs/
│   └── Tax/
└── ZJK/
    ├── Asylum/
    ├── Evidence/
    ├── Timeline/
    └── SupportLetters/
```

Orbits in `QiClients` are user-defined and can be created freely.

---

## 6. QiProjects Realm

Each project is an Orbit inside `QiProjects/`:

```text
QiProjects/
├── QiNote/
│   ├── Docs/
│   ├── Dev/
│   ├── UX/
│   ├── Roadmap/
│   └── Timeline/
└── Lumara/
    ├── Strategy/
    ├── UX/
    ├── Funnels/
    └── Media/
```

---

## 7. QiSystem Realm

The `QiSystem/` realm contains:

* Schema definitions
* QiNode and QiD specifications
* App configs and logs
* Internal metadata

It is not a user content realm. It is the **OS layer** of QiNote.

---

## 8. QiExternal & QiArchive

* **QiExternal** – temporary imports, raw scraped content, untrusted or external mirrors.
* **QiArchive** – historical or inactive QiNodes, organized by time.

These realms keep the active graph clean while preserving history and external reference material.

---

This tree is the **canonical starting structure** for implementing the QiNote application and storage model.

