import os
import re

def export_blueprint(base_path, output_file):
    docs_path = os.path.join(base_path, 'docs')
    if not os.path.exists(docs_path):
        print(f"Error: {docs_path} not found.")
        return

    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write(f"# QiOS Master Blueprint Export\n")
        outfile.write(f"Generated on: {os.popen('date /t').read().strip()} {os.popen('time /t').read().strip()}\n\n")
        outfile.write("---\n\n")

        # Walk through directories in order
        for root, dirs, files in os.walk(docs_path):
            # Skip hidden folders and assets
            if any(part.startswith('.') or part == 'assets' for part in root.split(os.sep)):
                continue
            
            # Sort files to maintain order (by prefix if exists)
            md_files = sorted([f for f in files if f.endswith('.md')])
            
            for filename in md_files:
                file_path = os.path.join(root, filename)
                rel_path = os.path.relpath(file_path, docs_path)
                
                # Create a header based on the relative path
                header_title = rel_path.replace(os.sep, ' > ').replace('.md', '')
                
                outfile.write(f"## FILE: {header_title}\n")
                outfile.write(f"Source: `{rel_path}`\n\n")
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Adjust header levels in the file to fit the export structure
                        # (Increase # to ## and so on)
                        # content = re.sub(r'^(#+)', r'#\1', content, flags=re.M)
                        outfile.write(content)
                except Exception as e:
                    outfile.write(f"*Error reading file: {e}*\n")
                
                outfile.write("\n\n---\n\n")

    print(f"Export completed: {output_file}")

if __name__ == "__main__":
    base_dir = r"c:\QiLabs\_qios_master_blueprint"
    output = r"c:\QiLabs\QIOS_MASTER_BLUEPRINT_EXPORT.md"
    export_blueprint(base_dir, output)
