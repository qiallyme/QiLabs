import os
import sys
import json
import time
import argparse
import re
import tempfile
from datetime import datetime, date
from pathlib import Path
from contextlib import contextmanager

# --- Configuration & Constants ---
SCRIPT_DIR = Path(__file__).parent.absolute()
REGISTRY_FILE = SCRIPT_DIR / "_qid_registry.json"
STATE_FILE = SCRIPT_DIR / "_qid_state.json"
LOCK_FILE = SCRIPT_DIR / "_qid_registry.lock"
LOCK_TIMEOUT = 10

# Chart of Accounts Root Bands
BANDS = {
    "SYSTEM":    (1, 99999),
    "PERSONAL":  (100000, 199999),
    "ORG":       (200000, 399999),
    "CLIENT":    (400000, 899999),
    "KNOWLEDGE": (900000, 1199999),
    "ASSETS":    (1200000, 1499999),
    "PRODUCT":   (1500000, 1799999),
    "RESERVED":  (1800000, 1999999),
}

# Regex for 7-digit ID validation (Case Insensitive)
ROOT_PATTERN = re.compile(r"^qid(\d{7})_0$", re.IGNORECASE)
BASE_PATTERN = re.compile(r"^qid(\d{7})$", re.IGNORECASE)
CHILD_PATTERN = re.compile(r"^qid(\d{7})-(\d+)$", re.IGNORECASE)
YAML_PATTERN = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)


# --- State/Registry Schema (Migration-Safe) ---

def _band_for_root_int(root_int: int) -> str:
    for name, (start, end) in BANDS.items():
        if start <= root_int <= end:
            return name
    return "ORG"

def _ensure_registry_schema(registry: dict, state: dict) -> dict:
    """Ensure each registry entry has required keys; infer band if missing."""
    if not isinstance(registry, dict):
        return {}
    for base, entry in list(registry.items()):
        if not isinstance(entry, dict):
            registry.pop(base, None)
            continue

        # Normalize keys
        root_id = entry.get("root_id") or f"{base}_0"
        entry["root_id"] = root_id

        root_int = entry.get("root_int")
        if root_int is None:
            m = BASE_PATTERN.match(base)
            if m:
                root_int = int(m.group(1))
        entry["root_int"] = int(root_int) if root_int is not None else None

        if "band" not in entry or not entry["band"]:
            if entry["root_int"] is not None:
                entry["band"] = _band_for_root_int(entry["root_int"])
            else:
                entry["band"] = state.get("default_band", "ORG")

        if "next_child" not in entry or not isinstance(entry["next_child"], int) or entry["next_child"] < 1:
            entry["next_child"] = 1

        entry.setdefault("status", "active")
        entry.setdefault("created_at", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        entry.setdefault("title", "Untitled Root")
        entry.setdefault("path", ".")

        registry[base] = entry
    return registry

def _ensure_state_schema(state: dict, registry: dict) -> dict:
    """Upgrade older state formats (e.g., next_root_seq) to band-aware next_seq."""
    if not isinstance(state, dict):
        state = {}

    state.setdefault("root_digits", 7)
    state.setdefault("default_band", "ORG")
    state["bands"] = {name: [start, end] for name, (start, end) in BANDS.items()}

    next_seq = state.get("next_seq")
    if not isinstance(next_seq, dict):
        next_seq = {name: start for name, (start, _end) in BANDS.items()}
    else:
        for name, (start, _end) in BANDS.items():
            v = next_seq.get(name)
            if not isinstance(v, int) or v < start:
                next_seq[name] = start

    legacy = state.get("next_root_seq")
    if isinstance(legacy, int) and legacy > 0:
        legacy_band = _band_for_root_int(legacy)
        next_seq[legacy_band] = max(next_seq.get(legacy_band, BANDS[legacy_band][0]), legacy)

    if isinstance(registry, dict) and registry:
        max_by_band = {}
        for _base, entry in registry.items():
            try:
                rint = int(entry.get("root_int"))
            except Exception:
                continue
            b = entry.get("band") or _band_for_root_int(rint)
            max_by_band[b] = max(max_by_band.get(b, 0), rint)
        for b, mx in max_by_band.items():
            if b in BANDS:
                next_seq[b] = max(next_seq.get(b, BANDS[b][0]), mx + 1)

    state["next_seq"] = next_seq
    return state

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
            try: os.remove(LOCK_FILE)
            except OSError: pass

def save_json_atomic(filepath, data):
    folder = os.path.dirname(os.path.abspath(filepath))
    with tempfile.NamedTemporaryFile('w', dir=folder, delete=False, encoding='utf-8') as tf:
        json.dump(data, tf, indent=2)
        temp_name = tf.name
    try:
        os.replace(temp_name, filepath)
    except Exception as e:
        if os.path.exists(temp_name): os.remove(temp_name)
        raise QidError(f"Failed to save {filepath}: {e}")

# --- Data Handling ---

def load_json(filepath, default):
    if not os.path.exists(filepath): return default
    try:
        with open(filepath, 'r', encoding='utf-8') as f: return json.load(f)
    except json.JSONDecodeError: raise QidError(f"File {filepath} corrupted.")

def parse_base(id_str):
    id_str = id_str.strip().lower()
    m_root = ROOT_PATTERN.match(id_str)
    if m_root: return f"qid{m_root.group(1)}"
    m_base = BASE_PATTERN.match(id_str)
    if m_base: return m_base.group(0)
    m_child = CHILD_PATTERN.match(id_str)
    if m_child: return f"qid{m_child.group(1)}"
    return None

def infer_band_from_path(path_str):
    p = str(path_str).lower().replace('\\', '/')
    if "clients" in p or "cases" in p: return "CLIENT"
    if "qinoteos" in p or "modules" in p: return "PRODUCT"
    if "assets" in p: return "ASSETS"
    if "kb" in p: return "PROMPT_KB" # Special prompt needed
    if "_admin" in p or "system" in p: return "SYSTEM"
    return "ORG"

# --- Core Logic ---

def init_storage(use_lock: bool = True):
    """Ensure state/registry exist and are upgraded to the latest schema."""
    if not os.path.exists(STATE_FILE):
        save_json_atomic(STATE_FILE, {})
    if not os.path.exists(REGISTRY_FILE):
        save_json_atomic(REGISTRY_FILE, {})

    def _upgrade():
        state = load_json(STATE_FILE, {})
        registry = load_json(REGISTRY_FILE, {})
        state = _ensure_state_schema(state, registry)
        registry = _ensure_registry_schema(registry, state)
        save_json_atomic(STATE_FILE, state)
        save_json_atomic(REGISTRY_FILE, registry)

    if use_lock:
        with file_lock():
            _upgrade()
    else:
        _upgrade()


def create_root(title=None, path_str=None, band=None):
    init_storage(use_lock=False)
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
            if seq > limit: raise QidError(f"Band {target_band} is exhausted!")
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
            "status": "active"
        }
        
        registry[base] = entry
        state["next_seq"][target_band] = seq + 1
        
        save_json_atomic(REGISTRY_FILE, registry)
        save_json_atomic(STATE_FILE, state)
        return entry

def create_child(base_id):
    init_storage(use_lock=False)
    with file_lock():
        registry = load_json(REGISTRY_FILE, {})
        base = parse_base(base_id)
        if not base or base not in registry:
            raise QidError(f"Root {base_id} not found.")
        
        entry = registry[base]
        child_id = f"{base}-{entry['next_child']}"
        entry["next_child"] += 1
        save_json_atomic(REGISTRY_FILE, registry)
        return child_id, entry["root_id"]

# --- Interactive Flow ---

def interactive_menu():
    init_storage()
    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        print("=== QiID Manager (7-Digit Bands) ===")
        print("1. [Stamp] a file")
        print("2. [New] Root (Manually pick band)")
        print("3. [New] Child")
        print("4. [List] Registry")
        print("5. [Verify] Integrity")
        print("q. Quit")
        
        c = input("\nChoice: ").strip().lower()
        try:
            if c == '1':
                f = input("File path: ").strip()
                if f: cmd_stamp(type('A',(),{'file':f,'dry_run':False,'yes':False,'band':None}))
            elif c == '2':
                t = input("Title: ").strip()
                print("Bands:", ", ".join(BANDS.keys()))
                b = input("Band [ORG]: ").strip().upper() or "ORG"
                e = create_root(t, band=b)
                print(f"Issued: {e['root_id']}")
            elif c == '3':
                r = input("Root ID: ").strip()
                cid, rid = create_child(r)
                print(f"Issued: {cid}")
            elif c == '4':
                cmd_list(None)
            elif c == '5':
                cmd_verify(None)
            elif c == 'q': break
            input("\nPress Enter...")
        except Exception as e:
            print(f"Error: {e}")
            input("\nPress Enter...")

# --- Commands ---

def cmd_list(args):
    reg = load_json(REGISTRY_FILE, {})
    if not reg: return print("Empty.")
    print(f"{'Root ID':<16} | {'Band':<10} | {'Children':<5} | {'Title'}")
    print("-" * 70)
    for b, d in sorted(reg.items(), key=lambda x: x[1]['created_at'], reverse=True)[:20]:
        print(f"{d['root_id']:<16} | {d.get('band','?'):<10} | {d['next_child']-1:<8} | {d['title']}")

def cmd_stamp(args):
    fp = Path(args.file)
    if not fp.exists(): raise QidError("File not found.")
    content = fp.read_text(encoding='utf-8')
    
    # 1. Check existing
    match = YAML_PATTERN.match(content)
    if match and ("qid_root:" in match.group(1) or "qid:" in match.group(1)):
        if input("IDs exist. Type 'REPLACE' to continue: ").strip().upper() != "REPLACE": return

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
        base = parse_base(entry['root_id'])
        root_id = entry['root_id']
    else:
        while True:
            rid = input("Root ID: ").strip()
            base = parse_base(rid)
            reg = load_json(REGISTRY_FILE, {})
            if base in reg:
                root_id = reg[base]['root_id']
                break
            print("Not found.")

    # 3. Type
    def_type = "ROOT" if choice == "1" else "CHILD"
    t_choice = input(f"Stamp as [R]OOT or [C]HILD? [{def_type[0]}]: ").strip().upper() or def_type[0]
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
            if ':' in l:
                k, v = l.split(':', 1)
                y_dict[k.strip()] = v.strip()
        body = content[match.end():]
    else: body = content
    y_dict.update(meta)
    new_yaml = "---\n" + "\n".join(f"{k}: {v}" for k,v in y_dict.items()) + "\n---\n"
    fp.write_text(new_yaml + body.lstrip(), encoding='utf-8')
    print(f"Stamped: {final_qid}")

def cmd_verify(args):
    reg = load_json(REGISTRY_FILE, {})
    roots = set(reg.keys())
    qids = {}
    for f in Path('.').rglob('*.md'):
        if f.name.startswith('_') or '.bak' in f.suffixes: continue
        try:
            m = YAML_PATTERN.match(f.read_text(encoding='utf-8', errors='ignore'))
            if not m: continue
            lines = m.group(1).splitlines()
            fr = next((l.split(':',1)[1].strip() for l in lines if 'qid_root:' in l), None)
            fq = next((l.split(':',1)[1].strip() for l in lines if 'qid:' in l), None)
            if fr and parse_base(fr) not in roots: print(f"Invalid Root: {fr} in {f}")
            if fq:
                if fq in qids: print(f"Duplicate QID: {fq} in {f} and {qids[fq]}")
                qids[fq] = f
        except: pass
    print("Verification complete.")

def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command")
    sub.add_parser("init")
    sub.add_parser("list")
    sub.add_parser("verify")
    nr = sub.add_parser("new-root"); nr.add_argument("--title"); nr.add_argument("--band")
    nc = sub.add_parser("new-child"); nc.add_argument("root_id")
    st = sub.add_parser("stamp"); st.add_argument("file"); st.add_argument("--dry-run", action="store_true"); st.add_argument("-y", dest="yes", action="store_true")
    
    args = parser.parse_args()
    if not args.command: interactive_menu()
    else:
        try:
            init_storage()
            if args.command == "init": pass
            elif args.command == "list": cmd_list(args)
            elif args.command == "new-root": cmd_new_root(args)
            elif args.command == "new-child": cmd_new_child(args)
            elif args.command == "stamp": cmd_stamp(args)
            elif args.command == "verify": cmd_verify(args)
        except Exception as e: print(f"Error: {e}"); sys.exit(1)

if __name__ == "__main__": main()