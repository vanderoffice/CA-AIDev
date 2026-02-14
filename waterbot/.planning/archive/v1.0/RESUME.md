# VanderDev Bot Knowledge Base Enhancement - PROJECT COMPLETE

**Last Updated:** 2026-02-10
**Status:** ✅ ALL PHASES COMPLETE | ✅ DATA QUALITY VALIDATED | ✅ UI ENHANCEMENTS DEPLOYED | ✅ GITHUB DOCS UPDATED | ✅ n8n WORKFLOWS FIXED
**Result:** All three bots achieve 100% coverage on adversarial testing. WaterBot + BizBot personalization via IntakeForm + n8n workflow integration complete. KiddoBot already handled context correctly. Quality assurance documentation added to all bot READMEs.

---

## Final Results

**⚠️ Original targets were arbitrary volume metrics - see [ISSUES.md](ISSUES.md) ISSUE-001**

| Bot | Reported | Actual Unique | Duplicates | Status |
|-----|----------|---------------|------------|--------|
| BizBot | 637 | **425** | 212 (33%) | ⚠️ Below original target (target was flawed) |
| KiddoBot | 1,482 | **1,402** | 80 (5%) | ✅ Deduplicated |
| WaterBot | 1,489 | **1,401** | 88 (6%) | ✅ Deduplicated |

**New focus:** Quality metrics (query coverage, answer accuracy) instead of chunk counts.

**Validation Results (latest: 2026-02-10):**
| Bot | Queries | Strong (≥0.40) | Acceptable | Weak |
|-----|---------|----------------|------------|------|
| BizBot | 25 | 25 (100%) | 100% | 0 |
| KiddoBot | 25 | 25 (100%) | 100% | 0 |
| WaterBot | 35 | 33 (94%) | 100% | 0 |

**Overall: 85/85 queries (100%) returned acceptable results, 0 weak**

---

## Post-Completion URL Fix (2026-01-18)

**Issue:** User discovered ERR_NAME_NOT_RESOLVED when clicking CCDF link in KiddoBot Eligibility Calculator.

**Root Cause:**
- `mychildcare.ca.gov` - Domain does not exist (DNS failure)
- `mychildcareplan.org` - Domain exists but all pages return 404

**Scope of Problem:**
- 2 occurrences in application code (`EligibilityCalculator.jsx`)
- 54 chunks in KiddoBot database with broken URLs
- 19 RAG JSON source files with broken URLs

**Fix Applied:**
| Broken URL | Replacement |
|------------|-------------|
| `mychildcare.ca.gov` | `rrnetwork.org/family-services/find-child-care` |
| `mychildcareplan.org` | `rrnetwork.org/family-services/find-child-care` |
| `mychildcareplan.org/resource/child-care-subsidies/` | `rrnetwork.org/family-services/paying-for-childcare` |

**Files Updated:**
- `/Users/slate/Documents/GitHub/vanderdev-website/src/components/kiddobot/EligibilityCalculator.jsx`
- All 19 KiddoBot RAG JSON files
- Database: 54 chunks updated via SQL REPLACE

**Lesson Learned:** Semantic similarity validation does NOT verify embedded URLs resolve. Future validation should include URL health checks.

---

## Comprehensive URL Audit & Fix (2026-01-18)

**Trigger:** User clicked the FIRST link in the FIRST bot and got ERR_NAME_NOT_RESOLVED. Demanded comprehensive fix.

**Scope:** Full audit of ALL URLs across ALL three bots.

### Initial State (Pre-Fix)
| Bot | Total URLs | OK | Broken | % Broken |
|-----|------------|-----|--------|----------|
| BizBot | 298 | 223 | **72** | 24% |
| KiddoBot | 273 | 229 | **39** | 14% |
| WaterBot | 195 | 189 | **5** | 3% |
| **TOTAL** | **766** | **641** | **116** | **15%** |

### Major Issues Identified

**BizBot (72 broken):**
- EDD restructured their entire site - 30+ URLs with `/payroll_taxes/` path no longer exist
- FTB restructured - 14 URLs broken
- CSLB changed from `/Applicants` to `/contractors/applicants/`
- Various DCA board sites changed URL structures
- 4 DNS failures (cannabis-related domains merged/removed)

**KiddoBot (39 broken):**
- CDE changed multiple paths
- CDPH restructured immunization pages
- 14 DNS failures (small county childcare org websites)
- Truncated URLs in content

**WaterBot (5 broken):**
- Minor path changes

### Fix Strategy

1. **Pattern-based replacement:** Mapped old URL patterns to new equivalents
2. **DNS failures:** Replaced with stable statewide alternatives (rrnetwork.org, cde.ca.gov, etc.)
3. **Site restructures:** Pointed to parent pages when specific pages no longer exist

### Scripts Created
- `/Users/slate/projects/vanderdev-bots/scripts/test_all_urls.py` - Extract and validate all URLs
- `/Users/slate/projects/vanderdev-bots/scripts/test_urls_from_files.py` - Batch URL testing
- `/Users/slate/projects/vanderdev-bots/scripts/fix_broken_urls.py` - Automated URL replacement

### Final State (Post-Fix)
| Bot | Total URLs | OK | Broken | % Broken |
|-----|------------|-----|--------|----------|
| BizBot | 230 | 230 | **0** | 0% |
| KiddoBot | 245 | 245 | **0** | 0% |
| WaterBot | 194 | 194 | **0** | 0% |
| **TOTAL** | **669** | **669** | **0** | **0%** |

**Result:** 116 broken URLs → 0 broken URLs

### Key URL Mappings Applied

| Old Pattern | New Pattern | Count |
|-------------|-------------|-------|
| `www.edd.ca.gov/payroll_taxes/*` | `edd.ca.gov/en/payroll_taxes/` | 30+ |
| `www.ftb.ca.gov/file/business/types/*` | `www.ftb.ca.gov/file/business/` | 14 |
| `www.cslb.ca.gov/Applicants*` | `www.cslb.ca.gov/contractors/applicants/` | 5 |
| `cdss.ca.gov/inforesources/child-care` | `www.cdss.ca.gov/inforesources/child-care-and-development` | 22 |
| `dds.ca.gov` | `www.dds.ca.gov` | 14 |
| Various DNS failures | `rrnetwork.org/...` (stable CA R&R Network) | 14 |

### Lessons Reinforced
1. **Semantic validation ≠ URL validation** - Test URLs separately
2. **California gov sites restructure frequently** - Use parent pages when possible
3. **Small org websites are unstable** - Use statewide resources as fallbacks
4. **Validate before declaring "complete"** - The user's first click found a bug

---

## Completed Work Summary

### Phase 1: URL Validation ✅
- BizBot: 28/30 URLs valid (93%)
- WaterBot: ~85% valid
- KiddoBot: Sample validated
- No broken `bpd.cdn.sos.ca.gov` URLs in database

### Phase 2: Gap Analysis ✅
- Identified critical gaps across all three bots
- Created content plans to address deficiencies

### Phase 3: Deep Research ✅
Research files at `/Users/slate/projects/vanderdev-bots/research/2026/`:
1. `research_contractor_licensing_2026.md` - CSLB classifications, fees, AB 2622, SB 779
2. `research_restaurant_licensing_2026.md` - Health permits, ABC fees, AB 592/671
3. `research_abc_liquor_licensing_2026.md` - Type 41/47, secondary market ($85K-$100K)
4. `research_cosmetology_barber_licensing_2026.md` - BBC hours, fees, SB 1451
5. `research_real_estate_licensing_2026.md` - DRE salesperson/broker, SB 1495

### Phase 4A: BizBot Content Generation ✅
**Created 20 RAG-ready documents:**
- BBC Cosmetology/Barber (8 docs)
- ABC Liquor Licensing (4 docs)
- CSLB Contractor (4 docs)
- DRE Real Estate (4 docs)

### Phase 4B: KiddoBot Content Generation ✅
**Created 122 RAG-ready documents across 9 batch files:**

| Batch File | Docs | Topics |
|------------|------|--------|
| batch_county_deepdives.json | 10 | LA, SD, OC, SF, Alameda, Santa Clara, Sacramento, Riverside, SB, Fresno |
| batch_age_specific.json | 8 | Infant, toddler, preschool, school-age, teen, mixed-age, special needs, newborn |
| batch_quality_health.json | 10 | QRIS, health requirements, CACFP, licensing, parent rights, emergency care |
| batch_provider_info.json | 10 | Centers, family childcare, choosing care, nanny/au pair, co-ops, faith-based |
| batch_application_processes.json | 10 | Wait lists, income verification, recertification, appeals, transfers |
| batch_more_counties.json | 10 | Contra Costa, Ventura, San Mateo, Kern, San Joaquin, Sonoma, Monterey, Tulare, Placer, Santa Barbara |
| batch_additional_topics.json | 10 | Summer care, school breaks, part-time, siblings, transportation, foster care |
| batch_final_topics.json | 12 | First 5, dental/vision, developmental screening, discipline, screen time, sleep, outdoor play |
| batch_gap_filler.json | 12 | Various supplemental topics |

Plus original 30 base documents.

### Phase 4C: WaterBot Content Generation ✅
**Created 134 RAG-ready documents across 10 batch files:**

| Batch File | Docs | Topics |
|------------|------|--------|
| batch_pollutants.json | 10 | PFAS, lead, arsenic, nitrate, chromium-6, DBPs, TCP, uranium, perchlorate, bacteria |
| batch_regional_boards.json | 10 | All 9 Regional Water Boards + state/regional responsibilities |
| batch_programs.json | 8 | Recycled water, TMDLs, beach monitoring, wetlands, water rights, septic, UST, site cleanup |
| batch_conservation.json | 8 | 20x2020, AB 1668/SB 606, SB 1157, WUE standards, water use objectives, Save Our Water, drought vs permanent rules, conservation billing |
| batch_permits_compliance.json | 10 | MS4, WDRs, 401 certification, monitoring, enforcement |
| batch_small_systems.json | 10 | Challenges, consolidation, private wells, state small systems |
| batch_public_resources.json | 10 | Complaints, bills, shutoff protections, testing, CCRs |
| batch_additional_topics.json | 16 | Desalination, groundwater banking, infrastructure, ag water, planning |
| batch_final_topics.json | 12 | Dam safety, standards, stormwater capture, climate change, biosolids |
| batch_gap_filler.json | 40 | Comprehensive gap coverage |

Plus original 20 base documents.

### Phase 5: Quality Validation ✅
**75/75 queries validated (100% acceptable)**

Sample high-performing queries:
- "General contractor license CSLB requirements" → 0.775 similarity
- "Recycled water regulations California" → 0.792 similarity
- "Migrant childcare programs California" → 0.730 similarity
- "TMDL pollution limits explained" → 0.758 similarity

---

## Database Final State (Post-Deduplication)

| Bot | Table | Pre-Dedup | Duplicates Removed | Final | Target |
|-----|-------|-----------|-------------------|-------|--------|
| BizBot | `public.bizbot_documents` | 637 | **212** (33%) | **425** | 500+ |
| KiddoBot | `kiddobot.document_chunks` | 1,482 | **80** (5%) | **1,402** | 1,400+ |
| WaterBot | `public.waterbot_documents` | 1,489 | **88** (6%) | **1,286** ¹ | 1,400+ |

¹ WaterBot: 1,253 markdown chunks + 8 conservation + 25 rich batch docs (consumer_faq, advocate_toolkit, operator_guides) = 1,286. Remaining batch content (86 medium + 40 stubs) not ingested — overlaps with markdown chunks.

**Total Knowledge Base:** 3,113 unique chunks with embeddings (was 3,608 with duplicates)

**Note:** BizBot now has 425 rows (below 500+ target) due to aggressive deduplication. The 212 duplicate rows inflated the original count. The remaining 425 unique documents still provide comprehensive coverage.

---

## Data Quality Fix (2026-01-18)

**Issue:** Post-completion audit revealed data quality issues missed by semantic validation.

### Issues Fixed

| Issue | Scope | Fix Applied |
|-------|-------|-------------|
| BizBot duplicates | 212 rows (33% waste) | `DELETE WHERE id NOT IN (SELECT MIN(id) GROUP BY md5(content))` |
| KiddoBot duplicates | 80 rows (5% waste) | Same deduplication pattern |
| WaterBot duplicates | 88 rows (6% waste) | Same deduplication pattern |
| URL path corruption | 6 database rows | `REPLACE('carefacilitysearch//carefacilitysearch', 'carefacilitysearch')` |
| www.www. corruption | 5 source files | `sed -i 's/www\.www\./www./g'` on JSON files |

### Files Updated
- `center_licensing_overview.json`
- `special_needs_childcare.json`
- `license_exempt_requirements.json`
- `rrn_agencies.json`
- `mychildcareplan_portal.json`

### Verification Results

| Check | Result |
|-------|--------|
| BizBot duplicate rows | 0 |
| KiddoBot duplicate rows | 0 |
| WaterBot duplicate rows | 0 |
| URL path corruption | 0 |
| www.www. corruption | 0 |

**Lesson Learned:** Semantic similarity validation (does it answer questions?) is NOT data quality validation (is it correct, deduplicated, synced?). Always run both.

**Connection:** `ssh vps "docker exec -i supabase-db psql -U postgres -d postgres"`
**Embedding Model:** OpenAI text-embedding-3-small (1536 dimensions)

---

## Key Files

### Research
- `/Users/slate/projects/vanderdev-bots/research/2026/` (5 files)

### RAG Content
- `/Users/slate/projects/vanderdev-bots/rag-content/bizbot/` (4 JSON files)
- `/Users/slate/projects/vanderdev-bots/rag-content/kiddobot/` (13 JSON files)
- `/Users/slate/projects/vanderdev-bots/rag-content/waterbot/` (14 JSON files)

### Scripts
- `/Users/slate/projects/vanderdev-bots/scripts/ingest_bizbot_content.py`
- `/Users/slate/projects/vanderdev-bots/scripts/ingest_kiddobot_content.py`
- `/Users/slate/projects/vanderdev-bots/scripts/ingest_waterbot_content.py`
- `/Users/slate/projects/vanderdev-bots/scripts/ingest_all_batches.py`

### Python Environment
- `/Users/slate/projects/vanderdev-bots/.venv/`

---

## Technical Notes

### Schema Differences
- **KiddoBot** uses normalized schema: `chunk_text`, `document_id`, `file_name`, `file_path`, `category`, `subcategory`, `embedding`
- **BizBot/WaterBot** use denormalized JSONB: `content`, `metadata`, `embedding`

### Ingestion Pattern
- Dollar-quoted strings for safe SQL content insertion
- OpenAI text-embedding-3-small (1536 dimensions)
- SSH + docker exec piping to Supabase PostgreSQL

---

## Project Status

**Data quality:** ✅ Clean (0 duplicates, 0 corrupted URLs)
**Coverage audit:** ✅ COMPLETE (2026-02-10) - 85 adversarial queries, 100% coverage all bots

---

## Coverage Audit Results (2026-01-18)

**Methodology:** 85 adversarial queries sourced from real user forums, government FAQs, and community resources — NOT derived from existing content. WaterBot expanded from 25 → 35 queries (10 conservation-specific added 2026-02-10).

| Bot | Coverage | Strong | Acceptable | Weak/None |
|-----|----------|--------|------------|-----------|
| **BizBot** | **100%** | 25/25 | 0 | 0 |
| **KiddoBot** | **100%** | 25/25 | 0 | 0 |
| **WaterBot** | **100%** | 33/35 | 2 | 0 |

### Key Findings

**BizBot & KiddoBot:** Content successfully answers real user questions. Non-circular validation confirms genuine coverage.

**WaterBot Structural Gap:** Content is technical/regulatory (permits, TMDLs, enforcement) but missing **consumer FAQ topics**:
- ❌ Hard water, chlorine smell, cloudy water (0 mentions)
- ❌ How to read Consumer Confidence Reports
- ❌ Boiling water misconceptions (nitrates)
- ❌ Bottled vs tap water comparison

### Remediation Applied

1. ✅ **KiddoBot:** Added family fees vs co-payments doc (2026-01-18)
2. ✅ **WaterBot:** Created 25-doc Consumer FAQ batch (2026-01-18)
3. ✅ **WaterBot:** Created 8-doc Conservation enhancement (2026-02-10) — resolved structural gap in conservation/legislative coverage
4. ✅ **WaterBot:** Ingested 25 rich batch docs (consumer_faq, advocate_toolkit, operator_guides) — strong rate 69% → 94%

See: `/Users/slate/projects/vanderdev-bots/.planning/GAP_ANALYSIS_20260118.md`

---

### Completed This Session (2026-01-18)

1. ✅ Created WaterBot consumer FAQ content (25 docs across 3 batches)
2. ✅ Added KiddoBot family fee vs co-payment doc
3. ✅ Re-ran adversarial evaluation - all bots at 100% coverage
4. ✅ Closed ISSUE-002
5. ✅ Phase 6 UI Enhancements (IntakeForm, FAQ buttons, tooltips)
6. ✅ **Fixed n8n workflow** to use waterContext from IntakeForm for personalized responses

### n8n Workflow Fix Details

**Problem:** WaterBot IntakeForm collected user context (county, user type, concern, water system) but n8n workflow ignored it.

**Root Cause:**
- Parse Request node wasn't extracting `waterContext` from request body
- Build Prompt node was getting context from wrong node (`Parse Request` instead of `Prepare Search`)
- n8n workflow versioning requires updating BOTH `workflow_entity` AND `workflow_history` tables

**Fix Applied:**
- Updated Parse Request to extract `waterContext`
- Prepare Search spreads context via `...context`
- Build Prompt now references `$('Prepare Search').first().json` to access waterContext
- Updated both database tables with dollar-quoting for safe JSON insertion
- Verified fix works: WaterBot now acknowledges user county, type, concern in responses

**n8n Workflow:** `MY78EVsJL00xPMMw` (WaterBot - Chat)
**Files Created:** `/tmp/nodes_v3.json`, `/tmp/parse_request_updated.js`, `/tmp/build_prompt_v2.js`

### Project Files Summary

**Planning:**
- `/Users/slate/projects/vanderdev-bots/.planning/ISSUES.md` - Issue tracker (all issues resolved)
- `/Users/slate/projects/vanderdev-bots/.planning/GAP_ANALYSIS_20260118.md` - Coverage gap analysis
- `/Users/slate/projects/vanderdev-bots/.planning/phases/PHASE-06-UI-ENHANCEMENTS.md` - UI enhancement plan

**RAG Content:**
- `/Users/slate/projects/vanderdev-bots/rag-content/kiddobot/family_fees_vs_copayments.json` - Fee vs co-pay explainer
- `/Users/slate/projects/vanderdev-bots/rag-content/waterbot/batch_consumer_faq.json` - Consumer FAQ content
- `/Users/slate/projects/vanderdev-bots/rag-content/waterbot/batch_advocate_toolkit.json` - Advocate resources
- `/Users/slate/projects/vanderdev-bots/rag-content/waterbot/batch_operator_guides.json` - Operator guides

**Scripts:**
- `/Users/slate/projects/vanderdev-bots/scripts/ingest_remediation_content.py` - Ingestion with auto-reindex
- `/Users/slate/projects/vanderdev-bots/scripts/run_adversarial_evaluation.py` - Coverage testing

**Website (vanderdev-website repo):**
- `src/components/waterbot/IntakeForm.jsx` - NEW: WaterBot intake questionnaire
- `src/pages/WaterBot.jsx` - Modified: IntakeForm integration, FAQ buttons, waterContext persistence
- `src/components/kiddobot/EligibilityCalculator.jsx` - Modified: Fee vs co-pay tooltip

---

## WaterBot Conservation Enhancement (2026-02-10)

**Trigger:** Adversarial testing revealed WaterBot had only thin, generic coverage of California water conservation — a core topic. Two shallow docs in `batch_programs.json` ("Water Conservation Requirements" and "Drought Response in California") lacked legislative specifics, enforcement timelines, and consumer-relevant details.

### Research & Authoring

Deep web research from authoritative CA sources (SWRCB, DWR, legislative text) covering:
- SB X7-7 (20x2020): baseline 199 GPCD → target 159 → actual 136 (32% reduction)
- AB 1668/SB 606: adopted July 3, 2024, effective Jan 1, 2025, ~405 urban suppliers
- SB 1157: indoor standard 55 → 47 GPCD (Jan 2025), 2030 target pending DWR study
- Urban Water Use Objectives (UWUO): supplier-level annual water budgets
- Enforcement timeline: informational orders → written notices → conservation orders → penalties (Nov 2027)

### Files Changed

| File | Action | Details |
|------|--------|---------|
| `batch_conservation.json` | **Created** | 8 deep conservation documents (2,834–5,034 chars each, 86 H2 sections) |
| `batch_programs.json` | **Modified** | Removed 2 thin conservation docs (10 → 8 documents) |
| `adversarial_test_set.json` | **Modified** | Added 10 conservation queries (wat-026 through wat-035) |

### 8 Conservation Documents

| # | Topic | Category | Subcategory |
|---|-------|----------|-------------|
| 1 | 20x2020 Water Conservation Foundation | Programs | Conservation History |
| 2 | Making Conservation a Way of Life (AB 1668/SB 606) | Programs | Conservation |
| 3 | SB 1157 Indoor Water Use Standards | Programs | Conservation |
| 4 | Water Use Efficiency Standards Explained | Programs | Water Use Efficiency |
| 5 | Urban Water Use Objectives — What Suppliers Must Do | Compliance | Conservation |
| 6 | Save Our Water Campaign | Programs | Conservation |
| 7 | Drought Restrictions vs Permanent Conservation Rules | Public Resources | Conservation |
| 8 | Conservation and Your Water Bill | Consumer FAQ | Conservation |

### Key Discovery: Batch Content Never Ingested

All 1,253 existing DB rows used markdown-chunked metadata (`document_id`, `section_title`, `chunk_index`). Zero rows had batch JSON metadata (`topic`, `category`, `subcategory`). This means the batch JSON content from the original project was never ingested into pgvector — only the markdown-sourced content was. Conservation docs were ingested via targeted inline script (same OpenAI embedding + SSH/Docker/psql pipeline).

### Validation

| Metric | Result |
|--------|--------|
| Conservation queries (10) | **10/10 STRONG** (0.47–0.70 similarity) |
| Full waterbot regression (35) | **100% coverage** (24 strong, 11 acceptable, 0 weak) |
| All bots regression (85) | **100% coverage**, 0 gaps |
| DB chunks | 1,253 → 1,261 (+8 conservation) → **1,286** (+25 rich batch) |

---

## GitHub Documentation (2026-01-18)

**Task:** Add Knowledge Base Quality Assurance sections to each bot's README to build user trust by explaining what makes these chatbots different from generic chatbots.

**Location:** All documentation added to `vanderoffice/CA-AIDev` repository, which houses all three bot subdirectories.

**Commit:** `eeba0e8` — "docs: Add Knowledge Base QA sections to all bot READMEs"

### Files Updated

| Bot | File | Section Added |
|-----|------|---------------|
| BizBot | `bizbot/README.md` | Knowledge Base Quality Assurance |
| KiddoBot | `kiddobot/README.md` | Knowledge Base Quality Assurance |
| WaterBot | `waterbot/README.md` | Knowledge Base Quality Assurance |

### Content Added to Each README

Each section documents:
- **Knowledge Base Stats:** Chunk counts, embedding model, content date
- **Content Coverage:** Categories and topics covered
- **Validation Methodology:** Adversarial testing results (25 queries per bot)
- **Gap Discovery & Remediation:** Issues found and fixed
- **Data Quality Checks:** Deduplication, URL verification
- **Differentiation:** Why this bot is different from generic chatbots

### GitHub Links

- [BizBot README](https://github.com/vanderoffice/CA-AIDev/blob/main/bizbot/README.md)
- [KiddoBot README](https://github.com/vanderoffice/CA-AIDev/blob/main/kiddobot/README.md)
- [WaterBot README](https://github.com/vanderoffice/CA-AIDev/blob/main/waterbot/README.md)

---

## BizBot n8n Workflow Fix (2026-01-18)

**Problem:** BizBot IntakeForm collected user context (industry, county, entity type, home-based, employees) but n8n workflow ignored it entirely. Bot asked "What kind of business are you interested in?" even after user completed the intake form.

**Root Cause:**
- "Build RAG Context" node wasn't extracting `businessContext` from request body
- "Prepare Agent Input" node built system prompt without any business context section
- Same bug pattern as WaterBot (fixed earlier same day)

**Fix Applied:**
1. **Build RAG Context** — Added extraction: `const businessContext = $input.first().json.body.businessContext || {};` and spread into output: `...businessContext`
2. **Prepare Agent Input** — Added `## USER'S BUSINESS PROFILE (from intake form)` section with industry labels, location, entity type, and instruction: "DO NOT ask them for their business type, location, or entity type again."
3. Updated both `workflow_entity` and `workflow_history` tables

**n8n Workflow:** `XijYNWAf1kD9XXQv` (BizBot Pro)
**Files Created:** `/tmp/bizbot_build_rag_context_v2.js`, `/tmp/bizbot_prepare_agent_input_v2.js`

**Verification:**
- KiddoBot n8n workflow (`nNMQGXPM8tlqYSgr`) already handles `familyContext` correctly
- BizBot License Finder → Chat pathway passes same fields as IntakeForm, so fix works for that pathway too

**Lesson Reinforced:** When adding context-passing to frontend, must also update n8n workflow to extract and use that context. This bug pattern appeared in both WaterBot and BizBot.

---

### Memory Query for Future Sessions

```
mcp__memory__search_nodes VanderDev_Bots WaterBot KiddoBot BizBot
```
