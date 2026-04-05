# core/base_tool.py

class BaseTool:
    def get_name(self):
        """The name that appears in the sidebar."""
        raise NotImplementedError

    def build_ui(self, parent_frame):
        """Build the specific input fields for this tool."""
        raise NotImplementedError

    def execute(self, target_path, is_dry_run, log_callback, progress_callback):
        """The actual logic of the tool."""
        raise NotImplementedError