import os
import tkinter as tk
from tkinter import ttk
from core.base_tool import BaseTool


class DownloadsInspectorTool(BaseTool):

    def __init__(self):
        self.cancel_requested = False

    def get_name(self):
        return "🔎 Downloads Inspector"

    def build_ui(self, parent):

        ttk.Label(
            parent,
            text="Inspect files in the selected directory.",
            background="#0f0f11",
            foreground="white"
        ).pack(anchor="w", pady=(0,10))

    def execute(self, target_path, is_live, log, prog):

        log("🔎 DOWNLOADS INSPECTOR")
        log("-"*40)

        files = [
            f for f in os.listdir(target_path)
            if os.path.isfile(os.path.join(target_path, f))
        ]

        if not files:
            log("No files found.")
            return

        total = len(files)

        for i, file in enumerate(files):

            if self.cancel_requested:
                log("🛑 Cancelled")
                break

            ext = os.path.splitext(file)[1].lower()

            size = os.path.getsize(os.path.join(target_path, file))

            log(f"{file}")
            log(f"   type: {ext}")
            log(f"   size: {size} bytes\n")

            prog(((i+1)/total)*100)

        log("✅ Inspection complete")