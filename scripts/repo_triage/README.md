# Repo Triage

## Purpose

Audits the QiOS monorepo and performs safe first-pass hygiene without deleting source files.

## What It Does

- Writes repo directory inventory to `docs/`
- Writes repo file inventory to `docs/`
- Creates `_quarantine/`
- Moves obvious temp/cache folders into `_quarantine/`
- Appends repo hygiene rules to `.gitignore`
- Reports lockfile/package-manager conflicts

## What It Does Not Do

- Does not delete source files
- Does not inspect secret values
- Does not refactor apps
- Does not move active source folders

## Usage

```bash
python scripts/repo_triage/repo_triage.py

Run from the repository root.

Safety

This script is intended to be safe for first-pass cleanup. Review git status after running.


## Rule name

Call it:
```

```txt
Standalone Script Module Standard

Or more QiOS-flavored:

QSS-001 Standalone Script Module Standard
Put this in repo docs

Create:

docs/standards/QSS-001_standalone_script_module_standard.md

Core rule:

# QSS-001: Standalone Script Module Standard

Any script that can run independently must be treated as a documented tool.

## Requirements

Each standalone script must live in its own folder and include:

1. The executable script file.
2. A `README.md`.
3. A `manifest.yaml`.
4. A self-identifying intro comment at the top of the script.

## Required Folder Shape
```

```txt
scripts/
  tool_name/
    tool_name.ext
    README.md
    manifest.yaml
Required Script Header

The script must identify:

filename
purpose
usage
inputs
outputs
safety notes
owner/system
Purpose

This allows humans, Codex, AI agents, automation runners, and QiAccess to identify, understand, safely execute, and reuse scripts.


This is a good rule. Not bureaucracy — **machine-readable leverage**. It turns scripts into usable assets instead of disposable text files. Apply this rule to all future scripts, including:

- new scripts you write
- old scripts you touch
- scripts that Codex/Copilot/QiAccess help write
- migration scripts
- automation scripts
- local dev tools
- maintenance scripts
```