---
title: QID CLI — Developer Documentation
category: tooling
keywords: [qid, qiid, cli, desktop-wrapper, portability, bands, registry, logging, windows, shortcuts, atomic-write]
project_context: QID issuance + stamping tool for portable, document-heavy workflows (cases, binders, evidence, translations, exhibits)
date: 2025-12-30
---

## 0) Executive Summary

**QID CLI** is a stdlib-only Python tool that issues **banded 7-digit root IDs** and **per-root child IDs**, stamps YAML front matter into Markdown files, and maintains a **local, auditable registry** with **locking + atomic writes** to prevent corruption.

You want three upgrades:

1. **Lightweight desktop UI wrapper** (frictionless, minimal).
2. **Shortcut creation script + branded icon**.
3. **Timestamped activity log** (debuggable, reviewable) + **redundancy** for portable “zip-and-send” use across computers **without losing IDs**.

This document specifies a design that keeps the project **portable**, **auditable**, and **dependency-free at runtime**.

---

## 1) Core Requirements

### Functional
- Issue new **root IDs** using **bands** (chart-of-accounts style).
- Issue new **child IDs** under existing roots.
- Stamp a Markdown file with YAML front matter:
  - `qid_root`, `qid`, `created`, `created_at`, optional `band`, `title`, `path`.
- Verify integrity:
  - Detect duplicate QIDs
  - Validate formatting
  - Confirm registry/state consistency
- List registry in a human-readable format.

### Non-Functional
- **No third-party dependencies** at runtime (stdlib-only).
- **Portable distribution**: can be zipped, emailed, unzipped, and run on another machine **without missing a step** or reusing a QID.
- **Durable storage**:
  - file locking
  - atomic writes
  - backups + redundancy
- **Desktop UX**: minimal UI wrapper that reduces friction for non-CLI use.
- **Logging**: time-stamped event logs sufficient to reconstruct what happened.

---

## 2) Data Model

### 2.1 ID Model
- **Root**: `qid#######_0` (7-digit root integer, padded)
  - Example: `qid0000001_0`
- **Child**: `qid#######-N` where `N >= 1`
  - Example: `qid0000001-1`

### 2.2 Bands (Root Ranges)
Bands are applied **only** when issuing a **new root**.

Recommended ranges (root integer, inclusive):

- SYSTEM:    0000001–0099999
- PERSONAL:  0100000–0199999
- ORG:       0200000–0399999
- CLIENT:    0400000–0899999
- KNOWLEDGE: 0900000–1199999
- ASSETS:    1200000–1499999
- PRODUCT:   1500000–1799999
- RESERVED:  1800000–1999999

Archive is **not** a band. Archived items keep their original QID.

---

## 3) Storage Layout (Portable Workspace)

At the repo/app root:

```

qid.py
_qid_state.json
_qid_registry.json
_qid_registry.lock

_logs/
qid_activity.jsonl
qid_errors.log

_backups/
daily/
2025-12-30/
_qid_state.json
_qid_registry.json
rolling/
state.prev.json
registry.prev.json

_wal/
qid_wal.jsonl

_assets/
qid.ico
qid.png

desktop/
qid_launcher.bat
create_shortcut.ps1
create_shortcut.vbs

````

Notes:
- `_logs/` and `_backups/` are critical to “portable + debuggable”.
- `_wal/` is optional but strongly recommended for redundancy.

---

## 4) Reliability & Concurrency Guarantees

### 4.1 Locking

- Lock file: `_qid_registry.lock`
- Purpose: prevent two running instances from issuing roots simultaneously and corrupting counters.

### 4.2 Atomic Writes

All writes to `_qid_state.json` and `_qid_registry.json` must be:
1. written to a temp file (same directory),
2. flushed + fsync,
3. atomically renamed over the original.

This prevents partial writes and broken JSON if the program crashes mid-write.

### 4.3 Backward-Compatible Schema Migration

The tool must be able to open older state formats and upgrade in-place:
- Migrate `next_root_seq` → banded `next_seq`.
- Ensure `root_digits`, `default_band`, and `bands` exist.
- Ensure each registry entry has:
  - `root_id`, `root_int`, `band`, `next_child`, `created_at`, `status`, `title`, `path`.

---

## 5) Redundancy Strategy (So You Don’t Lose QIDs)

This is the part that actually makes “zip-and-send” safe.

### 5.1 Write-Ahead Log (WAL) — Recommended
Before writing state/registry changes, append a WAL event:

- file: `_wal/qid_wal.jsonl`
- format: one JSON object per line
- includes: event_id, time, op, old_state_hash, new_state_hash, root issued, child issued, target path, etc.

If the tool crashes, you can replay/inspect WAL to confirm the last issued ID.

### 5.2 Rolling Previous Copies — Mandatory

Every successful write creates a rolling backup copy:
- `_backups/rolling/state.prev.json`
- `_backups/rolling/registry.prev.json`

If the active JSON gets corrupted, you recover from `.prev`.

### 5.3 Daily Snapshots — Mandatory

At first write operation each day, snapshot both files to:
- `_backups/daily/YYYY-MM-DD/_qid_state.json`
- `_backups/daily/YYYY-MM-DD/_qid_registry.json`

This protects you from “oops, I broke it yesterday.”

### 5.4 Verification on Startup — Recommended

On each run:
- confirm JSON parses
- confirm counters are in-band
- confirm registry **has** no duplicate roots
- if parse fails, auto-restore from `.prev` and log an error.

---

## 6) Logging Spec (Activity + Debugging)

### 6.1 Activity Log (Primary)
- file: `_logs/qid_activity.jsonl`
- append-only
- each line is a JSON record

Minimum fields:

- `ts` (ISO 8601 w/ timezone offset)
- `user` (optional)
- `host` (computer name)
- `op` (init | new_root | new_child | stamp | verify | list | repair | restore)
- `band` (if relevant)
- `root_id` (if relevant)
- `child_id` (if relevant)
- `path` (if relevant)
- `result` (ok | error)
- `details` (freeform dict)
- `state_hash` (optional checksum)
- `registry_hash` (optional checksum)

Example:
```json
{"ts":"2025-12-30T19:12:33-06:00","host":"CODY-PC","op":"new_root","band":"CLIENT","root_id":"qid0400000_0","result":"ok","details":{"title":"rle","path":"./c.rle"}}
````

### 6.2 Error Log (Secondary)

* file: `_logs/qid_errors.log`
* simple text, includes stack traces.

### 6.3 Why JSONL?

* easy grep
* easy parse
* easy to recover/repair

---

## 7) Desktop Wrapper (Light + Frictionless)

You asked for “very light UI.” The best option that stays **stdlib-only** is:

### Option A: Tkinter Wrapper (Recommended)

* Tkinter is included with most Python Windows installs and is stdlib.
* Provides a minimal window with:

  * buttons for: Stamp / New Root / New Child / List / Verify
  * a textbox area to show results
  * a file picker for selecting markdown files
* The wrapper calls the same internal functions as CLI (no duplication).

**Pros**

* No extra dependencies
* Easy to use for non-CLI
* Still portable

**Cons**

* Tkinter may not be present in some “barebones” Python installs.

  * If you distribute a portable Python runtime (see Section 8), you control this.

### Option B: HTML UI via Localhost (Not Recommended Here)

Requires a web server framework or more code; defeats “light and stdlib-only” goal.

---

## 8) Portability Strategy (Zip → Email → Unzip → Run)

You have two viable portability modes. Pick one as the “official” one.

### Mode 1 — Requires Python Installed (Simplest)

Bundle includes:

* `qid.py`, state/registry, launcher scripts, icon.

User needs:

* Python 3.11+ installed on the target machine.

Run:

* double-click `qid_launcher.bat` (or run `python qid.py`).

### Mode 2 — Fully Portable (Recommended for “no missing step”)

Bundle includes a **portable Python runtime**.

On Windows, use the official **Python embeddable distribution** (zip).
Structure:

```
QID_CLI_PORTABLE/
  python/
    python.exe
    python311.dll
    ...
  app/
    qid.py
    _qid_state.json
    _qid_registry.json
    ...
  qid_launcher.bat
  _assets/qid.ico
```

`qid_launcher.bat` runs:

* `.\python\python.exe .\app\qid.py`

**Pros**

* Works on machines without Python installed.
* Truly “unzip and go.”

**Cons**

* Larger zip.

---

## 9) Shortcut Creation + Icon Branding (Windows)

### 9.1 Goal

One command to create a desktop shortcut that:

* points to `qid_launcher.bat` (or an exe if you later package)
* uses `qid.ico`
* sets “Start in” to the app folder (critical for writing registry correctly)

### 9.2 Implementation (Most Reliable)

Use a small VBScript (works without policies that block PS1):

`desktop/create_shortcut.vbs`:

* Creates `.lnk` in `%USERPROFILE%\Desktop`
* Target: `qid_launcher.bat`
* Icon: `_assets\qid.ico`
* Working directory: app root

Also provide optional PowerShell script `create_shortcut.ps1` for developers.

### 9.3 Working Directory Requirement (Non-Negotiable)

If the shortcut does not set “Start in,” the app can write state/registry somewhere else and “lose IDs.”
The shortcut must set it explicitly.

---

## 10) CLI + UI Flows

### 10.1 New Root (Band Pick)

* Prompt for title
* Prompt for band (default ORG)
* Issue root:

  * take `state["next_seq"][band]`
  * validate in range
  * assign `root_id = qid{root_int:07d}_0`
  * create registry entry with `next_child=1`
  * increment `state["next_seq"][band] += 1`
  * write WAL + atomic save + backups + log event

### 10.2 New Child

* Ask for base root (either `qid#######` or `qid#######_0`)
* Lookup registry entry
* `child_id = qid#######-{next_child}`
* increment next_child
* WAL + atomic save + backups + log event

### 10.3 Stamp

* Select file
* If YAML contains qid already:

  * require explicit confirmation to replace
* Ask: new root or existing root?

  * if new root: infer band from path (and/or ask)
  * stamp root or child depending on choice
* Backup file to `.bak`
* Inject YAML front matter (or update existing front matter)
* Log event includes file path and resulting qid

### 10.4 Verify

* Walk markdown files
* Validate any qid fields
* Find duplicates
* Confirm every registry root is unique and band-valid
* Print report + log results

---

## 11) Security / Safety Notes (Practical)

* The tool is not handling secrets; registry/logs should not contain payment card info or sensitive PII.
* You may want a `--redact` mode for logs if stamping documents that include personal data in paths/titles.

---

## 12) Deliverables To Implement Next

### 12.1 Code Changes (qid.py)

* Add logging functions:

  * `log_event(op, result, **fields)`
* Add redundancy:

  * rolling prev backups
  * daily snapshots
  * optional WAL
* Add Tkinter UI entry point:

  * `python qid.py ui` launches window
* Ensure the app uses a stable “workspace root”:

  * default to directory of `qid.py`
  * not CWD (unless explicitly set)

### 12.2 Desktop Wrapper Files

* `desktop/qid_launcher.bat`
* `desktop/create_shortcut.vbs`
* `_assets/qid.ico`

### 12.3 Packaging Layout

* Choose Mode 1 or Mode 2 (portable python embedded)
* Provide `DIST_README.md` with unzip/run steps

---

## 13) Testing Plan (Minimum Viable)

1. Initialize workspace → ensure state has `next_seq` for all bands
2. Issue root in CLIENT band → verify increment and persistence
3. Issue child twice → confirm per-root increment
4. Stamp markdown file → YAML written, `.bak` created
5. Crash simulation:

   * interrupt mid-write (kill process) and confirm state/registry recoverable from `.prev`
6. Copy zip to another folder/computer → issue root → verify no duplicates

---

## 14) Operational Rules (QID Rules)

1. **IDs are never reused.**
2. **IDs never change once issued.**
3. Root IDs are sequential *within their band*.
4. Child IDs increment *within the root*.
5. Archive is a state/location, not an ID class.
6. Do not hand-edit `_qid_state.json` or `_qid_registry.json` unless you are repairing from backups—and if you do, log it.

---

## 15) “Portable Without Missing a QID” — The Only Real Risk

Your biggest risk is not the tool. It’s human behavior:

* copying just `qid.py` but not `_qid_state.json` / `_qid_registry.json`
* launching from the wrong working directory and creating a second registry elsewhere

Mitigation:

* always launch from `qid_launcher.bat` which sets working directory
* always package with state/registry and backups
* on startup, show the workspace path + confirm files exist
* optionally display a “Workspace Fingerprint” (hash of state+registry) in the UI

---

# Appendix A — Suggested Repo Layout (Clean)

```
qid-cli/
  app/
    qid.py
    _qid_state.json
    _qid_registry.json
    _qid_registry.lock
    _logs/
    _backups/
    _wal/
  desktop/
    qid_launcher.bat
    create_shortcut.vbs
    create_shortcut.ps1
  _assets/
    qid.ico
    qid.png
  README.md
  DEV_DOC.md
  requirements.txt
  pyproject.toml
  .gitignore
```

---

# Appendix B — Minimal Desktop UX Spec (Tkinter)

Window Title: “QiID Manager”

Controls:

* [Stamp File…]
* [New Root…] (band dropdown)
* [New Child…] (root input)
* [List Registry]
* [Verify]
* Output console panel
* Status bar: workspace path + last issued QID

---

# Appendix C — Portable Shortcut Strategy

* Shortcut target: `desktop/qid_launcher.bat`
* Start in: `<unzipped_root>\app`
* Icon: `<unzipped_root>\_assets\qid.ico`

This ensures state/registry always resolve correctly.

---

```

## Next step (so we actually execute this)
If you want, paste your current `qid.py` back in here (or upload it again after your last patch), and I’ll implement the three upgrades in the codebase:
- logging (JSONL + error log),
- redundancy (rolling prev + daily snapshots + optional WAL),
- `ui` command (Tkinter wrapper),
and I’ll package it as a portable zip structure aligned with the layout above.
```