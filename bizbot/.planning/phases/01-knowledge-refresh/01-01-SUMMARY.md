---
phase: 01-knowledge-refresh
plan: 01
subsystem: knowledge
tags: [url-remediation, cslb, cdtfa, metrc, fda, irs, dgs, bot-blocking]

# Dependency graph
requires:
  - phase: 00-audit-baseline
    provides: URL health audit with broken/redirect/false-positive categorization
provides:
  - Corrected source markdown files with all dead URLs replaced
  - Canonical redirect URLs for FDA and IRS paths
  - Documented bot-blocking false positives (22 URLs across 7 domains)
  - Updated url_fixes remediation log
affects: [01-02 re-ingestion, bot-eval post-refresh]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - BizAssessment/04_Industry_Requirements/Construction/CSLB_Licensing_Guide.md
    - BizAssessment/04_Industry_Requirements/Cannabis/Cannabis_Licensing_Guide.md
    - BizAssessment/04_Industry_Requirements/Retail/General_Retail_Guide.md
    - BizAssessment/04_Industry_Requirements/Manufacturing/Manufacturing_Licensing_Guide.md
    - BizAssessment/04_Industry_Requirements/Food_Service/Restaurant_Licensing_Guide.md
    - BizAssessment/01_Entity_Formation/Entity_Types_Decision_Matrix.md
    - BizAssessment/CA_DCA_Comprehensive_URL_Guide.md
    - BizAssessment/url_validator.py
    - BizAssessment/create_url_database.py
    - BizAssessment/url_fixes_2025-12-31.md

key-decisions:
  - "FTB /index.html URLs not fixed — they return 200 directly (FTB requires index.html, removing it returns 503)"
  - "http:// academic paper URLs not updated — external references, most don't support HTTPS"
  - "CDTFA onlineservices subdomain replaced with cdtfa.ca.gov/services/ (subdomain genuinely dead)"
  - "DGS CASp URL returns 403 to bots (WAF) but 200 in browser — valid URL, documented as false positive"

patterns-established: []

issues-created: []

# Metrics
duration: 6min
completed: 2026-02-15
---

# Phase 1 Plan 1: URL Remediation Summary

**Replaced 8 dead/redirect URLs across 10 source files, documented 22 bot-blocking false positives and 4 intermittent timeouts**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-15T14:06:33Z
- **Completed:** 2026-02-15T14:12:35Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Replaced all 6 dead URLs (CSLB ×3, DGS, CDTFA, Metrc) with verified-working alternatives — all return HTTP 200
- Updated 2 redirect URLs (FDA path rename, IRS EIN path rename — 4 occurrences total) to canonical destinations
- Documented 22 bot-blocking false positives across 7 domains (ftb, sos, dgs, cslb, dtsc, lacity, nsf)
- Re-checked 4 intermittent timeout URLs — 3 of 4 now working (valleyair.org still timing out)
- Updated url_fixes_2025-12-31.md with full 2026-02-15 remediation log including fix history, false positives, and timeouts
- Confirmed cslb.ca.gov/fees.aspx (audit dead URL #3) has zero occurrences in source files — DB-only, cleaned on re-ingestion

## Task Commits

Each task was committed atomically:

1. **Task 1: Research replacement URLs and fix dead links** — `f1506ea` (fix)
2. **Task 2: Update redirect URLs and document false positives** — `cee7ade` (feat)

## Files Created/Modified

- `BizAssessment/04_Industry_Requirements/Construction/CSLB_Licensing_Guide.md` — Fixed CSLB processing times URL (×2)
- `BizAssessment/CA_DCA_Comprehensive_URL_Guide.md` — Fixed CSLB renewal URL
- `BizAssessment/04_Industry_Requirements/Retail/General_Retail_Guide.md` — Fixed DGS CASp URL
- `BizAssessment/04_Industry_Requirements/Cannabis/Cannabis_Licensing_Guide.md` — Fixed Metrc URLs (×2)
- `BizAssessment/url_validator.py` — Fixed CDTFA online services URL
- `BizAssessment/create_url_database.py` — Fixed CDTFA online services URL
- `BizAssessment/04_Industry_Requirements/Manufacturing/Manufacturing_Licensing_Guide.md` — Fixed FDA + IRS URLs
- `BizAssessment/01_Entity_Formation/Entity_Types_Decision_Matrix.md` — Fixed IRS EIN URL
- `BizAssessment/04_Industry_Requirements/Food_Service/Restaurant_Licensing_Guide.md` — Fixed IRS EIN URL
- `BizAssessment/url_fixes_2025-12-31.md` — Full remediation log with false positives + timeouts

## Decisions Made

- **FTB `/index.html` URLs left as-is:** FTB serves these paths directly (200). Removing `index.html` returns 503. Not a redirect.
- **`http://` academic paper URLs skipped:** External references (SSRN, Springer, Emerald) — not CA gov URLs, most don't support HTTPS.
- **`.aspx` URLs on CDPH/Sacramento County left as-is:** Still returning 200 directly, no redirect occurring.
- **DGS CASp URL documented as bot-blocking:** Returns 403 without user-agent, 200 with browser UA. Valid URL.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] FDA and IRS redirect URLs not in original dead URL list**
- **Found during:** Task 2 (redirect canonicalization)
- **Issue:** Audit report listed FDA and IRS redirects under "Redirects Requiring URL Updates" but original plan only enumerated the 6 dead URLs
- **Fix:** Added FDA (1 file) and IRS EIN (3 files) to the fix scope — both were simple path renames
- **Files modified:** Manufacturing_Licensing_Guide.md, Entity_Types_Decision_Matrix.md, Restaurant_Licensing_Guide.md
- **Verification:** Both canonical URLs return 200
- **Committed in:** `cee7ade`

---

**Total deviations:** 1 auto-fixed (missing critical — redirect URLs from audit not in original 6)
**Impact on plan:** Expanded scope slightly to cover 8 total URL fixes instead of 6. No scope creep — these were in the audit report.

## Issues Encountered

None

## Next Phase Readiness

- All source markdown files corrected — ready for re-ingestion in Plan 01-02
- url_fixes log is up to date with full remediation history
- No blockers for Plan 01-02 (re-ingest + verify)

---
*Phase: 01-knowledge-refresh*
*Completed: 2026-02-15*
