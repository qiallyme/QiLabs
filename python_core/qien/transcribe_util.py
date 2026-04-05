import os
import logging
from pathlib import Path
try:
    from faster_whisper import WhisperModel
except ImportError:
    WhisperModel = None

logger = logging.getLogger("QiEn.Transcribe")

def transcribe_audio(audio_path: Path, transcript_output_path: Path, model_size="base") -> bool:
    """Transcribe audio using faster-whisper."""
    if not WhisperModel:
        logger.error("faster-whisper is not installed. Use 'pip install faster-whisper'")
        return False
        
    logger.info(f"Transcribing {audio_path} using {model_size} model...")
    try:
        # Run on CPU by default initially, user can modify for CUDA
        device = "cpu"
        model = WhisperModel(model_size, device=device, compute_type="int8")

        segments, info = model.transcribe(str(audio_path), beam_size=5)

        logger.info(f"Detected language '{info.language}' with probability {info.language_probability:.2f}")

        results = []
        for segment in segments:
            logger.debug(f"[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))
            results.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text.strip()
            })

        with open(transcript_output_path, "w", encoding="utf-8") as f:
            import json
            json.dump(results, f, indent=4)
            
        logger.info(f"Transcription saved to {transcript_output_path}")
        return True
    except Exception as e:
        logger.error(f"Error transcribing audio: {e}")
        return False

if __name__ == "__main__":
    # Test script
    logging.basicConfig(level=logging.INFO)
    a_path = Path("../../QiEvidence/working/audio/test_video.mp3")
    t_path = Path("../../QiEvidence/working/transcripts/test_video.json")
    if a_path.exists():
        transcribe_audio(a_path, t_path)
    else:
        logger.warning(f"Test audio not found: {a_path}")
