from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from . import schemas, services, db, statuses

router = APIRouter(prefix="/api")

@router.post("/intake/register", response_model=schemas.DocumentResponse)
def register(doc: schemas.DocumentCreate, session: Session = Depends(db.get_db)):
    return services.register_document(session, doc)

@router.post("/documents/{qdoc_id}/upload-complete", response_model=schemas.DocumentResponse)
def upload_complete(qdoc_id: str, paperless_id: str = None, paperless_url: str = None, session: Session = Depends(db.get_db)):
    updated = services.update_document_status(
        session, 
        qdoc_id, 
        statuses.DocumentStatus.UPLOADED,
        {"paperless_id": paperless_id, "paperless_url": paperless_url}
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Document not found")
    return updated

@router.post("/documents/{qdoc_id}/mark-duplicate", response_model=schemas.DocumentResponse)
def mark_duplicate(qdoc_id: str, original_qdoc_id: str = None, session: Session = Depends(db.get_db)):
    updated = services.update_document_status(
        session, 
        qdoc_id, 
        statuses.DocumentStatus.DUPLICATE,
        {"duplicate_of": original_qdoc_id}
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Document not found")
    return updated

@router.post("/documents/{qdoc_id}/mark-review", response_model=schemas.DocumentResponse)
def mark_review(qdoc_id: str, reason: str, session: Session = Depends(db.get_db)):
    updated = services.update_document_status(
        session, 
        qdoc_id, 
        statuses.DocumentStatus.REVIEW,
        {"error_message": reason}
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Document not found")
    return updated

@router.get("/dashboard/summary", response_model=schemas.DashboardSummary)
def dashboard_summary(session: Session = Depends(db.get_db)):
    return services.get_summary(session)

@router.get("/documents/recent", response_model=List[schemas.DocumentResponse])
def list_documents(limit: int = 50, session: Session = Depends(db.get_db)):
    return services.get_documents(session, limit=limit)

@router.get("/documents/{qdoc_id}", response_model=schemas.DocumentResponse)
def get_document(qdoc_id: str, session: Session = Depends(db.get_db)):
    doc = services.get_document(session, qdoc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("/agent/heartbeat", response_model=schemas.AgentStatusResponse)
def heartbeat(data: schemas.AgentHeartbeat, session: Session = Depends(db.get_db)):
    return services.record_heartbeat(session, data)

@router.post("/events/document", response_model=schemas.DocumentEventResponse)
def record_event(data: schemas.DocumentEventCreate, session: Session = Depends(db.get_db)):
    return services.record_document_event(session, data)

@router.get("/agent/status", response_model=schemas.AgentStatusResponse)
def get_agent_status(session: Session = Depends(db.get_db)):
    agent = session.query(models.AgentStatus).order_by(models.AgentStatus.last_seen_at.desc()).first()
    if not agent:
        raise HTTPException(status_code=404, detail="No agent reported yet")
    return agent

@router.get("/issues", response_model=List[schemas.DocumentResponse])
def get_issues(limit: int = 50, session: Session = Depends(db.get_db)):
    return services.get_issues(session, limit=limit)

@router.get("/events/recent", response_model=List[schemas.DocumentEventResponse])
def get_recent_events(limit: int = 50, session: Session = Depends(db.get_db)):
    return services.get_recent_events(session, limit=limit)
