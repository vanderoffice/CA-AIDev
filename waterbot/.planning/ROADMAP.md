# Roadmap: WaterBot

## Overview

WaterBot is a RAG chatbot for California Water Boards, the third in the vanderdev.net series after KiddoBot and BizBot. The journey begins with scaffolding and infrastructure, progresses through comprehensive multi-model research to build the knowledge base, implements the core RAG chat with careful tuning, adds the two specialized tools (Permit Finder and Funding Navigator), and culminates in frontend integration and deployment.

## Domain Expertise

None — web/RAG project following established KiddoBot/BizBot patterns.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Project Scaffolding** — React/Vite/Tailwind setup following KiddoBot pattern
- [x] **Phase 2: Supabase Setup** — pgvector tables and vector DB infrastructure
- [ ] **Phase 3: Knowledge Research: Permits** — Multi-model research for all permit types + 9 regional boards
- [ ] **Phase 4: Knowledge Research: Funding** — Multi-model research for all funding programs
- [ ] **Phase 5: Embedding Pipeline** — n8n workflow for chunking + OpenAI embeddings
- [ ] **Phase 6: Core RAG Chat** — Vector search + Claude response generation + citations
- [ ] **Phase 7: Vector DB Tuning** — Critical optimization phase (target avg ≥ 4.0)
- [ ] **Phase 8: Permit Finder Tool** — "Do I need a permit?" decision tree
- [ ] **Phase 9: Funding Navigator Tool** — Funding eligibility checker
- [ ] **Phase 10: IntakeForm Questionnaire** — 5-step context capture before chat
- [ ] **Phase 11: Frontend Integration** — WaterBot.jsx with chat UI + tool panels
- [ ] **Phase 12: Deployment** — GitHub Actions → Hostinger + production testing

## Phase Details

### Phase 1: Project Scaffolding ✓
**Goal**: Set up React 18 + Vite + Tailwind CSS project structure matching KiddoBot/BizBot architecture
**Depends on**: Nothing (first phase)
**Research**: Unlikely (established patterns from KiddoBot)
**Plans**: 1 plan

Plans:
- [x] 01-01: Initialize Vite + React + Tailwind, create WaterBot skeleton

Reference: `/Users/slate/Documents/GitHub/vanderdev-website/src/pages/KiddoBot.jsx`

### Phase 2: Supabase Setup ✓
**Goal**: Configure Supabase PostgreSQL with pgvector extension and document chunk tables
**Depends on**: Phase 1
**Research**: Unlikely (established patterns from KiddoBot)
**Plans**: 1 plan

Plans:
- [x] 02-01: Create waterbot schema and document_chunks table

### Phase 3: Knowledge Research: Permits
**Goal**: Create comprehensive, multi-model validated documentation for all Water Boards permit types
**Depends on**: Nothing (can run parallel to Phases 1-2)
**Research**: Likely (extensive external research required)
**Research topics**:
- NPDES permits (individual and general)
- Waste Discharge Requirements (WDR)
- 401 Water Quality Certification
- Water Rights permits
- Habitat Restoration permits
- All 9 Regional Water Quality Control Boards + statewide
**Plans**: TBD

Must match KiddoBot quality standard (4.8/5.0 rating, all figures cited).

### Phase 4: Knowledge Research: Funding
**Goal**: Create comprehensive, multi-model validated documentation for all Water Boards funding programs
**Depends on**: Nothing (can run parallel to Phases 1-3)
**Research**: Likely (extensive external research required)
**Research topics**:
- Clean Water State Revolving Fund (CWSRF)
- Drinking Water State Revolving Fund (DWSRF)
- SAFER program
- WIFIA (Water Infrastructure Finance and Innovation Act)
- Proposition 1, 4, 68 programs
- Proposition 4 (2024) — $10B bond
- DAC (Disadvantaged Community) programs
- Tribal water programs
**Plans**: TBD

Must match KiddoBot quality standard.

### Phase 5: Embedding Pipeline
**Goal**: Build n8n workflow to chunk documents and generate OpenAI embeddings (text-embedding-3-small, 1536 dimensions)
**Depends on**: Phase 2 (Supabase tables), Phase 3-4 (knowledge base content)
**Research**: Unlikely (KiddoBot patterns exist)
**Plans**: TBD

Key patterns: `alwaysOutputData: true`, `escapeBraces()` function.

### Phase 6: Core RAG Chat
**Goal**: Implement RAG workflow with vector search, Claude Sonnet response generation, source citations, and disclaimer
**Depends on**: Phase 5
**Research**: Unlikely (KiddoBot patterns exist)
**Plans**: TBD

Requirements:
- Cosine similarity threshold > 0.70
- Top-K: 8 results
- Source citations on all responses
- Disclaimer: "This is not legal advice, contact your Regional Board"
- Fallback handler for empty search results

### Phase 7: Vector DB Tuning
**Goal**: Optimize retrieval quality to meet 4.8/5.0 standard
**Depends on**: Phase 6
**Research**: Unlikely (internal optimization)
**Plans**: TBD

Critical constraints from PROJECT.md:
- Target average score ≥ 4.0
- No individual scores below 3
- Adjust chunking, embeddings, retrieval parameters as needed

### Phase 8: Permit Finder Tool
**Goal**: Build interactive decision tree to answer "Do I need a permit?"
**Depends on**: Phase 3 (permit knowledge)
**Research**: Likely (decision tree logic requires Water Boards verification)
**Research topics**:
- Permit decision flowcharts from Water Boards
- Edge cases and exemptions
- Regional variations
**Plans**: TBD

### Phase 9: Funding Navigator Tool
**Goal**: Build eligibility checker for funding programs
**Depends on**: Phase 4 (funding knowledge)
**Research**: Likely (eligibility rules require verification)
**Research topics**:
- Eligibility criteria for each program
- Application requirements
- Matching/cost-share requirements
- Priority scoring factors
**Plans**: TBD

### Phase 10: IntakeForm Questionnaire
**Goal**: Build 5-step questionnaire to capture context before chat
**Depends on**: Phase 6 (core chat exists)
**Research**: Unlikely (UI component, internal patterns)
**Plans**: TBD

Steps (from PROJECT.md):
1. Project Type
2. Location
3. Discharge
4. Water Needs
5. Applicant

### Phase 11: Frontend Integration
**Goal**: Build WaterBot.jsx page with chat UI and tool integration
**Depends on**: Phases 6, 8, 9, 10
**Research**: Unlikely (KiddoBot/BizBot patterns exist)
**Plans**: TBD

References:
- `/Users/slate/Documents/GitHub/vanderdev-website/src/pages/KiddoBot.jsx`
- `/Users/slate/Documents/GitHub/vanderdev-website/src/pages/BizBot.jsx`

### Phase 12: Deployment
**Goal**: Deploy to vanderdev.net via GitHub Actions + Hostinger FTP
**Depends on**: Phase 11
**Research**: Unlikely (existing CI/CD patterns)
**Plans**: TBD

Includes production testing and final quality validation.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

Note: Phases 3-4 (research) can run in parallel with Phases 1-2 (infrastructure).

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Scaffolding | 1/1 | Complete | 2026-01-15 |
| 2. Supabase Setup | 1/1 | Complete | 2026-01-15 |
| 3. Knowledge Research: Permits | 0/TBD | Not started | - |
| 4. Knowledge Research: Funding | 0/TBD | Not started | - |
| 5. Embedding Pipeline | 0/TBD | Not started | - |
| 6. Core RAG Chat | 0/TBD | Not started | - |
| 7. Vector DB Tuning | 0/TBD | Not started | - |
| 8. Permit Finder Tool | 0/TBD | Not started | - |
| 9. Funding Navigator Tool | 0/TBD | Not started | - |
| 10. IntakeForm Questionnaire | 0/TBD | Not started | - |
| 11. Frontend Integration | 0/TBD | Not started | - |
| 12. Deployment | 0/TBD | Not started | - |
