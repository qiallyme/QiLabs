# Duplicate Contract

## Purpose

This contract defines how exact duplicates are detected and handled.

## Detection Method

Exact duplicate detection is based on SHA-256 content hash.

## Rules

- identical content hash = exact duplicate
- exact duplicates do not receive new canonical IDs
- duplicates must be logged
- duplicates should be moved to quarantine unless explicitly configured otherwise

## Canonical Rule

The first accepted canonical document retains ownership of the hash.

## Duplicate Outcomes

Allowed outcomes:

- quarantine
- log and ignore
- attach to duplicate report

Not allowed:

- silent overwrite
- silent deletion without trace
- assigning a second canonical document ID to identical content
