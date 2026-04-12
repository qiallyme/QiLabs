from pathlib import Path
from PIL import Image

SIZES = [16, 24, 32, 48, 64, 128, 256]

def main():
    assets = Path(__file__).resolve().parent
    src_png = assets / "qid.png"          # use your existing PNG
    out_ico = assets / "qid.ico"
    out_dir = assets / "_generated_icons"
    out_dir.mkdir(exist_ok=True)

    if not src_png.exists():
        raise SystemExit(f"Missing source image: {src_png}")

    img = Image.open(src_png).convert("RGBA")

    # Generate sized PNGs (handy for debugging)
    sized_images = []
    for s in SIZES:
        resized = img.resize((s, s), resample=Image.Resampling.LANCZOS)
        png_path = out_dir / f"qid_{s}.png"
        resized.save(png_path, format="PNG")
        sized_images.append(resized)

    # Save multi-size ICO
    # Pillow will embed multiple sizes into one .ico if you pass sizes=...
    img.save(out_ico, format="ICO", sizes=[(s, s) for s in SIZES])

    print(f"OK: wrote {out_ico}")
    print(f"OK: wrote sized PNGs to {out_dir}")

if __name__ == "__main__":
    main()
