# Setup Guide — Silence Isn't Distance

## Prerequisites

### 1. Python Virtual Environment

A virtual environment has been created in `venv/`. To activate it:

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Install Pandoc

Pandoc is required for all exports. It's a system-level tool (not Python).

**Windows:**
- Download from: https://github.com/jgm/pandoc/releases
- Or use Chocolatey: `choco install pandoc`
- Or use Scoop: `scoop install pandoc`

**Mac:**
```bash
brew install pandoc
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install pandoc

# Fedora
sudo dnf install pandoc
```

### 4. PDF Engine (Optional, for PDF export)

Choose one:

**Option A: XeLaTeX (Recommended for print-quality PDFs)**
- Windows: Install MiKTeX (https://miktex.org/) or TeX Live
- Mac: `brew install --cask mactex`
- Linux: `sudo apt-get install texlive-xetex`

**Option B: WeasyPrint (Simpler, but less control)**
- `pip install weasyprint` (in your venv)

## Running Exports

### Windows (PowerShell)
```powershell
.\export.ps1
```

### Linux/Mac
```bash
chmod +x export.sh
./export.sh
```

## Export Formats

The script generates three formats:

1. **EPUB** (`export/silence-isnt-distance.epub`)
   - For ebook readers (Apple Books, Kobo, etc.)
   - Includes table of contents
   - Includes cover image

2. **KDP HTML** (`export/silence-isnt-distance-kindle.html`)
   - For Kindle Direct Publishing upload
   - Standalone HTML with TOC
   - Ready for KDP conversion

3. **Print PDF** (`export/silence-isnt-distance-print.pdf`)
   - For print-on-demand services
   - Uses XeLaTeX or WeasyPrint
   - Basic formatting (can be enhanced with CSS later)

## File Structure

```
QiStory_Silence-Isnt-Distance/
├── venv/                    # Python virtual environment
├── export-ready/            # Source markdown files (28 files)
├── export/                  # Generated export files
├── assets/                  # Cover image and assets
├── site/                    # Website HTML files
├── docs/                    # Documentation
├── export.ps1              # Windows export script
├── export.sh               # Linux/Mac export script
├── requirements.txt        # Python dependencies
└── SETUP.md               # This file
```

## Troubleshooting

### Pandoc not found
- Ensure Pandoc is installed and in your PATH
- Restart terminal after installation
- Verify with: `pandoc --version`

### PDF export fails
- Install either XeLaTeX or WeasyPrint
- Check that the PDF engine is in your PATH
- For WeasyPrint: ensure it's installed in your venv

### Cover image not found
- Ensure `assets/Silence Isnt Distance.png` exists
- Check file path is correct

## Next Steps

1. Run the export script to generate all formats
2. Review generated files in `export/` directory
3. Test EPUB in your preferred reader
4. Upload KDP HTML to Kindle Direct Publishing
5. Review PDF for print formatting

