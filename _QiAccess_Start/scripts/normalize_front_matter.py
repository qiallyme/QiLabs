#!/usr/bin/env python3
"""
Normalize Markdown front matter to the canonical field order defined in
standards/content_metadata_profile.yaml.

What it does:
- reads YAML front matter at the top of .md files
- reorders keys according to the profile's field_order
- groups keys by section with blank lines between groups
- validates required fields based on layout
- flags retired or unknown fields
- can check-only or rewrite in place

Notes:
- comments inside front matter are not preserved
- body content is preserved
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Any

import yaml


PROFILE_DEFAULT = Path("standards/content_metadata_profile.yaml")


def load_yaml(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def extract_front_matter(text: str) -> Tuple[dict | None, str]:
    """
    Return (front_matter_dict_or_none, remaining_body).
    Only supports YAML front matter at the very top of the file.
    """
    if not text.startswith("---\n"):
        return None, text

    parts = text.split("\n---\n", 1)
    if len(parts) != 2:
        return None, text

    fm_raw = parts[0][4:]  # strip leading "---\n"
    body = parts[1]

    try:
        data = yaml.safe_load(fm_raw) or {}
        if not isinstance(data, dict):
            return None, text
        return data, body
    except yaml.YAMLError:
        return None, text


def build_section_map(profile: dict) -> Dict[str, List[str]]:
    fields = profile.get("fields", {})
    sections = profile.get("sections", [])
    section_order = [s["id"] for s in sorted(sections, key=lambda s: s.get("order", 999))]
    section_map: Dict[str, List[str]] = {sid: [] for sid in section_order}

    for field_name in profile.get("field_order", []):
        meta = fields.get(field_name, {})
        section_id = meta.get("section")
        if section_id in section_map:
            section_map[section_id].append(field_name)

    return section_map


def validate_front_matter(front_matter: dict, profile: dict) -> List[str]:
    errors: List[str] = []
    retired_fields = set(profile.get("retired_fields", []))
    defined_fields = set(profile.get("fields", {}).keys())

    for key in front_matter:
        if key in retired_fields:
            errors.append(f"retired field present: {key}")
        elif key not in defined_fields:
            errors.append(f"unknown field present: {key}")

    layout = front_matter.get("layout")
    if not layout:
        errors.append("missing required field: layout")
        return errors

    layouts = profile.get("layouts", {})
    required = layouts.get(layout, {}).get("required", [])
    for key in required:
        value = front_matter.get(key)
        if value is None or value == "" or value == []:
            errors.append(f"missing required field for layout={layout}: {key}")

    return errors


def order_front_matter(front_matter: dict, profile: dict) -> List[Tuple[str, Any]]:
    ordered: List[Tuple[str, Any]] = []
    field_order = profile.get("field_order", [])
    seen = set()

    for key in field_order:
        if key in front_matter:
            ordered.append((key, front_matter[key]))
            seen.add(key)

    # Preserve unknown keys at the end so the script is not destructive.
    # Validation can still fail on them in check mode if you want.
    for key, value in front_matter.items():
        if key not in seen:
            ordered.append((key, value))

    return ordered


def split_into_section_blocks(
    ordered_items: List[Tuple[str, Any]], profile: dict
) -> List[List[Tuple[str, Any]]]:
    fields = profile.get("fields", {})
    section_map = build_section_map(profile)
    block_lookup: Dict[str, List[Tuple[str, Any]]] = {sid: [] for sid in section_map.keys()}
    trailing: List[Tuple[str, Any]] = []

    field_to_section = {
        field_name: meta.get("section")
        for field_name, meta in fields.items()
    }

    for key, value in ordered_items:
        section_id = field_to_section.get(key)
        if section_id in block_lookup:
            block_lookup[section_id].append((key, value))
        else:
            trailing.append((key, value))

    blocks = [items for items in block_lookup.values() if items]
    if trailing:
        blocks.append(trailing)
    return blocks


def yaml_scalar(value: Any) -> str:
    if isinstance(value, str):
        # Always quote strings for consistency and easier diffing.
        return yaml.safe_dump(value, default_flow_style=False, sort_keys=False).strip()
    return yaml.safe_dump(value, default_flow_style=False, sort_keys=False).strip()


def render_front_matter(front_matter: dict, profile: dict) -> str:
    ordered_items = order_front_matter(front_matter, profile)
    blocks = split_into_section_blocks(ordered_items, profile)

    lines: List[str] = ["---"]
    for block_idx, block in enumerate(blocks):
        for key, value in block:
            dumped = yaml_scalar(value)
            if "\n" not in dumped:
                lines.append(f"{key}: {dumped}")
            else:
                lines.append(f"{key}:")
                for subline in dumped.splitlines():
                    lines.append(f"  {subline}")
        if block_idx < len(blocks) - 1:
            lines.append("")
    lines.append("---")
    return "\n".join(lines)


def normalize_file(path: Path, profile: dict, check_only: bool = False) -> Tuple[bool, List[str]]:
    original = path.read_text(encoding="utf-8")
    front_matter, body = extract_front_matter(original)

    if front_matter is None:
        return False, ["no valid front matter found"]

    errors = validate_front_matter(front_matter, profile)
    rendered = render_front_matter(front_matter, profile)
    normalized = f"{rendered}\n{body if body.startswith(chr(10)) else body}"

    changed = normalized != original

    if not check_only and changed:
        path.write_text(normalized, encoding="utf-8")

    return changed, errors


def iter_markdown_files(paths: List[Path]) -> List[Path]:
    results: List[Path] = []
    for path in paths:
        if path.is_file() and path.suffix.lower() == ".md":
            results.append(path)
        elif path.is_dir():
            results.extend(sorted(path.rglob("*.md")))
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Normalize Markdown front matter.")
    parser.add_argument("paths", nargs="+", help="Markdown files or directories")
    parser.add_argument(
        "--profile",
        default=str(PROFILE_DEFAULT),
        help="Path to content_metadata_profile.yaml",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check only; do not rewrite files",
    )
    args = parser.parse_args()

    profile_path = Path(args.profile)
    if not profile_path.exists():
        print(f"ERROR: profile not found: {profile_path}", file=sys.stderr)
        return 2

    profile = load_yaml(profile_path)
    files = iter_markdown_files([Path(p) for p in args.paths])

    if not files:
        print("No markdown files found.")
        return 0

    had_errors = False
    had_changes = False

    for file_path in files:
        changed, errors = normalize_file(file_path, profile, check_only=args.check)

        if errors:
            had_errors = True
            print(f"[FAIL] {file_path}")
            for err in errors:
                print(f"  - {err}")
        else:
            status = "WOULD-FIX" if args.check and changed else "FIXED" if changed else "OK"
            print(f"[{status}] {file_path}")

        if changed:
            had_changes = True

    if args.check:
        if had_errors or had_changes:
            return 1
        return 0

    return 1 if had_errors else 0


if __name__ == "__main__":
    raise SystemExit(main())