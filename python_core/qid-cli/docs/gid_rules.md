QiID System Rules & Protocol

This document defines the strict logic governing the issuance and maintenance of QiIDs.

1. The Immutability Principle

No Reuse: Once a QiID is assigned to a specific file or project, that ID is "burnt." It can never be reassigned to another asset, even if the original asset is deleted.

No Changes: A QiID, once stamped into a file's YAML front matter, should never be modified.

2. ID Formatting

Precision: All Root IDs must be exactly 7 digits, prefixed with qid and suffixed with _0.

Hierarchy:

The suffix _0 explicitly denotes a Root (the parent or main container).

The suffix -N denotes a Child (a sub-component, version, or related file).

3. Banding Logic (COA Style)

New Root IDs must be issued from the range corresponding to their category. The qid tool automates this via path inference:

Path Keyword

Inferred Band

clients/ , cases/

CLIENT

qinoteos/ , modules/

PRODUCT

assets/

ASSETS

kb/

KNOWLEDGE (or PERSONAL)

_admin/ , system/

SYSTEM

Else

ORG

4. Lifecycle & Status

Active: Default status for all new IDs.

Archived: If a project ends, the ID is marked as archived in the registry. The ID is not returned to the pool; it remains a permanent tombstone for that asset.

Deleted: If an asset is deleted, the ID remains in the registry with a deleted status to prevent future sequence collisions.

5. File Integrity

Backups: The tool creates a .bak file before modifying any Markdown file.

Registry Locking: Concurrent writes are prevented via a .lock file to ensure the JSON database remains uncorrupted.