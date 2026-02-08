---
phase: 01-foundation
plan: 02
subsystem: rag-pipeline
tags: [chunking, embedding, validation, rag, pgvector, openai]

# Dependency graph
requires:
  - phase: 01-01
    provides: factory directory tree with scripts/.gitkeep
provides:
  - chunk-knowledge.js (reusable markdown chunker)
  - embed-chunks.py (OpenAI embedding + pgvector insert)
  - validate-knowledge.py (6-check RAG quality gate)
affects: [01-03-knowledge-templates, 05-bot-scaffolder]

# Tech tracking
tech-stack:
  added: [openai-text-embedding-3-small, pgvector-hnsw, psycopg2]
  patterns: [env-var-only-creds, content-hash-dedup, schema-per-project, batch-embedding]

key-files:
  created:
    - factory/scripts/chunk-knowledge.js
    - factory/scripts/embed-chunks.py
    - factory/scripts/validate-knowledge.py
  modified: []

key-decisions:
  - "Zero npm dependencies for chunker -- Node.js stdlib only (fs, path, process)"
  - "All DB/API credentials via env vars exclusively -- zero hardcoded values"
  - "content_hash (md5) with UNIQUE constraint for dedup instead of truncate-by-default"
  - "MIN_CHUNK_SIZE filter applied after large-chunk splitting to catch runts"
  - "URL validation uses stdlib urllib, not requests -- one fewer dependency"
  - "Dependency check deferred after arg parsing so --help works without openai/psycopg2 installed"

patterns-established:
  - "CLI flag pattern: required flags with clear --help, no defaults that assume a specific bot"
  - "YAML frontmatter overrides path-based metadata when present"
  - "Standard table schema: {schema}.document_chunks with 14 columns"
  - "HNSW index created automatically (m=16, ef_construction=64)"

issues-created: []

# Metrics
duration: 7min
completed: 2026-02-07
---

# Phase 1 Plan 2: RAG Pipeline Scripts Summary

**Three reusable RAG pipeline scripts: chunk-knowledge.js (markdown chunker), embed-chunks.py (OpenAI embedder + pgvector), validate-knowledge.py (6-check quality gate)**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-08T03:51:17Z
- **Completed:** 2026-02-08T03:58:44Z
- **Tasks:** 3/3
- **Files created:** 3

## Accomplishments

- Generalized WaterBot's chunker into a reusable CLI with YAML frontmatter support, zero npm deps
- Generalized WaterBot's embedder with all credentials from env vars (removed hardcoded IP + password)
- Created new validation script implementing RAG Quality Gate (6 checks, clear PASS/FAIL output)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create chunk-knowledge.js** - `b70d2cd` (feat)
2. **Task 2: Create embed-chunks.py** - `2d50e5b` (feat)
3. **Task 3: Create validate-knowledge.py** - `2c5712f` (feat)

**Plan metadata:** `e352562` (docs: complete plan)

## Files Created

- `factory/scripts/chunk-knowledge.js` — Reusable markdown chunker (444 lines)
  - CLI: `--knowledge-dir`, `--output`, `--collection` (all required)
  - Split-on-H2, keep-H3-with-parent, prefix-H1 (proven WaterBot logic)
  - YAML frontmatter parsing for structured metadata
  - MAX_CHUNK_SIZE=2000, MIN_CHUNK_SIZE=100, paragraph-boundary splitting
  - Zero npm dependencies

- `factory/scripts/embed-chunks.py` — OpenAI embedder + pgvector inserter (380 lines)
  - CLI: `--chunks`, `--schema` (required), `--table` (default: document_chunks), `--fresh`
  - Env vars: DB_HOST, DB_PASSWORD, OPENAI_API_KEY (required); DB_PORT, DB_NAME, DB_USER (optional)
  - Auto-creates schema + table + HNSW index + unique constraint
  - Batch embedding (100/batch), content_hash dedup via ON CONFLICT

- `factory/scripts/validate-knowledge.py` — RAG quality gate (372 lines)
  - CLI: `--schema` (required), `--table` (default: document_chunks), `--skip-urls`
  - 6 checks: dedup, null embeddings, dimensions, chunk sizes, URL validation, content hash
  - Exit code 0 on PASS/WARN, 1 on FAIL
  - URL validation uses stdlib urllib (no requests dependency)

## Verification Results

### Task 1: chunk-knowledge.js
- Tested against WaterBot's 130 markdown files in `/waterbot/knowledge/`
- Produced 1252 chunks (valid JSON array)
- All required metadata fields present: document_id, chunk_text, chunk_index, file_name, file_path, category, subcategory, section_title, char_count, collection
- Min chunk: 101 chars, Max: 2000 chars (both within bounds)
- `--help` outputs clean usage documentation
- No hardcoded bot names (only example references in help text)

### Task 2: embed-chunks.py
- `--help` works without openai/psycopg2 installed
- Missing env vars produce clear error with instructions
- `grep` confirms zero hardcoded credentials (no IPs, passwords, or API keys)
- `--fresh` flag documented for opt-in truncate

### Task 3: validate-knowledge.py
- `--help` works without psycopg2 installed
- No `import requests` -- uses `urllib.request` from stdlib
- `--skip-urls` flag available for large URL sets
- All 6 checks implemented with PASS/FAIL/WARN/INFO output

## Deviations from Plan

1. **Bug fix (Rule 1):** Added MIN_CHUNK_SIZE filtering after `splitLargeChunk` step. Original WaterBot logic only filtered at the H2-split level, allowing tiny runts from paragraph splitting to pass through (e.g., 64-char chunks). Fixed by adding `.filter()` after `flatMap(splitLargeChunk)`.

2. **Dependency check ordering:** Moved dependency imports (openai, psycopg2) to after `parse_args()` so `--help` works even when packages aren't installed. This is a usability improvement consistent with the plan's intent.

## Issues Encountered

None.

## Next Phase Readiness
- All three pipeline scripts ready for use by any bot project
- Next: Plan 01-03 (knowledge document templates)
- No blockers or concerns

---
*Phase: 01-foundation*
*Completed: 2026-02-07*
