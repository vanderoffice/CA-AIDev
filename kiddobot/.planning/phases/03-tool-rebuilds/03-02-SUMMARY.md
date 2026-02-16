---
phase: 03-tool-rebuilds
plan: 02
subsystem: tools
tags: [json, county-rr, lookup, cross-tool-cta, react]

# Dependency graph
requires:
  - phase: 03-tool-rebuilds
    provides: Data-driven kiddobot-thresholds.json, refactored EligibilityCalculator
  - phase: 01-knowledge-refresh
    provides: All_58_Counties_RR_Directory.md source data
provides:
  - 58-county R&R agency JSON directory
  - CountyRRLookup component (dropdown or pre-selected mode)
  - Cross-tool CTA navigation between calculator, programs, and chat
affects: [04-ui-ux-polish, 05-integration-e2e, 06-production-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns: [collapsible-details-for-optional-sections, cross-tool-cta-pattern]

key-files:
  created: [src/data/kiddobot-county-rr.json, src/components/kiddobot/CountyRRLookup.jsx]
  modified: [src/components/kiddobot/EligibilityCalculator.jsx, src/pages/KiddoBot.jsx]

key-decisions:
  - "Null website for counties with no URL (Modoc, Siskiyou, San Benito, LA) — component handles gracefully"
  - "LA County gets special structure: primaryRR is 'Multiple APPs by Region' with all 6 APPs in secondaryRR"
  - "Collapsible details element for R&R in ProgramFinder to avoid visual clutter"

patterns-established:
  - "Cross-tool CTA: secondary buttons (border, not filled) linking between modes"
  - "CountyRRLookup accepts optional pre-selected county or shows dropdown"

issues-created: []

# Metrics
duration: 6min
completed: 2026-02-16
---

# Phase 3 Plan 2: County R&R Lookup + Cross-Tool CTAs Summary

**58-county R&R agency directory with CountyRRLookup component, integrated into both calculator results and ProgramFinder, with bidirectional cross-tool navigation**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-16T19:03:29Z
- **Completed:** 2026-02-16T19:09:37Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created `kiddobot-county-rr.json` with all 58 CA counties: agency name, phone, website, type, notes, secondary R&R
- Built `CountyRRLookup.jsx` — self-contained component with dropdown or pre-selected county display
- Replaced generic "contact your R&R" disclaimer in EligibilityCalculator with county-specific lookup
- Added collapsible R&R section below DecisionTreeView in ProgramFinder
- Cross-tool CTAs: Calculator→Programs, Calculator→Chat, Programs→Calculator, Programs→Chat
- Production build succeeds on VPS

## Task Commits

Each task was committed atomically:

1. **Task 1: Create county R&R data and CountyRRLookup component** - `7773a28` (feat)
2. **Task 2: Wire county R&R into tools + cross-tool CTAs** - `1c1488c` (feat)

## Files Created/Modified
- `src/data/kiddobot-county-rr.json` - 58-county R&R directory with agency, phone, website, notes
- `src/components/kiddobot/CountyRRLookup.jsx` - County R&R lookup component with dropdown/pre-select modes
- `src/components/kiddobot/EligibilityCalculator.jsx` - Added CountyRRLookup to results, onFindPrograms prop, CTA buttons
- `src/pages/KiddoBot.jsx` - Wrapped ProgramFinder with R&R section + CTAs, passed onFindPrograms to calculator

## Decisions Made
- Used null for website field on counties without URLs (Modoc, Siskiyou, San Benito) — component renders phone-only
- LA County represented with "Multiple APPs by Region" as primaryRR and all 6 APP agencies in secondaryRR field
- Used HTML `<details>` element for collapsible R&R in ProgramFinder to avoid adding state management
- CTA buttons styled as secondary (border-only) to not compete with primary tool UI

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness
- Phase 3: Tool Rebuilds complete (both plans finished)
- County R&R data and cross-tool navigation ready for Phase 4 UI polish
- No blockers for Phase 4

---
*Phase: 03-tool-rebuilds*
*Completed: 2026-02-16*
