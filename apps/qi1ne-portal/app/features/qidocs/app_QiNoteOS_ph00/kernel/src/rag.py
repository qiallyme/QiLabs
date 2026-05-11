from __future__ import annotations
import json
import logging
from pathlib import Path
from typing import List, Dict, Optional
import numpy as np

# Optional imports
try:
    from sentence_transformers import SentenceTransformer
    HAS_AI = True
except ImportError:
    HAS_AI = False

logger = logging.getLogger(__name__)

class RagEngine:
    def __init__(self, modules_root: Path, model_name: str = 'all-MiniLM-L6-v2'):
        self.modules_root = modules_root.resolve()
        self.model = None
        print(f"DEBUG: RagEngine init with HAS_AI={HAS_AI}", flush=True)
        if HAS_AI:
            print(f"DEBUG: Loading RAG model {model_name}...", flush=True)
            try:
                self.model = SentenceTransformer(model_name)
                print("DEBUG: Model loaded successfully.", flush=True)
            except Exception as e:
                print(f"DEBUG: Failed to load model: {e}", flush=True)
        else:
            print("DEBUG: sentence-transformers not found or failed to import.", flush=True)

    def search_vectors(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Scans ALL modules for vectors and finds nearest neighbors.
        Note: For production, we'd load all into a single FAISS index.
        For MVP, we can lazy-load or just scan if small enough.
        Given "local-first" + "module-first", let's scan valid modules.
        """
        if not self.model:
            return []

        # 1. Encode query
        query_vec = self.model.encode([query])[0]
        
        results = []
        
        # 2. Scan modules (naive but simple for MVP without centralized vector DB)
        # Improvement: Kernel could cache a global index in memory.
        for module_dir in self.modules_root.iterdir():
            if not module_dir.is_dir(): continue
            
            vec_dir = module_dir / "vectors"
            npy_path = vec_dir / "embeddings.npy"
            chunks_path = vec_dir / "chunks.jsonl"
            
            if npy_path.exists() and chunks_path.exists():
                try:
                    # Load embeddings
                    emb = np.load(npy_path) # Shape (N, D)
                    
                    # Cosine similarity
                    # Normalize first if not normalized? SentenceTransformers usually output normalized vectors if configured?
                    # Let's assume dot product is sufficient if normalized.
                    # manual cosine: dot(a, b) / (norm(a)*norm(b))
                    
                    # Compute scores
                    # query_vec shape (D,), emb shape (N, D)
                    # Force normalization to be safe
                    norm_emb = emb / np.linalg.norm(emb, axis=1, keepdims=True)
                    norm_q = query_vec / np.linalg.norm(query_vec)
                    scores = np.dot(norm_emb, norm_q)

                    # Debug statistics
                    print(f"DEBUG: {module_dir.name} scores range: {np.min(scores):.4f} - {np.max(scores):.4f}", flush=True)

                    # Get top local matches
                    # Filter low scores?
                    indices = np.argsort(scores)[::-1][:top_k]
                    
                    # Load chunks to get text
                    chunks = []
                    with chunks_path.open("r", encoding="utf-8") as f:
                        for line in f:
                            chunks.append(json.loads(line))
                            
                    for idx in indices:
                        # Ensure idx is valid
                        if idx >= len(chunks): continue
                        
                        score = float(scores[idx])
                        if score < 0.2: continue # Balanced threshold
                        
                        chunk = chunks[idx]
                        results.append({
                            "score": score,
                            "text": chunk["text"],
                            "source": chunk["source"],
                            "module": module_dir.name
                        })
                except Exception as e:
                    logger.error(f"Error scanning {module_dir}: {e}")
                    continue
        
        # 3. Global Sort
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def ask(self, query: str) -> Dict:
        """
        Retrieves context and forms a response.
        """
        docs = self.search_vectors(query, top_k=3)
        
        if not docs:
            return {
                "answer": "I searched your vault but couldn't find anything matching '" + query + "'.",
                "context": []
            }
            
        # Synthesize: If we have multiple high-score matches, combine them.
        best_score = docs[0]["score"]
        
        if best_score > 0.3:
            # Construct a 'brainy' response
            answer = "Based on your notes, here is the relevant information:\n\n"
            for i, doc in enumerate(docs):
                if doc["score"] < 0.25: continue
                answer += f"### {doc['module']}\n> {doc['text']}\n\n"
            
            if len(docs) > 1:
                answer += "\n*I've synthesized this from multiple sources below.*"
        else:
            answer = "I found some potential matches, but the relevance is low. Please see the excerpts below."
        
        return {
            "answer": answer,
            "context": docs
        }
