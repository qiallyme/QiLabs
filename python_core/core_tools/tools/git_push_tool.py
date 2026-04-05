# tools/git_push_tool.py
import os
import subprocess
import datetime
import tkinter as tk
from tkinter import ttk

from core.base_tool import BaseTool


class GitPushTool(BaseTool):
    def __init__(self):
        self.cancel_requested = False

    def get_name(self):
        return "🚀 Git Push"

    def build_ui(self, parent):
        ttk.Label(
            parent,
            text="Commit all changes and push to origin main --force",
            background="#0f0f11",
            foreground="white"
        ).pack(anchor="w", pady=(0, 8))

    def execute(self, target_path, is_live, log, prog):
        if not os.path.isdir(target_path):
            log("❌ Invalid repo path.")
            return

        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        commit_message = f"Update {timestamp}"

        commands = [
            "git add .",
            f'git commit -m "{commit_message}"',
            "git push origin main --force",
        ]

        log(f"🚀 GIT PUSH {'LIVE' if is_live else 'DRY RUN'}")
        log("-" * 40)
        log(f"Repo: {target_path}")

        if not is_live:
            for cmd in commands:
                log(f"🔎 Would run: {cmd}")
            log("-" * 40)
            log("✅ Dry run complete.")
            return

        for idx, cmd in enumerate(commands, start=1):
            if self.cancel_requested:
                log("🛑 Cancelled by user.")
                break

            log(f"→ {cmd}")
            result = subprocess.run(
                cmd,
                shell=True,
                cwd=target_path,
                text=True,
                capture_output=True
            )

            if result.stdout:
                log(result.stdout.strip())
            if result.stderr:
                log(result.stderr.strip())

            if result.returncode != 0:
                log(f"❌ Command failed with exit code {result.returncode}")
                return

            prog((idx / len(commands)) * 100)

        log("-" * 40)
        log("✅ Git push complete.")