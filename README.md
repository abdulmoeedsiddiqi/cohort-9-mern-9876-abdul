# Notes Taking App

A full-stack notes application built for the 10Pearls Cohort 9 MERN internship — React + TypeScript on the frontend, Express + TypeScript + PostgreSQL on the backend, with real-time sync, rich-text editing, video notes, multi-format export/import, and AI-powered summarization.

## Features

- **Authentication** — email/password signup and login, httpOnly-cookie JWT sessions, protected routes.
- **Rich-text notes** — a [Tiptap](https://tiptap.dev/)-based editor supporting bold, italic, underline, strikethrough, headings (H1–H3), bullet/numbered lists, and a font-color picker, with a live preview of the note's card color while writing.
- **Video notes** — record a video directly from the browser (camera + mic), with thumbnail generation and duration validation; notes can be text-only, video-only, or mixed.
- **Notes management** — create, edit, pin, color-tag (7 colors + white), search by title, filter (all/pinned/video), paginate, soft-delete to Trash, restore, and permanently purge.
- **Real-time sync** — note changes (create/update/delete) broadcast live to all of a user's open sessions over Socket.IO.
- **Export & import** — export all notes as JSON, plain text, PDF, or Word (.docx), with bold/italic/underline/strikethrough/headings/lists/color preserved in PDF/DOCX; import notes back from a JSON backup or from a single PDF/Word/text file.
- **AI summarization** — a "Summarize" button generates a short summary of a note's content via any OpenAI-compatible chat completions API (OpenAI, Groq, etc.), with an optional local, offline extractive-summary fallback if the external provider is unavailable or unconfigured.
- **Light/dark theme** — a persisted theme toggle with a matching palette across the whole UI, including note colors.

## Tech Stack

**Backend**
- Node.js + [Express](https://expressjs.com/) + TypeScript (strict mode)
- [Prisma](https://www.prisma.io/) ORM + PostgreSQL
- JWT auth via httpOnly cookies (`jsonwebtoken`, `bcryptjs`)
- [Socket.IO](https://socket.io/) for real-time note events
- [Zod](https://zod.dev/) for request validation
- [Pino](https://getpino.io/) structured logging
- `pdfkit` (PDF generation), `docx` (Word generation), `mammoth` + `pdf-parse` (Word/PDF text extraction for import)
- `openai` SDK, used generically against any OpenAI-compatible endpoint
- Mocha + Chai + Supertest for testing

**Frontend**
- React 19 + TypeScript + [Vite](https://vitejs.dev/)
- [TanStack Query](https://tanstack.com/query) for server state
- [Tiptap](https://tiptap.dev/) rich-text editor (`starter-kit`, `underline`, `text-style`, `color`, `placeholder` extensions)
- `react-router-dom` for routing
- `axios` for HTTP, `socket.io-client` for real-time updates
- Jest + React Testing Library for testing

## Project Structure

```
.
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # User, Note, NoteAsset models
│   ├── src/
│   │   ├── config/               # env loading
│   │   ├── lib/                  # storage helpers
│   │   ├── logger/                # Pino setup
│   │   ├── middleware/            # auth, upload, error handling
│   │   ├── modules/
│   │   │   ├── auth/               # signup/login/me/logout
│   │   │   ├── ai/                 # summarization service + local fallback
│   │   │   └── notes/               # CRUD, export/import, video assets
│   │   ├── socket/                # Socket.IO server + note events
│   │   └── utils/                 # Tiptap JSON parsing, word count, ApiError
│   ├── test/                     # Mocha/Chai/Supertest tests, mirrors src/
│   └── docker-compose.yml        # local PostgreSQL container
└── frontend/
    └── src/
        ├── api/                  # axios client + per-resource API modules
        ├── components/
        │   ├── auth/               # login/signup forms
        │   ├── common/              # topbar, sidebar, theme toggle
        │   ├── editor/               # Tiptap editor, toolbar, AI summary panel
        │   ├── layout/               # dashboard shell
        │   └── notes/                # note/trash cards, grid, pagination, video recorder
        ├── context/                # auth + theme context providers
        ├── hooks/                  # React Query hooks (useNotes, realtime sync, debounce)
        ├── lib/                    # Tiptap JSON → text/preview helpers, asset URL resolution
        ├── pages/                  # route-level pages
        ├── routes/                 # protected/guest route guards
        └── types/                  # shared TS types
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for the local PostgreSQL database), or a PostgreSQL instance you point `DATABASE_URL` at

### 1. Clone and install

```bash
git clone <this-repo-url>
cd cohort-9-mern-9876-abdul

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Copy each `.env.example` to `.env` and fill in values as needed:

```bash
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env
```

See [Environment Variables](#environment-variables) below for what each value does.

### 3. Start the database

```bash
cd backend
docker compose up -d
npm run prisma:migrate
```

This starts PostgreSQL in Docker on port `5433` (chosen to avoid clashing with a locally-installed Postgres on the default `5432`) and applies the Prisma schema.

### 4. Run the app

In two terminals:

```bash
# backend — http://localhost:4000
cd backend
npm run dev

# frontend — http://localhost:5173
cd frontend
npm run dev
```

Open `http://localhost:5173` and sign up for an account.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Node environment |
| `PORT` | `4000` | Port the API server listens on |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed origin for cross-origin requests (the frontend's URL) |
| `LOG_LEVEL` | `debug` (dev) / `info` (prod) | Pino log level |
| `DATABASE_URL` | — | PostgreSQL connection string (see `docker-compose.yml` for local defaults) |
| `JWT_SECRET` | *(insecure dev default)* | Secret used to sign auth JWTs — set a real value outside development |
| `JWT_EXPIRES_IN_DAYS` | `7` | Auth session lifetime |
| `COOKIE_NAME` | `auth_token` | Name of the httpOnly auth cookie |
| `AI_API_KEY` | *(unset)* | API key for the AI summarization provider. Leaving this unset disables the "Summarize" feature (with a clear error), unless `AI_ENABLE_FALLBACK` is set |
| `AI_BASE_URL` | `https://api.openai.com/v1` | Base URL of an OpenAI-compatible chat completions API — swap for Groq, etc. |
| `AI_MODEL` | `gpt-4o-mini` | Model name to request from that API |
| `AI_ENABLE_FALLBACK` | `false` | If `true`, falls back to a local, offline extractive summary when the external AI provider fails or is unconfigured |

Setting `AI_API_KEY` to the literal value `local` or `mock` forces the local summarizer directly, useful for development without any provider key.

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:4000` | Base URL of the backend API |

## Available Scripts

### Backend (run from `backend/`)

| Script | Description |
|---|---|
| `npm run dev` | Start the API with hot-reload (`ts-node-dev`) |
| `npm run build` | Type-check and compile to `dist/` |
| `npm start` | Run the compiled build |
| `npm test` | Run the Mocha/Chai/Supertest test suite |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run prisma:migrate` | Apply Prisma migrations to the database |
| `npm run prisma:studio` | Open Prisma Studio to browse the database |

### Frontend (run from `frontend/`)

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Jest + React Testing Library test suite |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |

## API Overview

All `/notes/*` routes require authentication (a valid session cookie).

**Auth** (`/auth`)
- `POST /auth/signup` — create an account
- `POST /auth/login` — log in
- `GET /auth/me` — get the current user
- `POST /auth/logout` — log out

**Notes** (`/notes`)
- `GET /notes` — list notes (paginated, filterable, searchable)
- `POST /notes` — create a note
- `GET /notes/:id` — get a single note
- `PATCH /notes/:id` — update a note
- `DELETE /notes/:id` — soft-delete a note
- `POST /notes/:id/summarize` — generate/refresh an AI summary
- `GET /notes/export?format=json|txt|pdf|docx` — download all notes
- `POST /notes/import` — bulk-import notes from a JSON backup
- `POST /notes/import/file` — import a single note from a PDF/Word/text file
- `GET /notes/trash` — list soft-deleted notes
- `POST /notes/:id/restore` — restore a soft-deleted note
- `DELETE /notes/:id/purge` — permanently delete a note
- `POST /notes/:id/assets` — upload a video asset to a note
- `DELETE /notes/:id/assets/:assetId` — remove a video asset

**Real-time** — the backend also runs a Socket.IO server that emits `note:created` / `note:updated` / `note:deleted` events scoped to the authenticated user, so all of that user's open tabs/sessions stay in sync.

## Testing

Both apps have their own test suite, run independently:

```bash
cd backend && npm test    # Mocha/Chai/Supertest
cd frontend && npm test   # Jest + React Testing Library
```

Backend tests use dependency injection (repository/service functions accept an optional collaborator, defaulting to the real implementation) so most of the suite runs fully offline against fakes, without a real database or external API calls.

## Contributing

This project follows a stacked-branch workflow: `feature/<area>/<name>` and `bugfix/<area>/<name>` branches (where `<area>` is `frontend` or `backend`), opened as pull requests against `develop`. See individual PRs for CodeRabbit-reviewed change history.
