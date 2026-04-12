from __future__ import annotations

import os
import sys
import subprocess
from pathlib import Path
from typing import Tuple, Optional


class QidBridgeError(Exception):
    pass


def _repo_relative_qid_path() -> Path:
    """
    Resolve qid.py relative to this file:
    app/kernel/src/qid_bridge.py -> app/tools/qid-cli/qid.py
    """
    here = Path(__file__).resolve()
    # app/kernel/src -> app
    app_dir = here.parents[2]
    qid = app_dir / "tools" / "qid-cli" / "qid.py"
    return qid


def validate_module(module_path: Path, python_exe: Optional[str] = None) -> Tuple[bool, str]:
    """
    Calls: python app/tools/qid-cli/qid.py validate <module_path>

    Returns:
      (ok, combined_output)
    """
    qid_py = _repo_relative_qid_path()
    if not qid_py.exists():
        raise QidBridgeError(f"qid.py not found at expected path: {qid_py}")

    py = python_exe or sys.executable
    cmd = [py, str(qid_py), "validate", str(module_path)]

    # Ensure working directory does not affect qid.py script_dir resolution
    cwd = str(qid_py.parent)

    try:
        p = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True
        )
    except Exception as e:
        raise QidBridgeError(f"Failed to run qid validate: {e}") from e

    out = (p.stdout or "") + (p.stderr or "")
    ok = (p.returncode == 0)
    return ok, out.strip()
