"""Text extraction from various file types."""
from pathlib import Path
from typing import Optional
import mimetypes

# Lazy imports for optional dependencies
try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

try:
    import docx
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False


async def extract_text(
    file_path: str,
    item_type: str
) -> str:
    """Extract text content from a file based on type."""
    path = Path(file_path)
    
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    if item_type == "pdf":
        return await extract_pdf_text(file_path)
    elif item_type == "docx":
        return await extract_docx_text(file_path)
    elif item_type == "note":
        return path.read_text(encoding="utf-8", errors="ignore")
    elif item_type in ["image", "audio", "video"]:
        # These require OCR/ASR - placeholder for now
        raise NotImplementedError(f"Extraction for {item_type} not yet implemented")
    else:
        # Try as plain text
        try:
            return path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return ""


async def extract_pdf_text(file_path: str) -> str:
    """Extract text from PDF."""
    if not HAS_PYMUPDF:
        raise ImportError("PyMuPDF (fitz) not installed. Install with: pip install pymupdf")
    
    doc = fitz.open(file_path)
    text_parts = []
    
    for page in doc:
        text_parts.append(page.get_text())
    
    doc.close()
    return "\n\n".join(text_parts)


async def extract_docx_text(file_path: str) -> str:
    """Extract text from DOCX."""
    if not HAS_DOCX:
        raise ImportError("python-docx not installed. Install with: pip install python-docx")
    
    doc = docx.Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs]
    return "\n\n".join(paragraphs)

