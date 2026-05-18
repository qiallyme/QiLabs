#!/usr/bin/env python3
r"""
qidrive_dedupe_interactive.py

Purpose:
    Safe, staged, interactive duplicate-file cleanup for a local Google Drive-synced folder.

Cody Rule:
    No raw command memorization required. Run the script once and follow prompts.

Core doctrine:
    1. Scan first.
    2. Build a manifest.
    3. Plan duplicate actions.
    4. Review the plan.
    5. Quarantine duplicates by moving them, preserving original folder structure.
    6. Never permanently delete anything.

Stages:
    strict:
        Same file name + same size + same content hash.
    same_hash_diff_name:
        Same size + same content hash, even if file names differ.
    hash_only:
        Same content hash.

Safety:
    - Dry-run by default.
    - Quarantine only; no deletes.
    - Quarantine folder ignored during scans.
    - Approval gate before real apply.
    - Designed for local Google Drive sync folders.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import shutil
import sqlite3
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Optional

try:
    import blake3  # type: ignore
except Exception:
    blake3 = None


DEFAULT_QUARANTINE_NAME = "_QIDEDUPE_QUARANTINE"

DEFAULT_ALLOWED_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".tsv", ".txt", ".md",
    ".rtf", ".odt", ".ods", ".odp", ".ppt", ".pptx", ".json", ".xml", ".yaml", ".yml",
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".tif", ".tiff", ".bmp", ".heic", ".svg",
    ".zip", ".7z", ".rar", ".tar", ".gz",
    ".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg",
}

DEFAULT_EXCLUDED_DIR_NAMES = {
    DEFAULT_QUARANTINE_NAME,
    ".git", ".svn", ".hg",
    "node_modules", ".venv", "venv", "__pycache__",
    ".obsidian", ".trash", "trash",
    "$recycle.bin", "system volume information",
}

DEFAULT_EXCLUDED_EXTENSIONS = {
    ".tmp", ".temp", ".part", ".crdownload", ".download",
    ".lnk", ".ini", ".db", ".sqlite", ".sqlite3",
    ".dll", ".exe", ".msi", ".app", ".dmg", ".pkg",
    ".sys", ".bat", ".cmd", ".ps1", ".sh",
}


@dataclass
class FileRecord:
    rel_path: str
    abs_path: str
    name: str
    ext: str
    size: int
    mtime_ns: int
    ctime_ns: int
    inode: Optional[int]
    content_hash: str
    hash_algo: str
    scanned_at: str


class Args:
    pass


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def normalize_ext(ext: str) -> str:
    return ext.lower().strip()


def parse_ext_list(value: Optional[str]) -> Optional[set[str]]:
    if not value:
        return None
    return {normalize_ext(x if x.startswith(".") else "." + x) for x in value.split(",") if x.strip()}


def yes_no(prompt: str, default: bool = False) -> bool:
    suffix = "Y/n" if default else "y/N"
    while True:
        ans = input(f"{prompt} [{suffix}]: ").strip().lower()
        if not ans:
            return default
        if ans in {"y", "yes"}:
            return True
        if ans in {"n", "no"}:
            return False
        print("Please answer yes or no.")


def choose(prompt: str, options: list[tuple[str, str]], default_index: int = 0) -> str:
    print()
    print(prompt)
    for i, (key, label) in enumerate(options, start=1):
        mark = " default" if i - 1 == default_index else ""
        print(f"  {i}. {label}{mark}")

    while True:
        raw = input("Choose number: ").strip()
        if not raw:
            return options[default_index][0]
        if raw.isdigit():
            idx = int(raw) - 1
            if 0 <= idx < len(options):
                return options[idx][0]
        print("Invalid choice.")


def prompt_path(prompt: str, default: Optional[Path] = None, must_exist: bool = True) -> Path:
    while True:
        suffix = f" [{default}]" if default else ""
        raw = input(f"{prompt}{suffix}: ").strip().strip('"')
        if not raw and default:
            path = default
        else:
            path = Path(raw).expanduser()

        try:
            path = path.resolve()
        except Exception:
            pass

        if must_exist and not path.exists():
            print(f"Not found: {path}")
            continue

        return path


def pause_enter(message: str = "Press Enter to continue...") -> None:
    input(message)


def print_progress(current: int, total: Optional[int] = None, prefix: str = "", suffix: str = "") -> None:
    if len(suffix) > 40:
        suffix = suffix[:37] + "..."
    else:
        suffix = suffix.ljust(40)

    if total:
        percent = current / float(total)
        bar_len = 30
        filled = int(bar_len * percent)
        bar = '=' * filled + '-' * (bar_len - filled)
        sys.stdout.write(f"\r{prefix} [{bar}] {current:,}/{total:,} {percent:.1%} | {suffix}")
    else:
        sys.stdout.write(f"\r{prefix} {current:,} items | {suffix}")
    sys.stdout.flush()


def connect_db(db_path: Path) -> sqlite3.Connection:
    # 60 second timeout helps prevent "database is locked" errors during concurrency
    conn = sqlite3.connect(db_path, timeout=60.0)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS manifest (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id TEXT NOT NULL,
            rel_path TEXT NOT NULL,
            abs_path TEXT NOT NULL,
            name TEXT NOT NULL,
            ext TEXT NOT NULL,
            size INTEGER NOT NULL,
            mtime_ns INTEGER NOT NULL,
            ctime_ns INTEGER NOT NULL,
            inode INTEGER,
            content_hash TEXT NOT NULL,
            hash_algo TEXT NOT NULL,
            scanned_at TEXT NOT NULL,
            exists_at_scan INTEGER NOT NULL DEFAULT 1
        );
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action_id TEXT NOT NULL,
            plan_id TEXT NOT NULL,
            stage TEXT NOT NULL,
            original_rel_path TEXT NOT NULL,
            duplicate_rel_path TEXT NOT NULL,
            quarantine_rel_path TEXT NOT NULL,
            reason TEXT NOT NULL,
            status TEXT NOT NULL,
            error TEXT,
            created_at TEXT NOT NULL,
            applied_at TEXT
        );
        """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_manifest_scan ON manifest(scan_id);")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_manifest_hash ON manifest(content_hash);")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_manifest_size_hash ON manifest(size, content_hash);")
    conn.commit()
    return conn


def hash_file(path: Path, algo_preference: str = "auto", chunk_size: int = 1024 * 1024) -> tuple[str, str]:
    if algo_preference in ("auto", "blake3") and blake3 is not None:
        hasher = blake3.blake3()
        algo = "blake3"
        with path.open("rb") as f:
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                hasher.update(chunk)
        return hasher.hexdigest(), algo

    if algo_preference == "blake3" and blake3 is None:
        raise RuntimeError("blake3 requested but not installed. Install with: pip install blake3")

    hasher = hashlib.blake2b(digest_size=32)
    algo = "blake2b-256"
    with path.open("rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            hasher.update(chunk)
    return hasher.hexdigest(), algo


def should_skip_dir(path: Path, root: Path, quarantine_name: str, excluded_dir_names: set[str]) -> bool:
    try:
        lowered_parts = {p.lower() for p in path.relative_to(root).parts} if path != root else set()
    except ValueError:
        return False
    excluded = {x.lower() for x in excluded_dir_names}
    excluded.add(quarantine_name.lower())
    return bool(lowered_parts & excluded)


def iter_files(
    root: Path,
    quarantine_name: str,
    allowed_exts: set[str],
    excluded_exts: set[str],
    excluded_dir_names: set[str],
) -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        current = Path(dirpath)

        kept = []
        for d in dirnames:
            candidate = current / d
            if should_skip_dir(candidate, root, quarantine_name, excluded_dir_names):
                continue
            kept.append(d)
        dirnames[:] = kept

        for filename in filenames:
            path = current / filename
            ext = normalize_ext(path.suffix)

            if ext in excluded_exts:
                continue
            if allowed_exts and ext not in allowed_exts:
                continue
            if not path.is_file():
                continue

            yield path


def scan(args) -> None:
    root = Path(args.root).expanduser().resolve()
    db_path = Path(args.db).expanduser().resolve()

    if not root.exists() or not root.is_dir():
        raise SystemExit(f"Root folder does not exist or is not a directory: {root}")

    conn = connect_db(db_path)
    scan_id = datetime.now().strftime("SCAN-%Y%m%d-%H%M%S")
    scanned_at = utc_now()

    allowed_exts = parse_ext_list(getattr(args, "allowed_exts", None)) or DEFAULT_ALLOWED_EXTENSIONS
    excluded_exts = DEFAULT_EXCLUDED_EXTENSIONS | (parse_ext_list(getattr(args, "excluded_exts", None)) or set())
    excluded_dirs = DEFAULT_EXCLUDED_DIR_NAMES | {x.strip() for x in (getattr(args, "excluded_dirs", "") or "").split(",") if x.strip()}

    out_dir = Path(getattr(args, "out_dir", None) or ".").resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    manifest_jsonl = Path(getattr(args, "manifest_jsonl", None) or out_dir / f"manifest_{scan_id}.jsonl").resolve()
    manifest_csv = Path(getattr(args, "manifest_csv", None) or out_dir / f"manifest_{scan_id}.csv").resolve()

    count = 0
    failures = 0
    batch_count = 0

    print()
    print("SCAN STARTED")
    print(f"Root: {root}")
    print(f"DB:   {db_path}")
    print(f"Hash: {args.hash_algo}")
    print(f"Quarantine ignored: {args.quarantine_name}")
    print()

    with manifest_jsonl.open("w", encoding="utf-8") as jf, manifest_csv.open("w", newline="", encoding="utf-8") as cf:
        writer = csv.DictWriter(
            cf,
            fieldnames=[
                "scan_id", "rel_path", "abs_path", "name", "ext", "size",
                "mtime_ns", "ctime_ns", "inode", "content_hash", "hash_algo",
                "scanned_at"
            ],
        )
        writer.writeheader()

        for path in iter_files(root, args.quarantine_name, allowed_exts, excluded_exts, excluded_dirs):
            try:
                stat = path.stat()
                content_hash, hash_algo = hash_file(path, args.hash_algo, args.chunk_size)
                rel_path = str(path.relative_to(root)).replace("\\", "/")
                row = {
                    "scan_id": scan_id,
                    "rel_path": rel_path,
                    "abs_path": str(path),
                    "name": path.name,
                    "ext": normalize_ext(path.suffix),
                    "size": stat.st_size,
                    "mtime_ns": stat.st_mtime_ns,
                    "ctime_ns": getattr(stat, "st_ctime_ns", int(stat.st_ctime * 1_000_000_000)),
                    "inode": getattr(stat, "st_ino", None),
                    "content_hash": content_hash,
                    "hash_algo": hash_algo,
                    "scanned_at": scanned_at,
                }

                conn.execute(
                    """
                    INSERT INTO manifest
                    (scan_id, rel_path, abs_path, name, ext, size, mtime_ns, ctime_ns, inode,
                     content_hash, hash_algo, scanned_at, exists_at_scan)
                    VALUES
                    (:scan_id, :rel_path, :abs_path, :name, :ext, :size, :mtime_ns, :ctime_ns, :inode,
                     :content_hash, :hash_algo, :scanned_at, 1)
                    """,
                    row,
                )
                jf.write(json.dumps(row, ensure_ascii=False) + "\n")
                writer.writerow(row)

                count += 1
                batch_count += 1

                print_progress(count, None, "[scan]", f"Processing: {path.name}")

                if count % args.commit_every == 0:
                    conn.commit()

                if args.sleep_every and batch_count >= args.sleep_every:
                    sys.stdout.write(f"\r[scan] pausing {args.sleep_seconds}s to avoid sync thrash...".ljust(80))
                    sys.stdout.flush()
                    time.sleep(args.sleep_seconds)
                    batch_count = 0

            except Exception as exc:
                failures += 1
                print(f"\n[scan][WARN] failed: {path} :: {exc}", file=sys.stderr)

    print()
    conn.commit()
    print()
    print("SCAN COMPLETE")
    print(f"  scan_id:       {scan_id}")
    print(f"  files scanned: {count:,}")
    print(f"  failures:      {failures:,}")
    print(f"  db:            {db_path}")
    print(f"  jsonl:         {manifest_jsonl}")
    print(f"  csv:           {manifest_csv}")


def latest_scan_id(conn: sqlite3.Connection) -> str:
    row = conn.execute("SELECT scan_id FROM manifest ORDER BY id DESC LIMIT 1").fetchone()
    if not row:
        raise SystemExit("No manifest records found. Run scan first.")
    return row[0]


def list_plans(plans_dir: Path) -> list[Path]:
    if not plans_dir.exists():
        return []
    return sorted(plans_dir.glob("PLAN-*.jsonl"), key=lambda p: p.stat().st_mtime, reverse=True)


def plan(args) -> Path:
    root = Path(args.root).expanduser().resolve()
    db_path = Path(args.db).expanduser().resolve()
    conn = connect_db(db_path)

    scan_id = args.scan_id or latest_scan_id(conn)
    plan_id = datetime.now().strftime(f"PLAN-{args.stage}-%Y%m%d-%H%M%S")
    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    plan_jsonl = out_dir / f"{plan_id}.jsonl"
    plan_csv = out_dir / f"{plan_id}.csv"

    if args.stage == "strict":
        group_cols = "name, size, content_hash"
        reason = "same file name + same size + same content hash"
    elif args.stage == "same_hash_diff_name":
        group_cols = "size, content_hash"
        reason = "same size + same content hash; file name may differ"
    elif args.stage == "hash_only":
        group_cols = "content_hash"
        reason = "same content hash"
    else:
        raise SystemExit(f"Unknown stage: {args.stage}")

    query = f"""
        SELECT rel_path, abs_path, name, size, mtime_ns, ctime_ns, content_hash
        FROM manifest
        WHERE scan_id = ?
        AND content_hash IN (
            SELECT content_hash FROM manifest
            WHERE scan_id = ?
            GROUP BY {group_cols}
            HAVING COUNT(*) > 1
        )
        ORDER BY content_hash, size, name, mtime_ns ASC, rel_path ASC
    """

    rows = conn.execute(query, (scan_id, scan_id)).fetchall()

    groups: dict[tuple, list[dict]] = {}
    for i, (rel_path, abs_path, name, size, mtime_ns, ctime_ns, content_hash) in enumerate(rows):
        print_progress(i + 1, len(rows), "[plan grouping]", f"Processing: {name}")
        if args.stage == "strict":
            key = (name, size, content_hash)
        elif args.stage == "same_hash_diff_name":
            key = (size, content_hash)
        else:
            key = (content_hash,)

        groups.setdefault(key, []).append({
            "rel_path": rel_path,
            "abs_path": abs_path,
            "name": name,
            "size": size,
            "mtime_ns": mtime_ns,
            "ctime_ns": ctime_ns,
            "content_hash": content_hash,
        })

    print()
    actions = []
    total_groups = len(groups)
    for i, (key, items) in enumerate(groups.items()):
        print_progress(i + 1, total_groups, "[plan actions]", f"Group size: {len(items)}")
        if len(items) < 2:
            continue

        sorted_items = sorted(items, key=lambda x: (x["mtime_ns"], len(x["rel_path"]), x["rel_path"].lower()))
        keeper = sorted_items[0]

        for dup in sorted_items[1:]:
            quarantine_rel = str(Path(args.quarantine_name) / args.stage / dup["rel_path"]).replace("\\", "/")
            action_id = f"{plan_id}-{len(actions)+1:06d}"
            actions.append({
                "action_id": action_id,
                "plan_id": plan_id,
                "stage": args.stage,
                "scan_id": scan_id,
                "reason": reason,
                "original_rel_path": keeper["rel_path"],
                "duplicate_rel_path": dup["rel_path"],
                "duplicate_abs_path": dup["abs_path"],
                "quarantine_rel_path": quarantine_rel,
                "size": dup["size"],
                "content_hash": dup["content_hash"],
                "status": "planned",
                "created_at": utc_now(),
            })

    print()

    with plan_jsonl.open("w", encoding="utf-8") as jf, plan_csv.open("w", newline="", encoding="utf-8") as cf:
        fieldnames = [
            "action_id", "plan_id", "stage", "scan_id", "reason",
            "original_rel_path", "duplicate_rel_path", "duplicate_abs_path",
            "quarantine_rel_path", "size", "content_hash", "status", "created_at"
        ]
        writer = csv.DictWriter(cf, fieldnames=fieldnames)
        writer.writeheader()

        for action in actions:
            jf.write(json.dumps(action, ensure_ascii=False) + "\n")
            writer.writerow(action)

    print()
    print("PLAN COMPLETE")
    print(f"  scan_id:                   {scan_id}")
    print(f"  plan_id:                   {plan_id}")
    print(f"  stage:                     {args.stage}")
    print(f"  duplicate actions planned: {len(actions):,}")
    print(f"  review csv:                {plan_csv}")
    print(f"  review jsonl:              {plan_jsonl}")
    print()
    print("Review the CSV before applying. No files were moved.")
    return plan_jsonl


def unique_destination(path: Path) -> Path:
    if not path.exists():
        return path

    stem = path.stem
    suffix = path.suffix
    parent = path.parent

    i = 1
    while True:
        candidate = parent / f"{stem}__qidup_{i:03d}{suffix}"
        if not candidate.exists():
            return candidate
        i += 1


def apply_plan(args) -> None:
    root = Path(args.root).expanduser().resolve()
    db_path = Path(args.db).expanduser().resolve()
    plan_path = Path(args.plan).expanduser().resolve()
    conn = connect_db(db_path)

    if not plan_path.exists():
        raise SystemExit(f"Plan file not found: {plan_path}")

    dry_run = not args.apply

    moved = 0
    skipped = 0
    errors = 0
    seen = 0
    batch_count = 0

    print()
    print("APPLY STARTED" if not dry_run else "DRY-RUN STARTED")
    print(f"Root: {root}")
    print(f"Plan: {plan_path}")
    print()

    with plan_path.open("r", encoding="utf-8") as f:
        total_actions = sum(1 for line in f if line.strip())

    with plan_path.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue

            action = json.loads(line)
            seen += 1
            duplicate = root / action["duplicate_rel_path"]
            quarantine = root / action["quarantine_rel_path"]
            quarantine = unique_destination(quarantine)

            status = "dry_run"
            error = None

            try:
                if not duplicate.exists():
                    skipped += 1
                    status = "skipped_missing"
                else:
                    if not dry_run:
                        quarantine.parent.mkdir(parents=True, exist_ok=True)
                        shutil.move(str(duplicate), str(quarantine))
                        moved += 1
                        status = "moved"
                    else:
                        status = "dry_run_move"

                print_progress(seen, total_actions, "[apply]" if not dry_run else "[dry-run]", f"{status}: {duplicate.name}")

                conn.execute(
                    """
                    INSERT INTO actions
                    (action_id, plan_id, stage, original_rel_path, duplicate_rel_path,
                     quarantine_rel_path, reason, status, error, created_at, applied_at)
                    VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        action["action_id"],
                        action["plan_id"],
                        action["stage"],
                        action["original_rel_path"],
                        action["duplicate_rel_path"],
                        str(quarantine.relative_to(root)).replace("\\", "/"),
                        action["reason"],
                        status,
                        error,
                        action.get("created_at", utc_now()),
                        utc_now(),
                    ),
                )

                batch_count += 1
                if batch_count >= args.commit_every:
                    conn.commit()
                    batch_count = 0

                if args.sleep_every and seen > 0 and seen % args.sleep_every == 0:
                    sys.stdout.write(f"\r[apply] pausing {args.sleep_seconds}s to avoid sync thrash...".ljust(80))
                    sys.stdout.flush()
                    time.sleep(args.sleep_seconds)

            except Exception as exc:
                errors += 1
                status = "error"
                error = str(exc)
                print(f"\n[error] {duplicate} :: {exc}", file=sys.stderr)

                conn.execute(
                    """
                    INSERT INTO actions
                    (action_id, plan_id, stage, original_rel_path, duplicate_rel_path,
                     quarantine_rel_path, reason, status, error, created_at, applied_at)
                    VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        action["action_id"],
                        action["plan_id"],
                        action["stage"],
                        action["original_rel_path"],
                        action["duplicate_rel_path"],
                        action["quarantine_rel_path"],
                        action["reason"],
                        status,
                        error,
                        action.get("created_at", utc_now()),
                        utc_now(),
                    ),
                )

    print()
    conn.commit()
    print()
    print("APPLY COMPLETE" if not dry_run else "DRY-RUN COMPLETE")
    print(f"  planned actions seen: {seen:,}")
    print(f"  moved:                {moved:,}")
    print(f"  skipped:              {skipped:,}")
    print(f"  errors:               {errors:,}")
    if dry_run:
        print("  no files moved because this was a dry-run")


def build_default_config(script_dir: Path, session_name: str) -> dict:
    prefix = f"_{session_name}" if session_name and session_name != "default" else ""
    return {
        "root": "",
        "db": str(script_dir / f"qidrive_manifest{prefix}.sqlite"),
        "plans_dir": str(script_dir / f"plans{prefix}"),
        "quarantine_name": DEFAULT_QUARANTINE_NAME,
        "hash_algo": "auto",
        "sleep_every": 500,
        "sleep_seconds": 2.0,
        "commit_every": 250,
        "chunk_size": 1024 * 1024,
        "allowed_exts": "",
        "excluded_exts": "",
        "excluded_dirs": "",
    }


def load_config(script_dir: Path, session_name: str) -> dict:
    prefix = f"_{session_name}" if session_name and session_name != "default" else ""
    config_path = script_dir / f"qidrive_dedupe_config{prefix}.json"
    config = build_default_config(script_dir, session_name)
    if config_path.exists():
        try:
            config.update(json.loads(config_path.read_text(encoding="utf-8")))
        except Exception:
            print(f"Warning: could not read config: {config_path}")
    return config


def save_config(script_dir: Path, session_name: str, config: dict) -> None:
    prefix = f"_{session_name}" if session_name and session_name != "default" else ""
    config_path = script_dir / f"qidrive_dedupe_config{prefix}.json"
    config_path.write_text(json.dumps(config, indent=2), encoding="utf-8")


def make_args(**kwargs):
    obj = Args()
    for k, v in kwargs.items():
        setattr(obj, k, v)
    return obj


def interactive_main() -> None:
    script_dir = Path(__file__).resolve().parent

    print("=" * 72)
    print("QiDrive Dedupe — Interactive Safe Mode")
    print("=" * 72)
    print("No deletes. Quarantine only. Review gates stay on.")
    print()
    print("💡 Tip: To run concurrent sessions for different folders without database")
    print("   locks, use different session names for each terminal.")
    print()

    session_name = input("Session name (default='default'): ").strip()
    if not session_name:
        session_name = "default"
    
    # Ensure safe filename
    session_name = "".join(c if c.isalnum() else "_" for c in session_name)

    config = load_config(script_dir, session_name)



    default_root = Path(config["root"]) if config.get("root") else None

    if default_root and default_root.exists():
        root = prompt_path("Drive/root folder to work on", default_root, must_exist=True)
    else:
        root = prompt_path("Drive/root folder to work on", None, must_exist=True)

    config["root"] = str(root)
    save_config(script_dir, session_name, config)

    db_path = Path(config["db"]).resolve()
    plans_dir = Path(config["plans_dir"]).resolve()
    plans_dir.mkdir(exist_ok=True)

    while True:
        action = choose(
            "What do you want to do?",
            [
                ("scan", "Scan / update manifest snapshot"),
                ("plan", "Create duplicate review plan"),
                ("dry_apply", "Dry-run an existing plan"),
                ("real_apply", "Quarantine files from an approved plan"),
                ("workflow_strict", "Guided safe workflow: scan → strict plan → dry-run"),
                ("settings", "Settings"),
                ("exit", "Exit"),
            ],
            default_index=0,
        )

        if action == "exit":
            print("Done.")
            return

        if action == "settings":
            print()
            print("Current settings:")
            for k, v in config.items():
                print(f"  {k}: {v}")
            print()
            if yes_no("Change pause settings?", default=False):
                config["sleep_every"] = int(input(f"Pause every N files/actions [{config['sleep_every']}]: ").strip() or config["sleep_every"])
                config["sleep_seconds"] = float(input(f"Pause seconds [{config['sleep_seconds']}]: ").strip() or config["sleep_seconds"])
            if yes_no("Limit allowed extensions?", default=False):
                config["allowed_exts"] = input("Extensions, comma-separated, blank for default safe set: ").strip()
            save_config(script_dir, session_name, config)
            continue

        common_kwargs = dict(
            root=str(root),
            db=str(db_path),
            quarantine_name=config["quarantine_name"],
            sleep_every=int(config["sleep_every"]),
            sleep_seconds=float(config["sleep_seconds"]),
            commit_every=int(config["commit_every"]),
        )

        if action in {"scan", "workflow_strict"}:
            scan_args = make_args(
                **common_kwargs,
                hash_algo=config["hash_algo"],
                chunk_size=int(config["chunk_size"]),
                allowed_exts=config.get("allowed_exts", ""),
                excluded_exts=config.get("excluded_exts", ""),
                excluded_dirs=config.get("excluded_dirs", ""),
                manifest_jsonl=None,
                manifest_csv=None,
                out_dir=str(script_dir),
            )
            scan(scan_args)
            pause_enter()

            if action == "scan":
                continue

        if action in {"plan", "workflow_strict"}:
            if action == "workflow_strict":
                stage = "strict"
            else:
                stage = choose(
                    "Choose duplicate strictness stage",
                    [
                        ("strict", "STRICT: same filename + same size + same hash"),
                        ("same_hash_diff_name", "MEDIUM: same size + same hash, names may differ"),
                        ("hash_only", "LOOSE: same content hash only"),
                    ],
                    default_index=0,
                )

            if stage == "hash_only":
                print()
                print("Warning: hash-only is usually safe, but it is the loosest automatic stage.")
                print("Do not real-apply hash-only without reviewing the CSV.")
                if not yes_no("Continue creating hash-only plan?", default=False):
                    continue

            plan_args = make_args(
                **common_kwargs,
                scan_id=None,
                stage=stage,
                out_dir=str(plans_dir),
            )
            plan_path = plan(plan_args)
            pause_enter()

            if action == "workflow_strict":
                print()
                print("Next: dry-run the strict plan. This still moves nothing.")
                if yes_no("Dry-run this strict plan now?", default=True):
                    apply_args = make_args(
                        **common_kwargs,
                        plan=str(plan_path),
                        apply=False,
                    )
                    apply_plan(apply_args)
                    pause_enter()
            continue

        if action in {"dry_apply", "real_apply"}:
            plans = list_plans(plans_dir)
            if not plans:
                print("No plan files found. Create a plan first.")
                pause_enter()
                continue

            print()
            print("Available plans:")
            for i, p in enumerate(plans[:20], start=1):
                print(f"  {i}. {p.name}")

            while True:
                raw = input("Choose plan number: ").strip()
                if raw.isdigit() and 1 <= int(raw) <= min(len(plans), 20):
                    plan_path = plans[int(raw) - 1]
                    break
                print("Invalid choice.")

            if action == "real_apply":
                print()
                print("REAL APPLY = move duplicate files into quarantine.")
                print("It still does not delete anything, but it does move files.")
                print(f"Plan: {plan_path}")
                print(f"Root: {root}")
                if not yes_no("Have you reviewed the CSV and approved this plan?", default=False):
                    print("Good. Review first. No movement done.")
                    pause_enter()
                    continue
                typed = input("Type QUARANTINE to confirm real move: ").strip()
                if typed != "QUARANTINE":
                    print("Confirmation failed. No movement done.")
                    pause_enter()
                    continue
                real = True
            else:
                real = False

            apply_args = make_args(
                **common_kwargs,
                plan=str(plan_path),
                apply=real,
            )
            apply_plan(apply_args)
            pause_enter()


def cli_main() -> None:
    parser = argparse.ArgumentParser(description="Safe staged duplicate cleanup for local Google Drive folders.")
    sub = parser.add_subparsers(dest="command")

    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("root", help="Root folder to scan, plan, or apply against.")
    common.add_argument("--db", default="qidrive_manifest.sqlite")
    common.add_argument("--quarantine-name", default=DEFAULT_QUARANTINE_NAME)
    common.add_argument("--sleep-every", type=int, default=500)
    common.add_argument("--sleep-seconds", type=float, default=2.0)
    common.add_argument("--commit-every", type=int, default=250)

    p_scan = sub.add_parser("scan", parents=[common])
    p_scan.add_argument("--hash-algo", choices=["auto", "blake3", "blake2b"], default="auto")
    p_scan.add_argument("--chunk-size", type=int, default=1024 * 1024)
    p_scan.add_argument("--allowed-exts")
    p_scan.add_argument("--excluded-exts")
    p_scan.add_argument("--excluded-dirs")
    p_scan.add_argument("--manifest-jsonl")
    p_scan.add_argument("--manifest-csv")
    p_scan.add_argument("--out-dir", default=".")
    p_scan.set_defaults(func=scan)

    p_plan = sub.add_parser("plan", parents=[common])
    p_plan.add_argument("--scan-id")
    p_plan.add_argument("--stage", choices=["strict", "same_hash_diff_name", "hash_only"], required=True)
    p_plan.add_argument("--out-dir", default="plans")
    p_plan.set_defaults(func=plan)

    p_apply = sub.add_parser("apply", parents=[common])
    p_apply.add_argument("--plan", required=True)
    p_apply.add_argument("--apply", action="store_true")
    p_apply.set_defaults(func=apply_plan)

    args = parser.parse_args()
    if not args.command:
        interactive_main()
    else:
        args.func(args)


if __name__ == "__main__":
    cli_main()
