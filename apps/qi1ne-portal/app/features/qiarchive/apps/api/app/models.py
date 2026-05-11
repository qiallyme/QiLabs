from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from .db import Base

class Document(Base):
    __tablename__ = "qi_documents"

    id = Column(Integer, primary_key=True, index=True)
    qdoc_id = Column(String, unique=True, index=True, nullable=False)
    original_filename = Column(String)
    canonical_filename = Column(String)
    sha256 = Column(String, index=True)
    status = Column(String, index=True)
    paperless_document_id = Column(String, nullable=True)
    machine_name = Column(String, index=True)
    
    # Extra metadata not in strict spec but useful
    paperless_url = Column(String, nullable=True)
    error_message = Column(String, nullable=True)
    duplicate_of_doc_id = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class DocumentEvent(Base):
    __tablename__ = "qi_document_events"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String, index=True, nullable=False)
    event_type = Column(String, index=True)
    machine_name = Column(String, index=True)
    payload_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AgentStatus(Base):
    __tablename__ = "qi_agent_status"

    id = Column(Integer, primary_key=True, index=True)
    machine_name = Column(String, unique=True, index=True, nullable=False)
    agent_status = Column(String, default="offline")
    last_seen_at = Column(DateTime(timezone=True), server_default=func.now())
    watch_folder = Column(String, nullable=True)
    queue_depth = Column(Integer, default=0)
    processed_today = Column(Integer, default=0)
    duplicates_today = Column(Integer, default=0)
    review_today = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
