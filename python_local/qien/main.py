"""
QiEn (pronounced "Key-On") - local-first evidence intelligence module.
Orchestrates ingestion, extraction, linking, and neutral narration.
"""

import os
import hashlib
import json
import logging
from pathlib import Path
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("QiEn")

# Constants mapping to folder structure
ROOT_DIR = Path("../../QiEvidence")
INPUT_DIR = ROOT_DIR / "input"
WORKING_DIR = ROOT_DIR / "working"
OUTPUT_DIR = ROOT_DIR / "output"
ARCHIVE_DIR = ROOT_DIR / "archive"

class QiEnEngine:
    def __init__(self, tenant_id: str, case_id: str):
        self.tenant_id = tenant_id
        self.case_id = case_id
        self._ensure_dirs()
    
    def _ensure_dirs(self):
        """Verify the expected QiEvidence folder structure exists."""
        dirs = [
            INPUT_DIR / "videos", INPUT_DIR / "photos", INPUT_DIR / "documents", INPUT_DIR / "other",
            WORKING_DIR / "audio", WORKING_DIR / "frames", WORKING_DIR / "transcripts",
            OUTPUT_DIR / "events", OUTPUT_DIR / "entities", OUTPUT_DIR / "timelines", 
            OUTPUT_DIR / "reports", OUTPUT_DIR / "reviews",
            ARCHIVE_DIR
        ]
        for d in dirs:
            os.makedirs(d, exist_ok=True)
            logger.debug(f"Verified directory: {d}")

    def get_file_hash(self, file_path: Path) -> str:
        """Calculate SHA-256 hash of a file."""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def ingest(self, file_path: Path) -> Dict[str, Any]:
        """Phase 1: Ingest - Hash file, read metadata, assign evidence ID."""
        logger.info(f"Ingesting file: {file_path}")
        file_hash = self.get_file_hash(file_path)
        
        # In actual implementation, this would check evidence_records table
        record = {
            "evidence_id": f"EV-{file_hash[:12]}",
            "file_path": str(file_path),
            "file_hash": file_hash,
            "tenant_id": self.tenant_id,
            "case_id": self.case_id,
            "status": "ingested"
        }
        
        # Save placeholder record to working directory
        record_path = WORKING_DIR / f"{record['evidence_id']}_record.json"
        with open(record_path, "w") as f:
            json.dump(record, f, indent=4)
        
        return record

    def extract(self, record: Dict[str, Any]):
        """Phase 2: Extract - Placeholder for Whisper/Qwen-VL integration."""
        logger.info(f"Extracting evidence from: {record['evidence_id']}")
        # 1. Audio transcription (Whisper)
        # 2. Keyframe extraction (ffmpeg)
        # 3. Visual event extraction (Qwen-VL)
        # 4. OCR on documents/photos
        
        # This is where the actual intelligence happens
        logger.info("Extraction logic pending (Qwen-VL / Whisper)")

    def process_all_pending(self):
        """Utility to scan input folders and process everything."""
        input_subdirs = ["videos", "photos", "documents", "other"]
        for subdir in input_subdirs:
            folder = INPUT_DIR / subdir
            for file in folder.iterdir():
                if file.is_file():
                    record = self.ingest(file)
                    self.extract(record)

if __name__ == "__main__":
    # Test execution
    engine = QiEnEngine(tenant_id="test-tenant", case_id="test-case")
    logger.info("QiEn Engine initialized.")
    # engine.process_all_pending()
