---
phase: 05-evaluation
plan: 01
subsystem: evaluation
tags: [pgvector, adversarial-eval, url-validation, openai-embeddings, ssh-pipeline]

# Dependency graph
requires:
  - phase: 03-db-rebuild
    provides: Clean-slate 179-doc DB with URL-rich content
  - phase: 04-system-prompt
    provides: Fixed RAG credentials and link-surfacing prompt
provides:
  - Post-overhaul adversarial evaluation data (35/35 STRONG)
  - URL health validation across all 3 bots
  - Deferred issue resolution analysis
affects: [05-02-regression-analysis]

# Tech tracking
tech-stack:
  added: []
  patterns: [adversarial-eval-pipeline, parallel-url-validation, inline-embedding-scripts]

key-files:
  created:
    - .planning/adversarial_evaluation_20260211_073927.json
    - .planning/coverage_gaps_20260211_073927.json
    - url_validation_results.json
    - .planning/phases/05-evaluation/deferred_issue_analysis.md
  modified:
    - scripts/test_all_urls.py

key-decisions:
  - "403s from CA gov sites classified as OK (bot protection, not broken links)"
  - "Conservation query ACCEPTABLE (0.387) = no action needed — phrasing issue, not content gap"

patterns-established:
  - "Inline Python embedding scripts for one-off similarity queries"

issues-created: []

# Metrics
duration: 9 min
completed: 2026-02-11
---

# Phase 5 Plan 1: Adversarial Evaluation & URL Validation Summary

**35/35 WaterBot queries scored STRONG (100% coverage, up from 94.3% baseline), 313 URLs validated with 100% document coverage, all deferred issues investigated and resolved/documented**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-11T15:36:12Z
- **Completed:** 2026-02-11T15:45:13Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Full adversarial evaluation: WaterBot 35/35 STRONG (100%), BizBot 25/25 STRONG, KiddoBot 25/25 STRONG
- URL validation: 313 waterbot URLs tested — 304 OK (97.1%), 2 genuine 404s, 4 bot-protection 403s, 1 EPA DNS failure
- URL coverage confirmed: 179/179 waterbot documents contain URLs (100%)
- All 3 deferred issues investigated with evidence: complaint gap resolved, conservation query acceptable, file_name null by design

## Task Commits

Each task was committed atomically:

1. **Task 1: Run full adversarial evaluation** — `33fe793` (feat)
2. **Task 2: Validate all URLs across bot databases** — `3a44309` (feat)
3. **Task 3: Investigate deferred evaluation issues** — `e2aac04` (feat)

## Files Created/Modified

- `.planning/adversarial_evaluation_20260211_073927.json` — Full evaluation data (76KB), all 3 bots, 85 queries
- `.planning/coverage_gaps_20260211_073927.json` — Gap analysis (empty — 0 gaps across all bots)
- `url_validation_results.json` — URL health data for all 3 bots (6KB)
- `.planning/phases/05-evaluation/deferred_issue_analysis.md` — Investigation of 3 deferred issues with similarity scores
- `scripts/test_all_urls.py` — Fixed URL extraction method (stdin pipe instead of nested shell escaping)

## WaterBot Adversarial Evaluation Detail

| Metric | Baseline (Pre-Overhaul) | Post-Overhaul | Delta |
|--------|------------------------|---------------|-------|
| STRONG | 33/35 (94.3%) | 35/35 (100%) | +2 |
| ACCEPTABLE | 0/35 | 0/35 | — |
| WEAK | 2/35 | 0/35 | -2 |
| NO_RESULTS | 0/35 | 0/35 | — |
| Coverage rate | 94.3% | 100% | +5.7pp |

**Lowest 5 scorers (all still STRONG):**

| Query | Score | Topic |
|-------|-------|-------|
| wat-016 | 0.436 | Pregnancy precautions |
| wat-021 | 0.450 | Illegal dumping reporting |
| wat-012 | 0.479 | Failing water system |
| wat-008 | 0.486 | Landlord water quality rights |
| wat-011 | 0.490 | Arsenic water filter |

## URL Validation Detail

| Bot | Total URLs | OK (200) | 3xx | 4xx | 5xx | DNS | Other |
|-----|-----------|----------|-----|-----|-----|-----|-------|
| WaterBot | 313 | 304 | 2 | 6 | 0 | 1 | 0 |
| BizBot | 229 | 222 | 3 | 3 | 0 | 0 | 1 |
| KiddoBot | 247 | 221 | 1 | 11 | 0 | 13 | 1 |

**WaterBot broken URLs (2 genuine 404s):**
- `epa.gov/npdes/industrial-pretreatment` — EPA page restructured
- `waterboards.ca.gov/.../PFAS.html` — SWRCB PFAS page moved

**WaterBot 403s (4, all bot protection):** GeoTracker (×2), EnviroStor, GAMA Groundwater
**WaterBot DNS (1):** `enviro.epa.gov` — EPA infrastructure, no route to host

## Deferred Issue Resolution

| Issue | Verdict | Evidence |
|-------|---------|----------|
| "Conservation as a Way of Life" retrieval | **Partially resolved** | Top score 0.391 ACCEPTABLE. Content retrieved correctly (doc 50 ranks 3rd), but broad phrasing depresses score below STRONG threshold. Not a content gap. |
| "File complaint" retrieval | **Resolved** | Now scores 0.608 STRONG. Doc 13 "Reporting Water Quality Problems" fills the gap. Direct result of Phase 3 rebuild. |
| `file_name` metadata null | **Cosmetic** | By design — docs ingested from content strings, metadata uses topic/category/source_urls instead. |

## Decisions Made

- 403 responses from CA gov sites (GeoTracker, EnviroStor, GAMA) classified as OK — bot protection, not broken links. Consistent with Phase 01-04 decision.
- Conservation query scoring ACCEPTABLE (0.387) = no action needed — a phrasing specificity issue, not a content gap. Adversarial query wat-035 covers same content area at 0.621 STRONG.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Fixed URL extraction in test_all_urls.py**
- **Found during:** Task 2 (URL validation)
- **Issue:** Nested shell escaping in SSH command caused URL extraction to fail
- **Fix:** Changed to stdin pipe method (consistent with run_adversarial_evaluation.py pattern)
- **Files modified:** scripts/test_all_urls.py
- **Verification:** Script successfully extracted and tested 313 waterbot URLs
- **Committed in:** 3a44309 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (blocking), 0 deferred
**Impact on plan:** Essential fix for URL extraction. No scope creep.

## Issues Encountered

None — all scripts ran successfully after the URL extraction fix.

## Next Phase Readiness

Raw evaluation data is complete and ready for Plan 05-02 regression analysis:
- Adversarial evaluation JSON with all 85 queries scored across 3 bots
- URL validation JSON with all 789 URLs tested
- Coverage gaps JSON (empty — 0 gaps)
- Deferred issue analysis with similarity evidence
- Baseline comparison file already exists: `.planning/adversarial_evaluation_20260210_152315.json`

No blockers for 05-02.

---
*Phase: 05-evaluation*
*Completed: 2026-02-11*
