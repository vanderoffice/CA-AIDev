# WaterBot v2.0 — Interactive Tools

## What This Is

Two new interactive tools for WaterBot — a **Permit Finder** (guided decision tree) and a **Funding Navigator** (eligibility wizard + program matching) — that complement the existing RAG-powered chat. Both tools use structured questionnaires to walk users through complex decisions, then enrich results with context from WaterBot's 1,401-chunk knowledge base via the existing n8n/pgvector pipeline.

## Core Value

Turn WaterBot from a chat-only tool into a **three-mode assistant** where users can get answers conversationally (chat), find required permits through guided questions (Permit Finder), or discover eligible funding programs through intake screening (Funding Navigator). Each mode links to the others — results always offer "Ask WaterBot about this" as an escape hatch to the full RAG chat.

## Requirements

### Validated

- ✓ WaterBot chat: 35/35 adversarial queries STRONG (100%) — v1.0
- ✓ RAG pipeline: 1,401 chunks, pgvector, n8n webhook (`MY78EVsJL00xPMMw`) — v1.0
- ✓ Knowledge base: 34 JSON files, 313 validated URLs, inline links — v1.0
- ✓ Permit decision tree: 83-node JSON covering 8 project categories — v1.0
- ✓ Funding knowledge: 15 markdown docs (federal, grants, SRF, private) + 7 RAG JSONs — v1.0
- ✓ Frontend: React 18 + Vite + Tailwind, mode selection landing page — v1.0
- ✓ Session persistence via `useBotPersistence` hook — v1.0

### Active

**Shared Infrastructure**
- [ ] Wizard/stepper shell component (back/forward navigation, progress indicator)
- [ ] Result card component (permit or funding program display)
- [ ] "Ask WaterBot about this" handoff — pre-fills chat with contextual question
- [ ] Enable disabled mode buttons on landing page

**Permit Finder**
- [ ] `PermitFinder.jsx` component rendering decision tree from `permit-decision-tree.json`
- [ ] Tree traversal with navigation history (back button support)
- [ ] Result screen with permit details (name, code, agency, link, fees, timeline)
- [ ] RAG bridge — fire `ragQuery` against n8n webhook to enrich results with knowledge base context
- [ ] Requirements and next-steps checklists on result screens

**Funding Navigator**
- [ ] `funding-programs.json` — structured data model with machine-readable eligibility criteria
- [ ] Data sourced from existing 15 markdown + 7 RAG JSON files, then verified against current CA.gov sources
- [ ] Intake questionnaire (system size, population, project type, DAC status, violation history)
- [ ] Deterministic matching algorithm scoring user against program eligibility criteria
- [ ] Results ranked by match quality with eligibility status (Eligible / Likely Eligible / May Qualify)
- [ ] RAG enrichment for program details (application tips, timelines, success factors)

**Quality**
- [ ] Both tools responsive (mobile-friendly via Tailwind)
- [ ] Both tools match existing WaterBot dark theme and design language
- [ ] Cross-link between tools where relevant (e.g., permit result → related funding)

### Out of Scope

- Authentication or user accounts — stays anonymous/public like chat
- BizBot or KiddoBot changes — WaterBot only
- Embedding model or pgvector schema changes — use existing infrastructure
- Admin panel for updating decision trees or funding data — manual JSON editing is fine for now
- PDF export of results — future enhancement

## Context

### Current State (2026-02-13)

- **Chat:** Fully operational at https://vanderdev.net (WaterBot mode)
- **Permit Finder:** Decision tree JSON complete (83 nodes, 2,352 lines). Zero frontend components. Button disabled with "Coming soon."
- **Funding Navigator:** Knowledge content exists but no structured data model. Zero frontend components. Button disabled with "Coming soon."
- **Codebase:** React 18.2 + Vite + Tailwind CSS SPA. Single page component (`WaterBot.jsx`, 368 lines). Components directory has `Icons.jsx` and `BotHeader.jsx` only.
- **n8n webhook:** `https://n8n.vanderdev.net/webhook/waterbot` — accepts `{ message, sessionId, messageHistory }`, returns `{ response, sources }`

### Decision Tree Structure

Each question node has `id`, `type: "question"`, `title`, `helpText`, and `options[]` with `next` pointers. Result nodes have `type: "result"` with `permits[]` (name, code, description, agency, link, estimatedTime, fees), `requirements[]`, `nextSteps[]`, and critically a `ragQuery` string for knowledge base cross-reference.

### Funding Knowledge Available

| Source | Location | Content |
|--------|----------|---------|
| Federal programs | `knowledge/04-funding/federal/` | EPA, FEMA, USDA, other federal |
| State grants | `knowledge/04-funding/grants/` | Prop 1, SWRCB, IRWM, drought |
| State Revolving Funds | `knowledge/04-funding/srf/` | CWSRF, DWSRF, small community |
| Private/alternative | `knowledge/04-funding/private/` | Foundations, alt financing, TA |
| RAG content | `rag-content/waterbot/` | `dwsrf_guide.json`, `cwsrf_guide.json`, `safer_*.json`, `small_community_funding.json`, `dac_grants.json` |

## Constraints

- **Infrastructure**: VPS-hosted Supabase, SSH pipeline for DB ops — no direct DB connection
- **n8n webhook contract**: Must match existing `{ message, sessionId }` → `{ response, sources }` interface for RAG bridge calls
- **Bot is live**: Chat must remain functional throughout development
- **Decision tree is source of truth**: Permit Finder renders from `permit-decision-tree.json` — don't duplicate data into components
- **Funding data accuracy**: All program details must be verified against current CA.gov/federal sources before shipping

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Permit Finder first, Funding Navigator second | Decision tree data is complete; establishes shared component patterns | — Pending |
| RAG-enriched results (not static-only) | Leverages existing 1,401-chunk KB; makes tools feel connected to chat | — Pending |
| Guided wizard + deterministic matching for Funding | More trustworthy than LLM-only matching for eligibility decisions | — Pending |
| "Ask WaterBot" escape hatch on all results | Connects tools back to chat; handles edge cases the structured flow can't | — Pending |
| Funding data: extract from existing → verify against live sources | Content already exists in knowledge/; fresh research fills gaps | — Pending |

---
*Last updated: 2026-02-13 after v2.0 initialization*
