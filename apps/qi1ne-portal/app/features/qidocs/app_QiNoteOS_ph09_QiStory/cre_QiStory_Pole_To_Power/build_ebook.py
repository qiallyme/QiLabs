#!/usr/bin/env python3
"""
Zero-argument build script for cre_QiStory_Pole_To_Power.

Inputs:
- ./book/00_Front_Matter.md
- ./book/**/<numbered .md files> (e.g., 00_prologue..., 01a_..., 05z_...)
- ./book/99_About_the_Author.md
- ./book/99_Back_Matter.md

Outputs:
- ./FINAL_SUBMISSION/Paid_In_Full_Master_Manuscript.md
- ./FINAL_SUBMISSION/Paid_In_Full_PRINT.epub
- ./FINAL_SUBMISSION/Paid_In_Full_LISTEN.epub
- ./assets/outputs/Paid_In_Full_Master_Manuscript.md (mirrored)
- ./interactive/downloads/Paid_In_Full.epub (mirrored from LISTEN edition)

Requires:
- pandoc installed and on PATH
"""

from __future__ import annotations

import re
import shutil
import subprocess
from datetime import date
from pathlib import Path

# ---------- CONFIG (LOCKED TO YOUR TREE) ----------
PROJECT_TITLE = "PAID IN FULL"
AUTHOR = "Lisa English"
LANGUAGE = "en-US"

OUT_MASTER_NAME = "Paid_In_Full_Master_Manuscript.md"

# Output filenames
OUT_EPUB_PRINT = "Paid_In_Full_PRINT.epub"
OUT_EPUB_LISTEN = "Paid_In_Full_LISTEN.epub"

# CSS Paths
PRINT_CSS = "assets/epub_print.css"
LISTEN_CSS = "assets/epub_listening.css"

# Prefer this as cover if present
COVER_CANDIDATES = [
    "assets/imgs/PAIDINFULL.PNG",
    "assets/imgs/PAIDINFULL.png",
    "assets/imgs/paidinfull.png",
    "assets/imgs/paidinfull.PNG",
]

# Canonical numbered file pattern
NUM_PREFIX_RE = re.compile(r"^(\d{2})([a-z]?)_.*\.md$", re.IGNORECASE)

# Files handled explicitly (not by numeric sort loop)
SPECIAL_FILES = {
    "00_Front_Matter.md",
    "99_About_the_Author.md",
    "99_Back_Matter.md",
}


def die(msg: str) -> None:
    raise SystemExit(f"[BUILD_ERROR] {msg}")


def run(cmd: list[str]) -> None:
    proc = subprocess.run(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True
    )
    if proc.returncode != 0:
        die("Command failed:\n\n" + " ".join(cmd) + "\n\nOutput:\n" + proc.stdout)
    if proc.stdout.strip():
        print(proc.stdout)


def sort_key(path: Path):
    """
    Sorts numbered markdown like:
      00_...
      01_..., 01a_..., 01b_..., 01z_...
      ...
      99_...
    """
    m = NUM_PREFIX_RE.match(path.name)
    if not m:
        return (999, "z", path.name.lower())
    major = int(m.group(1))
    minor = (m.group(2) or "").lower()
    minor_sort = minor if minor else "0"  # bare 01_ comes before 01a_
    return (major, minor_sort, path.name.lower())


def find_repo_root() -> Path:
    # build_ebook.py sits in repo root per your tree
    return Path(__file__).resolve().parent


def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8").strip() + "\n"


def write_text(p: Path, content: str) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")


def find_first_existing(root: Path, rel_candidates: list[str]) -> Path | None:
    for rel in rel_candidates:
        p = (root / rel).resolve()
        if p.exists():
            return p
    return None


def collect_book_files(repo: Path) -> list[Path]:
    book_dir = repo / "book"
    if not book_dir.exists():
        die(f"Missing folder: {book_dir}")

    # Required: front matter
    front = book_dir / "00_Front_Matter.md"
    if not front.exists():
        die("Missing required file: book/00_Front_Matter.md")

    # Optional: back matter + about
    about = book_dir / "99_About_the_Author.md"
    back = book_dir / "99_Back_Matter.md"

    # Collect canonical numbered files inside the section subfolders
    # (00_PROLOGUE, 01_PART_..., etc.)
    numbered = []
    for p in book_dir.rglob("*.md"):
        if p.name in SPECIAL_FILES:
            continue
        if NUM_PREFIX_RE.match(p.name):
            numbered.append(p)

    if not numbered:
        die(
            "No numbered chapter files found under book/. Expected files like 00_prologue_*.md, 01a_*.md, etc."
        )

    numbered_sorted = sorted(numbered, key=sort_key)

    ordered = [front] + numbered_sorted

    # Put 99_ files at the very end if they exist
    if about.exists():
        ordered.append(about)
    if back.exists():
        ordered.append(back)

    return ordered


def build_master_markdown(repo: Path, ordered_files: list[Path]) -> str:
    """
    Stitches content. We do NOT rewrite headings; we concatenate.
    Adds clean separators between files.
    """
    chunks = []
    for f in ordered_files:
        rel = f.relative_to(repo)
        chunks.append(f"\n\n<!-- SOURCE: {rel.as_posix()} -->\n\n")
        chunks.append(read_text(f))
    return "".join(chunks).strip() + "\n"


def write_metadata_yaml(repo: Path) -> Path:
    out_dir = (repo / "FINAL_SUBMISSION").resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    meta_path = out_dir / "_pandoc_metadata.yaml"

    rights = f"© {date.today().year} {AUTHOR}. All Rights Reserved."
    desc = "A story about survival, power, and the cost of escape."

    yaml = "\n".join(
        [
            "---",
            f'title: "{PROJECT_TITLE}"',
            f'author: "{AUTHOR}"',
            f'language: "{LANGUAGE}"',
            f'publisher: "{AUTHOR}"',
            f'rights: "{rights}"',
            f'description: "{desc}"',
            "---",
            "",
        ]
    )
    write_text(meta_path, yaml)
    return meta_path


def ensure_pandoc() -> None:
    if shutil.which("pandoc") is None:
        die("pandoc not found on PATH. Install pandoc and try again.")


def copy_if_exists(src: Path, dst: Path) -> None:
    if not src.exists():
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def build_epub(
    src_md: Path, meta: Path, out_epub: Path, css_path: Path | None, cover: Path | None
) -> None:
    cmd = [
        "pandoc",
        str(src_md),
        "--from",
        "markdown",
        "--to",
        "epub",
        "--metadata-file",
        str(meta),
        "--toc",
        "--toc-depth=2",
        "--epub-chapter-level=1",
        "--output",
        str(out_epub),
    ]

    if cover:
        cmd += ["--epub-cover-image", str(cover)]
    if css_path and css_path.exists():
        cmd += ["--css", str(css_path)]

    print(f"\n[BUILD] Building EPUB: {out_epub.name}")
    if css_path:
        print(f" - CSS: {css_path.name}")

    run(cmd)


def main() -> None:
    repo = find_repo_root()
    ensure_pandoc()

    ordered = collect_book_files(repo)

    print("[BUILD] Using files in this order:")
    for f in ordered:
        print(" -", f.relative_to(repo).as_posix())

    master_md = build_master_markdown(repo, ordered)

    # Outputs
    final_dir = repo / "FINAL_SUBMISSION"
    assets_out_dir = repo / "assets" / "outputs"
    interactive_dl_dir = repo / "interactive" / "downloads"

    final_master_path = final_dir / OUT_MASTER_NAME
    assets_master_path = assets_out_dir / OUT_MASTER_NAME

    write_text(final_master_path, master_md)
    write_text(assets_master_path, master_md)

    print(f"\n[BUILD] Wrote master manuscript:")
    print(" -", final_master_path.relative_to(repo).as_posix())
    print(" -", assets_master_path.relative_to(repo).as_posix())

    # Pandoc metadata
    meta_path = write_metadata_yaml(repo)
    cover_path = find_first_existing(repo, COVER_CANDIDATES)

    # CSS Paths
    print_css_path = repo / PRINT_CSS
    listen_css_path = repo / LISTEN_CSS

    # Output Paths
    final_epub_print = final_dir / OUT_EPUB_PRINT
    final_epub_listen = final_dir / OUT_EPUB_LISTEN

    # Build PRINT Edition
    build_epub(
        final_master_path, meta_path, final_epub_print, print_css_path, cover_path
    )

    # Build LISTEN Edition
    build_epub(
        final_master_path, meta_path, final_epub_listen, listen_css_path, cover_path
    )

    print(f"\n[BUILD] EPUBs built successfully.")
    print(" -", final_epub_print.relative_to(repo).as_posix())
    print(" -", final_epub_listen.relative_to(repo).as_posix())

    # Mirror LISTEN Edition into interactive/downloads as the default 'Paid_In_Full.epub'
    interactive_epub_path = interactive_dl_dir / "Paid_In_Full.epub"
    copy_if_exists(final_epub_listen, interactive_epub_path)

    print("\n[BUILD] Mirrored LISTEN edition to:")
    print(" -", interactive_epub_path.relative_to(repo).as_posix())

    print("\n[BUILD] Done.")


if __name__ == "__main__":
    main()
