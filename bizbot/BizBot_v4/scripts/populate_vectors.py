#!/usr/bin/env python3
"""
BizBot v4 - Vector Database Population Script

Embeds research documents from BizAssessment and stores in PostgreSQL pgvector.

Usage:
    python populate_vectors.py --dry-run    # Preview without inserting
    python populate_vectors.py              # Full population

Requirements:
    pip install openai psycopg2-binary tiktoken
"""

import os
import sys
import hashlib
import argparse
from pathlib import Path
from typing import List, Dict, Tuple

try:
    import openai
    import psycopg2
    from psycopg2.extras import execute_values
    import tiktoken
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with: pip install openai psycopg2-binary tiktoken")
    sys.exit(1)

# Configuration
BIZASSESSMENT_PATH = Path(__file__).parent.parent.parent / "BizAssessment"
EMBEDDING_MODEL = "text-embedding-ada-002"
MAX_CHUNK_TOKENS = 500
CHUNK_OVERLAP_TOKENS = 50

# Topic mapping from folder names
TOPIC_MAP = {
    "01_Entity_Formation": "entity",
    "02_State_Registration": "state",
    "03_Local_Licensing": "local",
    "04_Industry_Requirements": "industry",
    "05_Environmental_Compliance": "environmental",
    "06_Renewal_Compliance": "renewal",
    "07_Special_Situations": "special",
}

# Industry keywords for tagging
INDUSTRY_KEYWORDS = {
    "food": ["restaurant", "food truck", "catering", "food service", "health permit"],
    "retail": ["retail", "seller's permit", "tobacco", "firearms"],
    "construction": ["cslb", "contractor", "building permit", "construction"],
    "cannabis": ["cannabis", "dcc", "marijuana", "cultivation", "dispensary"],
    "alcohol": ["abc", "alcohol", "liquor", "beer", "wine", "bar"],
    "healthcare": ["medical", "nursing", "pharmacy", "dental", "healthcare"],
    "professional": ["dca", "accountant", "attorney", "real estate", "insurance"],
}

# Agency keywords for tagging
AGENCY_KEYWORDS = {
    "SOS": ["secretary of state", "bizfile", "articles of"],
    "FTB": ["franchise tax board", "ftb", "state income tax"],
    "EDD": ["employment development", "edd", "payroll tax", "employer account"],
    "CDTFA": ["cdtfa", "sales tax", "seller's permit", "tax and fee"],
    "CSLB": ["cslb", "contractor license", "contractors state"],
    "ABC": ["abc", "alcoholic beverage", "liquor license"],
    "DCC": ["dcc", "cannabis control", "cannabis license"],
    "DCA": ["dca", "consumer affairs", "professional license"],
}


def get_db_connection():
    """Get PostgreSQL connection."""
    return psycopg2.connect(
        host=os.environ.get("PGHOST", "192.168.0.100"),
        port=os.environ.get("PGPORT", "5432"),
        database=os.environ.get("PGDATABASE", "bizbot"),
        user=os.environ.get("PGUSER", "commandervander"),
        password=os.environ.get("PGPASSWORD", ""),
    )


def get_openai_client():
    """Get OpenAI client."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable required")
    return openai.OpenAI(api_key=api_key)


def count_tokens(text: str) -> int:
    """Count tokens in text using tiktoken."""
    enc = tiktoken.encoding_for_model(EMBEDDING_MODEL)
    return len(enc.encode(text))


def chunk_text(text: str, max_tokens: int = MAX_CHUNK_TOKENS) -> List[str]:
    """Split text into chunks respecting token limits."""
    enc = tiktoken.encoding_for_model(EMBEDDING_MODEL)
    tokens = enc.encode(text)

    chunks = []
    start = 0

    while start < len(tokens):
        end = min(start + max_tokens, len(tokens))
        chunk_tokens = tokens[start:end]
        chunk_text = enc.decode(chunk_tokens)

        # Try to break at paragraph or sentence boundary
        if end < len(tokens):
            # Look for paragraph break
            para_break = chunk_text.rfind('\n\n')
            if para_break > len(chunk_text) // 2:
                chunk_text = chunk_text[:para_break]
                end = start + len(enc.encode(chunk_text))
            else:
                # Look for sentence break
                sent_break = max(
                    chunk_text.rfind('. '),
                    chunk_text.rfind('.\n'),
                )
                if sent_break > len(chunk_text) // 2:
                    chunk_text = chunk_text[:sent_break + 1]
                    end = start + len(enc.encode(chunk_text))

        chunks.append(chunk_text.strip())
        start = end - CHUNK_OVERLAP_TOKENS if end < len(tokens) else end

    return [c for c in chunks if c]


def extract_metadata(text: str, filepath: str) -> Dict:
    """Extract metadata tags from content."""
    text_lower = text.lower()
    filepath_lower = filepath.lower()

    # Detect industries
    industries = []
    for industry, keywords in INDUSTRY_KEYWORDS.items():
        if any(kw in text_lower or kw in filepath_lower for kw in keywords):
            industries.append(industry)

    # Detect agencies
    agencies = []
    for agency, keywords in AGENCY_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            agencies.append(agency)

    # Detect cities (common ones)
    cities = []
    common_cities = ["los angeles", "san francisco", "san diego", "oakland", "sacramento"]
    for city in common_cities:
        if city in text_lower:
            cities.append(city.title())

    # Detect counties
    counties = []
    common_counties = ["los angeles", "san diego", "orange", "alameda", "santa clara"]
    for county in common_counties:
        if f"{county} county" in text_lower:
            counties.append(county.title())

    return {
        "industries": industries,
        "agencies": agencies,
        "cities": cities,
        "counties": counties,
    }


def get_topic_from_path(filepath: Path) -> str:
    """Determine topic from file path."""
    parts = filepath.parts
    for folder, topic in TOPIC_MAP.items():
        if folder in parts:
            return topic
    return "industry"  # Default for guides in industry subfolders


def get_chunk_level(chunk_text: str, chunk_index: int, total_chunks: int) -> str:
    """Determine hierarchical chunk level."""
    if total_chunks == 1:
        return "document"
    if chunk_index == 0 and len(chunk_text) > 1000:
        return "section"
    return "paragraph"


def find_markdown_files(base_path: Path) -> List[Path]:
    """Find all markdown files to process."""
    files = []

    # Priority folders
    priority_folders = [
        "01_Entity_Formation",
        "02_State_Registration",
        "03_Local_Licensing",
        "04_Industry_Requirements",
        "05_Environmental_Compliance",
        "06_Renewal_Compliance",
        "07_Special_Situations",
    ]

    for folder in priority_folders:
        folder_path = base_path / folder
        if folder_path.exists():
            files.extend(folder_path.rglob("*.md"))

    # Also include root-level important files
    root_files = ["BizInterviews_SmallBiz_Def.md"]
    for fname in root_files:
        fpath = base_path / fname
        if fpath.exists():
            files.append(fpath)

    return files


def embed_texts(client: openai.OpenAI, texts: List[str]) -> List[List[float]]:
    """Batch embed texts."""
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
    )
    return [item.embedding for item in response.data]


def main():
    parser = argparse.ArgumentParser(description="Populate BizBot vector database")
    parser.add_argument("--dry-run", action="store_true", help="Preview without inserting")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    args = parser.parse_args()

    print(f"BizBot v4 Vector Population")
    print(f"Source: {BIZASSESSMENT_PATH}")
    print(f"Dry run: {args.dry_run}")
    print()

    # Find files
    files = find_markdown_files(BIZASSESSMENT_PATH)
    print(f"Found {len(files)} markdown files")

    # Process files
    all_chunks = []

    for filepath in files:
        rel_path = filepath.relative_to(BIZASSESSMENT_PATH)

        try:
            content = filepath.read_text(encoding="utf-8")
        except Exception as e:
            print(f"  Error reading {rel_path}: {e}")
            continue

        # Skip very short files
        if len(content) < 100:
            continue

        # Chunk the content
        chunks = chunk_text(content)
        topic = get_topic_from_path(filepath)

        for i, chunk in enumerate(chunks):
            metadata = extract_metadata(chunk, str(filepath))
            chunk_level = get_chunk_level(chunk, i, len(chunks))

            all_chunks.append({
                "content": chunk,
                "source_file": str(rel_path),
                "topic": topic,
                "chunk_index": i,
                "chunk_level": chunk_level,
                **metadata,
            })

        if args.verbose:
            print(f"  {rel_path}: {len(chunks)} chunks")

    print(f"\nTotal chunks: {len(all_chunks)}")

    if args.dry_run:
        print("\nDry run - not inserting to database")
        # Show sample chunks
        for chunk in all_chunks[:3]:
            print(f"\n--- Sample chunk ---")
            print(f"Source: {chunk['source_file']}")
            print(f"Topic: {chunk['topic']}")
            print(f"Level: {chunk['chunk_level']}")
            print(f"Industries: {chunk['industries']}")
            print(f"Agencies: {chunk['agencies']}")
            print(f"Content preview: {chunk['content'][:200]}...")
        return

    # Generate embeddings
    print("\nGenerating embeddings...")
    client = get_openai_client()

    batch_size = 100
    for i in range(0, len(all_chunks), batch_size):
        batch = all_chunks[i:i+batch_size]
        texts = [c["content"] for c in batch]
        embeddings = embed_texts(client, texts)

        for chunk, embedding in zip(batch, embeddings):
            chunk["embedding"] = embedding

        print(f"  Embedded {min(i+batch_size, len(all_chunks))}/{len(all_chunks)}")

    # Insert to database
    print("\nInserting to database...")
    conn = get_db_connection()
    cur = conn.cursor()

    # Clear existing data (optional - comment out to append)
    cur.execute("TRUNCATE bizbot_chunks RESTART IDENTITY")

    # Insert chunks
    insert_sql = """
        INSERT INTO bizbot_chunks (
            content, embedding, source_file, topic, chunk_index, chunk_level,
            industries, agencies, cities, counties, verification_status
        ) VALUES %s
        ON CONFLICT (content_hash) DO UPDATE SET
            embedding = EXCLUDED.embedding,
            updated_at = NOW()
    """

    values = [
        (
            c["content"],
            c["embedding"],
            c["source_file"],
            c["topic"],
            c["chunk_index"],
            c["chunk_level"],
            c["industries"],
            c["agencies"],
            c["cities"],
            c["counties"],
            "pending",
        )
        for c in all_chunks
    ]

    execute_values(cur, insert_sql, values, template="""(
        %s, %s::vector, %s, %s, %s, %s, %s, %s, %s, %s, %s
    )""")

    conn.commit()
    cur.close()
    conn.close()

    print(f"\nInserted {len(all_chunks)} chunks to bizbot_chunks")
    print("Done!")


if __name__ == "__main__":
    main()
