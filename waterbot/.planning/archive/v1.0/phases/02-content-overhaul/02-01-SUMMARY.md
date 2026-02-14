---
phase: 02-content-overhaul
plan: 01
subsystem: content
tags: [waterbot, json-rewrite, inline-urls, take-action, consumer-faq, permits, pollutants, ca-gov]

# Dependency graph
requires:
  - phase: 01-url-registry
    provides: Validated URL registry with 179 topics × 2-5 verified URLs each
provides:
  - 37 topics rewritten with inline markdown URLs and Take Action sections
  - Rewrite pattern established for Plans 02-02 through 02-04
  - 8 JSON files (3 batch + 5 individual) enhanced with registry URLs
affects: [02-02, 02-03, 02-04, 03-db-rebuild]

# Tech tracking
tech-stack:
  added: []
  patterns: [inline-url-weaving, take-action-sections, batch-json-content-enhancement]

key-files:
  modified:
    - rag-content/waterbot/batch_consumer_faq.json
    - rag-content/waterbot/batch_permits_compliance.json
    - rag-content/waterbot/batch_pollutants.json
    - rag-content/waterbot/401_certification_fees.json
    - rag-content/waterbot/npdes_application_guide.json
    - rag-content/waterbot/npdes_permit_fees.json
    - rag-content/waterbot/stormwater_permit_fees.json
    - rag-content/waterbot/water_quality_testing.json

key-decisions:
  - "No [verify] flags needed — all fees, MCLs, and deadlines matched current published sources"
  - "Bare URLs in individual files converted to labeled markdown links for consistency"

patterns-established:
  - "Content rewrite pattern: load registry → match topic → weave inline links → add Take Action → preserve metadata"
  - "Take Action format: 3-5 numbered steps with action verbs, each linking to registry URL by type"

issues-created: []

# Metrics
duration: 7min
completed: 2026-02-11
---

# Phase 2 Plan 1: Core Content Rewrite Summary

**Rewrote 37 topics across 8 JSON files with inline registry URLs and Take Action sections — consumer FAQ, permits & compliance, pollutants, plus 5 individual fee/guide files**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-11T04:04:18Z
- **Completed:** 2026-02-11T04:11:22Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- 32 batch docs (12 consumer FAQ + 10 permits & compliance + 10 pollutants) rewritten with inline markdown links from URL registry
- 5 individual files (401 cert fees, NPDES application/fees, stormwater fees, water quality testing) updated with consistent URL format
- Every topic has 2-5 inline `[Label](URL)` references woven at natural citation points
- Every topic has a `## Take Action` section with 3-5 numbered actionable steps linked to registry URLs
- All fee amounts, MCLs, and deadlines verified against current published sources — no `[verify]` flags needed

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite 3 batch files (32 docs)** - `132f75b` (feat)
2. **Task 2: Update 5 individual files + verify all 8** - `644bf06` (feat)

## Files Created/Modified

- `rag-content/waterbot/batch_consumer_faq.json` — 12 consumer FAQ topics enhanced
- `rag-content/waterbot/batch_permits_compliance.json` — 10 permits & compliance topics enhanced
- `rag-content/waterbot/batch_pollutants.json` — 10 pollutant topics enhanced
- `rag-content/waterbot/401_certification_fees.json` — Fee info with registry URLs + Take Action
- `rag-content/waterbot/npdes_application_guide.json` — Application guide with registry URLs + Take Action
- `rag-content/waterbot/npdes_permit_fees.json` — Permit fees with registry URLs + Take Action
- `rag-content/waterbot/stormwater_permit_fees.json` — Stormwater fees with registry URLs + Take Action
- `rag-content/waterbot/water_quality_testing.json` — Testing guide with registry URLs + Take Action

## Decisions Made

- No `[verify]` flags were needed — all fee amounts (FY 2025-26 schedule), MCLs, and deadlines matched current published CA sources
- Bare URLs in 5 individual files converted to labeled markdown links using registry `label` fields for consistency with batch file format

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Rewrite pattern fully established and proven on 37 topics
- Plans 02-02 through 02-04 can follow identical methodology for remaining batch files
- Registry URL coverage confirmed sufficient for content enhancement

---
*Phase: 02-content-overhaul*
*Completed: 2026-02-11*
