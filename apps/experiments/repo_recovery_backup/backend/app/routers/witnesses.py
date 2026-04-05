"""Witnesses CRUD router."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.deps import get_current_user, get_service_client

router = APIRouter()


class WitnessCreate(BaseModel):
    name: str
    role: Optional[str] = "fact"
    contact_info: Optional[str] = None
    subpoena_status: Optional[str] = "not_issued"
    testimony_summary: Optional[str] = None
    credibility_notes: Optional[str] = None


class WitnessUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    contact_info: Optional[str] = None
    subpoena_status: Optional[str] = None
    testimony_summary: Optional[str] = None
    credibility_notes: Optional[str] = None


@router.get("")
async def list_witnesses(matter_id: str, user: dict = Depends(get_current_user)):
    db = get_service_client()
    result = db.table("witnesses").select("*").eq("matter_id", matter_id).order("name").execute()
    return result.data


@router.post("", status_code=201)
async def create_witness(matter_id: str, body: WitnessCreate, user: dict = Depends(get_current_user)):
    db = get_service_client()
    data = {**body.model_dump(exclude_none=True), "matter_id": matter_id}
    result = db.table("witnesses").insert(data).execute()
    return result.data[0] if result.data else {}


@router.patch("/{w_id}")
async def update_witness(matter_id: str, w_id: str, body: WitnessUpdate, user: dict = Depends(get_current_user)):
    db = get_service_client()
    data = body.model_dump(exclude_none=True)
    result = db.table("witnesses").update(data).eq("id", w_id).eq("matter_id", matter_id).execute()
    return result.data[0] if result.data else {}


@router.delete("/{w_id}", status_code=204)
async def delete_witness(matter_id: str, w_id: str, user: dict = Depends(get_current_user)):
    db = get_service_client()
    db.table("witnesses").delete().eq("id", w_id).eq("matter_id", matter_id).execute()
