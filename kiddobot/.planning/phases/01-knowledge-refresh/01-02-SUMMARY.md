# Summary: Verify Thresholds and Re-Ingest Knowledge Base

**Plan:** 01-02 (Phase 1: Knowledge Refresh)
**Status:** Complete
**Duration:** ~25 min

## What Was Done

### Task 1: Verify 2025-26 SMI/FPL Thresholds

Grepped all threshold references across 74 knowledge files and compared against authoritative sources (CDE Management Bulletin 25-05, HHS 2026 Federal Register, CDSS ACL 25-36, LSNC regulation summaries).

**Findings:**
- **SMI values (75%, 85%, 100%)** in Family_Fee_Schedules.md and Income_Verification.md were **CORRECT** (match CDE MB 25-05)
- **FPL in Head_Start_Eligibility.md** was **OUTDATED** (had 2025 values; 2026 FPL published Jan 13, 2026)
- **MBSAC in 3 files** was **OUTDATED** (had July 2024 values; 3.42% COLA applied July 2025 per CDSS ACL 25-36)
- **Common_Mistakes_FAQ.md** had **WRONG values** labeled "100% SMI" that were old/incorrect
- **Inline approximations** (~$90K) were outdated in 3 journey/appendix files

**Files updated (9 total):**

| File | What Changed | Source |
|------|-------------|--------|
| Head_Start_Eligibility.md | 2025 FPL → 2026 FPL (e.g., $31,800 → $33,000 for family of 4) | HHS 2026 Federal Register |
| Common_Mistakes_FAQ.md | Fixed "100% SMI" table to current values (e.g., $10,612/mo for fam of 4) | CDE MB 25-05 |
| CalWORKs_Eligibility_Matrix.md | MBSAC table updated + MAP note re: pending 5% increase | CDSS ACL 25-36, LSNC |
| CalWORKs_Overview.md | MBSAC table updated (same values) | CDSS ACL 25-36 |
| CCDF_vs_CalWORKs_Comparison.md | MBSAC table updated (same values) | CDSS ACL 25-36 |
| Journey_CalWORKs_Transition.md | ~$90K → ~$93K (85% SMI, family of 3) | CDE MB 25-05 |
| Planning_Timeline.md | ~$90K → ~$110K (100% SMI, family of 3) | CDE MB 25-05 |
| Journey_New_Parent.md | ~$90K → ~$110K (CSPP/APP eligibility) | CDE MB 25-05 |
| CA_Childcare_Cost_Overview.md | $2,063 → $2,134 (CalWORKs MBSAC family of 4) | CDSS ACL 25-36 |

### Task 2: Re-Ingest Cleaned Knowledge Base

Full replace ingestion via `/bot-ingest --bot kiddobot --replace`:

**Pipeline results:**
- **74 files** chunked → **935 chunks** (semantic split on `##` headers)
- **935 embeddings** generated via OpenAI text-embedding-3-small (1536-dim)
- **935 rows** inserted into `kiddobot.document_chunks` on production Supabase

**Quality gates — ALL PASSED:**

| Gate | Result |
|------|--------|
| Row count | 935 (passed) |
| Duplicates (md5) | 0 (passed) |
| Null content | 0 (passed) |
| Null embeddings | 0 (passed) |
| Embedding dimension | 1536 (passed) |

**Webhook sanity check — 3/3 coherent responses:**

| Query | Response Quality | Top Similarity |
|-------|-----------------|----------------|
| "What is the State Median Income for childcare eligibility?" | Returned correct 2025-26 85% SMI table | 0.656 |
| "How do I find a licensed childcare provider in my county?" | Returned actionable resources + hotline | 0.626 |
| "What are CalWORKs Stage 1, 2, and 3?" | Clear 3-stage breakdown with correct details | 0.772 |

## Commits

| Task | Commit | Files |
|------|--------|-------|
| Task 1: Verify thresholds | `19ca09e` | 9 knowledge files |
| Task 2: Re-ingest | (DB operation — no in-repo files) | 935 chunks inserted |

## Deviations

1. **bot_registry.py bug fix (ON_ERROR_STOP).** First ingestion run silently failed — psql returned exit code 0 despite SQL errors because `ON_ERROR_STOP` wasn't set. Fixed `~/.claude/commands/bot-audit/scripts/bot_registry.py` to add `-v ON_ERROR_STOP=1`. This is a shared skill file outside this repo.

2. **embed.py retry logic added.** Second ingestion run hit a transient OpenAI 500 error mid-batch. Added exponential backoff retry logic for 500 errors and timeouts in `~/.claude/commands/bot-ingest/scripts/embed.py`. Also a shared skill file.

3. **Chunk count lower than plan estimate.** Plan estimated ~1,300-1,500 chunks; actual was 935. This is correct — the chunker splits on `##` headers with a 2000-char max, and the knowledge content is well-structured with many concise sections. No content was lost.

## Verification

- [x] All SMI/FPL thresholds verified against 2025-26 authoritative sources
- [x] bot-ingest --replace completed successfully (935 rows)
- [x] bot-ingest verify.py PASSES (0 dupes, 0 nulls, 1536-dim)
- [x] Webhook sanity check: 3/3 queries return coherent responses
- [x] Phase 1: Knowledge Refresh complete
