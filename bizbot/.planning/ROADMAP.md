# Roadmap: BizBot Overhaul

## Overview

Full overhaul of BizBot following the standard 7-phase template. Phases are conditionally included based on `/bot-audit` results from 2026-02-14. Target: WaterBot v2.0 feature and quality parity.

## Domain Expertise

California business licensing, DCA/ABC/CSLB/DRE regulations, CalGOLD local permitting, entity formation (LLC/Corp/Sole Prop), industry-specific licensing (food service, alcohol, construction, cannabis, healthcare, manufacturing, retail, professional services), compliance/renewal cycles, fee schedules.

## Production-First Doctrine

All code changes target the production repo on VPS:
- **Repo:** `vanderoffice/vanderdev-website` at `/root/vanderdev-website/`
- **Build:** `ssh vps "cd /root/vanderdev-website && npm run build"`
- **Dev repos are READ-ONLY** — no code changes to `CA-AIDev/*`
- **Knowledge content** is ingested via `/bot-ingest`, not deployed via git

## Phases

- [x] Phase 0: Audit & Baseline — **COMPLETE** (2026-02-14)
- [x] Phase 1: Knowledge Refresh — **COMPLETE** (2026-02-15)
- [ ] ~~Phase 2: Shared Infrastructure~~ — **SKIP** (WaterBot patterns exist, BizBot imports)
- [ ] Phase 3: Tool Rebuilds — **INCLUDE** (always)
- [ ] Phase 4: UI/UX Polish — **INCLUDE** (UI parity 42% < 90%)
- [ ] Phase 5: Integration & E2E — **INCLUDE** (always)
- [ ] Phase 6: Production Deploy — **INCLUDE** (always)

## Phase Details

### Phase 0: Audit & Baseline
**Goal**: Establish measurable baseline before any changes.
**Depends on**: None
**Research**: Unlikely
**Plans**: 1

Key work:
- Run `/bot-eval --bot bizbot --mode embedding --core` for coverage baseline
- Copy audit report into `.planning/`
- Document phase skip/include rationale (done — see above)
- Snapshot current mode count, feature list, component usage

---

### Phase 1: Knowledge Refresh
**Goal**: Fix broken/dead URLs and update redirects in knowledge base.
**Depends on**: Phase 0
**Research**: Likely (verify current URLs for CSLB, CDTFA, Metrc replacements)
**Plans**: 2

Key work:
- Fix 4 dead redirects (CSLB Licensing_Timeframes, Renew_A_License, fees; DGS CASp-Program)
- Fix 2 genuinely dead URLs (onlineservices.cdtfa.ca.gov, ca.metrc.com)
- Update 44 redirected URLs to final destinations where possible
- Categorize ftb.ca.gov 403s (14 URLs) — document as bot-blocking, not truly broken
- Run `/bot-ingest --replace` with corrected content
- Run `verify.py` — must PASS

---

### Phase 3: Tool Rebuilds
**Goal**: Rebuild LicenseFinder with deterministic matching and wizard UX.
**Depends on**: Phase 1
**Research**: Likely (license requirement data model, industry categorization)
**Plans**: 2-3

Key work:
- Build structured `license-requirements.json` data model (industry × entity type × location)
- Create deterministic license matching logic (not LLM-dependent for core lookups)
- Enhance LicenseFinder with wizard pattern: Formation → State → Local → Industry → Ongoing
- Wire up `bizbot-license-finder` webhook with proper structured input/output
- Consider "License Navigator" mode (like WaterBot's FundingNavigator)

---

### Phase 4: UI/UX Polish
**Goal**: Bring BizBot visual presentation to WaterBot standard (42% → 90%+).
**Depends on**: Phase 3
**Research**: Unlikely
**Plans**: 1-2

Key work:
- Import `getMarkdownComponents('orange')` from shared `ChatMessage.jsx`
- Add `react-markdown` + `remark-gfm` to all response surfaces
- Implement pill-style source citations
- Verify gradient bubbles render with orange accent
- Ensure `ICON_MAP` renders icons as SVG, not text
- Verify all 3 modes (Chat, License Expert, License Finder) use styled rendering
- Side-by-side comparison with WaterBot

---

### Phase 5: Integration & E2E Testing
**Goal**: Comprehensive testing of all modes, tools, and cross-tool flows.
**Depends on**: Phase 4
**Research**: Unlikely
**Plans**: 1

Key work:
- Run `/bot-eval --bot bizbot --mode embedding --core` — must score >= 80%
- Run `/bot-eval --bot bizbot --mode webhook` — live endpoint testing
- Test all mode transitions (Chat ↔ License Expert ↔ License Finder)
- Test edge cases: empty inputs, long queries, special characters, missing industry field
- Compare against Phase 0 baseline: `--baseline auto`
- Fix audit false positive: update bizbot-license-finder test to send `industry` field

---

### Phase 6: Production Deploy
**Goal**: Ship it. Verify live.
**Depends on**: Phase 5
**Research**: Unlikely
**Plans**: 1

Key work:
- Final VPS build: `ssh vps "cd /root/vanderdev-website && npm run build"`
- Verify live site at `vanderdev.net`
- Run `/bot-eval --mode webhook` against live endpoints
- Log results: `/bot-refresh track-history.py --bot bizbot`
- Update RESUME.md with final scores + completion timestamp

---

## Progress

**Execution Order:**
Phases execute in numeric order. Phase 2 is skipped.

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 0: Audit & Baseline | 1/1 | Complete | 2026-02-14 |
| 1: Knowledge Refresh | 2/2 | Complete | 2026-02-15 |
| 2: Shared Infra | N/A | SKIPPED | N/A |
| 3: Tool Rebuilds | 0/2-3 | Not started | |
| 4: UI/UX Polish | 0/1-2 | Not started | |
| 5: Integration & E2E | 0/1 | Not started | |
| 6: Production Deploy | 0/1 | Not started | |

**Estimated plans:** 8-10 | **Estimated active build time:** ~40-50 min

## Skills Used Per Phase

| Phase | Skills | Purpose |
|-------|--------|---------|
| 0: Audit & Baseline | `/bot-audit`, `/bot-eval --core` | Assessment + baseline |
| 1: Knowledge Refresh | `/bot-refresh`, `/bot-ingest --replace`, `/bot-eval` | URL remediation + re-ingest |
| 3: Tool Rebuilds | (manual coding via SSH) | License data model + finder rebuild |
| 4: UI/UX Polish | (manual coding via SSH) | Markdown pipeline + source pills |
| 5: Integration & E2E | `/bot-eval --mode webhook`, `/bot-eval --baseline auto` | Comprehensive testing |
| 6: Production Deploy | `/bot-refresh track-history` | Ship + log |
