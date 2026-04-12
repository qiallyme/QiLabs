import http.server
import socketserver
import os
import json
import webbrowser
from pathlib import Path
import sys

# Add cur dir to path
sys.path.append(str(Path(__file__).parent))
import pipeline
import threading
import cloud_client
import socket

PORT = 8080
DIRECTORY = Path(__file__).parent / "console"

# Global state for the watcher thread
watcher_thread = None
stop_watcher = threading.Event()
agent_lock_socket = None # Keep this alive to hold port 50001

def watcher_loop():
    import watcher
    pipeline.load_env()
    inbox = os.environ.get("QIARCHIVE_INBOX_FOLDER", "./data/00_INBOX")
    print(f"Watcher started on {inbox}")
    
    # We redefine watch_forever here slightly to support the stop event
    import time
    while not stop_watcher.is_set():
        try:
            files = watcher.scan_inbox(inbox)
            for f in files:
                if stop_watcher.is_set(): break
                print(f"[Auto] Processing {os.path.basename(f)}")
                pipeline.process_single_file(f)
            time.sleep(5)
        except Exception as e:
            print(f"Watcher background error: {e}")
            time.sleep(5)

class AgentConsoleHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def do_POST(self):
        global watcher_thread
        
        if self.path == "/api/ingest":
            try:
                results = pipeline.run_ingestion()
                self._send_json({"status": "success", "results": results})
            except Exception as e:
                self._send_json({"status": "error", "message": str(e)}, 500)
            return

        if self.path == "/api/service/start":
            # 1. Is there a background system process?
            if pipeline.is_agent_instance_running():
                self._send_json({"status": "background_running", "message": "Background agent is active."})
                return
            
            # 2. Is there a thread already here?
            if watcher_thread and watcher_thread.is_alive():
                self._send_json({"status": "already_running"})
                return

            stop_watcher.clear()
            watcher_thread = threading.Thread(target=watcher_loop, daemon=True)
            watcher_thread.start()
            self._send_json({"status": "started"})
            return

        if self.path == "/api/service/stop":
            stop_watcher.set()
            self._send_json({"status": "stopping"})
            return

        return super().do_POST()

    def do_GET(self):
        if self.path == "/api/service/status":
            is_running = watcher_thread.is_alive() if watcher_thread else False
            inbox = os.environ.get("QIARCHIVE_INBOX_FOLDER", "./data/00_INBOX")
            machine = os.environ.get("QIARCHIVE_AGENT_NAME", socket.gethostname())
            
            self._send_json({
                "status": "running" if is_running else "stopped",
                "machine_name": machine,
                "config": {"inbox": inbox}
            })
            return
        return super().do_GET()

    def _send_json(self, data, code=200):
        self.send_response(code)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

def launch_console():
    if not DIRECTORY.exists():
        DIRECTORY.mkdir(parents=True, exist_ok=True)
    
    # Create gorgeous index.html if it doesn't exist
    index_file = DIRECTORY / "index.html"
    # (Writing the file in a separate step for clarity)
    
    try:
        pipeline.load_env()
        # Wire stats to cloud client
        cloud_client.set_stats_source(lambda: pipeline.GLOBAL_STATS)
        
        cloud_client.start_heartbeat()
        print("Cloud Heartbeat started.")
        
        # AUTO-START WATCHER if no system-level agent is detected
        if not pipeline.is_agent_instance_running():
            # Try to claim the port lock so the status pill stays green
            try:
                agent_lock_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                agent_lock_socket.bind(('127.0.0.1', 50001))
                print("Agent Lock acquired (Port 50001).")
            except Exception as e:
                print(f"Warning: Could not claim Agent Lock: {e}")

            global watcher_thread
            stop_watcher.clear()
            watcher_thread = threading.Thread(target=watcher_loop, daemon=True)
            watcher_thread.start()
            print("Local Watcher auto-started.")
        else:
            print("Background Agent detected. Watcher is already monitoring.")
    except Exception as e:
        print(f"Startup services partial failure: {e}")

    try:
        with socketserver.TCPServer(("", PORT), AgentConsoleHandler) as httpd:
            print(f"QiArchive Agent Console available at http://localhost:{PORT}")
            webbrowser.open(f"http://localhost:{PORT}")
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 10048:
            print(f"\n❌ ERROR: Port {PORT} is already in use by another process.")
            print(f"   Please close any other running instances of QiArchive or other app using port {PORT}.")
            print("   (Tip: You can kill the previous instance by closing its window.)\n")
            sys.exit(1)
        else:
            raise e

if __name__ == "__main__":
    launch_console()
