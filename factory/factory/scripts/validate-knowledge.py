#!/usr/bin/env python3
"""
validate-knowledge.py

RAG Quality Gate validation for the Government Automation Factory.
Runs 6 checks against a schema.table to verify knowledge base integrity.

Checks:
  1. Dedup check — no duplicate chunk_text rows
  2. NULL embedding check — all rows have embeddings
  3. Embedding dimension check — all embeddings are 1536 dims
  4. Chunk size distribution — flag outliers (>3000 or <50 chars)
  5. URL validation — HTTP HEAD on extracted URLs (stdlib only)
  6. Content hash integrity — stored hash matches md5(chunk_text)

Dependencies: psycopg2-binary
Install: pip install psycopg2-binary

Usage:
    python3 validate-knowledge.py --schema waterbot --table document_chunks
    python3 validate-knowledge.py --schema waterbot --skip-urls
"""

import argparse
import hashlib
import os
import re
import statistics
import sys
import urllib.request
import urllib.error
import ssl

# ─── Configuration ────────────────────────────────────────────────────────────

EXPECTED_DIMS = 1536
URL_TIMEOUT = 10  # seconds
MAX_AUTO_URL_CHECK = 100  # Skip URL check if more unique URLs than this


def check_dependencies():
    """Check for required packages. Called after arg parsing so --help works."""
    try:
        import psycopg2  # noqa: F401
    except ImportError:
        print("ERROR: Missing required package: psycopg2-binary")
        print("Install with: pip install psycopg2-binary")
        sys.exit(1)


def parse_args():
    parser = argparse.ArgumentParser(
        description="RAG Quality Gate: validate knowledge base integrity.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Environment variables (required):
  DB_HOST          PostgreSQL host
  DB_PASSWORD      PostgreSQL password

Environment variables (optional):
  DB_PORT          PostgreSQL port (default: 5432)
  DB_NAME          Database name (default: postgres)
  DB_USER          Database user (default: postgres)

Checks performed:
  1. Dedup check        — no duplicate chunk_text rows
  2. NULL embeddings    — all rows have embeddings
  3. Embedding dims     — all embeddings are 1536 dimensions
  4. Chunk size stats   — flag outliers (>3000 or <50 chars)
  5. URL validation     — HTTP HEAD on extracted URLs
  6. Content hash       — stored hash matches md5(chunk_text)

Exit code 0 if all PASS/WARN. Exit code 1 if any FAIL.

Examples:
  python3 validate-knowledge.py --schema waterbot
  python3 validate-knowledge.py --schema bizbot --skip-urls
  python3 validate-knowledge.py --schema waterbot --table custom_table
        """,
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
        "--skip-urls",
        action="store_true",
        help="Skip URL validation check",
    )
    return parser.parse_args()


def check_env_vars():
    """Validate required environment variables."""
    required = {
        "DB_HOST": "PostgreSQL host",
        "DB_PASSWORD": "PostgreSQL password",
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
        sys.exit(1)

    return {
        "host": os.environ["DB_HOST"],
        "port": int(os.environ.get("DB_PORT", "5432")),
        "database": os.environ.get("DB_NAME", "postgres"),
        "user": os.environ.get("DB_USER", "postgres"),
        "password": os.environ["DB_PASSWORD"],
    }


# ─── Checks ──────────────────────────────────────────────────────────────────

def check_dedup(cur, schema, table):
    """Check 1: No duplicate chunk_text rows."""
    cur.execute(f"""
        SELECT COUNT(*) - COUNT(DISTINCT md5(chunk_text))
        FROM {schema}.{table}
    """)
    dupes = cur.fetchone()[0]

    if dupes == 0:
        return "PASS", f"Dedup check: 0 duplicates"
    else:
        return "FAIL", f"Dedup check: {dupes} duplicate(s) found"


def check_null_embeddings(cur, schema, table):
    """Check 2: No NULL embeddings."""
    cur.execute(f"""
        SELECT COUNT(*) FROM {schema}.{table} WHERE embedding IS NULL
    """)
    nulls = cur.fetchone()[0]

    if nulls == 0:
        return "PASS", f"NULL embeddings: 0 found"
    else:
        return "FAIL", f"NULL embeddings: {nulls} found"


def check_embedding_dims(cur, schema, table):
    """Check 3: All embeddings are EXPECTED_DIMS dimensions."""
    cur.execute(f"""
        SELECT COUNT(*) FROM {schema}.{table}
        WHERE embedding IS NOT NULL
          AND vector_dims(embedding) != {EXPECTED_DIMS}
    """)
    wrong_dims = cur.fetchone()[0]

    if wrong_dims == 0:
        return "PASS", f"Embedding dimensions: all {EXPECTED_DIMS}"
    else:
        return "FAIL", f"Embedding dimensions: {wrong_dims} rows have wrong dimensions"


def check_chunk_sizes(cur, schema, table):
    """Check 4: Chunk size distribution with outlier flagging."""
    cur.execute(f"""
        SELECT char_count FROM {schema}.{table}
        WHERE char_count IS NOT NULL
        ORDER BY char_count
    """)
    sizes = [row[0] for row in cur.fetchall()]

    if not sizes:
        return "WARN", "Chunk sizes: no char_count data"

    min_size = min(sizes)
    max_size = max(sizes)
    avg_size = int(statistics.mean(sizes))
    median_size = int(statistics.median(sizes))

    details = f"Chunk sizes: min={min_size}, max={max_size}, avg={avg_size}, median={median_size}"

    too_large = sum(1 for s in sizes if s > 3000)
    too_small = sum(1 for s in sizes if s < 50)

    warnings = []
    if too_large > 0:
        warnings.append(f"{too_large} chunks >3000 chars")
    if too_small > 0:
        warnings.append(f"{too_small} chunks <50 chars")

    if warnings:
        return "WARN", f"{details} ({'; '.join(warnings)})"
    else:
        return "INFO", details


def check_urls(cur, schema, table, skip=False):
    """Check 5: Validate URLs found in chunk_text."""
    if skip:
        return "INFO", "URL check: skipped (--skip-urls)"

    # Extract all chunk texts
    cur.execute(f"SELECT chunk_text FROM {schema}.{table}")
    all_text = " ".join(row[0] for row in cur.fetchall())

    # Find URLs
    url_pattern = re.compile(r'https?://[^\s\)>\]"\']+')
    urls = list(set(url_pattern.findall(all_text)))

    if not urls:
        return "PASS", "URL check: no URLs found in content"

    if len(urls) > MAX_AUTO_URL_CHECK:
        return "WARN", f"URL check: {len(urls)} unique URLs found (>{MAX_AUTO_URL_CHECK}), use --skip-urls or check manually"

    # Create SSL context that doesn't verify (some gov sites have cert issues)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    failed_urls = []
    checked = 0

    for url in sorted(urls):
        checked += 1
        try:
            req = urllib.request.Request(url, method="HEAD")
            req.add_header("User-Agent", "RAG-Validator/1.0")
            with urllib.request.urlopen(req, timeout=URL_TIMEOUT, context=ctx) as resp:
                if resp.status >= 400:
                    failed_urls.append((url, f"HTTP {resp.status}"))
        except urllib.error.HTTPError as e:
            failed_urls.append((url, f"HTTP {e.code}"))
        except urllib.error.URLError as e:
            failed_urls.append((url, f"URLError: {e.reason}"))
        except Exception as e:
            failed_urls.append((url, str(e)))

    if not failed_urls:
        return "PASS", f"URL check: {checked}/{checked} URLs returned 2xx"

    detail_lines = [f"URL check: {len(failed_urls)}/{checked} URLs returned non-2xx"]
    for url, reason in failed_urls[:10]:  # Show first 10
        detail_lines.append(f"    {url} -> {reason}")
    if len(failed_urls) > 10:
        detail_lines.append(f"    ... and {len(failed_urls) - 10} more")

    return "WARN", "\n".join(detail_lines)


def check_content_hash(cur, schema, table):
    """Check 6: Verify content_hash matches md5(chunk_text)."""
    cur.execute(f"""
        SELECT id, chunk_text, content_hash FROM {schema}.{table}
    """)

    mismatches = 0
    checked = 0
    null_hashes = 0

    for row in cur.fetchall():
        row_id, chunk_text, stored_hash = row
        checked += 1

        if stored_hash is None:
            null_hashes += 1
            continue

        expected = hashlib.md5(chunk_text.encode("utf-8")).hexdigest()
        if stored_hash != expected:
            mismatches += 1

    if null_hashes > 0 and mismatches == 0:
        return "WARN", f"Content hash integrity: {null_hashes} NULL hashes, {checked - null_hashes} verified match"
    elif mismatches == 0:
        return "PASS", f"Content hash integrity: all {checked} match"
    else:
        return "FAIL", f"Content hash integrity: {mismatches} mismatch(es) out of {checked}"


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    args = parse_args()
    check_dependencies()

    import psycopg2  # noqa: E402 — deferred so --help works without deps

    db_config = check_env_vars()

    # Connect
    try:
        conn = psycopg2.connect(**db_config)
    except Exception as e:
        print(f"ERROR: Could not connect to database: {e}")
        sys.exit(1)

    cur = conn.cursor()

    # Get total count
    try:
        cur.execute(f"SELECT COUNT(*) FROM {args.schema}.{args.table}")
        total = cur.fetchone()[0]
    except Exception as e:
        print(f"ERROR: Could not query {args.schema}.{args.table}: {e}")
        conn.close()
        sys.exit(1)

    print(f"=== RAG Knowledge Validation ===")
    print(f"Schema: {args.schema} | Table: {args.table}")
    print(f"Total chunks: {total}")
    print()

    if total == 0:
        print("[WARN] Table is empty -- nothing to validate")
        conn.close()
        sys.exit(0)

    # Run all checks
    results = []

    checks = [
        ("Dedup", lambda: check_dedup(cur, args.schema, args.table)),
        ("NULL embeddings", lambda: check_null_embeddings(cur, args.schema, args.table)),
        ("Embedding dims", lambda: check_embedding_dims(cur, args.schema, args.table)),
        ("Chunk sizes", lambda: check_chunk_sizes(cur, args.schema, args.table)),
        ("URL validation", lambda: check_urls(cur, args.schema, args.table, skip=args.skip_urls)),
        ("Content hash", lambda: check_content_hash(cur, args.schema, args.table)),
    ]

    for name, check_fn in checks:
        try:
            status, message = check_fn()
        except Exception as e:
            status, message = "FAIL", f"{name}: error -- {e}"

        results.append((status, message))
        print(f"[{status}] {message}")

    conn.close()

    # Summary
    pass_count = sum(1 for s, _ in results if s == "PASS")
    fail_count = sum(1 for s, _ in results if s == "FAIL")
    warn_count = sum(1 for s, _ in results if s == "WARN")
    info_count = sum(1 for s, _ in results if s == "INFO")

    print(f"\nOverall: {pass_count}/{len(results)} PASS", end="")
    if fail_count:
        print(f", {fail_count} FAIL", end="")
    if warn_count:
        print(f", {warn_count} WARN", end="")
    if info_count:
        print(f", {info_count} INFO", end="")
    print()

    # Exit code 1 if any FAIL
    sys.exit(1 if fail_count > 0 else 0)


if __name__ == "__main__":
    main()
