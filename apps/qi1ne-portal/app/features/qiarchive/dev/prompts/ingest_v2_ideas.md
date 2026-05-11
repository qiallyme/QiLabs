# Prompt Ideas: Ingest v2

## Goal: Metadata Extraction

### "Smart Date" Extractor

"Extract a potential YYYY-MM-DD date from the filename string. Look for patterns like `20240101`, `24-01-01`, `January 1 2024`. Default to `undated` if confidence is low."

### "Intelligent Slug" Generator

"Given a filename like `scan_2024_01_09_120345.pdf`, ignore the standard scanner timestamps and look for keywords. If no keywords found, use the original stem normalized."

### "API Feeder" Workflow

"Watch the `data/01_STAGED/` folder. For every new file, use the Paperless-ngx API to upload, passing the `QDOC` ID as the title to ensure sync."
