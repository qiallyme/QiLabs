import os
import json
import argparse
import shutil
import markdown
import re

def parse_args():
    parser = argparse.ArgumentParser(description="Build QiNoteOS Static Site HTML")
    parser.add_argument('--modules-root', required=True, help="Path to modules directory")
    parser.add_argument('--out', required=True, help="Output directory (dist)")
    return parser.parse_args()

def convert_obsidian_links(html_content, module_map):
    # Regex for [[Link]] and [[Link|Label]]
    # This is a naive implementation; for production use a Markdown Extension
    
    def replacer(match):
        inner = match.group(1)
        if '|' in inner:
            target, label = inner.split('|', 1)
        else:
            target, label = inner, inner
        
        # Link resolution logic roughly:
        # If target matches a known module title or slug -> link to it
        # Else -> just text
        
        # Normalize target
        target_norm = target.lower().strip()
        
        # Try to find target in map
        # map key could be lowercase title or slug
        if target_norm in module_map:
            dest_url = module_map[target_norm]
            # Construct hash link for spa
            # format: #/qid_slug
            # We need the ID from the URL...
            # The URL we have is modules/FOLDER/index.html
            # We need #/FOLDER (roughly)
            folder = dest_url.split('/')[1] 
            # Actually our hash routing uses qid_slug or folder id
            
            # Let's verify what module_map stores. It stores `rendered_url`.
            # We need to construct a link that the Viewer App.js understands. 
            # App.js supports #/qid_slug OR #/folder_id
            
            # Using folder ID is safest if valid
            return f'<a href="#/{folder}">{label}</a>'
            
        return f'<span class="unresolved-link">{label}</span>'

    pattern = re.compile(r'\[\[(.*?)\]\]')
    return pattern.sub(replacer, html_content)

def main():
    args = parse_args()
    
    catalog_path = os.path.join(args.out, '_catalog.json')
    if not os.path.exists(catalog_path):
        print("Error: _catalog.json not found in output dir. Run build_catalog.py first.")
        return

    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    # Generate catalog.js for offline support
    catalog_js_path = os.path.join(args.out, 'catalog.js')
    with open(catalog_js_path, 'w', encoding='utf-8') as f:
        f.write(f"window.QINOTE_CATALOG = {json.dumps(catalog)};")
    print(f"Generated {catalog_js_path} for offline file:// support.")

    # Copy App Shell (site/* to dist/*)
    params_script_dir = os.path.dirname(os.path.abspath(__file__))
    site_dir = os.path.abspath(os.path.join(params_script_dir, '..', 'site'))
    
    if os.path.exists(site_dir):
        print(f"Copying app shell from {site_dir} to {args.out}...")
        for item in os.listdir(site_dir):
            s = os.path.join(site_dir, item)
            d = os.path.join(args.out, item)
            if os.path.isdir(s):
                if os.path.exists(d):
                    try:
                        shutil.rmtree(d)
                    except Exception as e:
                        print(f"Warning cleaning {d}: {e}")
                shutil.copytree(s, d)
            else:
                shutil.copy2(s, d)
    else:
        print(f"Warning: Site directory not found at {site_dir}")

    # Build lookup map for wikilinks
    module_map = {}
    for m in catalog['modules']:
        module_map[m['title'].lower()] = m['rendered_url']
        module_map[m['slug'].lower()] = m['rendered_url']
    
def render_markdown_file(md_path, dest_path, title, module_map, template_data):
    with open(md_path, 'r', encoding='utf-8') as f:
        raw_md = f.read()

    try:
        html_body = markdown.markdown(
            raw_md, 
            extensions=['fenced_code', 'tables', 'nl2br', 'sane_lists']
        )
    except Exception as e:
        print(f"Markdown error in {md_path}: {e}")
        html_body = f"<p>Error rendering markdown.</p><pre>{e}</pre>"
        
    html_body = convert_obsidian_links(html_body, module_map)
    # Simple fix for relative markdown links: .md -> .html
    html_body = re.sub(r'href="([^"]+)\.md"', r'href="\1.html"', html_body)
    
    full_html = f"""
<div class="article-body">
    <h1>{title}</h1>
    <div class="meta">
        <span class="badge">{template_data['type']}</span>
        <span class="qid">{template_data['qid']}</span>
    </div>
    <hr/>
    {html_body}
</div>
"""
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(full_html)

def main():
    args = parse_args()
    
    catalog_path = os.path.join(args.out, '_catalog.json')
    if not os.path.exists(catalog_path):
        print("Error: _catalog.json not found in output dir. Run build_catalog.py first.")
        return

    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)
        
    # Copy App Shell (site/* to dist/*)
    params_script_dir = os.path.dirname(os.path.abspath(__file__))
    site_dir = os.path.abspath(os.path.join(params_script_dir, '..', 'site'))
    
    if os.path.exists(site_dir):
        print(f"Copying app shell from {site_dir} to {args.out}...")
        for item in os.listdir(site_dir):
            s = os.path.join(site_dir, item)
            d = os.path.join(args.out, item)
            if os.path.isdir(s):
                if os.path.exists(d):
                    try:
                        shutil.rmtree(d)
                    except Exception as e:
                        print(f"Warning cleaning {d}: {e}")
                shutil.copytree(s, d)
            else:
                shutil.copy2(s, d)
    else:
        print(f"Warning: Site directory not found at {site_dir}")

    module_map = {}
    for m in catalog['modules']:
        module_map[m['title'].lower()] = m['rendered_url']
        module_map[m['slug'].lower()] = m['rendered_url']
    
    print(f"Building HTML for {len(catalog['modules'])} modules...")
    
    content_bundle = {}

    for mod in catalog['modules']:
        source_root = mod.get('source_path') 
        if not source_root: continue
            
        dest_mod_root = os.path.join(args.out, 'modules', mod['id'])
        
        # Recursively render ALL .md files
        for root, dirs, files in os.walk(source_root):
            dirs[:] = [d for d in dirs if d not in ['.git', '.obsidian', 'versions', 'logs']]
            
            for file in files:
                if file.lower().endswith('.md'):
                    src_path = os.path.join(root, file)
                    rel_path = os.path.relpath(src_path, source_root)
                    
                    if rel_path.replace('\\', '/') == mod.get('entry_md'):
                        html_filename = 'index.html'
                        dest_path = os.path.join(dest_mod_root, 'index.html')
                    else:
                        # Mirror structure
                        dest_rel = os.path.splitext(rel_path)[0] + '.html'
                        html_filename = dest_rel.replace('\\', '/')
                        dest_path = os.path.join(dest_mod_root, dest_rel)
                    
                    render_markdown_file(src_path, dest_path, mod['title'], module_map, mod)
                    
                    # Add to bundle
                    if os.path.exists(dest_path):
                        with open(dest_path, 'r', encoding='utf-8') as f:
                            # Key is relative path from dist/ e.g. "modules/qid.../index.html"
                            # This matches the fetch URL app.js constructs
                            key = f"modules/{mod['id']}/{html_filename}"
                            content_bundle[key] = f.read()
            
        # Copy Assets
        src_assets = os.path.join(source_root, 'assets')
        if os.path.exists(src_assets):
            dest_assets = os.path.join(dest_mod_root, 'assets')
            if os.path.exists(dest_assets):
                try:
                    shutil.rmtree(dest_assets)
                except: pass # ignore if locked
                shutil.copytree(src_assets, dest_assets)

    # Write Bundle
    content_js_path = os.path.join(args.out, 'content.js')
    with open(content_js_path, 'w', encoding='utf-8') as f:
        f.write(f"window.QINOTE_CONTENT = {json.dumps(content_bundle)};")
    print(f"Generated {content_js_path} for offline content.")
            
    print("Build complete.")

if __name__ == "__main__":
    main()
