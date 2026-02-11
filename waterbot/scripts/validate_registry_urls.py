#!/usr/bin/env python3
"""
Validate all URLs in the WaterBot URL registry.
Tests each unique URL, categorizes results, maps broken URLs back to topics,
and outputs a detailed validation report.
"""

import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple
import urllib.request
import urllib.error
import ssl

TIMEOUT = 15
MAX_WORKERS = 20
REGISTRY_PATH = Path(__file__).parent.parent / "rag-content" / "waterbot" / "url_registry.json"
REPORT_PATH = Path(__file__).parent.parent / "url_registry_validation.json"

# User-Agent to avoid bot blocks from CA gov sites
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}


def test_url(url: str) -> Dict:
    """Test a single URL. Returns dict with status, final_url, category, message."""
    result = {"url": url, "status": 0, "final_url": None, "category": "unknown", "message": ""}

    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        req = urllib.request.Request(url, headers=HEADERS)
        response = urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx)
        final_url = response.geturl()
        status = response.getcode()

        result["status"] = status
        result["final_url"] = final_url if final_url != url else None
        result["category"] = "ok"
        result["message"] = "OK"

        # If we got redirected, note it
        if final_url and final_url != url:
            result["category"] = "redirected"
            result["message"] = f"Redirected to {final_url}"

    except urllib.error.HTTPError as e:
        result["status"] = e.code
        result["message"] = str(e.reason)
        if e.code == 403:
            # 403 often means bot protection, not actually broken
            result["category"] = "ok_403"
            result["message"] = "403 Forbidden (likely bot protection, not broken)"
        elif 400 <= e.code < 500:
            result["category"] = "client_error"
        elif e.code >= 500:
            result["category"] = "server_error"
        else:
            result["category"] = "other"

    except urllib.error.URLError as e:
        reason = str(e.reason)
        result["message"] = reason
        if any(x in reason for x in ['Name or service not known', 'nodename nor servname', 'getaddrinfo']):
            result["category"] = "dns_failure"
        else:
            result["category"] = "connection_error"

    except TimeoutError:
        result["category"] = "timeout"
        result["message"] = f"Timeout after {TIMEOUT}s"

    except Exception as e:
        result["category"] = "other"
        result["message"] = str(e)

    return result


def build_url_topic_map(entries: List[Dict]) -> Dict[str, List[str]]:
    """Map each URL to the topics that reference it."""
    url_topics: Dict[str, List[str]] = {}
    for entry in entries:
        topic = entry["topic"]
        for u in entry.get("urls", []):
            url = u["url"]
            url_topics.setdefault(url, []).append(topic)
    return url_topics


def main():
    print("=" * 60)
    print("WaterBot URL Registry Validation")
    print("=" * 60)

    # Load registry
    with open(REGISTRY_PATH) as f:
        registry = json.load(f)

    entries = registry["entries"]
    print(f"\nRegistry: {len(entries)} topics")

    # Extract unique URLs
    url_topic_map = build_url_topic_map(entries)
    unique_urls = list(url_topic_map.keys())
    print(f"Unique URLs to test: {len(unique_urls)}")

    # Validate in parallel
    print(f"\nTesting with {MAX_WORKERS} workers, {TIMEOUT}s timeout...")
    start = time.time()
    results: List[Dict] = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(test_url, url): url for url in unique_urls}

        for i, future in enumerate(as_completed(futures), 1):
            r = future.result()
            r["topics"] = url_topic_map[r["url"]]
            results.append(r)

            if i % 50 == 0 or i == len(unique_urls):
                elapsed = time.time() - start
                print(f"  Tested {i}/{len(unique_urls)} URLs ({elapsed:.0f}s)")

    elapsed = time.time() - start
    print(f"\nCompleted in {elapsed:.1f}s")

    # Categorize
    categories = {}
    for r in results:
        cat = r["category"]
        categories.setdefault(cat, []).append(r)

    ok_count = len(categories.get("ok", []))
    ok_403_count = len(categories.get("ok_403", []))
    redirected_count = len(categories.get("redirected", []))
    client_error_count = len(categories.get("client_error", []))
    server_error_count = len(categories.get("server_error", []))
    dns_count = len(categories.get("dns_failure", []))
    timeout_count = len(categories.get("timeout", []))
    conn_error_count = len(categories.get("connection_error", []))
    other_count = len(categories.get("other", []))

    working = ok_count + ok_403_count + redirected_count
    broken = client_error_count + server_error_count + dns_count
    total = len(unique_urls)

    # Console summary
    print(f"\n{'=' * 60}")
    print("RESULTS SUMMARY")
    print(f"{'=' * 60}")
    print(f"  OK (200):              {ok_count}")
    print(f"  OK (403 bot-block):    {ok_403_count}")
    print(f"  Redirected (followed): {redirected_count}")
    print(f"  Client Error (4xx):    {client_error_count}")
    print(f"  Server Error (5xx):    {server_error_count}")
    print(f"  DNS Failure:           {dns_count}")
    print(f"  Timeout:               {timeout_count}")
    print(f"  Connection Error:      {conn_error_count}")
    print(f"  Other:                 {other_count}")
    print(f"  {'─' * 40}")
    print(f"  Working:  {working}/{total} ({working/total*100:.1f}%)")
    print(f"  Broken:   {broken}/{total} ({broken/total*100:.1f}%)")
    if timeout_count:
        print(f"  Timeout:  {timeout_count}/{total} ({timeout_count/total*100:.1f}%)")

    # Print broken URLs with topic context
    broken_results = (
        categories.get("client_error", [])
        + categories.get("server_error", [])
        + categories.get("dns_failure", [])
    )
    if broken_results:
        print(f"\n{'=' * 60}")
        print(f"BROKEN URLs ({len(broken_results)})")
        print(f"{'=' * 60}")
        for r in sorted(broken_results, key=lambda x: x["url"]):
            print(f"\n  {r['url']}")
            print(f"    Status: {r['status']} — {r['message']}")
            print(f"    Topics: {', '.join(r['topics'])}")

    # Print redirected URLs
    redirected_results = categories.get("redirected", [])
    if redirected_results:
        print(f"\n{'=' * 60}")
        print(f"REDIRECTED URLs ({len(redirected_results)})")
        print(f"{'=' * 60}")
        for r in sorted(redirected_results, key=lambda x: x["url"]):
            print(f"\n  {r['url']}")
            print(f"    → {r['final_url']}")
            print(f"    Topics: {', '.join(r['topics'])}")

    # Print timeouts
    timeout_results = categories.get("timeout", [])
    if timeout_results:
        print(f"\n{'=' * 60}")
        print(f"TIMEOUT URLs ({len(timeout_results)})")
        print(f"{'=' * 60}")
        for r in sorted(timeout_results, key=lambda x: x["url"]):
            print(f"\n  {r['url']}")
            print(f"    Topics: {', '.join(r['topics'])}")

    # Topics with broken URLs
    broken_topics = set()
    for r in broken_results:
        broken_topics.update(r["topics"])
    if broken_topics:
        print(f"\n{'=' * 60}")
        print(f"TOPICS WITH BROKEN URLs ({len(broken_topics)})")
        print(f"{'=' * 60}")
        for t in sorted(broken_topics):
            print(f"  - {t}")

    # Save detailed JSON report
    report = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "registry_path": str(REGISTRY_PATH),
        "summary": {
            "total_urls": total,
            "ok": ok_count,
            "ok_403": ok_403_count,
            "redirected": redirected_count,
            "client_error": client_error_count,
            "server_error": server_error_count,
            "dns_failure": dns_count,
            "timeout": timeout_count,
            "connection_error": conn_error_count,
            "other": other_count,
            "working_total": working,
            "broken_total": broken,
            "working_pct": round(working / total * 100, 1),
            "elapsed_seconds": round(elapsed, 1),
        },
        "broken": [
            {"url": r["url"], "status": r["status"], "message": r["message"], "topics": r["topics"]}
            for r in broken_results
        ],
        "redirected": [
            {"url": r["url"], "final_url": r["final_url"], "topics": r["topics"]}
            for r in redirected_results
        ],
        "timeout": [
            {"url": r["url"], "topics": r["topics"]}
            for r in timeout_results
        ],
        "all_results": [
            {"url": r["url"], "status": r["status"], "category": r["category"],
             "final_url": r["final_url"], "message": r["message"]}
            for r in sorted(results, key=lambda x: x["url"])
        ],
    }

    with open(REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\nDetailed report saved to: {REPORT_PATH}")

    # Return counts for programmatic use
    return broken, redirected_count, timeout_count


if __name__ == "__main__":
    broken, redirected, timeouts = main()
    sys.exit(1 if broken > 0 else 0)
