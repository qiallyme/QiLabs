"""Document classification — infers doc type from filename + content heuristics."""

from __future__ import annotations

from pathlib import Path


# Simple keyword-based rules — extend with ML later
_TYPE_RULES: list[tuple[list[str], str]] = [
    (["invoice", "inv_"], "invoice"),
    (["receipt"], "receipt"),
    (["contract", "agreement"], "contract"),
    (["report"], "report"),
    (["memo", "memorandum"], "memo"),
    (["letter"], "letter"),
    (["resume", "cv"], "resume"),
    (["statement"], "statement"),
    (["tax", "w2", "1099"], "tax_document"),
    (["id_", "passport", "license"], "identification"),
    (["photo", "img_", "dsc_"], "photograph"),
    (["scan", "scanned"], "scanned_document"),
]


def classify_document(
    filename: str,
    mime_type: str = "",
    text_snippet: str = "",
) -> dict:
    """Return inferred document metadata from filename heuristics.

    Returns dict with keys: doc_type, confidence
    """
    lower = filename.lower()

    for keywords, doc_type in _TYPE_RULES:
        if any(kw in lower for kw in keywords):
            return {"doc_type": doc_type, "confidence": 0.7}

    # Fallback by MIME type
    if mime_type.startswith("image/"):
        return {"doc_type": "image", "confidence": 0.5}
    if "spreadsheet" in mime_type or mime_type.endswith("csv"):
        return {"doc_type": "spreadsheet", "confidence": 0.6}
    if "pdf" in mime_type:
        return {"doc_type": "pdf_document", "confidence": 0.4}

    return {"doc_type": "unknown", "confidence": 0.1}
