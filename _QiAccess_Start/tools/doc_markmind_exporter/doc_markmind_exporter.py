# filename: doc_markmind_exporter.py
# purpose/context: Prototype QiAccess local toolbox exporter that scans a target folder
#   and writes a MarkMind-compatible Markdown outline for documentation mapping.
# usage: python .\tools\doc_markmind_exporter\doc_markmind_exporter.py <target-folder>
#   [--out PATH] [--max-depth N] [--include-all] [--title "Custom Title"] [--force]
# inputs: target folder path plus optional output path, title, depth, and include mode flags.
# outputs: Markdown file with MarkMind basic-mode front matter and a folder/file outline.
# safety: read-only scan of the target folder; writes only the selected output file;
#   will not overwrite an existing file unless --force is provided.
# owner: Cody / QiLabs

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


IGNORED_DIRS = {
    ".git",
    ".obsidian",
    "node_modules",
    ".venv",
    "__pycache__",
    "site",
}

PREFERRED_EXTENSIONS = {
    ".md",
    ".yaml",
    ".yml",
    ".json",
    ".mmd",
}

BINARY_MEDIA_EXTENSIONS = {
    ".7z",
    ".a",
    ".avi",
    ".bin",
    ".bmp",
    ".class",
    ".dll",
    ".doc",
    ".docx",
    ".dylib",
    ".exe",
    ".gif",
    ".gz",
    ".ico",
    ".jar",
    ".jpeg",
    ".jpg",
    ".lock",
    ".mp3",
    ".mp4",
    ".pdf",
    ".png",
    ".pyc",
    ".pyd",
    ".pyo",
    ".so",
    ".sqlite",
    ".tar",
    ".tgz",
    ".tif",
    ".tiff",
    ".wav",
    ".webm",
    ".webp",
    ".zip",
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Export a folder tree as MarkMind-compatible Markdown."
    )
    parser.add_argument("target", nargs="?", help="Target folder to scan.")
    parser.add_argument("--out", help="Output Markdown path.")
    parser.add_argument("--max-depth", type=int, help="Maximum relative depth to include.")
    parser.add_argument(
        "--include-all",
        action="store_true",
        help="Include non-preferred text files in addition to preferred file types.",
    )
    parser.add_argument("--title", help="Custom root title for the map.")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite the output file if it already exists.",
    )
    return parser


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.max_depth is not None and args.max_depth < 0:
        parser.error("--max-depth must be 0 or greater.")
    return args


def is_probably_text(path: Path) -> bool:
    try:
        sample = path.read_bytes()[:4096]
    except OSError:
        return False

    if b"\x00" in sample:
        return False

    try:
        sample.decode("utf-8")
    except UnicodeDecodeError:
        try:
            sample.decode("latin-1")
        except UnicodeDecodeError:
            return False

    return True


def should_include_file(path: Path, include_all: bool, output_paths: list[Path]) -> bool:
    resolved_path = path.resolve(strict=False)
    for output_path in output_paths:
        if resolved_path == output_path.resolve(strict=False):
            return False

    suffix = path.suffix.lower()
    if suffix in PREFERRED_EXTENSIONS:
        return True

    if not include_all:
        return False

    if suffix in BINARY_MEDIA_EXTENSIONS:
        return False

    return is_probably_text(path)


def emit_node(lines: list[str], label: str, depth: int) -> None:
    if depth <= 5:
        lines.append(f"{'#' * (depth + 1)} {label}")
        lines.append("")
        return

    indent = "  " * (depth - 6)
    lines.append(f"{indent}- {label}")


def render_tree(
    current: Path,
    root: Path,
    tree: dict[Path, dict[str, list[Path]]],
    lines: list[str],
    include_content: bool = False,
) -> None:
    current_depth = len(current.relative_to(root).parts)

    for folder in tree.get(current, {}).get("dirs", []):
        folder_depth = len(folder.relative_to(root).parts)
        emit_node(lines, f"{folder.name}/", folder_depth)
        render_tree(folder, root, tree, lines, include_content)

    for file_path in tree.get(current, {}).get("files", []):
        file_depth = len(file_path.relative_to(root).parts)
        emit_node(lines, file_path.name, file_depth)
        
        if include_content:
            try:
                content = file_path.read_text(encoding="utf-8")
                if content.strip():
                    if file_depth <= 5:
                        lines.append("```text")
                        lines.extend(content.splitlines())
                        lines.append("```")
                        lines.append("")
                    else:
                        indent = "  " * (file_depth - 5)
                        lines.append(f"{indent}```text")
                        for line in content.splitlines():
                            lines.append(f"{indent}{line}")
                        lines.append(f"{indent}```")
            except Exception:
                pass


def collect_tree(
    root: Path,
    max_depth: int | None,
    include_all: bool,
    output_paths: list[Path],
) -> tuple[dict[Path, dict[str, list[Path]]], int, int]:
    tree: dict[Path, dict[str, list[Path]]] = {root: {"dirs": [], "files": []}}
    folder_count = 0
    file_count = 0

    for current_dir, dir_names, file_names in os.walk(root, topdown=True):
        current = Path(current_dir)
        rel_depth = len(current.relative_to(root).parts)
        tree.setdefault(current, {"dirs": [], "files": []})

        filtered_dirs = []
        for name in sorted(dir_names):
            if name in IGNORED_DIRS:
                continue
            child = current / name
            child_depth = len(child.relative_to(root).parts)
            if max_depth is not None and child_depth > max_depth:
                continue
            filtered_dirs.append(name)
            tree.setdefault(child, {"dirs": [], "files": []})
            tree[current]["dirs"].append(child)
            folder_count += 1

        dir_names[:] = filtered_dirs

        for name in sorted(file_names):
            child = current / name
            child_depth = len(child.relative_to(root).parts)
            if max_depth is not None and child_depth > max_depth:
                continue
            if should_include_file(child, include_all=include_all, output_paths=output_paths):
                tree[current]["files"].append(child)
                file_count += 1

        if max_depth is not None and rel_depth >= max_depth:
            dir_names[:] = []

    return tree, folder_count, file_count


def build_markdown(root: Path, title: str, tree: dict[Path, dict[str, list[Path]]], include_content: bool = False) -> str:
    lines = [
        "---",
        "mindmap-plugin: basic",
        "---",
        "",
        f"# {title}",
        "",
    ]
    render_tree(root, root, tree, lines, include_content)
    return "\n".join(lines).rstrip() + "\n"


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv if argv is not None else sys.argv[1:])

    if not args.target:
        script_dir = Path(__file__).resolve().parent
        default_docs = script_dir.parent.parent / "docs"
        
        print("=" * 60)
        print("MarkMind Exporter — Interactive Mode")
        print("=" * 60)
        
        target_input = input(f"Enter target folder to scan [{default_docs}]: ").strip().strip('"')
        if not target_input:
            args.target = str(default_docs)
        else:
            args.target = target_input
        args.force = True  # Automatically force overwrite when running interactively

    target = Path(args.target).expanduser().resolve(strict=False)
    if not target.exists():
        print(f"Error: target folder does not exist: {target}", file=sys.stderr)
        return 1
    if not target.is_dir():
        print(f"Error: target is not a folder: {target}", file=sys.stderr)
        return 1

    output_path = (
        Path(args.out).expanduser().resolve(strict=False)
        if args.out
        else (target / "_markmind_export.md").resolve(strict=False)
    )

    if output_path.exists() and not args.force:
        print(
            f"Error: output file already exists: {output_path}. Use --force to overwrite.",
            file=sys.stderr,
        )
        return 1

    output_content_path = output_path.with_name(output_path.stem + "_with_content" + output_path.suffix)

    title = args.title or target.name
    tree, folder_count, file_count = collect_tree(
        root=target,
        max_depth=args.max_depth,
        include_all=args.include_all,
        output_paths=[output_path, output_content_path],
    )
    markdown = build_markdown(target, title, tree, include_content=False)
    markdown_with_content = build_markdown(target, title, tree, include_content=True)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(markdown, encoding="utf-8")
    output_content_path.write_text(markdown_with_content, encoding="utf-8")

    print(f"root scanned: {target}")
    print(f"folders included: {folder_count}")
    print(f"files included: {file_count}")
    print(f"outline map: {output_path}")
    print(f"content map: {output_content_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
