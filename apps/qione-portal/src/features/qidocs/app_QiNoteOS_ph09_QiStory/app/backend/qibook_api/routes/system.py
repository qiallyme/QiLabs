"""System status and configuration routes."""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import time

from utils.llm import llm
from utils.embeddings import embeddings
from utils.config import LLM_BACKEND, LLM_MODEL, EMBEDDING_MODEL

router = APIRouter(prefix="/api/system", tags=["system"])


@router.get("/status")
async def get_system_status():
    """Get system status (LLM, embeddings, etc.)."""
    status = {
        "llm": {
            "backend": LLM_BACKEND,
            "model": LLM_MODEL,
            "available": False,
            "last_error": None,
        },
        "embeddings": {
            "model": EMBEDDING_MODEL,
            "available": False,
            "last_error": None,
        },
        "whisper": {
            "available": False,
            "last_error": None,
        },
        "ocr": {
            "available": False,
            "last_error": None,
        },
    }
    
    # Test LLM
    try:
        start = time.time()
        response = await llm.generate("Test", max_tokens=10)
        latency = (time.time() - start) * 1000  # ms
        status["llm"]["available"] = True
        status["llm"]["test_latency_ms"] = round(latency, 2)
        status["llm"]["test_response_length"] = len(response)
    except Exception as e:
        status["llm"]["available"] = False
        status["llm"]["last_error"] = str(e)
    
    # Test embeddings
    try:
        result = await embeddings.embed(["test"])
        status["embeddings"]["available"] = True
        status["embeddings"]["dimension"] = len(result[0]) if result else None
    except Exception as e:
        status["embeddings"]["available"] = False
        status["embeddings"]["last_error"] = str(e)
    
    # Whisper/OCR (placeholders - would check for local installations)
    status["whisper"]["available"] = False
    status["ocr"]["available"] = False
    
    return status


@router.post("/test-llm")
async def test_llm():
    """Test LLM with a simple prompt."""
    try:
        start = time.time()
        prompt = "Write one sentence about writing a book."
        response = await llm.generate(prompt, max_tokens=50)
        latency_ms = (time.time() - start) * 1000
        
        return {
            "success": True,
            "latency_ms": round(latency_ms, 2),
            "response": response,
            "response_length": len(response),
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


@router.post("/test-embeddings")
async def test_embeddings():
    """Test embeddings with sample text."""
    try:
        start = time.time()
        texts = ["This is a test sentence.", "Another test sentence."]
        result = await embeddings.embed(texts)
        latency_ms = (time.time() - start) * 1000
        
        return {
            "success": True,
            "latency_ms": round(latency_ms, 2),
            "dimension": len(result[0]) if result else None,
            "count": len(result),
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }

