---
phase: 03-funding-data-model
plan: 01
subsystem: database
tags: [json, funding, eligibility, data-model, knowledge-extraction]

# Dependency graph
requires:
  - phase: 01-shared-infrastructure/01-02
    provides: ResultCard display pattern (details grid, expandable sections)
  - phase: 02-permit-finder/02-03
    provides: ragQuery pattern and RAG enrichment contract
provides:
  - Machine-readable funding catalog (58 programs) with typed eligibility predicates
  - ragQuery strings for every program (RAG enrichment ready)
  - relatedPrograms cross-references between related funding sources
affects: [04-funding-navigator, 05-integration-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [flat-array-filter-matching, typed-eligibility-predicates, three-value-dac-status]

key-files:
  created: [public/funding-programs.json]
  modified: []

key-decisions:
  - "Flat array (not tree) because funding matching is filter-based, not path-based"
  - "Three-value dacRequired (false/true/'preferred') for programs that prefer but don't require DAC"
  - "relatedPrograms uses ID cross-refs for Phase 5 cross-linking"
  - "Conservative figures where sources conflict, with notes explaining discrepancy"
  - "FAAST portal URL for all state programs where applicable"

patterns-established:
  - "Typed eligibility predicates: entityTypes[], projectTypes[], dacRequired, populationMax, matchRequired"
  - "fundingRange with min/max/notes pattern for variable amounts"
  - "principalForgiveness object separating availability from conditions"

issues-created: []

# Metrics
duration: 12min
completed: 2026-02-14
---

# Phase 3 Plan 1: Funding Data Model Summary

**58 funding programs extracted from 15 markdown + 7 RAG JSON knowledge files into typed `funding-programs.json` with eligibility predicates, cross-references, and ragQuery for every program**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-14T02:54:27Z
- **Completed:** 2026-02-14T03:06:48Z
- **Tasks:** 2
- **Files created:** 1

## Accomplishments

- Designed funding-programs.json schema with 18 required fields per program including typed eligibility predicates
- Extracted 58 distinct programs across all 5 categories from 22 source files
- Every program has ragQuery for RAG enrichment (consistent with permit-decision-tree.json pattern)
- All relatedPrograms cross-references validated — no broken links

## Task Commits

Each task was committed atomically:

1. **Task 1: Design funding-programs.json schema** - `0bbd4d3` (feat)
2. **Task 2: Extract all programs from knowledge base** - `d70b8f5` (feat)

## Files Created/Modified

- `public/funding-programs.json` — 58 funding programs (~2400 lines), version 1.0.0, typed eligibility predicates

## Programs by Category

| Category | Count | Examples |
|----------|-------|---------|
| state-srf | 7 | DWSRF, CWSRF, SAFER, SCDW, Lead Service Line, Consolidation Incentives, SAFER O&M |
| state-grant | 14 | Emerging Contaminants, WRFP, UDWN, IRWM, Prop 1/4/68 chapters, Drought Relief |
| federal | 19 | WIFIA, USDA (4), WaterSMART (4), FEMA (3), Title XVI, USACE, CDBG, EDA, EPA (3) |
| private | 11 | Packard, Hewlett, Moore, NFWF, Water Foundation, Pisces, CCF, RLF, Spring Point, EIB, Green Bonds |
| technical-assistance | 7 | RCAC, RCAC Tribal, CRWA, Self-Help Enterprises, CWC, State TA, USDA Circuit Rider |

## Decisions Made

- Flat array structure for filter-based matching (not tree/path-based like permit-decision-tree.json)
- Three-value `dacRequired` field (false/true/"preferred") — some programs prefer but don't require DAC status
- `relatedPrograms` uses ID cross-references for Phase 5 cross-linking feature
- Conservative figures where sources conflict, noted in `fundingRange.notes` or `interestRate.notes`
- FAAST portal URL for all applicable state programs
- Invitation-only foundations noted in `additionalCriteria` rather than omitted

## Deviations from Plan

- Plan targeted 50+ programs; delivered 58 (8 above minimum)
- Added 3 extra programs as distinct entries (SAFER O&M, Consolidation Incentives, WaterSMART Planning) — each has unique eligibility streams
- No architectural changes; no Rule 4 consultations needed

**Total deviations:** 0 auto-fixed, 0 deferred
**Impact on plan:** Exceeded target count. No scope creep.

## Issues Encountered

None

## Next Phase Readiness

- `funding-programs.json` ready for Phase 3 Plan 2 (live source verification)
- Data model ready for Phase 4 matching algorithm consumption
- All ragQuery strings ready for RAG enrichment (same pattern as Permit Finder)
- Known data freshness items: BRIC program suspended (litigation), Prop 1 Groundwater closed, some foundation programs invitation-only

---
*Phase: 03-funding-data-model*
*Completed: 2026-02-14*
