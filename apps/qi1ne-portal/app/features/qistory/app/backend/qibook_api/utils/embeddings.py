"""Local embedding model integration."""
import os
from typing import List
import httpx
import numpy as np

from .config import EMBEDDING_MODEL, EMBEDDING_DIM, LLM_BASE_URL


class LocalEmbeddings:
    """Local embedding model adapter."""
    
    def __init__(self):
        self.model = EMBEDDING_MODEL
        self.dim = EMBEDDING_DIM
        self.base_url = LLM_BASE_URL
    
    async def embed(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts."""
        # Try Ollama embeddings first (if supported)
        try:
            return await self._embed_ollama(texts)
        except Exception:
            # Fallback to local sentence-transformers or other
            raise NotImplementedError("Local embedding model not yet configured")
    
    async def _embed_ollama(self, texts: List[str]) -> List[List[float]]:
        """Use Ollama embeddings if available."""
        async with httpx.AsyncClient(timeout=60.0) as client:
            embeddings = []
            for text in texts:
                response = await client.post(
                    f"{self.base_url}/api/embeddings",
                    json={"model": self.model, "prompt": text}
                )
                response.raise_for_status()
                result = response.json()
                embeddings.append(result.get("embedding", []))
            return embeddings
    
    def embed_sync(self, texts: List[str]) -> List[List[float]]:
        """Synchronous embedding (for batch processing)."""
        # This would use a local model loaded in memory
        # For now, placeholder
        raise NotImplementedError("Synchronous local embeddings not yet implemented")


# Global instance
embeddings = LocalEmbeddings()

