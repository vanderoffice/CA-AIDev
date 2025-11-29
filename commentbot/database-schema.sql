-- Public Comment Analysis System Database Schema
-- PostgreSQL 12+

-- Drop table if exists (for clean reinstall)
DROP TABLE IF EXISTS public_comment_analysis CASCADE;

-- Main analysis results table
CREATE TABLE public_comment_analysis (
    -- Primary identification
    comment_id VARCHAR(100) PRIMARY KEY,
    group_id VARCHAR(100) NOT NULL,
    
    -- Original comment data
    original_comment_text TEXT NOT NULL,
    
    -- Main agent analysis
    main_agent_summary TEXT NOT NULL,
    main_agent_recommendation TEXT NOT NULL,
    
    -- Sub-agent assessments (nullable as they may not be applicable)
    legal_assessment TEXT,
    scientific_assessment TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_comment_text_not_empty CHECK (LENGTH(TRIM(original_comment_text)) > 0),
    CONSTRAINT check_summary_not_empty CHECK (LENGTH(TRIM(main_agent_summary)) > 0)
);

-- Indexes for common queries
CREATE INDEX idx_group_id ON public_comment_analysis(group_id);
CREATE INDEX idx_created_at ON public_comment_analysis(created_at DESC);
CREATE INDEX idx_legal_assessment_exists ON public_comment_analysis(comment_id) WHERE legal_assessment IS NOT NULL;
CREATE INDEX idx_scientific_assessment_exists ON public_comment_analysis(comment_id) WHERE scientific_assessment IS NOT NULL;

-- Full-text search index on comment text
CREATE INDEX idx_comment_text_fts ON public_comment_analysis USING gin(to_tsvector('english', original_comment_text));

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
CREATE TRIGGER update_public_comment_analysis_updated_at
    BEFORE UPDATE ON public_comment_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for summary statistics
CREATE OR REPLACE VIEW comment_analysis_stats AS
SELECT
    COUNT(*) as total_comments,
    COUNT(DISTINCT group_id) as total_groups,
    COUNT(legal_assessment) as comments_with_legal,
    COUNT(scientific_assessment) as comments_with_scientific,
    COUNT(CASE WHEN legal_assessment IS NOT NULL AND scientific_assessment IS NOT NULL THEN 1 END) as comments_with_both,
    MIN(created_at) as earliest_comment,
    MAX(created_at) as latest_comment
FROM public_comment_analysis;

-- Grant permissions (adjust username as needed)
-- GRANT SELECT, INSERT, UPDATE ON public_comment_analysis TO your_username;
-- GRANT SELECT ON comment_analysis_stats TO your_username;
