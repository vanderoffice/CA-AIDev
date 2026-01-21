# Phase 5 Plan: Query Coverage Testing

**Phase:** 5 of 5
**Goal:** Validate that real user queries retrieve relevant, accurate content
**Prerequisites:** Phases 1-4 complete (clean URLs, verified content, no duplicates, consistent chunks)
**Estimated Duration:** 2-3 hours

---

## Context

After fixing URLs (Phase 1), validating content (Phase 2), checking integrity (Phase 3), and reviewing chunk structure (Phase 4), we now need to confirm the bots actually work for end users. This phase tests the complete retrieval pipeline.

### Known Issues to Validate

From Phase 4:
- **BizBot:** 33 undersized chunks (7.8%) are stub entries like "Franchise Tax Board (FTB)" (25 chars). Could pollute search results.
- **KiddoBot:** Category naming inconsistency (snake_case vs Title Case). May affect filtered queries.

---

## Tasks

### Task 1: Define Test Query Sets
**Scope:** All bots
**Approach:** Create representative queries per bot based on domain expertise

**BizBot Test Queries (Business Licensing):**
| Query | Expected Content | Purpose |
|-------|------------------|---------|
| "How do I get a contractor license in California?" | CSLB guide | Core use case |
| "FTB" | FTB comprehensive guide (not stub) | **Stub pollution test** |
| "EDD employer registration" | EDD employer resources | **Stub pollution test** |
| "CSLB license renewal" | CSLB renewal procedures | **Stub pollution test** |
| "cannabis retail license requirements" | Cannabis Licensing Guide | Domain coverage |
| "restaurant health permit" | Restaurant/Food Service guide | Domain coverage |
| "ISO 13485" | Manufacturing guide (updated to 2016) | **Phase 2 fix verification** |

**KiddoBot Test Queries (Child Care Subsidies):**
| Query | Expected Content | Category Filter | Purpose |
|-------|------------------|-----------------|---------|
| "CalWORKs eligibility" | CalWORKs guide | calworks | Core use case |
| "income limits for child care subsidies" | Family Fee Schedules | subsidies | Data accuracy |
| "find child care in San Diego" | San Diego regional guide | county_deep_dives | **Category filter test** |
| "provider licensing requirements" | Provider licensing content | provider_search | **Category filter test** |
| "Stage 1 vs Stage 2 child care" | Stage explanations | subsidies | Domain coverage |

**WaterBot Test Queries (Water Board Compliance):**
| Query | Expected Content | Category Filter | Purpose |
|-------|------------------|-----------------|---------|
| "NPDES permit application" | Permits guide | permits | Core use case |
| "drought restrictions 2022" | Climate/drought docs | climate-drought | Historical accuracy |
| "water quality monitoring requirements" | Water quality compliance | water-quality | Domain coverage |
| "small community water system funding" | Funding programs | funding | Domain coverage |
| "groundwater sustainability plan" | GSP compliance | compliance | Domain coverage |

**Output:** `scripts/test-queries.json`

---

### Task 2: Test BizBot Stub Pollution
**Scope:** BizBot
**Approach:** Direct Supabase similarity search for agency names

**Test Cases:**
```sql
-- For each agency acronym, verify top result is NOT a stub
SELECT id, LEFT(content, 200), LENGTH(content)
FROM bizbot_documents
ORDER BY embedding <-> (SELECT embedding FROM ... WHERE content LIKE '%FTB%')
LIMIT 5;
```

**Pass Criteria:**
- Top 3 results for "FTB" are >100 characters each
- Top 3 results for "EDD" are >100 characters each
- Top 3 results for "CSLB" are >100 characters each

**If Fails:** Flag undersized chunks for removal or consolidation

**Output:** `scripts/bizbot-stub-test-results.json`

---

### Task 3: Test KiddoBot Category Filtering
**Scope:** KiddoBot
**Approach:** Query with category filter, verify results use consistent naming

**Test Cases:**
| Category Filter | Expected Chunks | Issue to Detect |
|-----------------|-----------------|-----------------|
| `subsidies` | 305 | Missing if searching `Subsidies` |
| `county_deep_dives` | 123 | Missing if searching `County Deep Dives` |
| `provider_search` | 111 | Missing if searching `Provider Search` |

**Pass Criteria:**
- Filtering by snake_case category returns expected chunk count
- No silently missing results due to case mismatch

**If Fails:** Document need for category normalization script

**Output:** `scripts/kiddobot-category-test-results.json`

---

### Task 4: End-to-End Query Testing
**Scope:** All bots
**Approach:** Use actual bot API endpoints (if available) or direct Supabase similarity search

**Method:**
1. SSH to VPS (100.111.63.3)
2. For each test query, run similarity search against production DB
3. Evaluate top 5 results for relevance
4. Score each query: 0 (no relevant results), 1 (some relevant), 2 (excellent coverage)

**Scoring Rubric:**
- **2 (Excellent):** Top result directly answers the query
- **1 (Adequate):** Top 3 results contain relevant information
- **0 (Gap):** No relevant results in top 5

**Target:** Average score ≥1.5 across all test queries per bot

**Output:** `scripts/query-coverage-results.json`

---

### Task 5: Identify Retrieval Gaps
**Scope:** All bots
**Approach:** Analyze Task 4 results for systematic issues

**Gap Categories:**
1. **Content Gap:** Query topic not covered in knowledge base
2. **Embedding Gap:** Content exists but doesn't match query embedding
3. **Chunk Gap:** Content split poorly, key info not in single chunk
4. **Pollution Gap:** Irrelevant chunks outrank relevant ones

**Documentation Per Gap:**
- Query that failed
- Expected content (if known)
- Gap type
- Recommended fix

**Output:** `scripts/retrieval-gap-analysis.md`

---

### Task 6: Document Coverage Metrics
**Scope:** All bots
**Approach:** Aggregate results into summary report

**Metrics Per Bot:**
| Metric | Definition |
|--------|------------|
| Query Coverage | % of test queries with score ≥1 |
| Retrieval Accuracy | Average score (0-2) across all queries |
| Stub Pollution | # of queries where stub outranked content |
| Category Filter Issues | # of queries affected by naming inconsistency |

**Quality Gate:**
- Query Coverage ≥ 90%
- Retrieval Accuracy ≥ 1.5
- Stub Pollution = 0
- Category Filter Issues = 0

**Output:** `05-SUMMARY.md`

---

### Task 7: Final Quality Sign-Off
**Scope:** All bots
**Approach:** Review all findings, make go/no-go recommendation

**Sign-Off Checklist:**
- [ ] Phase 1: All URLs validated (or documented as intentional failures)
- [ ] Phase 2: All content verified current (or marked as intentional historical)
- [ ] Phase 3: Zero duplicates, valid embeddings
- [ ] Phase 4: Chunk sizes documented, no critical issues
- [ ] Phase 5: Query coverage ≥90%, no retrieval blockers

**If All Pass:** Project complete, update memory with final status
**If Any Fail:** Document remediation plan, do NOT mark complete

---

## Dependencies

- SSH access to VPS (100.111.63.3)
- PostgreSQL access (ssh tunnel to Docker container)
- OpenAI API key (for query embeddings if testing via API)

## Success Criteria

1. BizBot agency queries return full guides (not stubs)
2. KiddoBot category filtering works despite naming inconsistency
3. Query coverage ≥90% across all bots
4. All retrieval gaps documented with remediation plan
5. Final quality sign-off achieved

---

## Timeline

| Task | Est. Time |
|------|-----------|
| 1. Define Test Queries | 15 min |
| 2. BizBot Stub Test | 20 min |
| 3. KiddoBot Category Test | 20 min |
| 4. E2E Query Testing | 45 min |
| 5. Gap Analysis | 20 min |
| 6. Coverage Metrics | 15 min |
| 7. Sign-Off | 10 min |
| **Total** | ~2.5 hours |
