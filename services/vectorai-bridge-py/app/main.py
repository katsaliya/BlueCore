import socket
from fastapi import FastAPI, HTTPException

from app.config.settings import HOST, PORT, VECTORAI_HOST, VECTORAI_PORT
from app.db.collections import ensure_collection
from app.db.points import upsert_records
from app.db.query import query_records
from app.models.api import (
    InitRequest,
    InitResponse,
    UpsertRequest,
    UpsertResponse,
    QueryRequest,
    QueryResponse,
)

app = FastAPI(title="GreenWatch VectorAI Python Bridge")


def check_tcp(host: str, port: int, timeout: float = 2.0) -> bool:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        sock.connect((host, port))
        return True
    except OSError:
        return False
    finally:
        sock.close()


@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "greenwatch-vectorai-bridge-py",
        "host": HOST,
        "port": PORT,
    }


@app.get("/health/vectorai")
def health_vectorai():
    ok = check_tcp(VECTORAI_HOST, VECTORAI_PORT)
    return {
        "ok": ok,
        "vectorai_host": VECTORAI_HOST,
        "vectorai_port": VECTORAI_PORT,
    }


@app.get("/debug/ping")
def debug_ping():
    return {
        "ok": True,
        "message": "python bridge reachable",
    }


@app.post("/init", response_model=InitResponse)
def init_vectorai(request: InitRequest):
    try:
        collection_name = ensure_collection(request.namespace)
        return InitResponse(
            ok=True,
            message=f"Initialized collection: {collection_name}",
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/upsert", response_model=UpsertResponse)
def upsert_vectorai(request: UpsertRequest):
    try:
        inserted_count = upsert_records(request.namespace, request.records)
        return UpsertResponse(
            ok=True,
            insertedCount=inserted_count,
            message="Records stored in real VectorAI DB",
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/query", response_model=QueryResponse)
def query_vectorai(request: QueryRequest):
    try:
        matches = query_records(request.namespace, request.text, request.topK)
        return QueryResponse(
            ok=True,
            matches=matches,
            message="Query served from real VectorAI DB",
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))