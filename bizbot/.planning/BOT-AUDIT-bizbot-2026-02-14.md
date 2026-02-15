# Bot Audit: BizBot
**Date:** 2026-02-14
**Overall Score:** 74/100

## Database Health — 100/100

| Metric | Value |
|--------|-------|
| Total chunks | 392 |
| Duplicates | 0 |
| NULL content | 0 |
| NULL embeddings | 0 |
| Embedding dimension | 1536 (correct) |
| Avg chunk length | 629 chars |
| Timestamps | No timestamp column |

**Chunk distribution:** 154 under 500 chars, 218 in 500-1000, 16 in 1001-2000, 4 over 2000.

No critical failures. Database is clean and well-structured.

## URL Validation — 60/100

| Category | Count |
|----------|-------|
| Healthy | 151 (65.9%) |
| Redirected | 44 (19.2%) |
| Broken | 34 (14.8%) |
| Slow | 0 |
| **Total** | **229** |

### Broken URLs by Domain

| Domain | Count | Status | Notes |
|--------|-------|--------|-------|
| ftb.ca.gov | 14 | 403 | Bot-blocking WAF — likely still functional in browser |
| cdph.ca.gov | 5 | Connection error | CDPH site unreachable from server |
| bizfileonline.sos.ca.gov | 3 | 403 | Bot-blocking — functional in browser |
| cslb.ca.gov/resources | 1 | 403 | Specific path blocked |
| dtsc.ca.gov/ | 1 | 403 | Trailing slash variant blocked |
| onlineservices.cdtfa.ca.gov | 1 | 404 | Genuinely dead |
| planning.lacity.gov | 1 | 403 | Bot-blocking |
| ca.metrc.com | 1 | 404 | Domain changed |
| nsf.org | 1 | 403 | Bot-blocking |
| sandiegocounty.gov | 1 | Timeout | Slow/down |
| sdapcd.org | 1 | Timeout | Slow/down |
| valleyair.org | 1 | Timeout | Slow/down |

### Redirects Requiring URL Updates

| Old URL | Redirects To | Type |
|---------|-------------|------|
| cslb.ca.gov/Licensing_Timeframes.aspx | Page_Not_Found | **Dead redirect** |
| cslb.ca.gov/contractors/Renew_A_License.aspx | Page_Not_Found | **Dead redirect** |
| cslb.ca.gov/fees.aspx | Page_Not_Found | **Dead redirect** |
| dgs.ca.gov/DSA/Resources/CASp-Program | 404 page | **Dead redirect** |
| fda.gov/food/registration-food-facilities | New FDA path | Update URL |
| irs.gov/.../apply-for-an-employer-identification-number-ein-online | Renamed path | Update URL |

## Webhook Health — 70/100

| Endpoint | Status | Response Time | Notes |
|----------|--------|---------------|-------|
| /webhook/bizbot | 200 OK | 3.51s | Chat endpoint — working. Returns response, sources, sessionId, userLevel, mode |
| /webhook/bizbot-licenses | 200 OK | 3.62s | License expert — working. Returns response, sources, chunksUsed |
| /webhook/bizbot-license-finder | 400 | 0.25s | Returns `{"error": "industry is required"}` — **expected validation** (needs structured input) |

The `bizbot-license-finder` 400 is actually correct behavior — the endpoint validates that `industry` is required. The audit test sends a generic payload without this field. Score is penalized but this is a **false positive** — true functional score is closer to 90.

## Knowledge Freshness — 100/100

| Metric | Value |
|--------|-------|
| Total files | 40 |
| Total words | 50,244 |
| Directories | 19 |
| Stale directories (>180 days) | 0 |
| Newest file | 2026-01-20 |
| Oldest file | 2026-01-18 |

### Coverage by Category

| Directory | Files | Words |
|-----------|-------|-------|
| Initial Assessment | 5 | 13,785 |
| Root (URL guides, CSV data) | 14 | 11,883 |
| Food Service | 2 | 4,301 |
| Alcohol (ABC) | 1 | 2,806 |
| Construction (CSLB) | 1 | 2,628 |
| Cannabis | 1 | 2,384 |
| Healthcare | 1 | 2,278 |
| Manufacturing | 1 | 2,193 |
| Entity Formation | 2 | 1,681 |
| Professional Services | 1 | 1,594 |
| Retail | 1 | 1,653 |
| Research Protocol | 3 | 880 |
| Environmental Compliance | 1 | 306 |
| Renewal/Compliance | 1 | 339 |
| Special Situations | 1 | 290 |
| State Registration | 1 | 259 |
| Local Licensing | 1 | 279 |
| Data | 1 | 462 |

**DB metadata:** Mix of rich structured metadata (topic, category, source_urls, last_verified, fees_current_as_of) and basic blob metadata (line ranges). About 40% of chunks have rich metadata.

## UI Parity — 42/100

### Components vs. WaterBot Standard

| Component | Present? |
|-----------|----------|
| ChatMessage | Yes |
| getMarkdownComponents | **No** |
| DecisionTreeView | **No** |
| WizardStepper | **No** |
| react-markdown | **No** |
| remark-gfm | **No** |

### Features vs. WaterBot Standard

| Feature | Present? |
|---------|----------|
| Gradient bubbles | Yes |
| Pill-style sources | **No** |
| Markdown rendering | **No** |
| Cross-tool CTAs | Yes |
| Mode switching | Yes |
| Error handling | Yes |
| Loading states | Yes |
| Responsive layout | Yes |

**Component parity:** 17% (1/6)
**Feature parity:** 67% (4/6 core + 2 bonus)
**Overall parity:** 42%

BizBot uses ChatMessage but does NOT import the shared `getMarkdownComponents()` function that gives WaterBot its styled markdown output. Bot responses render as plain text instead of formatted markdown with headers, bullets, code pills, and styled tables.

## Priority Recommendations

### 1. CRITICAL (Score < 70)

- **Wire up markdown rendering pipeline** — Import `getMarkdownComponents` from `ChatMessage.jsx`, add `react-markdown` + `remark-gfm` dependencies. This is the single highest-impact change. BizBot's knowledge base is comprehensive but responses render as unstyled text.
- **Add pill-style sources** — Bot responses include source data but it's not rendered with WaterBot's pill-style citation UI.
- **Fix 4 dead redirects** — CSLB pages (Licensing_Timeframes, Renew_A_License, fees) and DGS CASp-Program all redirect to 404/error pages. Update or remove these URLs from knowledge base.

### 2. MODERATE (Score 70-85)

- **Update `bizbot-license-finder` audit test** — The 400 response is correct validation, not a failure. Consider updating audit script to send `industry` field for this endpoint.
- **Fix `onlineservices.cdtfa.ca.gov` URL** — Genuinely dead (404). Find replacement URL.
- **Fix `ca.metrc.com` URL** — Domain has changed. Update to current Metrc domain.
- **Update redirected URLs** — 44 redirects could be updated to final destinations for faster response.

### 3. LOW (Score > 85)

- **Add timestamp column to DB** — Currently no `created_at`/`updated_at` tracking. Would enable staleness detection at the chunk level.
- **Enrich metadata coverage** — ~60% of chunks use basic blob metadata. Enriching with topic/category/source_urls would improve retrieval quality.
- **Consider adding WizardStepper / DecisionTreeView** — WaterBot-style interactive license finder UI. Could replace or supplement the webhook-based `bizbot-license-finder`.
- **Address bot-blocking 403s** — ftb.ca.gov (14 URLs) and bizfileonline.sos.ca.gov (3 URLs) return 403 to automated checks but work in browsers. These are false positives for users but mean the bot can't verify these links programmatically.

---

**Score Summary:**

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Database Health | 25% | 100 | 25.0 |
| URL Validation | 20% | 60 | 12.0 |
| Webhook Health | 20% | 70 | 14.0 |
| Knowledge Freshness | 15% | 100 | 15.0 |
| UI Parity | 20% | 42 | 8.4 |
| **Overall** | **100%** | | **74.4** |
