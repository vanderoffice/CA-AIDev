# Bot Audit: KiddoBot
**Date:** 2026-02-16
**Overall Score:** 84/100

| Category | Weight | Score |
|----------|--------|-------|
| Database Health | 25% | 100/100 |
| URL Validation | 20% | 60/100 |
| Webhook Health | 20% | 100/100 |
| Knowledge Freshness | 15% | 100/100 |
| UI Parity | 20% | 58/100 |

---

## Database Health — 100/100

**Status: Excellent**

| Metric | Value |
|--------|-------|
| Total chunks | 1,390 |
| Duplicates | 0 |
| NULL content | 0 |
| NULL embeddings | 0 |
| Embedding dimension | 1536 (correct) |
| Avg chunk length | 705 chars |
| Oldest record | 2025-12-31 |
| Newest record | 2026-01-21 |

**Chunk length distribution:**
- Under 500 chars: 362 (26%)
- 500–1000 chars: 944 (68%)
- 1001–2000 chars: 60 (4%)
- Over 2000 chars: 24 (2%)

No issues detected. Clean embedding pipeline with no duplicates or nulls.

---

## URL Validation — 60/100

**Status: Needs Attention**

| Metric | Value |
|--------|-------|
| Total URLs extracted | 249 |
| Healthy (2xx) | 154 (62%) |
| Redirected (3xx) | 44 (18%) |
| Broken (4xx/5xx/error) | 48 (19%) |
| Slow (>5s) | 3 (1%) |

### Broken URLs by Category

**Connection errors (15 URLs) — sites completely unreachable:**
- `autismsocietyca.org`
- `cdrc-childcare.org`
- `cvchn.org`
- `dha.saccounty.gov` (2 URLs)
- `family-resource.org`
- `iceschildcare.org`
- `inspireschools.org`
- `lassencfr.org`
- `mychildcare.ca.gov`
- `sncs.org`
- `valleyoakcs.org`
- `www.cdph.ca.gov` (6 URLs — entire domain unreachable via HEAD)
- `www.delnortechildcare.org`
- `www.mybenefitscalwin.org`
- `www.sbfamilycare.org`
- `www.trintyfamilyresource.org` (likely typo — should be "trinity")

**403 Forbidden (11 URLs):**
- `communityinvestment.lacity.gov`
- `eclkc.ohs.acf.hhs.gov` (4 URLs — likely bot-blocking)
- `headstart.gov`
- `winnie.com`
- `www.acacamps.org`
- `www.cchealth.org`
- `www.ccrcca.org/publications/`
- `www.ftb.ca.gov` (2 URLs)
- `www.kidsdata.org`

**404 Not Found (5 URLs):**
- `www.ccld.dss.ca.gov/carefacilitysearch//carefacilitysearch/` (double path — malformed URL)
- `www.cde.ca.gov/schooldirectory/`
- `www.cde.ca.gov/sp/cd/re/cdcontractorinfo.asp`
- `www.cdss.ca.gov/inforesources/child-care-and-development-licensing`
- `www.rcoe.us` (2 URLs — early education services pages)

**Timeout (3 URLs):**
- `www.cde.ca.gov/sp/hs/`
- `www.sandiegocounty.gov` (2 URLs)

**Malformed URL (1):**
- `www.publichealthlawcenter.org%20Center%20General%20Licensing...` (URL-encoded spaces in domain)

### Slow but Healthy (3 URLs)
- `data.ca.gov` — 5.2s
- `irs.treasury.gov/freetaxprep/` — 9.3s
- `www.childcarelaw.org` — 5.4s

---

## Webhook Health — 100/100

**Status: Excellent**

| Endpoint | Status | Response Time |
|----------|--------|--------------|
| `/webhook/kiddobot` | 200 OK | 7.45s |
| `/webhook/kiddobot-programs` | 200 OK | 2.90s |

Both endpoints responding correctly with proper JSON structure.

**Note:** Main chat webhook (7.45s) is on the slow side. Consider monitoring — responses over 10s may time out for users.

**Response structure:**
- `/kiddobot`: Returns `response`, `sessionId`, `chunksUsed`, `debug`
- `/kiddobot-programs`: Returns `response`, `sources`, `chunksUsed`

---

## Knowledge Freshness — 100/100

**Status: Excellent**

| Metric | Value |
|--------|-------|
| Total files | 81 |
| Total words | 113,717 |
| Total directories | 22 |
| Stale directories (>180 days) | 0 |
| Newest content | 2026-01-20 |
| Oldest content | 2026-01-18 |

**Directory breakdown (top by word count):**

| Directory | Files | Words |
|-----------|-------|-------|
| 07_County_Deep_Dives | 9 | 13,034 |
| 04_Application_Processes | 6 | 11,207 |
| Initial_Assessment | 4 | 11,157 |
| 02_Provider_Search | 7 | 11,108 |
| 09_User_Journeys | 5 | 7,582 |
| 05_Special_Situations | 5 | 7,493 |
| 03_Costs_and_Affordability | 4 | 6,529 |
| Appendices | 4 | 5,625 |
| 01_Subsidies/CalWORKs/county_variations | 4 | 5,566 |
| 10_Alternative_Education | 4 | 5,138 |

**Note:** No source metadata column found in DB. Source traceability for chunks is not available.

---

## UI Parity — 58/100

**Status: Needs Overhaul**

KiddoBot has 3 modes: `calculator`, `personalized`, `programs` (495 lines)

### Component Parity (2/6 — 33%)

| Component | Present | Notes |
|-----------|---------|-------|
| ChatMessage | Yes | Shared component |
| DecisionTreeView | Yes | Present |
| getMarkdownComponents | **No** | Not using shared markdown renderer |
| WizardStepper | **No** | Not imported |
| react-markdown | **No** | Missing — likely using raw HTML or basic rendering |
| remark-gfm | **No** | No GitHub-Flavored Markdown support |

### Feature Parity (5/7 — 71%)

| Feature | Present | Notes |
|---------|---------|-------|
| Gradient bubbles | Yes | |
| Pill-style sources | **No** | Sources not rendered as pills |
| Markdown rendering | Yes | Basic rendering only — not using shared `getMarkdownComponents` |
| Cross-tool CTAs | Yes | |
| Mode switching | Yes | 3 modes |
| Error handling | Yes | |
| Responsive layout | **No** | Missing responsive CSS |

---

## Priority Recommendations

### 1. CRITICAL (Score < 70)

**URL Validation (60/100):**
- Fix 1 malformed URL: `publichealthlawcenter.org%20Center...` — URL-encoded spaces in domain
- Fix 1 double-path URL: `ccld.dss.ca.gov/carefacilitysearch//carefacilitysearch/`
- Remove or replace 15 connection-error URLs (sites fully unreachable)
- Investigate `cdph.ca.gov` — 6 URLs broken (possibly temporary, but the entire domain fails HEAD requests)
- Fix likely typo: `trintyfamilyresource.org` → `trinityfamilyresource.org`
- Note: 403s from `eclkc.ohs.acf.hhs.gov` and `ftb.ca.gov` are likely bot-blocking (HEAD rejected), may work for real users

**UI Parity (58/100):**
- Integrate `react-markdown` + `remark-gfm` for proper markdown rendering
- Import and use `getMarkdownComponents(accentColor)` from shared `ChatMessage.jsx`
- Add pill-style source citations (matches WaterBot standard)
- Add responsive layout CSS
- Consider adding `WizardStepper` for application process flows

### 2. MODERATE (Score 70–85)

- None — all other categories scored 100/100

### 3. LOW (Score > 85)

- **Webhook latency:** Main chat endpoint at 7.45s — monitor for degradation
- **Knowledge metadata:** Add `source` column to DB for chunk traceability
- **Redirected URLs (44):** Most are benign www/non-www redirects. Consider updating to canonical URLs to avoid extra round-trips in bot responses
- **Slow URLs (3):** `data.ca.gov`, `irs.treasury.gov`, `childcarelaw.org` — not broken but slow for user-facing links
