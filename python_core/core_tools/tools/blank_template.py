import tkinter as tk
from tkinter import ttk
from core.base_tool import BaseTool

class CustomModuleTool(BaseTool):
    def __init__(self):
        # 1. INITIALIZATION
        # Define any default variables, file extensions, or static configurations here.
        pass

    def get_name(self):
        # 2. SIDEBAR NAME
        # Return the exact text (and emoji) you want to appear in the main navigation.
        return "✨ New Custom Module"

    def build_ui(self, parent):
        # 3. SETTINGS UI
        # 'parent' is the dedicated frame inside the main shell. Draw your widgets here.
        # The background colors are set to match your existing dark mode theme.
        
        ttk.Label(parent, text="Custom Input Setting:", background="#0f0f11", foreground="white").pack(anchor='w', pady=(0, 5))
        
        self.custom_var = tk.StringVar()
        tk.Entry(parent, textvariable=self.custom_var, bg="#1c1c1e", fg="white", insertbackground="white", relief="flat").pack(fill='x', pady=(0, 15), ipady=5)

        # Example of adding a simple checkbox
        self.toggle_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(parent, text="Enable advanced processing", variable=self.toggle_var).pack(anchor='w')

    def execute(self, target_path, is_live, log, prog):
        # 4. THE ENGINE LOGIC
        # target_path : The shared directory string chosen in the top bar.
        # is_live     : Boolean. True if they clicked EXECUTE, False if SCAN/DRY RUN.
        # log         : Function to print to the unified terminal. e.g., log("File moved.")
        # prog        : Function to update the progress bar. e.g., prog(50) for 50%.

        setting_value = self.custom_var.get()
        is_toggled = self.toggle_var.get()

        log(f"🚀 STARTING {'LIVE MODE' if is_live else 'DRY RUN'} IN: {target_path}\n" + "-"*40)
        log(f"Received custom input: '{setting_value}' | Toggle is: {is_toggled}")

        # -----------------------------------------
        # YOUR CUSTOM FOR-LOOPS AND SCRIPTING GO HERE
        # -----------------------------------------
        
        # Example of updating the progress bar:
        # prog(25)
        # log("Quarter way there...")
        # prog(100)

        log("-" * 40 + "\n✅ MODULE OPERATION COMPLETE.\n")