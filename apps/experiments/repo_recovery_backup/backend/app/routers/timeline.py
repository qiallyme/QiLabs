"""Timeline events CRUD router."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.deps import get_current_user, get_service_client

router = APIRouter()


class TimelineEventCreate(BaseModel):
    event_date: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = "event"
    date_precision: Optional[str] = "day"
    significance: Optional[str] = "normal"


class TimelineEventUpdate(BaseModel):
    event_date: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    date_precision: Optional[str] = None
    significance: Optional[str] = None


@router.get("")
async def list_timeline(matter_id: str, user: dict = Depends(get_current_user)):
    db = get_service_client()
    result = db.table("timeline_events").select("*").eq("matter_id", matter_id).order("event_date").execute()
    return result.data


@router.post("", status_code=201)
async def create_event(matter_id: str, body: TimelineEventCreate, user: dict = Depends(get_current_user)):
    db = get_service_client()
    data = {**body.model_dump(exclude_none=True), "matter_id": matter_id}
    result = db.table("timeline_events").insert(data).execute()
    return result.data[0] if result.data else {}


@router.delete("/{event_id}", status_code=204)
async def delete_event(matter_id: str, event_id: str, user: dict = Depends(get_current_user)):
    db = get_service_client()
    db.table("timeline_events").delete().eq("id", event_id).eq("matter_id", matter_id).execute()
