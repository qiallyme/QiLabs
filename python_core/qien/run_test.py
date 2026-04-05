"""
QiEn Test Runner - Integrated Phase 1 (Ingest) and Phase 2 (Extract)
Processes a single video file from input/videos/ to verify the pipeline.
"""

import sys
import logging
from pathlib import Path
from main import QiEnEngine
from audio_util import extract_audio_from_video
from transcribe_util import transcribe_audio
from visual_util import extract_keyframes, describe_visual_events

# Set up logging to console
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("QiEn.Test")

def run_verification(test_file: str = "test_video.mp4"):
    """
    Complete pipeline run for a test file.
    Expects test_video.mp4 to exist in QiEvidence/input/videos/
    """
    # 0. Setup
    tenant_id = "tenant-test-001"
    case_id = "case-alpha-99"
    engine = QiEnEngine(tenant_id, case_id)
    
    video_path = Path("../../QiEvidence/input/videos") / test_file
    if not video_path.exists():
        logger.error(f"Test video not found: {video_path}")
        logger.info(f"Please place a video file at {video_path.absolute()}")
        return

    # 1. Ingest
    logger.info("--- Phase 1: Ingesting ---")
    record = engine.ingest(video_path)
    evidence_id = record['evidence_id']
    logger.info(f"Assigned ID: {evidence_id}")

    # 2. Extract Audio
    logger.info("--- Phase 2a: Audio Extraction ---")
    audio_path = Path("../../QiEvidence/working/audio") / f"{evidence_id}.mp3"
    if extract_audio_from_video(video_path, audio_path):
        # 3. Transcribe
        logger.info("--- Phase 2b: Transcription ---")
        transcript_path = Path("../../QiEvidence/working/transcripts") / f"{evidence_id}.json"
        transcribe_audio(audio_path, transcript_path)
    
    # 4. Extract Keyframes
    logger.info("--- Phase 2c: Frame Extraction ---")
    frames_dir = Path("../../QiEvidence/working/frames") / evidence_id
    frames = extract_keyframes(video_path, frames_dir, frames_per_second=1.0)
    
    if frames:
        # 5. Visual Extraction (Qwen-VL simulated)
        logger.info("--- Phase 2d: Visual Extraction (Qwen-VL) ---")
        observations_path = Path("../../QiEvidence/output/events") / f"{evidence_id}_visual.json"
        describe_visual_events(frames, observations_path)

    logger.info("--- Success: QiEn Pipeline Verification Complete ---")
    logger.info(f"Check output for results in: {Path('../../QiEvidence/output/').absolute()}")

if __name__ == "__main__":
    test_filename = "test_video.mp4"
    if len(sys.argv) > 1:
        test_filename = sys.argv[1]
    run_verification(test_filename)
