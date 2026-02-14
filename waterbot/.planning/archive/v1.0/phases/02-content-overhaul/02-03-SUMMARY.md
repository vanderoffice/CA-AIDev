---
phase: 02-content-overhaul
plan: 03
subsystem: content
tags: [waterbot, rag, conservation, advocacy, operators, regional-boards, urls, take-action]

# Dependency graph
requires:
  - phase: 01-url-registry
    provides: url_registry.json with verified URLs for all topics
  - phase: 02-content-overhaul (02-01, 02-02)
    provides: established rewrite pattern (inline markdown URLs, Take Action sections)
provides:
  - 31 batch docs rewritten (conservation, advocacy, operators, regional boards)
  - 4 individual files updated (regional directory, programs, contact, annual reporting)
  - audience-specific Take Action patterns for operators, advocates, and residents
affects: [02-04, 03-db-rebuild, 05-evaluation]

# Tech tracking
tech-stack:
  added: []
  patterns: [audience-specific-take-action, region-specific-urls]

key-files:
  modified:
    - rag-content/waterbot/batch_conservation.json
    - rag-content/waterbot/batch_advocate_toolkit.json
    - rag-content/waterbot/batch_operator_guides.json
    - rag-content/waterbot/batch_regional_boards.json
    - rag-content/waterbot/regional_board_directory.json
    - rag-content/waterbot/regional_board_programs.json
    - rag-content/waterbot/contact_regional_board.json
    - rag-content/waterbot/annual_reporting.json

key-decisions:
  - "Audience-specific Take Action patterns: operators (certify/report/train), advocates (research/attend/complain), residents (find board/check programs/attend)"
  - "Region-specific URLs for all 9 regional boards (not generic statewide links)"

patterns-established:
  - "Audience-specific Take Action: different step sequences for operators vs advocates vs residents"
  - "Region-specific URLs: each regional board topic links to its own board portal, not SWRCB generic"

issues-created: []

# Metrics
duration: 9 min
completed: 2026-02-11
---

# Phase 2 Plan 3: Conservation, Advocacy, Operators & Regional Boards Summary

**35 docs enhanced with audience-specific inline URLs and Take Action sections across conservation, advocacy, operator, and regional board content**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-11T04:59:05Z
- **Completed:** 2026-02-11T05:07:42Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- 31 batch docs across 4 files rewritten with inline markdown URLs and Take Action sections
- 4 individual files updated with consistent formatting and verified URLs
- Audience-specific Take Action patterns: operators get compliance/certification steps, advocates get violation research/meeting steps, residents get regional board contact steps
- Region-specific URLs for all 9 regional boards (not generic statewide links)

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite 4 batch files (31 docs)** - `7a6afab` (feat)
2. **Task 2: Update 4 individual files and verify all 8** - `104942a` (feat)

## Files Created/Modified
- `rag-content/waterbot/batch_conservation.json` - 8 docs: water conservation programs, indoor/outdoor efficiency, drought response
- `rag-content/waterbot/batch_advocate_toolkit.json` - 8 docs: violation research, public records, meeting participation, complaint filing
- `rag-content/waterbot/batch_operator_guides.json` - 5 docs: operator certification, compliance tools, reporting portals, training
- `rag-content/waterbot/batch_regional_boards.json` - 10 docs: region-specific board info with per-board URLs
- `rag-content/waterbot/regional_board_directory.json` - All 9 regions with region-specific homepage links
- `rag-content/waterbot/regional_board_programs.json` - Program-type contact guidance
- `rag-content/waterbot/contact_regional_board.json` - How to find and contact your regional board
- `rag-content/waterbot/annual_reporting.json` - Reporting systems and deadlines

## Decisions Made
- Audience-specific Take Action patterns established per content group (operators vs advocates vs residents)
- Region-specific URLs used throughout (each of 9 boards gets its own portal link, not generic SWRCB)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness
- Ready for 02-04-PLAN.md (gap filler, additional/final topics, small systems — the last batch of content)
- All audience-specific patterns established and can be applied to remaining content

---
*Phase: 02-content-overhaul*
*Completed: 2026-02-11*
