#!/usr/bin/env python3
"""
Generate Print-Ready HTML for "Silence Isn't Distance"
Uses Pandoc to assemble chapters and embed resources.
"""

import os
import subprocess
import sys
from pathlib import Path

# Configuration
EXPORT_READY_DIR = Path("export-ready")
OUTPUT_DIR = Path("export")
OUTPUT_FILENAME = "silence-isnt-distance-print.html"

# File Order (Same as ebook script for consistency)
FILE_ORDER = {
    "00-cover.md": 0,
    "01-title-page.md": 1,
    "02-dedication.md": 2,
    "02a-content-considerations.md": 2.5,
    "03-preface.md": 3,
    "04-how-to-use-this-book.md": 4,
    "05-introduction.md": 5,
    "06-chapter-01-overloaded-mind.md": 6,
    "07-chapter-02-emotional-architecture.md": 7,
    "08-chapter-03-mirror-misunderstanding.md": 8,
    "09-chapter-04-science-of-withdrawal.md": 9,
    "10-chapter-05-shutdown-triggers.md": 10,
    "11-chapter-06-survival-mode-love.md": 11,
    "12-chapter-07-overfunctioning.md": 12,
    "13-chapter-08-projection-mirror.md": 13,
    "14-chapter-09-burnout-breakdown-dissociation.md": 14,
    "15-chapter-10-loving-someone-who-retreats.md": 15,
    "16-chapter-11-what-people-get-wrong.md": 16,
    "17-chapter-12-repair-reconnection.md": 17,
    "18-chapter-13-emotional-bandwidth.md": 18,
    "19-chapter-14-healing-survival-patterns.md": 19,
    "20-chapter-15-coming-home-to-silence.md": 20,
    "21-epilogue.md": 21,
    "22-acknowledgements.md": 22,
    "23-about-the-author.md": 23,
    "24-back-of-book-summary.md": 24, # Will treat as back cover content
    "25-bibliography.md": 25,
    "25a-glossary.md": 25.5,
}

def generate_print_html():
    print("🖨️  Generating Print-Ready HTML Book...")
    print("=" * 50)
    
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Collect files
    md_files = []
    sorted_files = sorted(FILE_ORDER.keys(), key=lambda x: FILE_ORDER.get(x, 0))
    
    print(f"📄 processings {len(sorted_files)} source files...")
    
    for filename in sorted_files:
        filepath = EXPORT_READY_DIR / filename
        if filepath.exists():
            md_files.append(str(filepath))
            print(f"  - {filename}")
        else:
            print(f"  ⚠️ Warning: {filename} not found!")

    if not md_files:
        print("❌ No files found to process.")
        return False

    output_path = OUTPUT_DIR / OUTPUT_FILENAME
    
    # Path to CSS files
    base_css = EXPORT_READY_DIR / "book.css"
    print_css = EXPORT_READY_DIR / "print_override.css"

    cmd = [
        'pandoc',
        *md_files,
        '--standalone',        # Create full HTML document with head/body
        '--embed-resources',   # Embed images, CSS, fonts into single file
        '--toc',              # Generate Table of Contents
        '--toc-depth=2',
        '--metadata', 'title:Silence Isn\'t Distance',
        '--metadata', 'author:Cody "Q" Rice-Velasquez',
        '--metadata', 'lang:en',
        '-o', str(output_path)
    ]

    # Add CSS if they exist
    if base_css.exists():
        cmd.extend(['--css', str(base_css)])
    if print_css.exists():
        cmd.extend(['--css', str(print_css)])

    print("\n🔄 Running Pandoc conversion...")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            file_size_mb = output_path.stat().st_size / (1024 * 1024)
            print(f"\n✅ Success! generated: {output_path}")
            print(f"   Size: {file_size_mb:.2f} MB")
            print("\n👉 Open this file in your browser and use Print > Save to PDF")
            return True
        else:
            print("\n❌ Pandoc Error:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"\n❌ Execution Error: {e}")
        return False

if __name__ == "__main__":
    generate_print_html()
