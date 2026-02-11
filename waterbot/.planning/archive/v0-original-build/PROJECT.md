# WaterBot

## What This Is

WaterBot is a professional-grade RAG chatbot for California Water Boards, deployed on vanderdev.net as the third chatbot in the series after KiddoBot (childcare) and BizBot (business licensing). It helps small businesses, environmental organizations, agricultural operations, local governments, and non-profits navigate water permits, regulations, and funding programs.

## Core Value

Accurate, well-cited answers to "Do I need a permit?" and "Am I eligible for funding?" — the two questions that drive every Water Boards interaction.

## Requirements

### Validated

- [x] n8n workflows deployed and functional (4 workflows)
- [x] Supabase schema with pgvector extension
- [x] React frontend component (WaterBot.jsx)
- [x] Knowledge base created (permits, funding, compliance, water quality)
- [x] Chunking and embedding pipeline functional

### Active

- [x] RAG-powered chat with source citations (cosine similarity > 0.70, Top-K: 8)
- [x] "Do I Need a Permit?" backend workflow (`/webhook/waterbot-permits`)
- [x] Funding Navigator backend workflow (`/webhook/waterbot-funding`)
- [x] Knowledge base covering all 9 Regional Water Quality Control Boards
- [x] Permit type documentation (NPDES, WDR, 401 Certification, Water Rights, Habitat Restoration)
- [x] Funding program documentation including Proposition 4 (2024) — $10B bond
- [ ] Multi-model research validation matching KiddoBot quality (4.8/5.0 standard)
- [ ] IntakeForm questionnaire (5 steps: Project Type, Location, Discharge, Water Needs, Applicant)
- [x] Disclaimer on all responses (not legal advice, contact Regional Board)

### Pending Deployment

- [ ] Frontend integration with vanderdev.net
- [ ] Route added to App.jsx
- [ ] NavItem added to Sidebar.jsx

### Out of Scope

- User accounts / login / saved sessions — stateless chatbot, no personalization
- Form pre-filling / PDF generation — WaterBot informs, doesn't fill applications
- Features beyond handoff document — scope is locked
- Mobile app — web-only on vanderdev.net

## Context

**Existing Architecture (must follow):**
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: n8n webhooks (n8n.vanderdev.net)
- Vector DB: Supabase PostgreSQL + pgvector
- Embeddings: OpenAI `text-embedding-3-small` (1536 dimensions)
- LLM: Claude Sonnet
- Hosting: Hostinger FTP via GitHub Actions

**Key Patterns from KiddoBot:**
- `alwaysOutputData: true` on vector search node (prevents silent failures)
- `escapeBraces()` function for LangChain templates
- Fallback handler for empty search results
- Multi-model validation: Perplexity → Claude → GPT-4o → Gemini → Claude reconciliation

**Knowledge Base Structure:**
- 9 regional boards + statewide
- Permit types: NPDES (individual/general), WDR, 401 Certification, Water Rights, Habitat Restoration
- Funding programs: CWSRF, DWSRF, SAFER, WIFIA, Prop 1/4/68, DAC, Tribal

**Reference Files:**
- KiddoBot pattern: `/Users/slate/Documents/GitHub/vanderdev-website/src/pages/KiddoBot.jsx`
- BizBot pattern: `/Users/slate/Documents/GitHub/vanderdev-website/src/pages/BizBot.jsx`
- KiddoBot knowledge base: `/Users/slate/Documents/GitHub/CA-AIDev/kiddobot/ChildCareAssessment/`
- Handoff document: `/Users/slate/Documents/GitHub/CA-AIDev/waterbot/WATERBOT-PROJECT-HANDOFF.md`

## Constraints

- **Tech Stack**: React + n8n + Supabase + Claude — locked to match KiddoBot/BizBot architecture
- **Documentation Quality**: Must match KiddoBot standard (multi-model validation, 4.8/5.0 quality rating, all figures cited)
- **Documentation Format**: Use markdown headers (KiddoBot style), not YAML frontmatter
- **Vector DB Tuning**: Phase 7 is critical — target average score ≥ 4.0, no scores below 3
- **Disclaimer Required**: All responses must include disclaimer that this is not legal advice

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Markdown headers over YAML frontmatter | Match KiddoBot proven pattern, simpler human-readable format | — Pending |
| All three tools equally prioritized | User specified no priority order — ship together | — Pending |
| Knowledge base in separate repo (CA-AIDev/waterbot-knowledge) | Separation of concerns, easier research collaboration | — Pending |

---
*Last updated: 2026-01-17 — synced with production state*
