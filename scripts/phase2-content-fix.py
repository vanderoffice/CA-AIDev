#!/usr/bin/env python3
"""
Phase 2 Content Fix Script - Surgical update for verified content issues
"""
import os
import psycopg2
import openai

# Database config (via SSH tunnel)
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "database": "postgres",
    "user": "postgres",
    "password": "2LofmsGNMYUfgF6bGPoFmdcU6M4"
}

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMS = 1536

# Corrected content for chunk 439 (Cannabis Tax)
CANNABIS_TAX_CONTENT = """# California Cannabis Business Licensing Guide
## Tax Obligations

### Cannabis Excise Tax

**Rate:** 15% of retail selling price (as of October 2025)

**History:**
| Period | Rate | Notes |
|--------|------|-------|
| Jan 2018 – June 2025 | 15% | Original Prop 64 rate |
| July – Sept 2025 | 19% | AB 195 biennial adjustment |
| Oct 2025 – June 2028 | 15% | Reduced by AB 564 |
| July 2028+ | TBD | Subject to biennial review (max 19%) |

*AB 564 (signed Sept 2025) froze the rate at 15% through June 2028 to stabilize the licensed market.*

**Collection Point:**
- Retailer collects from customer at point of sale
- Retailer remits to CDTFA

### Cultivation Tax

**ELIMINATED** as of July 1, 2022 (AB 195)

Previously: $10.08/oz dry flower, $3/oz leaves, $1.41/oz fresh plant

### Local Taxes

Many jurisdictions impose additional cannabis taxes:

| Jurisdiction | Rate |
|--------------|------|
| Oakland | 5-10% gross receipts |
| Los Angeles | 2-6% (varies by activity) |
| San Francisco | 1-5% |
| San Diego | 8% |

**Warning:** Combined state + local taxes can exceed 30% in some areas.

### Sales Tax"""

# Corrected content for chunk 506 (Manufacturing/ISO)
MANUFACTURING_CONTENT = """# California Manufacturing Business Licensing Guide
## Specialized Manufacturing Categories

### Food Manufacturing

**California:**
- Processed Food Registration (PFR) from CDPH
- URL: https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/ProcessedFoodRegistration.aspx

**Federal:**
- FDA Food Facility Registration
- Current Good Manufacturing Practices compliance
- Registration renewal: every even year

### Pharmaceutical/Medical Devices

**Medical Device Manufacturing:**
- License from CDPH Food and Drug Branch
- FDA registration required
- ISO 13485:2016 certification or FDA inspection within 2 years
- Fee: ~$200/year

**Drug Manufacturing:**
- CDPH license
- Fingerprint/background check
- Fee: $200-300/year

### Chemical Manufacturing

**Additional Requirements:**
- Title V air permit (likely)
- CalARP Risk Management Plan
- Process Safety Management compliance
- Comprehensive environmental permits

### Metal Fabrication/Machining"""


def get_embedding(client, text):
    """Generate embedding for text."""
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text,
        dimensions=EMBEDDING_DIMS
    )
    return response.data[0].embedding


def main():
    # Check for API key
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable required")

    client = openai.OpenAI(api_key=api_key)

    print("Phase 2 Content Fix - Surgical Update")
    print("=" * 50)

    # Connect to database
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    # Update chunk 439 (Cannabis Tax)
    print("\n1. Updating chunk 439 (Cannabis Tax History)...")
    embedding_439 = get_embedding(client, CANNABIS_TAX_CONTENT)
    cur.execute("""
        UPDATE public.bizbot_documents
        SET content = %s, embedding = %s::vector
        WHERE id = 439
    """, (CANNABIS_TAX_CONTENT, str(embedding_439)))
    print("   ✓ Chunk 439 updated")

    # Update chunk 506 (Manufacturing/ISO)
    print("\n2. Updating chunk 506 (ISO 13485 Reference)...")
    embedding_506 = get_embedding(client, MANUFACTURING_CONTENT)
    cur.execute("""
        UPDATE public.bizbot_documents
        SET content = %s, embedding = %s::vector
        WHERE id = 506
    """, (MANUFACTURING_CONTENT, str(embedding_506)))
    print("   ✓ Chunk 506 updated")

    # Commit
    conn.commit()
    print("\n✓ Database committed")

    # Verify
    print("\nRunning verifications...")

    # Check for old content
    cur.execute("""
        SELECT COUNT(*) FROM public.bizbot_documents
        WHERE content LIKE '%ISO 13485:2003%'
    """)
    iso_old = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*) FROM public.bizbot_documents
        WHERE content LIKE '%2023-2024%' AND content LIKE '%19%' AND content LIKE '%temporary increase%'
    """)
    tax_old = cur.fetchone()[0]

    # Check for new content
    cur.execute("""
        SELECT COUNT(*) FROM public.bizbot_documents
        WHERE content LIKE '%ISO 13485:2016%'
    """)
    iso_new = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*) FROM public.bizbot_documents
        WHERE content LIKE '%AB 564%' AND content LIKE '%Oct 2025%'
    """)
    tax_new = cur.fetchone()[0]

    cur.close()
    conn.close()

    print(f"\n  Old ISO 13485:2003 references: {iso_old} (should be 0)")
    print(f"  New ISO 13485:2016 references: {iso_new} (should be 1)")
    print(f"  Old tax table references: {tax_old} (should be 0)")
    print(f"  New AB 564 references: {tax_new} (should be 1)")

    if iso_old == 0 and iso_new >= 1 and tax_old == 0 and tax_new >= 1:
        print("\n✓ ALL VERIFICATIONS PASSED")
    else:
        print("\n⚠ Some verifications may need review")

    print("\n" + "=" * 50)
    print("Phase 2 Content Fix Complete")


if __name__ == "__main__":
    main()
