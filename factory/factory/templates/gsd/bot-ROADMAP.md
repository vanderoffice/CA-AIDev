<!-- Factory bot-track roadmap template. Copy to .planning/ROADMAP.md and replace {{placeholders}}. -->
# Roadmap: {{PROJECT_TITLE}}

## Overview

Build a RAG chatbot for {{DOMAIN}} deployed on vanderdev.net. The pipeline follows the factory standard: multi-perspective domain research, presentation decks, knowledge base authoring, RAG ingest, decision trees, n8n workflow wiring, frontend integration, testing, and deployment with final presentation updates.

Every project produces two HTML presentation decks (via `/deck`):
- **Stakeholder Deck** — Executive-friendly: regulatory landscape, risk assessment, recommendations, project demo
- **Technical Deck** — Developer-facing: architecture, data model, RAG pipeline, deployment, API reference

## Domain Expertise

None — populated during Phase 1 research.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Domain Research** - Multi-perspective research using factory research skill
- [ ] **Phase 2: Research Presentations** - Stakeholder + technical decks from research findings
- [ ] **Phase 3: Knowledge Base** - Author knowledge documents from research assessment
- [ ] **Phase 4: RAG Pipeline** - Chunk, embed, validate knowledge into pgvector
- [ ] **Phase 5: Decision Trees** - Interactive decision tree JSON for domain-specific tools
- [ ] **Phase 6: n8n Workflows** - Chat webhook, RAG orchestrator, tool webhook
- [ ] **Phase 7: Frontend** - Bot page component in vanderdev-website SPA
- [ ] **Phase 8: Integration & Testing** - Wire frontend to n8n, end-to-end RAG test
- [ ] **Phase 9: Deploy & Final Decks** - Deploy to vanderdev.net, update decks with live demo

## Phase Details

### Phase 1: Domain Research
**Goal**: Conduct multi-perspective research on {{DOMAIN}} using factory research skill (5 subagent perspectives). Produce stakeholder brief, developer assessment, and Memory entities.
**Depends on**: Nothing (first phase)
**Research**: Likely (this IS the research phase)
**Plans**: 2-3 plans (one per research perspective group)

Plans:
- [ ] 01-01: Research perspectives 1-3 (Legal, Policy, Operations)
- [ ] 01-02: Research perspectives 4-5 (Technical, Constituent) + synthesis
- [ ] 01-03: Research quality review + Memory entity creation (if needed)

### Phase 2: Research Presentations
**Goal**: Generate stakeholder and technical presentation decks from Phase 1 research findings using /deck pipeline.
**Depends on**: Phase 1
**Research**: Unlikely
**Plans**: 2 plans

Plans:
- [ ] 02-01: Stakeholder deck — regulatory landscape, risk assessment, recommendations
- [ ] 02-02: Technical deck — architecture, data model, RAG pipeline design

### Phase 3: Knowledge Base
**Goal**: Author knowledge documents from research assessment. Convert research findings into chunk-friendly markdown following factory knowledge template standard (7-field YAML frontmatter, H2 = chunk boundary).
**Depends on**: Phase 1
**Research**: Unlikely
**Plans**: 2-4 plans (one per knowledge domain area, varies by project)

Plans:
- [ ] 03-01: Core knowledge documents (primary domain topics)
- [ ] 03-02: Supporting knowledge documents (secondary topics, edge cases)
- [ ] 03-03: Knowledge quality review + frontmatter validation (if needed)

### Phase 4: RAG Pipeline
**Goal**: Chunk knowledge docs, embed via OpenAI, load into {{SCHEMA_NAME}}.document_chunks, validate with quality gate using factory scripts.
**Depends on**: Phase 3
**Research**: Unlikely (using established factory scripts)
**Plans**: 1-2 plans

Plans:
- [ ] 04-01: Chunk + embed + validate (chunk-knowledge.js → embed-chunks.py → validate-knowledge.py)
- [ ] 04-02: Quality gate review + re-chunk if needed (if needed)

### Phase 5: Decision Trees
**Goal**: Create interactive decision tree JSON for domain-specific tools (e.g., permit finders, eligibility checkers). Follow factory decision-tree-schema.json standard.
**Depends on**: Phase 3
**Research**: Unlikely
**Plans**: 1-3 plans (one per decision tree)

Plans:
- [ ] 05-01: Primary decision tree (main domain tool)
- [ ] 05-02: Secondary decision tree (if applicable)

### Phase 6: n8n Workflows
**Goal**: Import and parameterize n8n workflow templates (chat webhook, RAG orchestrator, tool webhook). Connect to {{SCHEMA_NAME}}.document_chunks.
**Depends on**: Phase 4
**Research**: Unlikely (using factory n8n-templates/)
**Plans**: 2 plans

Plans:
- [ ] 06-01: Chat webhook + RAG orchestrator workflows
- [ ] 06-02: Tool webhook(s) + workflow verification

### Phase 7: Frontend
**Goal**: Create {{PROJECT_NAME}} page component in vanderdev-website SPA. Includes BotModeSelector, DecisionTreeView, BotChatInterface, RAGButton. Follow WaterBot quality standard.
**Depends on**: Phase 5, Phase 6
**Research**: Unlikely
**Plans**: 2-3 plans

Plans:
- [ ] 07-01: Page component shell + mode selector + chat integration
- [ ] 07-02: Decision tree views + RAG button integration
- [ ] 07-03: Polish, accessibility, responsive QA (if needed)

### Phase 8: Integration & Testing
**Goal**: Wire frontend to n8n webhooks, end-to-end RAG test, decision tree integration, tool webhook testing.
**Depends on**: Phase 7
**Research**: Unlikely
**Plans**: 2 plans

Plans:
- [ ] 08-01: End-to-end wiring + RAG response quality validation
- [ ] 08-02: Decision tree + tool webhook integration testing

### Phase 9: Deploy & Final Decks
**Goal**: Deploy to vanderdev.net VPS, seed production data, regenerate both presentation decks with live demo screenshots and real metrics.
**Depends on**: Phase 8
**Research**: Unlikely
**Plans**: 2-3 plans

Plans:
- [ ] 09-01: Production deployment + DNS/routing verification
- [ ] 09-02: Final deck updates with live demo + production metrics
- [ ] 09-03: Demo walkthrough + stakeholder review (if needed)

## Progress

**Execution Order:**
Phase 1 first, then Phases 2+3 can run in parallel, Phase 4 after 3, Phase 5 parallel with 4, Phase 6 after 4, Phase 7 after 5+6, Phase 8 after 7, Phase 9 last.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Domain Research | 0/2-3 | Not started | - |
| 2. Research Presentations | 0/2 | Not started | - |
| 3. Knowledge Base | 0/2-4 | Not started | - |
| 4. RAG Pipeline | 0/1-2 | Not started | - |
| 5. Decision Trees | 0/1-3 | Not started | - |
| 6. n8n Workflows | 0/2 | Not started | - |
| 7. Frontend | 0/2-3 | Not started | - |
| 8. Integration & Testing | 0/2 | Not started | - |
| 9. Deploy & Final Decks | 0/2-3 | Not started | - |
