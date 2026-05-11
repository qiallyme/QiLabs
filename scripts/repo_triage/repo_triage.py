#!/usr/bin/env python3
# file: repo_triage.py
# purpose: Audit and lightly clean the QiOS monorepo without deleting source files.
# usage: python scripts/repo_triage/repo_triage.py
# inputs: Repository root as current working directory.
# outputs: docs/repo_dirs_DATE.txt, docs/repo_files_DATE.txt, _quarantine/
# safety: Does not delete source files. Moves obvious junk into _quarantine/.
# owner: QiLabs

from pathlib import Path
import shutil
from datetime import date

ROOT = Path.cwd()
TODAY = date.today().isoformat()

QUARANTINE = ROOT / "_quarantine"
DOCS = ROOT / "docs"
DOCS.mkdir(exist_ok=True)
QUARANTINE.mkdir(exist_ok=True)

# 1. Save repo inventory
dirs_out = DOCS / f"repo_dirs_{TODAY}.txt"
files_out = DOCS / f"repo_files_{TODAY}.txt"

ignore_parts = {
    ".git",
    "node_modules",
    ".pnpm-store",
    "_quarantine",
}

def should_skip(path: Path) -> bool:
    return any(part in ignore_parts for part in path.parts)

dirs = sorted(
    str(p.relative_to(ROOT))
    for p in ROOT.rglob("*")
    if p.is_dir() and not should_skip(p)
)

files = sorted(
    str(p.relative_to(ROOT))
    for p in ROOT.rglob("*")
    if p.is_file() and not should_skip(p)
)

dirs_out.write_text("\n".join(dirs), encoding="utf-8")
files_out.write_text("\n".join(files), encoding="utf-8")

# 2. Quarantine obvious junk
junk_names = [
    "tmp",
    ".pytest_cache",
    ".ruff_cache",
    ".mypy_cache",
]

junk_prefixes = [
    "tmp_",
]

moved = []

for item in ROOT.iterdir():
    if item.name in junk_names or any(item.name.startswith(prefix) for prefix in junk_prefixes):
        dest = QUARANTINE / item.name
        if dest.exists():
            dest = QUARANTINE / f"{item.name}_{TODAY}"
        shutil.move(str(item), str(dest))
        moved.append(f"{item.name} -> {dest.relative_to(ROOT)}")

# 3. Harden .gitignore without nuking existing content
gitignore = ROOT / ".gitignore"
existing = gitignore.read_text(encoding="utf-8") if gitignore.exists() else ""

block = """
# --- QiOS repo hygiene ---
node_modules/
.pnpm-store/

.env
.env.*
!.env.example

.pytest_cache/
.ruff_cache/
.mypy_cache/
__pycache__/
*.pyc

dist/
build/
.next/
.vite/

tmp/
tmp_*/
_quarantine/

*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*

.DS_Store
Thumbs.db
.vscode/
.idea/
# --- end QiOS repo hygiene ---
""".strip()

if "QiOS repo hygiene" not in existing:
    gitignore.write_text(existing.rstrip() + "\n\n" + block + "\n", encoding="utf-8")

# 4. Create run-me-first doc if missing
runbook = DOCS / "000_RUN_ME_FIRST.md"
if not runbook.exists():
    runbook.write_text(
        """# QiOS Master Repo

This repository is the source-of-truth workspace for QiLabs systems.

## Folder Rules

1. Apps live in `/apps`.
2. Shared code lives in `/packages`.
3. Static/public sites live in `/sites`.
4. Supabase assets live in `/supabase`.
5. Cloudflare/workers live in `/workers`.
6. Infrastructure lives in `/infra`.
7. Scripts live in `/scripts`.
8. Documentation lives in `/docs`.
9. Temporary/generated files do not belong in git.
10. Secrets never belong in git.

## Active Systems

- QiAccess
- qiserver
- QiNote
- FamilyOS
- Lumara
- IND Loop
- EmpowerQNow
- Open WebUI
- Ollama
- AnythingLLM

## Cleanup Rule

Do not delete source files during cleanup passes. Move suspicious junk into `_quarantine/` first.
""",
        encoding="utf-8",
    )

# 5. Package manager check
lockfiles = {
    "package-lock.json": (ROOT / "package-lock.json").exists(),
    "pnpm-lock.yaml": (ROOT / "pnpm-lock.yaml").exists(),
    "yarn.lock": (ROOT / "yarn.lock").exists(),
    "pnpm-workspace.yaml": (ROOT / "pnpm-workspace.yaml").exists(),
}

print("\nRepo triage complete.")
print(f"Inventory written to: {dirs_out} and {files_out}")

if moved:
    print("\nMoved to quarantine:")
    for line in moved:
        print(f" - {line}")
else:
    print("\nNo obvious root-level junk moved.")

print("\nLockfile check:")
for name, exists in lockfiles.items():
    print(f" - {name}: {'FOUND' if exists else 'not found'}")

if lockfiles["package-lock.json"] and lockfiles["pnpm-lock.yaml"]:
    print("\nWARNING: Both package-lock.json and pnpm-lock.yaml exist. Pick one package manager. For this repo, probably pnpm.")

print("\nNext: run `git status` and review changes before committing.")