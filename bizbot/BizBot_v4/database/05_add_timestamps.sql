-- 05_add_timestamps.sql
-- Add created_at/updated_at columns to bizbot_documents for chunk-level staleness tracking
-- Run: ssh vps 'docker exec supabase-db psql -U postgres -d postgres -f -' < 05_add_timestamps.sql
-- Applied: 2026-02-16

-- Add timestamp columns (DEFAULT NOW() backfills all existing rows)
ALTER TABLE public.bizbot_documents
  ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Auto-update trigger function
CREATE OR REPLACE FUNCTION update_bizbot_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fire trigger on any UPDATE
CREATE TRIGGER bizbot_documents_updated_at
  BEFORE UPDATE ON public.bizbot_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_bizbot_updated_at();
