import os, sys, json, yaml, argparse
from datetime import datetime

ROOT = os.path.abspath(".")
REG_PATH = os.path.join(ROOT, "data", "sheets", "readme_registry_v1.yaml")
README_NAME = "_readme.md"

def load_registry():
    if not os.path.exists(REG_PATH):
        print(f"Registry not found: {REG_PATH}")
        sys.exit(1)
    with open(REG_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def now_iso():
    return datetime.now().strftime("%Y-%m-%d")

def slugify(name: str):
    return name.lower().replace(" ", "_")

def render_readme(folder_key, folder_path, spec):
    created = now_iso()
    folder_title = spec.get("title", folder_key)
    folder_slug = slugify(folder_key)
    qi_decimal = spec.get("qi_decimal", "")
    realm_slug = "qios"

    purpose = spec.get("purpose", "TODO")
    what_belongs = "\n".join([f"- {x}" for x in spec.get("what_belongs", ["TODO"])])
    what_not = "\n".join([f"- {x}" for x in spec.get("what_not", ["TODO"])])
    related = "\n".join([f"- {x}" for x in spec.get("related", ["TODO"])])
    rules = "\n".join([f"- {x}" for x in spec.get("rules", ["TODO"])])
    naming_notes = spec.get("naming_notes", "TODO")
    examples = "\n".join([f"- `{x}`" for x in spec.get("examples", ["TODO"])])
    used_by = "\n".join([f"- {x}" for x in spec.get("used_by", ["TODO"])])

    return f"""---
title: "{folder_title} README"
slug: "{folder_slug}_readme"
realm: QiOS
realm_slug: "{realm_slug}"
qi_decimal: "{qi_decimal}"
qid:
type: doc
node: file
keywords: ["README","QiOS","folder"]
tags: ["README","QiOS","governance"]
context: "QiOS folder documentation"
created: {created}
updated: {created}
version: "1.0.0"
status: canonical
system: qios
naming_strategy: slug_only
sort: 0
related: []
parents: []
children: []
siblings: []
references: []
graph_weight: 5
orbit: inner
entangled: []
summary:
sensitivity: internal
classification: business_internal
---

## Purpose
{purpose}

## What Belongs Here
{what_belongs}

## What Does NOT Belong Here
{what_not}

## Related Realms / Systems
{related}

## Governing Rules
{rules}

## Naming & Metadata Notes
{naming_notes}

## Examples
{examples}

## Used By (Workers / Apps / Workflows)
{used_by}

## Change Log
- {created}: README created.
"""

def ensure_readme(folder_key, folder_path, spec):
    readme_path = os.path.join(folder_path, README_NAME)
    if os.path.exists(readme_path):
        return False

    content = render_readme(folder_key, folder_path, spec)
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(content)
    return True

def walk_roots(registry):
    created = 0
    missing_specs = []

    for folder_key, spec in registry.get("folders", {}).items():
        folder_path = os.path.join(ROOT, folder_key)
        if not os.path.isdir(folder_path):
            print(f"[skip] folder not found on disk: {folder_key}/")
            continue

        if ensure_readme(folder_key, folder_path, spec):
            created += 1
            print(f"[created] {folder_key}/{README_NAME}")

    # Also create stubs for any root folders not in registry
    roots_on_disk = [d for d in os.listdir(ROOT) if os.path.isdir(os.path.join(ROOT, d)) and not d.startswith(".")]
    for d in roots_on_disk:
        if d not in registry.get("folders", {}):
            missing_specs.append(d)
            spec = {"title": d, "purpose": "TODO: add to readme_registry_v1.yaml"}
            ensure_readme(d, os.path.join(ROOT, d), spec)

    return created, missing_specs

def main():
    parser = argparse.ArgumentParser(description="QiOS README Generator")
    parser.add_argument("--yes", "-y", action="store_true", help="Skip confirmation prompt")
    args = parser.parse_args()
    
    registry = load_registry()
    print("QiOS README Generator v1.0")
    print(f"Root: {ROOT}")
    print(f"Registry: {REG_PATH}\n")

    if not args.yes:
        go = input("Create missing _readme.md files now? (y/n): ").strip().lower()
        if go != "y":
            print("Aborted.")
            return
    else:
        print("Running in non-interactive mode...")

    created, missing = walk_roots(registry)
    print(f"\nDone. Created {created} READMEs.")

    if missing:
        print("\nRoots missing in registry (stubs created):")
        for m in missing:
            print(f" - {m}/")
        print("Add these to readme_registry_v1.yaml when ready.")

if __name__ == "__main__":
    main()
