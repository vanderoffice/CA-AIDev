# Phase 2: Content Quality Audit

## Goal

Verify content freshness, factual accuracy, and cross-reference validity across all three bot knowledge bases. Identify and remediate outdated information that could lead to incorrect bot responses.

## Scope

**In Scope:**
- Date/year references that should be current (2025 → 2026, outdated statistics)
- Program names and agency structures (verify still exist)
- Legislation citations (bill numbers, effective dates)
- Dollar amounts and fee schedules (may have changed)
- Cross-references and "Related Topics" sections
- Contact information (phone numbers, emails, addresses)

**Out of Scope:**
- URL validity (completed in Phase 1)
- Chunk sizing and metadata (Phase 5)
- Query coverage testing (Phase 6)
- New content creation

## Prerequisites

- [x] Phase 1 complete (URL remediation)
- [x] SSH tunnel to VPS available
- [x] Database backups exist (.backups/2026-01-20/)

## Tasks

### Task 1: Automated Content Scanning (BizBot)

**Purpose:** Identify content patterns that may indicate staleness

**Deliverable:** `scripts/content-audit-report.json` with flagged items

**Steps:**
1. Scan all BizBot knowledge files for:
   - Year references (2024, 2023, 2022, etc.) — may be outdated
   - Dollar amounts (`$X,XXX`) — fee schedules may have changed
   - Percentage statistics (`XX%`) — may be outdated
   - Date patterns (`January 2025`, `effective 2024`)
   - Contact info (`(XXX) XXX-XXXX`, `@ca.gov` emails)
   - Legislative references (`AB XXXX`, `SB XXXX`, `Chapter XX`)

2. Create audit report with:
   - File path
   - Line number
   - Context (surrounding text)
   - Pattern type (date, dollar, percentage, etc.)
   - Severity (critical: pre-2024, moderate: 2024, low: 2025)

**Verification:** Report generated with categorized findings

---

### Task 2: Automated Content Scanning (KiddoBot)

**Purpose:** Same scan for KiddoBot knowledge base

**Deliverable:** Additions to `scripts/content-audit-report.json`

**Steps:**
1. Run same patterns against `kiddobot/ChildCareAssessment/` files
2. Additional KiddoBot-specific patterns:
   - County-specific regulations (may have changed)
   - Income limits/thresholds (updated annually)
   - Provider reimbursement rates (updated annually)
   - CalWORKs program rules

**Verification:** KiddoBot section added to audit report

---

### Task 3: Automated Content Scanning (WaterBot)

**Purpose:** Same scan for WaterBot knowledge base

**Deliverable:** Additions to `scripts/content-audit-report.json`

**Steps:**
1. Run same patterns against `waterbot/knowledge/` files
2. Additional WaterBot-specific patterns:
   - Permit fee schedules
   - Regulation citations (CCR sections)
   - Water Board meeting dates/deadlines
   - Drought emergency declarations

**Verification:** WaterBot section added to audit report

---

### Task 4: Research Current CA State Info

**Purpose:** Verify accuracy of flagged items

**Deliverable:** `scripts/content-verification-results.json`

**Steps:**
1. For high-severity findings (pre-2024 dates), verify current info:
   - BizBot: Business licensing fees, DCA/DIR/FTB program info
   - KiddoBot: CalWORKs income limits, subsidy rates, county programs
   - WaterBot: Water Board permit fees, regulation updates

2. Use web research to find current authoritative sources:
   - CA.gov official sites
   - State agency announcements
   - Legislative updates

3. Document findings:
   - What changed vs. what's still accurate
   - Source URLs for verification
   - Recommended updates

**Verification:** Research documented with sources

---

### Task 5: Critical Content Fixes (BizBot)

**Purpose:** Fix high-priority content issues identified

**Deliverable:** Modified knowledge files

**Steps:**
1. Update outdated year references where verified
2. Update fee schedules if changed
3. Update program names if renamed/restructured
4. Add "Last verified: January 2026" notes where appropriate

**Verification:** `git diff` shows targeted changes

---

### Task 6: Critical Content Fixes (KiddoBot)

**Purpose:** Fix high-priority KiddoBot content issues

**Deliverable:** Modified knowledge files

**Steps:**
1. Update income limits and thresholds (FY 2025-26 values)
2. Update subsidy reimbursement rates
3. Fix any deprecated county program references
4. Verify CalWORKs eligibility criteria current

**Verification:** `git diff` shows targeted changes

---

### Task 7: Critical Content Fixes (WaterBot)

**Purpose:** Fix high-priority WaterBot content issues

**Deliverable:** Modified knowledge files

**Steps:**
1. Update permit fee schedules if changed
2. Update drought status references
3. Fix any deprecated regulation citations
4. Verify Water Board contact info

**Verification:** `git diff` shows targeted changes

---

### Task 8: Cross-Reference Validation

**Purpose:** Ensure "Related Topics" and internal links are valid

**Deliverable:** Cross-reference audit in report

**Steps:**
1. Scan for "Related Topics", "See Also", "Learn More" sections
2. Extract referenced file/topic names
3. Verify referenced content exists
4. Flag orphaned cross-references

**Verification:** Cross-reference section in audit report

---

### Task 9: Re-embed Updated Content

**Purpose:** Push content fixes to production database

**Deliverable:** Updated embeddings in Supabase

**Steps:**
1. Start SSH tunnel: `ssh -fN -L 5433:172.18.0.3:5432 root@100.111.63.3`
2. For each bot with changes:
   - Run `python scripts/safe-incremental-embed.py --<bot>`
   - Verify embeddings updated
   - Run quality checks

**Verification:** Same checks as Phase 1.4 (no NULLs, correct dimensions, search works)

---

### Task 10: Generate Phase 2 Summary Report

**Purpose:** Document what was found and fixed

**Deliverable:** `.planning/02-SUMMARY.md`

**Steps:**
1. Summarize scan findings by bot and category
2. Document all content fixes made
3. List deferred items (issues found but not fixed)
4. Lessons learned and recommendations for ongoing freshness

**Verification:** Summary report exists with all sections

## Execution Order

```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8 → Task 9 → Task 10
   |        |        |                 |        |        |        |
   └────────┴────────┴─ can parallel ──┴────────┴────────┴────────┘
                                                         ↓
                                                  Sequential
```

Tasks 1-3 (scans) can run in parallel.
Tasks 5-8 (fixes) can run in parallel after Task 4 (research).
Tasks 9-10 must be sequential after fixes.

## Success Criteria

- [ ] Content audit report generated for all 3 bots
- [ ] High-severity items (pre-2024 dates) researched and verified
- [ ] Critical content fixes applied
- [ ] Cross-references validated
- [ ] Updated content re-embedded
- [ ] Summary report documents findings

## Risks

| Risk | Mitigation |
|------|------------|
| Scope creep (fixing too much) | Focus only on high-severity items (pre-2024) |
| Research time-consuming | Use authoritative sources only, don't verify everything |
| Content changes break chunking | Use same chunking approach as Phase 1.4 |

## Notes

- **Do NOT create new content** — only fix existing issues
- **Do NOT restructure files** — that's Phase 5
- For borderline cases (2024 dates), mark for review but don't necessarily fix
- Keep backups before any content changes

---
*Created: 2026-01-20*
