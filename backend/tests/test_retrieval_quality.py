"""Integration tests for RAG retrieval quality.

These tests run the full pipeline (embed query → search ChromaDB → filter)
against the actual knowledge base. They require:
- OPENAI_API_KEY set in environment
- ChromaDB collection populated (run ingestion first)

Run with: pytest -m integration
Skip with: pytest -m 'not integration'
"""

import pytest
from chromadb import Collection
from openai import OpenAI

from app.config import settings
from app.services.embedding import get_openai_client
from app.services.ingestion import ingest
from app.services.retrieval import retrieve
from app.services.vector_store import get_collection

requires_openai = pytest.mark.skipif(
    not settings.openai_api_key,
    reason="OPENAI_API_KEY not set",
)

pytestmark = [pytest.mark.integration, requires_openai]

# Query → expected source file(s) that should appear in top results
QUERY_SOURCE_PAIRS = [
    ("What is the international transfer fee?", ["transfer-fees.md"]),
    ("How do I open a new account?", ["account-opening.md"]),
    ("How do I close my account?", ["account-closing.md"]),
    ("What types of accounts are available?", ["account-types.md"]),
    ("How do I set up two-factor authentication?", ["security-2fa.md"]),
    ("How do I report fraud?", ["security-fraud-reporting.md"]),
    ("How do I replace my card?", ["card-replacement.md"]),
    ("How do I set up direct deposit?", ["feature-direct-deposit.md"]),
    ("How do I dispute a transaction?", ["transaction-disputes.md"]),
    ("What are the transfer limits?", ["transfer-limits.md"]),
    ("How do I get a virtual card?", ["card-virtual.md"]),
    ("How do I set up bill pay?", ["feature-bill-pay.md"]),
]


@pytest.fixture(scope="module")
def openai_client() -> OpenAI:
    return get_openai_client()


@pytest.fixture(scope="module")
def collection(openai_client: OpenAI) -> Collection:
    coll = get_collection("nova_kb_test")
    if coll.count() == 0:
        ingest(openai_client, coll)
    return coll


@pytest.mark.parametrize(
    ("query", "expected_sources"),
    QUERY_SOURCE_PAIRS,
    ids=[q for q, _ in QUERY_SOURCE_PAIRS],
)
def test_retrieval_returns_expected_source(
    query: str,
    expected_sources: list[str],
    openai_client: OpenAI,
    collection: Collection,
) -> None:
    results = retrieve(query, openai_client, collection, n_results=5)

    assert len(results) > 0, f"No results returned for: {query}"

    returned_sources = [r["source"] for r in results]
    for expected in expected_sources:
        assert expected in returned_sources, (
            f"Expected {expected} in results for '{query}', got: {returned_sources}"
        )


@pytest.mark.parametrize(
    ("query", "expected_sources"),
    QUERY_SOURCE_PAIRS,
    ids=[q for q, _ in QUERY_SOURCE_PAIRS],
)
def test_retrieval_distance_within_threshold(
    query: str,
    expected_sources: list[str],
    openai_client: OpenAI,
    collection: Collection,
) -> None:
    results = retrieve(query, openai_client, collection, n_results=5)

    for result in results:
        assert result["distance"] <= 1.5, (
            f"Distance {result['distance']} exceeds threshold for "
            f"'{query}' → {result['source']}"
        )
