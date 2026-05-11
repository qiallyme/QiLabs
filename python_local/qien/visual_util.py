import os
import subprocess
import logging
import json
from pathlib import Path
from PIL import Image

logger = logging.getLogger("QiEn.Visual")

def extract_keyframes(video_path: Path, output_frames_dir: Path, frames_per_second: float = 1.0) -> list:
    """Extract frames from video for visual analysis using ffmpeg."""
    logger.info(f"Extracting keyframes from {video_path} to {output_frames_dir} at {frames_per_second} fps")
    os.makedirs(output_frames_dir, exist_ok=True)
    
    # Extract one frame per second
    # -vf format is "fps=1" for one frame per second
    try:
        command = [
            "ffmpeg", "-y",
            "-i", str(video_path),
            "-vf", f"fps={frames_per_second}",
            str(output_frames_dir / "frame_%04d.jpg")
        ]
        
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode != 0:
            logger.error(f"ffmpeg error: {result.stderr}")
            return []
        
        frames = sorted(list(output_frames_dir.glob("frame_*.jpg")))
        logger.info(f"Extracted {len(frames)} frames.")
        return frames
    except Exception as e:
        logger.error(f"Error extracting keyframes: {e}")
        return []

def describe_visual_events(frames: list, output_events_path: Path) -> bool:
    """
    Simulated Qwen-VL analysis.
    In real usage, this would invoke:
    from transformers import Qwen2_5_VLForConditionalGeneration
    or similar local VLM.
    """
    logger.info(f"Running visual extraction on {len(frames)} frames...")
    
    # Placeholder: Simulated Qwen-VL JSON observations
    observations = []
    for i, frame_path in enumerate(frames):
        # Determine relative timestamp (1 frame per second logic)
        timestamp = f"00:00:{i:02d}"
        
        # Simulated extraction (Machine-grounded visual facts)
        # In real usage, this is where the VLM model is queried for each keyframe
        observations.append({
            "id": f"OBS-{i+1:04d}",
            "timestamp": timestamp,
            "source_frame": frame_path.name,
            "observation": "Simulated visual event detection.",
            "objects_detected": ["vehicle", "person"], # Mock
            "inference_type": "observed",
            "confidence": 0.95
        })
    
    with open(output_events_path, "w", encoding="utf-8") as f:
        json.dump(observations, f, indent=4)
    
    logger.info(f"Visual observations saved to {output_events_path}")
    return True

if __name__ == "__main__":
    # Test script
    logging.basicConfig(level=logging.INFO)
    v_path = Path("../../QiEvidence/input/videos/test_video.mp4")
    f_dir = Path("../../QiEvidence/working/frames/test_video")
    e_path = Path("../../QiEvidence/output/events/test_video_observations.json")
    if v_path.exists():
        frames = extract_keyframes(v_path, f_dir)
        if frames:
            describe_visual_events(frames, e_path)
    else:
        logger.warning(f"Test video not found: {v_path}")
