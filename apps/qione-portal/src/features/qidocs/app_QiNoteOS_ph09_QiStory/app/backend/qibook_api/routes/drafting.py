"""API routes for drafting workflow."""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pydantic import BaseModel
import uuid
import hashlib
from datetime import datetime

from utils.db import get_db_connection, json_serialize, json_deserialize
from utils.llm import llm
from services.retrieval import vector_store
from services.recap import generate_chapter_recap, generate_book_recap, get_running_context
from services.style_drift import check_style_drift, retone_section
from services.heatmap import calculate_heatmap_metrics

router = APIRouter(prefix="/api/outline", tags=["drafting"])


class ReviewRequest(BaseModel):
    notes: Optional[str] = None


class ApproveRequest(BaseModel):
    approved: bool
    notes: Optional[str] = None


class ContinuityCheckRequest(BaseModel):
    check_contradictions: bool = True
    check_timeline: bool = True
    check_repetition: bool = True
    check_tone: bool = True


class RetoneRequest(BaseModel):
    create_new_version: bool = True


class UpdateDraftRequest(BaseModel):
    draft_text: str
    create_new_version: bool = False


class CreateBranchRequest(BaseModel):
    label: str


@router.post("/{node_id}/sample")
async def generate_sample(node_id: str):
    """Generate a micro-sample for an outline node."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get node
    cursor.execute("SELECT * FROM outline_nodes WHERE id = ?", (node_id,))
    node = cursor.fetchone()
    if not node:
        conn.close()
        raise HTTPException(status_code=404, detail="Outline node not found")
    node = dict(node)
    
    # Get book
    cursor.execute("SELECT * FROM book_projects WHERE id = ?", (node["book_id"],))
    book = dict(cursor.fetchone())
    
    # Get evidence for this node
    cursor.execute("""
        SELECT c.chunk_text
        FROM evidence_links el
        JOIN chunks c ON el.chunk_id = c.id
        WHERE el.outline_node_id = ?
        ORDER BY el.relevance_score ASC
        LIMIT 5
    """, (node_id,))
    evidence_chunks = [row["chunk_text"] for row in cursor.fetchall()]
    
    conn.close()
    
    # Build prompt
    evidence_text = "\n\n---\n\n".join(evidence_chunks[:3])  # Top 3
    style_anchor = book.get("style_anchor", "")
    style_instruction = f"\n\nStyle guide: {style_anchor}" if style_anchor else ""
    
    prompt = f"""Write a short sample (2-3 paragraphs) for this book section:

Title: {node['title']}
Goal: {node.get('goal', 'Not specified')}

Book: {book['working_title']}
Tone: {book.get('tone_json', {}).get('style', 'Not specified') if isinstance(book.get('tone_json'), dict) else 'Not specified'}{style_instruction}

Relevant evidence:
{evidence_text}

Write a compelling sample that captures the essence of this section."""
    
    system = "You are a book writing assistant. Write engaging, authentic prose based on the provided evidence."
    
    sample_text = await llm.generate(prompt, system=system, temperature=0.8, max_tokens=500)
    
    # Save as draft_section with status "sample"
    section_id = str(uuid.uuid4())
    conn = get_db_connection()
    cursor = conn.cursor()
    
    content_hash = hashlib.sha256(sample_text.encode()).hexdigest()
    word_count = len(sample_text.split())
    
    cursor.execute("""
        INSERT INTO draft_sections (
            id, outline_node_id, draft_text, draft_version, status,
            content_hash, word_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        section_id,
        node_id,
        sample_text,
        1,
        "sample",
        content_hash,
        word_count,
        datetime.utcnow().isoformat()
    ))
    
    conn.commit()
    conn.close()
    
    return {"section_id": section_id, "sample_text": sample_text}


@router.post("/{node_id}/draft")
async def draft_section(node_id: str, force: bool = Query(False), branch_id: Optional[str] = Query(None)):
    """Generate full draft for an outline node, optionally into a branch."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get node
    cursor.execute("SELECT * FROM outline_nodes WHERE id = ?", (node_id,))
    node = cursor.fetchone()
    if not node:
        conn.close()
        raise HTTPException(status_code=404, detail="Outline node not found")
    node = dict(node)
    
    # Check evidence count
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM evidence_links
        WHERE outline_node_id = ?
    """, (node_id,))
    evidence_count = cursor.fetchone()["count"]
    
    if evidence_count < 3 and not force:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail=f"Thin evidence ({evidence_count} chunks). Add sources or set force=true to override."
        )
    
    # Get book
    cursor.execute("SELECT * FROM book_projects WHERE id = ?", (node["book_id"],))
    book = dict(cursor.fetchone())
    
    # Get evidence (exclude locked sections' raw evidence)
    cursor.execute("""
        SELECT c.chunk_text, c.raw_item_id
        FROM evidence_links el
        JOIN chunks c ON el.chunk_id = c.id
        WHERE el.outline_node_id = ?
        AND c.raw_item_id NOT IN (
            SELECT DISTINCT c2.raw_item_id
            FROM outline_nodes on2
            JOIN draft_sections ds ON on2.id = ds.outline_node_id
            JOIN chunks c2 ON ds.outline_node_id = on2.id
            WHERE on2.book_id = ? AND on2.status = 'locked'
        )
        ORDER BY el.relevance_score ASC
        LIMIT 10
    """, (node_id, node["book_id"]))
    evidence_chunks = [row["chunk_text"] for row in cursor.fetchall()]
    
    # Get locked sections (final context) - only stitched text, not raw evidence
    cursor.execute("""
        SELECT stitched_text FROM final_context WHERE book_id = ?
    """, (node["book_id"],))
    final_context_row = cursor.fetchone()
    final_context = final_context_row["stitched_text"] if final_context_row else ""
    
    # Get running context (recaps)
    running_context = await get_running_context(node["book_id"], include_chapters=True)
    
    conn.close()
    
    # Get style anchor
    style_anchor = book.get("style_anchor", "")
    word_target = node.get("word_target") or (book.get("length_target_words", 50000) // book.get("chapter_count", 10))
    
    # Build prompt
    evidence_text = "\n\n---\n\n".join(evidence_chunks[:5])
    
    style_instruction = f"\n\nStyle guide: {style_anchor}" if style_anchor else ""
    
    running_context_text = running_context.get("full_context", "")
    if running_context_text:
        running_context_text = f"\n\nNarrative context so far:\n{running_context_text}"
    
    prompt = f"""Write a full draft for this book section:

Title: {node['title']}
Goal: {node.get('goal', 'Not specified')}

Book: {book['working_title']}
Target length: {word_target} words (±15% acceptable){style_instruction}

Previously written context (locked sections only):
{final_context[:1000] if final_context else 'None'}{running_context_text}

Relevant evidence:
{evidence_text}

Write a complete, polished section that flows naturally from the previous context and maintains narrative coherence."""
    
    system = "You are a book writing assistant. Write complete, well-structured prose that weaves evidence into a compelling narrative."
    
    draft_text = await llm.generate(prompt, system=system, temperature=0.7, max_tokens=2000)
    
    # Calculate hash and word count
    content_hash = hashlib.sha256(draft_text.encode()).hexdigest()
    word_count = len(draft_text.split())
    
    # Save draft
    section_id = str(uuid.uuid4())
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get latest version (for this branch if specified)
    if branch_id:
        cursor.execute("""
            SELECT MAX(draft_version) as max_version
            FROM draft_sections
            WHERE outline_node_id = ? AND branch_id = ?
        """, (node_id, branch_id))
    else:
        cursor.execute("""
            SELECT MAX(draft_version) as max_version
            FROM draft_sections
            WHERE outline_node_id = ? AND branch_id IS NULL
        """, (node_id,))
    max_version = cursor.fetchone()["max_version"] or 0
    
    cursor.execute("""
        INSERT INTO draft_sections (
            id, outline_node_id, draft_text, draft_version, status,
            content_hash, word_count, branch_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        section_id,
        node_id,
        draft_text,
        max_version + 1,
        "drafted",
        content_hash,
        word_count,
        branch_id,
        datetime.utcnow().isoformat()
    ))
    
    conn.commit()
    conn.close()
    
    return {
        "section_id": section_id,
        "draft_text": draft_text,
        "word_count": word_count,
        "word_target": word_target
    }


@router.get("/{node_id}/draft")
async def get_draft_section(node_id: str, branch_id: Optional[str] = Query(None)):
    """Get the current draft for an outline node, optionally filtered by branch."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get latest draft (for branch if specified, otherwise Main branch)
    if branch_id:
        cursor.execute("""
            SELECT * FROM draft_sections
            WHERE outline_node_id = ? AND branch_id = ?
            ORDER BY draft_version DESC
            LIMIT 1
        """, (node_id, branch_id))
    else:
        # Main branch: branch_id IS NULL
        cursor.execute("""
            SELECT * FROM draft_sections
            WHERE outline_node_id = ? AND (branch_id IS NULL OR branch_id = '')
            ORDER BY draft_version DESC
            LIMIT 1
        """, (node_id,))
    draft = cursor.fetchone()
    conn.close()
    
    if not draft:
        raise HTTPException(status_code=404, detail="No draft found for this node")
    
    draft = dict(draft)
    return {
        "draft_id": draft["id"],
        "draft_text": draft["draft_text"],
        "draft_version": draft["draft_version"],
        "status": draft["status"],
        "word_count": draft.get("word_count", 0),
        "editor_notes": draft.get("editor_notes"),
        "created_at": draft.get("created_at"),
        "branch_id": draft.get("branch_id"),
    }


@router.post("/{node_id}/branches")
async def create_branch(node_id: str, request: CreateBranchRequest):
    """Create a new draft branch for an outline node."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verify node exists
    cursor.execute("SELECT id FROM outline_nodes WHERE id = ?", (node_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Outline node not found")
    
    # Create branch
    branch_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO draft_branches (id, outline_node_id, label, created_at)
        VALUES (?, ?, ?, ?)
    """, (branch_id, node_id, request.label, datetime.utcnow().isoformat()))
    
    conn.commit()
    conn.close()
    
    return {
        "id": branch_id,
        "outline_node_id": node_id,
        "label": request.label,
        "created_at": datetime.utcnow().isoformat()
    }


@router.get("/{node_id}/branches")
async def list_branches(node_id: str):
    """List all draft branches for an outline node."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM draft_branches
        WHERE outline_node_id = ?
        ORDER BY created_at ASC
    """, (node_id,))
    branches = cursor.fetchall()
    conn.close()
    
    return {
        "branches": [dict(branch) for branch in branches]
    }


@router.get("/{node_id}/drafts")
async def list_drafts(node_id: str, branch_id: Optional[str] = Query(None)):
    """List all drafts for an outline node, optionally filtered by branch."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if branch_id:
        cursor.execute("""
            SELECT * FROM draft_sections
            WHERE outline_node_id = ? AND branch_id = ?
            ORDER BY draft_version DESC
        """, (node_id, branch_id))
    else:
        cursor.execute("""
            SELECT * FROM draft_sections
            WHERE outline_node_id = ?
            ORDER BY draft_version DESC
        """, (node_id,))
    drafts = cursor.fetchall()
    conn.close()
    
    return {
        "drafts": [dict(draft) for draft in drafts]
    }


@router.put("/{node_id}/draft")
async def update_draft_section(node_id: str, update: UpdateDraftRequest):
    """Update a draft section. If locked, requires create_new_version=True."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get node
    cursor.execute("SELECT * FROM outline_nodes WHERE id = ?", (node_id,))
    node = cursor.fetchone()
    if not node:
        conn.close()
        raise HTTPException(status_code=404, detail="Outline node not found")
    node = dict(node)
    
    # Check if node is locked
    if node["status"] == "locked":
        if not update.create_new_version:
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="Section is locked. Set create_new_version=true to create a new version."
            )
    
    # Get latest draft
    cursor.execute("""
        SELECT * FROM draft_sections
        WHERE outline_node_id = ?
        ORDER BY draft_version DESC
        LIMIT 1
    """, (node_id,))
    latest_draft = cursor.fetchone()
    
    # Check if latest draft is locked
    if latest_draft and latest_draft["status"] == "locked":
        if not update.create_new_version:
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="Latest draft is locked. Set create_new_version=true to create a new version."
            )
    
    # Calculate hash and word count
    content_hash = hashlib.sha256(update.draft_text.encode()).hexdigest()
    word_count = len(update.draft_text.split())
    
    if update.create_new_version or (latest_draft and latest_draft["status"] == "locked"):
        # Create new version
        max_version = latest_draft["draft_version"] if latest_draft else 0
        section_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO draft_sections (
                id, outline_node_id, draft_text, draft_version, status,
                content_hash, word_count, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            section_id,
            node_id,
            update.draft_text,
            max_version + 1,
            "drafted",
            content_hash,
            word_count,
            datetime.utcnow().isoformat()
        ))
    else:
        # Update existing draft (only if not locked)
        if not latest_draft:
            conn.close()
            raise HTTPException(status_code=404, detail="No draft found to update")
        
        cursor.execute("""
            UPDATE draft_sections
            SET draft_text = ?, content_hash = ?, word_count = ?
            WHERE id = ?
        """, (update.draft_text, content_hash, word_count, latest_draft["id"]))
    
    conn.commit()
    conn.close()
    
    return {
        "message": "Draft updated" if not update.create_new_version else "New draft version created",
        "word_count": word_count
    }


@router.post("/{node_id}/review")
async def review_section(node_id: str, review: ReviewRequest):
    """Review a draft section (AI review)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get latest draft
    cursor.execute("""
        SELECT * FROM draft_sections
        WHERE outline_node_id = ? AND status IN ('drafted', 'revised')
        ORDER BY draft_version DESC
        LIMIT 1
    """, (node_id,))
    draft = cursor.fetchone()
    if not draft:
        conn.close()
        raise HTTPException(status_code=404, detail="No draft found for review")
    draft = dict(draft)
    
    # Get node
    cursor.execute("SELECT * FROM outline_nodes WHERE id = ?", (node_id,))
    node = dict(cursor.fetchone())
    conn.close()
    
    # AI review
    prompt = f"""Review this draft section for a book:

Title: {node['title']}
Goal: {node.get('goal', 'Not specified')}

Draft:
{draft['draft_text']}

Provide a structured review with:
1. Strengths
2. Issues or gaps
3. Suggestions for improvement

Return JSON:
{{
  "strengths": ["..."],
  "issues": ["..."],
  "suggestions": ["..."]
}}"""
    
    system = "You are an expert book editor. Provide constructive, specific feedback."
    
    review_text = await llm.generate(prompt, system=system, temperature=0.5)
    
    # Parse JSON
    import json
    import re
    json_match = re.search(r'\{.*\}', review_text, re.DOTALL)
    review_data = json.loads(json_match.group()) if json_match else {
        "strengths": [],
        "issues": [],
        "suggestions": []
    }
    
    # Update draft with review
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE draft_sections
        SET status = 'revised', editor_notes = ?
        WHERE id = ?
    """, (json_serialize(review_data), draft["id"]))
    conn.commit()
    conn.close()
    
    return {"review": review_data}


@router.post("/{node_id}/continuity-check")
async def continuity_check(node_id: str, check: ContinuityCheckRequest):
    """Check draft for continuity issues before approve/lock."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get latest draft
    cursor.execute("""
        SELECT * FROM draft_sections
        WHERE outline_node_id = ? AND status IN ('drafted', 'revised', 'approved')
        ORDER BY draft_version DESC
        LIMIT 1
    """, (node_id,))
    draft = cursor.fetchone()
    if not draft:
        conn.close()
        raise HTTPException(status_code=404, detail="No draft found")
    draft = dict(draft)
    
    # Get node
    cursor.execute("SELECT * FROM outline_nodes WHERE id = ?", (node_id,))
    node = dict(cursor.fetchone())
    book_id = node["book_id"]
    
    # Get final context
    cursor.execute("SELECT stitched_text FROM final_context WHERE book_id = ?", (book_id,))
    final_context_row = cursor.fetchone()
    final_context = final_context_row["stitched_text"] if final_context_row else ""
    
    conn.close()
    
    # Build continuity check prompt
    checks = []
    if check.check_contradictions:
        checks.append("contradictions with previous sections")
    if check.check_timeline:
        checks.append("timeline consistency")
    if check.check_repetition:
        checks.append("repeated anecdotes or information")
    if check.check_tone:
        checks.append("tone/style consistency")
    
    prompt = f"""Review this draft section for continuity issues:

Title: {node['title']}
Goal: {node.get('goal', 'Not specified')}

Current draft:
{draft['draft_text']}

Previously written context:
{final_context[:1500] if final_context else 'None'}

Check for: {', '.join(checks)}

Return JSON with flags:
{{
  "contradictions": ["..."],
  "timeline_issues": ["..."],
  "repetitions": ["..."],
  "tone_mismatches": ["..."],
  "overall_ok": true/false
}}"""
    
    system = "You are a continuity editor. Identify inconsistencies, contradictions, and style drift."
    
    check_text = await llm.generate(prompt, system=system, temperature=0.3)
    
    # Parse JSON
    import json
    import re
    json_match = re.search(r'\{.*\}', check_text, re.DOTALL)
    check_data = json.loads(json_match.group()) if json_match else {
        "contradictions": [],
        "timeline_issues": [],
        "repetitions": [],
        "tone_mismatches": [],
        "overall_ok": True
    }
    
    return {"continuity_check": check_data}


@router.post("/{node_id}/approve")
async def approve_section(node_id: str, approval: ApproveRequest):
    """Approve a draft section."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get latest draft
    cursor.execute("""
        SELECT * FROM draft_sections
        WHERE outline_node_id = ? AND status IN ('drafted', 'revised', 'sample')
        ORDER BY draft_version DESC
        LIMIT 1
    """, (node_id,))
    draft = cursor.fetchone()
    if not draft:
        conn.close()
        raise HTTPException(status_code=404, detail="No draft found")
    draft = dict(draft)
    
    if approval.approved:
        # Update status
        cursor.execute("""
            UPDATE draft_sections
            SET status = 'approved'
            WHERE id = ?
        """, (draft["id"],))
        
        # Update node status
        cursor.execute("""
            UPDATE outline_nodes
            SET status = 'approved'
            WHERE id = ?
        """, (node_id,))
    else:
        # Reject - keep as drafted for revision
        cursor.execute("""
            UPDATE draft_sections
            SET editor_notes = ?
            WHERE id = ?
        """, (approval.notes or "Rejected by user", draft["id"]))
    
    conn.commit()
    conn.close()
    
    return {"message": "Section approved" if approval.approved else "Section rejected"}


@router.post("/{node_id}/lock")
async def lock_section(node_id: str, branch_id: Optional[str] = Query(None)):
    """Lock a section into final manuscript."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get approved draft (from active branch if specified)
    if branch_id:
        cursor.execute("""
            SELECT * FROM draft_sections
            WHERE outline_node_id = ? AND status = 'approved' AND branch_id = ?
            ORDER BY draft_version DESC
            LIMIT 1
        """, (node_id, branch_id))
    else:
        cursor.execute("""
            SELECT * FROM draft_sections
            WHERE outline_node_id = ? AND status = 'approved' AND (branch_id IS NULL OR branch_id = '')
            ORDER BY draft_version DESC
            LIMIT 1
        """, (node_id,))
    draft = cursor.fetchone()
    if not draft:
        conn.close()
        branch_msg = f" in branch {branch_id}" if branch_id else ""
        raise HTTPException(status_code=404, detail=f"No approved draft found{branch_msg}")
    draft = dict(draft)
    
    # Verify hash hasn't changed (immutability check)
    current_hash = hashlib.sha256(draft["draft_text"].encode()).hexdigest()
    if draft.get("content_hash") and draft["content_hash"] != current_hash:
        # Draft was modified - create new version instead of overwriting
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Draft text has been modified. Please approve the new version before locking."
        )
    
    # Get node
    cursor.execute("SELECT * FROM outline_nodes WHERE id = ?", (node_id,))
    node = dict(cursor.fetchone())
    book_id = node["book_id"]
    
    # Get or create final_context
    cursor.execute("SELECT * FROM final_context WHERE book_id = ?", (book_id,))
    final_context = cursor.fetchone()
    
    locked_text = f"\n\n# {node['title']}\n\n{draft['draft_text']}\n\n"
    
    if final_context:
        # Append to existing
        existing_text = final_context["stitched_text"] or ""
        new_text = existing_text + locked_text
        cursor.execute("""
            UPDATE final_context
            SET stitched_text = ?, updated_at = ?
            WHERE book_id = ?
        """, (new_text, datetime.utcnow().isoformat(), book_id))
    else:
        # Create new
        cursor.execute("""
            INSERT INTO final_context (book_id, stitched_text, updated_at)
            VALUES (?, ?, ?)
        """, (book_id, locked_text, datetime.utcnow().isoformat()))
    
    # Mark node as locked
    cursor.execute("""
        UPDATE outline_nodes
        SET status = 'locked'
        WHERE id = ?
    """, (node_id,))
    
    # Mark draft as locked (immutable snapshot)
    cursor.execute("""
        UPDATE draft_sections
        SET status = 'locked', content_hash = ?
        WHERE id = ?
    """, (current_hash, draft["id"]))
    
    conn.commit()
    conn.close()
    
    # Generate chapter recap
    chapter_recap = await generate_chapter_recap(node_id)
    
    # Update book recap
    book_recap = await generate_book_recap(book_id)
    
    return {
        "message": "Section locked into manuscript",
        "content_hash": current_hash,
        "chapter_recap": chapter_recap,
        "book_recap": book_recap
    }


@router.post("/{node_id}/style-check")
async def check_style_drift_endpoint(node_id: str):
    """Check style drift for the latest draft of a node."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get latest draft
    cursor.execute("""
        SELECT * FROM draft_sections
        WHERE outline_node_id = ? AND status IN ('drafted', 'revised', 'approved')
        ORDER BY draft_version DESC LIMIT 1
    """, (node_id,))
    draft = cursor.fetchone()
    if not draft:
        conn.close()
        raise HTTPException(status_code=404, detail="No draft found")
    draft = dict(draft)
    
    conn.close()
    
    result = await check_style_drift(draft["id"])
    return result


@router.post("/{node_id}/retone")
async def retone_section_endpoint(node_id: str, request: RetoneRequest):
    """Re-tone a draft section to match style anchor."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get latest draft
    cursor.execute("""
        SELECT * FROM draft_sections
        WHERE outline_node_id = ? AND status IN ('drafted', 'revised', 'approved')
        ORDER BY draft_version DESC LIMIT 1
    """, (node_id,))
    draft = cursor.fetchone()
    if not draft:
        conn.close()
        raise HTTPException(status_code=404, detail="No draft found")
    draft = dict(draft)
    
    conn.close()
    
    retoned_text = await retone_section(draft["id"])
    
    if request.create_new_version:
        # Create new version
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT MAX(draft_version) as max_version
            FROM draft_sections
            WHERE outline_node_id = ?
        """, (node_id,))
        max_version = cursor.fetchone()["max_version"] or 0
        
        new_section_id = str(uuid.uuid4())
        content_hash = hashlib.sha256(retoned_text.encode()).hexdigest()
        word_count = len(retoned_text.split())
        
        cursor.execute("""
            INSERT INTO draft_sections (
                id, outline_node_id, draft_text, draft_version, status,
                content_hash, word_count, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            new_section_id,
            node_id,
            retoned_text,
            max_version + 1,
            "revised",
            content_hash,
            word_count,
            datetime.utcnow().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "section_id": new_section_id,
            "draft_text": retoned_text,
            "word_count": word_count,
            "version": max_version + 1
        }
    else:
        # Update existing
        conn = get_db_connection()
        cursor = conn.cursor()
        
        content_hash = hashlib.sha256(retoned_text.encode()).hexdigest()
        word_count = len(retoned_text.split())
        
        cursor.execute("""
            UPDATE draft_sections
            SET draft_text = ?, content_hash = ?, word_count = ?, status = 'revised'
            WHERE id = ?
        """, (retoned_text, content_hash, word_count, draft["id"]))
        
        conn.commit()
        conn.close()
        
        return {
            "section_id": draft["id"],
            "draft_text": retoned_text,
            "word_count": word_count
        }


@router.get("/{node_id}/heatmap")
async def get_heatmap(node_id: str):
    """Get narrative heatmap metrics for a node."""
    metrics = await calculate_heatmap_metrics(node_id)
    return metrics


@router.get("/books/{book_id}/recap")
async def get_book_recap(book_id: str):
    """Get running context (recaps) for a book."""
    context = await get_running_context(book_id, include_chapters=True)
    return context
