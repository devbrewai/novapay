# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nova is a Devbrew portfolio demo: an AI support agent ("Nova") embedded in a mock neobank dashboard. It targets seed-to-Series-A fintech founders to showcase Devbrew's ability to ship production-quality conversational AI. The full PRD lives in `PRD.md`.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Base UI (shadcn-style components in `src/components/ui/`), Bun as package manager/runtime
- **Backend:** Python 3.11+ + FastAPI
- **LLM:** Anthropic Claude Sonnet 4.6 (`claude-sonnet-4-6`) — no fallback model
- **Embeddings:** OpenAI `text-embedding-3-small`
- **Vector DB:** ChromaDB (self-hosted)
- **Streaming:** Server-Sent Events (SSE)
- **Deployment:** Vercel (frontend), Render (backend + ChromaDB)

## Architecture

```
React Frontend
├── Mock Nova Dashboard (sidebar nav, account summary, transactions list)
└── Chat Widget ("Ask Nova" floating bubble)
        │ SSE
FastAPI Backend
├── POST /api/chat         → conversation endpoint (SSE streaming)
│   ├── Rate Limiter (5 msg/hour per IP)
│   ├── Conversation Manager (in-memory, 20-msg sliding window, 30-min TTL)
│   ├── RAG Pipeline
│   │   ├── Query embedding (text-embedding-3-small)
│   │   ├── ChromaDB vector search (top 3 chunks, distance threshold 1.5)
│   │   └── Context injection into LLM prompt
│   ├── Tool Router
│   │   ├── transaction_lookup(query)
│   │   ├── account_info()
│   │   └── escalate_to_human(reason)
│   └── LLM (Claude Sonnet 4 with streaming + tool use)
├── GET  /api/transactions  → mock transaction data
├── GET  /api/account       → mock user profile
└── GET  /api/health        → status check
```

The RAG pipeline ingests the 36 knowledge base markdown files from `backend/data/knowledge_base/` on startup: chunk (max 400 tokens, 1-paragraph overlap) → embed → store in ChromaDB collection `nova_kb`. Per query: embed → search → inject top chunks as context → stream LLM response.

## Key Design Decisions

- **Demo user is hardcoded** — no auth. User profile: "Alex Rivera", Premium account, balance $12,847.32.
- **No persistence** — conversations are in-memory, reset on reload/restart is fine.
- **Chat is a floating bubble** — bottom-right on desktop (~400px wide, max 75vh tall), fullscreen overlay on mobile. Implemented in `frontend/src/components/chat/chat-panel.tsx`.
- **Light theme** — clean white backgrounds, subtle gray borders, emerald accent. Fintech founders expect light UIs (Mercury, Brex defaults).
- **Agent persona "Nova"** — friendly, professional, concise, uses first name, never reveals it's a demo.
- **Responses must stay under 100 words** unless explaining a multi-step process.
- **Escalation triggers:** account closures, complex disputes, unresolvable after 2 attempts.

## Environment Variables

Backend (defined in `backend/app/config.py`):

- `ANTHROPIC_API_KEY` — Claude API key (required)
- `OPENAI_API_KEY` — OpenAI API key for embeddings (required)
- `RESEND_API_KEY` — Resend API key for escalation emails (optional)
- `CHROMA_PERSIST_DIR` — ChromaDB storage path (default: `./chroma_data`)
- `KNOWLEDGE_BASE_DIR` — Markdown KB directory (default: `./data/knowledge_base`)
- `CORS_ORIGINS` — Allowed origins, comma-separated (default: `http://localhost:5173`)
- `LOG_LEVEL` — Logging level (default: `INFO`)
- `CHAT_RATE_LIMIT` — Messages per hour per IP (default: `5`)
- `ESCALATION_TO_EMAIL` — Recipient for human escalations (default: `hello@devbrew.ai`)
- `ESCALATION_FROM_EMAIL` — Sender address for escalation emails (default: `nova@notify.devbrew.ai`)
- `AGENT_FROM_NAME` — Display name for the agent (default: `Nova`)

Frontend: `VITE_API_URL` (backend URL)

## Development Workflow

All changes must be **atomic** and **methodological**. One logical change per unit of work.

### Principles

- **DRY** — Don't Repeat Yourself; extract shared logic, avoid copy-paste
- **Single Responsibility** — each function, file, and module does one thing well
- **Clean Code** — meaningful names, small functions, no dead code, no magic numbers
- **YAGNI** — don't build what isn't needed yet
- **Separation of Concerns** — keep layers distinct (routes, services, data)

Every change follows this flow:

1. **Code** — make one atomic, focused change
2. **Lint** — backend: `uv run ruff check . && uv run ruff format --check .` / frontend: `bun run lint`
3. **Type-check** — backend: `uv run mypy .` / frontend: `bunx tsc --noEmit`
4. **Test** — backend: `uv run pytest` / frontend: `bun test`
5. **Commit** — one commit per logical change (see commit conventions below)

Do not skip steps. Do not batch unrelated changes into a single commit. If lint, type-check, or tests fail, fix before committing.

## Git Commit Conventions

Follow Angular conventional commit format:

- **Format:** `<type>(<scope>): <subject>`
- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **Scope:** optional, e.g. `chat`, `rag`, `dashboard`, `widget`, `api`, `tools`
- **Subject:** imperative mood, lowercase, no period at end, max 50 chars
- **Body:** use bullet points to explain what and why
  - Each bullet starts with `-`
  - Wrap at 72 characters
- **Breaking changes:** add `BREAKING CHANGE:` in the footer
- **No AI attribution:** do not include `Co-Authored-By` or any AI/Claude attribution lines

### Examples

```
feat(rag): add document chunking with overlap

- Chunk knowledge base files into 300-500 token segments
- Use 50-token overlap to preserve context across boundaries
- Store chunks in ChromaDB collection on startup
```

```
fix(chat): handle empty SSE stream without crashing

- Check for empty response before parsing SSE events
- Add fallback error message when stream closes unexpectedly
```
