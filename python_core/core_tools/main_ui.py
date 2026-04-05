import os
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import threading

# --- AUTO-IMPORTS START ---
from tools.dev_extractor import TextExtractorTool
from tools.dev_git_push_tool import GitPushTool
from tools.dev_rule_tester import RuleTesterTool
from tools.doc_pdf_splitter import BulkPdfSplitterTool
from tools.doc_tax_compiler import TaxPdfCompilerTool
from tools.export_blueprint_tool import ExportBlueprintTool
from tools.git_push_tool import GitPushTool
from tools.media_video_converter import VideoConverterTool
from tools.router_archivist import ArchiveRouterTool
from tools.router_downloads import DownloadsInspectorTool
from tools.router_vault import VaultRouterTool
from tools.sys_bloat_destroyer import DestroyerTool
from tools.sys_file_cleaner import FilenameCleanerTool
from tools.sys_folder_flattener import FolderFlattenerTool
from tools.sys_unlock_downloads import UnblockDownloadsTool
from tools.sys_unzip_sync import UnzipSyncTool
# --- AUTO-IMPORTS END ---

class QiOneShell:
    def __init__(self, root):
        self.root = root
        self.root.title("QiOne Desktop Tools")
        self.root.geometry("900x800")
        self.root.configure(bg="#0f0f11")

        # --- AUTO-REGISTER START ---
        self.tools = [TextExtractorTool(), GitPushTool(), RuleTesterTool(), BulkPdfSplitterTool(), TaxPdfCompilerTool(), ExportBlueprintTool(), GitPushTool(), VideoConverterTool(), ArchiveRouterTool(), DownloadsInspectorTool(), VaultRouterTool(), DestroyerTool(), FilenameCleanerTool(), FolderFlattenerTool(), UnblockDownloadsTool(), UnzipSyncTool()]
        # --- AUTO-REGISTER END ---

        self.active_tool = None
        self.shared_path = tk.StringVar(value=os.getcwd())
        self.setup_styles()
        self.build_shell()

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use('clam')
        style.configure("TFrame", background="#ffffff")
        style.configure("Header.TLabel", background="#ffffff", foreground="#0f0f11", font=("Segoe UI", 12, "bold"))
        style.configure("TCheckbutton", background="#e5e5e7", foreground="#0f0f11", font=("Segoe UI", 10))
        style.map("TCheckbutton", background=[('active', '#0a84ff')])

    def build_shell(self):
        # --- SIDEBAR ---
        sidebar = tk.Frame(self.root, bg="#1c1c1e", width=220)
        sidebar.pack(side='left', fill='y')

        tk.Label(sidebar, text="QiOne", bg="#1c1c1e", fg="#0a84ff", font=("Segoe UI", 16, "bold")).pack(pady=(20, 30))

        sidebar_canvas = tk.Canvas(sidebar, bg="#1c1c1e", highlightthickness=0, width=200)
        sidebar_scrollbar = ttk.Scrollbar(sidebar, orient="vertical", command=sidebar_canvas.yview)
        sidebar_inner_frame = tk.Frame(sidebar_canvas, bg="#1c1c1e")

        def _on_mousewheel(event):
            sidebar_canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        sidebar_canvas.bind_all("<MouseWheel>", _on_mousewheel)

        sidebar_inner_frame.bind(
            "<Configure>",
            lambda e: sidebar_canvas.configure(scrollregion=sidebar_canvas.bbox("all"))
        )

        sidebar_canvas.create_window((0, 0), window=sidebar_inner_frame, anchor="nw", width=200)
        sidebar_canvas.configure(yscrollcommand=sidebar_scrollbar.set)

        sidebar_canvas.pack(side="left", fill="both", expand=True)
        sidebar_scrollbar.pack(side="right", fill="y")

        # Dynamically build sidebar buttons
        for tool in self.tools:
            tk.Button(sidebar_inner_frame, text=tool.get_name(), command=lambda t=tool: self.load_tool(t),
                      bg="#2c2c2e", fg="white", relief="flat", font=("Segoe UI", 10, "bold"), pady=4).pack(fill='x', padx=10, pady=2)

        # --- MAIN DISPLAY ---
        self.main_area = tk.Frame(self.root, bg="#0f0f11", padx=20, pady=20)
        self.main_area.pack(side='right', fill='both', expand=True)

        # Shared Directory Input
        ttk.Label(self.main_area, text="TARGET DIRECTORY", style="Header.TLabel").pack(anchor='w', pady=(0,5))
        path_frame = tk.Frame(self.main_area, bg="#0f0f11")
        path_frame.pack(fill='x', pady=(0, 20))

        p_ent = tk.Entry(path_frame, textvariable=self.shared_path, bg="#1c1c1e", fg="white", insertbackground="white", relief="flat", font=("Segoe UI", 11))
        p_ent.pack(side='left', expand=True, fill='x', ipady=8, padx=(0, 10))
        tk.Button(path_frame, text="BROWSE", command=self.browse, bg="#0a84ff", fg="white", relief="flat", font=("Segoe UI", 9, "bold"), padx=15).pack(side='right', fill='y')

        # Dynamic Tool UI Container
        self.tool_ui_container = tk.Frame(self.main_area, bg="#0f0f11")
        self.tool_ui_container.pack(fill='x', pady=(0, 20))

        # Execution Buttons
        # Execution Buttons (Inside build_shell)
        btn_frame = tk.Frame(self.main_area, bg="#0f0f11")
        btn_frame.pack(fill='x', pady=(0, 20))
        tk.Button(btn_frame, text="🔍 SCAN (DRY RUN)", command=lambda: self.run_tool(False), bg="#32d74b", fg="black", relief="flat", font=("Segoe UI", 10, "bold"), height=2).pack(side='left', fill='x', expand=True, padx=(0, 5))
        tk.Button(btn_frame, text="🔥 EXECUTE (LIVE)", command=lambda: self.run_tool(True), bg="#ff453a", fg="white", relief="flat", font=("Segoe UI", 10, "bold"), height=2).pack(side='left', fill='x', expand=True, padx=(5, 5))
        tk.Button(btn_frame, text="🛑 CANCEL", command=self.cancel_tool, bg="#ff9f0a", fg="black", relief="flat", font=("Segoe UI", 10, "bold"), height=2).pack(side='left', fill='x', expand=True, padx=(5, 0))


        # --- UNIFIED CONSOLE ---
        ttk.Label(self.main_area, text="TERMINAL OUTPUT", style="Header.TLabel").pack(anchor='w', pady=(0,5))
        self.pb = ttk.Progressbar(self.main_area, mode='determinate')
        self.pb.pack(fill='x', pady=(0, 5))
        self.log_text = tk.Text(self.main_area, bg="#000000", fg="#32d74b", font=("Consolas", 10), borderwidth=0, padx=10, pady=10)
        self.log_text.pack(fill='both', expand=True)

        # Load the first tool by default
        if self.tools:
            self.load_tool(self.tools[0])

    def browse(self):
        p = filedialog.askdirectory()
        if p: self.shared_path.set(p)

    def load_tool(self, tool):
        self.active_tool = tool

        # Clear the old UI
        for widget in self.tool_ui_container.winfo_children():
            widget.destroy()

        # Inject a title for the loaded tool
        ttk.Label(self.tool_ui_container, text=f"{tool.get_name().upper()} SETTINGS", style="Header.TLabel").pack(anchor='w', pady=(0, 10))

        # Ask the tool to build its specific UI in the container
        tool.build_ui(self.tool_ui_container)

    def update_log(self, msg):
        self.log_text.insert(tk.END, f"{msg}\n")
        self.log_text.see(tk.END)

    def update_progress(self, val):
        self.pb['value'] = val

    def run_tool(self, is_live):
        if not self.active_tool: return

        if is_live and not messagebox.askyesno("CONFIRM EXECUTION", "Are you sure you want to execute live changes to this directory?"):
            return

        path = self.shared_path.get()
        if not os.path.isdir(path):
            self.update_log("❌ ERROR: Invalid directory path.")
            return

        # Reset console and progress bar
        self.log_text.delete(1.0, tk.END)
        self.update_progress(0)

        # Spin up a thread and pass the shell's logging methods to the tool
        threading.Thread(target=self.active_tool.execute, args=(path, is_live, self.update_log, self.update_progress), daemon=True).start()

    def cancel_tool(self):
        """Trips the cancel flag on the currently running tool."""
        if self.active_tool:
            self.update_log("\n⚠️ CANCELLATION SIGNAL SENT. Waiting for current file to finish...")
            self.active_tool.cancel_requested = True

if __name__ == "__main__":
    root = tk.Tk()
    app = QiOneShell(root)
    root.mainloop()