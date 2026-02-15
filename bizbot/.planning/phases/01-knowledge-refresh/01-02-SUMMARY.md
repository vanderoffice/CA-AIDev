---
phase: 01-knowledge-refresh
plan: 02
subsystem: knowledge
tags: [bot-ingest, pgvector, openai-embeddings, url-audit, bot-eval, deduplication]

# Dependency graph
requires:
  - phase: 01-knowledge-refresh/01
    provides: Corrected source markdown files with dead URLs replaced
  - phase: 00-audit-baseline
    provides: Embedding eval baseline (94.3% coverage, 29S/4A/2W)
provides:
  - Fresh pgvector database with 387 chunks (corrected URLs, deduplicated)
  - Embedding eval showing 100% coverage (29S/6A/0W)
  - Verified URL health improvement (6 dead URLs eliminated)
  - Archived eval history for Phase 5 baseline comparison
affects: [phase-3-tool-rebuilds, phase-5-integration-e2e]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "bot-ingest --replace pipeline: chunk → embed → TRUNCATE → INSERT → verify → dedup"

key-files:
  created:
    - .planning/phases/01-knowledge-refresh/01-02-eval-report.md
  modified: []

key-decisions:
  - "Deduplicated 2 identical preamble chunks from 3 BizInterviews_*.md files sharing same Perplexity header"
  - "Bot-blocking 403s (ftb ×29, sos ×3) remain in raw score — documented, not fixable"

patterns-established:
  - "Adjusted URL score: exclude known bot-blocking WAF domains for true health measure"

issues-created: []

# Metrics
duration: 15min
completed: 2026-02-15
---

# Phase 1 Plan 2: Re-ingest & Verify Summary

**Re-ingested 387 chunks with corrected URLs into pgvector, achieving 100% embedding coverage (up from 94.3%) with zero WEAK queries**

## Performance

- **Duration:** 15 min
- **Started:** 2026-02-15T14:19:15Z
- **Completed:** 2026-02-15T14:34:26Z
- **Tasks:** 2
- **Files modified:** 1 (eval report)

## Accomplishments

- Re-ingested 387 deduplicated chunks from 33 files into `bizbot_documents` via full replace pipeline
- All 6 originally-dead URLs confirmed eliminated from database — replacements all return HTTP 200
- Embedding eval improved: 100% coverage (29 STRONG / 6 ACCEPTABLE / 0 WEAK) vs baseline 94.3% (29S / 4A / 2W)
- Both previously WEAK queries (`injection_03`, `offtopic_03`) improved to ACCEPTABLE
- Eval results archived to `~/.claude/data/bot-refresh-history.json` for Phase 5 `--baseline auto` comparison

## Task Commits

Each task was committed atomically:

1. **Task 1: Re-ingest corrected knowledge base** — no local files changed (database-only via SSH)
2. **Task 2: Verify URL health and embedding quality** — `808c39b` (feat)

## Files Created/Modified

- `.planning/phases/01-knowledge-refresh/01-02-eval-report.md` — Post-refresh embedding eval report

## Decisions Made

- **Deduplicated 2 preamble chunks:** 3 BizInterviews files (CGPT5, Gemini3P, Sonnet4_5) shared identical Perplexity header text producing 3 copies of the same chunk. Removed 2 duplicates, kept 1.
- **URL audit raw score unchanged (60):** Bot-blocking WAF domains (ftb.ca.gov ×29, bizfileonline ×3) dominate "broken" count. Adjusted accessible rate: 88.3% (excluding 32 false positives). All fixable URLs were fixed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Deduplicated 2 identical chunks after ingest**
- **Found during:** Task 1 (verify.py quality gate)
- **Issue:** 3 BizInterviews_*.md files share identical Perplexity header preamble, producing 3 copies of the same chunk (md5 hash `839d50ac7b7f98839e961f9cab660335`)
- **Fix:** SQL dedup via `ROW_NUMBER() OVER (PARTITION BY md5(content::text))` — deleted 2 extra rows
- **Files modified:** None (database-only)
- **Verification:** verify.py re-run: all gates PASSED (0 duplicates)
- **Committed in:** N/A (database operation)

---

**Total deviations:** 1 auto-fixed (duplicate content from source files)
**Impact on plan:** Minor — 3 fewer chunks than expected (389 pre-dedup → 387 post-dedup vs 392 baseline). No impact on coverage or quality.

## Issues Encountered

None

## Metrics Comparison

| Metric | Phase 0 Baseline | Post-Refresh | Delta |
|--------|-----------------|--------------|-------|
| Chunk count | 392 | 387 | -5 (URL text changes + dedup) |
| Duplicates | 0 | 0 | (fixed during ingest) |
| NULL content | 0 | 0 | -- |
| Embedding dim | 1536 | 1536 | -- |
| Coverage rate | 94.3% | 100.0% | +5.7% |
| STRONG | 29 | 29 | -- |
| ACCEPTABLE | 4 | 6 | +2 |
| WEAK | 2 | 0 | -2 |
| URL raw score | 60 | 60 | -- (bot-blocking unchanged) |
| Dead URLs in DB | 6 | 0 | -6 (all fixed) |

## Next Phase Readiness

- Knowledge base fully refreshed and verified
- Phase 1: Knowledge Refresh is COMPLETE (2/2 plans done)
- Ready for Phase 3: Tool Rebuilds (Phase 2 skipped per ROADMAP)
- No blockers

---
*Phase: 01-knowledge-refresh*
*Completed: 2026-02-15*
