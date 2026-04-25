from actian_vectorai import (
    VectorAIClient,
    VectorParams,
    Distance,
    PointStruct,
)

def main():
    with VectorAIClient("localhost:50053") as client:
        info = client.health_check()
        print("HEALTH:", info)

        collection_name = "greenwatch_test"

        if not client.collections.exists(collection_name):
            client.collections.create(
                collection_name,
                vectors_config=VectorParams(size=4, distance=Distance.Cosine),
            )
            print(f"Created collection '{collection_name}'")

        client.points.upsert(
            collection_name,
            [
                PointStruct(
                    id=1,
                    vector=[0.1, 0.2, 0.3, 0.4],
                    payload={
                        "text": "I feel tired before my shift",
                        "source": "smoke-test",
                    },
                )
            ],
        )
        print("UPSERT OK")

        collection_info = client.collections.get_info(collection_name)
        print("COLLECTION INFO:", collection_info)

if __name__ == "__main__":
    main()