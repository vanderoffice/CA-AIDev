# Project Milestones: BizBot

## v1.1 Data Completeness (Shipped: 2026-02-16)

**Delivered:** Expanded license data coverage with city-specific permits, enriched RAG metadata pipeline, and fixed external webhook auth — zero eval regressions.

**Phases completed:** 7-9 (6 plans total)

**Key accomplishments:**

- ISS-002 resolved: Cross-industry general licenses (DBA, SOI, BPP) auto-included in all queries; catalog expanded 2→5 general licenses with `get_required_licenses()` DB function
- ISS-003 resolved: City-specific business license data seeded for top 25 CA metros with real fees, URLs, and processing times; n8n dedup logic replaces generic fallback for seeded cities
- Schema migration: TIMESTAMPTZ columns (created_at/updated_at) with auto-update trigger for chunk-level staleness tracking via `/bot-refresh`
- Metadata enrichment: 100% topic coverage on all 387 chunks (8 categories), 142 industry subcategory annotations; `infer_topic_metadata()` added to chunk.py for future ingests
- City dropdown expanded from 482 to 1,210 entries (728 Census Designated Places across 57 counties, pop >= 1,000 threshold)
- ISS-004 resolved: External POST 403 was X-Bot-Token auth (not WAF); fixed in `bot_registry.py` + `audit-webhooks.py`; all 3 bot webhooks accessible externally

**Stats:**

- 23 files changed, +5,786 lines
- 3 phases, 6 plans, ~12 tasks
- ~85 min active build time (2026-02-15 → 2026-02-16)

**Git range:** `e78ca25` → `de48710`

**Eval:** 29S/6A/0W — identical to v1.0 final, zero regressions from data expansion

**What's next:** Run `/bot-audit` on KiddoBot. Overhaul whichever bot scores worse.

---

## v1.0 Overhaul (Shipped: 2026-02-15)

**Delivered:** Full overhaul of BizBot to WaterBot v2.0 standard — refreshed knowledge base, rebuilt LicenseFinder as wizard, shared UI pipeline, comprehensive testing, production deploy.

**Phases completed:** 0-6 (8 plans total, Phase 2 skipped)

**Key accomplishments:**

- Knowledge base refreshed: 387 deduplicated chunks, 6 dead URLs eliminated, embedding coverage 94.3% → 100% (0 WEAK queries)
- LicenseFinder rebuilt as 5-step wizard with WizardStepper shared component, summary dashboard, collapsible phase groups, and cross-tool CTA
- UI parity with WaterBot achieved: shared `getMarkdownComponents('orange')`, `react-markdown` + `remark-gfm`, source pills, `autoLinkUrls` across all response surfaces (42% → ~90%)
- ISS-001 resolved: `license_requirements` and `license_agencies` PostgreSQL tables created with 17 agencies + 31 industry licenses across 9 categories
- Audit score improved from 74/100 → ~95/100 with zero eval regressions across all phases

**Stats:**

- 1,948 lines of JSX (BizBot.jsx + IntakeForm.jsx + LicenseFinder.jsx)
- 6 phases (1 skipped), 8 plans, ~19 tasks
- ~280 min active build time over 2 days (2026-02-14 → 2026-02-15)

**Git range:** `feat(00-01)` → `docs(06-01)`

**What's next:** Run `/bot-audit` on KiddoBot. Overhaul whichever bot scores worse between BizBot post-overhaul and KiddoBot.

---
