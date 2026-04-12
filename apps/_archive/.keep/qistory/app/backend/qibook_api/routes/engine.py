"""API routes for engine orchestration."""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pydantic import BaseModel

from services.engine import (
    get_engine_state, set_engine_state, has_unlocked_nodes, next_unlocked_node,
    ENGINE_STATES
)

router = APIRouter(prefix="/api/books", tags=["engine"])


@router.post("/{book_id}/engine/run")
async def run_engine(
    book_id: str,
    until: str = Query(..., description="State to run until")
):
    """Run engine until specified state."""
    if until not in ENGINE_STATES:
        raise HTTPException(status_code=400, detail=f"Invalid state: {until}")
    
    current_state = get_engine_state(book_id)
    if not current_state:
        # Initialize
        set_engine_state(book_id, "INGESTING")
        current_state = get_engine_state(book_id)
    
    state = current_state["current_state"]
    state_index = ENGINE_STATES.index(state)
    target_index = ENGINE_STATES.index(until)
    
    if state_index >= target_index:
        return {"message": f"Already at or past {until}", "current_state": state}
    
    # Run state machine
    while state_index < target_index:
        state = ENGINE_STATES[state_index]
        
        if state == "INGESTING":
            # Check if raw items exist
            from utils.db import get_db_connection
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM raw_items")
            count = cursor.fetchone()["count"]
            conn.close()
            
            if count > 0:
                set_engine_state(book_id, "ANALYZING")
            else:
                return {"message": "No raw items to process", "current_state": state}
        
        elif state == "ANALYZING":
            # Analysis complete (placeholder - would run theme extraction)
            set_engine_state(book_id, "INTERVIEWING")
        
        elif state == "INTERVIEWING":
            # Interview complete (user provides book spec)
            set_engine_state(book_id, "PROPOSING")
        
        elif state == "PROPOSING":
            # Proposal generated
            set_engine_state(book_id, "OUTLINING")
        
        elif state == "OUTLINING":
            # Outline generated (call outline.generate)
            # For now, just advance
            set_engine_state(book_id, "OUTLINE_APPROVAL")
        
        elif state == "OUTLINE_APPROVAL":
            # Stop and wait for approval
            return {
                "message": "Waiting for outline approval",
                "current_state": state,
                "pending_approval": {
                    "type": "outline",
                    "book_id": book_id
                }
            }
        
        elif state == "EVIDENCE_MAPPING":
            # Evidence mapped
            set_engine_state(book_id, "MICRO_SAMPLING")
        
        elif state == "MICRO_SAMPLING":
            # Generate sample for next node
            node = next_unlocked_node(book_id)
            if not node:
                set_engine_state(book_id, "MANUSCRIPT_REVIEW")
                break
            
            # Generate sample
            from routes.drafting import generate_sample
            result = await generate_sample(node["id"])
            
            set_engine_state(
                book_id,
                "SAMPLE_APPROVAL",
                cursor_node_id=node["id"],
                pending_approval={
                    "type": "sample",
                    "node_id": node["id"],
                    "section_id": result["section_id"]
                }
            )
            return {
                "message": "Waiting for sample approval",
                "current_state": "SAMPLE_APPROVAL",
                "pending_approval": {
                    "type": "sample",
                    "node_id": node["id"],
                    "section_id": result["section_id"]
                }
            }
        
        elif state == "SAMPLE_APPROVAL":
            # Stop and wait
            return {
                "message": "Waiting for sample approval",
                "current_state": state,
                "pending_approval": current_state.get("pending_approval")
            }
        
        elif state == "DRAFTING_SECTION":
            # Draft section
            node = next_unlocked_node(book_id)
            if not node:
                set_engine_state(book_id, "MANUSCRIPT_REVIEW")
                break
            
            from routes.drafting import draft_section
            result = await draft_section(node["id"])
            
            set_engine_state(
                book_id,
                "SECTION_REVIEW",
                cursor_node_id=node["id"],
                pending_approval={
                    "type": "draft",
                    "node_id": node["id"],
                    "section_id": result["section_id"]
                }
            )
            return {
                "message": "Draft generated, waiting for review",
                "current_state": "SECTION_REVIEW",
                "pending_approval": {
                    "type": "draft",
                    "node_id": node["id"],
                    "section_id": result["section_id"]
                }
            }
        
        elif state == "SECTION_REVIEW":
            # Stop and wait
            return {
                "message": "Waiting for section review",
                "current_state": state,
                "pending_approval": current_state.get("pending_approval")
            }
        
        elif state == "LOCK_SECTION":
            # Lock current section
            node_id = current_state.get("outline_cursor_node_id")
            if node_id:
                from routes.drafting import lock_section
                await lock_section(node_id)
            
            # Move to next section or done
            if has_unlocked_nodes(book_id):
                set_engine_state(book_id, "DRAFTING_SECTION")
            else:
                set_engine_state(book_id, "MANUSCRIPT_REVIEW")
        
        state_index += 1
        current_state = get_engine_state(book_id)
        state = current_state["current_state"]
    
    return {
        "message": f"Reached {until}",
        "current_state": state
    }


@router.post("/{book_id}/engine/resume")
async def resume_engine(book_id: str):
    """Resume engine from pending approval."""
    current_state = get_engine_state(book_id)
    if not current_state:
        raise HTTPException(status_code=404, detail="No engine state found")
    
    state = current_state["current_state"]
    pending = current_state.get("pending_approval")
    
    if not pending:
        raise HTTPException(status_code=400, detail="No pending approval to resume from")
    
    # Advance based on approval type
    if state == "OUTLINE_APPROVAL":
        # Check if outline is approved
        from utils.db import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM outline_nodes
            WHERE book_id = ? AND status = 'approved'
        """, (book_id,))
        approved_count = cursor.fetchone()["count"]
        conn.close()
        
        if approved_count > 0:
            set_engine_state(book_id, "EVIDENCE_MAPPING")
            # Auto-map evidence
            from routes.evidence import map_evidence
            await map_evidence(book_id)
            set_engine_state(book_id, "MICRO_SAMPLING")
            return {"message": "Resumed from outline approval", "current_state": "MICRO_SAMPLING"}
        else:
            raise HTTPException(status_code=400, detail="Outline not yet approved")
    
    elif state == "SAMPLE_APPROVAL":
        # Check if sample is approved
        node_id = pending.get("node_id")
        if node_id:
            from utils.db import get_db_connection
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT status FROM draft_sections
                WHERE outline_node_id = ? AND status = 'approved'
                ORDER BY draft_version DESC LIMIT 1
            """, (node_id,))
            approved = cursor.fetchone()
            conn.close()
            
            if approved:
                set_engine_state(book_id, "DRAFTING_SECTION")
                return {"message": "Resumed from sample approval", "current_state": "DRAFTING_SECTION"}
    
    elif state == "SECTION_REVIEW":
        # Check if draft is approved and locked
        node_id = pending.get("node_id")
        if node_id:
            from utils.db import get_db_connection
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT status FROM outline_nodes WHERE id = ?
            """, (node_id,))
            node = cursor.fetchone()
            conn.close()
            
            if node and node["status"] == "locked":
                # Move to next section
                if has_unlocked_nodes(book_id):
                    set_engine_state(book_id, "DRAFTING_SECTION")
                else:
                    set_engine_state(book_id, "MANUSCRIPT_REVIEW")
                return {"message": "Resumed from section lock", "current_state": get_engine_state(book_id)["current_state"]}
    
    raise HTTPException(status_code=400, detail="Cannot resume from current state")


@router.get("/{book_id}/engine/state")
async def get_engine_status(book_id: str):
    """Get current engine state."""
    state = get_engine_state(book_id)
    if not state:
        raise HTTPException(status_code=404, detail="No engine state found")
    return state

