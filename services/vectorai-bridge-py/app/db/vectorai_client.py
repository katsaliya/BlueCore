from actian_vectorai import VectorAIClient
from app.config.settings import VECTORAI_ADDRESS

def get_client() -> VectorAIClient:
    return VectorAIClient(VECTORAI_ADDRESS)