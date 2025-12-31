-- BizBot v4 Vector Database Schema
-- PostgreSQL pgvector - replaces Qdrant
--
-- Performance Note: pgvector with HNSW index achieves 471 QPS at 99% recall
-- vs Qdrant's 41 QPS - 11x faster for our use case

-- Drop existing table if migrating
DROP TABLE IF EXISTS bizbot_chunks CASCADE;

-- Main chunks table with vector embeddings
CREATE TABLE bizbot_chunks (
    id SERIAL PRIMARY KEY,

    -- Content
    content TEXT NOT NULL,
    content_hash VARCHAR(64) GENERATED ALWAYS AS (md5(content)) STORED,

    -- Vector embedding (OpenAI ada-002 = 1536 dimensions)
    embedding vector(1536),

    -- Source tracking
    source_file VARCHAR(255) NOT NULL,
    source_section VARCHAR(100),
    chunk_index INTEGER DEFAULT 0,

    -- Classification (for filtered retrieval)
    topic VARCHAR(50) NOT NULL CHECK (topic IN (
        'entity',           -- 01_Entity_Formation
        'state',            -- 02_State_Registration
        'local',            -- 03_Local_Licensing
        'industry',         -- 04_Industry_Requirements
        'environmental',    -- 05_Environmental_Compliance
        'renewal',          -- 06_Renewal_Compliance
        'special'           -- 07_Special_Situations
    )),

    -- Multi-value metadata (for hybrid filtering)
    industries TEXT[] DEFAULT '{}',
    agencies TEXT[] DEFAULT '{}',
    cities TEXT[] DEFAULT '{}',
    counties TEXT[] DEFAULT '{}',

    -- Hierarchical chunking level
    chunk_level VARCHAR(20) DEFAULT 'paragraph' CHECK (chunk_level IN (
        'document',     -- Full document summary
        'section',      -- Section-level (H2)
        'paragraph'     -- Paragraph-level (most granular)
    )),

    -- Quality tracking
    last_verified DATE,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN (
        'verified',     -- Manually verified correct
        'pending',      -- Not yet verified
        'outdated',     -- Needs update
        'deprecated'    -- Marked for removal
    )),
    confidence FLOAT DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- HNSW index for fast similarity search (pgvector 0.5+)
-- m=16, ef_construction=64 are good defaults for 1536-dim vectors
CREATE INDEX idx_chunks_embedding_hnsw ON bizbot_chunks
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Metadata indexes for filtered retrieval
CREATE INDEX idx_chunks_topic ON bizbot_chunks(topic);
CREATE INDEX idx_chunks_source ON bizbot_chunks(source_file);
CREATE INDEX idx_chunks_industries ON bizbot_chunks USING gin(industries);
CREATE INDEX idx_chunks_agencies ON bizbot_chunks USING gin(agencies);
CREATE INDEX idx_chunks_cities ON bizbot_chunks USING gin(cities);
CREATE INDEX idx_chunks_counties ON bizbot_chunks USING gin(counties);
CREATE INDEX idx_chunks_level ON bizbot_chunks(chunk_level);
CREATE INDEX idx_chunks_verification ON bizbot_chunks(verification_status);

-- Full-text search index on content
CREATE INDEX idx_chunks_content_trgm ON bizbot_chunks USING gin(content gin_trgm_ops);

-- Unique constraint on content hash to prevent duplicates
CREATE UNIQUE INDEX idx_chunks_unique_content ON bizbot_chunks(content_hash);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_chunks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chunks_updated
    BEFORE UPDATE ON bizbot_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_chunks_timestamp();

-- Hybrid search function (semantic + metadata filtering)
CREATE OR REPLACE FUNCTION search_chunks(
    query_embedding vector(1536),
    p_topic VARCHAR DEFAULT NULL,
    p_industry VARCHAR DEFAULT NULL,
    p_city VARCHAR DEFAULT NULL,
    p_county VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    chunk_id INTEGER,
    content TEXT,
    source_file VARCHAR,
    topic VARCHAR,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.content,
        c.source_file,
        c.topic,
        (1 - (c.embedding <=> query_embedding))::FLOAT AS similarity
    FROM bizbot_chunks c
    WHERE
        c.verification_status != 'deprecated'
        AND (p_topic IS NULL OR c.topic = p_topic)
        AND (p_industry IS NULL OR p_industry = ANY(c.industries))
        AND (p_city IS NULL OR p_city = ANY(c.cities) OR c.cities = '{}')
        AND (p_county IS NULL OR p_county = ANY(c.counties) OR c.counties = '{}')
    ORDER BY c.embedding <=> query_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- View for chunk statistics
CREATE OR REPLACE VIEW chunk_stats AS
SELECT
    topic,
    chunk_level,
    verification_status,
    COUNT(*) as chunk_count,
    AVG(LENGTH(content)) as avg_content_length,
    MIN(created_at) as oldest_chunk,
    MAX(updated_at) as newest_update
FROM bizbot_chunks
GROUP BY topic, chunk_level, verification_status
ORDER BY topic, chunk_level;

COMMENT ON TABLE bizbot_chunks IS 'Vector embeddings for BizBot RAG retrieval - replaces Qdrant';
COMMENT ON COLUMN bizbot_chunks.embedding IS 'OpenAI text-embedding-ada-002 (1536 dimensions)';
COMMENT ON COLUMN bizbot_chunks.topic IS 'Maps to BizAssessment folder structure (01-07)';
COMMENT ON COLUMN bizbot_chunks.chunk_level IS 'Hierarchical level for multi-resolution retrieval';
