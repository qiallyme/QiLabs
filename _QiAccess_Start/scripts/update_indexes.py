import os
import yaml
from pathlib import Path

def generate_index(dir_path: Path):
    """
    Generates index.md for each directory containing standard sections.
    """
    # Exclude root/sys directories
    exclude_dirs = {'.git', '.github', '.obsidian', '__pycache__', 'node_modules', '.venv', 'registry', 'schemas', 'scripts', 'templates', 'hooks'}
    
    for root, dirs, files in os.walk(dir_path):
        current_path = Path(root)
        
        # Skip excluded dirs
        if any(ex in current_path.parts for ex in exclude_dirs):
            continue
            
        # Standard Index Structure
        index_file = current_path / "index.md"
        
        # If relative to docs, generate a nice listing
        rel_to_docs = current_path.relative_to(dir_path)
        
        # We only generate if it's a documentation directory (numeric prefix or docs root)
        if str(rel_to_docs) == "." or (rel_to_docs.name and rel_to_docs.name[0].isdigit()):
            # Title from folder name (stripping prefix if present)
            title = rel_to_docs.name
            if "_" in title:
                title = title.split("_", 1)[1].capitalize()
            elif not title or title == ".":
                title = "Overview"
                
            content = [
                "---",
                f'layout: "section"',
                f'title: "{title} Overview"',
                f'status: "active"',
                "---",
                "",
                f"# {title} Index",
                "",
                "## Contents",
                ""
            ]
            
            # List immediate children
            items = sorted(os.listdir(root))
            for item in items:
                if item == "index.md" or item.startswith(".") or item in exclude_dirs:
                    continue
                
                full_child = current_path / item
                display_name = item
                if "_" in display_name:
                    display_name = display_name.split("_", 1)[1].replace(".md", "").capitalize()
                else:
                    display_name = display_name.replace(".md", "").capitalize()
                
                if full_child.is_dir():
                    content.append(f"- **[{display_name}]({item}/index.md)** (Directory)")
                elif item.endswith(".md"):
                    content.append(f"- [{display_name}]({item})")

            # Only write if it's a new or missing index to avoid overwriting curated homepages
            # Actually, standardizing is better if requested.
            # But the user said index.md already exists in some places, so we cautiously update or only generate if missing.
            if not index_file.exists():
                with open(index_file, "w", encoding="utf-8") as f:
                    f.write("\n".join(content))
                print(f"Generated index: {index_file}")

def main():
    docs_dir = Path(os.path.join(os.path.dirname(__file__), '..', 'docs'))
    print(f"Running index update on {docs_dir.absolute()}")
    generate_index(docs_dir)

if __name__ == "__main__":
    main()
