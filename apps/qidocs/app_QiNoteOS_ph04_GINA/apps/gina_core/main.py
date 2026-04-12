from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from services.capture import capture_service

app = FastAPI(title="Gina Core API", version="0.1.0")

# --- Models ---


class CaptureRequest(BaseModel):
    text: str
    source: str = "chatgpt"
    realm_hint: Optional[str] = "QiLife"
    sensitivity_hint: Optional[str] = "internal"
    classification_hint: Optional[str] = "personal"


class CaptureAction(BaseModel):
    type: str
    event_qid: Optional[str] = None
    reminder_qids: Optional[List[str]] = None


class Assumption(BaseModel):
    field: str
    value: str
    reason: str


class CreatedIds(BaseModel):
    note_qid: Optional[str] = None
    task_qid: Optional[str] = None
    event_qid: Optional[str] = None
    reminder_qids: List[str] = []
    entity_qids: List[str] = []


class CaptureResponse(BaseModel):
    created: CreatedIds
    assumptions: List[Assumption]
    actions: List[CaptureAction]
    summary: str


class PatchRequest(BaseModel):
    target_qid: str
    instruction: str
    mode: str = Field(..., pattern="^(append|replace_section|tag|link)$")


# --- Endpoints ---


@app.post("/capture", response_model=CaptureResponse)
async def capture(req: CaptureRequest):
    """
    Purpose: natural language → nodes + typed tables + links + n8n action request
    """
    try:
        result = capture_service.process(
            text=req.text,
            source=req.source,
            realm_hint=req.realm_hint,
            sensitivity_hint=req.sensitivity_hint,
            classification_hint=req.classification_hint,
        )
        return result
    except Exception as e:
        # Log error
        print(f"Error in capture: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/agenda")
async def get_agenda(start: datetime = None, end: datetime = None):
    """
    Returns upcoming tasks/events/reminders in a single payload for “what’s next”.
    """
    # TODO: Implement DB query joined across task, event, reminder.
    return {"agenda": []}


@app.post("/patch")
async def patch_node(req: PatchRequest):
    """
    Safe update patterns only (append, replace_section, tag, link).
    """
    # TODO: Implement safe patching logic with audit logging
    return {"status": "success", "target_qid": req.target_qid}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
