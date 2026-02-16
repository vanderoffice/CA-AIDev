-- 06_enrich_metadata.sql
-- Enrich bizbot_documents.metadata JSONB with topic + industry_category keys
-- Run: ssh vps 'docker exec supabase-db psql -U postgres -d postgres -f -' < 06_enrich_metadata.sql
-- Applied: 2026-02-16

-- === TOPIC ENRICHMENT ===
-- Numbered directories (188 chunks)
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'entity')        WHERE metadata->>'source_file' LIKE '01\_Entity%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'state')         WHERE metadata->>'source_file' LIKE '02\_State%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'local')         WHERE metadata->>'source_file' LIKE '03\_Local%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'industry')      WHERE metadata->>'source_file' LIKE '04\_Industry%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'environmental') WHERE metadata->>'source_file' LIKE '05\_Environmental%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'renewal')       WHERE metadata->>'source_file' LIKE '06\_Renewal%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'special')       WHERE metadata->>'source_file' LIKE '07\_Special%';

-- Uncategorized files (199 chunks)
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'entity')    WHERE metadata->>'source_file' LIKE 'BizInterviews%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'entity')    WHERE metadata->>'source_file' LIKE 'ca\_business\_licensing\_entities%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'state')     WHERE metadata->>'source_file' LIKE 'CA\_DCA%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'state')     WHERE metadata->>'source_file' LIKE 'CA\_DIR%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'state')     WHERE metadata->>'source_file' LIKE 'CA\_FTB%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'state')     WHERE metadata->>'source_file' LIKE 'california-edd%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'reference') WHERE metadata->>'source_file' LIKE 'Initial Assessment%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'reference') WHERE metadata->>'source_file' LIKE 'research-protocol%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'reference') WHERE metadata->>'source_file' LIKE 'url\_fixes%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'reference') WHERE metadata->>'source_file' LIKE 'CA\_Business\_Licensing\_URLs%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('topic', 'reference') WHERE metadata->>'source_file' = 'README.md';

-- === INDUSTRY CATEGORY ENRICHMENT ===
-- Subdirectory-based (142 of 147 industry chunks; 5 README chunks left without category)
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('industry_category', 'alcohol')               WHERE metadata->>'source_file' LIKE '04_Industry_Requirements/Alcohol/%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('industry_category', 'cannabis')              WHERE metadata->>'source_file' LIKE '04_Industry_Requirements/Cannabis/%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('industry_category', 'construction')          WHERE metadata->>'source_file' LIKE '04_Industry_Requirements/Construction/%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('industry_category', 'food_service')          WHERE metadata->>'source_file' LIKE '04_Industry_Requirements/Food_Service/%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('industry_category', 'healthcare')            WHERE metadata->>'source_file' LIKE '04_Industry_Requirements/Healthcare/%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('industry_category', 'manufacturing')         WHERE metadata->>'source_file' LIKE '04_Industry_Requirements/Manufacturing/%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('industry_category', 'professional_services') WHERE metadata->>'source_file' LIKE '04_Industry_Requirements/Professional_Services/%';
UPDATE bizbot_documents SET metadata = metadata || jsonb_build_object('industry_category', 'retail')                WHERE metadata->>'source_file' LIKE '04_Industry_Requirements/Retail/%';
