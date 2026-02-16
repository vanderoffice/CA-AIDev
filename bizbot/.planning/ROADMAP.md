# Roadmap: BizBot Overhaul

## Milestones

- ✅ [v1.0 Overhaul](milestones/v1.0-ROADMAP.md) (Phases 0-6) — SHIPPED 2026-02-15
- 🚧 **v1.1 Data Completeness** — Phases 7-9 (in progress)

## Production-First Doctrine

All code changes target the production repo on VPS:
- **Repo:** `vanderoffice/vanderdev-website` at `/root/vanderdev-website/`
- **Build:** `ssh vps "cd /root/vanderdev-website && npm run build"`
- **Dev repos are READ-ONLY** — no code changes to `CA-AIDev/*`
- **Knowledge content** is ingested via `/bot-ingest`, not deployed via git

## Completed Phases

<details>
<summary>v1.0 Overhaul (Phases 0-6) — SHIPPED 2026-02-15</summary>

- [x] Phase 0: Audit & Baseline (1/1 plans) — completed 2026-02-14
- [x] Phase 1: Knowledge Refresh (2/2 plans) — completed 2026-02-15
- [x] ~~Phase 2: Shared Infrastructure~~ — SKIPPED (WaterBot patterns exist)
- [x] Phase 3: Tool Rebuilds (2/2 plans) — completed 2026-02-15
- [x] Phase 4: UI/UX Polish (1/1 plan) — completed 2026-02-15
- [x] Phase 5: Integration & E2E (1/1 plan) — completed 2026-02-15
- [x] Phase 6: Production Deploy (1/1 plan) — completed 2026-02-15

**Stats:** 6 phases (1 skipped), 8 plans, ~280 min active build time
**Audit score:** 74/100 → ~95/100
**Full details:** [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

### 🚧 v1.1 Data Completeness (In Progress)

**Milestone Goal:** Improve License Finder data coverage and RAG pipeline maintainability — no UI changes

#### Phase 7: License Data Expansion

**Goal**: Auto-include cross-industry general licenses (ISS-002) and seed city/county-specific permit data (ISS-003)
**Depends on**: v1.0 complete
**Research**: Likely (CalGOLD city/county requirements, general license categories)
**Research topics**: CalGOLD local permitting data for major CA metros, general business license categories across industries
**Plans**: 2

Plans:
- [x] 07-01: Cross-Industry General License Fix (ISS-002) — fix WHERE clause + expand general seed data ✓
- [x] 07-02: City/County License Data Seeding (ISS-003) — 25 CA metros + n8n dedup logic ✓

#### Phase 8: RAG Pipeline Improvements

**Goal**: Enrich metadata on ~60% of chunks using basic blob format, add DB timestamp columns for chunk-level staleness tracking, and expand city dropdown with unincorporated CDPs
**Depends on**: Phase 7
**Research**: Unlikely (internal pipeline work — /bot-ingest + SQL migration)
**Plans**: 3

Plans:
- [ ] 08-01: Schema Migration + Metadata Enrichment — timestamp columns + topic classification on all 387 chunks
- [ ] 08-02: Unincorporated Communities Dropdown Expansion — add CDPs to CA_CITIES in LicenseFinder
- [ ] 08-03: Ingest Pipeline Update + Verification — chunk.py enrichment + end-to-end Phase 8 verification

#### Phase 9: Tooling & Verification

**Goal**: Fix WAF external POST blocking (ISS-004) and run final eval pass to validate all v1.1 changes
**Depends on**: Phase 8
**Research**: Unlikely (nginx config + existing /bot-eval workflow)
**Plans**: TBD

Plans:
- [ ] 09-01: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|---------------|--------|-----------|
| 0: Audit & Baseline | v1.0 | 1/1 | Complete | 2026-02-14 |
| 1: Knowledge Refresh | v1.0 | 2/2 | Complete | 2026-02-15 |
| 2: Shared Infra | v1.0 | N/A | SKIPPED | N/A |
| 3: Tool Rebuilds | v1.0 | 2/2 | Complete | 2026-02-15 |
| 4: UI/UX Polish | v1.0 | 1/1 | Complete | 2026-02-15 |
| 5: Integration & E2E | v1.0 | 1/1 | Complete | 2026-02-15 |
| 6: Production Deploy | v1.0 | 1/1 | Complete | 2026-02-15 |
| 7: License Data Expansion | v1.1 | 2/2 | Complete | 2026-02-16 |
| 8: RAG Pipeline Improvements | v1.1 | 0/? | Not started | - |
| 9: Tooling & Verification | v1.1 | 0/? | Not started | - |

## Domain Expertise

California business licensing, DCA/ABC/CSLB/DRE regulations, CalGOLD local permitting, entity formation (LLC/Corp/Sole Prop), industry-specific licensing (food service, alcohol, construction, cannabis, healthcare, manufacturing, retail, professional services), compliance/renewal cycles, fee schedules.

## Skills Used Per Phase

| Phase | Skills | Purpose |
|-------|--------|---------|
| 0: Audit & Baseline | `/bot-audit`, `/bot-eval --core` | Assessment + baseline |
| 1: Knowledge Refresh | `/bot-refresh`, `/bot-ingest --replace`, `/bot-eval` | URL remediation + re-ingest |
| 3: Tool Rebuilds | (manual coding via SSH) | License data model + finder rebuild |
| 4: UI/UX Polish | (manual coding via SSH) | Markdown pipeline + source pills |
| 5: Integration & E2E | `/bot-eval --mode webhook`, `/bot-eval --baseline auto` | Comprehensive testing |
| 6: Production Deploy | `/bot-refresh track-history` | Ship + log |
| 7: License Data Expansion | (SQL + SSH), `/bot-ingest` | Cross-industry + city/county data |
| 8: RAG Pipeline Improvements | `/bot-ingest`, (SQL via SSH) | Metadata enrichment + timestamps |
| 9: Tooling & Verification | `/bot-eval`, (nginx config) | WAF fix + final eval |
