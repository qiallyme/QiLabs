# 📄 Pipeline Implementation Contract: QiVault Docs & Ingestion

This document defines the interface between the **Ingestion Pipeline** (Worker) and the **QiVault Docs** (UI/Database).

## 1. Database Interface

The Pipeline worker is granted `service_role` access to write directly to:

- `qivault.documents`
- `qivault.document_files`
- `qivault.fts_index`

### Row Creation Order

1. Create `document` (status: 'inbox')
2. Create `document_files` for 'original' variant.
3. (Optional) Run OCR/Normalizer and create 'ocr_pdf' and 'extracted_text' variants.
4. Update `fts_index` with concatenated extracted text.

## 2. File Storage Standard

Storage must happen in the `qivault-blobs` bucket.
Key Template: `/{tenant_id}/{yyyy}/{mm}/{doc_id}/{file_id}/{variant}`

### Variant Registry

| Variant | Purpose | Recommended MIME |
|---------|---------|------------------|
| `original` | The exact uploaded file | varies |
| `ocr_pdf` | Searchable PDF container | `application/pdf` |
| `extracted_text` | Raw OCR output | `text/plain` |
| `thumbnail` | Small preview image | `image/jpeg` |
| `preview_jpg` | Full-page render | `image/jpeg` |

## 3. Integrity Requirements

- **Hash**: SHA-256 (Hex) is mandatory.
- **Verification**: The Pipeline must set `integrity_status = 'verified'` and `last_verified_at = now()` upon successful storage confirmation.

## 4. Trigger Points

- **Post-Normalize**: The `normalize_inbox.ts` script should trigger the Ingestion API or directly insert into these tables.
- **Webhook**: QiVault Docs can listen to `ingestion_jobs` status changes via Supabase Realtime to update the UI on completion.
