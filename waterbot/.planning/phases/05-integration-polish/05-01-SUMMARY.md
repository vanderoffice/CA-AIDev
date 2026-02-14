---
phase: 05-integration-polish
plan: 01
subsystem: ui
tags: [react, cross-linking, navigation, cta, funding, permits]

# Dependency graph
requires:
  - phase: 01-shared-infrastructure
    provides: Mode routing via state, ResultCard component, "Ask WaterBot" handoff
  - phase: 02-permit-finder
    provides: PermitFinder component with result screens
  - phase: 04-funding-navigator
    provides: FundingNavigator component with result screens, relatedPrograms cross-references
provides:
  - Cross-tool CTAs linking Permit Finder ↔ Funding Navigator
  - Related funding programs surfaced contextually on result cards
affects: [05-02-responsive-qa]

# Tech tracking
tech-stack:
  added: []
  patterns: [cross-tool-cta-cards, related-program-inline-references]

key-files:
  created: []
  modified:
    - src/pages/WaterBot.jsx
    - src/components/PermitFinder.jsx
    - src/components/FundingNavigator.jsx

key-decisions:
  - "Cross-tool CTAs placed after restart buttons, not before — natural flow after completing a tool"
  - "Related programs shown as inline text, not expandable sections — lightweight discovery"
  - "Related programs filtered to matched-only — irrelevant programs hidden"

patterns-established:
  - "cross-tool-cta: Accent-colored card with icon + heading + description + full-width button"
  - "related-program-refs: Inline text-xs references to co-matched programs"

issues-created: []

# Metrics
duration: 3 min
completed: 2026-02-14
---

# Phase 5 Plan 1: Cross-Tool Linking Summary

**Cross-tool CTAs linking Permit Finder ↔ Funding Navigator, plus contextual related-program references on funding result cards**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-14T03:55:41Z
- **Completed:** 2026-02-14T03:58:22Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Permit Finder results now show "Need Help Funding This Project?" CTA linking to Funding Navigator
- Funding Navigator results now show "Know Which Permits You Need?" CTA linking to Permit Finder
- Funding result cards display "Related: [Program Name]" for co-matched programs with relatedPrograms cross-references

## Task Commits

Each task was committed atomically:

1. **Task 1: Add cross-tool CTAs on result screens** - `63e8d28` (feat)
2. **Task 2: Surface related funding programs on result cards** - `95f6e53` (feat)

## Files Created/Modified
- `src/pages/WaterBot.jsx` - Added `onSwitchMode` prop pass-through to PermitFinder and FundingNavigator
- `src/components/PermitFinder.jsx` - Accepted `onSwitchMode` prop, added cyan-themed funding CTA card after results
- `src/components/FundingNavigator.jsx` - Accepted `onSwitchMode` prop, added blue-themed permit CTA card after results, added related programs inline text

## Decisions Made
- Cross-tool CTAs placed after the restart/search-again buttons — users see them after completing a tool flow, not interrupting results
- Related programs rendered as simple `text-xs text-slate-500` inline text, not clickable links — programs are already visible on the same results page
- Only co-matched related programs shown — if a related program didn't match the user's criteria, it's hidden

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Next Phase Readiness
- Cross-tool linking complete, ready for 05-02-PLAN.md (Responsive QA and theme polish)
- All three modes now interconnected: Chat ↔ Permits ↔ Funding

---
*Phase: 05-integration-polish*
*Completed: 2026-02-14*
