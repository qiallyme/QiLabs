"""Tasks CRUD router."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

from app.deps import get_current_user, get_service_client

router = APIRouter()


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = "general"
    status: Optional[str] = "open"
    priority: Optional[str] = "normal"
    owner: Optional[str] = "self"
    due_date: Optional[str] = None
    notes: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    owner: Optional[str] = None
    due_date: Optional[str] = None
    notes: Optional[str] = None


@router.get("")
async def list_tasks(matter_id: str, status: Optional[str] = None, user: dict = Depends(get_current_user)):
    db = get_service_client()
    q = db.table("tasks").select("*").eq("matter_id", matter_id)
    if status:
        q = q.eq("status", status)
    result = q.order("priority").order("due_date").execute()
    return result.data


@router.post("", status_code=201)
async def create_task(matter_id: str, body: TaskCreate, user: dict = Depends(get_current_user)):
    db = get_service_client()
    data = {**body.model_dump(exclude_none=True), "matter_id": matter_id}
    result = db.table("tasks").insert(data).execute()
    return result.data[0] if result.data else {}


@router.patch("/{task_id}")
async def update_task(matter_id: str, task_id: str, body: TaskUpdate, user: dict = Depends(get_current_user)):
    db = get_service_client()
    data = body.model_dump(exclude_none=True)
    if data.get("status") == "done":
        data["completed_at"] = datetime.now(timezone.utc).isoformat()
    result = db.table("tasks").update(data).eq("id", task_id).eq("matter_id", matter_id).execute()
    return result.data[0] if result.data else {}


@router.delete("/{task_id}", status_code=204)
async def delete_task(matter_id: str, task_id: str, user: dict = Depends(get_current_user)):
    db = get_service_client()
    db.table("tasks").delete().eq("id", task_id).eq("matter_id", matter_id).execute()
