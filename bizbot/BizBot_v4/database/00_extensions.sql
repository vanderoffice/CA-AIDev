-- BizBot v4 Database Setup
-- Step 0: Enable Required Extensions
-- Run as superuser on PostgreSQL 15+

-- Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable uuid-ossp for session IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify installation
SELECT
    extname,
    extversion
FROM pg_extension
WHERE extname IN ('vector', 'pg_trgm', 'uuid-ossp');
