import uuid
from actian_vectorai import PointStruct
from app.db.collections import ensure_collection
from app.db.embeddings import embed_text
from app.db.vectorai_client import get_client
from app.models.api import UpsertRecord

def normalize_point_id(raw_id: str) -> str:
    try:
        return str(uuid.UUID(raw_id))
    except ValueError:
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, raw_id))

def upsert_records(namespace: str | None, records: list[UpsertRecord]) -> int:
    collection_name = ensure_collection(namespace)

    points = []
    for record in records:
        vector = embed_text(record.text)
        payload = {
            "text": record.text,
            "metadata": record.metadata or {},
            "original_id": record.id,
        }

        points.append(
            PointStruct(
                id=normalize_point_id(record.id),
                vector=vector,
                payload=payload,
            )
        )

    with get_client() as client:
        client.points.upsert(collection_name, points)

    return len(points)