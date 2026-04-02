from app.types import RetrievalResult


def format_context(results: list[RetrievalResult]) -> str:
    """Format retrieval results into context blocks for the LLM prompt."""
    if not results:
        return ""

    blocks = []
    for result in results:
        blocks.append(f"[Source: {result['source']}]\n{result['text']}")

    return "\n\n".join(blocks)
