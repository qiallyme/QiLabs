import subprocess
import logging
from pathlib import Path

logger = logging.getLogger("QiEn.Audio")

def extract_audio_from_video(video_path: Path, audio_output_path: Path) -> bool:
    """Extract audio from video using ffmpeg."""
    logger.info(f"Extracting audio from {video_path} to {audio_output_path}")
    try:
        # -y to overwrite, -i for input, -vn to skip video, -acodec mp3 (or copy if already mp3)
        command = [
            "ffmpeg", "-y",
            "-i", str(video_path),
            "-vn",
            "-acodec", "libmp3lame",
            "-q:a", "2",
            str(audio_output_path)
        ]
        
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode == 0:
            logger.info("Audio extraction successful.")
            return True
        else:
            logger.error(f"ffmpeg error: {result.stderr}")
            return False
    except Exception as e:
        logger.error(f"Error extracting audio: {e}")
        return False

if __name__ == "__main__":
    # Test script
    logging.basicConfig(level=logging.INFO)
    v_path = Path("../../QiEvidence/input/videos/test_video.mp4")
    a_path = Path("../../QiEvidence/working/audio/test_video.mp3")
    if v_path.exists():
        extract_audio_from_video(v_path, a_path)
    else:
        logger.warning(f"Test video not found: {v_path}")
