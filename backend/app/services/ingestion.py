from chromadb import Collection
from openai import OpenAI

from app.services.chunker import chunk_document
from app.services.embedding import embed_chunks
from app.services.knowledge_base import load_documents
from app.services.vector_store import store_chunks


def ingest(client: OpenAI, collection: Collection) -> None:
    """Load documents and store in ChromaDB."""

    documents = load_documents()

    chunks = []
    for doc in documents:
        chunk = chunk_document(
            doc_id=doc["id"],
            text=doc["content"],
            source=doc["source"],
            category=doc["category"],
            max_tokens=400,
            overlap=1,
        )
        chunks.extend(chunk)

    embeddings = embed_chunks(chunks, client)

    store_chunks(collection, chunks, embeddings)
