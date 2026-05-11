# n8n Workflow Specs (v0)

## WF-01: `gina_actions_webhook` (Triggered by Gina Core)

**Webhook In:** `/webhook/gina-actions`

**Payload**
```json
{
  "request_id": "req_...",
  "actions": [
    {"type":"calendar.upsert","event_qid":"QI-000125"},
    {"type":"reminder.schedule","reminder_qids":["QI-000126","QI-000127","QI-000128"]}
  ]
}
```

**Steps**
1. **HTTP Request → Gina Core**: `GET /event?event_qid=...` (or a DB read if you expose a DB view)
2. **Google Calendar Node**: Upsert event
3. **HTTP Request → Gina Core**: `POST /event/external_id` to store `external_event_id`
4. For each reminder_qid:
   * **HTTP Request → Gina Core**: `GET /reminder?qid=...`
   * **Delivery Node** (email/push; whatever you already reliably receive)
   * **HTTP Request → Gina Core**: `POST /reminder/mark_sent`

## WF-02: `daily_digest` (Schedule)
* Every day 9:00 PM
1. `GET /digest?date=today`
2. Store as `note` node
3. Send to you (email/push)

## WF-03: `weekly_digest` (Schedule)
* Sundays 6:00 PM
1. `GET /digest?week=current`
2. Store as `note`
3. Send
