# Silence Isn't Distance

**A Field Guide for the Deeply Feeling**

By Cody "Q" Rice-Velasquez

---

## Quick Start

### 1. Setup

```powershell
# Activate virtual environment (Windows)
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt
```

See [SETUP.md](SETUP.md) for detailed installation instructions.

### 2. Export Book Formats

**Windows:**
```powershell
.\export.ps1
```

**Linux/Mac:**
```bash
chmod +x export.sh
./export.sh
```

This generates:
- 📖 **EPUB** — For ebook readers
- 📱 **KDP HTML** — For Kindle Direct Publishing
- 🖨️ **Print PDF** — For print-on-demand

All files are saved to the `export/` directory.

---

## Project Structure

```
QiStory_Silence-Isnt-Distance/
├── export-ready/          # 28 markdown files ready for export
├── export/                # Generated export files (EPUB, HTML, PDF)
├── assets/                # Cover image and assets
├── site/                  # Website HTML files (dark.html, light.html, blend.html)
├── docs/                  # Documentation and reports
├── venv/                  # Python virtual environment
├── index.html             # Project navigator (view all files)
├── export.ps1            # Windows export script
├── export.sh             # Linux/Mac export script
└── SETUP.md              # Detailed setup instructions
```

---

## View Files

Open `index.html` in your browser to:
- 📄 View all export-ready markdown files in a beautiful book-style reader
- 🌐 Access site pages (dark, light, blend themes)
- 📚 Browse documentation

**Note:** For markdown viewing, you'll need to run a local server:
```powershell
python -m http.server 8000
```
Then visit: `http://localhost:8000/index.html`

---

## Export Formats

### EPUB
- Includes table of contents
- Includes cover image
- Compatible with Apple Books, Kobo, etc.

### KDP HTML
- Standalone HTML file
- Ready for Kindle Direct Publishing upload
- Includes TOC

### Print PDF
- Uses XeLaTeX or WeasyPrint
- Basic formatting (can be enhanced with CSS)
- Ready for print-on-demand services

---

## Requirements

- **Pandoc** — Required for all exports
  - Download: https://pandoc.org/installing.html
  
- **PDF Engine** (optional, for PDF export)
  - XeLaTeX (recommended) or WeasyPrint

See [SETUP.md](SETUP.md) for installation details.

---

## Files

- **28 Export-Ready Files** in `export-ready/`
- **3 Site Themes** in `site/` (dark, light, blend)
- **Master Index** — See [MASTER_INDEX.md](MASTER_INDEX.md)

---

## License

All rights reserved. © 2025 Cody "Q" Rice-Velasquez
