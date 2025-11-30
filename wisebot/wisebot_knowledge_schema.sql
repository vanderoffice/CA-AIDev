-- ============================================================================
-- WiseBot Knowledge Base Schema for Supabase
-- ============================================================================
-- This schema defines the database structure for WiseBot's document ingestion,
-- embedding storage, and retrieval system.
--
-- PREREQUISITES:
-- 1. Enable the pgvector extension in Supabase Dashboard > Database > Extensions
-- 2. Run this script in Supabase SQL Editor
--
-- CONFIGURATION:
-- - Vector dimension is set to 1536 (OpenAI text-embedding-3-small default)
-- - Adjust EMBEDDING_DIMENSION if using different embedding provider
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Document type classification
CREATE TYPE document_type AS ENUM (
    'text',      -- pdf, docx, md
    'audio',     -- mp3
    'image',     -- jpg, bmp
    'tabular'    -- csv, xlsx, json
);

-- Processing status tracking
CREATE TYPE processing_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'duplicate'
);

-- Duplicate detection result
CREATE TYPE duplicate_status AS ENUM (
    'unique',
    'exact_duplicate',
    'fuzzy_duplicate'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Main documents table - stores metadata for all ingested documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Hash identifiers for deduplication
    file_hash VARCHAR(64) NOT NULL,           -- SHA-256 of raw file bytes
    content_hash VARCHAR(64),                  -- SHA-256 of normalized text content

    -- Source email information
    source_email_id VARCHAR(255),              -- Gmail message ID
    source_email_subject VARCHAR(500),         -- Email subject line
    uploader_email VARCHAR(255) NOT NULL,      -- Sender's email address

    -- File metadata
    file_name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    doc_type document_type NOT NULL,
    file_size_bytes BIGINT,

    -- Processing metadata
    status processing_status DEFAULT 'pending',
    duplicate_status duplicate_status DEFAULT 'unique',
    duplicate_of_id UUID REFERENCES documents(id),
    similarity_score FLOAT,                    -- For fuzzy duplicates

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,

    -- Extracted content summary
    content_preview TEXT,                      -- First ~500 chars of extracted text
    page_count INTEGER,
    word_count INTEGER,

    -- Storage references
    raw_file_url TEXT,                         -- Supabase Storage URL if stored

    -- Ingestion metadata
    ingestion_workflow_id VARCHAR(100),
    ingestion_summary TEXT,                    -- Anthropic-generated summary

    -- Indexes
    CONSTRAINT unique_file_hash UNIQUE (file_hash)
);

-- Index for efficient duplicate lookups
CREATE INDEX idx_documents_file_hash ON documents(file_hash);
CREATE INDEX idx_documents_content_hash ON documents(content_hash);
CREATE INDEX idx_documents_source_email ON documents(source_email_id);
CREATE INDEX idx_documents_uploader ON documents(uploader_email);
CREATE INDEX idx_documents_doc_type ON documents(doc_type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- ============================================================================
-- TYPE-SPECIFIC TABLES
-- ============================================================================

-- Text documents (PDF, DOCX, MD)
CREATE TABLE IF NOT EXISTS documents_text (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    -- Full extracted text
    full_text TEXT,

    -- Structural information
    has_headers BOOLEAN DEFAULT FALSE,
    has_tables BOOLEAN DEFAULT FALSE,
    has_images BOOLEAN DEFAULT FALSE,
    language_detected VARCHAR(10),

    -- PDF-specific
    pdf_version VARCHAR(20),
    is_searchable BOOLEAN,                     -- vs scanned/OCR'd

    -- DOCX-specific
    author VARCHAR(255),
    last_modified_by VARCHAR(255),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_text_document_id ON documents_text(document_id);

-- Audio documents (MP3)
CREATE TABLE IF NOT EXISTS documents_audio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    -- Transcription
    transcription TEXT,
    transcription_provider VARCHAR(50),        -- e.g., 'whisper', 'deepgram'
    transcription_confidence FLOAT,

    -- Audio metadata
    duration_seconds FLOAT,
    sample_rate INTEGER,
    channels INTEGER,
    bitrate INTEGER,

    -- Speaker information (if diarization performed)
    speaker_count INTEGER,
    speaker_labels JSONB,                      -- Array of speaker segments

    language_detected VARCHAR(10),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_audio_document_id ON documents_audio(document_id);

-- Image documents (JPG, BMP)
CREATE TABLE IF NOT EXISTS documents_image (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    -- OCR results
    ocr_text TEXT,
    ocr_provider VARCHAR(50),                  -- e.g., 'tesseract', 'google-vision'
    ocr_confidence FLOAT,

    -- Vision AI description
    ai_description TEXT,                       -- LLM-generated image description
    detected_objects JSONB,                    -- Array of detected objects/labels

    -- Image metadata
    width_px INTEGER,
    height_px INTEGER,
    color_space VARCHAR(20),
    has_transparency BOOLEAN,

    -- EXIF data (if available)
    exif_data JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_image_document_id ON documents_image(document_id);

-- Tabular documents (CSV, XLSX, JSON)
CREATE TABLE IF NOT EXISTS documents_tabular (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    -- Structure information
    row_count INTEGER,
    column_count INTEGER,
    column_names JSONB,                        -- Array of column headers
    column_types JSONB,                        -- Inferred data types per column

    -- Sheet information (for XLSX)
    sheet_count INTEGER,
    sheet_names JSONB,

    -- Data preview
    sample_rows JSONB,                         -- First 5 rows as JSON

    -- JSON-specific
    json_schema JSONB,                         -- Inferred JSON schema
    is_array BOOLEAN,
    root_keys JSONB,

    -- Normalized text representation
    normalized_text TEXT,                      -- Flattened text for embedding

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_tabular_document_id ON documents_tabular(document_id);

-- ============================================================================
-- VECTOR STORAGE TABLES
-- ============================================================================

-- Document chunks with embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    -- Chunk content
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,              -- Position within document

    -- Chunk metadata
    start_char INTEGER,                        -- Character offset in source
    end_char INTEGER,
    token_count INTEGER,

    -- Logical structure
    section_title VARCHAR(500),                -- Header/section this chunk belongs to
    page_number INTEGER,                       -- For paginated documents

    -- Embedding vector (1536 dimensions for OpenAI)
    embedding vector(1536),
    embedding_model VARCHAR(100),              -- e.g., 'text-embedding-3-small'

    -- Denormalized metadata for efficient retrieval
    file_name VARCHAR(500),
    mime_type VARCHAR(100),
    doc_type document_type,
    uploader_email VARCHAR(255),
    source_subject VARCHAR(500),
    document_created_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index (IVFFlat for good balance of speed/accuracy)
CREATE INDEX idx_document_chunks_embedding ON document_chunks
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_doc_type ON document_chunks(doc_type);
CREATE INDEX idx_document_chunks_created_at ON document_chunks(document_created_at DESC);

-- ============================================================================
-- OPERATIONAL TABLES
-- ============================================================================

-- Ingestion log for tracking all processing attempts
CREATE TABLE IF NOT EXISTS ingestion_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Reference
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    source_email_id VARCHAR(255),
    file_name VARCHAR(500),

    -- Processing details
    workflow_execution_id VARCHAR(100),
    step_name VARCHAR(100),
    status VARCHAR(50),

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,

    -- Results
    success BOOLEAN,
    error_message TEXT,
    error_details JSONB,
    retry_count INTEGER DEFAULT 0,

    -- Metadata
    metadata JSONB
);

CREATE INDEX idx_ingestion_logs_document_id ON ingestion_logs(document_id);
CREATE INDEX idx_ingestion_logs_status ON ingestion_logs(status);
CREATE INDEX idx_ingestion_logs_started_at ON ingestion_logs(started_at DESC);

-- Duplicate detection log
CREATE TABLE IF NOT EXISTS duplicate_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- The new document that was detected as duplicate
    new_document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    new_file_hash VARCHAR(64),

    -- The original document it duplicates
    original_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,

    -- Detection details
    detection_type duplicate_status,
    similarity_score FLOAT,                    -- For fuzzy matches
    detection_method VARCHAR(50),              -- 'hash', 'embedding', 'content'

    -- Notification tracking
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMPTZ,

    detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_duplicate_detections_new_doc ON duplicate_detections(new_document_id);
CREATE INDEX idx_duplicate_detections_original ON duplicate_detections(original_document_id);

-- Operations health check log
CREATE TABLE IF NOT EXISTS ops_health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    check_type VARCHAR(50),                    -- 'db_connectivity', 'workflow_status', 'queue_depth'
    check_name VARCHAR(100),
    status VARCHAR(20),                        -- 'healthy', 'degraded', 'unhealthy'

    -- Results
    response_time_ms INTEGER,
    details JSONB,
    error_message TEXT,

    checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ops_health_checks_type ON ops_health_checks(check_type);
CREATE INDEX idx_ops_health_checks_checked_at ON ops_health_checks(checked_at DESC);

-- ============================================================================
-- CONFIGURATION TABLE
-- ============================================================================

-- Runtime configuration stored in database
CREATE TABLE IF NOT EXISTS wisebot_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO wisebot_config (key, value, description) VALUES
    ('email_subject_filter', '"WiseBotMindMeld"', 'Email subject line to watch for'),
    ('embedding_provider', '"openai"', 'Embedding provider: openai, cohere, etc.'),
    ('embedding_model', '"text-embedding-3-small"', 'Model name for embeddings'),
    ('embedding_dimensions', '1536', 'Vector dimensions'),
    ('chunk_size', '1000', 'Target chunk size in characters'),
    ('chunk_overlap', '200', 'Overlap between chunks in characters'),
    ('similarity_threshold', '0.85', 'Threshold for fuzzy duplicate detection'),
    ('top_k_default', '10', 'Default number of results for similarity search'),
    ('max_retries', '3', 'Maximum retry attempts for transient failures'),
    ('ops_email', '"ops@example.com"', 'Email address for operational alerts')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to search for similar documents by embedding
CREATE OR REPLACE FUNCTION search_similar_chunks(
    query_embedding vector(1536),
    match_count INTEGER DEFAULT 10,
    filter_doc_type document_type DEFAULT NULL,
    filter_start_date TIMESTAMPTZ DEFAULT NULL,
    filter_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    chunk_id UUID,
    document_id UUID,
    chunk_text TEXT,
    chunk_index INTEGER,
    similarity FLOAT,
    file_name VARCHAR(500),
    mime_type VARCHAR(100),
    doc_type document_type,
    uploader_email VARCHAR(255),
    source_subject VARCHAR(500),
    document_created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id AS chunk_id,
        dc.document_id,
        dc.chunk_text,
        dc.chunk_index,
        1 - (dc.embedding <=> query_embedding) AS similarity,
        dc.file_name,
        dc.mime_type,
        dc.doc_type,
        dc.uploader_email,
        dc.source_subject,
        dc.document_created_at
    FROM document_chunks dc
    WHERE
        (filter_doc_type IS NULL OR dc.doc_type = filter_doc_type)
        AND (filter_start_date IS NULL OR dc.document_created_at >= filter_start_date)
        AND (filter_end_date IS NULL OR dc.document_created_at <= filter_end_date)
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to check for duplicate by file hash
CREATE OR REPLACE FUNCTION check_file_duplicate(p_file_hash VARCHAR(64))
RETURNS TABLE (
    is_duplicate BOOLEAN,
    existing_document_id UUID,
    existing_file_name VARCHAR(500)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        TRUE AS is_duplicate,
        d.id AS existing_document_id,
        d.file_name AS existing_file_name
    FROM documents d
    WHERE d.file_hash = p_file_hash
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR(500);
    END IF;
END;
$$;

-- Function to find fuzzy duplicates using embedding similarity
CREATE OR REPLACE FUNCTION find_fuzzy_duplicates(
    p_document_id UUID,
    p_threshold FLOAT DEFAULT 0.85
)
RETURNS TABLE (
    similar_document_id UUID,
    similarity_score FLOAT,
    file_name VARCHAR(500)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_avg_embedding vector(1536);
BEGIN
    -- Calculate average embedding of the document's chunks
    SELECT AVG(embedding)::vector(1536) INTO v_avg_embedding
    FROM document_chunks
    WHERE document_id = p_document_id;

    IF v_avg_embedding IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    WITH doc_embeddings AS (
        SELECT
            dc.document_id,
            AVG(dc.embedding)::vector(1536) AS avg_embedding
        FROM document_chunks dc
        WHERE dc.document_id != p_document_id
        GROUP BY dc.document_id
    )
    SELECT
        de.document_id AS similar_document_id,
        (1 - (de.avg_embedding <=> v_avg_embedding))::FLOAT AS similarity_score,
        d.file_name
    FROM doc_embeddings de
    JOIN documents d ON d.id = de.document_id
    WHERE (1 - (de.avg_embedding <=> v_avg_embedding)) >= p_threshold
    ORDER BY similarity_score DESC
    LIMIT 5;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (Optional - Enable if using Supabase Auth)
-- ============================================================================

-- Uncomment the following if you want to enable RLS
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only see documents they uploaded
-- CREATE POLICY "Users can view own documents" ON documents
--     FOR SELECT USING (uploader_email = auth.jwt() ->> 'email');

-- ============================================================================
-- GRANTS (Adjust based on your Supabase setup)
-- ============================================================================

-- Grant usage to authenticated users (for Supabase)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant to service_role for n8n backend operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
