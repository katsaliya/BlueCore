import requests
from app.config.settings import OLLAMA_BASE_URL, OLLAMA_EMBED_MODEL

def embed_text(text: str) -> list[float]:
    response = requests.post(
        f"{OLLAMA_BASE_URL}/api/embed",
        json={
            "model": OLLAMA_EMBED_MODEL,
            "input": text,
        },
        timeout=60,
    )
    response.raise_for_status()

    data = response.json()
    embeddings = data.get("embeddings")

    if not embeddings or not isinstance(embeddings, list):
        raise ValueError("Ollama did not return embeddings")

    vector = embeddings[0]

    if not isinstance(vector, list) or not vector:
        raise ValueError("Ollama returned invalid embedding vector")

    return [float(x) for x in vector]