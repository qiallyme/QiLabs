"""
QiTax CLI — __main__ entry point.

Usage:
    python -m qitax_cli <command> [options]

Commands:
    create-return    Create a new tax return record
    set-status       Update the status of a return
    upload-canonical Upload the compiled return packet PDF
    upload-file      Upload a supporting document
    list-returns     List all returns for a tenant
    audit            Show audit trail for a return
"""

import argparse
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

from . import service


def get_supabase_client():
    """Create a Supabase client using service role credentials from env."""
    load_dotenv()
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env or environment.", file=sys.stderr)
        sys.exit(1)
    return create_client(url, key)


def pp(data):
    """Pretty-print JSON output."""
    print(json.dumps(data, indent=2, default=str))


def main():
    parser = argparse.ArgumentParser(
        prog="qitax-cli",
        description="QiTax — Tax Return Storage CLI",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # -- create-return --
    cmd_create = sub.add_parser("create-return", help="Create a new tax return")
    cmd_create.add_argument("--tenant-id", required=True, help="Tenant UUID")
    cmd_create.add_argument("--tax-year", type=int, required=True, help="Tax year (e.g. 2025)")
    cmd_create.add_argument("--return-type", required=True, help="Return type (e.g. 1040, IN-IT40)")
    cmd_create.add_argument("--filing-kind", required=True, choices=["original", "amended"])

    # -- set-status --
    cmd_status = sub.add_parser("set-status", help="Update return status")
    cmd_status.add_argument("--return-id", required=True, help="Return UUID")
    cmd_status.add_argument(
        "--status", required=True,
        choices=["intake", "prep", "review", "signature", "ready_to_file", "filed", "accepted"],
    )

    # -- upload-canonical --
    cmd_canonical = sub.add_parser("upload-canonical", help="Upload the canonical return packet PDF")
    cmd_canonical.add_argument("--return-id", required=True, help="Return UUID")
    cmd_canonical.add_argument("--pdf", required=True, help="Path to the compiled PDF")

    # -- upload-file --
    cmd_file = sub.add_parser("upload-file", help="Upload a supporting document")
    cmd_file.add_argument("--return-id", required=True, help="Return UUID")
    cmd_file.add_argument("--role", required=True, choices=["source", "signed", "draft"], help="File role")
    cmd_file.add_argument("--file", required=True, help="Path to the file")

    # -- list-returns --
    cmd_list = sub.add_parser("list-returns", help="List returns for a tenant")
    cmd_list.add_argument("--tenant-id", required=True, help="Tenant UUID")

    # -- audit --
    cmd_audit = sub.add_parser("audit", help="Show status audit trail")
    cmd_audit.add_argument("--return-id", required=True, help="Return UUID")

    args = parser.parse_args()
    sb = get_supabase_client()

    if args.command == "create-return":
        result = service.create_return(
            sb,
            tenant_id=args.tenant_id,
            tax_year=args.tax_year,
            return_type=args.return_type,
            filing_kind=args.filing_kind,
        )
        print(f"✅ Created return: {result['id']}")
        pp(result)

    elif args.command == "set-status":
        result = service.set_status(sb, args.return_id, args.status)
        if result:
            print(f"✅ Status updated to: {result['status']}")
            pp(result)
        else:
            print("❌ Return not found or update failed.", file=sys.stderr)
            sys.exit(1)

    elif args.command == "upload-canonical":
        pdf_path = Path(args.pdf)
        if not pdf_path.exists():
            print(f"❌ File not found: {pdf_path}", file=sys.stderr)
            sys.exit(1)
        result = service.upload_canonical_pdf(sb, args.return_id, pdf_path)
        print(f"✅ Canonical PDF uploaded: {result['canonical_pdf_path']}")
        pp(result)

    elif args.command == "upload-file":
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"❌ File not found: {file_path}", file=sys.stderr)
            sys.exit(1)
        result = service.upload_supporting_file(sb, args.return_id, args.role, file_path)
        print(f"✅ File uploaded as '{args.role}': {result['object_path']}")
        pp(result)

    elif args.command == "list-returns":
        results = service.list_returns(sb, args.tenant_id)
        if not results:
            print("No returns found.")
        else:
            print(f"Found {len(results)} return(s):")
            for r in results:
                print(f"  [{r['status']:>15}] {r['tax_year']} {r['return_type']} ({r['filing_kind']}) — {r['id']}")

    elif args.command == "audit":
        results = service.get_audit_trail(sb, args.return_id)
        if not results:
            print("No audit history.")
        else:
            print(f"Audit trail ({len(results)} entries):")
            for entry in results:
                from_s = entry.get("from_status") or "—"
                to_s = entry["to_status"]
                ts = entry["created_at"]
                msg = entry.get("message") or ""
                print(f"  {ts}  {from_s} → {to_s}  {msg}")


if __name__ == "__main__":
    main()
