"""Local LLM adapter supporting Ollama, llama.cpp, and LM Studio."""
import os
import subprocess
import json
from typing import Optional, Dict, Any
from pathlib import Path
import httpx

from .config import LLM_BACKEND, LLM_MODEL, LLM_BASE_URL


class LocalLLM:
    """Adapter for local LLM backends."""
    
    def __init__(self):
        self.backend = LLM_BACKEND
        self.model = LLM_MODEL
        self.base_url = LLM_BASE_URL
    
    async def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> str:
        """Generate text using local LLM."""
        if self.backend == "ollama":
            return await self._generate_ollama(prompt, system, temperature, max_tokens)
        elif self.backend == "llama.cpp":
            return await self._generate_llamacpp(prompt, system, temperature, max_tokens)
        elif self.backend == "lmstudio":
            return await self._generate_lmstudio(prompt, system, temperature, max_tokens)
        else:
            raise ValueError(f"Unknown LLM backend: {self.backend}")
    
    async def _generate_ollama(
        self,
        prompt: str,
        system: Optional[str],
        temperature: float,
        max_tokens: Optional[int]
    ) -> str:
        """Generate using Ollama HTTP API."""
        async with httpx.AsyncClient(timeout=300.0) as client:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                }
            }
            if system:
                payload["system"] = system
            if max_tokens:
                payload["options"]["num_predict"] = max_tokens
            
            response = await client.post(
                f"{self.base_url}/api/generate",
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
    
    async def _generate_llamacpp(
        self,
        prompt: str,
        system: Optional[str],
        temperature: float,
        max_tokens: Optional[int]
    ) -> str:
        """Generate using llama.cpp CLI."""
        # This would require llama.cpp binary in PATH
        # For now, fallback to error or use subprocess
        raise NotImplementedError("llama.cpp CLI adapter not yet implemented")
    
    async def _generate_lmstudio(
        self,
        prompt: str,
        system: Optional[str],
        temperature: float,
        max_tokens: Optional[int]
    ) -> str:
        """Generate using LM Studio local API."""
        async with httpx.AsyncClient(timeout=300.0) as client:
            full_prompt = f"{system}\n\n{prompt}" if system else prompt
            payload = {
                "model": self.model,
                "messages": [{"role": "user", "content": full_prompt}],
                "temperature": temperature,
            }
            if max_tokens:
                payload["max_tokens"] = max_tokens
            
            response = await client.post(
                f"{self.base_url}/v1/chat/completions",
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]


# Global instance
llm = LocalLLM()

