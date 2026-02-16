# BizBot Overhaul — State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** Accurate California business licensing information through intuitive multi-mode interface with deterministic license matching
**Current focus:** v1.1 Data Completeness — License data expansion + RAG pipeline improvements

## Current Position

Phase: 8 of 9 (RAG Pipeline Improvements)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-02-16 — Completed 08-02-PLAN.md

Progress: ██████░░░░ 60%

## Deferred Issues

- ~~ISS-002: Cross-industry general licenses not auto-included~~ → **RESOLVED 07-01**
- ~~ISS-003: City/county-specific license data not seeded~~ → **RESOLVED 07-02**
- ISS-004: External POST blocked by nginx WAF (LOW — workaround exists) → **Phase 9**
- ftb.ca.gov + bizfileonline.sos.ca.gov 403s: Bot-blocking WAF, functional in browser
- ~~DB timestamp column for chunk-level staleness tracking~~ → **RESOLVED 08-01**
- ~~Metadata enrichment on ~60% of chunks~~ → **RESOLVED 08-01** (100% coverage: topic on all 387, industry_category on 142)

## Accumulated Context

### Key Decisions (from v1.0)

| Decision | Rationale |
|----------|-----------|
| Production-first doctrine | Dev repo divergence cost WaterBot a full reconciliation phase |
| Skip Phase 2 (Shared Infra) | WaterBot already built all shared components |
| FTB /index.html URLs left as-is | FTB serves directly (200); removing index.html returns 503 |
| Bot-blocking 403s documented | ftb (29) + sos (3) = 32 URLs with WAF blocking; valid in browser |
| TEXT types in DB functions | Production schema uses text, not varchar — function return types must match |
| General licenses all conditional | DBA/SOI/BPP marked conditional to avoid false positives for sole props |
| city_biz_lic_ prefix convention | All city-specific license codes use this prefix for dedup detection |
| hasCityLicense check before generic | Prevents generic $50-$500 from polluting cost accumulators when real city data exists |
| Santa Clarita → LA County TTC | City doesn't issue own business license; mapped to county agency |
| TIMESTAMPTZ over TIMESTAMP | Timezone-aware timestamps for chunk staleness tracking |
| No indexes on timestamp cols | Staleness queries are batch (bot-refresh), not real-time |
| CDP pop >= 1000 threshold | Keeps dropdown manageable; special counties exempt (all CDPs) |
| (Unincorporated) suffix on CDPs | Distinguishes from incorporated cities; n8n fallback handles unknown names |

### Roadmap Evolution

- v1.0 Overhaul: Full rebuild to WaterBot v2.0 standard, 7 phases (0-6), shipped 2026-02-15
- v1.1 Data Completeness created: License data coverage + RAG pipeline, 3 phases (Phase 7-9)

## Session Continuity

Last session: 2026-02-16
Stopped at: Completed 08-02-PLAN.md (Unincorporated Communities Dropdown Expansion)
Resume file: None

### Artifacts
| File | Location |
|------|----------|
| Audit Report | `.planning/BOT-AUDIT-bizbot-2026-02-14.md` |
| v1.0 Milestone Archive | `.planning/milestones/v1.0-ROADMAP.md` |
| Milestone Summary | `.planning/MILESTONES.md` |
| Eval Archive | `~/.claude/data/eval-history/bizbot-eval-20260214-160704.json` |
| Refresh History | `~/.claude/data/bot-refresh-history.json` |
