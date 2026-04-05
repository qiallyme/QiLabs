"""Evidence CRUD router."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.deps import get_current_user, get_service_client

router = APIRouter()


class EvidenceCreate(BaseModel):
    title: str
    exhibit_number: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = "document"
    status: Optional[str] = "collected"
    date_collected: Optional[str] = None
    objections: Optional[str] = None
    notes: Optional[str] = None
    pre_marked: Optional[bool] = False


class EvidenceUpdate(BaseModel):
    title: Optional[str] = None
    exhibit_number: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    date_collected: Optional[str] = None
    objections: Optional[str] = None
    notes: Optional[str] = None
    pre_marked: Optional[bool] = None


@router.get("")
async def list_evidence(matter_id: str, user: dict = Depends(get_current_user)):
    db = get_service_client()
    result = db.table("evidence_items").select("*").eq("matter_id", matter_id).order("exhibit_number").execute()
    return result.data


@router.post("", status_code=201)
async def create_evidence(matter_id: str, body: EvidenceCreate, user: dict = Depends(get_current_user)):
    db = get_service_client()
    data = {**body.model_dump(exclude_none=True), "matter_id": matter_id}
    result = db.table("evidence_items").insert(data).execute()
    return result.data[0] if result.data else {}


@router.patch("/{ev_id}")
async def update_evidence(matter_id: str, ev_id: str, body: EvidenceUpdate, user: dict = Depends(get_current_user)):
    db = get_service_client()
    data = body.model_dump(exclude_none=True)
    result = db.table("evidence_items").update(data).eq("id", ev_id).eq("matter_id", matter_id).execute()
    return result.data[0] if result.data else {}


@router.delete("/{ev_id}", status_code=204)
async def delete_evidence(matter_id: str, ev_id: str, user: dict = Depends(get_current_user)):
    db = get_service_client()
    db.table("evidence_items").delete().eq("id", ev_id).eq("matter_id", matter_id).execute()
