import os
import json
import argparse
import yaml
import datetime
import re

def parse_args():
    parser = argparse.ArgumentParser(description="Build QiNoteOS Module Catalog")
    parser.add_argument('--modules-root', required=True, help="Path to modules directory")
    parser.add_argument('--out', required=True, help="Output directory for _catalog.json")
    parser.add_argument('--include-private', action='store_true', help="Include restricted modules")
    return parser.parse_args()

def is_restricted(path, module_yaml, include_private):
    if include_private:
        return False
    
    # Check folder names
    path_parts = path.lower().split(os.sep)
    for p in path_parts:
        if p in ['restricted', 'private', 'confidential', '06_restricted_private_notes']:
            return True
            
    # Check yaml visibility
    if module_yaml.get('visibility') == 'restricted':
        return True
        
    return False

def load_yaml(path):
    # Minimal YAML parser if PyYAML is missing (fallback)
    # But try import first
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f) or {}
    except Exception as e:
        print(f"Warning: Failed to parse YAML {path} via library. Attempting basic parse.")
        # Very dumb fallback
        data = {}
        try:
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    if ':' in line:
                        k, v = line.split(':', 1)
                        data[k.strip()] = v.strip().strip('"').strip("'")
            return data
        except:
            return {}

def main():
    args = parse_args()
    
    catalog = {
        "generated_at": datetime.datetime.now().isoformat(),
        "modules": []
    }
    
    print(f"Scanning for modules in {args.modules_root}...")
    
    # Iterate top-level directories only? Or recursive? 
    # Atomic modules are usually flat or in categorised subfolders.
    # We will walk fully but check for module.yaml
    
    for root, dirs, files in os.walk(args.modules_root):
        if 'module.yaml' in files:
            module_path = os.path.join(root, 'module.yaml')
            
            # Read YAML
            try:
                meta = load_yaml(module_path)
            except:
                continue
                
            # Filtering
            if is_restricted(root, meta, args.include_private):
                continue
                
            # Construct Entry
            folder_name = os.path.basename(root)
            
            # Determine content entry point
            entry_md = "content/content.md"
            if not os.path.exists(os.path.join(root, 'content', 'content.md')):
                # Fallback to README.md if content doesn't exist? 
                # Strict spec says content/content.md is canonical. IF missing, we note it.
                if os.path.exists(os.path.join(root, 'README.md')):
                   entry_md = "README.md"
                else: 
                   entry_md = None # Broken module
            
            rel_folder = os.path.relpath(root, args.modules_root).replace('\\', '/')
            
            mod_entry = {
                "id": folder_name,
                "qid": meta.get('qid', 'qid0000000_0'),
                "revision": meta.get('revision', 0),
                "slug": meta.get('slug', folder_name),
                "title": meta.get('title', folder_name),
                "type": meta.get('type', 'file'),
                "visibility": meta.get('visibility', 'shared'),
                "tags": meta.get('tags', []),
                "sort": meta.get('sort', 9999),
                "entry_md": entry_md,
                # We pre-calculate where the HTML WILL be
                "rendered_url": f"modules/{folder_name}/index.html",
                "source_path": root # Absolute path for build_site to use
            }
            
            catalog['modules'].append(mod_entry)
            
    # Write output
    os.makedirs(args.out, exist_ok=True)
    out_path = os.path.join(args.out, '_catalog.json')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2)
        
    print(f"Catalog generated with {len(catalog['modules'])} modules at {out_path}")

if __name__ == "__main__":
    main()
