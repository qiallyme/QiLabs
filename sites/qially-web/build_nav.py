from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "data" / "site_map.json"
HEADER_FILE = ROOT / "components" / "header.html"
FOOTER_FILE = ROOT / "components" / "footer.html"


def load_site_map() -> list[dict]:
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Missing site map: {DATA_FILE}")
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


def render_header(items: list[dict]) -> str:
    nav_links = []
    for item in items:
        if item.get("nav"):
            title = item["title"].strip()
            url = item["url"].strip()
            nav_links.append(f'      <a href="{url}">{title}</a>')

    return "\n".join(
        [
            '<header class="site-header">',
            '  <div class="site-header__inner">',
            '    <a class="site-logo" href="/">QiAlly</a>',
            '    <nav class="site-nav" aria-label="Main navigation">',
            *nav_links,
            "    </nav>",
            "  </div>",
            "</header>",
            "",
        ]
    )


def render_footer(items: list[dict]) -> str:
    footer_links = []
    for item in items:
        if item.get("footer"):
            title = item["title"].strip()
            url = item["url"].strip()
            footer_links.append(f'      <a href="{url}">{title}</a>')

    return "\n".join(
        [
            '<footer class="site-footer">',
            '  <div class="site-footer__inner">',
            '    <div class="site-footer__brand">© QiAlly</div>',
            '    <nav class="site-footer__nav" aria-label="Footer navigation">',
            *footer_links,
            "    </nav>",
            "  </div>",
            "</footer>",
            "",
        ]
    )


def main() -> None:
    items = load_site_map()
    HEADER_FILE.parent.mkdir(parents=True, exist_ok=True)
    FOOTER_FILE.parent.mkdir(parents=True, exist_ok=True)

    HEADER_FILE.write_text(render_header(items), encoding="utf-8")
    FOOTER_FILE.write_text(render_footer(items), encoding="utf-8")

    print(f"Built header: {HEADER_FILE}")
    print(f"Built footer: {FOOTER_FILE}")


if __name__ == "__main__":
    main()