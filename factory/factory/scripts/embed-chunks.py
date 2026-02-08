#!/usr/bin/env python3
"""
embed-chunks.py

Reusable RAG embedding script for the Government Automation Factory.
Reads chunks JSON (from chunk-knowledge.js), generates OpenAI embeddings,
and inserts into PostgreSQL with pgvector.

All credentials come from environment variables -- zero hardcoded values.

Dependencies: openai, psycopg2-binary
Install: pip install openai psycopg2-binary

Usage:
    python3 embed-chunks.py --chunks chunks.json --schema waterbot --table document_chunks
    python3 embed-chunks.py --chunks chunks.json --schema waterbot --fresh
"""

import argparse
import hashlib
import json
import os
import sys

# ─── Configuration ────────────────────────────────────────────────────────────

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMS = 1536
BATCH_SIZE = 100


def check_dependencies():
    """Check for required packages. Called after arg parsing so --help works."""
    missing = []
    try:
        import openai  # noqa: F401
    except ImportError:
        missing.append("openai")

    try:
        import psycopg2  # noqa: F401
    except ImportError:
        missing.append("psycopg2-binary")

    if missing:
        print(f"ERROR: Missing required packages: {', '.join(missing)}")
        print(f"Install with: pip install {' '.join(missing)}")
        sys.exit(1)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Embed knowledge chunks into PostgreSQL with pgvector.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Environment variables (required):
  DB_HOST          PostgreSQL host
  DB_PASSWORD      PostgreSQL password
  OPENAI_API_KEY   OpenAI API key

Environment variables (optional):
  DB_PORT          PostgreSQL port (default: 5432)
  DB_NAME          Database name (default: postgres)
  DB_USER          Database user (default: postgres)

Examples:
  python3 embed-chunks.py --chunks chunks.json --schema waterbot
  python3 embed-chunks.py --chunks chunks.json --schema bizbot --fresh
  python3 embed-chunks.py --chunks chunks.json --schema waterbot --table custom_table
        """,
    )
    parser.add_argument(
        "--chunks",
        required=True,
        help="Path to chunks JSON file (output of chunk-knowledge.js)",
    )
    parser.add_argument(
        "--schema",
        required=True,
        help="PostgreSQL schema name (e.g., waterbot, bizbot)",
    )
    parser.add_argument(
        "--table",
        default="document_chunks",
        help="Table name (default: document_chunks)",
    )
    parser.add_argument(
        "--fresh",
        action="store_true",
        help="Truncate table before inserting (destructive!)",
    )
    return parser.parse_args()


def check_env_vars():
    """Validate required environment variables exist."""
    required = {
        "DB_HOST": "PostgreSQL host",
        "DB_PASSWORD": "PostgreSQL password",
        "OPENAI_API_KEY": "OpenAI API key",
    }

    missing = []
    for var, description in required.items():
        if not os.environ.get(var):
            missing.append(f"  {var} — {description}")

    if missing:
        print("ERROR: Missing required environment variables:")
        for m in missing:
            print(m)
        print("\nSet them with:")
        print("  export DB_HOST='your-host'")
        print("  export DB_PASSWORD='your-password'")
        print("  export OPENAI_API_KEY='your-key'")
        sys.exit(1)

    return {
        "host": os.environ["DB_HOST"],
        "port": int(os.environ.get("DB_PORT", "5432")),
        "database": os.environ.get("DB_NAME", "postgres"),
        "user": os.environ.get("DB_USER", "postgres"),
        "password": os.environ["DB_PASSWORD"],
    }


def load_chunks(chunks_path):
    """Load chunks from JSON file."""
    if not os.path.exists(chunks_path):
        print(f"ERROR: Chunks file not found: {chunks_path}")
        sys.exit(1)

    with open(chunks_path) as f:
        chunks = json.load(f)

    if not isinstance(chunks, list) or len(chunks) == 0:
        print("ERROR: Chunks file must contain a non-empty JSON array")
        sys.exit(1)

    return chunks


def get_embeddings(texts, client):
    """Generate embeddings for a batch of texts via OpenAI."""
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
        dimensions=EMBEDDING_DIMS,
    )
    return [item.embedding for item in response.data]


def md5_hash(text):
    """Compute MD5 hash of text."""
    return hashlib.md5(text.encode("utf-8")).hexdigest()


def ensure_schema_and_table(conn, schema, table):
    """Create schema, table, and indexes if they don't exist."""
    with conn.cursor() as cur:
        # Ensure pgvector extension
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector")

        # Create schema
        cur.execute(f"CREATE SCHEMA IF NOT EXISTS {schema}")

        # Create table with standard columns
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS {schema}.{table} (
                id SERIAL PRIMARY KEY,
                document_id VARCHAR(255),
                chunk_text TEXT NOT NULL,
                chunk_index INTEGER DEFAULT 0,
                file_name VARCHAR(255),
                file_path VARCHAR(500),
                category VARCHAR(100),
                subcategory VARCHAR(100),
                section_title VARCHAR(255),
                char_count INTEGER,
                content_hash VARCHAR(64),
                embedding vector({EMBEDDING_DIMS}),
                metadata JSONB DEFAULT '{{}}'::jsonb,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)

        # Unique constraint on content_hash for dedup
        cur.execute(f"""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conname = 'uq_{schema}_{table}_content_hash'
                ) THEN
                    ALTER TABLE {schema}.{table}
                        ADD CONSTRAINT uq_{schema}_{table}_content_hash
                        UNIQUE (content_hash);
                END IF;
            END
            $$
        """)

        # HNSW vector index
        index_name = f"idx_{schema}_{table}_embedding"
        cur.execute(f"""
            CREATE INDEX IF NOT EXISTS {index_name}
            ON {schema}.{table}
            USING hnsw (embedding vector_cosine_ops)
            WITH (m=16, ef_construction=64)
        """)

    conn.commit()
    print(f"Schema/table/indexes ensured: {schema}.{table}")


def insert_batch(conn, schema, table, chunks_with_embeddings):
    """Insert a batch of chunks, skipping duplicates by content_hash."""
    inserted = 0
    skipped = 0

    with conn.cursor() as cur:
        for chunk in chunks_with_embeddings:
            try:
                cur.execute(
                    f"""
                    INSERT INTO {schema}.{table}
                        (document_id, chunk_text, chunk_index, file_name, file_path,
                         category, subcategory, section_title, char_count,
                         content_hash, embedding, metadata)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::vector, %s::jsonb)
                    ON CONFLICT (content_hash) DO NOTHING
                    """,
                    (
                        chunk["document_id"],
                        chunk["chunk_text"],
                        chunk["chunk_index"],
                        chunk["file_name"],
                        chunk["file_path"],
                        chunk["category"],
                        chunk.get("subcategory", ""),
                        chunk.get("section_title", ""),
                        chunk["char_count"],
                        chunk["content_hash"],
                        str(chunk["embedding"]),
                        json.dumps(chunk.get("metadata", {})),
                    ),
                )
                if cur.rowcount > 0:
                    inserted += 1
                else:
                    skipped += 1
            except Exception as e:
                print(f"  WARNING: Failed to insert chunk {chunk['document_id']}: {e}")
                conn.rollback()
                skipped += 1

    conn.commit()
    return inserted, skipped


def main():
    args = parse_args()
    check_dependencies()

    import openai  # noqa: E402 — deferred so --help works without deps
    import psycopg2  # noqa: E402

    db_config = check_env_vars()

    print("=== RAG Embedding Script ===\n")
    print(f"Chunks file: {args.chunks}")
    print(f"Target:      {args.schema}.{args.table}")
    if args.fresh:
        print("Mode:        FRESH (truncate first)")
    print()

    # Load chunks
    chunks = load_chunks(args.chunks)
    print(f"Loaded {len(chunks)} chunks\n")

    # Initialize OpenAI client
    client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    # Connect to database
    print("Connecting to database...")
    try:
        conn = psycopg2.connect(**db_config)
        conn.autocommit = False
    except Exception as e:
        print(f"ERROR: Could not connect to database: {e}")
        sys.exit(1)
    print("Connected.\n")

    # Ensure schema and table exist
    ensure_schema_and_table(conn, args.schema, args.table)

    # Handle --fresh flag
    if args.fresh:
        with conn.cursor() as cur:
            cur.execute(f"TRUNCATE {args.schema}.{args.table}")
        conn.commit()
        print(f"Truncated {args.schema}.{args.table}\n")

    # Process in batches
    total = len(chunks)
    total_inserted = 0
    total_skipped = 0
    total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

    for i in range(0, total, BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1

        print(f"Batch {batch_num}/{total_batches} ({len(batch)} chunks)...")

        # Extract text for embedding
        texts = [chunk["chunk_text"] for chunk in batch]

        # Generate embeddings
        try:
            embeddings = get_embeddings(texts, client)
        except Exception as e:
            print(f"  ERROR: Embedding API failed: {e}")
            print("  Skipping this batch.")
            total_skipped += len(batch)
            continue

        # Prepare data for insertion
        chunks_with_embeddings = []
        for chunk, embedding in zip(batch, embeddings):
            # Build metadata from frontmatter + collection
            metadata = {}
            if "frontmatter" in chunk:
                metadata["frontmatter"] = chunk["frontmatter"]
            if "collection" in chunk:
                metadata["collection"] = chunk["collection"]

            chunks_with_embeddings.append(
                {
                    "document_id": chunk["document_id"],
                    "chunk_text": chunk["chunk_text"],
                    "chunk_index": chunk["chunk_index"],
                    "file_name": chunk["file_name"],
                    "file_path": chunk["file_path"],
                    "category": chunk.get("category", ""),
                    "subcategory": chunk.get("subcategory", ""),
                    "section_title": chunk.get("section_title", ""),
                    "char_count": chunk["char_count"],
                    "content_hash": md5_hash(chunk["chunk_text"]),
                    "embedding": embedding,
                    "metadata": metadata,
                }
            )

        # Insert
        inserted, skipped = insert_batch(
            conn, args.schema, args.table, chunks_with_embeddings
        )
        total_inserted += inserted
        total_skipped += skipped
        print(f"  Inserted: {inserted} | Skipped (dups): {skipped}")

    # Final count
    with conn.cursor() as cur:
        cur.execute(f"SELECT COUNT(*) FROM {args.schema}.{args.table}")
        final_count = cur.fetchone()[0]

    conn.close()

    print(f"\n=== Complete ===")
    print(f"Total embedded:     {total_inserted}")
    print(f"Duplicates skipped: {total_skipped}")
    print(f"Total rows in table: {final_count}")
    print(f"Embedding model:    {EMBEDDING_MODEL}")
    print(f"Table:              {args.schema}.{args.table}")


if __name__ == "__main__":
    main()
