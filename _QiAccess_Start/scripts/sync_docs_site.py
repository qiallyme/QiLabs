from __future__ import annotations

import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SOURCE_DOCS = ROOT / "docs"
RUNTIME_ROOT = ROOT / ".runtime" / "mkdocs" / "runs"
SITE_LAYER_ROOT = ROOT / "docs-site"
OVERRIDES_SOURCE = SITE_LAYER_ROOT / "overrides"
ASSETS_SOURCE = SITE_LAYER_ROOT / "assets"

EXCLUDED_DIRS = {
    ".git",
    ".obsidian",
    ".obsidian-qidocs",
    ".smart-env",
    "__pycache__",
}
MARKDOWN_EXTENSIONS = {".md", ".markdown", ".mdown"}
TEXT_ENCODINGS = ("utf-8", "utf-8-sig", "utf-16", "utf-16-le", "utf-16-be", "cp1252")
LINK_PATTERN = re.compile(r"(?P<prefix>!?\[[^\]]*\]\()(?P<target>[^)]+)(?P<suffix>\))")


def is_excluded(path: Path) -> bool:
    return any(part in EXCLUDED_DIRS for part in path.parts)


def split_anchor(target: str) -> tuple[str, str]:
    if "#" not in target:
        return target, ""
    path_part, anchor = target.split("#", 1)
    return path_part, f"#{anchor}"


def add_anchor(path_part: str, anchor: str) -> str:
    return f"{path_part}{anchor}" if anchor else path_part


def remap_relative_target(target: str) -> str:
    if "://" in target or target.startswith(("mailto:", "tel:", "#", "/")):
        return target

    path_part, anchor = split_anchor(target)
    normalized = path_part.replace("\\", "/")

    if normalized in {".", "./"}:
        return add_anchor("index.md", anchor)

    if normalized in {"..", "../"}:
        return add_anchor("../index.md", anchor)

    if normalized == "_index.md":
        return add_anchor("index.md", anchor)

    if normalized.endswith("/_index.md"):
        return add_anchor(f"{normalized[:-len('_index.md')]}index.md", anchor)

    if normalized.endswith("/"):
        return add_anchor(f"{normalized}index.md", anchor)

    return target


def rewrite_markdown_links(text: str) -> str:
    def replace(match: re.Match[str]) -> str:
        target = match.group("target").strip()
        remapped = remap_relative_target(target)
        return f"{match.group('prefix')}{remapped}{match.group('suffix')}"

    return LINK_PATTERN.sub(replace, text)


def read_text_best_effort(path: Path) -> str:
    for encoding in TEXT_ENCODINGS:
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue

    raise UnicodeDecodeError("unknown", b"", 0, 1, f"Unable to decode markdown file: {path}")


def ensure_prerequisites() -> None:
    if not SOURCE_DOCS.exists():
        raise SystemExit(f"Source docs directory not found: {SOURCE_DOCS}")
    if not OVERRIDES_SOURCE.exists():
        raise SystemExit(f"Overrides directory not found: {OVERRIDES_SOURCE}")
    if not ASSETS_SOURCE.exists():
        raise SystemExit(f"Assets directory not found: {ASSETS_SOURCE}")


def create_run_dir() -> Path:
    RUNTIME_ROOT.mkdir(parents=True, exist_ok=True)
    run_id = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    run_dir = RUNTIME_ROOT / run_id
    run_dir.mkdir(parents=True, exist_ok=False)
    return run_dir


def copy_docs_to_run(run_docs_dir: Path) -> tuple[int, int]:
    markdown_files = 0
    copied_files = 0

    for source_path in SOURCE_DOCS.rglob("*"):
        relative_path = source_path.relative_to(SOURCE_DOCS)
        if is_excluded(relative_path):
            continue

        destination_path = run_docs_dir / relative_path

        if source_path.is_dir():
            destination_path.mkdir(parents=True, exist_ok=True)
            continue

        if should_skip_readme(source_path):
            continue

        if source_path.suffix.lower() in MARKDOWN_EXTENSIONS:
            destination_path = destination_path.with_name(remap_markdown_filename(source_path))
            destination_path.parent.mkdir(parents=True, exist_ok=True)
            text = read_text_best_effort(source_path)
            destination_path.write_text(rewrite_markdown_links(text), encoding="utf-8")
            markdown_files += 1
            copied_files += 1
            continue

        destination_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source_path, destination_path)
        copied_files += 1

    return copied_files, markdown_files


def should_skip_readme(source_path: Path) -> bool:
    if source_path.name != "README.md":
        return False

    sibling_names = {path.name for path in source_path.parent.iterdir()}
    return "_index.md" in sibling_names or "index.md" in sibling_names


def remap_markdown_filename(source_path: Path) -> str:
    if source_path.name in {"_index.md", "README.md"}:
        return "index.md"
    return source_path.name


def add_generated_indexes(run_docs_dir: Path) -> int:
    created_indexes = 0

    for directory in sorted(path for path in run_docs_dir.rglob("*") if path.is_dir()):
        index_path = directory / "index.md"
        if index_path.exists():
            continue

        child_dirs = sorted(
            child for child in directory.iterdir() if child.is_dir() and not is_excluded(child.relative_to(run_docs_dir))
        )
        child_pages = sorted(
            child
            for child in directory.iterdir()
            if child.is_file() and child.suffix.lower() in MARKDOWN_EXTENSIONS and child.name != "README.md"
        )

        if not child_dirs and not child_pages:
            continue

        title = prettify_name(directory.name)
        lines = [f"# {title}", "", "Generated section index for site navigation.", ""]

        if child_dirs:
            lines.append("## Sections")
            for child_dir in child_dirs:
                lines.append(f"- [{prettify_name(child_dir.name)}]({child_dir.name}/index.md)")
            lines.append("")

        visible_pages = [page for page in child_pages if page.name != "index.md"]
        if visible_pages:
            lines.append("## Pages")
            for child_page in visible_pages:
                label = prettify_name(child_page.stem)
                lines.append(f"- [{label}]({child_page.name})")
            lines.append("")

        index_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
        created_indexes += 1

    return created_indexes


def prettify_name(name: str) -> str:
    cleaned = re.sub(r"^\d+_", "", name)
    cleaned = cleaned.replace("_", " ").replace("-", " ").strip()
    return cleaned.title() if cleaned else "Section"


def copy_site_layer(run_dir: Path) -> None:
    shutil.copytree(OVERRIDES_SOURCE, run_dir / "overrides")
    shutil.copytree(ASSETS_SOURCE, run_dir / "assets")


def write_runtime_config(run_dir: Path) -> Path:
    config_path = run_dir / "mkdocs.generated.yml"
    config_path.write_text(
        "\n".join(
            [
                "site_name: QiAccess Knowledge Docs",
                "site_description: Generated static documentation site built from the source docs vault.",
                "docs_dir: docs",
                "site_dir: site",
                "use_directory_urls: false",
                "",
                "theme:",
                "  name: material",
                "  custom_dir: overrides",
                "  language: en",
                "  palette:",
                "    - scheme: default",
                "      primary: teal",
                "      accent: blue",
                "  features:",
                "    - navigation.sections",
                "    - navigation.expand",
                "    - navigation.top",
                "    - search.highlight",
                "    - search.suggest",
                "    - content.code.copy",
                "    - toc.follow",
                "",
                "plugins:",
                "  - search",
                "",
                "markdown_extensions:",
                "  - admonition",
                "  - attr_list",
                "  - footnotes",
                "  - md_in_html",
                "  - tables",
                "  - toc:",
                "      permalink: true",
                "  - pymdownx.details",
                "  - pymdownx.highlight:",
                "      anchor_linenums: true",
                "      line_spans: __span",
                "      pygments_lang_class: true",
                "  - pymdownx.inlinehilite",
                "  - pymdownx.superfences",
                "",
                "extra_css:",
                "  - assets/stylesheets/extra.css",
                "",
                "extra:",
                "  generator_notice: Source markdown remains in docs/. The published site is generated from a separate runtime copy.",
                "",
            ]
        ),
        encoding="utf-8",
    )
    return config_path


def prepare_run() -> tuple[Path, Path, int, int]:
    ensure_prerequisites()
    run_dir = create_run_dir()
    run_docs_dir = run_dir / "docs"
    run_docs_dir.mkdir(parents=True, exist_ok=True)

    copied_files, markdown_files = copy_docs_to_run(run_docs_dir)
    generated_indexes = add_generated_indexes(run_docs_dir)
    copy_site_layer(run_dir)
    config_path = write_runtime_config(run_dir)
    return run_dir, config_path, copied_files + generated_indexes, markdown_files


def print_summary(run_dir: Path, config_path: Path, copied_files: int, markdown_files: int) -> None:
    print(f"Source docs:      {SOURCE_DOCS}")
    print(f"Run directory:    {run_dir}")
    print(f"Runtime config:   {config_path}")
    print(f"Files copied:     {copied_files}")
    print(f"Markdown files:   {markdown_files}")
    print("Source docs were not modified.")


def run_mkdocs(command: str, config_path: Path) -> int:
    completed = subprocess.run(["mkdocs", command, "-f", str(config_path)], cwd=ROOT)
    return completed.returncode


def main() -> None:
    mode = sys.argv[1] if len(sys.argv) > 1 else "sync"
    if mode not in {"sync", "build", "serve"}:
        raise SystemExit("Usage: python scripts/sync_docs_site.py [sync|build|serve]")

    run_dir, config_path, copied_files, markdown_files = prepare_run()
    print_summary(run_dir, config_path, copied_files, markdown_files)

    if mode == "sync":
        return

    raise SystemExit(run_mkdocs(mode, config_path))


if __name__ == "__main__":
    main()
