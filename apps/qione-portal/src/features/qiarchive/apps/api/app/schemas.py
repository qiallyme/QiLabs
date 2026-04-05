from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DocumentBase(BaseModel):
    qdoc_id: str
    original_filename: Optional[str] = None
    canonical_filename: Optional[str] = None
    sha256: Optional[str] = None
    status: str
    paperless_document_id: Optional[str] = None
    machine_name: Optional[str] = None

class DocumentCreate(DocumentBase):
    duplicate_of_doc_id: Optional[str] = None
    paperless_url: Optional[str] = None
    error_message: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    paperless_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DocumentEventBase(BaseModel):
    document_id: str
    event_type: str
    machine_name: Optional[str] = None
    payload_json: Optional[dict] = None

class DocumentEventCreate(DocumentEventBase):
    pass

class DocumentEventResponse(DocumentEventBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AgentHeartbeat(BaseModel):
    machine_name: str
    agent_status: str
    watch_folder: Optional[str] = None
    queue_depth: int = 0
    processed_today: int = 0
    duplicates_today: int = 0
    review_today: int = 0

class AgentStatusResponse(AgentHeartbeat):
    id: int
    last_seen_at: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    counts_by_status: dict
    total_documents: int
    agent: Optional[AgentStatusResponse] = None
