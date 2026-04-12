import os
import httpx
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("supabase_sync")

def get_config():
    return {
        "url": os.getenv("SUPABASE_URL"),
        "key": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        "bucket": os.getenv("SUPABASE_BUCKET", "notes"),
        "enabled": os.getenv("SUPABASE_SYNC_ENABLED", "false").lower() == "true"
    }

def on_app_startup():
    config = get_config()
    if config["enabled"]:
        if not config["url"] or not config["key"]:
            logger.warning("⚠️ Supabase Sync enabled but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.")
        else:
            logger.info("☁️ Supabase Sync Plugin Initialized")

def on_note_save(note_path, content, **kwargs):
    config = get_config()
    if not config["enabled"] or not config["url"] or not config["key"]:
        return

    # If content isn't provided, read it from disk
    if not content:
        notes_dir = kwargs.get('notes_dir', './data')
        full_path = Path(notes_dir) / note_path
        if full_path.exists():
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
    
    if not content:
        return

    url = f"{config['url'].rstrip('/')}/storage/v1/object/{config['bucket']}/{note_path}"
    headers = {
        "Authorization": f"Bearer {config['key']}",
        "Content-Type": "text/markdown",
        "x-upsert": "true"
    }

    try:
        # Use httpx for synchronous call in hook (or we could make hooks async if main.py supported it)
        with httpx.Client() as client:
            response = client.post(url, headers=headers, content=content.encode('utf-8'))
            if response.status_code in (200, 201):
                logger.info(f"✅ Synced {note_path} to Supabase")
            else:
                logger.error(f"❌ Failed to sync {note_path} to Supabase: {response.text}")
    except Exception as e:
        logger.error(f"⚠️ Supabase Sync Error: {str(e)}")

def on_note_delete(note_path, **kwargs):
    config = get_config()
    if not config["enabled"] or not config["url"] or not config["key"]:
        return

    url = f"{config['url'].rstrip('/')}/storage/v1/object/{config['bucket']}/{note_path}"
    headers = {
        "Authorization": f"Bearer {config['key']}"
    }

    try:
        with httpx.Client() as client:
            response = client.delete(url, headers=headers)
            if response.status_code == 200:
                logger.info(f"🗑️ Deleted {note_path} from Supabase")
    except Exception as e:
        logger.error(f"⚠️ Supabase Sync Delete Error: {str(e)}")
