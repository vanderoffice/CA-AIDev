-- ============================================================
-- RAG Table Migration: Standardize to {schema}.document_chunks
-- ============================================================
--
-- Migrates existing bot RAG tables to the standard naming convention:
--   {schema}.document_chunks
--
-- Targets:
--   WaterBot: public.waterbot_documents  →  waterbot.document_chunks
--   BizBot:   public.bizbot_documents    →  bizbot.document_chunks
--   KiddoBot: kiddobot.document_chunks   →  (already correct, no migration)
--
-- SAFETY:
--   - Copy-first strategy: originals are NOT dropped
--   - Each bot migration is independent (no wrapping transaction)
--   - No NOT NULL constraints on columns that may have NULLs in source
--   - Verification queries at the end to confirm row counts match
--
-- ============================================================
-- DATABASE NOTE (verified 2026-02-08)
-- ============================================================
--
-- Both source tables live in the `postgres` database:
--   public.waterbot_documents  — 1,253 rows (4 cols: id, content, metadata, embedding)
--   public.bizbot_documents    —   392 rows (4 cols: id, content, metadata, embedding)
--   kiddobot.document_chunks   — 1,390 rows (already in standard location)
--
-- Both WaterBot and BizBot use the same simple schema:
--   id (bigint), content (text), metadata (jsonb), embedding (vector)
--
-- WaterBot metadata keys: document_id, char_count, file_path, subcategory,
--   section_title, file_name, category, collection, chunk_index
--
-- BizBot metadata keys: topic (20/392 rows), category (20/392 rows),
--   subcategory, last_verified, location_specific, fees_current_as_of,
--   effective_date, blobType, source, source_urls, line, loc, effective_dates
--   NOTE: Most BizBot rows only have loc/line/source/blobType (n8n blob loader)
--
-- The n8n database also has {schema}.document_chunks tables but those are
-- managed by n8n workflows — this migration targets the postgres database.
--
-- Run this script against the postgres database:
--   docker exec -i supabase-db psql -U postgres -d postgres < migrate-rag-tables.sql
-- ============================================================


-- ============================================================
-- 1. PRE-FLIGHT CHECKS
-- ============================================================

-- Check for required extensions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    RAISE EXCEPTION 'pgvector extension not installed. Run: CREATE EXTENSION vector;';
  END IF;
  RAISE NOTICE 'pgvector extension found ✓';
END $$;


-- ============================================================
-- 2. WATERBOT MIGRATION
--    public.waterbot_documents → waterbot.document_chunks
-- ============================================================
-- Source: 4 columns (id, content, metadata JSONB, embedding)
-- WaterBot has rich metadata from chunk-knowledge.js:
--   document_id, chunk_index, file_name, file_path, category,
--   subcategory, section_title, char_count, collection

-- Check if source table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'waterbot_documents'
  ) THEN
    RAISE NOTICE 'SKIP: public.waterbot_documents not found.';
    RETURN;
  END IF;
  RAISE NOTICE 'Found public.waterbot_documents ✓';
END $$;

-- Create waterbot schema
CREATE SCHEMA IF NOT EXISTS waterbot;

-- Create target table with standard columns
CREATE TABLE IF NOT EXISTS waterbot.document_chunks (
  id              SERIAL PRIMARY KEY,
  document_id     TEXT,
  chunk_text      TEXT,
  chunk_index     INTEGER DEFAULT 0,
  file_name       TEXT,
  file_path       TEXT,
  category        TEXT,
  subcategory     TEXT,
  section_title   TEXT,
  char_count      INTEGER,
  content_hash    TEXT,
  embedding       vector(1536),
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate data: extract JSONB metadata into standard columns
-- Only runs if source table exists and target is empty
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'waterbot_documents'
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM waterbot.document_chunks LIMIT 1) THEN
    RAISE NOTICE 'SKIP: waterbot.document_chunks already has data — not overwriting.';
    RETURN;
  END IF;

  INSERT INTO waterbot.document_chunks (
    document_id,
    chunk_text,
    chunk_index,
    file_name,
    file_path,
    category,
    subcategory,
    section_title,
    char_count,
    content_hash,
    embedding,
    metadata,
    created_at,
    updated_at
  )
  SELECT
    metadata->>'document_id'                      AS document_id,
    content                                       AS chunk_text,
    COALESCE((metadata->>'chunk_index')::INTEGER, 0) AS chunk_index,
    metadata->>'file_name'                        AS file_name,
    metadata->>'file_path'                        AS file_path,
    metadata->>'category'                         AS category,
    metadata->>'subcategory'                      AS subcategory,
    metadata->>'section_title'                    AS section_title,
    COALESCE((metadata->>'char_count')::INTEGER, LENGTH(content)) AS char_count,
    md5(content)                                  AS content_hash,
    embedding                                     AS embedding,
    metadata                                      AS metadata,
    NOW()                                         AS created_at,
    NOW()                                         AS updated_at
  FROM public.waterbot_documents;

  RAISE NOTICE 'WaterBot migration complete ✓';
END $$;

-- Create HNSW index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_waterbot_chunks_embedding
  ON waterbot.document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Unique constraint on content_hash for dedup
CREATE UNIQUE INDEX IF NOT EXISTS idx_waterbot_chunks_content_hash
  ON waterbot.document_chunks (content_hash)
  WHERE content_hash IS NOT NULL;

-- DO NOT drop original table. After verification:
-- DROP TABLE public.waterbot_documents;


-- ============================================================
-- 3. BIZBOT MIGRATION
--    public.bizbot_documents → bizbot.document_chunks
-- ============================================================
-- Source: 4 columns (id, content, metadata JSONB, embedding)
-- BizBot metadata is sparse — most rows are n8n blob-loaded with
-- only loc/line/source/blobType. 20/392 rows have topic + category.

-- Check if source table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'bizbot_documents'
  ) THEN
    RAISE NOTICE 'SKIP: public.bizbot_documents not found.';
    RETURN;
  END IF;
  RAISE NOTICE 'Found public.bizbot_documents ✓';
END $$;

-- Create bizbot schema
CREATE SCHEMA IF NOT EXISTS bizbot;

-- Create target table with standard columns
-- No BizBot-specific extra columns needed — the sparse metadata
-- (topic, category on 20 rows; loc/line/blobType on the rest)
-- is preserved in the metadata JSONB column.
CREATE TABLE IF NOT EXISTS bizbot.document_chunks (
  id              SERIAL PRIMARY KEY,
  document_id     TEXT,
  chunk_text      TEXT,
  chunk_index     INTEGER DEFAULT 0,
  file_name       TEXT,
  file_path       TEXT,
  category        TEXT,
  subcategory     TEXT,
  section_title   TEXT,
  char_count      INTEGER,
  content_hash    TEXT,
  embedding       vector(1536),
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate data: extract what JSONB metadata is available
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'bizbot_documents'
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM bizbot.document_chunks LIMIT 1) THEN
    RAISE NOTICE 'SKIP: bizbot.document_chunks already has data — not overwriting.';
    RETURN;
  END IF;

  INSERT INTO bizbot.document_chunks (
    chunk_text,
    chunk_index,
    category,
    subcategory,
    char_count,
    content_hash,
    embedding,
    metadata,
    created_at,
    updated_at
  )
  SELECT
    content                                       AS chunk_text,
    0                                             AS chunk_index,
    metadata->>'category'                         AS category,
    metadata->>'subcategory'                      AS subcategory,
    LENGTH(content)                               AS char_count,
    md5(content)                                  AS content_hash,
    embedding                                     AS embedding,
    metadata                                      AS metadata,
    NOW()                                         AS created_at,
    NOW()                                         AS updated_at
  FROM public.bizbot_documents;

  RAISE NOTICE 'BizBot migration complete ✓';
END $$;

-- Create HNSW index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_bizbot_chunks_embedding
  ON bizbot.document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Unique constraint on content_hash for dedup
CREATE UNIQUE INDEX IF NOT EXISTS idx_bizbot_chunks_content_hash
  ON bizbot.document_chunks (content_hash)
  WHERE content_hash IS NOT NULL;

-- DO NOT drop original table. After verification:
-- DROP TABLE public.bizbot_documents;


-- ============================================================
-- 4. KIDDOBOT — NO MIGRATION NEEDED
-- ============================================================
-- kiddobot.document_chunks already uses the standard naming convention.
-- No migration required.
--
-- Optional: add missing standard columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'kiddobot' AND table_name = 'document_chunks'
  ) THEN
    RAISE NOTICE 'SKIP: kiddobot.document_chunks not found — nothing to patch.';
    RETURN;
  END IF;

  -- Add content_hash if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'kiddobot' AND table_name = 'document_chunks'
    AND column_name = 'content_hash'
  ) THEN
    ALTER TABLE kiddobot.document_chunks ADD COLUMN content_hash TEXT;
    RAISE NOTICE 'Added content_hash column to kiddobot.document_chunks ✓';
  END IF;

  -- Add metadata JSONB if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'kiddobot' AND table_name = 'document_chunks'
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE kiddobot.document_chunks ADD COLUMN metadata JSONB;
    RAISE NOTICE 'Added metadata column to kiddobot.document_chunks ✓';
  END IF;

  RAISE NOTICE 'KiddoBot table already standard ✓';
END $$;


-- ============================================================
-- 5. VERIFICATION QUERIES
-- ============================================================
-- Run these after migration to confirm correctness.

-- Row count comparison
DO $$
DECLARE
  src_count INTEGER;
  dst_count INTEGER;
BEGIN
  -- WaterBot counts
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'waterbot_documents'
  ) THEN
    SELECT COUNT(*) INTO src_count FROM public.waterbot_documents;
    SELECT COUNT(*) INTO dst_count FROM waterbot.document_chunks;
    RAISE NOTICE 'WaterBot: source=% → destination=%', src_count, dst_count;
    IF src_count != dst_count THEN
      RAISE WARNING 'WaterBot row count MISMATCH!';
    END IF;
  END IF;

  -- BizBot counts
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'bizbot_documents'
  ) THEN
    SELECT COUNT(*) INTO src_count FROM public.bizbot_documents;
    SELECT COUNT(*) INTO dst_count FROM bizbot.document_chunks;
    RAISE NOTICE 'BizBot: source=% → destination=%', src_count, dst_count;
    IF src_count != dst_count THEN
      RAISE WARNING 'BizBot row count MISMATCH!';
    END IF;
  END IF;
END $$;

-- Sample data spot-check (run manually after migration)
-- SELECT id, LEFT(chunk_text, 80), file_name, category, content_hash
--   FROM waterbot.document_chunks LIMIT 3;
--
-- SELECT id, LEFT(chunk_text, 80), category, metadata->>'topic' AS topic
--   FROM bizbot.document_chunks LIMIT 3;

-- Embedding dimension verification (run manually)
-- SELECT 'waterbot' AS bot, vector_dims(embedding) AS dims
--   FROM waterbot.document_chunks WHERE embedding IS NOT NULL LIMIT 1;
--
-- SELECT 'bizbot' AS bot, vector_dims(embedding) AS dims
--   FROM bizbot.document_chunks WHERE embedding IS NOT NULL LIMIT 1;
