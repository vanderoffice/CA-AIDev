#!/usr/bin/env python3
"""
Test URLs extracted from bot databases.
Reads from pre-extracted files to avoid SSH escaping issues.
"""

import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib.request
import urllib.error
import ssl
from typing import Tuple, Dict, List
import json

TIMEOUT = 15

def load_urls_from_file(filepath: str) -> List[str]:
    """Load and clean URLs from a raw extraction file."""
    urls = []
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            # Extract URL from {url} format
            match = re.match(r'\{(.+)\}', line)
            if match:
                url = match.group(1)
                # Clean up URL - remove trailing punctuation
                url = re.sub(r'[`\]\),;:]+$', '', url)
                # Skip malformed URLs
                if url.startswith('http') and '.' in url:
                    urls.append(url)
    return list(set(urls))

def test_url(url: str) -> Tuple[str, int, str]:
    """Test if a URL is reachable."""
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        req = urllib.request.Request(
            url,
            headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        )

        response = urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx)
        return (url, response.getcode(), "OK")

    except urllib.error.HTTPError as e:
        return (url, e.code, str(e.reason))
    except urllib.error.URLError as e:
        reason = str(e.reason)
        if 'Name or service not known' in reason or 'nodename nor servname' in reason or 'getaddrinfo' in reason:
            return (url, 0, f"DNS_FAILURE: {reason}")
        return (url, 0, f"URLError: {reason}")
    except TimeoutError:
        return (url, 0, "TIMEOUT")
    except Exception as e:
        return (url, 0, f"Error: {str(e)}")

def test_bot_urls(bot_name: str, filepath: str) -> Dict:
    """Test all URLs for a bot and return results."""
    print(f"\n{'='*60}")
    print(f"Testing {bot_name.upper()} URLs...")
    print(f"{'='*60}")

    urls = load_urls_from_file(filepath)
    print(f"Found {len(urls)} unique URLs")

    results = {
        "total": len(urls),
        "ok": [],
        "redirect": [],
        "client_error": [],
        "server_error": [],
        "dns_error": [],
        "timeout": [],
        "other_error": []
    }

    with ThreadPoolExecutor(max_workers=25) as executor:
        futures = {executor.submit(test_url, url): url for url in urls}

        for i, future in enumerate(as_completed(futures)):
            url, status, msg = future.result()

            if status == 200:
                results["ok"].append(url)
            elif 300 <= status < 400:
                results["redirect"].append((url, status, msg))
            elif status == 403:
                # 403 often means bot protection, not actually broken
                results["ok"].append(url)  # Count as OK
            elif 400 <= status < 500:
                results["client_error"].append((url, status, msg))
            elif status >= 500:
                results["server_error"].append((url, status, msg))
            elif "DNS_FAILURE" in msg:
                results["dns_error"].append((url, msg))
            elif "TIMEOUT" in msg:
                results["timeout"].append((url, msg))
            else:
                results["other_error"].append((url, status, msg))

            if (i + 1) % 50 == 0:
                print(f"  Tested {i + 1}/{len(urls)} URLs...")

    return results

def main():
    bots = [
        ("bizbot", "tmp/bizbot_urls_raw.txt"),
        ("kiddobot", "tmp/kiddobot_urls_raw.txt"),
        ("waterbot", "tmp/waterbot_urls_raw.txt"),
    ]

    all_results = {}
    all_broken = []

    for bot_name, filepath in bots:
        results = test_bot_urls(bot_name, filepath)
        all_results[bot_name] = results

        # Print summary
        print(f"\n{bot_name.upper()} Summary:")
        print(f"  ✅ OK (200/403): {len(results['ok'])}")
        print(f"  ↪️  Redirects (3xx): {len(results['redirect'])}")
        print(f"  ❌ Client Errors (4xx): {len(results['client_error'])}")
        print(f"  🔥 Server Errors (5xx): {len(results['server_error'])}")
        print(f"  🚫 DNS Failures: {len(results['dns_error'])}")
        print(f"  ⏱️  Timeouts: {len(results['timeout'])}")
        print(f"  ⚠️  Other Errors: {len(results['other_error'])}")

        # Collect broken URLs
        for url, status, msg in results["client_error"]:
            all_broken.append({"bot": bot_name, "url": url, "status": status, "message": msg})
        for url, status, msg in results["server_error"]:
            all_broken.append({"bot": bot_name, "url": url, "status": status, "message": msg})
        for url, msg in results["dns_error"]:
            all_broken.append({"bot": bot_name, "url": url, "status": 0, "message": msg})

    # Print all broken URLs
    print("\n" + "="*60)
    print("ALL BROKEN URLs (4xx, 5xx, DNS failures)")
    print("="*60)

    for item in sorted(all_broken, key=lambda x: x["bot"]):
        print(f"\n[{item['bot'].upper()}] {item['url']}")
        if item['status']:
            print(f"  Status: {item['status']} - {item['message']}")
        else:
            print(f"  Error: {item['message']}")

    # Save results
    output = {
        "summary": {
            bot: {
                "total": data["total"],
                "ok": len(data["ok"]),
                "broken": len(data["client_error"]) + len(data["server_error"]) + len(data["dns_error"]),
                "timeout": len(data["timeout"])
            }
            for bot, data in all_results.items()
        },
        "broken_urls": all_broken
    }

    with open("url_validation_results.json", "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n\nResults saved to: url_validation_results.json")
    print(f"\nTOTAL BROKEN URLs: {len(all_broken)}")

    return 0 if len(all_broken) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
