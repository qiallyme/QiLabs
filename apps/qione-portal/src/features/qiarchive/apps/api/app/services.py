from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from . import models, schemas, statuses

def register_document(db: Session, doc_in: schemas.DocumentCreate):
    db_doc = db.query(models.Document).filter(models.Document.qdoc_id == doc_in.qdoc_id).first()
    if db_doc:
        for var, value in vars(doc_in).items():
            setattr(db_doc, var, value) if value is not None else None
    else:
        db_doc = models.Document(**doc_in.model_dump())
        db.add(db_doc)
    
    db.commit()
    db.refresh(db_doc)
    
    # Record event
    record_document_event(db, schemas.DocumentEventCreate(
        document_id=db_doc.qdoc_id,
        event_type="registered",
        machine_name=db_doc.machine_name,
        payload_json={"status": db_doc.status}
    ))
    return db_doc

def update_document_status(db: Session, qdoc_id: str, status: str, extra: dict = None):
    db_doc = db.query(models.Document).filter(models.Document.qdoc_id == qdoc_id).first()
    if not db_doc:
        return None
    
    db_doc.status = status
    if extra:
        if "paperless_id" in extra:
            db_doc.paperless_document_id = str(extra["paperless_id"])
        if "paperless_url" in extra:
            db_doc.paperless_url = extra["paperless_url"]
        if "error_message" in extra:
            db_doc.error_message = extra["error_message"]
        if "duplicate_of" in extra:
            db_doc.duplicate_of_doc_id = extra["duplicate_of"]

    db.commit()
    db.refresh(db_doc)
    
    # Record event
    record_document_event(db, schemas.DocumentEventCreate(
        document_id=qdoc_id,
        event_type="status_updated",
        machine_name=db_doc.machine_name,
        payload_json={"to_status": status, "extra": extra}
    ))
    return db_doc

def get_summary(db: Session):
    counts = db.query(models.Document.status, func.count(models.Document.id)).group_by(models.Document.status).all()
    summary = {status: count for status, count in counts}
    total = sum(summary.values())
    
    # Get latest agent status
    agent = db.query(models.AgentStatus).order_by(models.AgentStatus.last_seen_at.desc()).first()
    
    return {
        "counts_by_status": summary, 
        "total_documents": total,
        "agent": agent
    }

def get_documents(db: Session, skip: int = 0, limit: int = 50):
    return db.query(models.Document).order_by(models.Document.created_at.desc()).offset(skip).limit(limit).all()

def get_document(db: Session, qdoc_id: str):
    return db.query(models.Document).filter(models.Document.qdoc_id == qdoc_id).first()

def get_recent_events(db: Session, limit: int = 50):
    return db.query(models.DocumentEvent).order_by(models.DocumentEvent.created_at.desc()).limit(limit).all()

def record_heartbeat(db: Session, heartbeat: schemas.AgentHeartbeat):
    db_agent = db.query(models.AgentStatus).filter(models.AgentStatus.machine_name == heartbeat.machine_name).first()
    if not db_agent:
        db_agent = models.AgentStatus(**heartbeat.model_dump())
        db.add(db_agent)
    else:
        for var, value in vars(heartbeat).items():
            setattr(db_agent, var, value) if value is not None else None
        db_agent.last_seen_at = func.now()
    
    db.commit()
    db.refresh(db_agent)
    return db_agent

def record_document_event(db: Session, event_in: schemas.DocumentEventCreate):
    db_event = models.DocumentEvent(
        document_id=event_in.document_id,
        event_type=event_in.event_type,
        machine_name=event_in.machine_name,
        payload_json=event_in.payload_json
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def get_issues(db: Session, limit: int = 50):
    return db.query(models.Document).filter(
        models.Document.status.in_([statuses.DocumentStatus.DUPLICATE, statuses.DocumentStatus.REVIEW])
    ).order_by(models.Document.updated_at.desc()).limit(limit).all()
