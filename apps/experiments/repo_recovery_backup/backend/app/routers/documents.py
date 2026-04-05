"""Documents CRUD router."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.deps import get_current_user, get_service_client

router = APIRouter()


class DocumentCreate(BaseModel):
    title: str
    doc_type: Optional[str] = "other"
    doc_date: Optional[str] = None
    author: Optional[str] = None
    recipient: Optional[str] = None
    page_count: Optional[int] = None
    extracted_text: Optional[str] = None
    summary: Optional[str] = None
    file_id: Optional[str] = None


@router.get("")
async def list_documents(matter_id: str, user: dict = Depends(get_current_user)):
    db = get_service_client()
    result = db.table("documents").select("*").eq("matter_id", matter_id).order("created_at", desc=True).execute()
    return result.data


@router.post("", status_code=201)
async def create_document(matter_id: str, body: DocumentCreate, user: dict = Depends(get_current_user)):
    db = get_service_client()
    data = {**body.model_dump(exclude_none=True), "matter_id": matter_id}
    result = db.table("documents").insert(data).execute()
    return result.data[0] if result.data else {}


@router.delete("/{doc_id}", status_code=204)
async def delete_document(matter_id: str, doc_id: str, user: dict = Depends(get_current_user)):
    db = get_service_client()
    db.table("documents").delete().eq("id", doc_id).eq("matter_id", matter_id).execute()
