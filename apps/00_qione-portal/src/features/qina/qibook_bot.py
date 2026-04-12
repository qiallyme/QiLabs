"""
QiBook Bot: Converts messy brain-dumps into clean scenes with timeline extraction.

Usage:
    python qibook_bot.py process <inbox_file>
    python qibook_bot.py watch  # Auto-process on file changes
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
import re

try:
    from openai import OpenAI
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
except ImportError:
    print("Missing dependencies. Run: pip install openai watchdog")
    sys.exit(1)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Paths
VAULT_ROOT = Path(r"C:\QiOS\QiVault\713_Book")
META_DIR = VAULT_ROOT / "_meta"
INBOX_DIR = VAULT_ROOT / "_inbox"
SCENES_DIR = VAULT_ROOT / "_scenes"
TIMELINE_DIR = VAULT_ROOT / "_timeline"
INDEXES_DIR = VAULT_ROOT / "_indexes"

# Ensure directories exist
for d in [META_DIR, INBOX_DIR, SCENES_DIR, TIMELINE_DIR, INDEXES_DIR]:
    d.mkdir(parents=True, exist_ok=True)


class QiBookBot:
    """Main bot that processes notes into scenes and timeline events."""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        
        self.client = OpenAI(api_key=api_key)
        self.outline = self._load_meta("book_outline.md")
        self.style_guide = self._load_meta("style_guide.md")
        
    def _load_meta(self, filename: str) -> str:
        """Load a meta file, return empty string if not found."""
        path = META_DIR / filename
        if path.exists():
            return path.read_text(encoding="utf-8")
        return ""
    
    def _read_note(self, filepath: Path) -> str:
        """Read a note file."""
        return filepath.read_text(encoding="utf-8")
    
    def _slugify(self, text: str) -> str:
        """Convert text to URL-safe slug."""
        text = text.lower().strip()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text[:50]  # Limit length
    
    def _extract_front_matter(self, content: str) -> Dict[str, Any]:
        """Extract YAML front matter if present."""
        if not content.startswith("---"):
            return {}
        
        try:
            parts = content.split("---", 2)
            if len(parts) >= 3:
                import yaml
                return yaml.safe_load(parts[1]) or {}
        except Exception as e:
            logger.warning(f"Failed to parse front matter: {e}")
        
        return {}
    
    def _add_front_matter(self, content: str, metadata: Dict[str, Any]) -> str:
        """Add YAML front matter to content."""
        if not metadata:
            return content
        
        try:
            import yaml
            yaml_str = yaml.dump(metadata, default_flow_style=False, allow_unicode=True)
            return f"---\n{yaml_str}---\n\n{content}"
        except Exception as e:
            logger.warning(f"Failed to generate front matter: {e}")
            return content
    
    def draft_scene(self, raw_note: str) -> Dict[str, Any]:
        """
        Convert raw note into a clean scene using OpenAI with function calling.
        Returns dict with 'content' and 'metadata'.
        """
        logger.info("Drafting scene from note...")
        
        # Build system prompt
        system_prompt = f"""You are a book writing assistant. Convert messy brain-dumps into clean, publishable scenes.

BOOK OUTLINE:
{self.outline}

STYLE GUIDE:
{self.style_guide}

Your job:
1. Extract the core narrative/idea from the raw note
2. Write it as a clean scene that fits the book's structure
3. Follow the style guide exactly
4. Add appropriate front matter metadata

Write in the voice specified in the style guide. Don't sound like a therapy brochure or HR manual."""

        # Define function schema for structured output
        tools = [{
            "type": "function",
            "function": {
                "name": "write_scene",
                "description": "Output the cleaned scene with metadata",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "content": {
                            "type": "string",
                            "description": "The cleaned scene content (markdown)"
                        },
                        "title": {
                            "type": "string",
                            "description": "Scene title"
                        },
                        "part": {
                            "type": "string",
                            "description": "Which part this belongs to (from outline)"
                        },
                        "chapter": {
                            "type": "string",
                            "description": "Which chapter this belongs to (from outline)"
                        },
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Relevant tags"
                        },
                        "date": {
                            "type": "string",
                            "description": "Scene date (YYYY-MM-DD) if applicable"
                        }
                    },
                    "required": ["content", "title"]
                }
            }
        }]
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-2024-11-20",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Convert this raw note into a clean scene:\n\n{raw_note}"}
                ],
                tools=tools,
                tool_choice={"type": "function", "function": {"name": "write_scene"}}
            )
            
            # Extract the parsed result
            message = response.choices[0].message
            if message.tool_calls:
                tool_call = message.tool_calls[0]
                result = json.loads(tool_call.function.arguments)
                return result
            
            # Fallback if structured output fails
            logger.warning("Structured output failed, using raw response")
            content = message.content or ""
            return {
                "content": content,
                "title": "Untitled Scene",
                "part": "",
                "chapter": "",
                "tags": [],
                "date": None
            }
            
        except Exception as e:
            logger.error(f"Error drafting scene: {e}")
            raise
    
    def extract_timeline(self, scene_content: str, scene_title: str) -> List[Dict[str, Any]]:
        """
        Extract timeline events from a scene.
        Returns list of events with {date, title, summary, links}.
        """
        logger.info("Extracting timeline events from scene...")
        
        system_prompt = """Extract timeline events from this scene. Look for:
- Dates (explicit or implied)
- Events that happened
- Actions taken
- Decisions made

Output structured timeline events."""

        tools = [{
            "type": "function",
            "function": {
                "name": "extract_timeline_events",
                "description": "Extract timeline events from the scene",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "events": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": {
                                        "type": "string",
                                        "description": "Event date (YYYY-MM-DD, or YYYY-MM, or YYYY if exact date unknown)"
                                    },
                                    "title": {
                                        "type": "string",
                                        "description": "Event title"
                                    },
                                    "summary": {
                                        "type": "string",
                                        "description": "Brief summary (1-2 sentences)"
                                    },
                                    "links": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                        "description": "Related scene/topic links"
                                    }
                                },
                                "required": ["date", "title", "summary"]
                            }
                        }
                    },
                    "required": ["events"]
                }
            }
        }]
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-2024-11-20",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Scene: {scene_title}\n\n{scene_content}"}
                ],
                tools=tools,
                tool_choice={"type": "function", "function": {"name": "extract_timeline_events"}}
            )
            
            message = response.choices[0].message
            if message.tool_calls:
                tool_call = message.tool_calls[0]
                result = json.loads(tool_call.function.arguments)
                return result.get("events", [])
            
            return []
            
        except Exception as e:
            logger.error(f"Error extracting timeline: {e}")
            return []
    
    def save_scene(self, scene_data: Dict[str, Any]) -> Path:
        """Save scene to _scenes/ directory."""
        title = scene_data.get("title", "untitled")
        slug = self._slugify(title)
        filename = f"{slug}.md"
        filepath = SCENES_DIR / filename
        
        # Build front matter
        front_matter = {
            "title": title,
            "created": datetime.now().isoformat(),
        }
        if scene_data.get("part"):
            front_matter["part"] = scene_data["part"]
        if scene_data.get("chapter"):
            front_matter["chapter"] = scene_data["chapter"]
        if scene_data.get("tags"):
            front_matter["tags"] = scene_data["tags"]
        if scene_data.get("date"):
            front_matter["date"] = scene_data["date"]
        
        # Combine front matter and content
        content = self._add_front_matter(scene_data["content"], front_matter)
        
        filepath.write_text(content, encoding="utf-8")
        logger.info(f"Saved scene: {filepath}")
        return filepath
    
    def save_timeline_event(self, event: Dict[str, Any], scene_slug: str) -> Path:
        """Save timeline event to _timeline/ directory."""
        date = event.get("date", "unknown")
        title = event.get("title", "Untitled Event")
        slug = self._slugify(title)
        filename = f"{date}_{slug}.md"
        filepath = TIMELINE_DIR / filename
        
        front_matter = {
            "date": date,
            "title": title,
            "summary": event.get("summary", ""),
            "links": event.get("links", []) + [f"../_scenes/{scene_slug}.md"]
        }
        
        content = f"# {title}\n\n{event.get('summary', '')}\n"
        content = self._add_front_matter(content, front_matter)
        
        filepath.write_text(content, encoding="utf-8")
        logger.info(f"Saved timeline event: {filepath}")
        return filepath
    
    def update_timeline_index(self, event: Dict[str, Any], event_path: Path):
        """Append event to timeline index."""
        index_file = INDEXES_DIR / "timeline_index.md"
        
        date = event.get("date", "unknown")
        title = event.get("title", "Untitled")
        summary = event.get("summary", "")
        rel_path = event_path.relative_to(VAULT_ROOT)
        
        entry = f"- **{date}**: [{title}]({rel_path}) - {summary}\n"
        
        if index_file.exists():
            index_file.write_text(index_file.read_text(encoding="utf-8") + entry, encoding="utf-8")
        else:
            index_file.write_text(f"# Timeline Index\n\n{entry}", encoding="utf-8")
    
    def process_note(self, note_path: Path) -> None:
        """Process a single note: draft scene, extract timeline, save everything."""
        logger.info(f"Processing note: {note_path}")
        
        # Read raw note
        raw_note = self._read_note(note_path)
        
        # Draft scene
        scene_data = self.draft_scene(raw_note)
        scene_path = self.save_scene(scene_data)
        scene_slug = scene_path.stem
        
        # Extract timeline
        events = self.extract_timeline(scene_data["content"], scene_data["title"])
        
        # Save timeline events
        for event in events:
            event_path = self.save_timeline_event(event, scene_slug)
            self.update_timeline_index(event, event_path)
        
        logger.info(f"Processed: {len(events)} timeline events extracted")
        
        # Move note to processed (optional - you might want to keep originals)
        # processed_dir = INBOX_DIR / "_processed"
        # processed_dir.mkdir(exist_ok=True)
        # note_path.rename(processed_dir / note_path.name)


class InboxHandler(FileSystemEventHandler):
    """Watchdog handler for auto-processing new files."""
    
    def __init__(self, bot: QiBookBot):
        self.bot = bot
    
    def on_created(self, event):
        if event.is_directory:
            return
        
        if event.src_path.endswith(".md"):
            logger.info(f"New file detected: {event.src_path}")
            try:
                self.bot.process_note(Path(event.src_path))
            except Exception as e:
                logger.error(f"Error processing {event.src_path}: {e}")


def main():
    """CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="QiBook Bot: Convert notes to scenes")
    parser.add_argument("command", choices=["process", "process-all", "watch", "rebuild-scenes", "extract-timeline"], help="Command to run")
    parser.add_argument("file", nargs="?", help="File to process (for 'process' command)")
    
    args = parser.parse_args()
    
    try:
        bot = QiBookBot()
    except ValueError as e:
        logger.error(str(e))
        sys.exit(1)
    
    if args.command == "process":
        if not args.file:
            logger.error("File required for 'process' command")
            sys.exit(1)
        
        note_path = Path(args.file)
        if not note_path.exists():
            logger.error(f"File not found: {note_path}")
            sys.exit(1)
        
        bot.process_note(note_path)
    
    elif args.command == "process-all":
        logger.info(f"Processing all notes in {INBOX_DIR}...")
        md_files = list(INBOX_DIR.glob("*.md"))
        if not md_files:
            logger.info("No markdown files found in inbox")
            return
        
        for md_file in md_files:
            try:
                bot.process_note(md_file)
            except Exception as e:
                logger.error(f"Error processing {md_file}: {e}")
                continue
        logger.info(f"Processed {len(md_files)} files")
    
    elif args.command == "watch":
        logger.info(f"Watching {INBOX_DIR} for new files...")
        observer = Observer()
        handler = InboxHandler(bot)
        observer.schedule(handler, str(INBOX_DIR), recursive=False)
        observer.start()
        
        try:
            observer.join()
        except KeyboardInterrupt:
            logger.info("Stopping watcher...")
            observer.stop()
        observer.join()
    
    elif args.command == "rebuild-scenes":
        logger.info("Rebuilding all scenes...")
        scene_files = list(SCENES_DIR.glob("*.md"))
        logger.info(f"Found {len(scene_files)} scenes. Rebuild not yet implemented - scenes are generated from inbox notes.")
    
    elif args.command == "extract-timeline":
        logger.info("Extracting timeline from all scenes...")
        scene_files = list(SCENES_DIR.glob("*.md"))
        if not scene_files:
            logger.info("No scenes found")
            return
        
        for scene_file in scene_files:
            try:
                content = scene_file.read_text(encoding="utf-8")
                # Extract title from front matter or filename
                title = scene_file.stem.replace("-", " ").title()
                events = bot.extract_timeline(content, title)
                
                for event in events:
                    event_path = bot.save_timeline_event(event, scene_file.stem)
                    bot.update_timeline_index(event, event_path)
                
                logger.info(f"Extracted {len(events)} events from {scene_file.name}")
            except Exception as e:
                logger.error(f"Error processing {scene_file}: {e}")
                continue
        
        logger.info(f"Timeline extraction complete for {len(scene_files)} scenes")


if __name__ == "__main__":
    main()

