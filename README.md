# Nova

AI-powered customer support agent embedded in a neobank dashboard. Built by [Devbrew](https://devbrew.ai).

## Tech stack

| Layer      | Technology                                          |
| ---------- | --------------------------------------------------- |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend    | Python 3.11+, FastAPI                               |
| LLM        | Claude 3.5 Sonnet (primary), GPT-4o-mini (fallback) |
| Embeddings | OpenAI text-embedding-3-small                       |
| Vector DB  | ChromaDB                                            |
| Streaming  | Server-Sent Events (SSE)                            |

## Architecture

```
React Frontend
├── Nova Dashboard (sidebar, account summary, transactions)
└── Chat Widget ("Ask Nova" — slide-out side panel)
        │ SSE
FastAPI Backend
├── POST /api/chat         → conversation (SSE streaming)
├── GET  /api/transactions → mock transaction data
├── GET  /api/account      → mock user profile
└── GET  /api/health       → status check
```

## Quick start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
bun install
bun run dev
```

## Environment variables

| Variable             | Where    | Description                                      |
| -------------------- | -------- | ------------------------------------------------ |
| `ANTHROPIC_API_KEY`  | Backend  | Claude API key                                   |
| `CHROMA_PERSIST_DIR` | Backend  | ChromaDB storage path (default: `./chroma_data`) |
| `CORS_ORIGINS`       | Backend  | Allowed origins (comma-separated)                |
| `LOG_LEVEL`          | Backend  | Logging level (default: `INFO`)                  |
| `VITE_API_URL`       | Frontend | Backend URL                                      |

## License

[MIT](LICENSE)
