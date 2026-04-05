"""Deadlines CRUD router."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.deps import get_current_user, get_service_client

router = APIRouter()


class DeadlineCreate(BaseModel):
    title: str
    deadline_date: str
    type: Optional[str] = "filing"
    status: Optional[str] = "pending"
    court_imposed: Optional[bool] = True
    notes: Optional[str] = None


class DeadlineUpdate(BaseModel):
    title: Optional[str] = None
    deadline_date: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    court_imposed: Optional[bool] = None
    notes: Optional[str] = None


@router.get("")
async def list_deadlines(matter_id: str, user: dict = Depends(get_current_user)):
    db = get_service_client()
    result = db.table("deadlines").select("*").eq("matter_id", matter_id).order("deadline_date").execute()
    return result.data


@router.post("", status_code=201)
async def create_deadline(matter_id: str, body: DeadlineCreate, user: dict = Depends(get_current_user)):
    db = get_service_client()
    data = {**body.model_dump(exclude_none=True), "matter_id": matter_id}
    result = db.table("deadlines").insert(data).execute()
    return result.data[0] if result.data else {}


@router.patch("/{dl_id}")
async def update_deadline(matter_id: str, dl_id: str, body: DeadlineUpdate, user: dict = Depends(get_current_user)):
    db = get_service_client()
    data = body.model_dump(exclude_none=True)
    result = db.table("deadlines").update(data).eq("id", dl_id).eq("matter_id", matter_id).execute()
    return result.data[0] if result.data else {}


@router.delete("/{dl_id}", status_code=204)
async def delete_deadline(matter_id: str, dl_id: str, user: dict = Depends(get_current_user)):
    db = get_service_client()
    db.table("deadlines").delete().eq("id", dl_id).eq("matter_id", matter_id).execute()
