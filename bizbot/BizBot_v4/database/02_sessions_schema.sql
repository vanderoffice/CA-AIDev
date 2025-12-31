-- BizBot v4 Session Management Schema
-- Enables context-aware conversations with business profile persistence

-- Drop existing tables if migrating
DROP TABLE IF EXISTS bizbot_session_messages CASCADE;
DROP TABLE IF EXISTS bizbot_sessions CASCADE;

-- Session table - stores user context and business profile
CREATE TABLE bizbot_sessions (
    -- Primary key
    session_id VARCHAR(64) PRIMARY KEY,

    -- Business profile (collected via intake form)
    business_profile JSONB DEFAULT '{}'::JSONB,
    -- Expected structure:
    -- {
    --   "businessName": "string",
    --   "entityType": "llc|corporation|sole_proprietor|partnership",
    --   "industry": "food_service|retail|professional|construction|...",
    --   "subIndustry": "restaurant|food_truck|...",
    --   "city": "string",
    --   "county": "string",
    --   "isNew": true|false,
    --   "isHomeBased": true|false,
    --   "hasEmployees": true|false,
    --   "sellsTangibleGoods": true|false,
    --   "specialSituations": ["veteran", "disabled_veteran", "small_business", ...]
    -- }

    -- Derived context (populated by orchestrator)
    licenses_discussed TEXT[] DEFAULT '{}',
    agencies_mentioned TEXT[] DEFAULT '{}',
    topics_covered TEXT[] DEFAULT '{}',

    -- Session metadata
    source VARCHAR(50) DEFAULT 'web' CHECK (source IN (
        'web',          -- vanderdev.net
        'api',          -- Direct API
        'form',         -- Tally form integration
        'test'          -- Testing
    )),
    user_agent TEXT,
    ip_hash VARCHAR(64),  -- Hashed for privacy

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP,

    -- Session state
    is_active BOOLEAN DEFAULT true,
    message_count INTEGER DEFAULT 0
);

-- Message history table
CREATE TABLE bizbot_session_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES bizbot_sessions(session_id) ON DELETE CASCADE,

    -- Message content
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,

    -- Metadata
    agent_used VARCHAR(50),  -- Which agent handled this
    tokens_used INTEGER,
    retrieval_sources JSONB,  -- Sources used for this response

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for sessions
CREATE INDEX idx_sessions_updated ON bizbot_sessions(updated_at DESC);
CREATE INDEX idx_sessions_active ON bizbot_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_sessions_source ON bizbot_sessions(source);
CREATE INDEX idx_sessions_city ON bizbot_sessions((business_profile->>'city'));
CREATE INDEX idx_sessions_industry ON bizbot_sessions((business_profile->>'industry'));

-- GIN index for JSONB queries
CREATE INDEX idx_sessions_profile ON bizbot_sessions USING gin(business_profile);

-- Indexes for messages
CREATE INDEX idx_messages_session ON bizbot_session_messages(session_id);
CREATE INDEX idx_messages_created ON bizbot_session_messages(created_at DESC);
CREATE INDEX idx_messages_role ON bizbot_session_messages(role);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_session_updated
    BEFORE UPDATE ON bizbot_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_timestamp();

-- Update session when message is added
CREATE OR REPLACE FUNCTION update_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE bizbot_sessions
    SET
        last_message_at = NOW(),
        message_count = message_count + 1,
        updated_at = NOW()
    WHERE session_id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_message_added
    AFTER INSERT ON bizbot_session_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_session_on_message();

-- Function to get or create session
CREATE OR REPLACE FUNCTION get_or_create_session(
    p_session_id VARCHAR(64),
    p_source VARCHAR(50) DEFAULT 'web',
    p_user_agent TEXT DEFAULT NULL
)
RETURNS bizbot_sessions AS $$
DECLARE
    v_session bizbot_sessions;
BEGIN
    -- Try to get existing session
    SELECT * INTO v_session
    FROM bizbot_sessions
    WHERE session_id = p_session_id;

    -- Create if not exists
    IF NOT FOUND THEN
        INSERT INTO bizbot_sessions (session_id, source, user_agent)
        VALUES (p_session_id, p_source, p_user_agent)
        RETURNING * INTO v_session;
    END IF;

    RETURN v_session;
END;
$$ LANGUAGE plpgsql;

-- Function to get conversation history
CREATE OR REPLACE FUNCTION get_conversation_history(
    p_session_id VARCHAR(64),
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    role VARCHAR,
    content TEXT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.role,
        m.content,
        m.created_at
    FROM bizbot_session_messages m
    WHERE m.session_id = p_session_id
    ORDER BY m.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to update business profile
CREATE OR REPLACE FUNCTION update_business_profile(
    p_session_id VARCHAR(64),
    p_profile JSONB
)
RETURNS bizbot_sessions AS $$
DECLARE
    v_session bizbot_sessions;
BEGIN
    UPDATE bizbot_sessions
    SET business_profile = business_profile || p_profile
    WHERE session_id = p_session_id
    RETURNING * INTO v_session;

    RETURN v_session;
END;
$$ LANGUAGE plpgsql;

-- Session analytics view
CREATE OR REPLACE VIEW session_analytics AS
SELECT
    DATE(created_at) as date,
    source,
    business_profile->>'industry' as industry,
    business_profile->>'city' as city,
    COUNT(*) as session_count,
    AVG(message_count) as avg_messages,
    COUNT(CASE WHEN message_count > 5 THEN 1 END) as engaged_sessions
FROM bizbot_sessions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), source, business_profile->>'industry', business_profile->>'city'
ORDER BY date DESC;

-- Cleanup old inactive sessions (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_sessions(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM bizbot_sessions
        WHERE
            updated_at < NOW() - (days_old || ' days')::INTERVAL
            AND message_count < 3  -- Keep engaged sessions longer
        RETURNING *
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE bizbot_sessions IS 'User session and business profile for context-aware chat';
COMMENT ON TABLE bizbot_session_messages IS 'Conversation history per session';
COMMENT ON COLUMN bizbot_sessions.business_profile IS 'JSONB business profile from intake form';
