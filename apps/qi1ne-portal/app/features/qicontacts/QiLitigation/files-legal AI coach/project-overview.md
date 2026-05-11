# Legal AI Coach – Project Plan Overview

## Purpose
To empower self-represented litigants in dependency and family law with a web-based AI-powered coaching platform. Users can track their case progress, manage goals, upload documents/evidence, and receive jurisdiction-specific legal insights and tips, all in a secure and user-friendly environment.

---

## Key Features

- **Case Goals:** Set, track, and update legal goals, linked to timeline milestones.
- **Timeline:** Visual visualization of case progress and actions.
- **Document Management:** Upload, view, and organize legal documents.
- **Chat History:** Interact with an AI legal coach and save prior conversations.
- **Evidence Uploads:** Store photos or images of physical evidence.
- **AI Guidance:** Receive tips, insights, clarifying questions, and recommendations powered by Gemini 2.0 (and future integrations with Lexis+ and Harvey AI).
- **Jurisdiction-specific Analysis:** Pull relevant court rules, case law, and public data for accurate, personalized advice.

---

## Tech Stack

- **Frontend:** React (modular, scalable, with pages for goals, timeline, documents, chats, evidence)
- **Backend:** FastAPI (Python), with endpoints for all features, AI agent orchestration, authentication, database management
- **AI Integrations:** Gemini 2.0 (initial), Lexis+, Harvey (future)
- **File/Data Storage:** Local and cloud options for documents/evidence

---

## Project Structure

### Frontend

- Goals, Timeline, Documents, Chats, Evidence features in separate modules
- Dashboard for overview and navigation
- Hooks and context for state management

### Backend

- API endpoints for all features
- Database models for user data, documents, evidence, chat history
- AI Agent logic for legal analysis and tips
- Authentication for security

---

## Planned Workflow

1. **Scaffold Project Structure:**  
   Set up React frontend and FastAPI backend with modular folders and files.

2. **Build Backend API:**  
   Develop endpoints, models, and integrate basic AI agent logic.

3. **Connect Frontend to Backend:**  
   Implement data flows for goals, timeline, uploads, chats, and evidence.

4. **Integrate AI Guidance:**  
   Connect to Gemini 2.0 for initial legal advice and insight. Expand to Lexis+/Harvey as available.

5. **Test & Iterate:**  
   Test user flows, add features (authentication, notifications, export, etc.), improve UI/UX and AI accuracy.

6. **Deploy:**  
   Launch on cloud hosting platforms for frontend and backend.

---

## Status

- Project structure and boilerplate ready
- Customization and feature build-out underway
- Ready for team collaboration and expansion

---

## Next Steps

- Expand backend features (database integration, advanced AI agent logic)
- Build out frontend pages and connect to API
- Add authentication and security layers
- Test with real user data and iterate based on feedback

---

**Contact:**  
For more info, demo, or to contribute, reach out to the project owner or visit the project repository.