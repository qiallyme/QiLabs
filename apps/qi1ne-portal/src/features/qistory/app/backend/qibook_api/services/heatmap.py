"""Service for calculating narrative heatmap metrics."""
from typing import Dict, Any
from datetime import datetime
import math

from utils.db import get_db_connection, json_serialize
from services.retrieval import vector_store


async def calculate_heatmap_metrics(node_id: str) -> Dict[str, Any]:
    """Calculate evidence density, emotional intensity, and topic coverage for a node."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get node
    cursor.execute("SELECT * FROM outline_nodes WHERE id = ?", (node_id,))
    node = cursor.fetchone()
    if not node:
        conn.close()
        return {}
    node = dict(node)
    
    # 1. Evidence density: count of evidence chunks / expected (normalized)
    cursor.execute("""
        SELECT COUNT(*) as count FROM evidence_links
        WHERE outline_node_id = ?
    """, (node_id,))
    evidence_count = cursor.fetchone()["count"]
    
    # Normalize: 0-1 scale where 5+ chunks = 1.0, 0 chunks = 0.0
    evidence_density = min(evidence_count / 5.0, 1.0) if evidence_count > 0 else 0.0
    
    # 2. Emotional intensity: variance in sentiment (placeholder - would use sentiment analysis)
    # For now, use a simple heuristic: count of emotional words / total words in evidence
    cursor.execute("""
        SELECT c.chunk_text FROM evidence_links el
        JOIN chunks c ON el.chunk_id = c.id
        WHERE el.outline_node_id = ?
    """, (node_id,))
    evidence_chunks = [row["chunk_text"] for row in cursor.fetchall()]
    
    emotional_words = ["feel", "felt", "emotion", "angry", "sad", "happy", "joy", "pain", 
                       "fear", "love", "hate", "anxious", "excited", "disappointed", "proud"]
    total_words = sum(len(chunk.split()) for chunk in evidence_chunks)
    emotional_word_count = sum(
        sum(1 for word in chunk.lower().split() if word in emotional_words)
        for chunk in evidence_chunks
    )
    
    # Normalize: 0-1 scale
    emotional_intensity = min(emotional_word_count / max(total_words * 0.1, 1), 1.0) if total_words > 0 else 0.0
    
    # 3. Topic coverage: how well evidence matches node goal
    node_goal = node.get("goal", "")
    if node_goal:
        # Use vector similarity to check how well evidence matches goal
        evidence_results = await vector_store.for_outline_node(node_id, top_k=10)
        
        if evidence_results:
            # Average relevance score (lower distance = higher relevance)
            avg_relevance = sum(1.0 / (r.get("relevance_score", 1.0) + 0.1) for r in evidence_results) / len(evidence_results)
            topic_coverage = min(avg_relevance, 1.0)
        else:
            topic_coverage = 0.0
    else:
        topic_coverage = 0.5  # Neutral if no goal defined
    
    # Save metrics
    cursor.execute("""
        INSERT OR REPLACE INTO narrative_heatmap (
            outline_node_id, evidence_density, emotional_intensity,
            topic_coverage_score, updated_at
        ) VALUES (?, ?, ?, ?, ?)
    """, (
        node_id,
        evidence_density,
        emotional_intensity,
        topic_coverage,
        datetime.utcnow().isoformat()
    ))
    
    conn.commit()
    conn.close()
    
    return {
        "evidence_density": evidence_density,
        "emotional_intensity": emotional_intensity,
        "topic_coverage": topic_coverage,
        "evidence_count": evidence_count
    }

