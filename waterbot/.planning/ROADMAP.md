# Roadmap: WaterBot v2.0 — Interactive Tools

## Overview

Transform WaterBot from a chat-only tool into a three-mode assistant by building two interactive tools — a Permit Finder (guided decision tree) and a Funding Navigator (eligibility wizard) — that share infrastructure, connect to the existing RAG pipeline, and cross-link to each other and the chat. Shared components go first, then Permit Finder (data is ready), then Funding Navigator (data needs structuring), then polish.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Shared Infrastructure** - Wizard stepper, result cards, "Ask WaterBot" handoff, landing page activation
- [x] **Phase 2: Permit Finder** - Decision tree rendering, traversal with nav history, result screens, RAG bridge enrichment
- [x] **Phase 3: Funding Data Model** - Extract structured `funding-programs.json` from existing knowledge, verify against live sources
- [ ] **Phase 4: Funding Navigator** - Intake questionnaire, deterministic matching algorithm, ranked results, RAG enrichment
- [ ] **Phase 5: Integration & Polish** - Cross-tool linking, responsive/mobile QA, theme consistency, final testing

## Phase Details

### Phase 1: Shared Infrastructure
**Goal**: Reusable wizard shell, result card, and chat handoff components that both tools will use — plus enabling the disabled mode buttons on the landing page
**Depends on**: Nothing (first phase)
**Research**: Unlikely (internal React/Tailwind component patterns)
**Plans**: 2 plans

Plans:
- [x] 01-01: Wizard stepper shell component (back/forward nav, progress indicator, step management)
- [x] 01-02: Result card component, "Ask WaterBot" handoff, landing page mode button activation

### Phase 2: Permit Finder
**Goal**: Fully functional Permit Finder that renders the 83-node decision tree, supports back navigation, displays permit results with details, and enriches results via RAG
**Depends on**: Phase 1 (wizard shell + result card)
**Research**: Unlikely (decision tree JSON complete, existing n8n webhook contract)
**Plans**: 3 plans

Plans:
- [x] 02-01: PermitFinder component — tree traversal engine, question rendering, navigation history
- [x] 02-02: Permit result screens — permit details display (name, code, agency, fees, timeline, links), requirements and next-steps checklists
- [x] 02-03: RAG bridge — fire `ragQuery` from result nodes against n8n webhook, display enriched context alongside static results

### Phase 3: Funding Data Model
**Goal**: A complete, machine-readable `funding-programs.json` with eligibility criteria for every relevant program, sourced from existing knowledge and verified against current CA.gov/federal sources
**Depends on**: Nothing (data work, can technically parallel Phase 2 but sequenced for focus)
**Research**: Likely (external source verification required)
**Research topics**: Current CA SWRCB/DFA program details, DWSRF/CWSRF current terms, SAFER program status, Prop 1 funding availability, federal EPA/USDA/FEMA current eligibility criteria, DAC designation thresholds
**Plans**: 2 plans

Plans:
- [x] 03-01: Extract and model — design `funding-programs.json` schema, extract program data from existing 15 markdown + 7 RAG JSON files
- [x] 03-02: Verify and complete — cross-reference every program against current CA.gov and federal sources, fill gaps, validate eligibility criteria accuracy

### Phase 4: Funding Navigator
**Goal**: Fully functional Funding Navigator with intake questionnaire, deterministic matching algorithm, ranked results with eligibility status, and RAG enrichment
**Depends on**: Phase 1 (wizard shell + result card) + Phase 3 (funding data model)
**Research**: Unlikely (internal matching logic using Phase 3 data model)
**Plans**: 3 plans

Plans:
- [ ] 04-01: Intake questionnaire — system size, population served, project type, DAC status, violation history (using wizard stepper from Phase 1)
- [ ] 04-02: Matching algorithm — deterministic scoring of user answers against program eligibility criteria, ranked results with Eligible / Likely Eligible / May Qualify tiers
- [ ] 04-03: Results display + RAG enrichment — program cards with match status, RAG bridge for application tips/timelines/success factors, "Ask WaterBot" handoff

### Phase 5: Integration & Polish
**Goal**: Both tools cross-linked, responsive on mobile, matching WaterBot dark theme, and tested end-to-end
**Depends on**: Phase 2 + Phase 4 (both tools functional)
**Research**: Unlikely (internal polish using established patterns)
**Plans**: 2 plans

Plans:
- [ ] 05-01: Cross-tool linking — permit results → related funding programs, funding results → related permits, consistent navigation between all three modes
- [ ] 05-02: Responsive QA and theme polish — mobile layout testing, dark theme consistency, accessibility basics, end-to-end flow testing

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Shared Infrastructure | 2/2 | Complete | 2026-02-13 |
| 2. Permit Finder | 3/3 | Complete | 2026-02-14 |
| 3. Funding Data Model | 2/2 | Complete | 2026-02-14 |
| 4. Funding Navigator | 0/3 | Not started | - |
| 5. Integration & Polish | 0/2 | Not started | - |
