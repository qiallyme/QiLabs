import os, json, subprocess, markdown, shutil

CONTENT_SRC = "./content"
PUBLIC_DEST = "./public/content"
OUTPUT_JSON = "./public/timeline.json"
MAX_SIZE_MB = 25

def needs_update(src, dest):
    if not os.path.exists(dest): return True
    return os.path.getmtime(src) > os.path.getmtime(dest)

def compress_media(input_path, folder_name, file_name):
    ext = os.path.splitext(file_name)[1].lower()
    target_ext = ".mp4" if ext in ['.mp4', '.mov', '.mkv'] else ".mp3"
    output_file = file_name.replace(ext, f"_web{target_ext}")
    dest_path = os.path.join(PUBLIC_DEST, folder_name, output_file)

    os.makedirs(os.path.dirname(dest_path), exist_ok=True)

    # SKIP LOGIC: Only run FFmpeg if source is newer than destination
    if not needs_update(input_path, dest_path):
        return f"content/{folder_name}/{output_file}"

    print(f"--- Processing NEW/CHANGED: {file_name} ---")
    if target_ext == ".mp3":
        cmd = f'ffmpeg -i "{input_path}" -codec:a libmp3lame -b:a 128k -y "{dest_path}"'
    else:
        cmd = f'ffmpeg -i "{input_path}" -vcodec libx264 -crf 28 -preset faster -pix_fmt yuv420p -y "{dest_path}"'

    subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
    return f"content/{folder_name}/{output_file}"

def build():
    timeline_data = []
    if not os.path.exists(CONTENT_SRC):
        print("Error: /content folder not found.")
        return

    folders = sorted([f for f in os.listdir(CONTENT_SRC) if os.path.isdir(os.path.join(CONTENT_SRC, f))], reverse=True)

    for folder in folders:
        try:
            date_str, title = folder.split('_', 1)
        except ValueError: continue

        entry_path = os.path.join(CONTENT_SRC, folder)
        category = "default"
        if any(word in title.lower() for word in ['tax', 'audit', 'invoice']): category = "finance"
        if any(word in title.lower() for word in ['launch', 'complete']): category = "milestone"

        entry_obj = {
            "date": date_str,
            "title": title.replace('-', ' '),
            "category": category,
            "description": "",
            "folder_name": folder
        }

        for file in os.listdir(entry_path):
            file_path = os.path.join(entry_path, file)
            ext = os.path.splitext(file)[1].lower()

            if file == 'index.md':
                with open(file_path, 'r') as f:
                    entry_obj["description"] = markdown.markdown(f.read())
                    entry_obj["raw_md"] = f.read() # For the "Download" bundle
            elif ext in ['.mp4', '.mov', '.m4a', '.mp3']:
                entry_obj["asset_path"] = compress_media(file_path, folder, file)
                entry_obj["type"] = "video" if ext in ['.mp4', '.mov'] else "audio"
            elif ext in ['.png', '.jpg', '.pdf']:
                dest_path = os.path.join(PUBLIC_DEST, folder, file)
                if needs_update(file_path, dest_path):
                    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                    shutil.copy2(file_path, dest_path)
                entry_obj["asset_path"] = f"content/{folder}/{file}"
                entry_obj["type"] = "infographic" if ext != '.pdf' else "document"

        timeline_data.append(entry_obj)

    with open(OUTPUT_JSON, 'w') as f:
        json.dump(timeline_data, f, indent=4)
    print(f"Update Complete. {len(timeline_data)} entries synced.")

if __name__ == "__main__":
    build()