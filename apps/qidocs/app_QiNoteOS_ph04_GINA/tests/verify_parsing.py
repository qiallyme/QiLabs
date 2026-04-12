import sys
import os
from datetime import datetime, timedelta

# Add apps to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps")))

try:
    from gina_core.utils import resolve_time_defaults
except ImportError:
    print("Failed to import. Check PYTHONPATH.")
    sys.exit(1)


def test_parsing():
    print("Testing 'Don't forget my mom... on Monday'...")
    text = "Don't forget my mom has to pick up oxygen on Monday."
    result = resolve_time_defaults(text)

    print(f"Result assumptions: {result['assumptions']}")

    if "don't forget" in text.lower():
        assert len(result["remind_at"]) == 2, "Should have 2 reminders"

    if "Monday" in text:
        assert result["start_at"] is not None, "Should resolve Monday to a date"
        print(f"Start At: {result['start_at']}")

    print("Testing 'Tomorrow'...")
    res2 = resolve_time_defaults("Meeting tomorrow")
    assert res2["start_at"] is not None
    print(f"Tomorrow Start: {res2['start_at']}")

    print("SUCCESS: Parsing logic verified.")


if __name__ == "__main__":
    test_parsing()
