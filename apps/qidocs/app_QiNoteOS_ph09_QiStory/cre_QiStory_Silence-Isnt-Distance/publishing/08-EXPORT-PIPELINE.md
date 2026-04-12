# Complete Export Pipeline Guide

**Automated scripts for generating all export formats at once**

---

## 🚀 QUICK START

Run these commands to generate all formats:

```powershell
# Generate plaintext for ElevenLabs
.\venv\Scripts\python.exe generate_plaintext.py

# Generate EPUB, HTML, PDF (if Pandoc installed)
.\export.ps1

# Generate enhanced audiobook version (optional)
.\venv\Scripts\python.exe generate_enhanced_audiobook.py
```

---

## 📦 AVAILABLE EXPORT SCRIPTS

### 1. Plaintext Generator (`generate_plaintext.py`)
**Purpose:** Create clean .txt files for ElevenLabs Reader

**Outputs:**
- `export/Silence-Isnt-Distance-PLAINTEXT.txt` (chaptered)
- `export/Silence-Isnt-Distance-READING-MODE.txt` (continuous)

**Usage:**
```powershell
.\venv\Scripts\python.exe generate_plaintext.py
```

---

### 2. Enhanced Audiobook Generator (`generate_enhanced_audiobook.py`)
**Purpose:** Create audiobook version with SSML-style pacing markers

**Outputs:**
- `export/Silence-Isnt-Distance-AUDIOBOOK-ENHANCED.txt`

**Usage:**
```powershell
.\venv\Scripts\python.exe generate_enhanced_audiobook.py
```

**Features:**
- Natural pauses at paragraph breaks
- Emphasis markers for "One Truth" sections
- Longer pauses at chapter breaks
- Better pacing for questions and reflections

---

### 3. Book Export Script (`export.ps1` / `export.sh`)
**Purpose:** Generate EPUB, KDP HTML, and Print PDF

**Outputs:**
- `export/silence-isnt-distance.epub`
- `export/silence-isnt-distance-kindle.html`
- `export/silence-isnt-distance-print.pdf`

**Usage (Windows):**
```powershell
.\export.ps1
```

**Usage (Linux/Mac):**
```bash
chmod +x export.sh
./export.sh
```

**Requirements:**
- Pandoc installed
- XeLaTeX or WeasyPrint (for PDF)

---

## 🔄 COMPLETE EXPORT WORKFLOW

### Step 1: Generate All Formats
```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Generate plaintext
python generate_plaintext.py

# Generate enhanced audiobook (optional)
python generate_enhanced_audiobook.py

# Generate EPUB/HTML/PDF
.\export.ps1
```

### Step 2: Verify Outputs
Check the `export/` directory for:
- ✅ Plaintext files (.txt)
- ✅ EPUB file (.epub)
- ✅ KDP HTML (.html)
- ✅ Print PDF (.pdf)
- ✅ Enhanced audiobook (.txt)

### Step 3: Test Files
- **EPUB:** Open in Apple Books, Calibre, or Kindle Previewer
- **PDF:** Open in Adobe Reader or browser
- **HTML:** Open in browser
- **TXT:** Open in text editor or upload to ElevenLabs

---

## 📋 EXPORT CHECKLIST

Before publishing, verify:

- [ ] All 28 chapters included
- [ ] No formatting errors
- [ ] Cover image referenced correctly
- [ ] Table of contents generated
- [ ] Page breaks correct
- [ ] Metadata accurate
- [ ] File sizes reasonable

---

## 🎯 FORMAT-SPECIFIC NOTES

### EPUB
- **Best for:** eBook readers, Apple Books, Kobo
- **Test with:** Kindle Previewer, Calibre
- **Size:** Usually 500KB - 2MB

### KDP HTML
- **Best for:** Kindle Direct Publishing upload
- **Test with:** Browser, KDP previewer
- **Size:** Usually 1-3MB

### Print PDF
- **Best for:** Print-on-demand, IngramSpark
- **Test with:** PDF viewer, print preview
- **Size:** Usually 2-5MB (depends on page count)

### Plaintext (.txt)
- **Best for:** ElevenLabs Reader, simple text readers
- **Test with:** Text editor, ElevenLabs upload
- **Size:** Usually 50-100KB

---

## 🔧 TROUBLESHOOTING

### Plaintext Generation Issues
- **Problem:** Markdown artifacts remain
- **Solution:** Check `generate_plaintext.py` regex patterns

### EPUB Generation Issues
- **Problem:** Pandoc errors
- **Solution:** Verify Pandoc installation, check file paths

### PDF Generation Issues
- **Problem:** XeLaTeX not found
- **Solution:** Install MiKTeX/TeX Live, or use WeasyPrint

### File Size Issues
- **Problem:** Files too large
- **Solution:** Check for embedded images, optimize cover

---

## 📊 EXPECTED FILE SIZES

Based on your 28-chapter book:

- **Plaintext:** ~80KB
- **EPUB:** ~500KB - 1MB
- **HTML:** ~1-2MB
- **PDF:** ~2-4MB (depends on formatting)

---

## 🚀 AUTOMATION

### Create Master Export Script

Save this as `export-all.ps1`:

```powershell
# Master export script
Write-Host "🚀 Starting complete export..." -ForegroundColor Cyan

# Plaintext
Write-Host "📝 Generating plaintext..." -ForegroundColor Yellow
.\venv\Scripts\python.exe generate_plaintext.py

# Enhanced audiobook
Write-Host "🎙️ Generating enhanced audiobook..." -ForegroundColor Yellow
.\venv\Scripts\python.exe generate_enhanced_audiobook.py

# EPUB/HTML/PDF
Write-Host "📚 Generating book formats..." -ForegroundColor Yellow
.\export.ps1

Write-Host "✅ All exports complete!" -ForegroundColor Green
Write-Host "📦 Check export/ directory for files" -ForegroundColor Cyan
```

Then run:
```powershell
.\export-all.ps1
```

---

## 📁 OUTPUT DIRECTORY STRUCTURE

```
export/
├── Silence-Isnt-Distance-PLAINTEXT.txt
├── Silence-Isnt-Distance-READING-MODE.txt
├── Silence-Isnt-Distance-AUDIOBOOK-ENHANCED.txt
├── silence-isnt-distance.epub
├── silence-isnt-distance-kindle.html
└── silence-isnt-distance-print.pdf
```

---

## ✅ READY TO EXPORT

All scripts are ready to use. Run them in order:

1. `generate_plaintext.py` → For ElevenLabs
2. `generate_enhanced_audiobook.py` → For advanced audiobook
3. `export.ps1` → For EPUB/HTML/PDF

**Everything is automated!** 🎉

