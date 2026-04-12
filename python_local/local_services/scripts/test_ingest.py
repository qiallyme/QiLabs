"""
Quick test script to verify /ingest endpoint works and GINA sees the queue change.
"""
import requests
import json
import time

API_BASE = "http://localhost:7130"

def test_ingest():
    """Test ingesting a note and verify it shows up in queue."""
    
    # 1. Check initial queue state
    print("1. Checking initial queue state...")
    response = requests.get(f"{API_BASE}/queue")
    initial_queue = response.json()
    print(f"   Initial queue: {initial_queue}")
    
    # 2. Ingest a test note
    print("\n2. Ingesting test note...")
    ingest_payload = {
        "file_path": "test/example_note.md",
        "slug": "example_note",
        "mime_type": "text/markdown",
        "file_ext": "md",
        "content": "# Test Note\n\nThis is a test note to verify the ingestion pipeline works.",
        "realm": "QiVault",
        "meta": {
            "source": "test_script",
            "test": True
        }
    }
    
    response = requests.post(f"{API_BASE}/ingest", json=ingest_payload)
    ingest_result = response.json()
    print(f"   Ingest result: {ingest_result}")
    ingest_id = ingest_result.get("id")
    
    if not ingest_id:
        print("   ERROR: No ID returned from ingest")
        return
    
    # 3. Wait a moment, then check queue again
    print("\n3. Waiting 1 second, then checking queue again...")
    time.sleep(1)
    response = requests.get(f"{API_BASE}/queue")
    updated_queue = response.json()
    print(f"   Updated queue: {updated_queue}")
    
    # 4. Check if queue count increased
    initial_total = initial_queue.get("total", 0)
    updated_total = updated_queue.get("total", 0)
    
    if updated_total > initial_total:
        print(f"\n✅ SUCCESS: Queue increased from {initial_total} to {updated_total}")
    else:
        print(f"\n⚠️  WARNING: Queue didn't increase ({initial_total} -> {updated_total})")
    
    # 5. Check ingest status
    print(f"\n4. Checking ingest status for {ingest_id}...")
    response = requests.get(f"{API_BASE}/ingest/{ingest_id}")
    status = response.json()
    print(f"   Status: {status}")
    
    # 6. Test GINA chat with queue question
    print("\n5. Testing GINA chat with queue question...")
    gina_payload = {
        "messages": [
            {
                "role": "user",
                "content": "How many items are in the ingestion queue right now?"
            }
        ]
    }
    
    response = requests.post(f"{API_BASE}/gina/chat", json=gina_payload)
    gina_response = response.json()
    print(f"   GINA reply: {gina_response.get('reply', 'No reply')}")
    
    if str(updated_total) in gina_response.get('reply', ''):
        print(f"\n✅ SUCCESS: GINA correctly mentioned queue count ({updated_total})")
    else:
        print(f"\n⚠️  WARNING: GINA may not have seen the queue update")
        print(f"   Expected to see '{updated_total}' in reply")
    
    return ingest_id

if __name__ == "__main__":
    try:
        test_ingest()
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend. Make sure it's running on http://localhost:7130")
    except Exception as e:
        print(f"ERROR: {e}")

