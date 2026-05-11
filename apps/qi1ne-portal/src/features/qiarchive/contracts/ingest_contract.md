# Ingest Contract

## Purpose

This contract defines the required sequence for document intake.

## Required Sequence

```text
capture
→ inbox
→ fingerprint
→ duplicate check
→ assign doc_id
→ rename
→ manifest entry
→ Paperless consume
→ OCR/indexing
→ archive/search
```

## Core Rules

1. No file bypasses the inbox.
2. No file receives a `QDOC` ID before fingerprinting.
3. No duplicate receives a new canonical ID.
4. No file enters archive without a manifest entry.
5. Ingestion should be automatic wherever possible.

## Desired Outcome

A user should not need to remember whether Paperless is running or whether ingestion is active.

## Operational Expectation

The system should behave as background infrastructure, not as an app requiring manual activation.
