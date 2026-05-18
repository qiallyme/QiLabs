import os
import json

def get_directory_structure(root_dir):
    """
    Recursively builds a nested dictionary representing the file system.
    Excludes .git, .github, .obsidian, __pycache__, and node_modules.
    """
    exclude = {'.git', '.github', '.obsidian', '__pycache__', 'node_modules', '.venv'}
    
    def build_tree(current_dir):
        node = {"name": os.path.basename(current_dir), "children": []}
        try:
            items = sorted(os.listdir(current_dir))
            for item in items:
                if item in exclude:
                    continue
                
                full_path = os.path.join(current_dir, item)
                if os.path.isdir(full_path):
                    node["children"].append(build_tree(full_path))
                else:
                    node["children"].append({"name": item})
        except Exception as e:
            print(f"Error reading {current_dir}: {e}")
            
        return node

    # If top level name is empty (due to trailing slash), use the actual folder name
    tree = build_tree(root_dir)
    if not tree["name"]:
        tree["name"] = os.path.basename(os.path.abspath(root_dir))
    return tree

def main():
    base_dir = os.path.join(os.path.dirname(__file__), '..')
    output_json = os.path.join(base_dir, 'docs', 'assets', 'diagrams', 'markmind-data.json')
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    
    print(f"Generating Markmind data from: {os.path.abspath(base_dir)}")
    structure = get_directory_structure(base_dir)
    
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(structure, f, indent=2)
    
    print(f"PASS: Markmind data saved to {output_json}")

if __name__ == "__main__":
    main()
