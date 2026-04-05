import os
import re
import subprocess
import sys

def kill_active_app():
    """Hunts down and force-kills the app if it's running in the background."""
    print("[0/5] Sweeping for ghost processes...")
    if os.name == 'nt':
        try:
            # /f = force, /im = image name, /t = kill child processes (like stuck FFmpeg threads)
            subprocess.run(['taskkill', '/f', '/im', 'QiOne_Tools.exe', '/t'],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print("      -> Successfully terminated background instances.")
        except Exception:
            pass

def install_requirements():
    """Installs requirements from requirements.txt."""
    print("[1/5] Installing requirements...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("      -> Requirements installed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"      -> Error installing requirements: {e}")

def get_tool_modules():
    """Scans the tools directory and extracts module and class names."""
    tools_dir = 'tools'
    tool_data = []

    # Notice the sorted() here so your sidebar groups correctly!
    for filename in sorted(os.listdir(tools_dir)):
        if filename.endswith('.py') and filename not in ['__init__.py', 'blank_template.py']:
            filepath = os.path.join(tools_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                # Hunts for any class that inherits from BaseTool
                match = re.search(r'class\s+([A-Za-z0-9_]+)\s*\(.*BaseTool.*\):', content)
                if match:
                    class_name = match.group(1)
                    module_name = filename[:-3] # Strip .py
                    tool_data.append((module_name, class_name))
    return tool_data

def update_main_ui(tool_data):
    """Injects the imports and tool registration into main_ui.py."""
    print("[2/5] Injecting tools into main_ui.py...")

    with open('main_ui.py', 'r', encoding='utf-8') as f:
        ui_content = f.read()

    # Format the injection strings
    imports_str = "\n".join([f"from tools.{mod} import {cls}" for mod, cls in tool_data])
    register_str = "self.tools = [" + ", ".join([f"{cls}()" for _, cls in tool_data]) + "]"

    # Replace Imports
    ui_content = re.sub(
        r'# --- AUTO-IMPORTS START ---.*?# --- AUTO-IMPORTS END ---',
        f'# --- AUTO-IMPORTS START ---\n{imports_str}\n# --- AUTO-IMPORTS END ---',
        ui_content, flags=re.DOTALL
    )

    # Replace Registration array
    ui_content = re.sub(
        r'# --- AUTO-REGISTER START ---.*?# --- AUTO-REGISTER END ---',
        f'# --- AUTO-REGISTER START ---\n        {register_str}\n        # --- AUTO-REGISTER END ---',
        ui_content, flags=re.DOTALL
    )

    with open('main_ui.py', 'w', encoding='utf-8') as f:
        f.write(ui_content)

    print(f"      -> Successfully registered {len(tool_data)} modules.")

def bump_version():
    """Reads file_version_info.txt and increments the patch version."""
    print("[3/5] Bumping application version...")

    try:
        with open('file_version_info.txt', 'r', encoding='utf-8') as f:
            v_content = f.read()

        # Extract current version from: filevers=(5, 1, 0, 0)
        match = re.search(r'filevers=\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)', v_content)
        if not match:
            print("      -> Error finding version format. Skipping bump.")
            return

        major, minor, patch, build = match.groups()
        new_patch = int(patch) + 1

        old_tuple = f"({major}, {minor}, {patch}, {build})"
        new_tuple = f"({major}, {minor}, {new_patch}, {build})"

        old_str = f"u'{major}.{minor}.{patch}'"
        new_str = f"u'{major}.{minor}.{new_patch}'"

        # Apply replacements globally in the txt file
        v_content = v_content.replace(old_tuple, new_tuple)
        v_content = v_content.replace(old_str, new_str)

        with open('file_version_info.txt', 'w', encoding='utf-8') as f:
            f.write(v_content)

        print(f"      -> Version bumped from {major}.{minor}.{patch} to {major}.{minor}.{new_patch}")
    except FileNotFoundError:
        print("      -> file_version_info.txt not found. Skipping bump.")

def compile_exe():
    """Runs PyInstaller to build the executable."""
    print("[4/5] Cleaning old build artifacts...")
    if os.name == 'nt':
        subprocess.run('rmdir /s /q build dist', shell=True, stderr=subprocess.DEVNULL)
        subprocess.run('del /q *.spec', shell=True, stderr=subprocess.DEVNULL)

    print("[5/5] Triggering PyInstaller (this may take a minute)...\n")

    # The exact compilation command
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm", "--onefile", "--windowed",
        "--name", "QiOne_Tools",
        "--version-file", "file_version_info.txt","--hidden-import", "send2trash",
        "main_ui.py"
    ]

    subprocess.run(cmd, check=True)
    print("\n" + "="*50 + "\n[DONE] COMPILATION COMPLETE. Check the 'dist' folder.\n" + "="*50)

if __name__ == "__main__":
    print("="*50 + "\n  QILABS AUTOMATED PIPELINE\n" + "="*50)
    kill_active_app()
    tools = get_tool_modules()
    if not tools:
        print("⚠️ No valid tools found in the /tools directory.")
    else:
        update_main_ui(tools)
        bump_version()
        compile_exe()