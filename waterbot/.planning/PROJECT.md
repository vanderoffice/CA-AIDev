# WaterBot Next-Level Overhaul

## What This Is

A comprehensive overhaul of WaterBot's knowledge base to make every response both **factually accurate** and **actionable** — verified URLs, direct links to portals/forms/databases, and "Take Action" sections that guide California residents to the next step. Currently WaterBot answers questions well (100% coverage, 94% strong retrieval) but almost never links users to where they need to go.

## Core Value

Every WaterBot response must be accurate AND actionable — accurate facts without links is useless to a resident trying to act, and links without accuracy is dangerous. Both must be true simultaneously.

## Requirements

### Validated

- ✓ WaterBot answers 35 adversarial queries at 100% coverage (33 strong, 2 acceptable) — existing
- ✓ 1,286 pgvector rows with OpenAI text-embedding-3-small embeddings — existing
- ✓ Consumer FAQ, conservation, advocate toolkit, and operator guide content ingested — 2026-02-10
- ✓ n8n workflow (MY78EVsJL00xPMMw) processes waterContext from IntakeForm — existing
- ✓ Adversarial evaluation framework with automated scoring — existing
- ✓ Master URL registry mapping 179 topics to 500+ verified, actionable URLs — v1.0
- ✓ All 33 batch content files rewritten with inline URLs and "Take Action" sections — v1.0
- ✓ Content accuracy audit — every fact, date, figure verified against current CA sources — v1.0
- ✓ DB rebuilt from overhauled content (clean-slate: 1,286 → 179 rows) — v1.0
- ✓ n8n system prompt updated to instruct LLM to surface links from retrieved context — v1.0
- ✓ Adversarial eval: 33/35 → 35/35 STRONG (100%) — v1.0
- ✓ All URLs validated (313 URLs, 97.1% reachable) — v1.0
- ✓ Regression test: zero degradation on existing 35 queries — v1.0

### Active

(None — v1.0 shipped. Next milestone TBD.)

### Out of Scope

- BizBot and KiddoBot — WaterBot only for this overhaul
- Frontend/UI React component changes — pure knowledge base + n8n workflow
- New topic areas — overhaul existing content, don't expand topic coverage
- Embedding model change — stay on text-embedding-3-small (1536 dims)
- Schema migration — keep existing `content`, `metadata`, `embedding` column structure

## Context

### Current State (2026-02-11 — PROJECT COMPLETE)

- **DB:** 179 rows in `public.waterbot_documents` (clean-slate rebuild from overhauled content)
- **Content:** 33 batch JSON files (179 docs), each with inline URLs, Take Action sections, verified facts
- **URLs:** 313 unique URLs in DB (3.9x increase from ~81 baseline), 97.1% reachable
- **Adversarial scores:** 35/35 STRONG (100%), 0 acceptable, 0 weak — up from 33/35 (94.3%)
- **Both weak spots resolved:** wat-015 chromium-6 (0.339 → 0.625), wat-017 CCR (0.366 → 0.589)
- **Avg similarity:** 0.5636 → 0.5944 (+0.031)
- **Ingestion pipeline:** `ingest_waterbot_content.py` → OpenAI embeddings → SSH/Docker/psql → IVFFlat reindex
- **Live bot:** https://vanderdev.net/ecosform (WaterBot chat mode)
- **n8n workflow:** `MY78EVsJL00xPMMw` (WaterBot - Chat, maxTokens 2000, temp 0.2, link-surfacing prompt)

### Key Technical Facts

- PostgreSQL 15.8.1 with pgvector 0.8.0, IVFFlat index
- Supabase on VPS: `ssh vps "docker exec -i supabase-db psql -U postgres -d postgres"`
- Two metadata schemas coexist: markdown-chunked (`document_id`, `section_title`, `chunk_index`) and batch JSON (`topic`, `category`, `subcategory`)
- Dollar-quoted SQL strings with `CONTENT_END_12345` tag for safe insertion
- Adversarial eval script: `scripts/run_adversarial_evaluation.py` (thresholds: STRONG ≥0.40, ACCEPTABLE ≥0.30)
- URL validation script: `scripts/test_all_urls.py`

### Prior Work

- Original bot KB enhancement: Jan 2026 (all 3 bots, 6 phases, URL audit fixed 116 broken URLs)
- Conservation enhancement: Feb 10 2026 (8 deep docs, all 10 queries STRONG)
- Rich batch ingestion: Feb 10 2026 (25 docs, strong rate 69% → 94%)
- Full project history: `.planning/RESUME.md`
- Phase 5 evaluation: 35/35 STRONG, regression report at `.planning/phases/05-evaluation/regression_report.md`

## Constraints

- **Infrastructure**: VPS-hosted Supabase, SSH pipeline for all DB operations — no direct DB connection
- **Embedding cost**: OpenAI API charges per embedding — minimize unnecessary re-embeddings
- **URL stability**: CA gov sites restructure frequently (learned from Jan audit) — prefer parent pages and stable domains
- **Bot is live**: Changes to DB affect live users immediately — validate before ingesting
- **DB rebuild strategy**: Deferred until after content overhaul (Phase 2) — will decide clean slate vs preserve+enhance based on content quality assessment

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| WaterBot only (not all 3 bots) | Focus delivers better quality than spreading across bots | ✅ Validated — BizBot/KiddoBot unchanged (control check passed) |
| URL registry as structured JSON | Single source of truth for link maintenance; decoupled from content | ✅ Validated — 179 topics, 500+ URLs, all batch files linked |
| DB rebuild: clean-slate (TRUNCATE + re-ingest) | Old content fully superseded: 6.2% links vs 100% new | ✅ Validated — 1,286→179 rows, better scores |
| Inline URLs in content (not just metadata) | Embeddings include URL text; LLM sees links in retrieved context | ✅ Validated — 313 URLs in DB, avg sim +0.031 |
| Baseline comparison at every phase | Show measurable improvement, not just "we changed things" | ✅ Validated — regression_report.md proves 33→35 STRONG |

---
*Last updated: 2026-02-11 after v1.0 milestone*
