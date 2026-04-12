#!/usr/bin/env python3
"""
dump_tree_with_ocr.py

Walk from the script's directory, ignore dot-directories (and their contents),
emit a directory tree with file content printed under each file entry.

Special handling:
- PDFs: copy to tmp, render pages to JPG, OCR each page, output text
- Images: copy to tmp, convert to JPG, OCR, output text

Output:
- single .txt file in script directory
"""

from __future__ import annotations

import os
import sys
import time
import shutil
import tempfile
from pathlib import Path
from typing import Iterable, Tuple

# ----------------------------
# Config
# ----------------------------
OUTPUT_FILENAME = "repo_dump_tree_with_contents_and_ocr.txt"

# Skip dot-dirs automatically; add more directory names here
EXTRA_SKIP_DIR_NAMES = {
    "__pycache__",
    "node_modules",
    "dist",
    "build",
    ".obsidian",
    ".venv",
    ".infio_json_db",
}

# Image/PDF handling
OCR_IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
PDF_EXTS = {".pdf"}

# Text files that should always be included (CSV, MD, TXT, etc.)
TEXT_FILE_EXTS = {".csv", ".md", ".txt", ".json", ".yaml", ".yml", ".log"}

# Skip some common binary/noisy file types (non-image/pdf)
SKIP_FILE_EXTS = {
    ".zip",
    ".tar",
    ".gz",
    ".7z",
    ".rar",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".mp4",
    ".mov",
    ".mkv",
    ".mp3",
    ".wav",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".ico",
}

# Hard limits
MAX_FILE_BYTES = 300_000  # for normal text files
MAX_TEXT_CHARS_TO_WRITE = 300_000  # truncate big outputs
MAX_PDF_PAGES_OCR = 50  # keep you from nuking your day

# Tree formatting
INDENT = "  "

# If Tesseract isn't in PATH, set this (Windows example):
# TESSERACT_CMD = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
TESSERACT_CMD = None


def is_dot_dir(path: Path) -> bool:
    return path.is_dir() and path.name.startswith(".")


def should_skip_dir(path: Path) -> bool:
    if is_dot_dir(path):
        return True
    if path.name in EXTRA_SKIP_DIR_NAMES:
        return True
    return False


def iter_children_sorted(dir_path: Path) -> Iterable[Path]:
    try:
        kids = list(dir_path.iterdir())
    except OSError:
        return []
    kids.sort(key=lambda p: (0 if p.is_dir() else 1, p.name.lower()))
    return kids


def safe_stat_size(path: Path) -> int | None:
    try:
        return path.stat().st_size
    except OSError:
        return None


def should_skip_file(path: Path) -> Tuple[bool, str]:
    ext = path.suffix.lower()

    # PDFs/images are handled separately, don’t skip them by ext
    if ext in PDF_EXTS or ext in OCR_IMAGE_EXTS:
        return False, ""

    # skip some known binaries
    if ext in SKIP_FILE_EXTS:
        return True, f"skipped (ext {ext})"

    size = safe_stat_size(path)
    if size is None:
        return True, "skipped (cannot stat)"
    if size > MAX_FILE_BYTES:
        return True, f"skipped (too large: {size} bytes)"

    return False, ""


def read_text_file_safely(path: Path) -> Tuple[str, str]:
    """
    Returns (text, note). Note is non-empty if truncated or decoding issues.
    """
    try:
        raw = path.read_bytes()
    except OSError as e:
        return "", f"ERROR reading file: {e}"

    if b"\x00" in raw:
        return "", "skipped (binary content detected)"

    note = ""
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        text = raw.decode("utf-8", errors="replace")
        note = "NOTE: decoded with replacement (non-utf8 bytes present)"

    if len(text) > MAX_TEXT_CHARS_TO_WRITE:
        text = text[:MAX_TEXT_CHARS_TO_WRITE]
        note = (
            note + " | " if note else ""
        ) + f"NOTE: truncated to {MAX_TEXT_CHARS_TO_WRITE} chars"

    return text, note


def try_import_ocr() -> Tuple[object | None, object | None, str]:
    """
    Returns (pytesseract, PIL.Image, note)
    """
    try:
        import pytesseract  # type: ignore
    except Exception as e:
        return None, None, f"OCR unavailable: failed to import pytesseract ({e})"

    try:
        from PIL import Image  # type: ignore
    except Exception as e:
        return None, None, f"OCR unavailable: failed to import Pillow/PIL ({e})"

    if TESSERACT_CMD:
        try:
            pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
        except Exception:
            pass

    # Smoke-test: if tesseract binary missing, pytesseract errors on call; we handle later.
    return pytesseract, Image, ""


def ocr_jpg(jpg_path: Path, pytesseract, Image) -> Tuple[str, str]:
    """
    OCR a JPG file; returns (text, note)
    """
    try:
        img = Image.open(jpg_path)
        text = pytesseract.image_to_string(img)
        text = text.strip()
        if len(text) > MAX_TEXT_CHARS_TO_WRITE:
            text = text[:MAX_TEXT_CHARS_TO_WRITE]
            return (
                text,
                f"NOTE: OCR output truncated to {MAX_TEXT_CHARS_TO_WRITE} chars",
            )
        return text, ""
    except Exception as e:
        return "", f"OCR error: {e}"


def convert_image_to_jpg(src: Path, tmp_dir: Path, Image) -> Tuple[Path | None, str]:
    """
    Copy image to tmp and convert to JPG (even if already jpg).
    """
    try:
        copied = tmp_dir / f"{src.stem}{src.suffix.lower()}"
        shutil.copy2(src, copied)

        img = Image.open(copied)
        rgb = img.convert("RGB")
        out = tmp_dir / f"{src.stem}.jpg"
        rgb.save(out, "JPEG", quality=90)
        return out, ""
    except Exception as e:
        return None, f"image->jpg conversion error: {e}"


def pdf_to_jpgs(src: Path, tmp_dir: Path) -> Tuple[list[Path], str]:
    """
    Copy PDF to tmp and render pages to JPG using PyMuPDF (fitz).
    """
    try:
        import fitz  # PyMuPDF
    except Exception as e:
        return [], f"PDF render unavailable: failed to import PyMuPDF/fitz ({e})"

    try:
        copied = tmp_dir / src.name
        shutil.copy2(src, copied)

        doc = fitz.open(str(copied))
        page_count = doc.page_count
        if page_count > MAX_PDF_PAGES_OCR:
            return (
                [],
                f"skipped OCR (pdf has {page_count} pages > MAX_PDF_PAGES_OCR={MAX_PDF_PAGES_OCR})",
            )

        out_paths: list[Path] = []
        for i in range(page_count):
            page = doc.load_page(i)
            # 2x scale for better OCR readability
            mat = fitz.Matrix(2, 2)
            pix = page.get_pixmap(matrix=mat, alpha=False)

            out = tmp_dir / f"{src.stem}_page_{i + 1:03d}.jpg"
            pix.save(str(out))
            out_paths.append(out)

        doc.close()
        return out_paths, ""
    except Exception as e:
        return [], f"PDF render error: {e}"


def dump_file_with_content_or_ocr(
    path: Path, rel: Path, tmp_dir: Path, out_lines: list[str], depth: int
) -> None:
    prefix = INDENT * depth
    ext = path.suffix.lower()

    pytesseract, Image, ocr_note = try_import_ocr()

    # --- PDF OCR ---
    if ext in PDF_EXTS:
        out_lines.append(f"{prefix}📄 {rel}")
        if not pytesseract or not Image:
            out_lines.append(f"{prefix}{INDENT}--- {ocr_note} ---")
            out_lines.append(f"{prefix}{INDENT}--- skipped OCR for PDF ---")
            return

        jpgs, note = pdf_to_jpgs(path, tmp_dir)
        if note:
            out_lines.append(f"{prefix}{INDENT}--- {note} ---")
        if not jpgs:
            out_lines.append(f"{prefix}{INDENT}[no OCR output]")
            return

        out_lines.append(f"{prefix}{INDENT}--- BEGIN OCR (PDF): {rel} ---")
        for j, jpg in enumerate(jpgs, start=1):
            text, n2 = ocr_jpg(jpg, pytesseract, Image)
            out_lines.append(f"{prefix}{INDENT}[PAGE {j}]")
            if n2:
                out_lines.append(f"{prefix}{INDENT}--- {n2} ---")
            out_lines.append(
                f"{prefix}{INDENT}{text if text else '[no text detected]'}"
            )
            out_lines.append(f"{prefix}{INDENT}")  # blank line between pages
        out_lines.append(f"{prefix}{INDENT}--- END OCR (PDF): {rel} ---")
        return

    # --- Image OCR ---
    if ext in OCR_IMAGE_EXTS:
        out_lines.append(f"{prefix}📄 {rel}")
        if not pytesseract or not Image:
            out_lines.append(f"{prefix}{INDENT}--- {ocr_note} ---")
            out_lines.append(f"{prefix}{INDENT}--- skipped OCR for image ---")
            return

        jpg, note = convert_image_to_jpg(path, tmp_dir, Image)
        if note:
            out_lines.append(f"{prefix}{INDENT}--- {note} ---")
        if not jpg:
            out_lines.append(f"{prefix}{INDENT}[no OCR output]")
            return

        text, n2 = ocr_jpg(jpg, pytesseract, Image)
        if n2:
            out_lines.append(f"{prefix}{INDENT}--- {n2} ---")

        out_lines.append(f"{prefix}{INDENT}--- BEGIN OCR (IMAGE): {rel} ---")
        out_lines.append(f"{prefix}{INDENT}{text if text else '[no text detected]'}")
        out_lines.append(f"{prefix}{INDENT}--- END OCR (IMAGE): {rel} ---")
        return

    # --- CSV and other text files ---
    # Check if this is a known text file type that should always be included
    is_text_file = ext in TEXT_FILE_EXTS
    
    skip, why = should_skip_file(path)
    
    # Special handling for CSV files - add indicator
    if ext == ".csv":
        out_lines.append(f"{prefix}� {rel}  [CSV DATA]")
    else:
        out_lines.append(f"{prefix}�📄 {rel}")
    
    if skip and not is_text_file:
        out_lines.append(f"{prefix}{INDENT}--- {why} ---")
        return

    text, note = read_text_file_safely(path)
    if note:
        out_lines.append(f"{prefix}{INDENT}--- {note} ---")

    # Add special header for CSV files
    if ext == ".csv":
        out_lines.append(f"{prefix}{INDENT}--- BEGIN CSV DATA: {rel} ---")
    else:
        out_lines.append(f"{prefix}{INDENT}--- BEGIN FILE: {rel} ---")
    
    if text:
        for line in text.splitlines():
            out_lines.append(f"{prefix}{INDENT}{line}")
    else:
        out_lines.append(f"{prefix}{INDENT}[no text output]")
    
    # Add special footer for CSV files
    if ext == ".csv":
        out_lines.append(f"{prefix}{INDENT}--- END CSV DATA: {rel} ---")
    else:
        out_lines.append(f"{prefix}{INDENT}--- END FILE: {rel} ---")


def dump_dir(
    root: Path, dir_path: Path, depth: int, tmp_dir: Path, out_lines: list[str]
) -> None:
    for child in iter_children_sorted(dir_path):
        rel = child.relative_to(root)
        prefix = INDENT * depth

        if child.is_dir():
            if should_skip_dir(child):
                out_lines.append(f"{prefix}📁 {rel}/  [skipped dir]")
                continue
            out_lines.append(f"{prefix}📁 {rel}/")
            dump_dir(root, child, depth + 1, tmp_dir, out_lines)

        elif child.is_file():
            dump_file_with_content_or_ocr(child, rel, tmp_dir, out_lines, depth)

        else:
            out_lines.append(f"{prefix}❓ {rel}  [skipped non-regular file]")


def main() -> int:
    script_path = Path(__file__).resolve()
    root = script_path.parent

    # temp folder inside project root (NOT dot-prefixed, so you can inspect it if needed)
    tmp_dir = root / "_tmp_ocr"
    tmp_dir.mkdir(exist_ok=True)

    header = [
        "DIRECTORY TREE + FILE CONTENTS + OCR (PDF/IMAGES)",
        f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}",
        f"Root: {root}",
        f"Temp OCR folder: {tmp_dir}",
        "",
        "Legend: 📁 dir | 📄 file",
        "",
    ]

    out_lines: list[str] = []
    out_lines.extend(header)
    out_lines.append("📁 ./  (script root)")
    dump_dir(root, root, 1, tmp_dir, out_lines)

    output_path = root / OUTPUT_FILENAME
    try:
        output_path.write_text("\n".join(out_lines) + "\n", encoding="utf-8")
    except OSError as e:
        print(f"Failed to write output file: {output_path}\n{e}", file=sys.stderr)
        return 2

    print(f"Wrote: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
