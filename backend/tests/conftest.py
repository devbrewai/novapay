from collections.abc import Iterator
from contextlib import asynccontextmanager
from datetime import timedelta
from unittest.mock import Mock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.services.conversation import ConversationManager
from app.services.rate_limiter import RateLimiter


@pytest.fixture()
def client() -> Iterator[TestClient]:
    """Test client with lifespan mocked out (no external API calls)."""

    @asynccontextmanager
    async def noop_lifespan(app: FastAPI):  # type: ignore[no-untyped-def]
        app.state.openai_client = Mock()
        app.state.collection = Mock()
        app.state.anthropic_client = Mock()
        app.state.conversation_manager = ConversationManager()
        app.state.rate_limiter = RateLimiter(limit=100, window=timedelta(hours=1))
        yield

    from app.main import app

    app.router.lifespan_context = noop_lifespan
    with TestClient(app) as test_client:
        yield test_client
