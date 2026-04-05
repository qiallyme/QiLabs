# QiOS Integration Layer

Unified connector framework for external APIs (Zoho, Twilio, Email, Calendar, etc.).

## Architecture

All integrations follow the same pattern:
- **Capability-based tools** (not vendor-specific) - GINA calls `crm_search_person`, not `zoho_search_contact`
- **Token management** via `integration_tokens` table in SQLite
- **Base framework** (`integrations/base.py`) for retries, logging, HTTP client
- **Tool wrappers** in `tools/` that call integration clients

## Structure

```
integrations/
  base.py              # Base class with token management, HTTP client, retries
  zoho/
    auth.py           # Zoho OAuth2 token management
    crm.py            # Zoho CRM client (contacts, tasks)
  email/
    client.py         # IMAP/SMTP email client
  calendar/
    client.py         # Google Calendar client (skeleton)
  twilio/
    client.py         # Twilio SMS/Voice client
```

## Token Management

All integrations use the `integration_tokens` table:

```sql
CREATE TABLE integration_tokens (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,  -- 'zoho', 'google', 'twilio', etc.
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TEXT,
    meta TEXT DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

Tokens are automatically refreshed when expired (if refresh_token is available).

## Integration Pattern

1. **Integration Client** (e.g., `ZohoCRM`) extends `IntegrationBase`
2. **Tool Wrapper** (e.g., `tools/crm_search_person.py`) calls the client
3. **Tool Manifest** (`tools_manifest.yaml`) exposes tool to GINA
4. **GINA** calls tool via `/tools/invoke` endpoint

## Available Integrations

### Zoho CRM
- **Auth**: OAuth2 with refresh token
- **Capabilities**: Search contacts, list recent contacts, create contact, create task
- **Tools**: `crm_search_person`, `crm_create_task`
- **Env vars**: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_BASE_URL`

### Email (IMAP/SMTP)
- **Auth**: Username/password
- **Capabilities**: Get recent emails, search emails, send email
- **Tools**: `mail_get_recent`, `mail_send`
- **Env vars**: `EMAIL_IMAP_HOST`, `EMAIL_IMAP_USER`, `EMAIL_IMAP_PASSWORD`, `EMAIL_SMTP_HOST`, `EMAIL_SMTP_USER`, `EMAIL_SMTP_PASSWORD`, `EMAIL_SMTP_PORT`

### Calendar (Google Calendar)
- **Status**: Skeleton (requires OAuth2 setup)
- **Capabilities**: Get upcoming events, create event
- **Tools**: `calendar_get_upcoming`, `calendar_create_event`
- **Env vars**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID`

### Twilio (SMS/Voice)
- **Auth**: Account SID + Auth Token
- **Capabilities**: Send SMS
- **Tools**: `sms_send`
- **Env vars**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `TWILIO_TO_NUMBER` (optional)

## Adding a New Integration

1. Create integration directory: `integrations/{provider}/`
2. Create client class extending `IntegrationBase`
3. Implement token management (if OAuth2) or use env vars
4. Create tool wrappers in `tools/`
5. Add tools to `tools_manifest.yaml`
6. Update GINA prompt with new capabilities

## Example: Adding a New Integration

```python
# integrations/slack/client.py
from integrations.base import IntegrationBase

class SlackClient(IntegrationBase):
    def __init__(self):
        super().__init__("slack")
        self.token = os.getenv("SLACK_BOT_TOKEN")
    
    def send_message(self, channel: str, text: str):
        # Implementation
        pass
```

```python
# tools/slack_send_message.py
from integrations.slack.client import SlackClient

async def run(args, env):
    client = SlackClient()
    result = client.send_message(args["channel"], args["text"])
    return result
```

## Error Handling

All integrations raise `IntegrationError` for failures. Tools catch these and return structured error responses:

```python
{
    "success": False,
    "error": "Error message here"
}
```

## Next Steps

1. **Zoho**: Test with real credentials, add more CRM modules (Leads, Deals)
2. **Email**: Add email threading, attachments
3. **Calendar**: Complete Google Calendar OAuth2 setup
4. **Twilio**: Add voice call support
5. **Frontend**: Add UI for tool suggestions in GINA chat

