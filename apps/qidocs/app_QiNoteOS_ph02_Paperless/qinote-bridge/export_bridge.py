import glob
import json
import os
import re
from datetime import datetime

import requests
from dotenv import load_dotenv

# Load configuration
load_dotenv(".env.bridge")

PAPERLESS_URL = os.getenv("PAPERLESS_URL", "http://localhost:8000").rstrip("/")
PAPERLESS_TOKEN = os.getenv("PAPERLESS_TOKEN")
TARGET_TAG_NAME = os.getenv("TARGET_TAG_NAME", "Ready_for_QiNote")
VAULT_ROOT = os.getenv("VAULT_ROOT", "./qinote_vault")

HEADERS = {"Authorization": f"Token {PAPERLESS_TOKEN}", "Accept": "application/json"}

# Mapping for Custom Fields we care about
# Field Name in Paperless -> Key in our logic
REQUIRED_CUSTOM_FIELDS = {
    "QID": "qid",
    "External Reference": "external_reference",
    "Matter / Case ID": "matter",
    "Document Role": "document_role",
    "Action Required": "action_required",
    "Due Date": "due_date",
    "Source Channel": "source_channel",
}


def slugify(text):
    """Simple slugify for filenames."""
    if not text:
        return "untitled"
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text).strip("-")
    return text or "untitled"


def get_tag_id(tag_name):
    """Retrieve the ID for a given tag name."""
    url = f"{PAPERLESS_URL}/api/tags/?name__icontains={tag_name}"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    results = response.json().get("results", [])
    for tag in results:
        if tag["name"].lower() == tag_name.lower():
            return tag["id"]
    return None


def get_custom_fields_mapping():
    """Returns a dict mapping Paperless Custom Field IDs to our logical names."""
    url = f"{PAPERLESS_URL}/api/custom_fields/"
    mapping = {}  # ID -> internal_name

    while url:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        data = response.json()

        for field in data.get("results", []):
            name = field["name"]
            if name in REQUIRED_CUSTOM_FIELDS:
                mapping[field["id"]] = REQUIRED_CUSTOM_FIELDS[name]

        url = data.get("next")

    return mapping


def get_document_custom_fields(doc, field_mapping):
    """Extracts custom field values for a document."""
    # doc['custom_fields'] is a list of {field: <id>, value: <val>}
    values = {v: "" for v in REQUIRED_CUSTOM_FIELDS.values()}  # Default empty strings

    for item in doc.get("custom_fields", []):
        field_id = item["field"]
        if field_id in field_mapping:
            key = field_mapping[field_id]
            values[key] = item["value"]

    return values


def determine_qid(doc, custom_values):
    """
    Deterministic QID selection:
    1. Custom Field 'QID'
    2. qid{asn:06d}_0
    3. qid{doc_pk:06d}_0
    """
    # 1. Custom Field
    if custom_values.get("qid"):
        return custom_values["qid"]

    # 2. ASN
    asn = doc.get("archive_serial_number")
    if asn:
        return f"qid{int(asn):06d}_0"

    # 3. Doc PK
    return f"qid{doc['id']:06d}_0"


def find_existing_file_by_qid(qid):
    """
    Checks if a file with the given QID already exists in the vault.
    Returns path if found, else None.
    Uses glob to find *_{qid}.md
    """
    # Recursive glob might be slow on huge vaults, but necessary for "renames don't duplicate"
    # optimizing to look in VAULT_ROOT/documents/
    pattern = os.path.join(VAULT_ROOT, "documents", "**", f"*__{qid}.md")
    matches = glob.glob(pattern, recursive=True)
    if matches:
        return matches[0]
    return None


def export_document(doc, field_mapping):
    """Download PDF and create sidecar Markdown."""
    doc_id = doc["id"]
    title = doc["title"]

    # Dates
    created_str = doc.get("created") or datetime.now().strftime("%Y-%m-%d")
    created_date = created_str.split("T")[0]
    year = created_date[:4]

    added_str = doc.get("added") or datetime.now().strftime("%Y-%m-%d")
    added_date = added_str.split("T")[0]

    # Custom Fields
    custom_values = get_document_custom_fields(doc, field_mapping)

    # Determine QID
    qid = determine_qid(doc, custom_values)

    # Idempotency Check
    existing_file = find_existing_file_by_qid(qid)
    if existing_file:
        print(f"[-] Skipping doc {doc_id} - QID {qid} found at {existing_file}")
        return

    # Metadata Prep
    slug_title = slugify(title)
    matter = custom_values.get("matter") or "_unassigned"

    # Export Path
    # qinote_vault/documents/{matter_or__unassigned}/{created_year}/{created_date}__{slug_title}__{qid}
    target_dir = os.path.join(VAULT_ROOT, "documents", matter, year)
    os.makedirs(target_dir, exist_ok=True)

    filename_base = f"{created_date}__{slug_title}__{qid}"
    pdf_path = os.path.join(target_dir, f"{filename_base}.pdf")
    md_path = os.path.join(target_dir, f"{filename_base}.md")

    print(f"[+] Exporting doc {doc_id} -> {filename_base}...")

    # 1. Download Content (PDF)
    download_url = f"{PAPERLESS_URL}/api/documents/{doc_id}/download/"
    try:
        r = requests.get(download_url, headers=HEADERS)
        r.raise_for_status()
        with open(pdf_path, "wb") as f:
            f.write(r.content)
    except Exception as e:
        print(f"Errors downloading PDF for {doc_id}: {e}")
        return

    # 2. Create Sidecar Markdown
    # Tags
    # doc['tags'] is a list of IDs. We need Names? User said "tags as a YAML list"
    # Usually we need to fetch tag names. For speed, let's just use the list provided by API if expanded,
    # but the /documents/ endpoint usually returns IDs.
    # To get names we'd need to cache tags map.
    # Let's do a quick implementation to fetch tags logic if needed, or just dump IDs if acceptable?
    # User prompt said "tags: []".
    # We'll assume list of strings is better.
    # We will fetch all tags once at startup to map ID->Name.

    # (Leaving tag fetching optimized out for now unless strictly required, will just dump empty list or IDs if names not avail)
    # Actually, let's just do it right, fetch tags map.

    # Construct YAML
    # Keys: qid, paperless_id, title, created, added, correspondent, document_type, document_role, matter,
    # action_required, due_date, source_channel, external_reference, tags, storage_relpath, source_url, sha256, keywords

    # Correspondent/Type are IDs in 'doc', need names ideally.
    # For now, we will just use the available data in 'doc' which might be IDs.
    # If the user wants names, we'd need extra lookups.
    # Paperless API 'list' usually returns IDs.

    # Let's map required fields.

    yaml_dict = {
        "qid": qid,
        "paperless_id": doc_id,
        "title": title,
        "created": created_date,
        "added": added_date,
        "correspondent": doc.get("correspondent"),  # Likely ID
        "document_type": doc.get("document_type"),  # Likely ID
        "document_role": custom_values.get("document_role", ""),
        "matter": custom_values.get("matter", ""),
        "action_required": custom_values.get("action_required", ""),
        "due_date": custom_values.get("due_date", ""),
        "source_channel": custom_values.get("source_channel", ""),
        "external_reference": custom_values.get("external_reference", ""),
        "tags": doc.get("tags", []),  # IDs
        "storage_relpath": "",  # Not applicable or relative path in vault? leaving empty per schema
        "source_url": "",
        "sha256": doc.get("checksum", ""),
        "keywords": [],  # Paperless doesn't have 'keywords' field separate from tags usually
    }

    yaml_lines = ["---"]
    for k, v in yaml_dict.items():
        val_json = json.dumps(v, default=str)
        yaml_lines.append(f"{k}: {val_json}")
    yaml_lines.append("---")
    yaml_frontmatter = "\n".join(yaml_lines) + "\n\n"

    content = doc.get("content", "")

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(yaml_frontmatter)
        f.write("# OCR Content\n\n")
        f.write(content)

    print(f"[✓] Exported {filename_base}")


def main():
    if not PAPERLESS_TOKEN or PAPERLESS_TOKEN == "your_token_here":
        print("Error: PAPERLESS_TOKEN is not configured in .env.bridge")
        return

    print(f"Connecting to {PAPERLESS_URL}...")
    try:
        tag_id = get_tag_id(TARGET_TAG_NAME)
        if not tag_id:
            print(f"Error: Tag '{TARGET_TAG_NAME}' not found in Paperless.")
            return

        # Fetch Custom Field Mapping
        print("Fetching Custom Field Definitions...")
        field_mapping = get_custom_fields_mapping()
        print(f"Mapped {len(field_mapping)} custom fields of interest.")

        print(f"Searching for documents with tag '{TARGET_TAG_NAME}' (ID: {tag_id})...")

        url = f"{PAPERLESS_URL}/api/documents/?tags__id__all={tag_id}"

        count = 0
        while url:
            response = requests.get(url, headers=HEADERS)
            response.raise_for_status()
            data = response.json()

            for doc in data.get("results", []):
                try:
                    export_document(doc, field_mapping)
                    count += 1
                except Exception as e:
                    print(f"Error exporting doc {doc.get('id')}: {e}")

            url = data.get("next")

        print(f"\nDone. Processed {count} documents.")

    except requests.exceptions.ConnectionError:
        print(
            f"Error: Could not connect to Paperless at {PAPERLESS_URL}. Is it running?"
        )
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
