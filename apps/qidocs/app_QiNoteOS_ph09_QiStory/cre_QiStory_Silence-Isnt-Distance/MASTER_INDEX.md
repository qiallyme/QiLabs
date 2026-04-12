# Master Index — Silence Isn't Distance

**Complete Table of Contents and File Manifest**

---

## Book Structure

This master index ensures all files are accounted for and properly linked. All export-ready files are located in the `export-ready/` directory.

---

## Front Matter

1. **[Cover](export-ready/00-cover.md)** — Book cover image and title
2. **[Title Page](export-ready/01-title-page.md)** — Title page with author and series information

---

## Introduction

3. **[Dedication](export-ready/02-dedication.md)** — Dedication to Deep Feelers
4. **[Content Considerations (Gentle Trauma Warning)](export-ready/02a-content-considerations.md)** — Content warning and self-care guidance
5. **[Preface — Why This Book Exists](export-ready/03-preface.md)** — Author's introduction to the book's purpose
6. **[How to Use This Book](export-ready/04-how-to-use-this-book.md)** — Guide to reading and using the book
7. **[Introduction — When Silence Is Misunderstood](export-ready/05-introduction.md)** — Main introduction to the book's themes

---

## Part I: Awakening

8. **[Chapter 1 — The Overloaded Mind](export-ready/06-chapter-01-overloaded-mind.md)** — Understanding mental overload and capacity
9. **[Chapter 2 — The Emotional Architecture](export-ready/07-chapter-02-emotional-architecture.md)** — The Deep Feeler's emotional system
10. **[Chapter 3 — The Myth of the Quiet Person](export-ready/08-chapter-03-mirror-misunderstanding.md)** — How silence gets misinterpreted

---

## Part II: Understanding

11. **[Chapter 4 — The Misread Retreat](export-ready/09-chapter-04-science-of-withdrawal.md)** — Withdrawal as a survival response
12. **[Chapter 5 — Shutdown Triggers](export-ready/10-chapter-05-shutdown-triggers.md)** — What causes system collapse
13. **[Chapter 6 — Survival-Mode Love](export-ready/11-chapter-06-survival-mode-love.md)** — When caring makes you shut down

---

## Part III: The Invisible Weight

14. **[Chapter 7 — Responsibility and Overfunctioning](export-ready/12-chapter-07-overfunctioning.md)** — When being the strong one becomes the weakest point
15. **[Chapter 8 — Projection and the Mirror Effect](export-ready/13-chapter-08-projection-mirror.md)** — When people see you through their wounds
16. **[Chapter 9 — Burnout, Breakdown, Dissociation](export-ready/14-chapter-09-burnout-breakdown-dissociation.md)** — When the system goes offline

---

## Part IV: Relationships with the Overwhelmed

17. **[Chapter 10 — Loving Someone Who Retreats](export-ready/15-chapter-10-loving-someone-who-retreats.md)** — How to stay connected without chasing or pushing
18. **[Chapter 11 — What People Often Get Wrong](export-ready/16-chapter-11-what-people-get-wrong.md)** — Common misunderstandings about Deep Feelers
19. **[Chapter 12 — Repair and Reconnection](export-ready/17-chapter-12-repair-reconnection.md)** — How to rebuild after shutdown

---

## Part V: Reclaiming the Self

20. **[Chapter 13 — Emotional Bandwidth](export-ready/18-chapter-13-emotional-bandwidth.md)** — Understanding capacity vs. desire
21. **[Chapter 14 — Healing Survival Patterns](export-ready/19-chapter-14-healing-survival-patterns.md)** — Updating old protective responses
22. **[Chapter 15 — Coming Home to Silence](export-ready/20-chapter-15-coming-home-to-silence.md)** — Reclaiming silence as sanctuary

---

## Closing

23. **[Epilogue — The Ones Who Disappear](export-ready/21-epilogue.md)** — Final thoughts on silence and survival
24. **[Acknowledgments](export-ready/22-acknowledgements.md)** — Gratitude and credits
25. **[About the Author](export-ready/23-about-the-author.md)** — Author's note and background
26. **[Back of Book Summary](export-ready/24-back-of-book-summary.md)** — Book description and key points
27. **[Bibliography](export-ready/25-bibliography.md)** — References and influences
28. **[Glossary](export-ready/25a-glossary.md)** — Key terms and definitions

---

## File Verification

### Total Files: 28/28 ✅

**Front Matter (2 files):**
- ✅ 00-cover.md
- ✅ 01-title-page.md

**Introduction (5 files):**
- ✅ 02-dedication.md
- ✅ 02a-content-considerations.md
- ✅ 03-preface.md
- ✅ 04-how-to-use-this-book.md
- ✅ 05-introduction.md

**Chapters (15 files):**
- ✅ 06-chapter-01-overloaded-mind.md
- ✅ 07-chapter-02-emotional-architecture.md
- ✅ 08-chapter-03-mirror-misunderstanding.md
- ✅ 09-chapter-04-science-of-withdrawal.md
- ✅ 10-chapter-05-shutdown-triggers.md
- ✅ 11-chapter-06-survival-mode-love.md
- ✅ 12-chapter-07-overfunctioning.md
- ✅ 13-chapter-08-projection-mirror.md
- ✅ 14-chapter-09-burnout-breakdown-dissociation.md
- ✅ 15-chapter-10-loving-someone-who-retreats.md
- ✅ 16-chapter-11-what-people-get-wrong.md
- ✅ 17-chapter-12-repair-reconnection.md
- ✅ 18-chapter-13-emotional-bandwidth.md
- ✅ 19-chapter-14-healing-survival-patterns.md
- ✅ 20-chapter-15-coming-home-to-silence.md

**Closing (6 files):**
- ✅ 21-epilogue.md
- ✅ 22-acknowledgements.md
- ✅ 23-about-the-author.md
- ✅ 24-back-of-book-summary.md
- ✅ 25-bibliography.md
- ✅ 25a-glossary.md

---

## Export Instructions

### For Pandoc:
```bash
pandoc export-ready/*.md -o "Silence Isn't Distance.epub" --toc --toc-depth=2
```

### For Reedsy/Vellum:
Import all files from `export-ready/` directory in numerical order (00-25).

### For KDP:
1. Use Pandoc to generate EPUB
2. Upload to KDP EPUB checker
3. Verify all chapters appear in table of contents

---

## Asset Files

- **Cover Image:** `assets/Silence Isnt Distance.png` (referenced in 00-cover.md)

---

## Notes

- All files are in `export-ready/` directory
- Files are numbered 00-25 for proper ordering
- Each file has YAML front matter with `title` and `order`/`chapter` fields
- All semantic HTML classes have been removed for clean export
- Files are formatted for professional ebook/print export

---

---

## Documentation Files

These files are part of the project documentation but not included in the book export:

- **[Export Processing Status](docs/EXPORT_PROCESSING_STATUS.md)** — Processing status and checklist
- **[Export Complete](docs/EXPORT_COMPLETE.md)** — Export completion summary
- **[Export Manifest](docs/EXPORT_MANIFEST.md)** — File mapping manifest
- **[Markdown Formatting Report](docs/MARKDOWN_FORMATTING_REPORT.md)** — Formatting standardization report

---

## Source Files

Original source files are located in the `story/` directory and are preserved for reference. These are not included in the export-ready package but are linked here for completeness:

- **Story Files:** `story/` directory (all chapters and intro files)
- **Table of Content:** `story/Table of Content.md` (Obsidian-style TOC, preserved as-is)

---

**Last Updated:** 2025-12-06
**Status:** Complete — All 28 export-ready files verified and linked

