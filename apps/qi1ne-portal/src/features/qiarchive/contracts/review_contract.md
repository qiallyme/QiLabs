# Review Contract

## Purpose

This contract defines when files should be routed to manual review.

## Review Triggers

Route to review when:

- title cannot be determined confidently
- date cannot be determined and filename is too vague
- OCR quality is poor
- classification confidence is low
- file format is unsupported or malformed
- metadata extraction fails in a meaningful way

## Review Goals

The review queue exists to handle exceptions, not normal flow.

## Rule

The review queue must remain small and actionable.
It must not become a second unsorted inbox.
