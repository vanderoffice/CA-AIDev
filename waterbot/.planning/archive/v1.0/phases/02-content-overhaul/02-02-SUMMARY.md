---
phase: 02-content-overhaul
plan: 02
subsystem: content
tags: [waterbot, json-rewrite, inline-urls, take-action, programs, public-resources, funding, safer, dwsrf, cwsrf, dac]

# Dependency graph
requires:
  - phase: 01-url-registry
    provides: Validated URL registry with 179 topics x 2-5 verified URLs each
  - phase: 02-content-overhaul/02-01
    provides: Rewrite pattern established for inline URLs + Take Action sections
provides:
  - 25 topics rewritten with inline markdown URLs and Take Action sections
  - 9 JSON files (2 batch + 7 individual) enhanced with registry URLs
  - Programs, public resources, and all funding guides now fully actionable
affects: [02-03, 02-04, 03-db-rebuild]

# Tech tracking
tech-stack:
  added: []
  patterns: [inline-url-weaving, take-action-sections, batch-json-content-enhancement]

key-files:
  modified:
    - rag-content/waterbot/batch_programs.json
    - rag-content/waterbot/batch_public_resources.json
    - rag-content/waterbot/safer_overview.json
    - rag-content/waterbot/safer_eligibility.json
    - rag-content/waterbot/safer_funding_amounts.json
    - rag-content/waterbot/cwsrf_guide.json
    - rag-content/waterbot/dwsrf_guide.json
    - rag-content/waterbot/dac_grants.json
    - rag-content/waterbot/small_community_funding.json

key-decisions:
  - "No [verify] flags needed -- all funding amounts, interest rates, eligibility thresholds matched current published sources"
  - "Bare URLs in 7 individual funding files converted to labeled markdown links for consistency"
  - "Funding-specific Take Action steps emphasize: check eligibility -> apply through FAAST -> contact DFA"

patterns-established:
  - "Funding-oriented Take Action: eligibility check first, then application portal, then contact info"
  - "DAC Mapping Tool link woven into every file that mentions disadvantaged community thresholds"

issues-created: []

# Metrics
duration: ~12min
completed: 2026-02-11
---

# Phase 2 Plan 2: Programs, Public Resources & Funding Content Rewrite Summary

**Rewrote 25 topics across 9 JSON files with inline registry URLs and Take Action sections -- programs, public resources, SAFER (3 files), CWSRF, DWSRF, DAC grants, and small community funding**

## Performance

- **Duration:** ~12 min
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- 8 program docs (recycled water, TMDLs, beach monitoring, wetlands, water rights, septic, UST, site cleanup) rewritten with inline markdown links from URL registry
- 10 public resource docs (reporting problems, water bills, shutoff protections, home testing, POU treatment, conservation, landscaping, CCRs, emergency water quality, environmental justice) rewritten with inline links
- 7 individual funding files (SAFER overview/eligibility/amounts, CWSRF guide, DWSRF guide, DAC grants, small community funding) updated with consistent URL format
- Every topic has 2-10 inline `[Label](URL)` references woven at natural citation points
- Every topic has a `## Take Action` section with 3-5 numbered actionable steps linked to registry URLs
- All funding amounts, interest rates (~1.9% DWSRF), DAC thresholds (MHI < 80%/60%), and program details verified against current published sources

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite 2 batch files (18 docs)** - `a319607` (feat)
2. **Task 2: Update 7 individual funding files + verify all 9** - `1e733e0` (feat)

## Verification Results

Comprehensive Python check across all 9 files:
- 25/25 topics have >= 2 inline markdown URLs (range: 5-10 links per topic)
- 25/25 topics have `## Take Action` sections
- All 9 files pass JSON validity
- All metadata preserved unchanged

## Files Created/Modified

- `rag-content/waterbot/batch_programs.json` -- 8 program topics enhanced
- `rag-content/waterbot/batch_public_resources.json` -- 10 public resource topics enhanced
- `rag-content/waterbot/safer_overview.json` -- SAFER overview with registry URLs + Take Action
- `rag-content/waterbot/safer_eligibility.json` -- SAFER eligibility with DAC mapping tool link + Take Action
- `rag-content/waterbot/safer_funding_amounts.json` -- SAFER funding amounts with DWSRF link + Take Action
- `rag-content/waterbot/cwsrf_guide.json` -- CWSRF guide with IUP PDF link + Take Action
- `rag-content/waterbot/dwsrf_guide.json` -- DWSRF guide with lead service line funding link + Take Action
- `rag-content/waterbot/dac_grants.json` -- DAC grants with 4 program links + Take Action
- `rag-content/waterbot/small_community_funding.json` -- Small community funding with 5 program links + Take Action

## Decisions Made

- No `[verify]` flags needed -- funding amounts ($130M SAFER annual, ~$514M CWSRF principal forgiveness, ~$2.8B CWSRF fundable list), interest rates (~1.9% DWSRF), and DAC thresholds (80%/60% statewide MHI) all match current FY 2025-26 published data
- Bare URLs in all 7 individual funding files converted to labeled markdown links
- Funding Take Action sections consistently guide users: check eligibility/DAC status -> apply through FAAST -> explore specific programs -> contact DFA at (916) 341-5700

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

None.

## Cumulative Progress

After Plans 02-01 and 02-02:
- **62 topics** rewritten across **17 files** (37 from 02-01 + 25 from 02-02)
- Plans 02-03 and 02-04 cover remaining batch files (conservation, advocacy, operator guides, regional boards, gap filler, small systems)

---
*Phase: 02-content-overhaul*
*Completed: 2026-02-11*
