# Gina Core Normalization Rules (v0)

## Time Resolution Defaults (America/Chicago)

* “Monday” → next Monday date
* If no time:
  * **Event default:** 10:00 AM–11:00 AM
  * **Task due default:** 10:00 AM same day
* If the phrase contains “don’t forget” and no day/time:
  * Reminders at **10:00 AM + 6:00 PM today**

## Reminder Offsets (if an event exists)

* T-24h at 6:00 PM previous day (prep/confirm)
* T-2h
* T-30m

## Clarification Policy

* Do **not** block capture.
* If needed info is missing (supplier, address, order status):
  * Create a **follow-up subtask** like “Confirm order ready / get pickup address”
  * Optionally ask **one** question only when execution cannot proceed (rare in v0)
