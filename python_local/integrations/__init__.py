"""
QiOS Integration Layer
Unified connector framework for external APIs (Zoho, Twilio, Email, Calendar, etc.)

All integrations follow the same pattern:
- Capability-based tools (not vendor-specific)
- Token management via integration_tokens table
- Base framework for retries, logging, HTTP client
"""

