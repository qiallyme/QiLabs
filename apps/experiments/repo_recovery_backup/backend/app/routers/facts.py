"""Facts CRUD router."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.deps import get_current_user, get_service_client

router = APIRouter()


class FactCreate(BaseModel):
    statement: str
    category: Optional[str] = "general"
    status: Optional[str] = "asserted"
    issue_id: Optional[str] = None
    excerpt: Optional[str] = None
    page_ref: Optional[str] = None
    date_of_fact: Optional[str] = None


class FactUpdate(BaseModel):
    statement: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    issue_id: Optional[str] = None
    excerpt: Optional[str] = None
    page_ref: Optional[str] = None
    date_of_fact: Optional[str] = None


@router.get("")
async def list_facts(matter_id: str, category: Optional[str] = None, user: dict = Depends(get_current_user)):
    db = get_service_client()
    q = db.table("facts").select("*").eq("matter_id", matter_id)
    if category:
        q = q.eq("category", category)
    result = q.order("created_at", desc=True).execute()
    return result.data


@router.post("", status_code=201)
async def create_fact(matter_id: str, body: FactCreate, user: dict = Depends(get_current_user)):
    db = get_service_client()
    data = {**body.model_dump(exclude_none=True), "matter_id": matter_id}
    result = db.table("facts").insert(data).execute()
    return result.data[0] if result.data else {}


@router.patch("/{fact_id}")
async def update_fact(matter_id: str, fact_id: str, body: FactUpdate, user: dict = Depends(get_current_user)):
    db = get_service_client()
    data = body.model_dump(exclude_none=True)
    result = db.table("facts").update(data).eq("id", fact_id).eq("matter_id", matter_id).execute()
    return result.data[0] if result.data else {}


@router.delete("/{fact_id}", status_code=204)
async def delete_fact(matter_id: str, fact_id: str, user: dict = Depends(get_current_user)):
    db = get_service_client()
    db.table("facts").delete().eq("id", fact_id).eq("matter_id", matter_id).execute()
