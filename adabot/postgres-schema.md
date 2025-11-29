# PostgreSQL Schema for CA PDF Accessibility System

## Installation

Run this schema against your PostgreSQL database before deploying workflows.

```bash
psql -U your_user -d your_database -f init_schema.sql
```

## Tables

### pdf_analysis
Stores upload metadata, issue reports, and review status.

```sql
CREATE TABLE IF NOT EXISTS pdf_analysis (
    id SERIAL PRIMARY KEY,
    pdf_filename TEXT NOT NULL,
    pdf_hash TEXT UNIQUE, -- SHA256 hash to prevent duplicates
    upload_timestamp TIMESTAMP DEFAULT NOW(),
    file_size_bytes INTEGER,
    page_count INTEGER,
    is_machine_readable BOOLEAN,
    status TEXT CHECK (status IN ('pending_review', 'in_review', 'approved', 'rejected', 'completed', 'failed')),
    issue_report JSONB, -- Structured accessibility issues
    reviewer_id TEXT,
    review_timestamp TIMESTAMP,
    tally_form_url TEXT,
    original_pdf_url TEXT, -- Storage location
    remediated_pdf_url TEXT,
    created_by TEXT,
    notes TEXT
);

CREATE INDEX idx_status ON pdf_analysis(status);
CREATE INDEX idx_upload_timestamp ON pdf_analysis(upload_timestamp);
CREATE INDEX idx_reviewer ON pdf_analysis(reviewer_id);
```

### remediation_audit
Logs every fix applied to documents.

```sql
CREATE TABLE IF NOT EXISTS remediation_audit (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER REFERENCES pdf_analysis(id) ON DELETE CASCADE,
    fix_type TEXT, -- 'alt_text', 'heading_structure', 'language', 'reading_order', 'ocr_layer'
    fix_details JSONB, -- Before/after data, page numbers, element IDs
    applied_timestamp TIMESTAMP DEFAULT NOW(),
    confidence_score FLOAT, -- AI confidence or human validation score
    applied_by TEXT, -- 'human', 'ai_model_name'
    success BOOLEAN,
    error_message TEXT
);

CREATE INDEX idx_analysis_id ON remediation_audit(analysis_id);
CREATE INDEX idx_fix_type ON remediation_audit(fix_type);
```

### human_feedback
Captures reviewer decisions and modifications.

```sql
CREATE TABLE IF NOT EXISTS human_feedback (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER REFERENCES pdf_analysis(id) ON DELETE CASCADE,
    issue_id TEXT, -- References issue in issue_report JSONB
    decision TEXT CHECK (decision IN ('approve', 'reject', 'modify')),
    modified_value TEXT, -- Human-edited alt-text, heading text, etc.
    reviewer_notes TEXT,
    feedback_timestamp TIMESTAMP DEFAULT NOW(),
    reviewer_id TEXT,
    time_spent_seconds INTEGER
);

CREATE INDEX idx_analysis_feedback ON human_feedback(analysis_id);
```

### wcag_criteria_mapping
Reference table for WCAG 2.2 AA success criteria.

```sql
CREATE TABLE IF NOT EXISTS wcag_criteria_mapping (
    criterion_id TEXT PRIMARY KEY, -- '1.1.1', '1.3.1', etc.
    level TEXT CHECK (level IN ('A', 'AA', 'AAA')),
    title TEXT,
    description TEXT,
    pdf_applicable BOOLEAN DEFAULT TRUE,
    ca_required BOOLEAN DEFAULT TRUE, -- California specific requirement
    reference_url TEXT
);

-- Insert WCAG 2.2 AA PDF-relevant criteria
INSERT INTO wcag_criteria_mapping (criterion_id, level, title, description, pdf_applicable, ca_required, reference_url) VALUES
('1.1.1', 'A', 'Non-text Content', 'Provide text alternatives for non-text content', TRUE, TRUE, 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html'),
('1.3.1', 'A', 'Info and Relationships', 'Structure must be programmatically determinable', TRUE, TRUE, 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html'),
('1.3.2', 'A', 'Meaningful Sequence', 'Correct reading order', TRUE, TRUE, 'https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html'),
('1.4.3', 'AA', 'Contrast (Minimum)', '4.5:1 contrast ratio for text', TRUE, TRUE, 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html'),
('2.4.2', 'A', 'Page Titled', 'Documents have descriptive titles', TRUE, TRUE, 'https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html'),
('3.1.1', 'A', 'Language of Page', 'Document language specified', TRUE, TRUE, 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html'),
('4.1.2', 'A', 'Name, Role, Value', 'Form fields have proper labels', TRUE, TRUE, 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html')
ON CONFLICT (criterion_id) DO NOTHING;
```

### workflow_executions
Tracks n8n workflow runs for debugging.

```sql
CREATE TABLE IF NOT EXISTS workflow_executions (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER REFERENCES pdf_analysis(id) ON DELETE CASCADE,
    workflow_name TEXT, -- 'analysis_agent', 'review_agent', 'remediation_agent'
    execution_id TEXT, -- n8n execution ID
    status TEXT CHECK (status IN ('running', 'success', 'error', 'waiting')),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    error_details JSONB,
    execution_time_ms INTEGER
);

CREATE INDEX idx_workflow_status ON workflow_executions(workflow_name, status);
```

## Example Queries

### Get pending reviews older than 48 hours
```sql
SELECT id, pdf_filename, upload_timestamp, tally_form_url
FROM pdf_analysis
WHERE status = 'pending_review'
  AND upload_timestamp < NOW() - INTERVAL '48 hours'
ORDER BY upload_timestamp ASC;
```

### Audit trail for specific document
```sql
SELECT 
    pa.pdf_filename,
    ra.fix_type,
    ra.applied_timestamp,
    ra.confidence_score,
    hf.decision,
    hf.reviewer_notes
FROM pdf_analysis pa
LEFT JOIN remediation_audit ra ON pa.id = ra.analysis_id
LEFT JOIN human_feedback hf ON pa.id = hf.analysis_id
WHERE pa.id = $1
ORDER BY ra.applied_timestamp, hf.feedback_timestamp;
```

### Most common accessibility issues
```sql
SELECT 
    issue_report->'issues' AS issues,
    COUNT(*) as frequency
FROM pdf_analysis
WHERE issue_report IS NOT NULL
GROUP BY issue_report->'issues'
ORDER BY frequency DESC
LIMIT 10;
```

### Reviewer performance metrics
```sql
SELECT 
    reviewer_id,
    COUNT(*) as reviews_completed,
    AVG(time_spent_seconds) as avg_review_time_sec,
    COUNT(CASE WHEN decision = 'approve' THEN 1 END) as approvals,
    COUNT(CASE WHEN decision = 'modify' THEN 1 END) as modifications
FROM human_feedback
WHERE feedback_timestamp > NOW() - INTERVAL '30 days'
GROUP BY reviewer_id
ORDER BY reviews_completed DESC;
```

## Maintenance

### Archive completed analyses older than 1 year
```sql
-- Move to archive table first (create archive_pdf_analysis with same schema)
INSERT INTO archive_pdf_analysis
SELECT * FROM pdf_analysis
WHERE status = 'completed'
  AND upload_timestamp < NOW() - INTERVAL '1 year';

-- Then delete from active table
DELETE FROM pdf_analysis
WHERE status = 'completed'
  AND upload_timestamp < NOW() - INTERVAL '1 year';
```

### Vacuum and analyze for performance
```sql
VACUUM ANALYZE pdf_analysis;
VACUUM ANALYZE remediation_audit;
VACUUM ANALYZE human_feedback;
```