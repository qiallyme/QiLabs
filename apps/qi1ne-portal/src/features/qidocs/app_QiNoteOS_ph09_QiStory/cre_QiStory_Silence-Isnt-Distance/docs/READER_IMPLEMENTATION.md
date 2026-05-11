# Reader Implementation Guide

**Quick reference for the online book reader**

---

## Overview

The online reader (`site/reader.html`) provides a clean, full-book reading experience. It's designed to be simple, robust, and reliable.

---

## Source Files

### Primary Source
**File:** `export/Silence Isnt Distance.html`  
**Type:** Pre-rendered HTML export  
**Why:** Fastest, most reliable, no dependencies

### Fallback Source
**File:** `export-ready/MASTER_BOOK.md`  
**Type:** Markdown master file  
**Why:** Backup if HTML export is missing  
**Rendering:** Uses Marked.js CDN

---

## How It Works

### Load Sequence

1. **Attempt HTML Export**
   ```javascript
   fetch('../export/Silence Isnt Distance.html')
   ```
   - If found: Extract body content, display immediately
   - If not found: Proceed to fallback

2. **Fallback to Markdown**
   ```javascript
   fetch('../export-ready/MASTER_BOOK.md')
   ```
   - Load Marked.js from CDN
   - Strip YAML front matter
   - Render Markdown to HTML
   - Display content

3. **Error Handling**
   - If both fail: Show error message with back link
   - No infinite loading states
   - Clear user feedback

---

## File Locations

```
project-root/
├── site/
│   └── reader.html          # Reader page
├── export/
│   └── Silence Isnt Distance.html  # Primary source
└── export-ready/
    └── MASTER_BOOK.md        # Fallback source
```

---

## Updating the Reader

### To Update Content

1. **Regenerate HTML Export:**
   ```bash
   # Run your export script
   ./export.sh  # or export.ps1
   ```
   This updates `export/Silence Isnt Distance.html`

2. **Or Update Markdown:**
   - Edit `export-ready/MASTER_BOOK.md`
   - Reader will use it as fallback

### To Change Styling

Edit `site/reader.html`:
- CSS is in `<style>` block
- Typography: `.book-reader` class
- Layout: Tailwind CSS classes

---

## Navigation

### From Site to Reader

**Link:** `reader.html` (relative path)  
**Location:** Navigation menu in all site pages

### From Reader to Site

**Link:** `blend.html` (default site)  
**Location:** Top navigation bar in reader

---

## Features

- ✅ Full book content display
- ✅ Clean typography (Playfair Display)
- ✅ Responsive design
- ✅ Print-friendly
- ✅ Error handling
- ✅ Fast loading (HTML path)
- ✅ Fallback support (Markdown path)

---

## Troubleshooting

### Reader Shows "Loading..." Forever

**Cause:** Both source files missing or path incorrect

**Fix:**
1. Verify `export/Silence Isnt Distance.html` exists
2. Or verify `export-ready/MASTER_BOOK.md` exists
3. Check browser console for fetch errors
4. Verify relative paths are correct

### Reader Shows Error Message

**Cause:** Files not found or network error

**Fix:**
1. Check file paths are correct
2. Verify files exist in expected locations
3. Check browser console for specific error
4. Ensure server allows file access (CORS if applicable)

### Reader Shows Markdown Instead of HTML

**Cause:** HTML export not found, using fallback

**Fix:**
1. Regenerate HTML export: `./export.sh`
2. Verify `export/Silence Isnt Distance.html` exists
3. Check file permissions

---

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ IE11 (not supported)

**Requirements:**
- JavaScript enabled (for fallback)
- Fetch API support (all modern browsers)

---

## Performance

- **HTML Path:** Instant load (single file)
- **Markdown Path:** ~1-2s (CDN + rendering)
- **File Size:** ~80KB (HTML export)

---

## Maintenance

### Regular Updates

1. **After Book Edits:**
   - Regenerate HTML export
   - Reader automatically uses new version

2. **After Export Script Changes:**
   - Test reader with new export format
   - Verify styling still works

3. **After Markdown Changes:**
   - Update `MASTER_BOOK.md`
   - Reader will use as fallback if HTML missing

---

## Future Enhancements

Potential additions:
- Table of contents sidebar
- Chapter navigation
- Reading progress
- Dark mode toggle
- Font size controls
- Bookmarking

---

**Last Updated:** 2025-01-27

