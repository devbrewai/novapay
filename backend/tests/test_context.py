from app.services.context import format_context
from app.types import RetrievalResult


def test_format_context_empty_results() -> None:
    assert format_context([]) == ""


def test_format_context_single_result() -> None:
    results: list[RetrievalResult] = [
        {"text": "Transfer fees are $5.", "source": "transfer-fees.md", "distance": 0.3}
    ]

    output = format_context(results)

    assert output == "[Source: transfer-fees.md]\nTransfer fees are $5."


def test_format_context_multiple_results() -> None:
    results: list[RetrievalResult] = [
        {"text": "Chunk one.", "source": "a.md", "distance": 0.2},
        {"text": "Chunk two.", "source": "b.md", "distance": 0.5},
    ]

    output = format_context(results)

    assert "[Source: a.md]\nChunk one." in output
    assert "[Source: b.md]\nChunk two." in output
    assert output.count("\n\n") == 1
