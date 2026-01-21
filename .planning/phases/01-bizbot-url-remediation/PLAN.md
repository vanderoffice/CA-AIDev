# Phase 1: URL Remediation (Revised 2026-01-20)

## Validated Data (Fresh Scan)

| Metric | Value |
|--------|-------|
| Total URLs scanned | 1,862 |
| Valid | 1,057 |
| Broken | 587 |
| Skipped | 142 |

### By Category

| Category | Count | Priority | Action |
|----------|-------|----------|--------|
| **true_404** | 235 | HIGH | Find replacements with content verification |
| **malformed** | 65 | HIGH | Fix URL patterns in source |
| **bot_protection (403)** | 150 | MEDIUM | Verify with Playwright |
| **connection_errors** | 95 | LOW | Retry later |
| **timeouts** | 24 | LOW | Retry with longer timeout |
| **server_errors** | 7 | LOW | Retry later |

### By Bot

| Bot | true_404 | malformed | 403 | conn_err | timeout | Total |
|-----|----------|-----------|-----|----------|---------|-------|
| BizBot | 205 | 48 | 124 | 37 | 7 | 426 |
| KiddoBot | 26 | 4 | 21 | 53 | 10 | 121 |
| WaterBot | 4 | 13 | 5 | 5 | 7 | 34 |

---

## Lesson Learned (2026-01-20 Revert)

**What went wrong:** Replaced 404 URLs with 200 URLs without verifying content. "Audit Information" got pointed to "Webinars" page. Multiple topics pointed to same generic landing page.

**Root cause:** HTTP 200 ≠ correct content. A 404 pointing to the right topic is BETTER than a 200 pointing to wrong content.

**Solution:** Every URL change must be content-verified.

---

## Execution Plan

### Phase 1.1: Fix Malformed URLs (65 total)

**Priority: HIGH — These are data quality bugs, not external issues.**

Examples:
- `https://ca.gov/Programs/...` → Should be `https://water.ca.gov/Programs/...` or `https://dwr.ca.gov/...`
- `resource_id=[RESOURCE_ID]` → Remove or replace with real resource ID
- Missing subdomains need research to find correct agency

**Process:**
1. Extract all malformed URLs with context
2. Identify correct subdomain based on content topic
3. Search for actual page on correct subdomain
4. Verify content matches before replacing
5. Update source markdown file

**Files affected:**
- WaterBot: 13 URLs across SGMA, data-access, transfer files
- BizBot: 48 URLs across various guides
- KiddoBot: 4 URLs

### Phase 1.2: Fix true_404s (235 total)

**Priority: HIGH — Truly broken external links.**

**Process per URL:**
1. EXTRACT: Get link text + surrounding context
2. SEARCH: Find where content moved (site search, web search)
3. FETCH: Use Playwright to load candidate URLs
4. VERIFY: Extract page content (title, h1, h2, body text)
5. COMPARE: LLM verification that content matches expected topic
6. DECIDE:
   - MATCH → Apply replacement
   - PARTIAL → Flag for human review
   - NO_MATCH → Mark as "URL no longer available" or remove
   - SOFT_404 → Do NOT replace (page is generic redirect)
7. TRACK: Log every decision with evidence

**Order of operations:**
1. BizBot DIR (70 URLs) — California Department of Industrial Relations
2. BizBot FTB (70 URLs) — Likely bot protection, not true 404s
3. BizBot EDD (63 URLs) — Employment Development Department
4. BizBot DCA (12 URLs) — Department of Consumer Affairs
5. BizBot CSLB (10 URLs) — Contractors State License Board
6. BizBot other ca.gov (remaining)
7. KiddoBot (26 true 404s)
8. WaterBot (4 true 404s)

### Phase 1.3: Verify 403s with Playwright (150 total)

**Priority: MEDIUM — Many may work in a real browser.**

403 errors often mean:
- Bot protection (FTB, Wikipedia, academic journals)
- Rate limiting
- User-agent filtering

**Process:**
1. Use Playwright with real browser to fetch page
2. If loads successfully → URL is valid, keep it
3. If still blocked → Mark as bot-protected, note for future

**Common 403 sources:**
- ftb.ca.gov: 70 — Aggressive bot protection
- Wikipedia: 3 — User-agent filtering
- Academic journals: ~15 — Paywall/access control
- ferc.gov, justia.com: ~10 — Government/legal sites

### Phase 1.4: Re-embed Modified Files

After all URL changes:
1. Identify all modified markdown files
2. Regenerate chunks for each bot
3. Embed to respective Supabase tables
4. Verify embedding counts match

---

## Quality Gates

### Per-URL Gate
- [ ] Page fetched successfully with Playwright
- [ ] Page is NOT a soft-404 (generic redirect)
- [ ] Page content matches expected topic (LLM verified)
- [ ] Page is the SPECIFIC content, not a generic index

### Per-Batch Gate
- [ ] All replacements logged with evidence
- [ ] No two different link texts point to same generic page
- [ ] Human review completed for PARTIAL matches

### Final Gate
- [ ] Random sample of 10 URLs manually verified in browser
- [ ] No soft-404 pages in final output
- [ ] Re-embedding successful for all modified files
- [ ] Validation script shows reduced broken count

---

## Tools

1. **Playwright** (`~/.claude/commands/deck/node_modules/playwright`)
   - Headless browser for fetching pages
   - Bypasses simple bot protection
   - Extracts rendered content (title, headings, text)

2. **Validation script** (`scripts/validate-all-urls.py`)
   - Fixed: correct KiddoBot path
   - Fixed: strips trailing backticks
   - Fixed: filters malformed URLs
   - Outputs: `url-validation-report.json`, `url-categorized-report.json`

3. **LLM verification**
   - Use Claude to compare page content vs expected topic
   - Score: MATCH / PARTIAL / NO_MATCH / SOFT_404

---

## Handling Failures

When no valid replacement found:

**Option A: Remove the URL entirely**
```markdown
- Before: | Audit Information | https://broken-url | Description |
- After:  | Audit Information | *(link no longer available)* | Description |
```

**Option B: Replace with best available alternative + disclaimer**
```markdown
- Before: | Audit Information | https://broken-url | What to expect |
- After:  | Audit Information | https://edd.ca.gov/employers/ | EDD employer portal (specific page no longer available) |
```

**Option C: Comment for human review**
```markdown
<!-- TODO: Audit Information URL needs human verification -->
| Audit Information | https://candidate-url | Description |
```

---

## Success Criteria

- [ ] true_404 count reduced from 235 to <20
- [ ] malformed count reduced from 65 to 0
- [ ] All URL changes have documented verification
- [ ] Zero generic/soft-404 pages in knowledge base
- [ ] Re-embedding successful for all 3 bots

---

## Estimated Duration

| Task | Time |
|------|------|
| Phase 1.1 (malformed) | 2-3 hours |
| Phase 1.2 (true_404s) | 12-15 hours |
| Phase 1.3 (403 verify) | 3-4 hours |
| Phase 1.4 (re-embed) | 1-2 hours |
| **Total** | **18-24 hours** |

The time investment is the cost of doing it right.
