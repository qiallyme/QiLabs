#!/usr/bin/env bash

set -euo pipefail

# ----------------------------------------
# Silence Isn't Distance - Export Pipeline
# ----------------------------------------
# Outputs:
#   ./export/silence-isnt-distance.epub
#   ./export/silence-isnt-distance-kindle.html
#   ./export/silence-isnt-distance-print.pdf
#   ./export/silence-isnt-distance-manuscript.docx
#   ./export/Silence-Isnt-Distance-PLAINTEXT.txt
#   ./export/Silence-Isnt-Distance-READING-MODE.txt
#   ./export-ready/MASTER_BOOK.md
#
# Requirements:
#   - pandoc installed
#   - optional: xelatex or weasyprint for PDF
# ----------------------------------------

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANUSCRIPT_DIR="$ROOT_DIR/export-ready"
EXPORT_DIR="$ROOT_DIR/export"

MASTER_MD="$MANUSCRIPT_DIR/MASTER_BOOK.md"
PLAINTEXT_MAIN="$EXPORT_DIR/Silence-Isnt-Distance-PLAINTEXT.txt"
PLAINTEXT_READING="$EXPORT_DIR/Silence-Isnt-Distance-READING-MODE.txt"

METADATA_FILE="$MANUSCRIPT_DIR/book.yml"
CSS_FILE="$MANUSCRIPT_DIR/book.css"

echo ">> Root directory:        $ROOT_DIR"
echo ">> Manuscript directory:  $MANUSCRIPT_DIR"
echo ">> Export directory:      $EXPORT_DIR"
echo

# 1) Basic checks
if ! command -v pandoc >/dev/null 2>&1; then
  echo "ERROR: pandoc is not installed. Please install pandoc and re-run." >&2
  exit 1
fi

if [ ! -d "$MANUSCRIPT_DIR" ]; then
  echo "ERROR: Manuscript directory '$MANUSCRIPT_DIR' not found." >&2
  exit 1
fi

mkdir -p "$EXPORT_DIR"

# 2) Collect ordered chapter files (00-...md to 25-...md)
echo ">> Collecting manuscript files from export-ready/ ..."
mapfile -t BOOK_FILES < <(ls "$MANUSCRIPT_DIR"/[0-9][0-9]-*.md "$MANUSCRIPT_DIR"/[0-9][0-9]a-*.md 2>/dev/null | sort -V)

if [ "${#BOOK_FILES[@]}" -eq 0 ]; then
  echo "ERROR: No numbered .md files found in $MANUSCRIPT_DIR." >&2
  exit 1
fi

echo ">> Files detected (in order):"
for f in "${BOOK_FILES[@]}"; do
  echo "   - $(basename "$f")"
done
echo

# 3) Build MASTER_BOOK.md with explicit page breaks
echo ">> Building MASTER_BOOK.md ..."
{
  echo "---"
  echo "title: \"Silence Isn't Distance\""
  echo "author: \"Q — Cody Rice-Velasquez\""
  echo "language: \"en-US\""
  echo "---"
  echo

  idx=0
  for f in "${BOOK_FILES[@]}"; do
    ((idx++))
    base="$(basename "$f")"
    echo "<!-- FILE: $base -->"
    echo

    cat "$f"

    echo

    if [ "$idx" -lt "${#BOOK_FILES[@]}" ]; then
      echo
      echo "<!-- Page Break -->"
      echo
      echo "\\newpage"
      echo
    fi
  done
} > "$MASTER_MD"

echo ">> MASTER_BOOK.md created at: $MASTER_MD"
echo

# 4) Build common pandoc args
PANDOC_INPUT=( "$MASTER_MD" )
PANDOC_COMMON_OPTS=( "--toc" )

if [ -f "$METADATA_FILE" ]; then
  echo ">> Using metadata file: $METADATA_FILE"
  PANDOC_COMMON_OPTS+=( "--metadata-file=$METADATA_FILE" )
fi

if [ -f "$CSS_FILE" ]; then
  echo ">> Using CSS file for HTML/EPUB: $CSS_FILE"
fi

echo

# 5) Export: EPUB
echo ">> Exporting EPUB ..."
EPUB_OUT="$EXPORT_DIR/silence-isnt-distance.epub"
if [ -f "$CSS_FILE" ]; then
  pandoc "${PANDOC_INPUT[@]}" \
    "${PANDOC_COMMON_OPTS[@]}" \
    --css="$CSS_FILE" \
    -o "$EPUB_OUT"
else
  pandoc "${PANDOC_INPUT[@]}" \
    "${PANDOC_COMMON_OPTS[@]}" \
    -o "$EPUB_OUT"
fi
echo "   -> $EPUB_OUT"
echo

# 6) Export: KDP HTML (for Kindle)
echo ">> Exporting KDP HTML ..."
KINDLE_HTML_OUT="$EXPORT_DIR/silence-isnt-distance-kindle.html"
if [ -f "$CSS_FILE" ]; then
  pandoc "${PANDOC_INPUT[@]}" \
    "${PANDOC_COMMON_OPTS[@]}" \
    --css="$CSS_FILE" \
    -t html5 \
    -o "$KINDLE_HTML_OUT"
else
  pandoc "${PANDOC_INPUT[@]}" \
    "${PANDOC_COMMON_OPTS[@]}" \
    -t html5 \
    -o "$KINDLE_HTML_OUT"
fi
echo "   -> $KINDLE_HTML_OUT"
echo

# 7) Export: DOCX
echo ">> Exporting DOCX manuscript ..."
DOCX_OUT="$EXPORT_DIR/silence-isnt-distance-manuscript.docx"
pandoc "${PANDOC_INPUT[@]}" \
  "${PANDOC_COMMON_OPTS[@]}" \
  -o "$DOCX_OUT"
echo "   -> $DOCX_OUT"
echo

# 8) Export: Print-ready PDF (basic)
echo ">> Exporting print PDF ..."
PDF_OUT="$EXPORT_DIR/silence-isnt-distance-print.pdf"

PDF_ENGINE=""
if command -v xelatex >/dev/null 2>&1; then
  PDF_ENGINE="xelatex"
elif command -v weasyprint >/dev/null 2>&1; then
  PDF_ENGINE="weasyprint"
fi

if [ -n "$PDF_ENGINE" ]; then
  echo "   Using PDF engine: $PDF_ENGINE"
  if [ -f "$CSS_FILE" ] && [ "$PDF_ENGINE" != "xelatex" ]; then
    # CSS works better with HTML->PDF engines like weasyprint
    pandoc "${PANDOC_INPUT[@]}" \
      "${PANDOC_COMMON_OPTS[@]}" \
      --css="$CSS_FILE" \
      --pdf-engine="$PDF_ENGINE" \
      -o "$PDF_OUT"
  else
    pandoc "${PANDOC_INPUT[@]}" \
      "${PANDOC_COMMON_OPTS[@]}" \
      --pdf-engine="$PDF_ENGINE" \
      -o "$PDF_OUT"
  fi
  echo "   -> $PDF_OUT"
else
  echo "   WARNING: No xelatex or weasyprint found. Skipping PDF export."
fi
echo

# 9) Export: Plaintext (for ElevenLabs / general reading)
echo ">> Exporting plain text (chaptered) ..."
pandoc "${PANDOC_INPUT[@]}" \
  -t plain \
  -o "$PLAINTEXT_MAIN"

echo "   -> $PLAINTEXT_MAIN"
echo

# 10) Export: Plaintext Reading Mode (compressed spacing)
echo ">> Creating plain text READING-MODE version ..."
# Normalize multiple blank lines to at most 2, strip trailing spaces
sed -E 's/[[:space:]]+$//g; :a;N;$!ba;s/\n{3,}/\n\n/g' \
  "$PLAINTEXT_MAIN" > "$PLAINTEXT_READING"

echo "   -> $PLAINTEXT_READING"
echo

# 11) Summary
echo "----------------------------------------"
echo "All exports complete. Files are in: $EXPORT_DIR"
echo "MASTER_BOOK.md is in: $MASTER_MD"
echo "Ready for KDP, Ingram, Reedsy, and ElevenLabs."
echo "----------------------------------------"
