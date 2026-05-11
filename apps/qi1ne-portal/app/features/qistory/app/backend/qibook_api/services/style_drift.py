"""Service for checking style drift in drafts."""
from typing import Dict, Any, List
from datetime import datetime
import uuid
import json
import re

from utils.db import get_db_connection, json_serialize
from utils.llm import llm


async def check_style_drift(draft_section_id: str) -> Dict[str, Any]:
    """Check if a draft section drifts from the style anchor."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get draft
    cursor.execute("SELECT * FROM draft_sections WHERE id = ?", (draft_section_id,))
    draft = cursor.fetchone()
    if not draft:
        conn.close()
        return {"error": "Draft not found"}
    draft = dict(draft)
    
    # Get node
    cursor.execute("SELECT * FROM outline_nodes WHERE id = ?", (draft["outline_node_id"],))
    node = dict(cursor.fetchone())
    book_id = node["book_id"]
    
    # Get book style anchor
    cursor.execute("SELECT style_anchor FROM book_projects WHERE id = ?", (book_id,))
    style_anchor_row = cursor.fetchone()
    style_anchor = style_anchor_row["style_anchor"] if style_anchor_row else ""
    
    conn.close()
    
    if not style_anchor:
        return {
            "drift_score": 0.0,
            "drift_issues": [],
            "message": "No style anchor defined"
        }
    
    # Check style drift
    prompt = f"""Compare this draft section to the style guide and identify any drift:

Style guide:
{style_anchor}

Draft section:
{draft['draft_text']}

Analyze:
1. Tone consistency (formal/casual, warm/cold, etc.)
2. Sentence structure (short/long, simple/complex)
3. Voice consistency (first/third person, perspective)
4. Word choice (academic/colloquial, specific/generic)

Return JSON:
{{
  "drift_score": 0.0-1.0,  // 0 = perfect match, 1 = major drift
  "drift_issues": [
    {{
      "type": "tone|structure|voice|word_choice",
      "severity": "low|medium|high",
      "description": "Specific issue description",
      "example": "Quote from draft showing the issue"
    }}
  ],
  "overall_assessment": "Brief summary"
}}"""

    system = "You are a style editor. Identify tone, voice, and style inconsistencies."
    
    check_text = await llm.generate(prompt, system=system, temperature=0.3, max_tokens=800)
    
    # Parse JSON
    json_match = re.search(r'\{.*\}', check_text, re.DOTALL)
    if json_match:
        try:
            check_data = json.loads(json_match.group())
        except json.JSONDecodeError:
            check_data = {
                "drift_score": 0.5,
                "drift_issues": [{"type": "parse_error", "severity": "medium", "description": "Could not parse style check", "example": ""}],
                "overall_assessment": "Style check completed but parsing failed"
            }
    else:
        check_data = {
            "drift_score": 0.5,
            "drift_issues": [{"type": "parse_error", "severity": "medium", "description": "Could not parse style check", "example": ""}],
            "overall_assessment": "Style check completed but parsing failed"
        }
    
    # Save check result
    check_id = str(uuid.uuid4())
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO style_drift_checks (
            id, draft_section_id, drift_score, drift_issues_json, checked_at
        ) VALUES (?, ?, ?, ?, ?)
    """, (
        check_id,
        draft_section_id,
        check_data.get("drift_score", 0.0),
        json_serialize(check_data.get("drift_issues", [])),
        datetime.utcnow().isoformat()
    ))
    
    conn.commit()
    conn.close()
    
    return {
        "drift_score": check_data.get("drift_score", 0.0),
        "drift_issues": check_data.get("drift_issues", []),
        "overall_assessment": check_data.get("overall_assessment", ""),
        "check_id": check_id
    }


async def retone_section(draft_section_id: str) -> str:
    """Re-generate a draft section with corrected tone/style."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get draft
    cursor.execute("SELECT * FROM draft_sections WHERE id = ?", (draft_section_id,))
    draft = cursor.fetchone()
    if not draft:
        conn.close()
        raise ValueError("Draft not found")
    draft = dict(draft)
    
    # Get node
    cursor.execute("SELECT * FROM outline_nodes WHERE id = ?", (draft["outline_node_id"],))
    node = dict(cursor.fetchone())
    book_id = node["book_id"]
    
    # Get book style anchor
    cursor.execute("SELECT style_anchor FROM book_projects WHERE id = ?", (book_id,))
    style_anchor_row = cursor.fetchone()
    style_anchor = style_anchor_row["style_anchor"] if style_anchor_row else ""
    
    # Get evidence
    cursor.execute("""
        SELECT c.chunk_text FROM evidence_links el
        JOIN chunks c ON el.chunk_id = c.id
        WHERE el.outline_node_id = ?
        ORDER BY el.relevance_score ASC LIMIT 5
    """, (node["id"],))
    evidence_chunks = [row["chunk_text"] for row in cursor.fetchall()]
    
    conn.close()
    
    evidence_text = "\n\n---\n\n".join(evidence_chunks[:3])
    
    prompt = f"""Rewrite this draft section to match the style guide exactly:

Style guide:
{style_anchor}

Original draft (preserve content, fix style):
{draft['draft_text']}

Section goal: {node.get('goal', 'Not specified')}

Relevant evidence:
{evidence_text}

Rewrite the section maintaining all factual content and narrative flow, but adjusting tone, sentence structure, and voice to match the style guide precisely."""

    system = "You are a style editor. Rewrite text to match a specific style guide while preserving all content."
    
    retoned_text = await llm.generate(prompt, system=system, temperature=0.6, max_tokens=2000)
    
    return retoned_text.strip()

