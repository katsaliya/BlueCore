import os
from dotenv import load_dotenv

load_dotenv()

HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "50054"))

VECTORAI_HOST = os.getenv("VECTORAI_HOST", "127.0.0.1")
VECTORAI_PORT = int(os.getenv("VECTORAI_PORT", "50053"))
VECTORAI_ADDRESS = f"{VECTORAI_HOST}:{VECTORAI_PORT}"

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "embeddinggemma:latest")

DEFAULT_COLLECTION = os.getenv("DEFAULT_COLLECTION", "greenwatch_messages")
VECTOR_SIZE = int(os.getenv("VECTOR_SIZE", "768"))