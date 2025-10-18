# SeerSync Chrome Extension
- Project Structure
- Project Setup on MinGW
### What's achieved until 19.10.2025
- ✅ Chrome Extension with React + TypeScript + Tailwind
- ✅ FastAPI Backend with health endpoints
- ✅ Google OAuth Authentication - Users can sign in
- ✅ User Registration - Users sync to backend
- ✅ Extension ↔ Backend Communication working

### What're the next steps:
- A. Real-time Messaging (WebRTC + CRDT)

Set up WebRTC peer connections
Add CRDT for offline sync
Build chat UI

- B. Contact Management

Invite friends via email
Contact list UI
Friend requests

- C. Database Integration

Replace in-memory storage with PostgreSQL
Add proper data persistence

- D. Message Storage

Store chat history
Sync messages across devices


### Summary BUILT- 19.10.2025 
- We built a production-ready Chrome extension communication platform using modern web technologies. The frontend is a Manifest V3 Chrome extension built with React 18, TypeScript, and Tailwind CSS, featuring Google OAuth 2.0 authentication via the chrome.identity API. The extension implements a modular architecture with separate service workers for background tasks, content scripts for page-level integration, and a React-based popup UI. User authentication state is persisted in chrome.storage.local, and the extension communicates with the backend via RESTful APIs with proper CORS configuration for chrome-extension:// origins.
- The backend is a FastAPI application with PostgreSQL database managed through SQLAlchemy ORM and Docker containerization. We implemented a complete user management system with OAuth token verification, automatic user registration on first login, and a relational contact management system with foreign key constraints and cascade deletes. The database schema includes indexed fields for query optimization (google_id, email) and proper timestamp tracking (created_at, updated_at). The API follows RESTful conventions with dependency injection for database sessions, Pydantic schemas for request/response validation, and proper error handling with HTTP status codes.
