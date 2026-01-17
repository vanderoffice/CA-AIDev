---
phase: 02-supabase-setup
plan: 01
subsystem: database
provides: [waterbot-schema, document-chunks-table, vector-index]
affects: [05-embedding-pipeline, 06-core-rag-chat]
key-files: [src/config/supabase.js]
tech-stack:
  added: [supabase-postgresql, pgvector]
  patterns: [schema-per-bot, ivfflat-cosine-search]
---

# Phase 2 Plan 01: Supabase Setup Summary

**WaterBot database schema and document_chunks table deployed on VPS with IVFFlat vector index.**

## Accomplishments

- Created `waterbot` schema in VPS supabase-db container (database `n8n`)
- Created `waterbot.document_chunks` table matching KiddoBot structure:
  - id, document_id, chunk_text, chunk_index, file_name, file_path
  - category, subcategory for organizing permits/funding content
  - embedding (vector 1536) for OpenAI text-embedding-3-small
  - created_at timestamp
- Created IVFFlat index (`idx_waterbot_chunks_embedding`) with lists=35 for cosine similarity search
- Documented connection config in `src/config/supabase.js`
- Verified table accessible with test query (0 rows, ready for Phase 5)

## Files Created/Modified

- `src/config/supabase.js` — Database config documentation and constants

## Database Objects Created

- Schema: `waterbot` in database `n8n`
- Table: `waterbot.document_chunks` (10 columns, matches KiddoBot)
- Index: `idx_waterbot_chunks_embedding` (IVFFlat, cosine similarity, lists=35)

## Decisions Made

- **Same database, separate schema**: Followed KiddoBot pattern of using `n8n` database with bot-specific schema for clean isolation
- **IVFFlat lists=35**: Starting value matching KiddoBot; will tune in Phase 7 based on actual data volume
- **vector(1536)**: Matches OpenAI text-embedding-3-small dimensions per PROJECT.md

## Issues Encountered

- **IVFFlat notice on empty table**: PostgreSQL warns about low recall when creating IVFFlat index on empty table. This is expected and will self-correct when data is loaded in Phase 5.

## Next Step

Phase 2 complete. Ready for Phase 3: Knowledge Research (Permits).
