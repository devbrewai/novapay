from collections.abc import Iterator
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.fixture()
def client() -> Iterator[TestClient]:
    """Test client with lifespan mocked out (no OpenAI/ChromaDB calls)."""

    @asynccontextmanager
    async def noop_lifespan(app: FastAPI):  # type: ignore[no-untyped-def]
        app.state.openai_client = AsyncMock()
        app.state.collection = AsyncMock()
        yield

    # Import app after defining mock lifespan
    from app.main import app

    app.router.lifespan_context = noop_lifespan
    with TestClient(app) as test_client:
        yield test_client
