# QiArchive Summary: Singleton Instance Control

**Timestamp**: 2026-03-06 16:12

## 🎯 Objective

Prevent multiple instances of the document agent from running simultaneously, ensuring data integrity and avoiding duplicate processing.

## ✅ Completed in this Phase

### 1. Robust Singleton Lock

- **Mechanism**: Implemented a TCP Socket Bind lock on port **`50001`**.
- **Benefit**: Unlike file-based locks, a socket lock is automatically released by the Operating System if the process crashes, preventing "stale lock" bugs.
- **Implementation**: Added to `pipeline.py`'s `start_polling` loop. If the port is already taken, the new instance exits gracefully.

### 2. Coordination between Background & Console

- **`console.py` Integration**: The Web Console now checks if a background agent is already running before trying to start its own watcher.
- **UI Feedback**: If the background agent is active, the console displays **`WATCHER: SYSTEM`** (Blue) and disables the local toggle, letting you know the system is already covered.

### 3. Graceful Lifecycle

- **Unified Logic**: Both the console and the background script now use the same `pipeline.py` logic to determine if the "seat is taken."

## 📍 Stability Status

The agent is now safe to run as a background service; it will correctly "back off" if another instance is detected.

## ⏭️ Next Actions

- Verify the mobile-responsive Cloud Dashboard for the synced events.
