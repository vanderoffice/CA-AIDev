---
phase: 01-foundation
plan: 03
subsystem: templates
tags: [knowledge-template, decision-tree, json-schema, rag-migration, pgvector, sql]

# Dependency graph
requires:
  - phase: 01-01
    provides: factory directory tree with templates/knowledge/.gitkeep
  - phase: 01-02
    provides: chunk-knowledge.js chunking conventions (H2 boundaries, frontmatter injection)
provides:
  - Knowledge document TEMPLATE.md (authoring standard for all bots)
  - Decision tree JSON Schema (validates WaterBot-style tree structure)
  - RAG table migration SQL (standardizes existing bots to {schema}.document_chunks)
affects: [02-scaffolder, 03-research-to-knowledge, 05-bot-frontend]

# Tech tracking
tech-stack:
  added: [json-schema-draft-07]
  patterns: [h2-chunk-boundary, frontmatter-metadata-injection, copy-first-migration, jsonb-extraction]

key-files:
  created:
    - factory/templates/knowledge/TEMPLATE.md
    - factory/templates/knowledge/decision-tree-schema.json
    - factory/scripts/migrate-rag-tables.sql
  modified: []

key-decisions:
  - "Decision tree schema derived from actual WaterBot JSON (title field, not question) — matches production data"
  - "BizBot uses same standard table schema as WaterBot — plan's assumed rich columns don't exist"
  - "Both source tables are in postgres DB — cross-database note corrected from plan assumptions"
  - "BizBot-specific extra columns removed from target — sparse metadata preserved in JSONB"

patterns-established:
  - "Knowledge authoring standard: 7-field YAML frontmatter, H2 = chunk boundary, 500-1500 char target per section"
  - "Decision tree standard: meta + nodes, question/result node types, option.next references node keys"
  - "Migration standard: copy-first (no DROP), idempotent (IF NOT EXISTS), independent per-bot sections"

issues-created: []

# Metrics
duration: 15min
completed: 2026-02-08
---

# Phase 1 Plan 3: Knowledge Templates + RAG Migration Summary

**Knowledge document TEMPLATE.md with chunk-friendly authoring guide, decision tree JSON Schema from WaterBot production data, and verified RAG table migration SQL for WaterBot/BizBot standardization**

## Performance

- **Duration:** 15 min
- **Started:** 2026-02-08T04:01:41Z
- **Completed:** 2026-02-08T04:16:41Z
- **Tasks:** 3/3 (2 auto + 1 checkpoint)
- **Files created:** 3

## Accomplishments

- Knowledge TEMPLATE.md establishes authoring standard aligned with chunk-knowledge.js conventions (H2 boundaries, frontmatter injection, size guidance)
- Decision tree JSON Schema (draft-07) formalizes WaterBot's actual node structure with full validation
- Migration SQL verified against live VPS database — corrected plan's incorrect assumptions about BizBot schema and WaterBot database location

## Task Commits

Each task was committed atomically:

1. **Task 1: Knowledge template + decision tree schema** — `fcd7488` (feat)
2. **Task 2: RAG table migration SQL** — `2cd70b3` (feat)
3. **Task 3: Human verification of migration SQL** — (checkpoint, no commit)

## Files Created

- `factory/templates/knowledge/TEMPLATE.md` — Knowledge document authoring standard (81 lines)
  - 7-field YAML frontmatter (title, domain, category, subcategory, source_authority, source_urls, last_verified)
  - HTML comment blocks explaining chunk-knowledge.js conventions
  - Authoring checklist for document authors

- `factory/templates/knowledge/decision-tree-schema.json` — JSON Schema draft-07 (168 lines)
  - Derived from actual WaterBot permit-decision-tree.json and funding-decision-tree.json
  - Validates questionNode (title, helpText, options[]) and resultNode (title, description, ragQuery?, links?)
  - Option nodes require id, label, next (referencing other node keys)

- `factory/scripts/migrate-rag-tables.sql` — RAG table migration (367 lines)
  - WaterBot: public.waterbot_documents (1,253 rows) → waterbot.document_chunks with JSONB extraction
  - BizBot: public.bizbot_documents (392 rows) → bizbot.document_chunks with sparse JSONB extraction
  - KiddoBot: already standard, optional ALTER TABLE for missing columns
  - HNSW indexes + content_hash unique constraints on all target tables

## Decisions Made

- Decision tree schema uses `title` field (not `question`) matching actual WaterBot JSON — plan's context used a different field name
- BizBot target table uses standard 15-column schema (no extra columns) — plan assumed rich dedicated columns that don't exist in production
- Cross-database note corrected: both WaterBot and BizBot sources are in postgres DB, not n8n

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected BizBot migration column mappings**
- **Found during:** Task 3 (checkpoint verification against live VPS)
- **Issue:** Plan assumed BizBot had 15+ dedicated columns (content_hash, source_file, source_section, topic, industries[], agencies[], cities[], counties[], chunk_level, verification_status, confidence). Actual table has 4 columns (id, content, metadata JSONB, embedding) — same as WaterBot.
- **Fix:** Rewrote BizBot migration to use JSONB metadata extraction (same pattern as WaterBot). Removed nonexistent BizBot-specific columns from target table.
- **Files modified:** factory/scripts/migrate-rag-tables.sql
- **Verification:** Verified column names against `information_schema.columns` via SSH
- **Committed in:** `2cd70b3` (amended Task 2 commit)

**2. [Rule 1 - Bug] Corrected cross-database assumption**
- **Found during:** Task 3 (checkpoint verification against live VPS)
- **Issue:** Plan stated WaterBot data is in `n8n` database. Actual: `public.waterbot_documents` exists in `postgres` database (verified via SSH).
- **Fix:** Replaced cross-database migration options section with verified database note documenting actual locations and row counts.
- **Files modified:** factory/scripts/migrate-rag-tables.sql
- **Verification:** `SELECT table_name FROM information_schema.tables` against both databases
- **Committed in:** `2cd70b3` (amended Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs from incorrect plan context), 0 deferred
**Impact on plan:** Both fixes critical for migration correctness — SQL would have failed without them. No scope creep.

## Issues Encountered

None — plan assumptions were incorrect but caught during live verification.

## Next Phase Readiness

- **Phase 1 complete** — factory directory, RAG pipeline scripts, knowledge templates, and migration SQL all in place
- All three pipeline scripts ready for any new bot project
- Knowledge template establishes authoring standard for Phase 3 (research-to-knowledge)
- Migration SQL ready for manual execution after review
- No blockers or concerns

---
*Phase: 01-foundation*
*Completed: 2026-02-08*
