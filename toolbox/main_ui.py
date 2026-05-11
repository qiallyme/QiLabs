import os
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import threading

# --- AUTO-IMPORTS START ---
from tools.build.tool_template import CustomModuleTool
from tools.dev.export_blueprint import ExportBlueprintTool
from tools.dev.extractor import TextExtractorTool
from tools.dev.git_push import GitPushTool
from tools.dev.rule_tester import RuleTesterTool
from tools.docs.pdf_splitter import BulkPdfSplitterTool
from tools.finance.tax_compiler import TaxPdfCompilerTool
from tools.media.video_converter import VideoConverterTool
from tools.organize.archivist import ArchiveRouterTool
from tools.organize.bloat_destroyer import DestroyerTool
from tools.organize.downloads_inspector import DownloadsInspectorTool
from tools.organize.file_cleaner import FilenameCleanerTool
from tools.organize.folder_flattener import FolderFlattenerTool
from tools.organize.unlock_downloads import UnblockDownloadsTool
from tools.organize.unzip_sync import UnzipSyncTool
from tools.organize.vault_router import VaultRouterTool
# --- AUTO-IMPORTS END ---

class QiOneShell:
    BG = "#0f1115"
    PANEL = "#171a21"
    PANEL_2 = "#1d2230"
    SIDEBAR = "#12151c"
    BORDER = "#2a3140"
    TEXT = "#eef2ff"
    MUTED = "#9aa4b2"
    ACCENT = "#4f8cff"
    ACCENT_2 = "#7aa2ff"
    SUCCESS = "#30d158"
    DANGER = "#ff5d73"
    WARNING = "#ffb84d"
    CONSOLE_BG = "#0b0d12"
    CONSOLE_TEXT = "#7CFC9A"

    PAD = 14
    RADIUS_FEEL = 10  # visual target; tkinter doesn't do true radius easily

    def __init__(self, root):
        self.root = root
        self.root.title("QiOne Desktop Tools")
        self.root.geometry("1180x820")
        self.root.minsize(980, 700)
        self.root.configure(bg=self.BG)

        # --- AUTO-REGISTER START ---
        self.tools = [CustomModuleTool(), ExportBlueprintTool(), TextExtractorTool(), GitPushTool(), RuleTesterTool(), BulkPdfSplitterTool(), TaxPdfCompilerTool(), VideoConverterTool(), ArchiveRouterTool(), DestroyerTool(), DownloadsInspectorTool(), FilenameCleanerTool(), FolderFlattenerTool(), UnblockDownloadsTool(), UnzipSyncTool(), VaultRouterTool()]
        # --- AUTO-REGISTER END ---

        self.active_tool = None
        self.active_tool_button = None
        self.tool_buttons = {}
        self.shared_path = tk.StringVar(value=os.getcwd())
        self.status_var = tk.StringVar(value="Ready")
        self.setup_styles()
        self.build_shell()

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")

        style.configure("TFrame", background=self.BG)
        style.configure("Card.TFrame", background=self.PANEL)
        style.configure("Card2.TFrame", background=self.PANEL_2)

        style.configure(
            "Header.TLabel",
            background=self.BG,
            foreground=self.TEXT,
            font=("Segoe UI", 18, "bold")
        )
        style.configure(
            "Section.TLabel",
            background=self.PANEL,
            foreground=self.TEXT,
            font=("Segoe UI", 11, "bold")
        )
        style.configure(
            "Muted.TLabel",
            background=self.BG,
            foreground=self.MUTED,
            font=("Segoe UI", 9)
        )
        style.configure(
            "Status.TLabel",
            background=self.BG,
            foreground=self.ACCENT_2,
            font=("Segoe UI", 9, "bold")
        )

        style.configure(
            "Qi.Horizontal.TProgressbar",
            troughcolor=self.PANEL,
            background=self.ACCENT,
            bordercolor=self.BORDER,
            lightcolor=self.ACCENT,
            darkcolor=self.ACCENT
        )

    def make_card(self, parent, pad=14):
        card = tk.Frame(
            parent,
            bg=self.PANEL,
            highlightthickness=1,
            highlightbackground=self.BORDER,
            bd=0
        )
        card.pack(fill="x", pady=(0, 14))
        inner = tk.Frame(card, bg=self.PANEL, padx=pad, pady=pad)
        inner.pack(fill="both", expand=True)
        return card, inner

    def build_shell(self):
        # OUTER LAYOUT
        outer = tk.Frame(self.root, bg=self.BG)
        outer.pack(fill="both", expand=True)

        # SIDEBAR
        self.sidebar = tk.Frame(outer, bg=self.SIDEBAR, width=240)
        self.sidebar.pack(side="left", fill="y")
        self.sidebar.pack_propagate(False)

        logo_wrap = tk.Frame(self.sidebar, bg=self.SIDEBAR)
        logo_wrap.pack(fill="x", padx=18, pady=(18, 14))

        tk.Label(
            logo_wrap,
            text="QiOne",
            bg=self.SIDEBAR,
            fg=self.ACCENT,
            font=("Segoe UI", 18, "bold")
        ).pack(anchor="w")

        tk.Label(
            logo_wrap,
            text="Desktop tool shell",
            bg=self.SIDEBAR,
            fg=self.MUTED,
            font=("Segoe UI", 9)
        ).pack(anchor="w", pady=(2, 0))

        divider = tk.Frame(self.sidebar, bg=self.BORDER, height=1)
        divider.pack(fill="x", padx=16, pady=(0, 12))

        sidebar_canvas = tk.Canvas(
            self.sidebar,
            bg=self.SIDEBAR,
            highlightthickness=0,
            bd=0
        )
        sidebar_scrollbar = ttk.Scrollbar(self.sidebar, orient="vertical", command=sidebar_canvas.yview)
        self.sidebar_inner = tk.Frame(sidebar_canvas, bg=self.SIDEBAR)

        self.sidebar_inner.bind(
            "<Configure>",
            lambda e: sidebar_canvas.configure(scrollregion=sidebar_canvas.bbox("all"))
        )

        sidebar_canvas.create_window((0, 0), window=self.sidebar_inner, anchor="nw", width=220)
        sidebar_canvas.configure(yscrollcommand=sidebar_scrollbar.set)

        sidebar_canvas.pack(side="left", fill="both", expand=True, padx=(10, 0), pady=(0, 10))
        sidebar_scrollbar.pack(side="right", fill="y", pady=(0, 10))

        def _on_mousewheel(event):
            sidebar_canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")

        sidebar_canvas.bind_all("<MouseWheel>", _on_mousewheel)

        for tool in self.tools:
            self.make_tool_button(tool)

        # MAIN AREA
        self.main_area = tk.Frame(outer, bg=self.BG, padx=18, pady=18)
        self.main_area.pack(side="right", fill="both", expand=True)

        # TOP BAR
        topbar = tk.Frame(self.main_area, bg=self.BG)
        topbar.pack(fill="x", pady=(0, 14))

        left_top = tk.Frame(topbar, bg=self.BG)
        left_top.pack(side="left", fill="x", expand=True)

        ttk.Label(left_top, text="QiOne Desktop Tools", style="Header.TLabel").pack(anchor="w")
        ttk.Label(left_top, text="Tool-driven file and system operations", style="Muted.TLabel").pack(anchor="w", pady=(2, 0))

        right_top = tk.Frame(topbar, bg=self.BG)
        right_top.pack(side="right")

        ttk.Label(right_top, textvariable=self.status_var, style="Status.TLabel").pack(anchor="e")

        # PATH CARD
        _, path_inner = self.make_card(self.main_area)

        ttk.Label(path_inner, text="TARGET DIRECTORY", style="Section.TLabel").pack(anchor="w", pady=(0, 8))

        path_row = tk.Frame(path_inner, bg=self.PANEL)
        path_row.pack(fill="x")

        self.path_entry = tk.Entry(
            path_row,
            textvariable=self.shared_path,
            bg="#10141d",
            fg=self.TEXT,
            insertbackground=self.TEXT,
            relief="flat",
            font=("Segoe UI", 11),
            bd=0
        )
        self.path_entry.pack(side="left", fill="x", expand=True, ipady=10, padx=(0, 10))

        tk.Button(
            path_row,
            text="Browse",
            command=self.browse,
            bg=self.ACCENT,
            fg="white",
            activebackground=self.ACCENT_2,
            activeforeground="white",
            relief="flat",
            bd=0,
            font=("Segoe UI", 10, "bold"),
            padx=16,
            pady=10,
            cursor="hand2"
        ).pack(side="right")

        # TOOL SETTINGS CARD
        _, tool_inner = self.make_card(self.main_area)
        self.tool_card_inner = tool_inner

        self.tool_title = tk.Label(
            self.tool_card_inner,
            text="TOOL SETTINGS",
            bg=self.PANEL,
            fg=self.TEXT,
            font=("Segoe UI", 11, "bold")
        )
        self.tool_title.pack(anchor="w", pady=(0, 10))

        self.tool_ui_container = tk.Frame(self.tool_card_inner, bg=self.PANEL)
        self.tool_ui_container.pack(fill="x")

        # ACTION CARD
        _, action_inner = self.make_card(self.main_area)

        ttk.Label(action_inner, text="ACTIONS", style="Section.TLabel").pack(anchor="w", pady=(0, 10))

        btn_frame = tk.Frame(action_inner, bg=self.PANEL)
        btn_frame.pack(fill="x")

        tk.Button(
            btn_frame,
            text="🔍 Scan",
            command=lambda: self.run_tool(False),
            bg=self.SUCCESS,
            fg="black",
            relief="flat",
            bd=0,
            font=("Segoe UI", 10, "bold"),
            height=2,
            cursor="hand2"
        ).pack(side="left", fill="x", expand=True, padx=(0, 6))

        tk.Button(
            btn_frame,
            text="🔥 Execute",
            command=lambda: self.run_tool(True),
            bg=self.DANGER,
            fg="white",
            relief="flat",
            bd=0,
            font=("Segoe UI", 10, "bold"),
            height=2,
            cursor="hand2"
        ).pack(side="left", fill="x", expand=True, padx=6)

        tk.Button(
            btn_frame,
            text="🛑 Cancel",
            command=self.cancel_tool,
            bg=self.WARNING,
            fg="black",
            relief="flat",
            bd=0,
            font=("Segoe UI", 10, "bold"),
            height=2,
            cursor="hand2"
        ).pack(side="left", fill="x", expand=True, padx=(6, 0))

        # CONSOLE CARD
        console_card = tk.Frame(
            self.main_area,
            bg=self.PANEL,
            highlightthickness=1,
            highlightbackground=self.BORDER,
            bd=0
        )
        console_card.pack(fill="both", expand=True)

        console_header = tk.Frame(console_card, bg=self.PANEL, padx=14, pady=12)
        console_header.pack(fill="x")

        tk.Label(
            console_header,
            text="TERMINAL OUTPUT",
            bg=self.PANEL,
            fg=self.TEXT,
            font=("Segoe UI", 11, "bold")
        ).pack(side="left")

        tk.Button(
            console_header,
            text="Clear",
            command=lambda: self.log_text.delete("1.0", tk.END),
            bg=self.PANEL_2,
            fg=self.TEXT,
            relief="flat",
            bd=0,
            padx=12,
            pady=6,
            cursor="hand2"
        ).pack(side="right")

        self.pb = ttk.Progressbar(console_card, mode="determinate", style="Qi.Horizontal.TProgressbar")
        self.pb.pack(fill="x", padx=14, pady=(0, 10))

        log_wrap = tk.Frame(console_card, bg=self.CONSOLE_BG)
        log_wrap.pack(fill="both", expand=True, padx=14, pady=(0, 14))

        self.log_text = tk.Text(
            log_wrap,
            bg=self.CONSOLE_BG,
            fg=self.CONSOLE_TEXT,
            insertbackground=self.CONSOLE_TEXT,
            font=("Cascadia Code", 10),
            borderwidth=0,
            relief="flat",
            padx=12,
            pady=12,
            wrap="word"
        )
        self.log_text.pack(side="left", fill="both", expand=True)

        log_scroll = ttk.Scrollbar(log_wrap, orient="vertical", command=self.log_text.yview)
        log_scroll.pack(side="right", fill="y")
        self.log_text.configure(yscrollcommand=log_scroll.set)

        if self.tools:
            self.load_tool(self.tools[0])

    def make_tool_button(self, tool):
        btn = tk.Button(
            self.sidebar_inner,
            text=tool.get_name(),
            command=lambda t=tool: self.load_tool(t),
            bg="#1a1e27",
            fg=self.TEXT,
            activebackground=self.ACCENT,
            activeforeground="white",
            relief="flat",
            bd=0,
            anchor="w",
            font=("Segoe UI", 10, "bold"),
            padx=14,
            pady=10,
            cursor="hand2"
        )
        btn.pack(fill="x", padx=8, pady=4)
        self.tool_buttons[tool] = btn

    def set_active_tool_button(self, tool):
        for t, btn in self.tool_buttons.items():
            if t == tool:
                btn.configure(bg=self.ACCENT, fg="white")
            else:
                btn.configure(bg="#1a1e27", fg=self.TEXT)

    def browse(self):
        p = filedialog.askdirectory()
        if p:
            self.shared_path.set(p)
            self.status_var.set("Directory selected")

    def load_tool(self, tool):
        self.active_tool = tool
        self.set_active_tool_button(tool)
        self.status_var.set(f"Loaded: {tool.get_name()}")

        for widget in self.tool_ui_container.winfo_children():
            widget.destroy()

        self.tool_title.configure(text=f"{tool.get_name().upper()} SETTINGS")
        tool.build_ui(self.tool_ui_container)

    def update_log(self, msg):
        self.root.after(0, self._append_log, msg)

    def _append_log(self, msg):
        self.log_text.insert(tk.END, f"{msg}\n")
        self.log_text.see(tk.END)

    def update_progress(self, val):
        self.root.after(0, self._set_progress, val)

    def _set_progress(self, val):
        self.pb["value"] = val

    def run_tool(self, is_live):
        if not self.active_tool:
            return

        if is_live and not messagebox.askyesno(
            "CONFIRM EXECUTION",
            "Are you sure you want to execute live changes to this directory?"
        ):
            return

        path = self.shared_path.get()
        if not os.path.isdir(path):
            self.update_log("❌ ERROR: Invalid directory path.")
            self.status_var.set("Invalid directory")
            return

        self.log_text.delete(1.0, tk.END)
        self.update_progress(0)
        self.status_var.set(f"Running: {self.active_tool.get_name()}")

        threading.Thread(
            target=self.active_tool.execute,
            args=(path, is_live, self.update_log, self.update_progress),
            daemon=True
        ).start()

    def cancel_tool(self):
        if self.active_tool:
            self.update_log("\n⚠️ CANCELLATION SIGNAL SENT. Waiting for current file to finish...")
            self.status_var.set("Cancel requested")
            self.active_tool.cancel_requested = True

if __name__ == "__main__":
    root = tk.Tk()
    app = QiOneShell(root)
    root.mainloop()