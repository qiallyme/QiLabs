from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "data" / "site_map.json"

IGNORE_DIRS = {
    ".git",
    "__pycache__",
    "node_modules",
    "dist",
    "build",
}

HTML_GLOB = "*.html"


def should_skip(path: Path) -> bool:
    return any(part in IGNORE_DIRS for part in path.parts)


def iter_html_files() -> list[Path]:
    files = []
    for path in ROOT.rglob(HTML_GLOB):
        if should_skip(path):
            continue
        files.append(path)
    return sorted(files)


class LinkAndIdParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []
        self.ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = dict(attrs)
        if tag == "a" and attr_map.get("href"):
            self.links.append(attr_map["href"])
        if attr_map.get("id"):
            self.ids.add(attr_map["id"])


def parse_html(path: Path) -> tuple[list[str], set[str]]:
    parser = LinkAndIdParser()
    parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
    return parser.links, parser.ids


def normalize_root_link(href: str) -> str:
    if href == "/index.html":
        return "/"
    return href


def exists_for_root_path(url_path: str) -> bool:
    """
    Accepts root-relative paths like:
    /, /contact/, /privacy/, /services/, /showcases/videos.html
    """
    url_path = normalize_root_link(url_path)

    if url_path == "/":
        return (ROOT / "index.html").exists()

    rel = url_path.lstrip("/")

    direct = ROOT / rel
    if direct.exists():
        return True

    if url_path.endswith("/"):
        folder_index = ROOT / rel / "index.html"
        return folder_index.exists()

    as_html = ROOT / rel
    if as_html.suffix == "":
        folder_index = ROOT / rel / "index.html"
        if folder_index.exists():
            return True
        html_file = ROOT / f"{rel}.html"
        if html_file.exists():
            return True

    return False


def check_root_href(source_file: Path, href: str, ids_by_file: dict[Path, set[str]]) -> list[str]:
    errors: list[str] = []

    if href.startswith(("http://", "https://", "mailto:", "tel:")):
        return errors
    if href.startswith("javascript:"):
        return errors

    # Skip non-root-relative links but flag them
    if not href.startswith("/") and not href.startswith("#"):
        errors.append(
            f"{source_file.relative_to(ROOT)} -> non-root-relative link: {href}"
        )
        return errors

    # In-page anchor
    if href.startswith("#"):
        anchor = href[1:]
        if anchor and anchor not in ids_by_file[source_file]:
            errors.append(
                f"{source_file.relative_to(ROOT)} -> missing in-page anchor: #{anchor}"
            )
        return errors

    path_only, _, fragment = href.partition("#")

    if not exists_for_root_path(path_only):
        errors.append(
            f"{source_file.relative_to(ROOT)} -> missing target: {href}"
        )
        return errors

    if fragment:
        target_file = resolve_target_file(path_only)
        if target_file is None:
            errors.append(
                f"{source_file.relative_to(ROOT)} -> could not resolve anchor target: {href}"
            )
        elif fragment not in ids_by_file.get(target_file, set()):
            errors.append(
                f"{source_file.relative_to(ROOT)} -> missing anchor '{fragment}' in {target_file.relative_to(ROOT)}"
            )

    if "index.html" in href:
        errors.append(
            f"{source_file.relative_to(ROOT)} -> avoid explicit index.html in link: {href}"
        )

    return errors


def resolve_target_file(url_path: str) -> Path | None:
    url_path = normalize_root_link(url_path)

    if url_path == "/":
        file_path = ROOT / "index.html"
        return file_path if file_path.exists() else None

    rel = url_path.lstrip("/")
    direct = ROOT / rel
    if direct.is_file():
        return direct

    if url_path.endswith("/"):
        folder_index = ROOT / rel / "index.html"
        return folder_index if folder_index.exists() else None

    if direct.is_dir():
        folder_index = direct / "index.html"
        return folder_index if folder_index.exists() else None

    if direct.suffix == "":
        folder_index = ROOT / rel / "index.html"
        if folder_index.exists():
            return folder_index
        html_file = ROOT / f"{rel}.html"
        if html_file.exists():
            return html_file

    return None


def check_site_map(ids_by_file: dict[Path, set[str]]) -> list[str]:
    errors: list[str] = []
    if not DATA_FILE.exists():
        return [f"Missing site map: {DATA_FILE}"]

    items = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    for item in items:
        title = item.get("title", "<untitled>")
        url = item.get("url", "").strip()

        if not url:
            errors.append(f"site_map.json -> '{title}' has empty url")
            continue

        path_only, _, fragment = url.partition("#")
        if not exists_for_root_path(path_only):
            errors.append(f"site_map.json -> '{title}' points to missing target: {url}")
            continue

        if fragment:
            target_file = resolve_target_file(path_only)
            if target_file is None:
                errors.append(f"site_map.json -> '{title}' unresolved target: {url}")
            elif fragment not in ids_by_file.get(target_file, set()):
                errors.append(
                    f"site_map.json -> '{title}' missing anchor '{fragment}' in {target_file.relative_to(ROOT)}"
                )

    return errors


def main() -> None:
    html_files = iter_html_files()
    ids_by_file: dict[Path, set[str]] = {}
    links_by_file: dict[Path, list[str]] = {}

    for html_file in html_files:
        links, ids = parse_html(html_file)
        ids_by_file[html_file] = ids
        links_by_file[html_file] = links

    errors: list[str] = []

    for html_file, links in links_by_file.items():
        for href in links:
            errors.extend(check_root_href(html_file, href, ids_by_file))

    errors.extend(check_site_map(ids_by_file))

    if errors:
        print("LINK CHECK FAILED\n")
        for err in errors:
            print(f"- {err}")
        sys.exit(1)

    print(f"Checked {len(html_files)} HTML files. No link errors found.")


if __name__ == "__main__":
    main()