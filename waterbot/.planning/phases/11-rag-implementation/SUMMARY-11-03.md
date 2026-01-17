# SUMMARY-11-03: Vector Search & Retrieval Functions

**Status:** ✅ COMPLETE
**Date:** 2026-01-16

## Deliverables

### PostgreSQL Function Created

**Function:** `public.waterbot_match_documents`

```sql
CREATE OR REPLACE FUNCTION public.waterbot_match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.70,
  match_count int DEFAULT 8,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  content text,
  category text,
  subcategory text,
  file_name text,
  file_path text,
  similarity float
)
```

**Location:** VPS `supabase-db` container, `postgres` database, `public` schema

**Permissions:** Granted to `anon` and `authenticated` roles for PostgREST access

### Schema Adaptation

The PLAN specified a `waterbot.document_chunks` table with separate columns. Actual implementation uses:

| PLAN Expected | Actual Implementation |
|---------------|----------------------|
| `waterbot.document_chunks` | `public.waterbot_documents` |
| `chunk_text` column | `content` column |
| Separate `category`, `subcategory`, `file_name` | JSONB `metadata` field |

Function extracts metadata fields using `->>'key'` JSONB operator.

## Test Results

All 5 test queries from PLAN-11-03 return relevant results at threshold 0.50:

| Query | Top Match | Similarity | Category |
|-------|-----------|------------|----------|
| "How do I apply for an NPDES permit?" | npdes-individual.md | 0.604 | permits |
| "What funding is available for wastewater treatment?" | infrastructure-resilience.md | 0.551 | climate-drought |
| "What is a TMDL?" | tmdl-overview.md | 0.834 | water-quality |
| "Who enforces water rights?" | water-rights-overview.md | 0.622 | permits |
| "What are the requirements for 401 certification?" | 401-overview.md | 0.545 | permits |

### Category Filtering

✅ Works correctly - 401 certification query with `filter_category='permits'` returned only permit documents.

## Performance

| Metric | Target | Actual |
|--------|--------|--------|
| Response time | < 500ms | **62ms** |
| Index used | ivfflat | ✅ Yes |

## Parameter Tuning

**Original threshold (0.70):** Too restrictive - most queries returned 0 results

**Recommended threshold (0.50):** Provides good recall while maintaining precision

**Rationale:** Cosine similarity in 1536-dimensional space tends to cluster lower than intuition suggests. A 0.50 threshold captures semantically relevant documents that may not be exact matches.

## Success Criteria

| Criterion | Status |
|-----------|--------|
| Search returns relevant chunks for test queries | ✅ |
| Response time < 500ms for typical queries | ✅ (62ms) |
| Category filtering works correctly | ✅ |
| No SQL injection vulnerabilities | ✅ (parameterized function) |

## Files Created/Modified

- **PostgreSQL function:** `public.waterbot_match_documents` on VPS
- **Test scripts:** `/tmp/test_waterbot_search.sh` (VPS - temporary)

## Notes for PLAN-11-04

1. **Function call pattern for n8n:**
   ```sql
   SELECT * FROM public.waterbot_match_documents(
     $embedding::vector(1536),
     0.50,  -- threshold (lowered from 0.70)
     8,     -- limit
     NULL   -- or category filter
   );
   ```

2. **Embedding generation:** Use OpenAI `text-embedding-3-small` model (same as ingestion)

3. **PostgREST RPC:** Function is callable via `POST /rest/v1/rpc/waterbot_match_documents`

## Next Steps

- PLAN-11-04: Create n8n chat workflow using this retrieval function
- Sub-workflow receives query → generates embedding → calls function → formats context
