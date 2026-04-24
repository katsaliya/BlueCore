from actian_vectorai import VectorAIClient

def main():
    with VectorAIClient("localhost:50053") as client:
        collections = client.collections.list()
        print("COLLECTIONS:")
        print(collections)
        print("-" * 50)

        for name in collections:
            print(f"COLLECTION: {name}")
            info = client.collections.get_info(name)
            print(info)
            print("-" * 50)

if __name__ == "__main__":
    main()