from app.services.chunker import (
    chunk_document,
    chunk_paragraphs,
    estimate_tokens,
    split_into_paragraphs,
)


def test_estimate_token() -> None:
    result = estimate_tokens("this is estimating the tokens")
    assert result == 6


def test_split_into_paragraphs() -> None:
    text = "pargaph one\n\n\n\nparagraph two\n\nparagraph three"
    result = split_into_paragraphs(text)
    assert len(result) == 3


def test_chunk_paragraphs() -> None:
    paragraphs = [
        "NovaPay offers instant internal transfers between accounts with no fees",
        "Premium account holders receive early direct deposit up to two days faster",
        "All transactions are automatically categorized based on merchant information",
        "Physical cards can be ordered for free from the Cards section of the app",
        "Two factor authentication is required for all account security changes",
    ]
    result = chunk_paragraphs(paragraphs, 20, 1)
    assert len(result) > 1


def test_chunk_document() -> None:
    result = chunk_document(
        "test-doc",
        "NovaPay offers instant internal transfers between accounts with no fees",
        "accounts.md",
        "accounts",
        400,
        1,
    )
    assert result[0]["id"] == "test-doc-000"
    assert result[0]["source"] == "accounts.md"
    assert result[0]["category"] == "accounts"
    assert result[0]["chunk_index"] == 0


def test_chunk_document_empty() -> None:
    result = chunk_document("test-doc", "", "empty.md", "empty", 400, 1)
    assert result == []
