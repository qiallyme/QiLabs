from datetime import datetime
from ..db import db
from ..utils import resolve_time_defaults, get_next_qid
import json


class CaptureService:
    def process(
        self,
        text: str,
        source: str,
        realm_hint: str = "QiLife",
        sensitivity_hint: str = "internal",
        classification_hint: str = "personal",
    ):
        # 1. Normalize & Parse
        time_data = resolve_time_defaults(text)

        # Determine intent (heuristic for v0)
        is_reminder = "don't forget" in text.lower() or "remind me" in text.lower()
        is_event = (
            " at " in text.lower()
            or "meet" in text.lower()
            or time_data["start_at"] is not None
        )

        # 2. Prepare DB Objects
        created_ids = {
            "note_qid": None,
            "task_qid": None,
            "event_qid": None,
            "reminder_qids": [],
            "entity_qids": [],
        }
        actions = []

        with db.cursor() as cur:
            # A. Create Root Note (The "Thought")
            note_qid = get_next_qid(
                db
            )  # We pass db (connection wrapper) but get_next_qid needs conn/cur?
            # get_next_qid implemented to take conn, but let's just implement inline or fix util to take cur
            # Fix: utils.get_next_qid takes conn usually. Here we have cur.
            # Let's fix utils usage or query directly.
            cur.execute("select qios_next_qid()")
            row = cur.fetchone()
            note_qid = (
                row["qios_next_qid"] if row else f"QI-Mock-{datetime.now().microsecond}"
            )

            created_ids["note_qid"] = note_qid

            # Insert Note
            cur.execute(
                """
                INSERT INTO public.node (qid, title, slug, realm, type, node, summary, sensitivity, classification, created_at)
                VALUES (%s, %s, %s, %s, 'note', 'file', %s, %s, %s, now())
            """,
                (
                    note_qid,
                    text[:50] + "..." if len(text) > 50 else text,
                    f"capture_{note_qid.lower().replace('-', '_')}",
                    realm_hint,
                    text,  # summary = full text for now
                    sensitivity_hint,
                    classification_hint,
                ),
            )

            # B. Create Task (if action implied)
            if is_reminder or is_event:  # "Don't forget" implies a task to remember
                cur.execute("select qios_next_qid()")
                task_qid = cur.fetchone()["qios_next_qid"]
                created_ids["task_qid"] = task_qid

                cur.execute(
                    """
                    INSERT INTO public.node (qid, title, slug, realm, type, node, sensitivity, classification)
                    VALUES (%s, %s, %s, %s, 'task', 'task', %s, %s)
                """,
                    (
                        task_qid,
                        "Task: " + text[:50],
                        f"task_{task_qid}",
                        realm_hint,
                        sensitivity_hint,
                        classification_hint,
                    ),
                )

                cur.execute(
                    """
                    INSERT INTO public.task (node_id, status, priority, due_at)
                    VALUES ((SELECT id FROM public.node WHERE qid = %s), 'open', 'medium', %s)
                """,
                    (task_qid, time_data["due_at"]),
                )

                # Link Task -> Note
                cur.execute(
                    """
                    INSERT INTO public.link (from_qid, to_qid, link_type) VALUES (%s, %s, 'task:origin')
                """,
                    (task_qid, note_qid),
                )

            # C. Create Event (if time specific)
            if is_event and time_data["start_at"]:
                cur.execute("select qios_next_qid()")
                event_qid = cur.fetchone()["qios_next_qid"]
                created_ids["event_qid"] = event_qid

                cur.execute(
                    """
                    INSERT INTO public.node (qid, title, slug, realm, type, node, sensitivity, classification)
                    VALUES (%s, %s, %s, %s, 'event', 'event', %s, %s)
                """,
                    (
                        event_qid,
                        "Event: " + text[:50],
                        f"event_{event_qid}",
                        realm_hint,
                        sensitivity_hint,
                        classification_hint,
                    ),
                )

                cur.execute(
                    """
                    INSERT INTO public.event (node_id, start_at, end_at, location)
                    VALUES ((SELECT id FROM public.node WHERE qid = %s), %s, %s, %s)
                """,
                    (event_qid, time_data["start_at"], time_data["end_at"], "TBD"),
                )

                # Link Event -> Note
                cur.execute(
                    """
                    INSERT INTO public.link (from_qid, to_qid, link_type) VALUES (%s, %s, 'event:origin')
                """,
                    (event_qid, note_qid),
                )

                actions.append({"type": "calendar.upsert", "event_qid": event_qid})

            # D. Create Reminders
            for remind_time in time_data["remind_at"]:
                cur.execute("select qios_next_qid()")
                rem_qid = cur.fetchone()["qios_next_qid"]
                created_ids["reminder_qids"].append(rem_qid)

                target_qid = created_ids.get("task_qid") or note_qid

                cur.execute(
                    """
                    INSERT INTO public.node (qid, title, slug, realm, type, node, sensitivity, classification)
                    VALUES (%s, %s, %s, %s, 'reminder', 'system', %s, %s)
                """,
                    (
                        rem_qid,
                        f"Reminder for {target_qid}",
                        f"rem_{rem_qid}",
                        realm_hint,
                        sensitivity_hint,
                        classification_hint,
                    ),
                )

                cur.execute(
                    """
                    INSERT INTO public.reminder (node_id, target_qid, remind_at, channel)
                    VALUES ((SELECT id FROM public.node WHERE qid = %s), %s, %s, 'push')
                """,
                    (rem_qid, target_qid, remind_time),
                )

        # If we reached here, commit happened via context manager

        if created_ids["reminder_qids"]:
            actions.append(
                {
                    "type": "reminder.schedule",
                    "reminder_qids": created_ids["reminder_qids"],
                }
            )

        return {
            "created": created_ids,
            "assumptions": time_data["assumptions"],
            "actions": actions,
            "summary": f"Processed: {text}",
        }


capture_service = CaptureService()
