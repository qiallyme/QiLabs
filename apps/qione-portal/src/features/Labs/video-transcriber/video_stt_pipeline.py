#!/usr/bin/env python3
"""
Recursive media -> cleaned audio -> optional English STT pipeline.

Features:
- Recursively finds video AND audio files
- Extracts audio from video or normalizes/cleans existing audio
- Writes cleaned 16 kHz mono WAV files
- Produces English .txt and .srt transcripts with faster-whisper
- Interactive pass selection:
    1) Fast triage      -> base.en
    2) Balanced         -> small.en
    3) Detailed retry   -> medium.en
    4) Max recovery     -> large-v3
    5) Custom model
- Interactive cleanup selection:
    1) None
    2) Light
    3) Strong
    4) Custom FFmpeg filter chain
- Optional skip of already-processed files
- Outputs stored under a pass-specific folder:
    <root>/_stt_output/<pass_name>/audio_clean/...
    <root>/_stt_output/<pass_name>/transcripts/...
    <root>/_stt_output/<pass_name>/manifest.json
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Optional

VIDEO_EXTENSIONS = {
    ".mp4", ".mov", ".mkv", ".avi", ".wmv", ".m4v", ".webm",
    ".flv", ".mpeg", ".mpg", ".ts", ".mts", ".m2ts", ".3gp"
}

AUDIO_EXTENSIONS = {
    ".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg", ".wma"
}

SUPPORTED_EXTENSIONS = VIDEO_EXTENSIONS | AUDIO_EXTENSIONS

LIGHT_FILTER_CHAIN = (
    "highpass=f=80,"
    "lowpass=f=7500,"
    "afftdn=nr=12:nf=-30,"
    "loudnorm=I=-16:LRA=11:TP=-1.5"
)

STRONG_FILTER_CHAIN = (
    "highpass=f=90,"
    "lowpass=f=7000,"
    "afftdn=nr=18:nf=-40:tn=1,"
    "loudnorm=I=-16:LRA=7:TP=-1.5"
)

PASS_PRESETS = {
    "1": {"label": "fast_triage", "model": "base.en"},
    "2": {"label": "balanced", "model": "small.en"},
    "3": {"label": "detailed_retry", "model": "medium.en"},
    "4": {"label": "max_recovery", "model": "large-v3"},
}

CLEANUP_PRESETS = {
    "1": {"label": "none", "cleanup": False, "filter_chain": ""},
    "2": {"label": "light", "cleanup": True, "filter_chain": LIGHT_FILTER_CHAIN},
    "3": {"label": "strong", "cleanup": True, "filter_chain": STRONG_FILTER_CHAIN},
}


@dataclass
class FileResult:
    source: str
    status: str
    source_type: str
    audio_path: Optional[str] = None
    txt_path: Optional[str] = None
    srt_path: Optional[str] = None
    elapsed_seconds: Optional[float] = None
    error: Optional[str] = None


def run_cmd(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        check=False,
    )


def require_binary(name: str) -> str:
    path = shutil.which(name)
    if not path:
        print(f"ERROR: '{name}' was not found on PATH.")
        sys.exit(1)
    return path


def prompt_path() -> Path:
    while True:
        raw = input("Enter the folder path to scan: ").strip().strip('"').strip("'")
        path = Path(raw).expanduser()
        if path.is_dir():
            return path.resolve()
        print("That path is not a valid folder. Try again.")


def prompt_yes_no(question: str, default: bool = True) -> bool:
    suffix = " [Y/n]: " if default else " [y/N]: "
    raw = input(question + suffix).strip().lower()
    if not raw:
        return default
    return raw in {"y", "yes"}


def prompt_text(question: str, default: str) -> str:
    raw = input(f"{question} [{default}]: ").strip()
    return raw or default


def prompt_choice(question: str, choices: set[str], default: str) -> str:
    while True:
        raw = input(f"{question} [{default}]: ").strip()
        if not raw:
            return default
        if raw in choices:
            return raw
        print(f"Invalid choice. Valid options: {', '.join(sorted(choices))}")


def choose_default_device() -> str:
    return "cuda" if shutil.which("nvidia-smi") else "cpu"


def discover_media(root: Path) -> list[Path]:
    return sorted(
        p for p in root.rglob("*")
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS
    )


def is_audio_file(path: Path) -> bool:
    return path.suffix.lower() in AUDIO_EXTENSIONS


def sanitize_name(value: str) -> str:
    safe = "".join(c if c.isalnum() or c in {"-", "_"} else "_" for c in value.strip())
    safe = "_".join(part for part in safe.split("_") if part)
    return safe or "run"


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def has_audio_stream(ffprobe_bin: str, video_path: Path) -> bool:
    cmd = [
        ffprobe_bin,
        "-v", "error",
        "-select_streams", "a:0",
        "-show_entries", "stream=codec_type",
        "-of", "default=nw=1:nk=1",
        str(video_path),
    ]
    result = run_cmd(cmd)
    return result.returncode == 0 and "audio" in result.stdout.lower()


def build_output_paths(root: Path, source_path: Path, out_root: Path) -> tuple[Path, Path, Path]:
    rel = source_path.relative_to(root)
    base_rel = rel.with_suffix("")
    audio_out = (out_root / "audio_clean" / base_rel).with_suffix(".clean.wav")
    txt_out = (out_root / "transcripts" / base_rel).with_suffix(".txt")
    srt_out = (out_root / "transcripts" / base_rel).with_suffix(".srt")
    return audio_out, txt_out, srt_out


def extract_or_clean_to_wav(
    ffmpeg_bin: str,
    input_path: Path,
    output_wav: Path,
    cleanup: bool,
    filter_chain: str,
    treat_as_audio: bool,
) -> None:
    ensure_parent(output_wav)

    cmd = [
        ffmpeg_bin,
        "-y",
        "-hide_banner",
        "-loglevel", "error",
        "-i", str(input_path),
    ]

    if not treat_as_audio:
        cmd += ["-vn"]

    cmd += [
        "-ac", "1",
        "-ar", "16000",
        "-c:a", "pcm_s16le",
    ]

    if cleanup and filter_chain:
        cmd += ["-af", filter_chain]

    cmd.append(str(output_wav))

    result = run_cmd(cmd)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "ffmpeg failed")


def format_srt_timestamp(seconds: float) -> str:
    total_ms = int(round(seconds * 1000))
    hours = total_ms // 3_600_000
    total_ms %= 3_600_000
    minutes = total_ms // 60_000
    total_ms %= 60_000
    secs = total_ms // 1000
    millis = total_ms % 1000
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def write_transcript_files(txt_path: Path, srt_path: Path, segments: list) -> None:
    ensure_parent(txt_path)
    ensure_parent(srt_path)

    text_lines = []
    srt_blocks = []

    for idx, seg in enumerate(segments, start=1):
        text = (seg.text or "").strip()
        if not text:
            continue

        text_lines.append(text)
        start_ts = format_srt_timestamp(seg.start)
        end_ts = format_srt_timestamp(seg.end)
        srt_blocks.append(f"{idx}\n{start_ts} --> {end_ts}\n{text}\n")

    txt_content = "\n".join(text_lines).strip()
    srt_content = "\n".join(srt_blocks).strip()

    txt_path.write_text((txt_content + "\n") if txt_content else "", encoding="utf-8")
    srt_path.write_text((srt_content + "\n") if srt_content else "", encoding="utf-8")


def load_whisper_model(model_size: str, device: str):
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise RuntimeError(
            "faster-whisper is not installed. Run: pip install faster-whisper"
        ) from exc

    compute_type = "float16" if device == "cuda" else "int8"

    return WhisperModel(
        model_size,
        device=device,
        compute_type=compute_type,
    )


def transcribe_audio_with_model(
    model,
    audio_path: Path,
    txt_path: Path,
    srt_path: Path,
) -> None:
    segments_iter, info = model.transcribe(
        str(audio_path),
        language="en",
        beam_size=5,
        vad_filter=True,
        condition_on_previous_text=False,
    )

    segments = list(segments_iter)

    if not segments:
        ensure_parent(txt_path)
        ensure_parent(srt_path)
        txt_path.write_text("", encoding="utf-8")
        srt_path.write_text("", encoding="utf-8")
        return

    write_transcript_files(txt_path, srt_path, segments)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Recursively extract/clean audio from media files and optionally transcribe to English."
    )
    parser.add_argument("--path", type=str, help="Root folder to scan")
    parser.add_argument("--no-stt", action="store_true", help="Only extract/clean audio; do not transcribe")
    parser.add_argument("--device", type=str, default=None, choices=["cpu", "cuda"], help="Transcription device")
    parser.add_argument("--model", type=str, default=None, help="Whisper model name")
    parser.add_argument("--no-cleanup", action="store_true", help="Do not apply cleanup filters")
    parser.add_argument("--filter-chain", type=str, default=None, help="Custom FFmpeg filter chain")
    parser.add_argument("--pass-label", type=str, default=None, help="Custom output pass label")
    parser.add_argument("--skip-existing", action="store_true", help="Skip files whose .txt and .srt already exist")
    return parser.parse_args()


def interactive_pass_selection() -> tuple[str, str]:
    print("\nChoose transcription pass:")
    print("  1) Fast triage     -> base.en")
    print("  2) Balanced        -> small.en")
    print("  3) Detailed retry  -> medium.en")
    print("  4) Max recovery    -> large-v3")
    print("  5) Custom model")

    choice = prompt_choice("Select pass", {"1", "2", "3", "4", "5"}, "1")

    if choice == "5":
        model = prompt_text("Enter custom model name", "medium.en")
        label = sanitize_name(prompt_text("Enter pass label", model))
        return model, label

    preset = PASS_PRESETS[choice]
    return preset["model"], preset["label"]


def interactive_cleanup_selection() -> tuple[bool, str, str]:
    print("\nChoose cleanup level:")
    print("  1) None")
    print("  2) Light speech cleanup")
    print("  3) Strong retry cleanup")
    print("  4) Custom FFmpeg filter chain")

    choice = prompt_choice("Select cleanup", {"1", "2", "3", "4"}, "2")

    if choice == "4":
        custom = prompt_text("Enter custom FFmpeg filter chain", STRONG_FILTER_CHAIN)
        return True, custom, "custom"

    preset = CLEANUP_PRESETS[choice]
    return preset["cleanup"], preset["filter_chain"], preset["label"]


def main() -> None:
    args = parse_args()

    ffmpeg_bin = require_binary("ffmpeg")
    ffprobe_bin = require_binary("ffprobe")

    root = Path(args.path).expanduser().resolve() if args.path else prompt_path()
    if not root.is_dir():
        print("ERROR: Provided path is not a folder.")
        sys.exit(1)

    do_stt = not args.no_stt
    device = args.device or choose_default_device()

    if do_stt:
        if args.model:
            model_size = args.model
            pass_label = sanitize_name(args.pass_label or args.model)
        else:
            model_size, default_pass_label = interactive_pass_selection()
            pass_label = sanitize_name(args.pass_label or default_pass_label)
    else:
        model_size = ""
        pass_label = sanitize_name(args.pass_label or "audio_only")

    if args.no_cleanup:
        cleanup = False
        filter_chain = ""
        cleanup_label = "none"
    elif args.filter_chain:
        cleanup = True
        filter_chain = args.filter_chain
        cleanup_label = "custom"
    else:
        cleanup, filter_chain, cleanup_label = interactive_cleanup_selection()

    skip_existing = args.skip_existing
    if not args.skip_existing:
        skip_existing = prompt_yes_no("Skip files that already have both .txt and .srt outputs?", default=True)

    media_files = discover_media(root)
    if not media_files:
        print("No supported media files found.")
        return

    out_root = root / "_stt_output" / f"{pass_label}__cleanup_{cleanup_label}"
    out_root.mkdir(parents=True, exist_ok=True)

    print(f"\nRoot: {root}")
    print(f"Found {len(media_files)} media file(s).")
    print(f"Output: {out_root}")
    print(f"Cleanup: {'ON' if cleanup else 'OFF'}")
    if cleanup:
        print(f"Cleanup profile: {cleanup_label}")
    print(f"STT: {'ON' if do_stt else 'OFF'}")
    if do_stt:
        print(f"Model: {model_size}")
        print(f"Device: {device}")
    print(f"Skip existing: {'ON' if skip_existing else 'OFF'}")
    print()

    model = None
    if do_stt:
        print("Loading Whisper model once...")
        model = load_whisper_model(model_size=model_size, device=device)
        print("Model loaded.\n")

    results: list[FileResult] = []
    processed = 0
    skipped = 0
    errors = 0

    for index, source_path in enumerate(media_files, start=1):
        start_time = time.perf_counter()
        source_type = "audio" if is_audio_file(source_path) else "video"
        print(f"[{index}/{len(media_files)}] {source_path}")

        audio_out, txt_out, srt_out = build_output_paths(root, source_path, out_root)

        try:
            if skip_existing and do_stt and txt_out.exists() and srt_out.exists():
                print("  - Skipped: transcript outputs already exist")
                skipped += 1
                results.append(FileResult(
                    source=str(source_path),
                    status="skipped_existing",
                    source_type=source_type,
                    audio_path=str(audio_out) if audio_out.exists() else None,
                    txt_path=str(txt_out),
                    srt_path=str(srt_out),
                    elapsed_seconds=round(time.perf_counter() - start_time, 3),
                ))
                continue

            if source_type == "video" and not has_audio_stream(ffprobe_bin, source_path):
                msg = "Skipped: no audio stream found"
                print(f"  - {msg}")
                skipped += 1
                results.append(FileResult(
                    source=str(source_path),
                    status="skipped_no_audio",
                    source_type=source_type,
                    error=msg,
                    elapsed_seconds=round(time.perf_counter() - start_time, 3),
                ))
                continue

            extract_or_clean_to_wav(
                ffmpeg_bin=ffmpeg_bin,
                input_path=source_path,
                output_wav=audio_out,
                cleanup=cleanup,
                filter_chain=filter_chain,
                treat_as_audio=(source_type == "audio"),
            )
            print(f"  - Audio written: {audio_out}")

            txt_path_str = None
            srt_path_str = None

            if do_stt:
                transcribe_audio_with_model(
                    model=model,
                    audio_path=audio_out,
                    txt_path=txt_out,
                    srt_path=srt_out,
                )
                txt_path_str = str(txt_out)
                srt_path_str = str(srt_out)
                print(f"  - Transcript written: {txt_out}")
                print(f"  - Subtitles written:  {srt_out}")

            elapsed = round(time.perf_counter() - start_time, 3)
            processed += 1

            results.append(FileResult(
                source=str(source_path),
                status="ok",
                source_type=source_type,
                audio_path=str(audio_out),
                txt_path=txt_path_str,
                srt_path=srt_path_str,
                elapsed_seconds=elapsed,
            ))

        except Exception as exc:
            elapsed = round(time.perf_counter() - start_time, 3)
            errors += 1
            print(f"  - ERROR: {exc}")
            results.append(FileResult(
                source=str(source_path),
                status="error",
                source_type=source_type,
                error=str(exc),
                elapsed_seconds=elapsed,
            ))

    manifest_path = out_root / "manifest.json"
    manifest_path.write_text(
        json.dumps([asdict(r) for r in results], indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    print("\nDone.")
    print(f"Processed: {processed}")
    print(f"Skipped:   {skipped}")
    print(f"Errors:    {errors}")
    print(f"Manifest:  {manifest_path}")


if __name__ == "__main__":
    main()