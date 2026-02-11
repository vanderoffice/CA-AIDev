---
phase: 03-db-rebuild
plan: 01
subsystem: database
tags: [postgresql, pgvector, waterbot, audit, strategy, ssh]

# Dependency graph
requires:
  - phase: 02-content-overhaul
    provides: 179 topics across 33 JSON files with 1,171 inline links
provides:
  - DB audit report (row counts, schema types, coverage analysis)
  - Clean-slate rebuild strategy decision (TRUNCATE + re-ingest)
affects: [03-02-rebuild-execution, 05-evaluation]

# Tech tracking
tech-stack:
  added: []
  patterns: [ssh-psql-audit-queries]

key-files:
  created: []
  modified: []

key-decisions:
  - "Clean-slate rebuild (TRUNCATE + re-ingest) over preserve+enhance — old content fully superseded, no unique value"
  - "url_registry.json safe to leave in content dir — ingestion script silently skips it (no documents key)"

patterns-established:
  - "DB audit via SSH piped SQL queries for remote inspection"

issues-created: []

# Metrics
duration: 9min
completed: 2026-02-11
---

# Phase 3 Plan 1: DB Strategy Assessment Summary

**Audited 1,286-row WaterBot DB (1,253 old chunked + 33 test rows), inventoried 179 new docs, selected clean-slate rebuild — old content has 6.2% link coverage vs 100% in new batch files**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-11T13:40:49Z
- **Completed:** 2026-02-11T13:49:57Z
- **Tasks:** 2 (1 auto + 1 decision checkpoint)
- **Files modified:** 0 (read-only audit)

## Accomplishments
- Full remote DB audit: 1,286 total rows — 1,253 old markdown-chunked (130 unique docs), 33 new-schema test rows
- Local content inventory: 179 docs across 33 JSON files, avg 2,811 chars, all with inline URLs and Take Action
- Coverage analysis proving new content fully supersedes old (179 topics > 130 old docs, 100% link coverage vs 6.2%)
- Confirmed ingestion script safely skips url_registry.json (no `documents` key)
- Clean-slate strategy selected with data-driven rationale

## Task Commits

1. **Task 1: Audit DB and inventory content** — no commit (read-only investigation)
2. **Task 2: Checkpoint decision** — no commit (strategy selection only)

*No code files modified in this assessment plan.*

## Files Created/Modified
- No source files modified (read-only audit plan)

## Decisions Made

**Clean-slate rebuild (TRUNCATE + re-ingest) selected.** Rationale:

| Factor | Old Content | New Content | Verdict |
|--------|------------|-------------|---------|
| Topics covered | 130 unique docs | 179 docs | New covers more |
| URL presence | 6.2% have markdown links | 100% (1,171 links) | New is vastly better |
| Content format | Chunked fragments (~9.6 chunks/doc) | Complete topic entries | New is better for RAG |
| Metadata schema | document_id/chunk_index | topic/category/subcategory | New is cleaner |
| DB size | 1,253 rows | 179 rows | New is leaner |

No unique content exists in old schema that isn't superseded by new batch files.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None

## Next Phase Readiness
- Strategy decided: clean-slate (TRUNCATE + re-ingest)
- Ingestion script verified safe for url_registry.json
- Ready for 03-02: Execute rebuild (TRUNCATE, re-embed 179 docs, reingest, REINDEX IVFFlat)
- Expected: ~179 OpenAI embedding API calls, ~5-10 min ingestion window

---
*Phase: 03-db-rebuild*
*Completed: 2026-02-11*
