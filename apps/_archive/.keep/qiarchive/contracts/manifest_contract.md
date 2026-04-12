# Manifest Contract

## Purpose

This contract defines the portable tracking records for all documents handled by QiArchive.

## Required Manifest Formats

- CSV
- JSONL

## Minimum Columns

- `doc_id`
- `sha256`
- `original_filename`
- `current_filename`
- `doc_date`
- `title`
- `slug`
- `source`
- `status`
- `duplicate_of`
- `created_at`
- `updated_at`

## Rules

- every canonical document must have exactly one active manifest record
- exact duplicates must be logged, not silently discarded
- manifest records must persist independently of Paperless
- manifest records are part of the portability layer

## Purpose of the Manifest

The manifest exists to preserve:

- identity continuity
- auditability
- migration safety
- cross-tool references
- future AI and knowledge integrations
