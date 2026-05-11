# file: bloat_destroyer.py
# purpose: Toolbox tool module for Bloat Destroyer in the organize bucket. Provides DestroyerTool for the QiOne Desktop Tools UI.
# usage: Loaded by the QiOne toolbox build system and launched from main_ui.py.
# inputs: User-selected target directory and tool-specific UI options.
# outputs: Tool-specific logs, generated files, or file operations depending on selected mode.
# safety: Supports scan/dry-run vs live execution through the QiOne toolbox shell when implemented by the tool.
# owner: QiLabs

import os
import re
import subprocess
import hashlib
import shutil
import tkinter as tk
from tkinter import ttk
from datetime import datetime
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from core.base_tool import BaseTool

class DestroyerTool(BaseTool):
    def __init__(self):
        self.cache_names = {'.turbo', '.next', 'dist', 'build', '.pnpm', '.cache', '__pycache__'}
        self.log_patterns = [r'.*\.log$', r'npm-debug\.log.*', r'yarn-error\.log.*']
        self.protected_dirs = {'.git', '.vscode', '.idea', '.svn'}
        self.cancel_requested = False
        self.max_threads = 8

    def get_name(self):
        return "💣 Bloat Destroyer"

    def build_ui(self, parent):
        self.w_node = tk.BooleanVar(value=True)
        self.w_cache = tk.BooleanVar(value=True)
        self.w_logs = tk.BooleanVar(value=False)
        self.w_dupes = tk.BooleanVar(value=False)
        self.w_quarantine = tk.BooleanVar(value=True)

        col1 = tk.Frame(parent, bg="#0f0f11")
        col1.pack(side='left', fill='y', padx=(0, 20))
        ttk.Label(col1, text="TARGETS", background="#0f0f11", foreground="#a1a1aa", font=("Segoe UI", 9, "bold")).pack(anchor='w', pady=(0,5))
        ttk.Checkbutton(col1, text="📦 Node Modules", variable=self.w_node).pack(anchor='w', pady=2)
        ttk.Checkbutton(col1, text="🧹 Build Caches", variable=self.w_cache).pack(anchor='w', pady=2)
        ttk.Checkbutton(col1, text="📝 System Logs", variable=self.w_logs).pack(anchor='w', pady=2)
        ttk.Checkbutton(col1, text="🎯 Duplicate Files (>1KB)", variable=self.w_dupes).pack(anchor='w', pady=2)

        col2 = tk.Frame(parent, bg="#0f0f11")
        col2.pack(side='left', fill='y')
        ttk.Label(col2, text="SAFETY", background="#0f0f11", foreground="#a1a1aa", font=("Segoe UI", 9, "bold")).pack(anchor='w', pady=(0,5))
        ttk.Checkbutton(col2, text="🛡️ Quarantine Items (Don't Delete)", variable=self.w_quarantine).pack(anchor='w', pady=2)
        ttk.Label(col2, text="(Moves targets to _QUARANTINE_ folder instead of permanent deletion.)", background="#0f0f11", foreground="#666666", font=("Segoe UI", 8)).pack(anchor='w')

    def fast_nuke(self, path, is_dir=True):
        try:
            if is_dir:
                if os.name == 'nt': subprocess.run(['rmdir', '/s', '/q', f'"{path}"'], shell=True, check=True, creationflags=0x08000000)
                else: shutil.rmtree(path)
            else: os.remove(path)
            return True
        except: return False

    def quarantine_item(self, item_path, quarantine_dir):
        if not os.path.exists(quarantine_dir):
            os.makedirs(quarantine_dir)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = os.path.basename(item_path)
        safe_name = f"{timestamp}_{filename}"
        dest = os.path.join(quarantine_dir, safe_name)
        try:
            shutil.move(item_path, dest)
            return True
        except: return False

    def get_file_hash(self, filepath):
        hasher = hashlib.md5()
        try:
            with open(filepath, 'rb') as f:
                for chunk in iter(lambda: f.read(256 * 1024), b""):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except: return None

    def execute(self, target_path, is_live, log, prog):
        self.cancel_requested = False
        weapons = []
        if self.w_node.get(): weapons.append('node')
        if self.w_cache.get(): weapons.append('cache')
        if self.w_logs.get(): weapons.append('logs')
        if self.w_dupes.get(): weapons.append('dupes')

        use_quarantine = self.w_quarantine.get()
        q_dir = os.path.join(target_path, "_QUARANTINE_")

        log(f"🚀 [DESTROYER] {'LIVE MODE' if is_live else 'DRY RUN'}\nTarget: {target_path}\n" + "-"*40)

        log("🔍 Phase 1: Scanning directory structure...")
        dir_targets = []
        file_candidates = []
        folders_checked = 0

        stack = [target_path]
        while stack:
            if self.cancel_requested: return
            current_dir = stack.pop()
            folders_checked += 1

            if os.path.basename(current_dir) == "_QUARANTINE_": continue

            try:
                with os.scandir(current_dir) as it:
                    for entry in it:
                        name_lower = entry.name.lower()

                        if entry.is_dir():
                            if name_lower in self.protected_dirs: continue

                            # CRITICAL: Always skip contents of node/caches, even if unchecked.
                            if name_lower == 'node_modules':
                                if 'node' in weapons: dir_targets.append(entry.path)
                                continue # Hard stop, do not append to stack
                            elif name_lower in self.cache_names:
                                if 'cache' in weapons: dir_targets.append(entry.path)
                                continue # Hard stop, do not append to stack

                            stack.append(entry.path)

                        elif entry.is_file():
                            stat = entry.stat()
                            file_candidates.append({'path': entry.path, 'name': entry.name, 'size': stat.st_size})
            except Exception: pass

        prog(20)
        log(f"   Indexed {len(file_candidates)} files across {folders_checked} folders.")

        log("🎯 Phase 2: Isolating targets...")
        file_targets = []

        if 'logs' in weapons:
            for f in file_candidates:
                if any(re.match(p, f['name'], re.I) for p in self.log_patterns):
                    file_targets.append((f['path'], f['size'], False))
                    f['size'] = -1

        if 'dupes' in weapons:
            size_map = defaultdict(list)
            for f in file_candidates:
                if f['size'] > 1024: size_map[f['size']].append(f['path'])

            potentials = [paths for paths in size_map.values() if len(paths) > 1]
            total_potentials = sum(len(paths) for paths in potentials)

            if total_potentials > 0:
                log(f"   Found {total_potentials} potential duplicate files. Initiating Threaded Hashing...")
                exact_map = defaultdict(list)
                flat_potentials = [p for paths in potentials for p in paths]

                with ThreadPoolExecutor(max_workers=self.max_threads) as executor:
                    future_to_path = {executor.submit(self.get_file_hash, p): p for p in flat_potentials}
                    done = 0
                    for future in as_completed(future_to_path):
                        if self.cancel_requested: return
                        p = future_to_path[future]
                        h = future.result()
                        if h: exact_map[h].append(p)
                        done += 1
                        prog(20 + int((done / total_potentials) * 40))

                for paths in exact_map.values():
                    if len(paths) > 1:
                        paths.sort(key=lambda x: os.path.getmtime(x))
                        for p in paths[1:]:
                            try: file_targets.append((p, os.path.getsize(p), True))
                            except: pass

        prog(60)

        log("\n🔥 Phase 3: Commencing Cleanup...")
        grand_total_bytes = 0
        items_processed = 0
        total_items = len(dir_targets) + len(file_targets)

        if total_items == 0:
            log("   Workspace is clean. No targets found.")
            prog(100)
            return

        for d_path in dir_targets:
            if self.cancel_requested: break
            try: sz = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(d_path) for f in fs)
            except: sz = 0
            grand_total_bytes += sz

            action_text = "QUARANTINED" if use_quarantine else "DELETED"
            if is_live:
                if use_quarantine:
                    if self.quarantine_item(d_path, q_dir): log(f"   [DIR {action_text}] {os.path.basename(d_path)}")
                else:
                    if self.fast_nuke(d_path, is_dir=True): log(f"   [DIR {action_text}] {os.path.basename(d_path)}")
            else: log(f"   [DRY RUN - DIR {action_text}] {os.path.basename(d_path)} ({(sz/(1024**2)):.1f}MB)")

            items_processed += 1
            prog(60 + int((items_processed / total_items) * 40))

        for f_path, sz, is_dupe in file_targets:
            if self.cancel_requested: break
            grand_total_bytes += sz
            action_text = "QUARANTINED" if use_quarantine else "DELETED"
            prefix = "[DUPE]" if is_dupe else "[LOG]"

            if is_live:
                if use_quarantine:
                    if self.quarantine_item(f_path, q_dir): log(f"   [{prefix} {action_text}] {os.path.basename(f_path)}")
                else:
                    if self.fast_nuke(f_path, is_dir=False): log(f"   [{prefix} {action_text}] {os.path.basename(f_path)}")
            else:
                log(f"   [DRY RUN - {action_text}] {prefix} {os.path.basename(f_path)} ({(sz/(1024**2)):.2f}MB)")

            items_processed += 1
            prog(60 + int((items_processed / total_items) * 40))

        prog(100)
        unit, div = ("GB", 1024**3) if grand_total_bytes > 1024**3 else ("MB", 1024**2)
        log("-" * 40 + f"\n✨ MODULE COMPLETE. {'CLEARED' if is_live else 'PROJECTED SAVINGS'}: {grand_total_bytes/div:.2f} {unit}\n")
