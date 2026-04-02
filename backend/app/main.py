import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import account, chat, health, transactions
from app.services.embedding import get_openai_client
from app.services.ingestion import ingest
from app.services.vector_store import get_collection

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Initialize RAG pipeline on startup."""
    openai_client = get_openai_client()
    collection = get_collection()

    if collection.count() == 0:
        logger.info("Empty collection — running ingestion pipeline")
        ingest(openai_client, collection)
        logger.info("Ingestion complete: %d chunks stored", collection.count())
    else:
        logger.info("Collection already populated: %d chunks", collection.count())

    app.state.openai_client = openai_client
    app.state.collection = collection

    yield


app = FastAPI(title="NovaPay API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(account.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
