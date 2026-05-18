#!/usr/bin/env python3
"""
qidrive_dedupe.py

Purpose:
    Safe, staged, auditable duplicate-file cleanup for a local Google Drive-synced folder.

Core doctrine:
    1. Scan first.
    2. Build a manifest.
    3. Plan duplicate actions.
    4. Review the plan.
    5. Quarantine duplicates by moving them, preserving original folder structure.
    6. Never permanently delete anything.

Recommended flow:
    python qidrive_dedupe.py scan "G:\My Drive" --db qidrive_manifest.sqlite
    python qidrive_dedupe.py plan "G:\My Drive" --db qidrive_manifest.sqlite --stage strict
    python qidrive_dedupe.py apply "G:\My Drive" --db qidrive_manifest.sqlite --plan plans/PLAN_FILE.jsonl --apply

Stages:
    strict:
        Same file name + same size + same content hash.
    same_hash_diff_name:
        Same size + same content hash, even if the file names differ.
    hash_only:
        Same content hash. This is usually safe, but less explainable than size+hash.

Notes:
    - Default is dry-run.
    - The script ignores the quarantine folder automatically.
    - It targets normal user files only by extension.
    - It writes SQLite logs plus JSONL/CSV review files.
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
    # documents / text
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".tsv", ".txt", ".md",
    ".rtf", ".odt", ".ods", ".odp", ".ppt", ".pptx", ".json", ".xml", ".yaml", ".yml",

    # images
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".tif", ".tiff", ".bmp", ".heic", ".svg",

    # archives / exports
    ".zip", ".7z", ".rar", ".tar", ".gz",

    # audio, but intentionally not video by default
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


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def normalize_ext(ext: str) -> str:
    return ext.lower().strip()


def parse_ext_list(value: Optional[str]) -> Optional[set[str]]:
    if not value:
        return None
    return {normalize_ext(x if x.startswith(".") else "." + x) for x in value.split(",") if x.strip()}


def connect_db(db_path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
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
    """
    Hashes the file content.

    Priority:
        - blake3 if installed and algo is auto/blake3.
        - hashlib.blake2b otherwise.

    blake3 is very fast and strong, but requires:
        pip install blake3

    blake2b is built into Python and still fast enough for a safe first version.
    """
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
        raise RuntimeError("blake3 requested but not installed. Run: pip install blake3")

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
    lowered_parts = {p.lower() for p in path.relative_to(root).parts} if path != root else set()
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

        # Mutate dirnames in-place so os.walk does not descend into excluded dirs.
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


def scan(args: argparse.Namespace) -> None:
    root = Path(args.root).expanduser().resolve()
    db_path = Path(args.db).expanduser().resolve()

    if not root.exists() or not root.is_dir():
        raise SystemExit(f"Root folder does not exist or is not a directory: {root}")

    conn = connect_db(db_path)
    scan_id = datetime.now().strftime("SCAN-%Y%m%d-%H%M%S")
    scanned_at = utc_now()

    allowed_exts = parse_ext_list(args.allowed_exts) or DEFAULT_ALLOWED_EXTENSIONS
    excluded_exts = DEFAULT_EXCLUDED_EXTENSIONS | (parse_ext_list(args.excluded_exts) or set())
    excluded_dirs = DEFAULT_EXCLUDED_DIR_NAMES | {x.strip() for x in (args.excluded_dirs or "").split(",") if x.strip()}

    manifest_jsonl = Path(args.manifest_jsonl or f"manifest_{scan_id}.jsonl").resolve()
    manifest_csv = Path(args.manifest_csv or f"manifest_{scan_id}.csv").resolve()

    count = 0
    failures = 0
    batch_count = 0

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
                rec = FileRecord(
                    rel_path=rel_path,
                    abs_path=str(path),
                    name=path.name,
                    ext=normalize_ext(path.suffix),
                    size=stat.st_size,
                    mtime_ns=stat.st_mtime_ns,
                    ctime_ns=getattr(stat, "st_ctime_ns", int(stat.st_ctime * 1_000_000_000)),
                    inode=getattr(stat, "st_ino", None),
                    content_hash=content_hash,
                    hash_algo=hash_algo,
                    scanned_at=scanned_at,
                )

                row = {
                    "scan_id": scan_id,
                    "rel_path": rec.rel_path,
                    "abs_path": rec.abs_path,
                    "name": rec.name,
                    "ext": rec.ext,
                    "size": rec.size,
                    "mtime_ns": rec.mtime_ns,
                    "ctime_ns": rec.ctime_ns,
                    "inode": rec.inode,
                    "content_hash": rec.content_hash,
                    "hash_algo": rec.hash_algo,
                    "scanned_at": rec.scanned_at,
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

                if count % args.commit_every == 0:
                    conn.commit()
                    print(f"[scan] {count:,} files scanned...")

                if args.sleep_every and batch_count >= args.sleep_every:
                    print(f"[scan] pause {args.sleep_seconds}s to avoid Drive thrash/locking...")
                    time.sleep(args.sleep_seconds)
                    batch_count = 0

            except Exception as exc:
                failures += 1
                print(f"[scan][WARN] failed: {path} :: {exc}", file=sys.stderr)

    conn.commit()
    print(f"[scan] complete")
    print(f"  scan_id: {scan_id}")
    print(f"  files scanned: {count:,}")
    print(f"  failures: {failures:,}")
    print(f"  db: {db_path}")
    print(f"  jsonl: {manifest_jsonl}")
    print(f"  csv: {manifest_csv}")


def latest_scan_id(conn: sqlite3.Connection) -> str:
    row = conn.execute("SELECT scan_id FROM manifest ORDER BY id DESC LIMIT 1").fetchone()
    if not row:
        raise SystemExit("No manifest records found. Run scan first.")
    return row[0]


def plan(args: argparse.Namespace) -> None:
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

    # Build groups in Python to respect exact stage grouping.
    groups: dict[tuple, list[dict]] = {}
    for rel_path, abs_path, name, size, mtime_ns, ctime_ns, content_hash in rows:
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

    actions = []
    for key, items in groups.items():
        if len(items) < 2:
            continue

        # Keeper logic:
        # Oldest mtime wins. Tie-breaker: shortest path, then lexical path.
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

    print(f"[plan] complete")
    print(f"  scan_id: {scan_id}")
    print(f"  plan_id: {plan_id}")
    print(f"  stage: {args.stage}")
    print(f"  duplicate actions planned: {len(actions):,}")
    print(f"  review jsonl: {plan_jsonl}")
    print(f"  review csv: {plan_csv}")
    print("")
    print("Dry-run only. Review the CSV before applying.")
    print(f"Apply only after review:")
    print(f"  python {Path(__file__).name} apply \"{root}\" --db \"{db_path}\" --plan \"{plan_jsonl}\" --apply")


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


def apply_plan(args: argparse.Namespace) -> None:
    root = Path(args.root).expanduser().resolve()
    db_path = Path(args.db).expanduser().resolve()
    plan_path = Path(args.plan).expanduser().resolve()
    conn = connect_db(db_path)

    if not plan_path.exists():
        raise SystemExit(f"Plan file not found: {plan_path}")

    if not args.apply:
        print("[apply] dry-run only. Add --apply to actually move files.")
        dry_run = True
    else:
        dry_run = False

    moved = 0
    skipped = 0
    errors = 0
    batch_count = 0

    with plan_path.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue

            action = json.loads(line)
            duplicate = root / action["duplicate_rel_path"]
            quarantine = root / action["quarantine_rel_path"]
            quarantine = unique_destination(quarantine)

            status = "dry_run"
            error = None

            try:
                if not duplicate.exists():
                    skipped += 1
                    status = "skipped_missing"
                    print(f"[apply][SKIP] missing: {duplicate}")
                else:
                    if not dry_run:
                        quarantine.parent.mkdir(parents=True, exist_ok=True)
                        shutil.move(str(duplicate), str(quarantine))
                        moved += 1
                        status = "moved"
                        print(f"[apply][MOVED] {duplicate} -> {quarantine}")
                    else:
                        print(f"[apply][DRY] would move: {duplicate} -> {quarantine}")

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

                if args.sleep_every and (moved + skipped) > 0 and (moved + skipped) % args.sleep_every == 0:
                    print(f"[apply] pause {args.sleep_seconds}s to avoid Drive thrash/locking...")
                    time.sleep(args.sleep_seconds)

            except Exception as exc:
                errors += 1
                status = "error"
                error = str(exc)
                print(f"[apply][ERROR] {duplicate} :: {exc}", file=sys.stderr)

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

    conn.commit()
    print("[apply] complete")
    print(f"  moved: {moved:,}")
    print(f"  skipped: {skipped:,}")
    print(f"  errors: {errors:,}")
    if dry_run:
        print("  no files moved because this was a dry-run")


def main() -> None:
    parser = argparse.ArgumentParser(description="Safe staged duplicate cleanup for local Google Drive folders.")
    sub = parser.add_subparsers(dest="command", required=True)

    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("root", help="Root folder to scan, plan, or apply against.")
    common.add_argument("--db", default="qidrive_manifest.sqlite", help="SQLite database path.")
    common.add_argument("--quarantine-name", default=DEFAULT_QUARANTINE_NAME, help="Quarantine folder name.")
    common.add_argument("--sleep-every", type=int, default=500, help="Pause after this many processed files/actions. Use 0 to disable.")
    common.add_argument("--sleep-seconds", type=float, default=2.0, help="Seconds to pause.")
    common.add_argument("--commit-every", type=int, default=250, help="SQLite commit interval.")

    p_scan = sub.add_parser("scan", parents=[common], help="Create recursive manifest snapshot.")
    p_scan.add_argument("--hash-algo", choices=["auto", "blake3", "blake2b"], default="auto")
    p_scan.add_argument("--chunk-size", type=int, default=1024 * 1024)
    p_scan.add_argument("--allowed-exts", help="Comma-separated extensions to include. Example: pdf,csv,jpg,png,md")
    p_scan.add_argument("--excluded-exts", help="Comma-separated extensions to exclude.")
    p_scan.add_argument("--excluded-dirs", help="Comma-separated folder names to exclude.")
    p_scan.add_argument("--manifest-jsonl", help="Output JSONL manifest path.")
    p_scan.add_argument("--manifest-csv", help="Output CSV manifest path.")
    p_scan.set_defaults(func=scan)

    p_plan = sub.add_parser("plan", parents=[common], help="Create reviewable duplicate quarantine plan.")
    p_plan.add_argument("--scan-id", help="Specific scan_id. Defaults to latest scan.")
    p_plan.add_argument("--stage", choices=["strict", "same_hash_diff_name", "hash_only"], required=True)
    p_plan.add_argument("--out-dir", default="plans")
    p_plan.set_defaults(func=plan)

    p_apply = sub.add_parser("apply", parents=[common], help="Apply a reviewed plan by moving files into quarantine.")
    p_apply.add_argument("--plan", required=True, help="Plan JSONL path.")
    p_apply.add_argument("--apply", action="store_true", help="Actually move files. Without this, dry-run only.")
    p_apply.set_defaults(func=apply_plan)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
