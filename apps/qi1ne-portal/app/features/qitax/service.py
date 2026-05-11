"""
QiTax service layer — CRUD operations against Supabase.

All operations use service_role key (bypasses RLS) since this is a CLI tool.
When the dashboard lands, it will use user tokens and RLS will enforce access.
"""

import mimetypes
from pathlib import Path
from typing import Any

from supabase import Client

from .storage import (
    sha256_file,
    canonical_pdf_path,
    supporting_file_path,
)

BUCKET = "tax-returns"

# Note: tables live in the qione schema. When using supabase-py with service_role,
# you query them as "tax_returns" and set the schema header, OR use the full
# qualified name via RPC. supabase-py defaults to public schema, so we prefix.
# Actually, supabase-py's .table() allows schema override via the client config.
# For simplicity and reliability, we use the postgrest schema param.

TABLE_RETURNS = "tax_returns"
TABLE_FILES = "tax_return_files"
TABLE_AUDIT = "tax_return_audit"


def _table(sb: Client, name: str):
    """Access a table in the qione schema."""
    return sb.schema("qione").table(name)


def create_return(
    sb: Client,
    tenant_id: str,
    tax_year: int,
    return_type: str,
    filing_kind: str,
) -> dict[str, Any]:
    """Create a new tax return record in intake status."""
    payload = {
        "tenant_id": tenant_id,
        "tax_year": tax_year,
        "return_type": return_type,
        "filing_kind": filing_kind,
        "status": "intake",
        "version": 1,
    }
    res = _table(sb, TABLE_RETURNS).insert(payload).execute()
    return res.data[0]


def get_return(sb: Client, return_id: str) -> dict[str, Any]:
    """Fetch a single tax return by ID."""
    res = _table(sb, TABLE_RETURNS).select("*").eq("id", return_id).single().execute()
    return res.data


def list_returns(sb: Client, tenant_id: str) -> list[dict[str, Any]]:
    """List all returns for a tenant, newest first."""
    res = (
        _table(sb, TABLE_RETURNS)
        .select("*")
        .eq("tenant_id", tenant_id)
        .order("tax_year", desc=True)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


def set_status(sb: Client, return_id: str, status: str) -> dict[str, Any]:
    """Update the status of a tax return (triggers audit log via DB trigger)."""
    res = (
        _table(sb, TABLE_RETURNS)
        .update({"status": status})
        .eq("id", return_id)
        .execute()
    )
    return res.data[0] if res.data else None


def get_audit_trail(sb: Client, return_id: str) -> list[dict[str, Any]]:
    """Get the status audit history for a return."""
    res = (
        _table(sb, TABLE_AUDIT)
        .select("*")
        .eq("tax_return_id", return_id)
        .order("created_at", desc=False)
        .execute()
    )
    return res.data


def upload_to_storage(
    sb: Client,
    object_path: str,
    file_path: Path,
    content_type: str | None = None,
) -> Any:
    """Upload a file to the tax-returns storage bucket."""
    with file_path.open("rb") as f:
        data = f.read()
    return sb.storage.from_(BUCKET).upload(
        path=object_path,
        file=data,
        file_options={
            "content-type": content_type or "application/octet-stream",
            "upsert": "true",
        },
    )


def attach_file_record(
    sb: Client,
    return_id: str,
    role: str,
    object_path: str,
    file_path: Path,
    sha256: str,
) -> dict[str, Any]:
    """Insert a tax_return_files row linking an uploaded file to a return."""
    mime, _ = mimetypes.guess_type(str(file_path))
    payload = {
        "tax_return_id": return_id,
        "role": role,
        "object_path": object_path,
        "sha256": sha256,
        "bytes": file_path.stat().st_size,
        "mime_type": mime,
        "filename": file_path.name,
    }
    res = _table(sb, TABLE_FILES).insert(payload).execute()
    return res.data[0]


def upload_canonical_pdf(
    sb: Client,
    return_id: str,
    pdf_path: Path,
) -> dict[str, Any]:
    """Upload the canonical compiled return packet and update the return record."""
    ret = get_return(sb, return_id)
    sha = sha256_file(pdf_path)
    obj_path = canonical_pdf_path(
        ret["tenant_id"],
        int(ret["tax_year"]),
        ret["return_type"],
        ret["filing_kind"],
        int(ret["version"]),
    )

    mime, _ = mimetypes.guess_type(str(pdf_path))
    upload_to_storage(sb, obj_path, pdf_path, mime or "application/pdf")
    attach_file_record(sb, return_id, "final", obj_path, pdf_path, sha)

    # Update the return record with canonical PDF metadata
    res = (
        _table(sb, TABLE_RETURNS)
        .update({
            "canonical_pdf_path": obj_path,
            "canonical_pdf_sha256": sha,
            "canonical_pdf_bytes": pdf_path.stat().st_size,
        })
        .eq("id", return_id)
        .execute()
    )
    return res.data[0]


def upload_supporting_file(
    sb: Client,
    return_id: str,
    role: str,
    file_path: Path,
) -> dict[str, Any]:
    """Upload a supporting document (W-2, 1099, signed copy, etc.)."""
    ret = get_return(sb, return_id)
    sha = sha256_file(file_path)
    obj_path = supporting_file_path(
        ret["tenant_id"],
        int(ret["tax_year"]),
        ret["return_type"],
        ret["filing_kind"],
        int(ret["version"]),
        role,
        sha,
        file_path.name,
    )

    mime, _ = mimetypes.guess_type(str(file_path))
    upload_to_storage(sb, obj_path, file_path, mime)
    return attach_file_record(sb, return_id, role, obj_path, file_path, sha)
