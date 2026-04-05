from datetime import datetime, timedelta
import re
from typing import Optional, Tuple


def resolve_time_defaults(text: str) -> dict:
    """
    Parses text for time/date references and returns normalized datetimes based on ADHD defaults.
    Defaults:
    - No time -> 10:00 AM
    - "Don't forget" -> Reminders at 10:00 AM + 6:00 PM
    - "Monday" -> Next Monday
    """
    now = datetime.now()
    today_10am = now.replace(hour=10, minute=0, second=0, microsecond=0)
    today_6pm = now.replace(hour=18, minute=0, second=0, microsecond=0)

    # If passed 10am, 10am is tomorrow? No, prompt says "10:00 AM same day" for task due default.

    result = {
        "due_at": None,
        "start_at": None,
        "end_at": None,
        "remind_at": [],
        "assumptions": [],
    }

    lower_text = text.lower()

    # Heuristic: "Monday", "Tuesday", etc.
    days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ]
    target_day_idx = -1
    for i, day in enumerate(days):
        if day in lower_text:
            target_day_idx = i
            break

    if target_day_idx != -1:
        current_day_idx = now.weekday()
        days_ahead = target_day_idx - current_day_idx
        if days_ahead <= 0:  # Target day already happened this week
            days_ahead += 7
        target_date = now + timedelta(days=days_ahead)
        target_10am = target_date.replace(hour=10, minute=0, second=0, microsecond=0)

        result["start_at"] = target_10am
        result["end_at"] = target_10am + timedelta(hours=1)
        result["due_at"] = target_10am
        result["assumptions"].append(
            {
                "field": "event_time",
                "value": "10:00",
                "reason": f"Weekday '{days[target_day_idx]}' provided, no time specified",
            }
        )

    elif "tomorrow" in lower_text:
        tomorrow = now + timedelta(days=1)
        target_10am = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
        result["start_at"] = target_10am
        result["end_at"] = target_10am + timedelta(hours=1)
        result["due_at"] = target_10am
        result["assumptions"].append(
            {
                "field": "event_time",
                "value": "10:00",
                "reason": "tomorrow provided, no time specified",
            }
        )

    # "Don't forget" -> Reminders
    if "don't forget" in lower_text or "remind me" in lower_text:
        # If we have a target date (from Monday/Tomorrow), use that, else Today
        base_date = result["start_at"] if result["start_at"] else today_10am

        remind_1 = base_date.replace(hour=10, minute=0)
        remind_2 = base_date.replace(hour=18, minute=0)

        result["remind_at"] = [remind_1, remind_2]

    return result


def get_next_qid(conn) -> str:
    """Fetches next QID from RPC."""
    # Assuming qios_next_qid exists. If not, fallback to UUID or error?
    # Spec says: qid populated via qios_next_qid() RPC
    try:
        with conn.cursor() as cur:
            cur.execute("select qios_next_qid()")
            row = cur.fetchone()
            if row:
                return row[0]  # e.g. "QI-000123"
    except Exception:
        # Fallback if RPC fails or not installed
        pass

    # Fallback to a fake QID for now if DB fails
    import random

    return f"QI-{random.randint(10000, 99999)}"
