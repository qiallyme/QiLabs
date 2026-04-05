import tkinter as tk
import socket
import webbrowser
import os
import sys
import threading
import time

class QiStatusPill:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("QiArchive Monitor")
        
        # --- Window Configuration ---
        self.root.overrideredirect(True)      # Remove window decorations (borderless)
        self.root.attributes("-topmost", True) # Always on top
        
        # Colors (Slate / Indigo theme)
        self.bg_color = "#1e293b"
        self.border_color = "#6366f1"
        self.text_active = "#f8fafc"
        self.text_offline = "#94a3b8"
        self.green = "#22c55e"
        self.red = "#ef4444"

        # Position: Bottom-Right
        width = 160
        height = 36
        screen_w = self.root.winfo_screenwidth()
        screen_h = self.root.winfo_screenheight()
        # Offset from edges
        x = screen_w - width - 20
        y = screen_h - height - 60 # Above the taskbar
        self.root.geometry(f"{width}x{height}+{x}+{y}")

        # --- UI Elements ---
        self.canvas = tk.Frame(self.root, bg=self.bg_color, highlightbackground=self.border_color, highlightthickness=1)
        self.canvas.pack(fill="both", expand=True)

        # Status Dot
        self.dot_container = tk.Canvas(self.canvas, width=20, height=20, bg=self.bg_color, highlightthickness=0)
        self.dot_container.pack(side="left", padx=(10, 5))
        self.status_dot = self.dot_container.create_oval(4, 4, 14, 14, fill=self.red, outline="")

        # Label
        self.label = tk.Label(
            self.canvas, 
            text="QiArchive: Offline", 
            bg=self.bg_color, 
            fg=self.text_offline, 
            font=("Segoe UI", 9, "bold")
        )
        self.label.pack(side="left", padx=2)

        # --- Interactivity ---
        # Click to open Console
        self.canvas.bind("<Button-1>", self.open_console)
        self.label.bind("<Button-1>", self.open_console)
        self.dot_container.bind("<Button-1>", self.open_console)

        # Dragging support
        self.canvas.bind("<B1-Motion>", self.on_drag)
        self._drag_data = {"x": 0, "y": 0}

        # Right-click to exit overlay
        self.root.bind("<Button-3>", lambda e: self.root.destroy())

        # --- Start Monitor ---
        self.update_status()

    def open_console(self, event=None):
        webbrowser.open("http://localhost:8080")

    def on_drag(self, event):
        # Allow user to reposition the pill if it's in the way
        x = self.root.winfo_pointerx() - 80
        y = self.root.winfo_pointery() - 18
        self.root.geometry(f"+{x}+{y}")

    def is_agent_active(self):
        # Check port 50001 (The singleton lock)
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.bind(('127.0.0.1', 50001))
            s.close()
            return False # Port was free -> Agent NOT running
        except socket.error:
            return True # Port taken -> Agent IS running

    def update_status(self):
        active = self.is_agent_active()
        if active:
            self.dot_container.itemconfig(self.status_dot, fill=self.green)
            self.label.config(text="QiArchive: Active", fg=self.text_active)
        else:
            self.dot_container.itemconfig(self.status_dot, fill=self.red)
            self.label.config(text="QiArchive: Offline", fg=self.text_offline)
        
        # Check every 2 seconds
        self.root.after(2000, self.update_status)

if __name__ == "__main__":
    try:
        app = QiStatusPill()
        app.root.mainloop()
    except Exception as e:
        import tkinter.messagebox
        tkinter.messagebox.showerror("QiArchive Error", f"Failed to start Status Overlay:\n{e}")
