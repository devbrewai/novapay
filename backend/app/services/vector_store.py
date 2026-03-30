import chromadb


def get_collection(collection_name: str = "novapay_kb") -> chromadb.Collection:
    """Initialize Chromadb client and get or create a collection."""
    client = chromadb.PersistentClient(path="./chroma_data")
    collection = client.get_or_create_collection(name=collection_name)
    return collection


def store_chunks(
    collection: chromadb.Collection,
    chunks: list[dict[str, object]],
    embeddings: list[list[float]],
) -> None:
    """Add chunks to Chromadb collection."""
    ids = [str(chunk["id"]) for chunk in chunks]
    documents = [str(chunk["text"]) for chunk in chunks]
    metadatas = [
        {"source": chunk["source"], "category": chunk["category"]} for chunk in chunks
    ]
    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,  # type: ignore[arg-type]
        metadatas=metadatas,  # type: ignore[arg-type]
    )


def search(
    collection: chromadb.Collection, query_vector: list[float], n_results: int = 3
) -> chromadb.QueryResult:
    """Query collection with vector and return closest matching chunks."""
    results = collection.query(
        query_embeddings=[query_vector],  # type: ignore[arg-type]
        n_results=n_results,
    )
    return results
