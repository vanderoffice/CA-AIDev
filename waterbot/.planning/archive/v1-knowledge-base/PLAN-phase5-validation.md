# Phase 5: Quality Validation - 75 Test Queries

**Status:** Pending
**Prerequisite:** Phase 4 Content Generation Complete
**Deliverable:** Validation report with ≥4.5/5.0 average score

---

## Testing Protocol

For each test query:
1. Submit to bot via chat interface
2. Score response (1-5 scale)
3. Verify source citations exist and work
4. Check for hallucinations
5. Validate URLs are clickable and correct

---

## Scoring Rubric

| Score | Criteria |
|-------|----------|
| 5 | Complete, accurate, well-sourced, actionable |
| 4 | Accurate with sources, minor gaps |
| 3 | Mostly accurate, weak sources or missing details |
| 2 | Partially accurate or missing key information |
| 1 | Inaccurate, hallucinated, or no useful information |

---

## BizBot Test Queries (25)

### Entity Formation (5)
1. "How do I form an LLC in California?"
2. "What's the difference between LLC and S-Corp?"
3. "How much does it cost to register a DBA?"
4. "What's required to form a nonprofit 501(c)(3)?"
5. "How do I register a foreign LLC to do business in California?"

### Industry Licenses (10)
6. "What permits do I need to open a restaurant in LA?"
7. "How do I become a licensed general contractor in California?"
8. "What's required for a Type 47 liquor license?"
9. "How do I get a cosmetology license?"
10. "What's the process for a real estate agent license?"
11. "How much does a barber license cost?"
12. "What's the handyperson exemption limit in California?"
13. "Do I need a license for a food truck?"
14. "What's required for a Type 41 beer and wine license?"
15. "How do I become a licensed esthetician?"

### State Registrations (5)
16. "How do I register with the California Franchise Tax Board?"
17. "What's required for an EDD employer account?"
18. "Do I need a seller's permit for my business?"
19. "How do I register for workers' compensation insurance?"
20. "What's the annual Statement of Information?"

### Compliance (5)
21. "When do I need to renew my contractor license?"
22. "What's the minimum franchise tax for an LLC?"
23. "How often do I file sales tax?"
24. "What continuing education is required for real estate licenses?"
25. "What are the new 2026 contractor licensing requirements?"

---

## KiddoBot Test Queries (25)

### Subsidies & Eligibility (8)
1. "What's the income limit for childcare subsidies?"
2. "How do I apply for CalWORKs Stage 1 childcare?"
3. "What's the difference between Stage 1, 2, and 3?"
4. "Am I eligible for childcare assistance as a student?"
5. "What's the copay for childcare subsidies?"
6. "Do military families qualify for childcare assistance?"
7. "Can I get help paying for summer camp?"
8. "What happens to my subsidy when I get a raise?"

### Finding Care (7)
9. "How do I find licensed childcare in Sacramento County?"
10. "What's the difference between a childcare center and family childcare?"
11. "How do I verify a childcare provider's license?"
12. "What should I look for when choosing a preschool?"
13. "How do I find afterschool programs near me?"
14. "What is transitional kindergarten?"
15. "Are there childcare options for overnight or weekend work?"

### Providers & Licensing (5)
16. "Can grandparents be paid childcare providers?"
17. "What are license-exempt provider requirements?"
18. "How do I become a licensed family childcare provider?"
19. "What training do childcare providers need?"
20. "What's a TrustLine background check?"

### Special Situations (5)
21. "What childcare is available for foster children?"
22. "How do homeless families access childcare?"
23. "What childcare options exist for children with special needs?"
24. "Can I use childcare subsidies for a nanny?"
25. "What if my childcare provider closes unexpectedly?"

---

## WaterBot Test Queries (25)

### Permits (7)
1. "How do I apply for an NPDES permit?"
2. "What permits do I need for a new well?"
3. "What's the stormwater permit process?"
4. "Do I need a permit for rainwater harvesting?"
5. "What's a 401 water quality certification?"
6. "How do I get a permit for stream diversion?"
7. "What's the difference between individual and general permits?"

### Funding (6)
8. "What funding is available for small water systems?"
9. "How do I apply for SAFER program funding?"
10. "What grants exist for disadvantaged communities?"
11. "What's the Drinking Water State Revolving Fund?"
12. "How do I fund infrastructure repairs for my water system?"
13. "What's the Clean Water State Revolving Fund?"

### Compliance (6)
14. "How do I report a water quality violation?"
15. "What are my SGMA reporting requirements?"
16. "What testing is required for drinking water systems?"
17. "How do I file an annual water quality report?"
18. "What's a sanitary survey?"
19. "How do I respond to a compliance order?"

### Water Rights (4)
20. "How do I file for a water right?"
21. "What's the difference between appropriative and riparian rights?"
22. "How do I transfer a water right?"
23. "What's required for groundwater reporting?"

### General (2)
24. "How do I contact my Regional Water Board?"
25. "Where can I find my water system's public information?"

---

## Validation Summary Template

| Bot | Queries | Avg Score | Sources Present | Working URLs | Hallucinations |
|-----|---------|-----------|-----------------|--------------|----------------|
| BizBot | 25 | X.X | XX/25 | XX/XX | X |
| KiddoBot | 25 | X.X | XX/25 | XX/XX | X |
| WaterBot | 25 | X.X | XX/25 | XX/XX | X |
| **TOTAL** | **75** | **X.X** | **XX/75** | **XX/XX** | **X** |

---

## Success Criteria

- [ ] Average score ≥ 4.5/5.0
- [ ] 100% responses include source citations
- [ ] 0 broken links in responses
- [ ] <2% hallucination rate (≤1 out of 75)

---

## Remediation

If validation fails:
1. Identify weak topic areas
2. Conduct additional research
3. Generate more content for gaps
4. Re-test failed queries
5. Repeat until criteria met
