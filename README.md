# Memento

> Your AI-powered document memory — photograph or upload any bill, Fetch emails, prescription, insurance letter, or warranty card, and never miss a payment or renewal again.

## The Problem

Everyone has a pile of documents — physical or digital — and no single place that knows what's in them or when they're due. People miss payments, forget renewal dates, and can't answer *"wait, when does my car insurance expire?"* without digging through email.

## The Solution

1. **Upload** any document (photo, PDF, scan)
2. **AI extracts** structured info — what it is, amount, due date, provider, key terms
3. **Reminders** are auto-created so nothing slips through
4. **Ask questions** in plain language across everything you've uploaded

> *"What do I owe this month?"* · *"When's my next renewal?"* · *"Show me all docs due in 30 days"*

---

## Tech Stack

| Layer     | Tech                                  |
|-----------|---------------------------------------|
| Frontend  | React 18, Vite, TypeScript, Tailwind CSS |
| Backend   | Node.js, Express, TypeScript          |
| AI (soon) | OpenAI Vision + GPT-4o               |

---

## Project Structure

```
memento/
├── backend/          # Express API
│   ├── src/
│   │   ├── app.ts
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── services/
│   └── uploads/      # Uploaded files (git-ignored)
│
├── frontend/         # React + Vite app
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       └── types/
│
└── package.json      # Root scripts (runs both together)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Install

```bash
npm run install:all
```

### Run in development

```bash
npm run dev
```

This starts both servers concurrently:
- **Frontend** → [http://localhost:5173](http://localhost:5173)
- **Backend API** → [http://localhost:3001](http://localhost:3001)

### Backend only

```bash
npm run dev:backend
```

### Frontend only

```bash
npm run dev:frontend
```

---

## Environment Variables

Copy `.env.example` to `.env` in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

| Variable        | Default                    | Description                  |
|----------------|----------------------------|------------------------------|
| `PORT`          | `3001`                     | Backend server port          |
| `NODE_ENV`      | `development`              | Environment                  |
| `CORS_ORIGIN`   | `http://localhost:5173`    | Allowed frontend origin      |
| `OPENAI_API_KEY`| —                          | Add when wiring up AI        |

---

## API Reference

Base URL: `http://localhost:3001/api/v1`

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/`                   | API info                           |
| GET    | `/health`             | Health check                       |
| GET    | `/documents`          | List all documents                 |
| GET    | `/documents/:id`      | Get document by ID                 |
| POST   | `/documents/upload`   | Upload a document (multipart/form-data, field: `file`) |
| DELETE | `/documents/:id`      | Delete a document                  |
| POST   | `/documents/query`    | Ask a question (`{ "question": "..." }`) |

---

## Roadmap

- [ ] AI vision extraction (OpenAI GPT-4o)
- [ ] Structured data storage (PostgreSQL / SQLite)
- [ ] Smart reminders & notifications
- [ ] Cross-document reasoning (RAG)
- [ ] Mobile-friendly camera upload
- [ ] Auth (user accounts)
