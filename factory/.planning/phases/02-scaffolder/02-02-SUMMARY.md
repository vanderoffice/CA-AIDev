---
phase: 02-scaffolder
plan: 02
subsystem: scaffolding
tags: [markdown, gsd, roadmap-templates, bot-track, form-track, placeholders]

# Dependency graph
requires:
  - phase: 02-01
    provides: scaffold.sh with sed-based {{PLACEHOLDER}} substitution pattern
  - phase: 01-01
    provides: factory directory tree with templates/gsd/ structure
provides:
  - bot-ROADMAP.md 9-phase template for RAG chatbot projects
  - form-ROADMAP.md 9-phase template for web form projects
affects: [07-factory-orchestrator, scaffold-output]

# Tech tracking
tech-stack:
  added: []
  patterns: [9-phase-bot-track, 9-phase-form-track, gsd-roadmap-template-standard]

key-files:
  created:
    - factory/templates/gsd/bot-ROADMAP.md
    - factory/templates/gsd/form-ROADMAP.md
  modified: []

key-decisions:
  - "Bot track has parallel-capable phases (2+3, 4+5); form track is strictly sequential"
  - "Both templates use same 4 placeholders matching scaffold.sh substitution set"
  - "Phase 1 = Domain Research for both tracks; remaining 8 phases diverge by track"

patterns-established:
  - "GSD roadmap templates: 9-phase standard for both bot and form tracks"
  - "Research Presentations as Phase 2 in both tracks (decks early, updated at end)"
  - "Deploy & Final Decks as Phase 9 in both tracks (ship + update presentations)"

issues-created: []

# Metrics
duration: 2min
completed: 2026-02-08
---

# Phase 2 Plan 2: GSD Roadmap Templates Summary

**Bot and form track GSD roadmap templates with 9 phases each, {{PLACEHOLDER}} markers matching scaffold.sh, generalized from WaterBot and ECOS build sequences**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-08T04:49:51Z
- **Completed:** 2026-02-08T04:52:44Z
- **Tasks:** 2/2
- **Files created:** 2

## Accomplishments

- bot-ROADMAP.md: 9-phase template generalized from WaterBot's 12-phase build into a standardized research-to-deploy pipeline with parallel execution support
- form-ROADMAP.md: 9-phase template generalized from ECOS's 7-phase build into a standardized research-to-deploy pipeline with strictly sequential execution
- Both templates use consistent {{PROJECT_TITLE}}, {{PROJECT_NAME}}, {{SCHEMA_NAME}}, {{DOMAIN}} placeholders matching scaffold.sh's sed substitution
- Both include Phase 2 (Research Presentations) and Phase 9 (Final Decks) ensuring every project is presentation-ready

## Task Commits

Each task was committed atomically:

1. **Task 1: Create bot-ROADMAP.md template** — `c399c29` (feat)
2. **Task 2: Create form-ROADMAP.md template** — `5beab13` (feat)

**Plan metadata:** (this commit) (docs: complete plan)

## Files Created

- `factory/templates/gsd/bot-ROADMAP.md` — Bot-track 9-phase roadmap template (143 lines)
  - Phases: Research, Presentations, Knowledge, RAG, Decision Trees, n8n, Frontend, Testing, Deploy
  - Parallel-capable: Phases 2+3, Phases 4+5
  - 4 placeholders for project-specific values

- `factory/templates/gsd/form-ROADMAP.md` — Form-track 9-phase roadmap template (145 lines)
  - Phases: Research, Presentations, Database, API, UI, Workflow, Business Logic, Docker, Deploy
  - Strictly sequential execution
  - 4 placeholders for project-specific values

## Decisions Made

- Bot track has parallel-capable phases (2+3 can run together, 4+5 can run together) reflecting the looser coupling of knowledge/RAG work vs decision tree authoring. Form track is strictly sequential because each layer depends on the previous.
- Both tracks share Phase 1 (Domain Research) and Phase 2 (Research Presentations) — establishing a consistent research-first pattern, and both end with Phase 9 including final deck updates.
- Plan counts shown as ranges (e.g., "2-3 plans") since actual plan count depends on project complexity — planning phase will determine exact breakdown.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Both roadmap templates ready — scaffold.sh can now copy them into .planning/ROADMAP.md and substitute placeholders
- Phase 2 (Scaffolder) is now complete: scaffold.sh + CLAUDE.md templates + roadmap templates
- Ready for Phase 3 (Research & Decks), Phase 4 (n8n Templates), or Phase 5 (Bot Frontend) — all can proceed in parallel
- No blockers or concerns

---
*Phase: 02-scaffolder*
*Completed: 2026-02-08*
