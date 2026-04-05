# Naming Contract

## Purpose

This contract defines the stable naming system for documents and related records.

## Document ID Format

```text
QDOC-YYYY-NNNNNN
```

Example:

```text
QDOC-2026-000001
QDOC-2026-000145
```

## Rules

* `QDOC` is the fixed prefix for all document identities
* `YYYY` is the year the ID is assigned
* `NNNNNN` is a zero-padded sequential number
* IDs are permanent once assigned
* IDs must never be reused
* IDs must never be reassigned to different content

## Filename Format

```text
{doc_id}__{slug}__{doc_date}.pdf
```

Example:

```text
QDOC-2026-000145__marion_superior_court_order__2026-01-09.pdf
```

## Slug Rules

* lowercase only
* words separated by underscores
* no spaces
* no special punctuation except underscores
* concise but meaningful
* avoid vague names like `document`, `scan`, `file`, `misc`

## Date Rules

Preferred:

```text
YYYY-MM-DD
```

If unknown:

```text
undated
```

Example:

```text
QDOC-2026-000212__medical_bill_deaconess__undated.pdf
```

## Immutability Rule

The `doc_id` is authoritative.
The human-readable filename may evolve if metadata improves, but the `doc_id` must remain stable.
