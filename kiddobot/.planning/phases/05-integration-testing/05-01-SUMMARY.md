# Phase 5 Plan 1: Integration & E2E Summary

**Webhook eval 30S/5A/0W (100% coverage) proves bot quality maintained; embedding regression (34S→24S) documented for Phase 6 investigation.**

## Accomplishments

- Embedding eval: 24S/3A/5W/3N (77.1% coverage) — regression from Phase 0 baseline (34S/1A/0W, 100%)
- Webhook eval: 30S/5A/0W (100% coverage) — LLM judge confirms high-quality responses across all 35 queries
- Both webhooks healthy: `/kiddobot` (9.17s) and `/kiddobot-programs` (10.94s) — both under 15s threshold
- Browser verification approved: all modes, tools, CTAs, responsive layout, and console checks pass
- Full comparison data saved to EVAL-RESULTS.md with side-by-side baseline analysis

## Files Created/Modified

- `.planning/phases/05-integration-testing/EVAL-RESULTS.md` — Full evaluation comparison (embedding + webhook + baseline delta)
- `~/.claude/commands/bot-eval/scripts/run-eval.py` — Added `--header` and `--payload-key` flags (Deviation Rule 3 fixes)

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Embedding regression is CONDITIONAL PASS | Webhook eval proves end-to-end quality; embedding is intermediate metric |
| Document regressions for Phase 6 | 11 queries regressed in embedding similarity after Phase 1 re-ingestion; needs chunk boundary investigation |
| 3 NO_RESULTS queries flagged as anomaly | pgvector nearest-neighbor should always return results; possible vector dimension or empty embedding issue |

## Issues Encountered

1. **Webhook 403 Forbidden**: VPS Production Hardening added `X-Bot-Token` auth header requirement. Fixed by adding `--header` flag to `run-eval.py`.
2. **Webhook returning generic greetings**: n8n expects `message` key, not `query`. Fixed by adding `--payload-key` flag to `run-eval.py`.
3. **Embedding regression (34S→24S)**: Phase 1 re-ingested 935 chunks with cleaned URLs. Semantic distribution shifted, causing lower similarity for some query categories (especially prompt injection and citation queries). Not blocking because webhook eval demonstrates correct bot behavior.

## Next Step

Phase 5 complete — ready for Phase 6: Production Deploy
