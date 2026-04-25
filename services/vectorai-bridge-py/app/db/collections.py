from actian_vectorai import VectorParams, Distance
from app.config.settings import DEFAULT_COLLECTION, VECTOR_SIZE
from app.db.vectorai_client import get_client

def ensure_collection(collection_name: str | None = None) -> str:
    target = collection_name or DEFAULT_COLLECTION

    with get_client() as client:
        if not client.collections.exists(target):
            client.collections.create(
                target,
                vectors_config=VectorParams(
                    size=VECTOR_SIZE,
                    distance=Distance.Cosine,
                ),
            )

    return target