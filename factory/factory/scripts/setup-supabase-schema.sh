#!/usr/bin/env bash
set -euo pipefail

# setup-supabase-schema.sh — Create a Supabase schema on the VPS for a new project
# Usage: setup-supabase-schema.sh --schema <name> --track <bot|form> [--host <vps-host>] [--dry-run]

# --- Usage ----------------------------------------------------------------

usage() {
  cat <<'USAGE'
Usage: setup-supabase-schema.sh --schema <name> --track <bot|form> [--host <vps-host>] [--dry-run]

Required flags:
  --schema    Schema name (lowercase alphanumeric + underscores, e.g. waterbot)
  --track     Project track: bot or form

Optional flags:
  --host      VPS hostname (default: $VPS_HOST env var)
  --dry-run   Print SQL without executing

Bot track creates:
  - Schema with document_chunks table (pgvector, HNSW index, content_hash dedup)
  - GRANT USAGE to anon + authenticated roles

Form track creates:
  - Schema only (add tables in {project}/sql/ separately)
  - GRANT USAGE to anon + authenticated roles

Examples:
  setup-supabase-schema.sh --schema waterbot --track bot --dry-run
  setup-supabase-schema.sh --schema calfire --track form
  setup-supabase-schema.sh --schema newbot --track bot --host 100.74.27.128
USAGE
}

# --- Parse flags ----------------------------------------------------------

SCHEMA=""
TRACK=""
VPS="${VPS_HOST:-}"
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --schema)
      SCHEMA="$2"
      shift 2
      ;;
    --track)
      TRACK="$2"
      shift 2
      ;;
    --host)
      VPS="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Error: Unknown flag '$1'" >&2
      usage >&2
      exit 1
      ;;
  esac
done

# --- Validate flags -------------------------------------------------------

ERRORS=()

if [[ -z "$SCHEMA" ]]; then
  ERRORS+=("--schema is required")
fi

if [[ -z "$TRACK" ]]; then
  ERRORS+=("--track is required")
fi

if [[ ${#ERRORS[@]} -gt 0 ]]; then
  for err in "${ERRORS[@]}"; do
    echo "Error: $err" >&2
  done
  echo "" >&2
  usage >&2
  exit 1
fi

# Validate --track
if [[ "$TRACK" != "bot" && "$TRACK" != "form" ]]; then
  echo "Error: --track must be 'bot' or 'form' (got '$TRACK')" >&2
  exit 1
fi

# Validate --schema (lowercase alpha + underscores, start with letter)
if ! [[ "$SCHEMA" =~ ^[a-z][a-z0-9_]*$ ]]; then
  echo "Error: --schema must be lowercase alphanumeric + underscores, starting with a letter (got '$SCHEMA')" >&2
  exit 1
fi

# Validate VPS host
if [[ "$DRY_RUN" == false && -z "$VPS" ]]; then
  echo "Error: --host is required (or set \$VPS_HOST env var)" >&2
  exit 1
fi

# --- Generate SQL ---------------------------------------------------------

generate_sql() {
  cat <<SQL
BEGIN;

-- Create schema
CREATE SCHEMA IF NOT EXISTS ${SCHEMA};

SQL

  if [[ "$TRACK" == "bot" ]]; then
    cat <<SQL
-- Create document_chunks table with standard RAG columns
CREATE TABLE IF NOT EXISTS ${SCHEMA}.document_chunks (
  id              SERIAL PRIMARY KEY,
  document_id     TEXT,
  chunk_text      TEXT,
  chunk_index     INTEGER DEFAULT 0,
  file_name       TEXT,
  file_path       TEXT,
  category        TEXT,
  subcategory     TEXT,
  section_title   TEXT,
  char_count      INTEGER,
  content_hash    TEXT,
  embedding       vector(1536),
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_${SCHEMA}_chunks_embedding
  ON ${SCHEMA}.document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Unique constraint on content_hash for dedup
CREATE UNIQUE INDEX IF NOT EXISTS idx_${SCHEMA}_chunks_content_hash
  ON ${SCHEMA}.document_chunks (content_hash)
  WHERE content_hash IS NOT NULL;

SQL
  else
    cat <<SQL
-- Form track: schema only. Add project-specific tables in {project}/sql/ and run them separately.

SQL
  fi

  cat <<SQL
-- Grant access to Supabase PostgREST roles
GRANT USAGE ON SCHEMA ${SCHEMA} TO anon;
GRANT USAGE ON SCHEMA ${SCHEMA} TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA ${SCHEMA} TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA ${SCHEMA} TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ${SCHEMA} TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ${SCHEMA} TO authenticated;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA ${SCHEMA} GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA ${SCHEMA} GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA ${SCHEMA} GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA ${SCHEMA} GRANT ALL ON SEQUENCES TO authenticated;

COMMIT;
SQL
}

# --- Execute or dry-run ---------------------------------------------------

SQL_OUTPUT=$(generate_sql)

if [[ "$DRY_RUN" == true ]]; then
  echo "--- DRY RUN: SQL that would be executed ---"
  echo ""
  echo "$SQL_OUTPUT"
  echo ""
  echo "--- Target: ssh ${VPS:-\$VPS_HOST} \"docker exec -i supabase-db psql -U postgres -d postgres\" ---"
  exit 0
fi

echo "Creating ${TRACK} schema '${SCHEMA}' on ${VPS}..."

echo "$SQL_OUTPUT" | ssh "${VPS}" "docker exec -i supabase-db psql -U postgres -d postgres"

echo ""
echo "✓ Schema '${SCHEMA}' created on ${VPS}"
if [[ "$TRACK" == "bot" ]]; then
  echo "  Table: ${SCHEMA}.document_chunks (with pgvector HNSW index)"
else
  echo "  Add project-specific tables in {project}/sql/ and run them separately."
fi
echo "  Roles: anon + authenticated granted access"
