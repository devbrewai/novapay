from app.types import Chunk


def estimate_tokens(text: str) -> int:
    """Estimate token count using word-based heuristic."""
    words = text.split()
    word_count = len(words)
    return int(word_count * 1.33)


def split_into_paragraphs(text: str) -> list[str]:
    """Split document text into paragraphs filtering out empty strings."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    return paragraphs


def chunk_paragraphs(paragraphs: list[str], max_tokens: int, overlap: int) -> list[str]:
    """Group paragraphs into chunks within token limit with overlap."""
    current_chunk: list[str] = []
    current_size = 0
    chunks = []

    for paragraph in paragraphs:
        paragraph_tokens = estimate_tokens(paragraph)
        if current_size + paragraph_tokens > max_tokens and len(current_chunk) != 0:
            chunks.append("\n\n".join(current_chunk))
            current_chunk = current_chunk[-overlap:]
            current_size = sum(estimate_tokens(p) for p in current_chunk)

        current_chunk.append(paragraph)
        current_size += paragraph_tokens

    if len(current_chunk) != 0:
        chunks.append("\n\n".join(current_chunk))

    return chunks


def chunk_document(
    doc_id: str, text: str, source: str, category: str, max_tokens: int, overlap: int
) -> list[Chunk]:
    """Group document into chunks."""
    paragraphs = split_into_paragraphs(text)

    if not paragraphs:
        return []

    chunk_texts = chunk_paragraphs(paragraphs, max_tokens, overlap)

    chunks = []

    for i, chunk_text in enumerate(chunk_texts):
        chunk: Chunk = {
            "id": f"{doc_id}-{i:03d}",
            "text": chunk_text,
            "source": source,
            "category": category,
            "chunk_index": i,
        }
        chunks.append(chunk)

    return chunks
