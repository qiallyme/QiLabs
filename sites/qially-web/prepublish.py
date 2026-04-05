from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def run_step(label: str, cmd: list[str]) -> None:
    print(f"\n==> {label}")
    result = subprocess.run(cmd, cwd=ROOT)
    if result.returncode != 0:
        print(f"\nFAILED: {label}")
        sys.exit(result.returncode)


def main() -> None:
    run_step("Build navigation", [sys.executable, "build_nav.py"])
    run_step("Check links", [sys.executable, "check_links.py"])
    print("\nAll prepublish checks passed.")


if __name__ == "__main__":
    main()