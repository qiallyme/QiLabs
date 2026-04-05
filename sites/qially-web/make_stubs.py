from pathlib import Path

ROOT = Path(__file__).resolve().parent

SKIP_DIRS = {
    ".git", "__pycache__", "node_modules",
    "assets", "components", "data", "public"
}

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} • QiAlly</title>
  <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>

<div id="header"></div>

<main class="page page--stub">
  <section class="hero">
    <div class="container">
      <h1>{title}</h1>
      <p>This page is currently being built. Check back soon or contact us for help.</p>
      <a href="/contact/" class="btn">Get Help</a>
    </div>
  </section>
</main>

<div id="footer"></div>

<script src="/assets/js/main.js"></script>
</body>
</html>
"""

def title_from_path(path: Path) -> str:
    return path.name.replace("-", " ").replace("_", " ").title()

def should_skip(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)

def main():
    created = []

    for folder in ROOT.rglob("*"):
        if not folder.is_dir():
            continue

        if should_skip(folder):
            continue

        index_file = folder / "index.html"

        if not index_file.exists():
            title = title_from_path(folder)
            content = TEMPLATE.format(title=title)
            index_file.write_text(content, encoding="utf-8")
            created.append(index_file)

    print(f"Created {len(created)} stub pages")
    for f in created:
        print(f"- {f.relative_to(ROOT)}")

if __name__ == "__main__":
    main()