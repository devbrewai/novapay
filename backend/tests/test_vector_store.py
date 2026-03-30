from unittest.mock import Mock, patch

from app.services.vector_store import get_collection, search, store_chunks


def test_get_collection() -> None:
    mock_client = Mock()
    mock_collection = Mock()
    mock_collection.name = "test_kb"
    mock_client.get_or_create_collection.return_value = mock_collection

    with patch("app.services.vector_store.chromadb") as mock_chromadb:
        mock_chromadb.PersistentClient.return_value = mock_client
        result = get_collection("test_kb")

    assert result.name == "test_kb"


def test_store_chunks() -> None:
    mock_collection = Mock()
    chunks = [
        {
            "id": "doc-000",
            "text": "chunk one",
            "source": "doc.md",
            "category": "docs",
            "chunk_index": 0,
        }
    ]
    embeddings = [[0.1, 0.2, 0.3]]

    store_chunks(mock_collection, chunks, embeddings)

    mock_collection.add.assert_called_once_with(
        ids=["doc-000"],
        documents=["chunk one"],
        embeddings=[[0.1, 0.2, 0.3]],
        metadatas=[{"source": "doc.md", "category": "docs"}],
    )


def test_search() -> None:
    mock_collection = Mock()

    query_vector = [0.1, 0.2, 0.3]

    mock_collection.query.return_value = {"documents": [["chunk one"]]}

    search(mock_collection, query_vector, 3)

    mock_collection.query.assert_called_once_with(
        query_embeddings=[[0.1, 0.2, 0.3]],
        n_results=3
    )
