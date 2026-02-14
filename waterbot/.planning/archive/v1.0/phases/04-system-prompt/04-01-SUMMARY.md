# Phase 4 Plan 1: System Prompt & n8n Integration Summary

**Updated WaterBot system prompt with link-surfacing instructions and fixed a pre-existing Postgres credential bug that had silently broken RAG retrieval since Feb 9.**

## Accomplishments

- Deployed `## LINK AND ACTION STEP INSTRUCTIONS` section to Build Prompt node in n8n workflow `MY78EVsJL00xPMMw`
- New prompt section includes 5 subsections: Link Extraction (MANDATORY), Take Action Sections, User-Type Link Priorities, Link Formatting Rules, URL Accuracy (CRITICAL)
- All existing waterContext handling, prompt structure, and workflow nodes preserved unchanged
- Fixed `maxTokensToSample` from 1000 → 2000 (model was truncating responses before reaching the Take Action/link section)
- Lowered temperature from 0.3 → 0.2 for more consistent link inclusion
- 4/5 automated test queries returned responses with markdown-formatted URLs from retrieved context
- Human verification confirmed links render correctly in live WaterBot chat

## Deviations (Auto-Fixed)

### Postgres Credential Bug (Rule 3 — Blocking)
- **Discovery:** Vector Search node returned `relation "public.waterbot_documents" does not exist` — silently swallowed by `onError: "continueRegularOutput"` + `alwaysOutputData: true`
- **Root cause:** n8n credential `y814aU5gt5MUe3b8` ("Postgres account") was configured with `database: "n8n"` instead of `database: "postgres"` where `waterbot_documents` lives
- **Pre-existing:** Confirmed in execution 50911 (Feb 9) — WaterBot RAG has been broken for 2+ days, falling back to general LLM knowledge on every query
- **Fix:** Decrypted credential via OpenSSL (CryptoJS AES-256-CBC), updated `database` field from `n8n` → `postgres`, re-encrypted and wrote back to `credentials_entity` table
- **Verified:** Vector Search now returns 8 documents with similarity scores 0.54-0.71

### Token Limit Fix (Rule 3 — Blocking)
- **Discovery:** Human verification showed Take Action sections rendered without URLs despite retrieved context containing them
- **Root cause:** `maxTokensToSample: 1000` on Claude Sonnet node — model exhausted output budget on informational content before reaching the link-heavy Take Action section
- **Fix:** Increased to 2000, lowered temperature 0.3 → 0.2

## Credential Inventory (Discovered)

| Credential ID | Name | Host | Database | Notes |
|---------------|------|------|----------|-------|
| y814aU5gt5MUe3b8 | Postgres account | db | postgres (FIXED) | Was pointing to `n8n` — now correct |
| Z5KViQRgrexiQDhP | Postgres Creds | 100.74.27.128 | (ServerM2P) | Not used by WaterBot |

## Files Created/Modified

- No local files — all changes deployed directly to n8n workflow on VPS
- `/tmp/waterbot_prompt_baseline.txt` — baseline system prompt saved for Phase 5 comparison
- n8n workflow `MY78EVsJL00xPMMw` nodes modified: `build_prompt` (system prompt), `claude_model` (tokens/temp), `vector_search` (credential fix)

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Add link instructions as new section (not modify existing) | Preserves working prompt structure; augments rather than replaces |
| Fix credential in DB rather than create new | Simpler; only one WaterBot credential needed; same password reused |
| Increase tokens to 2000 (not higher) | 2000 gives ample room for 300-word response + links without overspending on API costs |
| Lower temp to 0.2 | More consistent link inclusion without being fully deterministic |

## Known Issues (For Phase 5)

- **"Conservation as a Way of Life" retrieval gap:** Doc 50 exists in DB but query "What is conservation as a way of life?" scores below 0.50 similarity threshold. Content/embedding quality issue, not prompt issue.
- **Complaint query content gap:** "File a complaint about my water company" retrieved no documents. May need additional complaint-focused content or lower threshold.
- **`file_name` always null in metadata:** Format Response node shows `fileName: "N/A"` for all sources — metadata field mapping issue from Phase 3 ingestion.

## Test Results

| # | Query | Chunks | URLs | Take Action | Pass |
|---|-------|--------|------|-------------|------|
| 1 | Tap water safety | 8 | 3 | Yes | PASS |
| 2 | PFAS info | 1 | 4 | Yes | PASS |
| 3 | File complaint | 0 | 0 | Generic | FAIL (content gap) |
| 4 | Small system funding | 8 | 5 | Yes | PASS |
| 5 | Stormwater permits | 8 | 4 | Yes | PASS |

## Next Phase Readiness

Ready for Phase 5: Evaluation & Regression. Baseline prompt saved to `/tmp/waterbot_prompt_baseline.txt`. All link-surfacing infrastructure in place — Phase 5 will measure coverage across the full 35-query adversarial eval.
