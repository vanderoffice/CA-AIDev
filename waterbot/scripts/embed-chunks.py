#!/usr/bin/env python3
"""
Direct embedding script - bypasses n8n entirely.
Reads chunks.json, generates embeddings via OpenAI, inserts into Postgres.
"""

import json
import os
import sys
from pathlib import Path

# Check for required packages
try:
    import openai
    import psycopg2
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "openai", "psycopg2-binary", "-q"])
    import openai
    import psycopg2

# Configuration
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("ERROR: OPENAI_API_KEY environment variable not set")
    print("Run: export OPENAI_API_KEY='your-key-here'")
    sys.exit(1)

# Database config (Supabase on VPS - postgres database where PostgREST connects)
DB_CONFIG = {
    "host": "100.111.63.3",  # VPS via Tailscale
    "port": 5432,
    "database": "postgres",  # PostgREST connects to this DB
    "user": "postgres",
    "password": "2LofmsGNMYUfgF6bGPoFmdcU6M4"
}

EMBEDDING_MODEL = "text-embedding-3-small"
BATCH_SIZE = 100  # OpenAI allows up to 2048 inputs per request

def load_chunks():
    """Load chunks from JSON file."""
    chunks_path = Path(__file__).parent / "chunks.json"
    with open(chunks_path) as f:
        return json.load(f)

def get_embeddings(texts: list[str], client: openai.OpenAI) -> list[list[float]]:
    """Generate embeddings for a batch of texts."""
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
        dimensions=1536
    )
    return [item.embedding for item in response.data]

def insert_chunks(conn, chunks_with_embeddings: list[dict]):
    """Insert chunks with embeddings into Postgres."""
    with conn.cursor() as cur:
        for chunk in chunks_with_embeddings:
            cur.execute("""
                INSERT INTO public.waterbot_documents (content, metadata, embedding)
                VALUES (%s, %s, %s::vector)
            """, (
                chunk["content"],
                json.dumps(chunk["metadata"]),
                str(chunk["embedding"])
            ))
    conn.commit()

def main():
    print("=== WaterBot Embedding Script ===\n")

    # Load chunks
    print("Loading chunks...")
    chunks = load_chunks()
    print(f"Loaded {len(chunks)} chunks\n")

    # Initialize OpenAI client
    client = openai.OpenAI(api_key=OPENAI_API_KEY)

    # Connect to database
    print("Connecting to database...")
    conn = psycopg2.connect(**DB_CONFIG)
    print("Connected!\n")

    # Check if table already has data
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM public.waterbot_documents")
        existing = cur.fetchone()[0]
        if existing > 0:
            print(f"WARNING: Table already has {existing} rows.")
            response = input("Clear existing data? (y/N): ")
            if response.lower() == 'y':
                cur.execute("TRUNCATE public.waterbot_documents")
                conn.commit()
                print("Table cleared.\n")
            else:
                print("Aborting to prevent duplicates.")
                sys.exit(0)

    # Process in batches
    total = len(chunks)
    processed = 0

    for i in range(0, total, BATCH_SIZE):
        batch = chunks[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

        print(f"Processing batch {batch_num}/{total_batches} ({len(batch)} chunks)...")

        # Extract text for embedding
        texts = [chunk["chunk_text"] for chunk in batch]

        # Generate embeddings
        embeddings = get_embeddings(texts, client)

        # Prepare data for insertion
        chunks_with_embeddings = []
        for chunk, embedding in zip(batch, embeddings):
            chunks_with_embeddings.append({
                "content": chunk["chunk_text"],
                "metadata": {
                    "document_id": chunk["document_id"],
                    "chunk_index": chunk["chunk_index"],
                    "file_name": chunk["file_name"],
                    "file_path": chunk["file_path"],
                    "category": chunk["category"],
                    "subcategory": chunk["subcategory"],
                    "section_title": chunk.get("section_title", ""),
                    "char_count": chunk["char_count"],
                    "collection": "waterbot"
                },
                "embedding": embedding
            })

        # Insert into database
        insert_chunks(conn, chunks_with_embeddings)
        processed += len(batch)
        print(f"  Inserted {processed}/{total} chunks")

    # Verify
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM public.waterbot_documents")
        final_count = cur.fetchone()[0]

    conn.close()

    print(f"\n=== Complete ===")
    print(f"Total chunks embedded: {final_count}")
    print(f"Embedding model: {EMBEDDING_MODEL}")
    print(f"Table: public.waterbot_documents")

if __name__ == "__main__":
    main()
