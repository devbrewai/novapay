from unittest.mock import Mock, patch

from app.services.ingestion import ingest


@patch("app.services.ingestion.store_chunks")
@patch("app.services.ingestion.embed_chunks")
@patch("app.services.ingestion.chunk_document")
@patch("app.services.ingestion.load_documents")
def test_ingestion(
    mock_load: Mock, mock_chunk: Mock, mock_embed: Mock, mock_store: Mock
) -> None:
    mock_load.return_value = [
        {
            "id": "test-1",
            "source": "test-1.md",
            "content": "some text",
            "category": "test",
        },
    ]

    mock_chunk.return_value = [
        {
            "id": "test-1-000",
            "text": "some text",
            "source": "test-1.md",
            "category": "test",
            "chunk_index": 0,
        },
    ]

    mock_embed.return_value = [[0.1, 0.2, 0.3]]

    mock_client = Mock()
    mock_collection = Mock()

    ingest(mock_client, mock_collection)

    mock_load.assert_called_once()
    mock_chunk.assert_called_once()
    mock_embed.assert_called_once()
    mock_store.assert_called_once()
