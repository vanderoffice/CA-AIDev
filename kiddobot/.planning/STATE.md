# Project State: KiddoBot Overhaul

## Current Position

Phase: 3 of 6 (Tool Rebuilds)
Plan: 1 of 2 in current phase
Status: In progress
Last activity: 2026-02-16 - Completed 03-01-PLAN.md (threshold externalization)

Progress: ████░░░░░░ 40%

## Accumulated Decisions

| Phase | Decision | Rationale |
|-------|----------|-----------|
| — | Production-first doctrine | Dev repo divergence cost WaterBot a full reconciliation phase |
| — | Skip Phase 2 | WaterBot already built shared components |
| — | Data-driven thresholds | Hardcoded SMI/FPL values break every fiscal year |
| 1 | Keep 403 URLs as-is | Government sites block bots but work in browsers — verified via GET |
| 1 | Audit over-counted broken URLs | HEAD-only testing produced false positives; actual broken count ~18 not 48 |
| 1 | Chunk count 935 (not 1300+) | Well-structured content with concise sections — 935 is correct |
| 1 | Fixed bot_registry.py ON_ERROR_STOP | psql silently swallowed SQL errors without this flag |
| 3 | String keys for family sizes in JSON | JSON spec requires string keys; JS coerces integers for property access |

## Deferred Issues

None yet.

## Blockers/Concerns Carried Forward

None.

## Session Continuity

Last session: 2026-02-16T18:51:00Z
Stopped at: Completed 03-01-PLAN.md (threshold externalization)
Resume file: None
Next: 03-02-PLAN.md (ProgramFinder enhancements)
