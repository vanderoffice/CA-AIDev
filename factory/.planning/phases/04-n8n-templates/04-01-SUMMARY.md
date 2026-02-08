---
phase: 04-n8n-templates
plan: 01
subsystem: n8n
tags: [n8n, workflow-templates, RAG, pgvector, anthropic, openai, webhook]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Factory directory structure, n8n-templates/ directory, RAG pipeline standard
provides:
  - bot-chat-orchestrator.json parameterized template (12 nodes, conversational RAG with memory)
  - bot-tool-webhook.json parameterized template (10 nodes, stateless topic-focused RAG)
  - 9 shared {{PLACEHOLDER}} tokens consistent across both templates
affects: [04-02, 02-01, 07-01]

# Tech tracking
tech-stack:
  added: []
  patterns: [n8n-workflow-parameterization, manual-http-rag-pipeline, credential-placeholder-convention]

key-files:
  created:
    - factory/n8n-templates/bot-chat-orchestrator.json
    - factory/n8n-templates/bot-tool-webhook.json
  modified: []

key-decisions:
  - "Used manual HTTP→Code→Postgres RAG pipeline (not Supabase VectorStore) — 8/9 production workflows use this pattern"
  - "Direct pgvector distance operator (<=> with threshold) instead of match_documents function — more portable, no function dependency"
  - "Chat orchestrator keeps memory node; tool webhook intentionally stateless"
  - "9 shared placeholders between templates for consistency (BOT_NAME, DB_SCHEMA, CREDENTIAL_*, LLM_*, RAG_*, CITATION_DOMAIN)"

patterns-established:
  - "n8n template parameterization: {{PLACEHOLDER}} convention matching scaffold.sh"
  - "Template safety: active=false, no real credentials, no real webhook paths"
  - "Chat vs tool webhook structural difference: memory node + sessionId presence"

issues-created: []

# Metrics
duration: 4min
completed: 2026-02-08
---

# Phase 4 Plan 1: n8n Template Export & Parameterization Summary

**Exported WaterBot Chat + Permit Lookup workflows from live n8n via MCP and parameterized into reusable bot backend templates with 9 shared placeholder tokens**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-08T16:22:34Z
- **Completed:** 2026-02-08T16:26:10Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Exported WaterBot Chat orchestrator (MY78EVsJL00xPMMw) — 12-node conversational RAG pipeline with memory
- Exported WaterBot Permit Lookup (Y9Y56EyoomIFrQCN) — 10-node stateless tool webhook with category filtering
- Replaced all hardcoded credentials, webhook paths, bot names, DB schemas, LLM config, RAG parameters, and system prompts with {{PLACEHOLDER}} tokens
- Both templates use manual HTTP→Code→Postgres RAG pattern (production-proven across 8/9 workflows)
- Templates ship with `"active": false` — safe to import without webhook collisions

## Task Commits

Each task was committed atomically:

1. **Task 1: Export and parameterize bot-chat-orchestrator.json** - `3935b95` (feat)
2. **Task 2: Export and parameterize bot-tool-webhook.json** - `7b1d379` (feat)

## Files Created/Modified
- `factory/n8n-templates/bot-chat-orchestrator.json` - 12-node chat workflow template with memory, intake context block, conversation history
- `factory/n8n-templates/bot-tool-webhook.json` - 10-node stateless tool webhook template with category-filtered RAG search

## Decisions Made
- Used direct pgvector distance operator (`<=>` with threshold) instead of `waterbot_match_documents()` function — the function is bot-specific and non-portable; raw SQL works with any schema's `document_chunks` table
- Chat orchestrator keeps `{{INTAKE_CONTEXT_BLOCK}}` as a single replaceable block rather than per-field placeholders — each bot has completely different intake form fields, so a block replacement is cleaner than trying to generalize the field structure
- Tool webhook includes `{{RAG_CATEGORY_FILTER}}` in the WHERE clause (not optional) — tool webhooks are by design topic-scoped, so category filtering is always appropriate

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Replaced match_documents function with direct pgvector SQL**
- **Found during:** Task 1 (Prepare Search parameterization)
- **Issue:** Production workflow uses `public.waterbot_match_documents()` — a WaterBot-specific function that won't exist in new projects
- **Fix:** Replaced with direct `SELECT * FROM {{DB_SCHEMA}}.document_chunks WHERE embedding <=> vector < threshold ORDER BY distance LIMIT k` — portable across any schema
- **Files modified:** factory/n8n-templates/bot-chat-orchestrator.json, factory/n8n-templates/bot-tool-webhook.json
- **Verification:** Both JSON files valid, SQL pattern uses standard pgvector operators
- **Committed in:** 3935b95, 7b1d379

---

**Total deviations:** 1 auto-fixed (1 bug), 0 deferred
**Impact on plan:** Essential for portability — templates must work with any schema, not just WaterBot's custom function.

## Issues Encountered
None

## Next Phase Readiness
- Both templates ready for 04-02 (README with import/placeholder guide)
- Placeholder tokens are self-documenting and consistent between templates
- No blockers

---
*Phase: 04-n8n-templates*
*Completed: 2026-02-08*
