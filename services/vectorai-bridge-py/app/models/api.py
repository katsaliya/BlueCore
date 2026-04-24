from typing import Any
from pydantic import BaseModel, Field

class InitRequest(BaseModel):
    namespace: str | None = None

class InitResponse(BaseModel):
    ok: bool
    message: str

class UpsertRecord(BaseModel):
    id: str
    text: str
    metadata: dict[str, Any] | None = None

class UpsertRequest(BaseModel):
    namespace: str | None = None
    records: list[UpsertRecord] = Field(min_length=1)

class UpsertResponse(BaseModel):
    ok: bool
    insertedCount: int
    message: str

class QueryRequest(BaseModel):
    namespace: str | None = None
    text: str
    topK: int = 5

class QueryMatch(BaseModel):
    id: str
    score: float
    text: str
    metadata: dict[str, Any] | None = None

class QueryResponse(BaseModel):
    ok: bool
    matches: list[QueryMatch]
    message: str