---
phase: 03-funding-data-model
plan: 01
status: complete
---

# 03-01 Summary: Funding Programs Data Model

## Result

Created `public/funding-programs.json` with 58 distinct funding programs extracted from 15 markdown knowledge base files and 7 RAG JSON files.

## Programs by Category

| Category | Count | Examples |
|----------|-------|---------|
| state-srf | 7 | DWSRF, CWSRF, SAFER, SCDW, Lead Service Line, Consolidation Incentives, SAFER O&M |
| state-grant | 14 | Emerging Contaminants, WRFP, UDWN, IRWM, Prop 1/4/68 chapters, Drought Relief |
| federal | 19 | WIFIA, USDA (4 programs), WaterSMART (4), FEMA (3), Title XVI, USACE, CDBG, EDA, EPA (3) |
| private | 11 | Packard, Hewlett, Moore, NFWF, Water Foundation, Pisces, CCF, RLF, Spring Point, EIB, Green Bonds |
| technical-assistance | 7 | RCAC, RCAC Tribal, CRWA, Self-Help Enterprises, CWC, State TA, USDA Circuit Rider |

## Schema Design

- Flat array with filter-based matching (not tree/path-based)
- Typed eligibility predicates: `dacRequired` (false/true/"preferred"), `entityTypes`, `projectTypes`, `populationMax`, `matchRequired`
- `ragQuery` on every program for RAG enrichment (consistent with permit-decision-tree.json pattern)
- `relatedPrograms` cross-references using IDs (all validated)
- `fundingRange` with min/max/notes for programs without fixed amounts
- `principalForgiveness` object distinguishing availability from conditions

## Verification (all pass)

- Valid JSON
- All 18 required schema fields present on every program
- No duplicate IDs
- All 5 categories represented
- ragQuery on every program
- metadata.totalPrograms (58) matches actual count
- All relatedPrograms reference valid IDs

## Commits

| Task | Commit | Hash |
|------|--------|------|
| Schema design (5 placeholder programs) | `feat(03-01): design funding-programs.json schema` | `0bbd4d3` |
| Full extraction (58 programs) | `feat(03-01): extract funding programs from knowledge base` | `d70b8f5` |

## Files Created

- `public/funding-programs.json` — 58 programs, ~2400 lines

## Data Integrity Notes

- No fabricated data: `null` used where sources don't specify amounts/rates
- Conservative figures where sources conflict (e.g., interest rates use most recent published values)
- BRIC program flagged as SUSPENDED with litigation status noted
- Prop 1 Groundwater flagged as CLOSED
- All FAAST-eligible state programs reference `https://faast.waterboards.ca.gov`
- Invitation-only foundations (Water Foundation, Moore, Spring Point, RLF) noted in additionalCriteria

## Deviations

- Plan targeted 50+ programs across 5 categories; delivered 58 across 5 categories
- Added consolidation incentives as separate program entry (distinct from DWSRF base program)
- Added SAFER O&M as separate entry (distinct funding stream with unique eligibility)
- Added WaterSMART planning grants as separate entry from efficiency grants

## Issues for Future Plans

- Some private foundations are invitation-only with no application URL; Phase 4 matching should note this
- FEMA BRIC status uncertain due to litigation; may need periodic status update
- Several Prop 1 programs nearly fully committed; data accurate as of Feb 2026 but will age
