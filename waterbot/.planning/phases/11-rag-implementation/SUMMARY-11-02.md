# SUMMARY-11-02: Embedding Generation Pipeline

## Status: COMPLETE

## What Was Done

Generated OpenAI embeddings for all 1,253 knowledge chunks and loaded them into PostgreSQL.

### Approach

**n8n workflow approach failed** due to:
- PostgREST schema cache not detecting new tables
- Webhook registration not working despite workflow being "active"
- Multiple restart/toggle attempts unsuccessful

**Direct script approach succeeded:**
- Ran Python script inside Docker container on VPS
- Container joined `n8n-cloud-stack_backend` network for DB access
- Fetched chunks from GitHub, generated embeddings via OpenAI API, inserted directly

### Results

| Metric | Value |
|--------|-------|
| Total chunks | 1,253 |
| Embedding model | text-embedding-3-small |
| Embedding dimensions | 1,536 |
| Database | postgres (VPS Supabase) |
| Table | public.waterbot_documents |

**Category Distribution:**
| Category | Chunks |
|----------|--------|
| water-quality | 189 |
| funding | 181 |
| water-rights | 165 |
| public-resources | 153 |
| compliance | 152 |
| climate-drought | 148 |
| entities | 147 |
| permits | 118 |

### Table Schema

```sql
public.waterbot_documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding VECTOR(1536)
)
```

Index: `ivfflat (embedding vector_cosine_ops)`

### Key Learnings

1. **PostgREST requires explicit grants** - Tables need `GRANT ALL TO anon, authenticated` to be visible via REST API
2. **PostgREST connects to one database** - The VPS Supabase was configured for `postgres` database, not `n8n`
3. **n8n webhook registration is fragile** - Database toggle + restart doesn't always register webhooks; may need UI activation
4. **Direct scripts are simpler** - For one-time bulk operations, a direct script beats complex workflow debugging

### Files Created/Modified

- `scripts/embed-chunks.py` - Direct embedding script (for reference/re-runs)
- Database: 1,253 rows in `public.waterbot_documents`

### Verification

```sql
-- Verified working
SELECT COUNT(*) FROM public.waterbot_documents;  -- 1253
SELECT vector_dims(embedding) FROM public.waterbot_documents LIMIT 1;  -- 1536
```

## Next Steps

Proceed to PLAN-11-03: Vector Search & Retrieval Functions
