from app.db.collections import ensure_collection
from app.db.embeddings import embed_text
from app.db.vectorai_client import get_client
from app.models.api import QueryMatch

def query_records(namespace: str | None, text: str, top_k: int) -> list[QueryMatch]:
    collection_name = ensure_collection(namespace)
    query_vector = embed_text(text)

    with get_client() as client:
        results = client.points.search(
            collection_name,
            query_vector,
            limit=top_k,
        )

    matches: list[QueryMatch] = []

    for item in results:
        payload = getattr(item, "payload", {}) or {}
        matches.append(
            QueryMatch(
                id=str(getattr(item, "id", "")),
                score=float(getattr(item, "score", 0.0)),
                text=str(payload.get("text", "")),
                metadata=payload.get("metadata", {}),
            )
        )

    return matches