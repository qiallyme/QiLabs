import os
import re

# --- CONFIGURATION ---
DRY_RUN = False  # Set to False when you are ready to apply changes
EXCLUDE_FILES = ["header.html", "footer.html"]  # Source files to skip

# Head dependencies required for the shared header/footer
HEAD_DEPENDENCIES = """
    <!-- Shared Dependencies -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        serif: ['Playfair Display', 'serif'],
                    }
                }
            }
        }
    </script>
"""


def orchestrate_clarity():
    # Load shared assets
    try:
        with open("header.html", "r", encoding="utf-8") as f:
            header_content = f.read()
        with open("footer.html", "r", encoding="utf-8") as f:
            footer_content = f.read()
    except FileNotFoundError:
        print("❌ Error: header.html or footer.html not found in current directory.")
        return

    # Regex patterns
    nav_pattern = re.compile(r"<nav.*?>.*?</nav>", re.DOTALL)
    footer_pattern = re.compile(r"<footer.*?>.*?</footer>", re.DOTALL)
    head_end_pattern = re.compile(r"</head>", re.IGNORECASE)

    print(f"--- {'DRY RUN ACTIVE' if DRY_RUN else 'LIVE MODE'} ---")

    # Walk through the directory starting from project root
    # Note: Assumes running from sites_QiAlly.com
    for root, dirs, files in os.walk("."):
        # Skip certain directories
        if any(d in root for d in [".git", "node_modules", ".trunk"]):
            continue

        for file in files:
            if file.endswith(".html") and file not in EXCLUDE_FILES:
                file_path = os.path.join(root, file)

                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                modified = False

                # 1. Ensure Head Dependencies
                if "cdn.tailwindcss.com" not in content:
                    content = head_end_pattern.sub(
                        f"{HEAD_DEPENDENCIES}\n</head>", content
                    )
                    modified = True

                # 2. Inject Header
                if re.search(nav_pattern, content):
                    content = nav_pattern.sub(header_content, content, count=1)
                    modified = True

                # 3. Inject Footer
                if re.search(footer_pattern, content):
                    content = footer_pattern.sub(footer_content, content, count=1)
                    modified = True

                if modified:
                    if not DRY_RUN:
                        with open(file_path, "w", encoding="utf-8") as f:
                            f.write(content)
                        print(f"✅ Updated: {file_path}")
                    else:
                        print(f"👀 Would update: {file_path}")


if __name__ == "__main__":
    orchestrate_clarity()
