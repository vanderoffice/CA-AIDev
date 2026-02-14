---
phase: 03-funding-data-model
plan: 02
subsystem: database
tags: [json, funding, verification, eligibility, data-quality, web-research]

# Dependency graph
requires:
  - phase: 03-funding-data-model/03-01
    provides: 58-program funding-programs.json with typed eligibility predicates
provides:
  - Verified funding catalog with all URLs confirmed, tags normalized, data sorted
  - Phase 4-ready data model with zero broken cross-references
affects: [04-funding-navigator, 05-integration-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [canonical-tag-normalization, programUrl-verification]

key-files:
  created: []
  modified: [public/funding-programs.json]

key-decisions:
  - "Grant programs correctly have null interestRate (not a gap)"
  - "EIB/green-bonds get EPA/Climate Bonds Standard URLs as reference (financing mechanisms, not programs)"
  - "Canonical tags added to all 58 programs for Phase 4 matching consistency"

patterns-established:
  - "13 canonical tags for matching: drinking-water, wastewater, stormwater, recycling, small-community, dac, emergency, planning, consolidation, infrastructure, operations, environmental, tribal"

issues-created: []

# Metrics
duration: 5min
completed: 2026-02-14
---

# Phase 3 Plan 2: Funding Data Verification Summary

**All 58 funding programs verified against CA.gov and federal sources — 11 missing programUrls filled, 25 canonical tags added, 4 tags normalized, programs sorted by category+name, all cross-references validated**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-14T03:12:18Z
- **Completed:** 2026-02-14T03:17:39Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Verified 21 state programs (7 state-srf, 14 state-grant) against SWRCB, DWR, and bond accountability sources
- Verified 19 federal programs against EPA, FEMA, USDA, Bureau of Reclamation, USACE, HUD, and EDA sources
- Filled 11 missing programUrls from verified government sources
- Added canonical tags to 21 programs that lacked them
- Normalized `water-recycling` tag to canonical `recycling` across 4 programs
- Sorted all 58 programs by category+name for consistent ordering
- Validated all relatedPrograms cross-references (0 broken links)
- Confirmed BRIC program terminated April 2025 (data already reflected this)

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify state programs against CA.gov sources** - `41940fa` (feat)
2. **Task 2: Verify federal programs, normalize tags, validate data model** - `928adc9` (feat)

## Files Created/Modified

- `public/funding-programs.json` — 11 URLs added, 25 canonical tags added, 4 tags normalized, sorted by category+name

## Verification Sources Checked

| Source | Programs Verified |
|--------|------------------|
| SWRCB Financial Assistance | DWSRF, CWSRF, SAFER, SCDW, LSLR, emerging contaminants, WRFP, sc-wastewater, UDWN, Section 319 |
| SWRCB SAFER Program | SAFER, SAFER O&M |
| DWR Drought Funding | sc-drought-relief, urban-drought-relief |
| Bond Accountability (CNRA) | Prop 1, Prop 4, Prop 68 |
| CA Water Commission | WSIP |
| EPA | WIFIA, EJ Small Grants, Brownfields, Section 319 |
| FEMA | HMGP, BRIC (terminated), FMA |
| USDA Rural Development | WWD, ECWAG, SEARCH, Colonias |
| Bureau of Reclamation | WaterSMART (4 programs), Title XVI |
| USACE | Section 219 |
| HUD/HCD | CDBG |
| EDA | Public Works |

## URLs Added

1. `prop4-water` → resources.ca.gov/Bonds-Oversight/Proposition-4-Climate-Bond
2. `prop68` → bondaccountability.resources.ca.gov/p68.aspx
3. `epa-319` → waterboards.ca.gov/water_issues/programs/nps/319grants.html
4. `epa-brownfields` → epa.gov/brownfields/grants-and-funding
5. `fema-hmgp` → fema.gov/grants/mitigation/learn/hazard-mitigation
6. `fema-bric` → fema.gov/grants/mitigation/learn/building-resilient-infrastructure-communities
7. `fema-fma` → fema.gov/grants/mitigation/learn/flood-mitigation-assistance
8. `usace-219` → usace.army.mil/Missions/Civil-Works/Project-Partnership-Agreements/model_env-inf/section_219/
9. `eda-public-works` → eda.gov/funding/programs/public-works
10. `eib` → epa.gov/waterfinancecenter
11. `green-bonds` → climatebonds.net/standard/water

## Decisions Made

- Grant programs with null interestRate are correct (not gaps) — grants don't have interest rates
- DWSRF/CWSRF rates confirmed as 50% of GO bond rate; current data (0-1.9% DWSRF, 2.2% CWSRF) matches recent rate structure
- EIB and green-bonds are financing mechanisms, not programs — given reference URLs to EPA Water Finance Center and Climate Bonds Standard respectively
- All 58 programs now have at least one canonical tag from the 13-tag set for Phase 4 matching

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- `funding-programs.json` fully verified and ready for Phase 4 consumption
- All 58 programs have: id, name, category, description, fundingType, eligibility, ragQuery, programUrl, and canonical tags
- Zero broken cross-references
- Data model complete — Phase 3 done
- Phase 4 (Funding Navigator) can begin: intake questionnaire → matching algorithm → results display

---
*Phase: 03-funding-data-model*
*Completed: 2026-02-14*
