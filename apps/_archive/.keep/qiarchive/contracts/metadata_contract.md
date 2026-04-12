# Metadata Contract

## Purpose

This contract defines the minimum metadata required for tracked documents.

## Minimum Required Fields

- `doc_id`
- `sha256`
- `original_filename`
- `current_filename`
- `title`
- `slug`
- `source`
- `status`
- `created_at`
- `updated_at`

## Preferred Fields

- `doc_date`
- `tags`
- `document_type`
- `correspondent`
- `duplicate_of`
- `paperless_id`
- `notes_ref`

## Field Rules

### `doc_id`

Permanent document identity.

### `sha256`

Exact content fingerprint for integrity and dedupe.

### `original_filename`

The filename at the moment of intake.

### `current_filename`

The current canonical filename after naming rules are applied.

### `source`

Where the file came from.

Examples:

- `google_drive_inbox`
- `manual_drop`
- `scanner`
- `email_import`

### `status`

Allowed values:

- `inbox`
- `review`
- `processed`
- `archived`
- `duplicate`
- `quarantine`
- `error`

### `duplicate_of`

If duplicate, this points to the canonical `doc_id`.

## Authority Rule

Metadata records outside platform-specific tools are authoritative for identity continuity.
