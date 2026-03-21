# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NovaPay is a Devbrew portfolio demo: an AI support agent ("Nova") embedded in a mock neobank dashboard. It targets seed-to-Series-A fintech founders to showcase Devbrew's ability to ship production-quality conversational AI. The full PRD lives in `demo-1-novapay-prd.md`.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (Bun as package manager/runtime)
- **Backend:** Python 3.11+ + FastAPI
- **LLM:** Anthropic Claude 3.5 Sonnet (primary), OpenAI GPT-4o-mini (fallback)
- **Embeddings:** OpenAI text-embedding-3-small
- **Vector DB:** ChromaDB (self-hosted)
- **Streaming:** Server-Sent Events (SSE)
- **Deployment:** Vercel/Cloudflare Pages (frontend), Render (backend + ChromaDB)

## Architecture

```
React Frontend
├── Mock NovaPay Dashboard (sidebar nav, account summary, transactions list)
└── Chat Widget (slide-out side panel, "Ask Nova")
        │ SSE
FastAPI Backend
├── POST /api/chat         → conversation endpoint (SSE streaming)
│   ├── Conversation Manager (in-memory, 20-msg sliding window, 30-min TTL)
│   ├── RAG Pipeline
│   │   ├── Query embedding (text-embedding-3-small)
│   │   ├── ChromaDB vector search (top 3-5 chunks)
│   │   └── Context injection into LLM prompt
│   ├── Tool Router
│   │   ├── transaction_lookup(query)
│   │   ├── account_info()
│   │   └── escalate_to_human(reason)
│   └── LLM (Claude/GPT-4o-mini with streaming)
├── GET  /api/transactions  → mock transaction data
├── GET  /api/account       → mock user profile
└── GET  /api/health        → status check
```

The RAG pipeline ingests ~30-40 knowledge base markdown files from `data/knowledge_base/` on startup: chunk → embed → store in ChromaDB collection "novapay_kb". Per query: embed → search → inject top chunks as context → stream LLM response.

## Key Design Decisions

- **Demo user is hardcoded** — no auth. User profile: "Alex Rivera", Premium account, balance $12,847.32.
- **No persistence** — conversations are in-memory, reset on reload/restart is fine.
- **Chat is a side panel**, not a floating bubble — slides in from the right, overlays 40% width on desktop, fullscreen on mobile.
- **Dark mode preferred** — near-black `#0A0A0A` primary, accent blue or emerald.
- **Agent persona "Nova"** — friendly, professional, concise, uses first name, never reveals it's a demo.
- **Responses must stay under 100 words** unless explaining a multi-step process.
- **Escalation triggers:** account closures, complex disputes, unresolvable after 2 attempts.

## What NOT to Build

User auth, real payments, admin panel, multiple users, DB persistence, notifications, cross-reload chat history, voice support, file uploads.

## Environment Variables

Backend: `ANTHROPIC_API_KEY`, `CHROMA_PERSIST_DIR` (default `./chroma_data`), `CORS_ORIGINS`, `LOG_LEVEL`
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
2. **Lint** — backend: `ruff check . && ruff format --check .` / frontend: `bun run lint`
3. **Type-check** — backend: `mypy .` / frontend: `bunx tsc --noEmit`
4. **Test** — backend: `pytest` / frontend: `bun test`
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
