# Memento

> Your AI-powered document and financial memory — connect Gmail, upload documents, and ask questions in plain language across everything you've ever paid or signed.

**Live demo:**
- Frontend: [https://memento-a3vn.onrender.com](https://memento-a3vn.onrender.com)
- API health: [https://memento-be.onrender.com/health](https://memento-be.onrender.com/health)

---

## The Problem

Everyone has a pile of bills, prescriptions, insurance letters, warranty cards, and subscription emails — physical or digital — with no single place that knows what's in them or when they're due. People miss payments, forget renewal dates, and can't answer *"wait, when does my car insurance expire?"* without digging through email.

## The Solution

1. **Sign in with Google** — one click, no password
2. **Connect Gmail** — Memento scans your last 30 days of emails with AI
3. **Upload any document** — photo, PDF, scan — AI extracts the key info
4. **Ask in plain language** — *"What do I owe this month?"* · *"When's my next renewal?"*
5. **Dashboard** — spend by category, active subscriptions, upcoming reminders

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Query, Recharts |
| Backend | Node.js, Express, TypeScript, tsx runtime |
| Database | PostgreSQL (Render), Drizzle ORM |
| AI | Google Gemini 2.5 Flash (Gmail extraction) |
| Auth | Google OAuth 2.0, JWT (httpOnly cookie) |
| Deploy | Render (web service + static site) |

---

## Features

### Google Sign-In
- OAuth 2.0 with `openid email profile` scope
- JWT session stored in httpOnly cookie
- Protected routes — all app pages require authentication

### Gmail Intelligence
- Connect Gmail with a single click (`gmail.readonly` scope)
- Scans up to 100 emails in the last 30 days
- Gemini AI extracts: merchant, amount, currency, category, billing cycle, due date, renewal date, status
- Deduplicates by `(userId, messageId, fingerprint)` — safe to re-sync
- Dashboard shows: total spend, active subscriptions, upcoming reminders, spend-by-category bar chart

### Document Upload
- Drag-and-drop or click to upload: PDF, JPG, PNG, WEBP (up to 20 MB)
- Per-user document library with category tagging
- AI extraction pipeline (pluggable — Gemini/OpenAI)

### Natural Language Chat
- Ask questions across all your documents
- Source-document attribution in responses

---

## Project Structure

```
memento/
├── backend/                    # Express API (Node.js + TypeScript)
│   ├── src/
│   │   ├── app.ts              # Express app wiring
│   │   ├── index.ts            # Server entry
│   │   ├── config/env.ts       # Zod-validated env at startup
│   │   ├── lib/
│   │   │   ├── db/             # Drizzle ORM (schema + client)
│   │   │   ├── AppError.ts     # Typed error hierarchy
│   │   │   ├── ApiResponse.ts  # Standard response envelope
│   │   │   └── logger.ts       # Structured logger
│   │   ├── middleware/         # authenticate, validate, upload, errorHandler
│   │   └── modules/
│   │       ├── auth/           # Google OAuth, JWT, user management
│   │       ├── documents/      # Upload, CRUD, AI extraction
│   │       └── gmail/          # OAuth, sync, Gemini analysis, stats
│   └── uploads/                # Local file store (gitignored)
│
├── frontend/                   # React + Vite app
│   └── src/
│       ├── app/                # Router, providers
│       ├── features/
│       │   ├── auth/           # LoginPage, ProtectedRoute, AuthProvider
│       │   ├── documents/      # DropZone, DocumentCard, hooks
│       │   ├── gmail/          # ConnectGmail, SyncControls, stats, chart
│       │   └── chat/           # Chat UI + hook
│       ├── components/
│       │   ├── ui/             # Button, Card, Badge, Input, Spinner…
│       │   └── layout/         # Sidebar, Layout
│       └── pages/              # HomePage, DashboardPage, DocumentsPage, ChatPage
│
└── shared/                     # Shared TypeScript types (API contract)
    └── src/types/              # api.ts, auth.ts, document.ts, gmail.ts
```

---

## API Reference

Base URL: `https://memento-be.onrender.com/api/v1`

All responses follow the standard envelope:
```json
{ "success": true,  "data": {} }
{ "success": false, "error": { "code": "NOT_FOUND", "message": "..." } }
```

### Auth
| Method | Endpoint | Description |
|---|---|---|
| GET | `/auth/google` | Redirect to Google consent |
| GET | `/auth/google/callback` | OAuth callback, sets session cookie |
| GET | `/auth/me` | Current user (requires auth) |
| POST | `/auth/logout` | Clear session |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| GET | `/documents` | List user's documents (paginated) |
| GET | `/documents/:id` | Get one document |
| POST | `/documents/upload` | Upload file (`multipart/form-data`, field: `file`) |
| POST | `/documents/query` | Ask a question across documents |
| DELETE | `/documents/:id` | Delete a document |

### Gmail
| Method | Endpoint | Description |
|---|---|---|
| GET | `/gmail/connect` | Start Gmail OAuth |
| GET | `/gmail/callback` | Gmail OAuth callback |
| GET | `/gmail/status` | Connection status |
| POST | `/gmail/sync` | Sync & extract insights from Gmail |
| GET | `/gmail/insights` | List extracted insights |
| GET | `/gmail/stats` | Spend stats, subscriptions, reminders |
| DELETE | `/gmail/disconnect` | Disconnect Gmail |

---

## Local Development

### Prerequisites
- Node.js 20+
- A Google Cloud project with Gmail API + OAuth enabled

### Setup

```bash
# Install all dependencies
npm run install:all

# Copy and fill in env
cp backend/.env.example backend/.env
# Edit backend/.env with your keys (see Environment Variables below)
```

### Run

```bash
# Start both servers concurrently
npm run dev
```

- Frontend → [http://localhost:5173](http://localhost:5173)
- Backend → [http://localhost:3001](http://localhost:3001)
- Health → [http://localhost:3001/health](http://localhost:3001/health)

### Database

```bash
# Push schema to Postgres (first time or after schema changes)
cd backend && npm run db:push

# Browse data
cd backend && npm run db:studio
```

---

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `JWT_SECRET` | Yes | Min 32 chars — signs session tokens |
| `ENCRYPTION_KEY` | Yes | Min 32 chars — encrypts Gmail refresh tokens |
| `GEMINI_API_KEY` | Yes | Google Gemini API key (Gmail extraction) |
| `GOOGLE_CALLBACK_URL` | No | Default: `http://localhost:3001/api/v1/auth/google/callback` |
| `GOOGLE_GMAIL_CALLBACK_URL` | No | Default: `http://localhost:3001/api/v1/gmail/callback` |
| `FRONTEND_URL` | No | Default: `http://localhost:5173` |
| `GEMINI_MODEL` | No | Default: `gemini-2.5-flash` |
| `GMAIL_SYNC_WINDOW_DAYS` | No | Default: `30` |
| `GMAIL_MAX_MESSAGES` | No | Default: `100` |

Frontend `.env`:
```
VITE_API_URL=http://localhost:3001
```

---

## Google Cloud Setup

1. Create project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable: **Gmail API** + **Google People API**
3. OAuth consent screen → External, add scopes: `email`, `profile`, `gmail.readonly`
4. Create OAuth 2.0 credentials → Web application
5. Add authorized redirect URIs:
   - `http://localhost:3001/api/v1/auth/google/callback`
   - `http://localhost:3001/api/v1/gmail/callback`
   - Production equivalents on Render

---

## Architecture

```
Browser → React SPA (Render Static)
              │ /api/* proxy
              ↓
Express API (Render Web Service)
    ├── Auth middleware (JWT cookie)
    ├── /auth   → Google OAuth → JWT → httpOnly cookie
    ├── /documents → Multer upload → Drizzle ORM → PostgreSQL
    └── /gmail  → Gmail API → Gemini 2.5 Flash → PostgreSQL
                                     │
                              Gemini extracts:
                              merchant · amount · category
                              billing cycle · due date · status
```

---

## Deployment (Render)

Both services are defined in `render.yaml` and deploy automatically on push to `main`.

| Service | Type | URL |
|---|---|---|
| `memento-backend` | Node web service | `https://memento-be.onrender.com` |
| `memento-frontend` | Static site | `https://memento-a3vn.onrender.com` |

Set these secrets in the Render dashboard (not in `render.yaml`):
`DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `ENCRYPTION_KEY`, `GEMINI_API_KEY`

---

## Commit Convention

Follows [Conventional Commits](https://www.conventionalcommits.org/):
```
feat(gmail): add spend-by-category chart
fix(auth): handle expired JWT gracefully
chore(deploy): pin Node 20 in .nvmrc
```

Branch model: `feat/*` → `develop` → `main` (all merges `--no-ff`)
