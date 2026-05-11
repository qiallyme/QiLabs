import os

blueprint_dir = r"c:\QiLabs\_qios_master_blueprint"
output_file = r"c:\QiLabs\blueprint_extract_for_ai.md"

def should_ignore(path):
    ignores = ['.git', '.obsidian', 'node_modules', 'assets']
    for ig in ignores:
        if f"\\{ig}\\" in path or path.endswith(f"\\{ig}"):
            return True
    return False

with open(output_file, 'w', encoding='utf-8') as out_f:
    for root, dirs, files in os.walk(blueprint_dir):
        if should_ignore(root):
            continue
            
        for file in files:
            if file.endswith('.md') and not file.startswith('_Index_'):
                file_path = os.path.join(root, file)
                if should_ignore(file_path):
                    continue
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as in_f:
                        content = in_f.read()
                    
                    rel_path = os.path.relpath(file_path, blueprint_dir)
                    
                    out_f.write(f"# File: {rel_path}\n")
                    out_f.write("-" * 40 + "\n")
                    out_f.write(content)
                    out_f.write("\n\n")
                except Exception as e:
                    print(f"Failed to read {file_path}: {e}")

print(f"Exported to {output_file}")
