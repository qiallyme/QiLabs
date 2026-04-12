"""
Storage path builder + SHA-256 helpers for tax return files.

Path convention (deterministic, collision-free):
  Canonical:  tenant/{tenant_id}/{tax_year}/{return_type}/{filing_kind}/v{version}/ReturnPacket.pdf
  Supporting: tenant/{tenant_id}/{tax_year}/{return_type}/{filing_kind}/v{version}/{role}/{sha256}_{filename}
"""

import hashlib
from pathlib import Path


def sha256_file(file_path: Path) -> str:
    """Compute SHA-256 hex digest of a file, streaming 1 MB chunks."""
    h = hashlib.sha256()
    with file_path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def build_base_path(
    tenant_id: str,
    tax_year: int,
    return_type: str,
    filing_kind: str,
    version: int,
) -> str:
    """Build the base storage prefix for a return."""
    return f"tenant/{tenant_id}/{tax_year}/{return_type}/{filing_kind}/v{version}"


def canonical_pdf_path(
    tenant_id: str,
    tax_year: int,
    return_type: str,
    filing_kind: str,
    version: int,
) -> str:
    """Full object path for the canonical compiled return packet."""
    base = build_base_path(tenant_id, tax_year, return_type, filing_kind, version)
    return f"{base}/ReturnPacket.pdf"


def supporting_file_path(
    tenant_id: str,
    tax_year: int,
    return_type: str,
    filing_kind: str,
    version: int,
    role: str,
    sha256: str,
    filename: str,
) -> str:
    """Full object path for a supporting document."""
    base = build_base_path(tenant_id, tax_year, return_type, filing_kind, version)
    safe_name = filename.replace(" ", "_")
    return f"{base}/{role}/{sha256}_{safe_name}"
