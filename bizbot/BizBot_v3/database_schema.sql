-- California Business Licensing Database Schema
-- PostgreSQL 15+

CREATE TABLE IF NOT EXISTS business_licensing_requests (
  id SERIAL PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50),
  industry VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  county VARCHAR(100) NOT NULL,
  business_address TEXT,
  is_home_based BOOLEAN DEFAULT false,
  sells_tangible_goods BOOLEAN DEFAULT false,
  has_employees BOOLEAN DEFAULT false,
  target_open_date DATE,
  request_type VARCHAR(50) DEFAULT 'new_business',
  contact_name VARCHAR(255),
  contact_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'completed',
  execution_id VARCHAR(255),
  error_message TEXT,
  processing_time_seconds INTEGER
);

-- Indexes
CREATE INDEX idx_city ON business_licensing_requests(city);
CREATE INDEX idx_county ON business_licensing_requests(county);
CREATE INDEX idx_industry ON business_licensing_requests(industry);
CREATE INDEX idx_created_at ON business_licensing_requests(created_at DESC);
CREATE INDEX idx_status ON business_licensing_requests(status);

-- Analytics view
CREATE VIEW daily_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as errors,
  ROUND(AVG(processing_time_seconds), 2) as avg_time
FROM business_licensing_requests
GROUP BY DATE(created_at)
ORDER BY date DESC;
