from app.db.embeddings import embed_text

def main():
    vector = embed_text("fatigue before shift")
    print("DIMENSION:", len(vector))
    print("FIRST_5:", vector[:5])

if __name__ == "__main__":
    main()