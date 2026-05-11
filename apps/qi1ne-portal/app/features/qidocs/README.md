# QiAlly Knowledge Base Builder

A fast, static, HTML-first KB generator for the QiAlly ecosystem.

## Features
- **Fast Build**: Python-based generator with minimal dependencies.
- **Internal vs Public**: Single codebase handles both internal (private) and public (external) targets.
- **Premium Design**: Modern, clean, and professional aesthetics ("Stripe docs" style).
- **Dark Mode**: Native CSS dark mode support.
- **TOC & Breadcrumbs**: Auto-generated from Markdown structure.
- **Cloudflare Ready**: Optimized for Cloudflare Pages deployment.

## Directory Structure
```
/kb-builder
  /content      # Markdown source files
    /internal   # Private KB content
    /public     # Public help center content
  /templates    # Jinja2 HTML templates
  /assets       # CSS and icons
  /dist         # Generated HTML (ignored by git)
  build.py      # Build script
  config.yaml   # Site configuration
```

## Setup & Build

1. **Install Dependencies**:
   ```bash
   pip install markdown pyyaml jinja2
   ```

2. **Run Build**:
   ```bash
   python build.py
   ```
   This generates:
   - `dist/kb/` (Internal KB)
   - `dist/help/` (Public KB)

## Deployment (Cloudflare Pages)

### Target 1: Public Help Center
- **Project Name**: `qially-help`
- **Build Command**: `python build.py`
- **Build Output Directory**: `dist/help`
- **Domain**: `qially.com/help/*`

### Target 2: Internal Knowledge Base
- **Project Name**: `qially-kb`
- **Build Command**: `python build.py`
- **Build Output Directory**: `dist/kb`
- **Domain**: `kb.qially.com`
- **Access Control**: Use Cloudflare Zero Trust (Access) to protect this domain.

## Writing Content
Markdown files support frontmatter for titles and descriptions:
```markdown
title: My Page Title
description: Brief description for SEO.

# Actual Header
Content goes here...
```
Folders in `/content` automatically become categories in the sidebar.
`index.md` in a folder becomes the landing page for that category.
