# Project State: KiddoBot Overhaul

## Current Position

Phase: 4 of 6 (UI/UX Polish)
Plan: 2 of 2 in current phase
Status: Phase complete
Last activity: 2026-02-16 - Completed 04-02-PLAN.md (responsive layout + violet color fix)

Progress: ███████░░░ 70%

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
| 3 | Null website for no-URL counties | Modoc, Siskiyou, San Benito have no website; component renders phone-only |
| 3 | LA County multi-APP structure | 6 regional APPs in secondaryRR; primaryRR describes the pattern |
| 3 | Collapsible details for ProgramFinder R&R | Avoids state management; keeps UI uncluttered |
| 4 | Violet accent (not pink or orange) | User rejected pink at checkpoint; violet is playful + distinct from WaterBot sky |
| 4 | Added violet to shared ChatMessage COLOR_PALETTE | Additive change; no impact to WaterBot/BizBot |
| 4 | Mobile-first responsive: base=375px, sm:=640px+ | Consistent with Tailwind convention; mode grid 1-col → sm:2-col |
| 4 | Added violet to DecisionTreeView + RAGButton | Same additive pattern as ChatMessage; fixes blue fallback |

## Deferred Issues

None yet.

## Blockers/Concerns Carried Forward

None.

## Session Continuity

Last session: 2026-02-16T20:04:58Z
Stopped at: Completed 04-02-PLAN.md — Phase 4 complete
Resume file: None
Next: Phase 5 (Integration & E2E)
