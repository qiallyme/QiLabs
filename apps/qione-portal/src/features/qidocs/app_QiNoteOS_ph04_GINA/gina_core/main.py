import os
import json
import logging
import re
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import requests

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gina-core")

# Load environment variables
load_dotenv()

DB_URL = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
N8N_WEBHOOK_URL = os.getenv(
    "N8N_GINA_ACTIONS_WEBHOOK"
)  # E.g. https://n8n.example.com/webhook/gina-actions

app = FastAPI(title="Gina Core", version="0.1.0")

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


class CaptureResponse(BaseModel):
    created: Dict[str, Any]
    assumptions: List[Assumption]
    actions: List[CaptureAction]
    summary: str


class PatchRequest(BaseModel):
    target_qid: str
    instruction: str
    mode: str = Field(..., pattern="^(append|replace_section|tag|link)$")


# --- DB Helpers ---


def get_db_conn():
    try:
        conn = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        logger.error(f"DB connection failed: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")


def claim_qid(cur):
    cur.execute("SELECT qios_next_qid() as qid")
    row = cur.fetchone()
    # Format as QI-###### if it's just a number string
    qid = row["qid"]
    if qid.isdigit():
        return f"QI-{int(qid):06d}"
    return qid


# --- Logic ---


def parse_intents(text: str):
    """
    Minimal v0 parser for intents.
    In v1, this would be an LLM call.
    """
    intents = []
    text_lower = text.lower()

    # Check for Task
    if any(
        k in text_lower
        for k in ["todo", "task", "buy", "pick up", "don't forget", "remember to"]
    ):
        intents.append("task")

    # Check for Event (calendar)
    if any(
        k in text_lower
        for k in [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
            "tomorrow",
            "at",
            "meeting",
            "appointment",
        ]
    ):
        intents.append("event")

    # Default: always create a note
    intents.append("note")

    return list(set(intents))


def resolve_time(text: str):
    """
    Minimal v0 time resolution.
    """
    now = datetime.now()
    assumptions = []

    # Placeholder for a real date parser
    target_date = now

    if "tomorrow" in text.lower():
        target_date = now + timedelta(days=1)
        assumptions.append(
            Assumption(
                field="date",
                value=target_date.strftime("%Y-%m-%d"),
                reason="tomorrow found in text",
            )
        )
    elif "monday" in text.lower():
        # Simple "next monday" logic
        days_ahead = 0 - now.weekday()
        if days_ahead <= 0:
            days_ahead += 7
        target_date = now + timedelta(days=days_ahead)
        assumptions.append(
            Assumption(
                field="date",
                value=target_date.strftime("%Y-%m-%d"),
                reason="monday found in text",
            )
        )

    # Default time
    event_start = target_date.replace(hour=10, minute=0, second=0, microsecond=0)
    event_end = event_start + timedelta(hours=1)

    # If no time was specified in text, we assume 10:00 AM
    # (Checking for 'at 10', 'at 11:30' etc. would be better)
    if not re.search(r"\d{1,2}:\d{2}", text):
        assumptions.append(
            Assumption(
                field="event_time",
                value="10:00 AM",
                reason="no time provided, default to 10 AM",
            )
        )

    return event_start, event_end, assumptions


# --- Endpoints ---


@app.post("/capture", response_model=CaptureResponse)
async def capture(req: CaptureRequest):
    conn = get_db_conn()
    cur = conn.cursor()

    created = {
        "note_qid": None,
        "task_qid": None,
        "event_qid": None,
        "reminder_qids": [],
        "entity_qids": [],
    }

    actions = []
    all_assumptions = []

    try:
        intents = parse_intents(req.text)
        event_start, event_end, time_assumptions = resolve_time(req.text)
        all_assumptions.extend(time_assumptions)

        # 1. Create Note Node (The master record for this capture)
        note_qid = claim_qid(cur)
        created["note_qid"] = note_qid

        cur.execute(
            """
            INSERT INTO public.node (qid, title, slug, realm, type, node, sensitivity, classification, summary)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """,
            (
                note_qid,
                req.text[:50] + "...",
                re.sub(r"[^a-zA-Z0-9]+", "-", req.text[:30].lower()).strip("-"),
                req.realm_hint,
                "note",
                "file",
                req.sensitivity_hint,
                req.classification_hint,
                req.text,
            ),
        )
        note_node_id = cur.fetchone()["id"]

        # 2. Create Task if needed
        if "task" in intents:
            task_qid = claim_qid(cur)
            created["task_qid"] = task_qid

            # Create node for task
            cur.execute(
                """
                INSERT INTO public.node (qid, title, slug, realm, type, node, sensitivity, classification, summary, related)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """,
                (
                    task_qid,
                    f"Task: {req.text[:50]}",
                    f"task-{note_qid.lower()}",
                    req.realm_hint,
                    "task",
                    "task",
                    req.sensitivity_hint,
                    req.classification_hint,
                    req.text,
                    [note_qid],
                ),
            )
            task_node_id = cur.fetchone()["id"]

            # Create task record
            cur.execute(
                """
                INSERT INTO public.task (node_id, status, priority, due_at)
                VALUES (%s, %s, %s, %s)
            """,
                (task_node_id, "open", "medium", event_start),
            )

            # Create link
            cur.execute(
                """
                INSERT INTO public.link (from_qid, to_qid, link_type)
                VALUES (%s, %s, %s)
            """,
                (task_qid, note_qid, "task:about"),
            )

        # 3. Create Event if needed
        if "event" in intents:
            event_qid = claim_qid(cur)
            created["event_qid"] = event_qid

            # Create node for event
            cur.execute(
                """
                INSERT INTO public.node (qid, title, slug, realm, type, node, sensitivity, classification, summary, related)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """,
                (
                    event_qid,
                    f"Event: {req.text[:50]}",
                    f"event-{note_qid.lower()}",
                    req.realm_hint,
                    "event",
                    "concept",
                    req.sensitivity_hint,
                    req.classification_hint,
                    req.text,
                    [note_qid],
                ),
            )
            event_node_id = cur.fetchone()["id"]

            # Create event record
            cur.execute(
                """
                INSERT INTO public.event (node_id, start_at, end_at)
                VALUES (%s, %s, %s)
            """,
                (event_node_id, event_start, event_end),
            )

            actions.append(CaptureAction(type="calendar.upsert", event_qid=event_qid))

            # Create link
            cur.execute(
                """
                INSERT INTO public.link (from_qid, to_qid, link_type)
                VALUES (%s, %s, %s)
            """,
                (event_qid, note_qid, "event:about"),
            )

        # 4. Create Reminders (ADHD logic: T-24h, T-2h, T-30m)
        reminder_target_qid = (
            created["task_qid"] or created["event_qid"] or created["note_qid"]
        )
        if reminder_target_qid:
            reminder_times = [
                event_start - timedelta(hours=24),
                event_start - timedelta(hours=2),
                event_start - timedelta(minutes=30),
            ]

            # Only add reminders that are in the future
            now = datetime.now()
            for r_time in reminder_times:
                if r_time > now:
                    r_qid = claim_qid(cur)
                    created["reminder_qids"].append(r_qid)

                    # Create node for reminder
                    cur.execute(
                        """
                        INSERT INTO public.node (qid, title, slug, realm, type, node, sensitivity, classification, summary, related)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """,
                        (
                            r_qid,
                            f"Reminder for {reminder_target_qid} at {r_time}",
                            f"reminder-{r_qid.lower()}",
                            req.realm_hint,
                            "reminder",
                            "concept",
                            req.sensitivity_hint,
                            req.classification_hint,
                            f"Remind at {r_time}",
                            [reminder_target_qid],
                        ),
                    )
                    r_node_id = cur.fetchone()["id"]

                    # Create reminder record
                    cur.execute(
                        """
                        INSERT INTO public.reminder (node_id, target_qid, remind_at, channel)
                        VALUES (%s, %s, %s, %s)
                    """,
                        (r_node_id, reminder_target_qid, r_time, "push"),
                    )

            if created["reminder_qids"]:
                actions.append(
                    CaptureAction(
                        type="reminder.schedule", reminder_qids=created["reminder_qids"]
                    )
                )

        conn.commit()

        # Trigger N8N if configured
        if N8N_WEBHOOK_URL and actions:
            try:
                requests.post(
                    N8N_WEBHOOK_URL,
                    json={
                        "request_id": str(uuid.uuid4())
                        if "uuid" in globals()
                        else note_qid,
                        "actions": [a.dict() for a in actions],
                    },
                    timeout=5,
                )
            except Exception as e:
                logger.warning(f"Failed to trigger N8N: {e}")

        summary_parts = ["Created:"]
        if created["task_qid"]:
            summary_parts.append("Task")
        if created["event_qid"]:
            summary_parts.append("Calendar event")
        if created["reminder_qids"]:
            summary_parts.append(f"{len(created['reminder_qids'])} reminders")
        summary_parts.append(f"linked to capture {note_qid}.")

        return CaptureResponse(
            created=created,
            assumptions=all_assumptions,
            actions=actions,
            summary=" ".join(summary_parts),
        )

    except Exception as e:
        conn.rollback()
        logger.error(f"Capture failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


@app.get("/agenda")
async def get_agenda(start: Optional[datetime] = None, end: Optional[datetime] = None):
    if not start:
        start = datetime.now()
    if not end:
        end = start + timedelta(days=7)

    conn = get_db_conn()
    cur = conn.cursor()

    try:
        # Query tasks, events, and reminders in the time range
        # Simplified: just tasks and events for now
        cur.execute(
            """
            SELECT n.qid, n.title, n.type, t.due_at as time, t.status
            FROM public.task t
            JOIN public.node n ON t.node_id = n.id
            WHERE t.due_at BETWEEN %s AND %s
            UNION ALL
            SELECT n.qid, n.title, n.type, e.start_at as time, NULL as status
            FROM public.event e
            JOIN public.node n ON e.node_id = n.id
            WHERE e.start_at BETWEEN %s AND %s
            ORDER BY time ASC
        """,
            (start, end, start, end),
        )

        items = cur.fetchall()
        return {"agenda": items, "start": start, "end": end}
    finally:
        cur.close()
        conn.close()


@app.post("/patch")
async def patch_node(req: PatchRequest):
    # Mock for now, but following the spec
    return {"status": "success", "target_qid": req.target_qid, "mode": req.mode}


if __name__ == "__main__":
    import uvicorn
    import uuid

    uvicorn.run(app, host="0.0.0.0", port=8000)
