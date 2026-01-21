#!/usr/bin/env python3
"""
Phase 5: Query Coverage Testing
Tests RAG retrieval quality across BizBot, KiddoBot, and WaterBot
"""

import json
import os
import sys
from datetime import datetime

import psycopg2
from openai import OpenAI

# Database configuration (via SSH tunnel)
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5433,
    "database": "postgres",
    "user": "postgres",
    "password": "2LofmsGNMYUfgF6bGPoFmdcU6M4"
}

# Bot table configurations
BOT_TABLES = {
    "bizbot": {
        "schema": "public",
        "table": "bizbot_documents",
        "content_col": "content",
        "embedding_col": "embedding",
        "category_col": None  # BizBot has no category column
    },
    "kiddobot": {
        "schema": "kiddobot",
        "table": "document_chunks",
        "content_col": "chunk_text",
        "embedding_col": "embedding",
        "category_col": "category"
    },
    "waterbot": {
        "schema": "public",
        "table": "waterbot_documents",
        "content_col": "content",
        "embedding_col": "embedding",
        "category_col": "category"  # In metadata JSONB
    }
}

def get_embedding(client, text):
    """Generate embedding for query text using OpenAI"""
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def similarity_search(conn, bot_name, query_embedding, limit=5, category_filter=None):
    """Run similarity search against bot's vector database"""
    config = BOT_TABLES[bot_name]

    # Format embedding for pgvector
    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

    if bot_name == "kiddobot" and category_filter:
        # KiddoBot has explicit category column
        query = f"""
            SELECT id, {config['content_col']}, LENGTH({config['content_col']}) as content_length,
                   {config['category_col']},
                   1 - ({config['embedding_col']} <=> '{embedding_str}'::vector) as similarity
            FROM {config['schema']}.{config['table']}
            WHERE {config['category_col']} ILIKE %s
            ORDER BY {config['embedding_col']} <=> '{embedding_str}'::vector
            LIMIT {limit}
        """
        with conn.cursor() as cur:
            cur.execute(query, (f"%{category_filter}%",))
            return cur.fetchall()
    elif bot_name == "waterbot" and category_filter:
        # WaterBot uses metadata JSONB for category
        query = f"""
            SELECT id, {config['content_col']}, LENGTH({config['content_col']}) as content_length,
                   metadata->>'category' as category,
                   1 - ({config['embedding_col']} <=> '{embedding_str}'::vector) as similarity
            FROM {config['schema']}.{config['table']}
            WHERE metadata->>'category' ILIKE %s
            ORDER BY {config['embedding_col']} <=> '{embedding_str}'::vector
            LIMIT {limit}
        """
        with conn.cursor() as cur:
            cur.execute(query, (f"%{category_filter}%",))
            return cur.fetchall()
    else:
        # No category filter
        query = f"""
            SELECT id, {config['content_col']}, LENGTH({config['content_col']}) as content_length,
                   1 - ({config['embedding_col']} <=> '{embedding_str}'::vector) as similarity
            FROM {config['schema']}.{config['table']}
            ORDER BY {config['embedding_col']} <=> '{embedding_str}'::vector
            LIMIT {limit}
        """
        with conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()

def evaluate_result(result, query_config, bot_name):
    """
    Evaluate a single result against expected content.
    Returns score (0-2) and evaluation details.
    """
    if not result:
        return 0, "No results returned"

    content = result[1] if result[1] else ""
    content_length = result[2] if len(result) > 2 else len(content)
    similarity = result[-1] if result else 0

    # Check minimum character requirement (for stub pollution detection)
    min_chars = query_config.get("min_chars", 100)
    if content_length < min_chars:
        return 0, f"Content too short ({content_length} chars < {min_chars} min)"

    # Check if expected content keywords are present
    expected = query_config.get("expected_content", "").lower()
    content_lower = content.lower() if content else ""

    # Extract key terms from expected content
    key_terms = [term.strip() for term in expected.split() if len(term.strip()) > 3]
    matches = sum(1 for term in key_terms if term in content_lower)
    match_ratio = matches / len(key_terms) if key_terms else 0

    # Scoring based on similarity and content match
    if similarity > 0.8 and match_ratio > 0.5:
        return 2, f"Excellent: sim={similarity:.3f}, match={match_ratio:.1%}"
    elif similarity > 0.6 or match_ratio > 0.3:
        return 1, f"Adequate: sim={similarity:.3f}, match={match_ratio:.1%}"
    else:
        return 0, f"Poor: sim={similarity:.3f}, match={match_ratio:.1%}"

def test_stub_pollution(conn, openai_client):
    """
    Task 2: Test BizBot for stub pollution.
    Stubs are short entries like "Franchise Tax Board (FTB)" that shouldn't rank high.
    """
    print("\n" + "="*60)
    print("TASK 2: BizBot Stub Pollution Test")
    print("="*60)

    stub_tests = [
        {"query": "FTB", "name": "Franchise Tax Board"},
        {"query": "EDD", "name": "Employment Development Dept"},
        {"query": "CSLB", "name": "Contractors State License Board"}
    ]

    results = []
    for test in stub_tests:
        print(f"\nTesting: '{test['query']}'")
        embedding = get_embedding(openai_client, test['query'])
        search_results = similarity_search(conn, "bizbot", embedding, limit=5)

        # Check if top 3 results are stubs (< 100 chars)
        stub_count = 0
        for i, result in enumerate(search_results[:3]):
            content_length = result[2] if len(result) > 2 else len(result[1])
            is_stub = content_length < 100
            if is_stub:
                stub_count += 1
            print(f"  #{i+1}: {content_length} chars {'[STUB!]' if is_stub else '[OK]'} sim={result[-1]:.3f}")
            print(f"       Preview: {result[1][:80]}...")

        results.append({
            "query": test["query"],
            "name": test["name"],
            "stub_pollution": stub_count > 0,
            "stub_count_in_top3": stub_count,
            "top5_results": [
                {
                    "rank": i+1,
                    "content_length": r[2] if len(r) > 2 else len(r[1]),
                    "similarity": float(r[-1]),
                    "preview": r[1][:100] if r[1] else ""
                }
                for i, r in enumerate(search_results)
            ]
        })

    # Summary
    pollution_found = any(r["stub_pollution"] for r in results)
    print(f"\n{'FAIL' if pollution_found else 'PASS'}: Stub pollution {'detected' if pollution_found else 'not detected'}")

    return results, not pollution_found

def test_category_filtering(conn, openai_client):
    """
    Task 3: Test KiddoBot category filtering.
    Verify snake_case vs Title Case doesn't break queries.
    """
    print("\n" + "="*60)
    print("TASK 3: KiddoBot Category Filtering Test")
    print("="*60)

    # First, get actual category values in the database
    with conn.cursor() as cur:
        cur.execute("""
            SELECT DISTINCT category, COUNT(*) as count
            FROM kiddobot.document_chunks
            GROUP BY category
            ORDER BY count DESC
        """)
        categories = cur.fetchall()

    print("\nActual categories in database:")
    for cat, count in categories:
        print(f"  '{cat}': {count} chunks")

    # Test filters that should work
    # Note: 'calworks' removed - CalWORKs content is correctly categorized under 'subsidies'
    test_filters = [
        {"filter": "subsidies", "expected_min": 50},
        {"filter": "county_deep_dives", "expected_min": 50},
        {"filter": "provider_search", "expected_min": 20}
    ]

    results = []
    for test in test_filters:
        with conn.cursor() as cur:
            # Test exact match
            cur.execute("""
                SELECT COUNT(*) FROM kiddobot.document_chunks
                WHERE category = %s
            """, (test["filter"],))
            exact_count = cur.fetchone()[0]

            # Test ILIKE match (case-insensitive partial)
            cur.execute("""
                SELECT COUNT(*) FROM kiddobot.document_chunks
                WHERE category ILIKE %s
            """, (f"%{test['filter']}%",))
            ilike_count = cur.fetchone()[0]

        passed = ilike_count >= test["expected_min"]
        print(f"\nFilter '{test['filter']}':")
        print(f"  Exact match: {exact_count} chunks")
        print(f"  ILIKE match: {ilike_count} chunks")
        print(f"  Expected min: {test['expected_min']}")
        print(f"  Status: {'PASS' if passed else 'FAIL'}")

        results.append({
            "filter": test["filter"],
            "exact_match_count": exact_count,
            "ilike_match_count": ilike_count,
            "expected_min": test["expected_min"],
            "passed": passed,
            "issue": None if passed else f"Only {ilike_count} chunks, expected {test['expected_min']}+"
        })

    all_passed = all(r["passed"] for r in results)
    print(f"\n{'PASS' if all_passed else 'FAIL'}: Category filtering {'working' if all_passed else 'has issues'}")

    return results, all_passed, categories

def run_e2e_tests(conn, openai_client, test_queries):
    """
    Task 4: End-to-end query testing across all bots.
    """
    print("\n" + "="*60)
    print("TASK 4: End-to-End Query Testing")
    print("="*60)

    all_results = {}

    for bot_name in ["bizbot", "kiddobot", "waterbot"]:
        print(f"\n--- {bot_name.upper()} ---")
        bot_queries = test_queries.get(bot_name, {}).get("queries", [])
        bot_results = []

        for query_config in bot_queries:
            query_text = query_config["query"]
            category = query_config.get("category_filter")

            print(f"\nQuery: '{query_text}'")
            if category:
                print(f"  Category filter: {category}")

            # Generate embedding and search
            embedding = get_embedding(openai_client, query_text)
            search_results = similarity_search(conn, bot_name, embedding, limit=5, category_filter=category)

            if not search_results:
                score = 0
                evaluation = "No results returned"
            else:
                # Evaluate top result
                score, evaluation = evaluate_result(search_results[0], query_config, bot_name)

            print(f"  Score: {score}/2 - {evaluation}")
            if search_results:
                top_content = search_results[0][1][:100] if search_results[0][1] else "N/A"
                print(f"  Top result preview: {top_content}...")

            bot_results.append({
                "query_id": query_config["id"],
                "query": query_text,
                "purpose": query_config["purpose"],
                "category_filter": category,
                "score": score,
                "evaluation": evaluation,
                "expected": query_config["expected_content"],
                "top_results": [
                    {
                        "rank": i+1,
                        "content_preview": r[1][:150] if r[1] else "",
                        "content_length": r[2] if len(r) > 2 else len(r[1] or ""),
                        "similarity": float(r[-1])
                    }
                    for i, r in enumerate(search_results[:3])
                ] if search_results else []
            })

        # Calculate bot-level metrics
        if bot_results:
            avg_score = sum(r["score"] for r in bot_results) / len(bot_results)
            coverage = sum(1 for r in bot_results if r["score"] >= 1) / len(bot_results)
            print(f"\n{bot_name} Summary:")
            print(f"  Average Score: {avg_score:.2f}/2.0")
            print(f"  Query Coverage: {coverage:.1%}")

        all_results[bot_name] = {
            "queries": bot_results,
            "avg_score": avg_score if bot_results else 0,
            "coverage": coverage if bot_results else 0
        }

    return all_results

def main():
    print("="*60)
    print("PHASE 5: QUERY COVERAGE TESTING")
    print(f"Started: {datetime.now().isoformat()}")
    print("="*60)

    # Load test queries
    script_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(script_dir, "test-queries.json")) as f:
        test_queries = json.load(f)

    # Initialize OpenAI client
    openai_client = OpenAI()

    # Connect to database
    print("\nConnecting to database via SSH tunnel (port 5433)...")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("Connected successfully!")
    except Exception as e:
        print(f"ERROR: Could not connect to database: {e}")
        print("Ensure SSH tunnel is running: ssh -fN -L 5433:172.18.0.3:5432 root@100.111.63.3")
        sys.exit(1)

    try:
        # Task 2: Stub pollution test
        stub_results, stub_passed = test_stub_pollution(conn, openai_client)

        # Task 3: Category filtering test
        category_results, category_passed, category_list = test_category_filtering(conn, openai_client)

        # Task 4: E2E query tests
        e2e_results = run_e2e_tests(conn, openai_client, test_queries)

        # Compile all results
        full_results = {
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "phase": "5 - Query Coverage Testing"
            },
            "task2_stub_pollution": {
                "passed": stub_passed,
                "results": stub_results
            },
            "task3_category_filtering": {
                "passed": category_passed,
                "categories_in_db": [{"name": c[0], "count": c[1]} for c in category_list],
                "results": category_results
            },
            "task4_e2e_testing": e2e_results,
            "summary": {
                "stub_pollution_passed": stub_passed,
                "category_filtering_passed": category_passed,
                "bizbot_coverage": e2e_results.get("bizbot", {}).get("coverage", 0),
                "bizbot_avg_score": e2e_results.get("bizbot", {}).get("avg_score", 0),
                "kiddobot_coverage": e2e_results.get("kiddobot", {}).get("coverage", 0),
                "kiddobot_avg_score": e2e_results.get("kiddobot", {}).get("avg_score", 0),
                "waterbot_coverage": e2e_results.get("waterbot", {}).get("coverage", 0),
                "waterbot_avg_score": e2e_results.get("waterbot", {}).get("avg_score", 0)
            }
        }

        # Save results
        output_path = os.path.join(script_dir, "query-coverage-results.json")
        with open(output_path, "w") as f:
            json.dump(full_results, f, indent=2)
        print(f"\nResults saved to: {output_path}")

        # Print final summary
        print("\n" + "="*60)
        print("FINAL SUMMARY")
        print("="*60)
        print(f"\nQuality Gates:")
        print(f"  Stub Pollution: {'PASS' if stub_passed else 'FAIL'}")
        print(f"  Category Filtering: {'PASS' if category_passed else 'FAIL'}")

        for bot in ["bizbot", "kiddobot", "waterbot"]:
            data = e2e_results.get(bot, {})
            coverage = data.get("coverage", 0)
            avg_score = data.get("avg_score", 0)
            cov_status = "PASS" if coverage >= 0.9 else "FAIL"
            score_status = "PASS" if avg_score >= 1.5 else "FAIL"
            print(f"\n  {bot.upper()}:")
            print(f"    Coverage: {coverage:.1%} [{cov_status}] (target ≥90%)")
            print(f"    Avg Score: {avg_score:.2f}/2.0 [{score_status}] (target ≥1.5)")

    finally:
        conn.close()
        print("\nDatabase connection closed.")

if __name__ == "__main__":
    main()
