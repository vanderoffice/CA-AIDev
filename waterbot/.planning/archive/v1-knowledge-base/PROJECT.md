# GSD Plan: Bot Knowledge Base Quality Baseline

**Project:** VanderDev Bot Knowledge Enhancement
**Created:** 2026-01-18
**Status:** In Progress
**Scope:** Comprehensive research and quality baseline for BizBot, KiddoBot, and WaterBot

---

## Executive Summary

This plan establishes a high-quality baseline for all three VanderDev bot knowledge bases through deep research, source verification, and gap analysis. The goal is authoritative, current, and well-sourced information that minimizes hallucination risk.

---

## Current State Audit

### RAG Database Summary

| Bot | Total Chunks | Chunks with URLs | URL Coverage | Assessment |
|-----|--------------|------------------|--------------|------------|
| **BizBot** | 148 | 17 | 11.5% | ⚠️ **CRITICAL** - Far below parity |
| **KiddoBot** | 1,280 | 224 | 17.5% | ✅ Good volume, needs URL enrichment |
| **WaterBot** | 1,253 | 111 | 8.9% | ✅ Good volume, needs URL enrichment |

### Category Distribution

**BizBot (148 chunks):**
- Industry-Specific Licenses: 61 (41%)
- Entity Formation: 35 (24%)
- Compliance & Ongoing: 27 (18%)
- State Registrations: 25 (17%)

**KiddoBot (1,280 chunks):**
- Subsidies: 288 (22%)
- Unknown/NULL: 250 (20%) ⚠️
- County Deep Dives: 165 (13%)
- Application Processes: 119 (9%)
- Provider Search: 111 (9%)
- Special Situations: 86 (7%)
- User Journeys: 84 (7%)
- Costs & Affordability: 68 (5%)
- State Agencies: 54 (4%)
- Alternative Education: 53 (4%)

**WaterBot (1,253 chunks):**
- Water Quality: 189 (15%)
- Funding: 181 (14%)
- Water Rights: 165 (13%)
- Public Resources: 153 (12%)
- Compliance: 152 (12%)
- Climate/Drought: 148 (12%)
- Entities: 147 (12%)
- Permits: 118 (9%)

### Identified Issues

1. **BizBot chunk deficit**: 148 chunks vs 1,200+ for others (10x gap)
2. **Low URL coverage**: All bots have <20% URL coverage
3. **KiddoBot metadata gaps**: 250 chunks (20%) have NULL category
4. **No source tracking in WaterBot**: Source field is empty
5. **Unknown recency**: No "last updated" metadata on any chunks
6. **Potential stale links**: Government sites restructure frequently

---

## Research Methodology

### Phase 1: Source Verification & Link Validation (2-3 hours)

**Objective:** Identify broken links and outdated information in existing RAG data.

**Tools:**
- Parallel Bash agents for URL checking
- Perplexity Research for current source discovery

**Tasks:**

1. **Extract all URLs from each database**
   ```sql
   SELECT DISTINCT regexp_matches(content, 'https?://[^\s\)\]"]+', 'g') as url
   FROM [bot].document_chunks;
   ```

2. **Validate URLs (parallel agents)**
   - HTTP HEAD requests to check status codes
   - Flag 3xx (redirects), 4xx (broken), 5xx (server errors)
   - Generate replacement URL recommendations

3. **Cross-reference against current official sources**
   - CA.gov agency websites
   - Federal program websites
   - Recent news/announcements

**Deliverable:** Link validation report with fix recommendations

---

### Phase 2: Gap Analysis by Domain (3-4 hours)

**Objective:** Identify knowledge gaps through expert-level query testing and source comparison.

#### BizBot Gap Analysis

**Target Coverage Areas:**
| Category | Current Chunks | Target Chunks | Gap |
|----------|----------------|---------------|-----|
| Entity Formation (LLC, Corp, DBA, Partnership) | 35 | 80 | 45 |
| State Registrations (FTB, EDD, CDTFA) | 25 | 60 | 35 |
| Industry Licenses (50+ industry types) | 61 | 200 | 139 |
| Local Permits (City/County variations) | 0 | 100 | 100 |
| Compliance & Renewals | 27 | 60 | 33 |
| **TOTAL** | **148** | **500** | **352** |

**Priority Industries to Research:**
1. Food Service (restaurants, food trucks, catering)
2. Construction/Contractors (CSLB, specialty licenses)
3. Healthcare (medical, dental, pharmacy, nursing)
4. Real Estate (agents, brokers, appraisers)
5. Cannabis (cultivation, manufacturing, retail)
6. Alcohol (ABC license types)
7. Automotive (repair, sales, smog)
8. Personal Services (cosmetology, barber, nail)
9. Professional Services (CPA, attorney, engineer)
10. Childcare (licensed, license-exempt)

**Research Queries (to test gaps):**
- "What permits do I need for a food truck in San Francisco?"
- "How do I become a licensed general contractor?"
- "What's required to open a cannabis dispensary in LA?"
- "How do I get a Type 47 liquor license?"
- "What's the process for a home daycare license?"

#### KiddoBot Gap Analysis

**Target Coverage Areas:**
| Category | Current Chunks | Quality Issues |
|----------|----------------|----------------|
| Subsidies | 288 | Need fee/income table updates |
| County Deep Dives | 165 | Only 58 counties, need 2026 updates |
| Application Processes | 119 | Need current forms/portals |
| Provider Search | 111 | Need validation of provider data |
| Special Situations | 86 | Need more foster care, homeless, military |
| NULL category | 250 | ⚠️ Classify and tag all |

**Research Priorities:**
1. **2026 income eligibility limits** (CalWORKs, CCAP, Head Start)
2. **Current copay tables** by county
3. **Active portal URLs** (MyChildCarePlan, C4K portal)
4. **License-exempt provider rules** (updated 2025)
5. **Transitional Kindergarten** expansion status
6. **After-school program** availability by county

**Research Queries:**
- "What's the income limit for childcare subsidies for a family of 4?"
- "How do I find licensed childcare in Sacramento County?"
- "What's the difference between Stage 1 and Stage 2 childcare?"
- "Can grandparents be paid childcare providers?"
- "What's the copay for childcare subsidy?"

#### WaterBot Gap Analysis

**Target Coverage Areas:**
| Category | Current Chunks | Quality Issues |
|----------|----------------|----------------|
| Water Quality | 189 | Need current enforcement actions |
| Funding | 181 | Need 2026 program details |
| Water Rights | 165 | Need recent adjudications |
| Permits | 118 | Need current forms/fees |
| Compliance | 152 | Need updated deadlines |

**Research Priorities:**
1. **SAFER Program 2026** funding availability
2. **Current permit fees** (as of 2026)
3. **Regional Water Board contacts** (all 9 regions)
4. **SGMA implementation status** by basin
5. **Drought contingency** current status
6. **TMDLs** and implementation schedules

**Research Queries:**
- "How do I apply for NPDES permit in Region 5?"
- "What funding is available for small water systems?"
- "What are the current stormwater permit fees?"
- "How do I report a water quality violation?"
- "What's the process for a well permit?"

---

### Phase 3: Deep Research Execution (8-12 hours)

**Methodology:** Use parallel research agents with Perplexity Deep Research for authoritative sources.

#### Research Protocol

For each topic:
1. **Perplexity Research** for current official sources
2. **WebFetch** official agency pages
3. **Cross-validate** facts across 2+ sources
4. **Extract** specific:
   - Current fees/costs
   - Processing times
   - Eligibility requirements
   - Application URLs
   - Contact information
   - Form numbers
   - Recent changes/updates

#### Document Template

```markdown
# [Topic Title]

**Last Verified:** 2026-01-XX
**Sources:** [List of official URLs]

## Overview
[Brief description - 2-3 sentences]

## Requirements
- Requirement 1
- Requirement 2

## Fees (as of 2026)
| Fee Type | Amount | Notes |
|----------|--------|-------|
| Application | $X | One-time |
| Annual Renewal | $Y | Due by [date] |

## Timeline
- Initial application: X-Y business days
- Expedited (if available): X days for $Y fee

## How to Apply
1. Step 1
2. Step 2
3. Step 3

**Online Portal:** [URL]
**Form:** [Form name/number] ([Direct link])

## Key Contacts
- **General:** Phone, email
- **Regional:** Specific contacts if applicable

## Common Questions
Q: [FAQ 1]?
A: [Answer]

## Recent Changes
- [Date]: [What changed]

## Related Topics
- [Link to related doc 1]
- [Link to related doc 2]
```

---

### Phase 4: Content Generation & Ingestion (4-6 hours)

**BizBot Priority Documents (50 new):**

1. **Entity Formation (10 docs)**
   - CA LLC Formation Complete Guide
   - Corporation Formation (C-Corp & S-Corp)
   - DBA/Fictitious Business Name
   - Partnership Types (GP, LP, LLP)
   - Non-Profit Formation 501(c)(3)
   - Foreign Entity Registration
   - Sole Proprietorship Setup
   - Professional Corporations
   - Cooperative Formation
   - Series LLC in California

2. **State Registrations (8 docs)**
   - Franchise Tax Board Registration
   - EDD Employer Account Setup
   - CDTFA Seller's Permit
   - Workers' Comp Requirements
   - State Payroll Taxes
   - Business License Tax
   - Use Tax Self-Assessment
   - Annual Report Filing

3. **Industry Licenses (25 docs)**
   - Food Handler/Manager Certification
   - Health Permit (restaurants)
   - Contractor License Types (A, B, C)
   - Cosmetology License
   - Barber License
   - Nail Technician License
   - Real Estate Sales License
   - Real Estate Broker License
   - Cannabis Retail License
   - Cannabis Cultivation License
   - ABC License Types (47, 48, 20, 21)
   - Auto Repair (BAR Registration)
   - Auto Dealer License
   - Childcare Center License
   - Family Childcare License
   - Medical Practice License
   - Pharmacy License
   - Nursing License
   - CPA License
   - Attorney Bar Admission
   - Professional Engineer License
   - Architect License
   - Plumbing Contractor
   - Electrical Contractor
   - HVAC Contractor

4. **Compliance (7 docs)**
   - Annual Statement of Information
   - Franchise Tax Annual Minimums
   - Business License Renewals
   - Workers' Comp Audits
   - EDD Quarterly Reports
   - Sales Tax Filing
   - Local Business Tax Compliance

**KiddoBot Updates (30 docs):**
- 2026 income eligibility tables (by program)
- Updated copay schedules (by county tier)
- Current portal URLs and instructions
- County-specific contact updates
- New TK expansion information
- License-exempt provider rules update

**WaterBot Updates (20 docs):**
- SAFER 2026 program guide
- Current permit fee schedules
- Regional Water Board contact sheets (9 regions)
- Updated NPDES application guide
- Stormwater permit updates
- Current funding opportunities

---

### Phase 5: Quality Validation (2-3 hours)

**Testing Protocol:**
1. 25 test queries per bot (75 total)
2. Score each response (1-5 scale)
3. Verify source citations match content
4. Check for hallucinations
5. Validate URLs work

**Success Criteria:**
- Average score ≥ 4.0/5.0
- 100% responses include sources
- 0% broken links in responses
- <5% hallucination rate

---

## Execution Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| 1. Link Validation | 2-3 hours | Verify existing URLs |
| 2. Gap Analysis | 3-4 hours | Identify missing content |
| 3. Deep Research | 8-12 hours | Authoritative source research |
| 4. Content Generation | 4-6 hours | Create/update documents |
| 5. Quality Validation | 2-3 hours | Test and verify |

**Total Estimated:** 19-28 hours (3-5 days)

---

## Agent Assignments

### Pathfinder Agents (Research)
- **Water-Research**: WaterBot domain research
- **Biz-Research**: BizBot domain research
- **Kiddo-Research**: KiddoBot domain research

### Auditor Agents (Validation)
- **Link-Validator**: Check all extracted URLs
- **Fact-Checker**: Cross-validate key facts

### Crafter Agents (Content)
- **Doc-Generator**: Create new knowledge documents
- **Metadata-Enricher**: Add/fix metadata on existing chunks

---

## Success Metrics

### ❌ DEPRECATED: Volume Metrics (Do Not Use)

The following targets were removed because they incentivized quantity over quality:
- ~~BizBot chunks: 500+~~ (led to 33% duplicate content)
- ~~KiddoBot chunks: 1,400+~~ (arbitrary "add 10%")
- ~~WaterBot chunks: 1,400+~~ (arbitrary "add 10%")

See [ISSUES.md](ISSUES.md) ISSUE-001 for full analysis.

### ✅ Quality Metrics (Use These)

| Metric | How to Measure | Target |
|--------|----------------|--------|
| **Query Coverage** | % of real user queries that return relevant results | ≥90% |
| **Answer Accuracy** | % of responses verified correct against source | ≥95% |
| **Data Integrity** | 0 duplicates, 0 corrupted URLs, 0 NULL required fields | 100% |
| **Source Freshness** | All sources verified within N days | 30 days |
| **Broken Links** | URLs in content that return non-2xx | 0 |

### Data Quality Gates (Required Before "Complete")

```sql
-- Deduplication check (must return 0)
SELECT COUNT(*) - COUNT(DISTINCT md5(content::text)) as duplicates FROM table;

-- URL corruption check (must return 0)
SELECT COUNT(*) FROM table WHERE content::text ~ '(//[^/]*/)\1|www\.www\.';
```

### Validation Requirements

- [ ] Test queries must come from OUTSIDE the content creation process
- [ ] Validation must be run by someone who didn't create the content
- [ ] Edge cases and "should return nothing" queries must be included
- [ ] Data integrity checks must pass before semantic validation

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Research takes too long | Prioritize high-traffic query topics |
| Sources conflict | Use hierarchy: official agency > .gov > .edu > news |
| Rapid policy changes | Add "last verified" dates, schedule quarterly refresh |
| Ingest failures | Test with small batches first |

---

## Memory Handoff

**Memory Query for Next Session:**
```
mcp__memory__search_nodes Bot_Knowledge_Baseline vanderdev
```

**Key Entities to Create:**
- `Bot_Knowledge_Baseline_Plan` - This plan
- `BizBot_Gap_Analysis` - Identified gaps
- `KiddoBot_Gap_Analysis` - Identified gaps
- `WaterBot_Gap_Analysis` - Identified gaps
- `Research_Protocol` - How to research topics

---

## Next Action

Begin **Phase 1: Source Verification & Link Validation** by extracting all URLs from each bot's RAG database and checking their status.
