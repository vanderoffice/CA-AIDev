---
phase: 07-license-data-expansion
plan: 02
subsystem: database
tags: [postgresql, n8n, license-finder, sql, seed-data, city-licenses, dedup]

# Dependency graph
requires:
  - phase: 07-license-data-expansion (plan 01)
    provides: General license auto-inclusion fix, addedLicenseCodes dedup pattern
  - phase: 03-tool-rebuilds
    provides: License requirements schema, CA_CITIES frontend array
provides:
  - 25 city-specific business license rows for top CA metros
  - 25 city agency entries in license_agencies
  - City-specific dedup logic in n8n Code node (hasCityLicense check)
  - Generic City Business License preserved as fallback for non-seeded cities
affects: [08-rag-pipeline, 09-tooling-verification]

# Tech tracking
tech-stack:
  added: []
  patterns: [city-biz-lic-prefix-convention, look-before-leap-dedup]

key-files:
  created: []
  modified: [BizBot_v4/workflows/07_license_finder_webhook.json, BizBot_v4/database/04_seed_data.sql]

key-decisions:
  - "City license codes use city_biz_lic_[slug] convention for prefix-based dedup matching"
  - "hasCityLicense check placed BEFORE generic addition to avoid polluting cost accumulators"
  - "Santa Clarita mapped to LA County TTC (city doesn't issue its own business license)"
  - "NULL fees used where city data unavailable — never seed unverified fee data"

patterns-established:
  - "city_biz_lic_ prefix: all city-specific business license codes start with this for dedup detection"
  - "Dedup via dbLicenses.some() before hardcoded entries: check DB results first, add fallback only if no match"

issues-created: []

# Metrics
duration: 35min
completed: 2026-02-16
---

# Phase 7 Plan 2: City/County License Data Seeding Summary

**Seeded city-specific business license data for 25 CA metros with real fees, URLs, and processing times; added n8n dedup logic to replace generic fallback with city-specific data when available**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-02-16T03:20:54Z
- **Completed:** 2026-02-16T03:56:00Z
- **Tasks:** 2/2
- **Files modified:** 2 (local reference) + production n8n workflow + production DB (50 rows: 25 agencies + 25 licenses)

## Accomplishments
- ISS-003 resolved: top 25 CA metros now have city-specific license data with real fees and application URLs
- 25 city agencies added to license_agencies (Los Angeles through Roseville)
- n8n Code node dedup prevents generic "City Business License ($50-$500)" from appearing alongside city-specific entries
- Generic fallback preserved for all 457 non-seeded cities
- 4 distinct fee models documented across cities: gross receipts (LA), employee-count (SD), classification-based (SF), flat fee (smaller cities)

## Task Commits

Each task was committed atomically:

1. **Task 1: Research and seed city-specific license data** - `cd3230b` (feat)
2. **Task 2: Update n8n dedup logic and verify end-to-end** - `cb3ff61` (fix)

## Files Created/Modified
- `BizBot_v4/database/04_seed_data.sql` - Added 25 city agency INSERTs + production schema notes
- `BizBot_v4/workflows/07_license_finder_webhook.json` - Added hasCityLicense check + addedLicenseCodes dedup Set (synced with production)

## Decisions Made
- **city_biz_lic_ prefix convention:** All city-specific business license codes use `city_biz_lic_[slug]` format, enabling prefix-based dedup via `startsWith('city_biz_lic_')`. This is more robust than checking individual city names.
- **Santa Clarita exception:** City doesn't issue its own business license — mapped to LA County Tax Collector as the issuing agency.
- **NULL fees over wrong fees:** For cities where fee data wasn't available, used `application_fee_min = NULL` with notes field explaining to contact the city. Better to show "Varies" than an incorrect number.
- **Dedup before addition:** The `hasCityLicense` boolean is computed once from `dbLicenses.some()` before any hardcoded licenses are added. This prevents the generic's $50-$500 from polluting the cost accumulator when a city-specific fee exists.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] n8n container name changed from `n8n-n8n-1` to `n8n`**
- **Found during:** Task 2 (end-to-end testing)
- **Issue:** Plan's test commands used `docker exec -i n8n-n8n-1` but actual container is named `n8n`
- **Fix:** Updated container name in test commands
- **Verification:** All 4 test scenarios returned expected results
- **Committed in:** N/A (test commands only, not code)

**2. [Rule 3 - Blocking] n8n MCP partial update requires `nodeId` not `name` for special characters**
- **Found during:** Task 2 (workflow update)
- **Issue:** `updateNode` with `name: "Process & Enrich Licenses"` failed — ampersand in node name caused parsing issue
- **Fix:** Used `nodeId: "process-licenses"` instead of node name
- **Verification:** Workflow updated successfully on second attempt
- **Committed in:** N/A (n8n API call, not committed)

---

**Total deviations:** 2 auto-fixed (2 blocking), 0 deferred
**Impact on plan:** Both fixes were minor tooling issues. No scope creep.

## Issues Encountered
- Production schema differences from DDL (already known from 07-01): `is_statewide` not a generated column, no `is_required` column, agencies table has only 5 columns. All handled by matching actual production schema.
- Local n8n MCP (`mcp__n8n-local`) returned 0 workflows — used remote MCP (`mcp__n8n`) successfully.

## Next Phase Readiness
- Phase 7 complete: both ISS-002 and ISS-003 resolved
- License Finder returns accurate city-specific data for top 25 metros, generic fallback for all others
- Ready for Phase 8: RAG Pipeline Improvements (metadata enrichment + timestamp columns)
- No blockers for Phase 8

---
*Phase: 07-license-data-expansion*
*Completed: 2026-02-16*
