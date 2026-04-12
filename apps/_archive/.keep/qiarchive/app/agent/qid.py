import os
import sys
import json
import time
import argparse
import re
import tempfile
import traceback
import shutil
from datetime import datetime, date
from pathlib import Path
from contextlib import contextmanager

try:
    import psycopg2
    from psycopg2 import sql

    HAS_POSTGRES = True
except ImportError:
    HAS_POSTGRES = False

# --- Configuration & Constants ---
SCRIPT_DIR = Path(getattr(sys, "_MEIPASS", Path(sys.executable).parent)).resolve()
# Better: always use the executable's folder when frozen; script folder otherwise
if getattr(sys, "frozen", False):
    SCRIPT_DIR = Path(sys.executable).resolve().parent
else:
    SCRIPT_DIR = Path(__file__).resolve().parent
REGISTRY_FILE = SCRIPT_DIR / "_qid_registry.json"

def _workspace_root() -> str:
    return os.path.abspath(os.path.dirname(__file__))

def _p(*parts) -> str:
    return os.path.join(_workspace_root(), *parts)

STATE_FILE = SCRIPT_DIR / "_qid_state.json"
LOCK_FILE = SCRIPT_DIR / "_qid_registry.lock"
LOCK_TIMEOUT = 10

# Chart of Accounts Root Bands
BANDS = {
    "SYSTEM": (1, 99999),
    "PERSONAL": (100000, 199999),
    "ORG": (200000, 399999),
    "CLIENT": (400000, 899999),
    "KNOWLEDGE": (900000, 1199999),
    "ASSETS": (1200000, 1499999),
    "PRODUCT": (1500000, 1799999),
    "RESERVED": (1800000, 1999999),
    "DOC": (2000000, 2999999),
}

# Regex for 7-digit ID validation (Case Insensitive)
ROOT_PATTERN = re.compile(r"^qid(\d{7})_0$", re.IGNORECASE)
BASE_PATTERN = re.compile(r"^qid(\d{7})$", re.IGNORECASE)
CHILD_PATTERN = re.compile(r"^qid(\d{7})-(\d+)$", re.IGNORECASE)
YAML_PATTERN = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)

class QidError(Exception):
    pass

# --- Locking & Atomic Writing ---
@contextmanager
def file_lock():
    start_time = time.time()
    locked = False
    while time.time() - start_time < LOCK_TIMEOUT:
        try:
            fd = os.open(LOCK_FILE, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, str(os.getpid()).encode())
            os.close(fd)
            locked = True
            break
        except FileExistsError:
            time.sleep(0.1)
    if not locked:
        raise QidError(f"Could not acquire lock after {LOCK_TIMEOUT}s.")
    try:
        yield
    finally:
        if os.path.exists(LOCK_FILE):
            try:
                os.remove(LOCK_FILE)
            except OSError:
                pass

def save_json_atomic(filepath, data):
    _rolling_backup()
    folder = os.path.dirname(os.path.abspath(filepath))
    with tempfile.NamedTemporaryFile(
        "w", dir=folder, delete=False, encoding="utf-8"
    ) as tf:
        json.dump(data, tf, indent=2)
        temp_name = tf.name
    try:
        os.replace(temp_name, filepath)
    except Exception as e:
        if os.path.exists(temp_name):
            os.remove(temp_name)
        raise QidError(f"Failed to save {filepath}: {e}")

# --- Data Handling ---
def load_json(filepath, default):
    if not os.path.exists(filepath):
        return default
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        raise QidError(f"File {filepath} corrupted.")

def parse_base(id_str):
    id_str = id_str.strip().lower()
    m_root = ROOT_PATTERN.match(id_str)
    if m_root:
        return f"qid{m_root.group(1)}"
    m_base = BASE_PATTERN.match(id_str)
    if m_base:
        return m_base.group(0)
    m_child = CHILD_PATTERN.match(id_str)
    if m_child:
        return f"qid{m_child.group(1)}"
    return None

def format_qdoc_id(root_int, year=None):
    """
    Format a canonical external document ID.
    Example: QDOC-2026-000001
    """
    year = year or datetime.now().year
    # For the DOC band (2,000,000+), we use the last 6 digits as the visible sequence
    seq = root_int % 1000000
    return f"QDOC-{year}-{seq:06d}"

def infer_band_from_path(path_str):
    p = str(path_str).lower().replace("\\", "/")
    if "clients" in p or "cases" in p:
        return "CLIENT"
    if "qinoteos" in p or "modules" in p:
        return "PRODUCT"
    if "assets" in p:
        return "ASSETS"
    if "kb" in p:
        return "PROMPT_KB"  # Special prompt needed
    if "_admin" in p or "system" in p:
        return "SYSTEM"
    return "ORG"

# --- Postgres Allocator Mode ---
class PostgresAllocator:
    def __init__(self, db_url=None):
        self.db_url = db_url or os.environ.get("DATABASE_URL")
        self.conn = None
        if self.db_url and HAS_POSTGRES:
            try:
                self.conn = psycopg2.connect(self.db_url)
                self.setup_table()
            except Exception as e:
                log_error(f"Postgres connection failed: {e}")
                self.conn = None

    def setup_table(self):
        if not self.conn:
            return
        with self.conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS qid_registry (
                    base_id TEXT PRIMARY KEY,
                    root_id TEXT,
                    root_int INTEGER,
                    band TEXT,
                    created_at TIMESTAMP,
                    title TEXT,
                    path TEXT,
                    next_child INTEGER DEFAULT 1,
                    status TEXT DEFAULT 'active',
                    external_key TEXT UNIQUE,
                    entity_type TEXT
                );
            """)
            self.conn.commit()

    def sync_from_json(self, registry):
        if not self.conn:
            return
        with self.conn.cursor() as cur:
            for base_id, entry in registry.items():
                cur.execute(
                    """
                    INSERT INTO qid_registry (base_id, root_id, root_int, band, created_at, title, path, next_child, status, external_key, entity_type)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (base_id) DO UPDATE SET
                        next_child = EXCLUDED.next_child,
                        status = EXCLUDED.status,
                        title = EXCLUDED.title;
                """,
                    (
                        base_id,
                        entry["root_id"],
                        entry["root_int"],
                        entry["band"],
                        entry["created_at"],
                        entry["title"],
                        entry.get("path"),
                        entry["next_child"],
                        entry["status"],
                        entry.get("external_key"),
                        entry.get("entity_type"),
                    ),
                )
            self.conn.commit()

    def get_by_external_key(self, external_key):
        if not self.conn:
            return None
        with self.conn.cursor() as cur:
            cur.execute(
                "SELECT root_id FROM qid_registry WHERE external_key = %s",
                (external_key,),
            )
            row = cur.fetchone()
            return row[0] if row else None

    def register_allocation(self, entry):
        if not self.conn:
            return
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO qid_registry (base_id, root_id, root_int, band, created_at, title, path, next_child, status, external_key, entity_type)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (base_id) DO NOTHING;
            """,
                (
                    parse_base(entry["root_id"]),
                    entry["root_id"],
                    entry["root_int"],
                    entry["band"],
                    entry["created_at"],
                    entry["title"],
                    entry.get("path"),
                    entry["next_child"],
                    entry["status"],
                    entry.get("external_key"),
                    entry.get("entity_type"),
                ),
            )
            self.conn.commit()

# Initialize global allocator
ALLOCATOR = PostgresAllocator()
def _ensure_support_dirs():
    os.makedirs(_p("_logs"), exist_ok=True)
    os.makedirs(_p("_backups", "rolling"), exist_ok=True)
    os.makedirs(_p("_backups", "daily"), exist_ok=True)
    os.makedirs(_p("_wal"), exist_ok=True)

def _iso_now():
    # Local timestamp with offset (best-effort)
    try:
        import time

        off = -time.timezone
        if time.daylight and time.localtime().tm_isdst:
            off = -time.altzone
        sign = "+" if off >= 0 else "-"
        off = abs(off)
        hh = off // 3600
        mm = (off % 3600) // 60
        return datetime.now().strftime(f"%Y-%m-%dT%H:%M:%S{sign}{hh:02d}:{mm:02d}")
    except Exception:
        return datetime.now().isoformat(timespec="seconds")

def _host():
    try:
        return os.environ.get("COMPUTERNAME") or (
            os.uname().nodename if hasattr(os, "uname") else "unknown"
        )
    except Exception:
        return "unknown"

def _append_jsonl(path: str, obj: dict):
    _ensure_support_dirs()
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(obj, ensure_ascii=False) + "\n")

def log_event(op: str, result: str = "ok", **fields):
    evt = {"ts": _iso_now(), "host": _host(), "op": op, "result": result}
    evt.update(fields)
    _append_jsonl(_p("_logs", "qid_activity.jsonl"), evt)

def log_error(msg: str):
    _ensure_support_dirs()
    with open(_p("_logs", "qid_errors.log"), "a", encoding="utf-8") as f:
        f.write(f"[{_iso_now()}] {msg}\n")

def wal_event(op: str, **fields):
    evt = {"ts": _iso_now(), "host": _host(), "op": op}
    evt.update(fields)
    _append_jsonl(_p("_wal", "qid_wal.jsonl"), evt)

def _rolling_backup():
    try:
        _ensure_support_dirs()
        if os.path.exists(STATE_FILE):
            shutil.copy2(STATE_FILE, _p("_backups", "rolling", "state.prev.json"))
        if os.path.exists(REGISTRY_FILE):
            shutil.copy2(REGISTRY_FILE, _p("_backups", "rolling", "registry.prev.json"))
    except Exception as e:
        log_error(f"rolling backup failed: {e}")

def _daily_snapshot():
    try:
        _ensure_support_dirs()
        d = date.today().strftime("%Y-%m-%d")
        day_dir = _p("_backups", "daily", d)
        os.makedirs(day_dir, exist_ok=True)
        sp = os.path.join(day_dir, "_qid_state.json")
        rp = os.path.join(day_dir, "_qid_registry.json")
        if os.path.exists(STATE_FILE) and not os.path.exists(sp):
            shutil.copy2(STATE_FILE, sp)
        if os.path.exists(REGISTRY_FILE) and not os.path.exists(rp):
            shutil.copy2(REGISTRY_FILE, rp)
    except Exception as e:
        log_error(f"daily snapshot failed: {e}")

def _maybe_restore_from_prev():
    try:
        load_json(STATE_FILE, {})
        load_json(REGISTRY_FILE, {})
        return False
    except Exception as e:
        log_error(f"JSON parse failed, attempting restore: {e}")
        sp = _p("_backups", "rolling", "state.prev.json")
        rp = _p("_backups", "rolling", "registry.prev.json")
        restored = False
        if os.path.exists(sp):
            shutil.copy2(sp, STATE_FILE)
            restored = True
        if os.path.exists(rp):
            shutil.copy2(rp, REGISTRY_FILE)
            restored = True
        if restored:
            log_event("restore_prev", result="ok")
        return restored

def init_storage():
    if not os.path.exists(STATE_FILE):
        state = {
            "root_digits": 7,
            "default_band": "ORG",
            "bands": {name: list(range_vals) for name, range_vals in BANDS.items()},
            "next_seq": {name: range_vals[0] for name, range_vals in BANDS.items()},
        }
        save_json_atomic(STATE_FILE, state)
    else:
        # Migration: Ensure all bands from Python BANDS const exist in the state file
        state = load_json(STATE_FILE, {})
        updated = False
        if "bands" not in state: state["bands"] = {}
        if "next_seq" not in state: state["next_seq"] = {}
        
        for name, range_vals in BANDS.items():
            if name not in state["bands"]:
                state["bands"][name] = list(range_vals)
                updated = True
            if name not in state["next_seq"]:
                state["next_seq"][name] = range_vals[0]
                updated = True
        
        if updated:
            save_json_atomic(STATE_FILE, state)

    if not os.path.exists(REGISTRY_FILE):
        save_json_atomic(REGISTRY_FILE, {})

def create_root(title=None, path_str=None, band=None):
    init_storage()
    with file_lock():
        state = load_json(STATE_FILE, {})
        registry = load_json(REGISTRY_FILE, {})

        target_band = band or state.get("default_band", "ORG")
        if target_band not in BANDS:
            raise QidError(f"Invalid band: {target_band}")

        seq = state["next_seq"][target_band]
        limit = BANDS[target_band][1]

        base = f"qid{seq:07d}"
        # Ensure no collision in registry
        while base in registry:
            seq += 1
            if seq > limit:
                raise QidError(f"Band {target_band} is exhausted!")
            base = f"qid{seq:07d}"

        root_id = f"{base}_0"
        entry = {
            "root_id": root_id,
            "root_int": seq,
            "band": target_band,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "title": title or "Untitled Root",
            "path": path_str or ".",
            "next_child": 1,
            "status": "active",
        }

        registry[base] = entry
        state["next_seq"][target_band] = seq + 1

        save_json_atomic(REGISTRY_FILE, registry)
        save_json_atomic(STATE_FILE, state)
        return entry

def create_child(base_id):
    init_storage()
    with file_lock():
        registry = load_json(REGISTRY_FILE, {})
        base = parse_base(base_id)
        if not base or base not in registry:
            raise QidError(f"Root {base_id} not found.")

        entry = registry[base]
        child_id = f"{base}-{entry['next_child']}"
        entry["next_child"] += 1
        wal_event("new_child", base=base_id, child_id=child_id)
        save_json_atomic(REGISTRY_FILE, registry)
        log_event("new_child", base=base_id, child_id=child_id)
        return child_id, entry["root_id"]

# --- Interactive Flow ---
def interactive_menu():
    init_storage()
    while True:
        os.system("cls" if os.name == "nt" else "clear")
        print("=== QiID Manager (7-Digit Bands) ===")
        print("1. [Stamp] a file")
        print("2. [New] Root (Manually pick band)")
        print("3. [New] Child")
        print("4. [List] Registry")
        print("5. [Verify] Integrity")
        print("q. Quit")

        c = input("\nChoice: ").strip().lower()
        try:
            if c == "1":
                f = input("File path: ").strip()
                if f:
                    cmd_stamp(
                        type(
                            "A",
                            (),
                            {"file": f, "dry_run": False, "yes": False, "band": None},
                        )
                    )
            elif c == "2":
                t = input("Title: ").strip()
                print("Bands:", ", ".join(BANDS.keys()))
                b = input("Band [ORG]: ").strip().upper() or "ORG"
                e = create_root(t, band=b)
                print(f"Issued: {e['root_id']}")
            elif c == "3":
                r = input("Root ID: ").strip()
                cid, rid = create_child(r)
                print(f"Issued: {cid}")
            elif c == "4":
                cmd_list(None)
            elif c == "5":
                cmd_verify(None)
            elif c == "q":
                break
            input("\nPress Enter...")
        except Exception as e:
            print(f"Error: {e}")
            input("\nPress Enter...")

# --- Commands ---
def cmd_new_root(args):
    """
    CLI wrapper for: python qid.py new-root --title "..." --band ORG
    """
    title = getattr(args, "title", None) or "Untitled Root"
    band = getattr(args, "band", None)

    e = create_root(title=title, band=(band.upper() if band else None))
    print(
        f"Issued Root ID: {e['root_id']}  (Band: {e['band']}, Base: {e['root_id'].split('_')[0]})"
    )

def cmd_new_child(args):
    """
    CLI wrapper for: python qid.py new-child qid0000001  (or qid0000001_0)
    """
    root_id = getattr(args, "root_id", None)
    if not root_id:
        raise QidError("Missing root_id. Example: python qid.py new-child qid0000001")

    child_id, root_id_full = create_child(root_id)
    print(f"Issued Child ID: {child_id}  (Root: {root_id_full})")

def cmd_list(args):
    reg = load_json(REGISTRY_FILE, {})
    if not reg:
        return print("Empty.")
    print(f"{'Root ID':<16} | {'Band':<10} | {'Children':<5} | {'Title'}")
    print("-" * 70)
    for b, d in sorted(reg.items(), key=lambda x: x[1]["created_at"], reverse=True)[
        :20
    ]:
        print(
            f"{d['root_id']:<16} | {d.get('band', '?'):<10} | {d['next_child'] - 1:<8} | {d['title']}"
        )

def cmd_stamp(args):
    fp = Path(args.file)
    if not fp.exists():
        raise QidError("File not found.")
    content = fp.read_text(encoding="utf-8")

    # 1. Check existing
    match = YAML_PATTERN.match(content)
    if match and ("qid_root:" in match.group(1) or "qid:" in match.group(1)):
        if (
            input("IDs exist. Type 'REPLACE' to continue: ").strip().upper()
            != "REPLACE"
        ):
            return

    # 2. Determine Band or Existing Root
    print("\n[1] Create New Root (Auto-infer band)")
    print("[2] Use Existing Root")
    choice = input("Choice [1]: ").strip() or "1"

    base, root_id = None, None
    if choice == "1":
        inferred = infer_band_from_path(fp)
        if inferred == "PROMPT_KB":
            print("\n'kb' path detected. Select band:")
            print("1. PERSONAL\n2. KNOWLEDGE")
            kb_c = input("Choice [2]: ").strip() or "2"
            inferred = "PERSONAL" if kb_c == "1" else "KNOWLEDGE"

        print(f"Inferred Band: {inferred}")
        title = input("Title for root: ").strip() or fp.stem
        entry = create_root(title, str(fp), band=inferred)
        base = parse_base(entry["root_id"])
        root_id = entry["root_id"]
    else:
        while True:
            rid = input("Root ID: ").strip()
            base = parse_base(rid)
            reg = load_json(REGISTRY_FILE, {})
            if base in reg:
                root_id = reg[base]["root_id"]
                break
            print("Not found.")

    # 3. Type
    def_type = "ROOT" if choice == "1" else "CHILD"
    t_choice = (
        input(f"Stamp as [R]OOT or [C]HILD? [{def_type[0]}]: ").strip().upper()
        or def_type[0]
    )
    final_qid = root_id if t_choice.startswith("R") else create_child(base)[0]

    # 4. Write
    meta = {"qid_root": root_id, "qid": final_qid, "created": date.today().isoformat()}
    bak = fp.with_suffix(fp.suffix + ".bak")
    fp.replace(bak)

    # Update YAML
    match = YAML_PATTERN.match(content)
    y_dict = {}
    if match:
        for l in match.group(1).splitlines():
            if ":" in l:
                k, v = l.split(":", 1)
                y_dict[k.strip()] = v.strip()
        body = content[match.end() :]
    else:
        body = content
    y_dict.update(meta)
    new_yaml = "---\n" + "\n".join(f"{k}: {v}" for k, v in y_dict.items()) + "\n---\n"
    fp.write_text(new_yaml + body.lstrip(), encoding="utf-8")
    print(f"Stamped: {final_qid}")

def cmd_allocate(args):
    """
    qid allocate --entity-type file --entity-key "KEY" [--json]
    """
    etype = args.entity_type
    ekey = args.entity_key

    # 1. Check Postgres first if available
    qid = ALLOCATOR.get_by_external_key(ekey)

    # 2. Check JSON registry
    if not qid:
        reg = load_json(REGISTRY_FILE, {})
        for base, entry in reg.items():
            if entry.get("external_key") == ekey:
                qid = entry["root_id"]
                break

    # 3. Create if not found
    if not qid:
        entry = create_root(
            title=f"Allocated for {etype}:{ekey}", band=args.band or "ORG"
        )
        qid = entry["root_id"]
        # Update entry with external info
        base = parse_base(qid)
        with file_lock():
            reg = load_json(REGISTRY_FILE, {})
            reg[base]["external_key"] = ekey
            reg[base]["entity_type"] = etype
            save_json_atomic(REGISTRY_FILE, reg)
            ALLOCATOR.register_allocation(reg[base])

    res = {"qid": qid, "entity_type": etype, "entity_key": ekey, "status": "allocated"}
    if args.json:
        print(json.dumps(res))
    else:
        print(f"Allocated: {qid}")

def cmd_label(args):
    """
    qid label --path "PATH" --qid "QID" [--json]
    """
    fp = Path(args.path)
    if not fp.exists():
        raise QidError(f"Path not found: {fp}")

    base = parse_base(args.qid)
    reg = load_json(REGISTRY_FILE, {})
    if base not in reg:
        raise QidError(f"QID {args.qid} not found in registry.")

    root_id = reg[base]["root_id"]
    content = fp.read_text(encoding="utf-8", errors="ignore")
    meta = {"qid_root": root_id, "qid": args.qid, "created": date.today().isoformat()}

    match = YAML_PATTERN.match(content)
    y_dict = {}
    if match:
        for l in match.group(1).splitlines():
            if ":" in l:
                k, v = l.split(":", 1)
                y_dict[k.strip()] = v.strip()
        body = content[match.end() :]
    else:
        body = content

    y_dict.update(meta)
    new_yaml = "---\n" + "\n".join(f"{k}: {v}" for k, v in y_dict.items()) + "\n---\n"
    fp.write_text(new_yaml + body.lstrip(), encoding="utf-8")

    res = {"path": str(fp), "qid": args.qid, "status": "labeled"}
    if args.json:
        print(json.dumps(res))
    else:
        print(f"Labeled {fp} with {args.qid}")

def cmd_verify(args):
    """
    qid verify --path "PATH" [--json]
    """
    target = Path(getattr(args, "path", None) or ".")
    reg = load_json(REGISTRY_FILE, {})
    roots = set(reg.keys())
    results = []

    files = []
    if target.is_file():
        files = [target]
    else:
        files = list(target.rglob("*.md"))

    for f in files:
        if f.name.startswith("_") or ".bak" in f.suffixes:
            continue
        if not f.is_file():
            continue
        try:
            m = YAML_PATTERN.match(f.read_text(encoding="utf-8", errors="ignore"))
            if not m:
                continue
            lines = m.group(1).splitlines()
            fr = next(
                (l.split(":", 1)[1].strip() for l in lines if "qid_root:" in l), None
            )
            fq = next((l.split(":", 1)[1].strip() for l in lines if "qid:" in l), None)

            issue = None
            if fr and parse_base(fr) not in roots:
                issue = "invalid_root"

            results.append(
                {
                    "file": str(f),
                    "qid_root": fr,
                    "qid": fq,
                    "valid": issue is None,
                    "issue": issue,
                }
            )
        except:
            pass

    if getattr(args, "json", False):
        print(json.dumps({"results": results}))
    else:
        for r in results:
            status = "OK" if r["valid"] else f"FAIL ({r['issue']})"
            print(f"{status:<10} | {r['qid'] or 'None':<15} | {r['file']}")

# --- Minimal Desktop UI (Tkinter) ---
def launch_ui():
    try:
        import tkinter as tk
        from tkinter import filedialog, simpledialog, messagebox
    except Exception as e:
        print("Tkinter is not available in this Python build.")
        log_error(f"tkinter unavailable: {e}")
        return

    init_storage(use_lock=True)

    root = tk.Tk()
    root.title("QiID Manager")

    out = tk.Text(root, height=20, width=90)
    out.pack(padx=10, pady=10)

    def write(msg):
        out.insert(tk.END, msg + "\n")
        out.see(tk.END)

    def do_stamp():
        path = filedialog.askopenfilename(
            title="Select Markdown File",
            filetypes=[("Markdown", "*.md"), ("All files", "*.*")],
        )
        if not path:
            return
        try:
            ok = cmd_stamp(path)
            write(f"STAMP: {path} -> {'OK' if ok else 'CANCELLED'}")
        except Exception as e:
            messagebox.showerror("Error", str(e))
            log_error(f"ui stamp error: {e}\n{traceback.format_exc()}")

    def do_new_root():
        title = simpledialog.askstring("New Root", "Title (optional):")
        band = simpledialog.askstring(
            "Band",
            "Band (SYSTEM/PERSONAL/ORG/CLIENT/KNOWLEDGE/ASSETS/PRODUCT/RESERVED):",
        )
        band = (band or "ORG").strip().upper()
        try:
            rid = create_root(title=title, band=band)
            write(f"NEW ROOT: {rid} (band={band})")
        except Exception as e:
            messagebox.showerror("Error", str(e))
            log_error(f"ui new root error: {e}\n{traceback.format_exc()}")

    def do_new_child():
        base = simpledialog.askstring(
            "New Child", "Base Root (qid####### or qid#######_0):"
        )
        if not base:
            return
        base = base.strip()
        try:
            cid = create_child(base)
            write(f"NEW CHILD: {cid} (base={base})")
        except Exception as e:
            messagebox.showerror("Error", str(e))
            log_error(f"ui new child error: {e}\n{traceback.format_exc()}")

    def do_list():
        try:
            cmd_list()
            write("LIST: printed to console (use CLI for full output)")
        except Exception as e:
            messagebox.showerror("Error", str(e))
            log_error(f"ui list error: {e}\n{traceback.format_exc()}")

    def do_verify():
        try:
            cmd_verify()
            write("VERIFY: printed to console")
        except Exception as e:
            messagebox.showerror("Error", str(e))
            log_error(f"ui verify error: {e}\n{traceback.format_exc()}")

    btns = tk.Frame(root)
    btns.pack(padx=10, pady=5)

    tk.Button(btns, text="Stamp File…", command=do_stamp, width=14).grid(
        row=0, column=0, padx=5, pady=5
    )
    tk.Button(btns, text="New Root…", command=do_new_root, width=14).grid(
        row=0, column=1, padx=5, pady=5
    )
    tk.Button(btns, text="New Child…", command=do_new_child, width=14).grid(
        row=0, column=2, padx=5, pady=5
    )
    tk.Button(btns, text="List", command=do_list, width=14).grid(
        row=0, column=3, padx=5, pady=5
    )
    tk.Button(btns, text="Verify", command=do_verify, width=14).grid(
        row=0, column=4, padx=5, pady=5
    )

    def do_console():
        import console
        import threading
        # Run console in a thread so it doesn't block Tkinter (though console.py uses serve_forever)
        # Actually, let's just launch it and let it block since qid.py is often run once
        threading.Thread(target=console.launch_console, daemon=True).start()

    tk.Button(root, text="🚀 LAUNCH WEB CONSOLE", command=do_console, bg="#6366f1", fg="white", font=("Inter", 10, "bold"), height=2).pack(fill="x", padx=15, pady=10)

    status = tk.Label(root, text=f"Workspace: {os.getcwd()}", anchor="w")
    status.pack(fill="x", padx=10, pady=(0, 10))

    root.mainloop()

def main():
    # Quick UI entry
    if len(sys.argv) > 1 and sys.argv[1].lower() == "ui":
        launch_ui()
        return
    if len(sys.argv) > 1 and sys.argv[1].lower() == "console":
        import console
        console.launch_console()
        return

    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("init")
    sub.add_parser("list")
    sub.add_parser("console")

    v = sub.add_parser("verify")
    v.add_argument("--path")
    v.add_argument("--json", action="store_true")

    nr = sub.add_parser("new-root")
    nr.add_argument("--title")
    nr.add_argument("--band")

    nc = sub.add_parser("new-child")
    nc.add_argument("root_id")

    st = sub.add_parser("stamp")
    st.add_argument("file")
    st.add_argument("--dry-run", action="store_true")
    st.add_argument("-y", dest="yes", action="store_true")

    # Contract Commands
    al = sub.add_parser("allocate")
    al.add_argument("--entity-type", required=True)
    al.add_argument("--entity-key", required=True)
    al.add_argument("--band")
    al.add_argument("--json", action="store_true")

    lb = sub.add_parser("label")
    lb.add_argument("--path", required=True)
    lb.add_argument("--qid", required=True)
    lb.add_argument("--json", action="store_true")

    args = parser.parse_args()
    if not args.command:
        interactive_menu()
    else:
        try:
            init_storage()
            if args.command == "init":
                pass
            elif args.command == "list":
                cmd_list(args)
            elif args.command == "new-root":
                cmd_new_root(args)
            elif args.command == "new-child":
                cmd_new_child(args)
            elif args.command == "stamp":
                cmd_stamp(args)
            elif args.command == "verify":
                cmd_verify(args)
            elif args.command == "allocate":
                cmd_allocate(args)
            elif args.command == "label":
                cmd_label(args)
        except Exception as e:
            if getattr(args, "json", False):
                print(json.dumps({"error": str(e)}))
            else:
                print(f"Error: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()
