-- BizBot v4 License Requirements Matrix
-- Powers the License Finder calculator
-- Cross-reference: industry × required licenses

-- Drop existing tables if migrating
DROP TABLE IF EXISTS license_requirement_links CASCADE;
DROP TABLE IF EXISTS license_requirements CASCADE;
DROP TABLE IF EXISTS license_agencies CASCADE;
DROP TABLE IF EXISTS license_industries CASCADE;

-- Industries taxonomy
CREATE TABLE license_industries (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    parent_code VARCHAR(50) REFERENCES license_industries(code),
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

-- Agencies reference table
CREATE TABLE license_agencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    abbreviation VARCHAR(20),
    url TEXT,
    phone VARCHAR(20),
    agency_type VARCHAR(50) CHECK (agency_type IN (
        'federal',
        'state',
        'county',
        'city',
        'special_district'
    )),
    notes TEXT
);

-- License requirements matrix
CREATE TABLE license_requirements (
    id SERIAL PRIMARY KEY,

    -- License identification
    license_name VARCHAR(200) NOT NULL,
    license_code VARCHAR(50),
    agency_code VARCHAR(50) NOT NULL REFERENCES license_agencies(code),

    -- Industry association
    industry_code VARCHAR(50) NOT NULL REFERENCES license_industries(code),

    -- Location scope
    city VARCHAR(100),      -- NULL = statewide
    county VARCHAR(100),    -- NULL = statewide
    is_statewide BOOLEAN GENERATED ALWAYS AS (city IS NULL AND county IS NULL) STORED,

    -- Requirements
    is_required BOOLEAN DEFAULT true,
    is_conditional BOOLEAN DEFAULT false,
    condition_description TEXT,

    -- Sequencing (lower = earlier in process)
    sequence_order INTEGER DEFAULT 50,
    sequence_group VARCHAR(50) CHECK (sequence_group IN (
        'formation',        -- 0-10: Entity setup
        'state',            -- 20-30: State registrations
        'local',            -- 40-50: Local permits
        'industry',         -- 60-70: Industry-specific
        'ongoing'           -- 80-90: Renewals/compliance
    )),

    -- Cost estimates
    application_fee_min DECIMAL(10,2),
    application_fee_max DECIMAL(10,2),
    annual_fee_min DECIMAL(10,2),
    annual_fee_max DECIMAL(10,2),
    fee_notes TEXT,

    -- Timeline
    processing_days_min INTEGER,
    processing_days_max INTEGER,
    timeline_notes TEXT,

    -- Links
    application_url TEXT,
    info_url TEXT,
    forms_url TEXT,

    -- Metadata
    last_verified DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Prevent duplicates
    UNIQUE(license_name, industry_code, city, county)
);

-- Many-to-many links for complex requirements
CREATE TABLE license_requirement_links (
    id SERIAL PRIMARY KEY,
    license_id INTEGER REFERENCES license_requirements(id) ON DELETE CASCADE,
    prerequisite_license_id INTEGER REFERENCES license_requirements(id) ON DELETE CASCADE,
    link_type VARCHAR(50) CHECK (link_type IN (
        'prerequisite',     -- Must have this first
        'alternative',      -- Either/or
        'corequisite',      -- Get together
        'supersedes'        -- Replaces this one
    )),
    notes TEXT
);

-- Indexes
CREATE INDEX idx_requirements_industry ON license_requirements(industry_code);
CREATE INDEX idx_requirements_agency ON license_requirements(agency_code);
CREATE INDEX idx_requirements_city ON license_requirements(city);
CREATE INDEX idx_requirements_county ON license_requirements(county);
CREATE INDEX idx_requirements_statewide ON license_requirements(is_statewide) WHERE is_statewide = true;
CREATE INDEX idx_requirements_sequence ON license_requirements(sequence_order);
CREATE INDEX idx_requirements_verified ON license_requirements(last_verified);

-- Auto-update timestamp
CREATE TRIGGER trigger_requirements_updated
    BEFORE UPDATE ON license_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_chunks_timestamp();  -- Reuse from chunks schema

-- Function to get licenses for a business profile
CREATE OR REPLACE FUNCTION get_required_licenses(
    p_industry_code VARCHAR,
    p_city VARCHAR DEFAULT NULL,
    p_county VARCHAR DEFAULT NULL,
    p_has_employees BOOLEAN DEFAULT false,
    p_sells_goods BOOLEAN DEFAULT false
)
RETURNS TABLE (
    license_id INTEGER,
    license_name VARCHAR,
    agency_name VARCHAR,
    agency_url TEXT,
    sequence_order INTEGER,
    sequence_group VARCHAR,
    fee_range TEXT,
    timeline_range TEXT,
    application_url TEXT,
    is_conditional BOOLEAN,
    condition_description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.license_name,
        a.name,
        a.url,
        r.sequence_order,
        r.sequence_group,
        CASE
            WHEN r.application_fee_min IS NULL THEN 'Free'
            WHEN r.application_fee_min = r.application_fee_max THEN '$' || r.application_fee_min::TEXT
            ELSE '$' || r.application_fee_min::TEXT || '-$' || r.application_fee_max::TEXT
        END,
        CASE
            WHEN r.processing_days_min IS NULL THEN 'Varies'
            WHEN r.processing_days_min = r.processing_days_max THEN r.processing_days_min::TEXT || ' days'
            ELSE r.processing_days_min::TEXT || '-' || r.processing_days_max::TEXT || ' days'
        END,
        r.application_url,
        r.is_conditional,
        r.condition_description
    FROM license_requirements r
    JOIN license_agencies a ON r.agency_code = a.code
    WHERE
        r.industry_code = p_industry_code
        AND (
            -- Match statewide licenses
            r.is_statewide = true
            -- OR match city-specific
            OR (p_city IS NOT NULL AND r.city = p_city)
            -- OR match county-specific
            OR (p_county IS NOT NULL AND r.county = p_county AND r.city IS NULL)
        )
        AND r.is_required = true
    ORDER BY r.sequence_order, r.license_name;
END;
$$ LANGUAGE plpgsql;

-- View for license summary by industry
CREATE OR REPLACE VIEW license_summary_by_industry AS
SELECT
    i.code as industry_code,
    i.name as industry_name,
    COUNT(DISTINCT r.id) as total_licenses,
    COUNT(DISTINCT r.id) FILTER (WHERE r.is_statewide) as statewide_licenses,
    COUNT(DISTINCT r.agency_code) as agencies_involved,
    COALESCE(SUM(r.application_fee_min), 0) as min_total_fees,
    COALESCE(SUM(r.application_fee_max), 0) as max_total_fees
FROM license_industries i
LEFT JOIN license_requirements r ON i.code = r.industry_code
GROUP BY i.code, i.name
ORDER BY i.name;

COMMENT ON TABLE license_requirements IS 'License matrix powering the License Finder calculator';
COMMENT ON TABLE license_industries IS 'Industry taxonomy matching frontend selector';
COMMENT ON TABLE license_agencies IS 'Agency reference with URLs and contacts';
