<!-- Factory form-track roadmap template. Copy to .planning/ROADMAP.md and replace {{placeholders}}. -->
# Roadmap: {{PROJECT_TITLE}}

## Overview

Build a web-based form application for {{DOMAIN}} deployed on vanderdev.net. The pipeline follows the factory standard: domain research, presentation decks, database design, API layer, core UI, workflow engine, business logic, containerization, and deployment with final presentation updates.

Every project produces two HTML presentation decks (via `/deck`):
- **Stakeholder Deck** — Executive-friendly: regulatory landscape, risk assessment, recommendations, project demo
- **Technical Deck** — Developer-facing: architecture, data model, API layer, deployment, workflow design

## Domain Expertise

None — populated during Phase 1 research.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Domain Research** - Regulatory requirements, legal framework, stakeholder analysis
- [ ] **Phase 2: Research Presentations** - Stakeholder + technical decks from research findings
- [ ] **Phase 3: Database Design** - Supabase schema, table migrations, RLS policies, audit trail
- [ ] **Phase 4: API Layer** - Supabase PostgREST client, data access functions, auth integration
- [ ] **Phase 5: Core UI** - Layout shell, navigation, form components (React + Tailwind)
- [ ] **Phase 6: Workflow Engine** - State machine, role-based actions, status transitions, approval chains
- [ ] **Phase 7: Business Logic** - Domain-specific validation, computed fields, compliance checks
- [ ] **Phase 8: Containerization** - Dockerfile, docker-compose.prod.yml, nginx.conf, build-time env vars
- [ ] **Phase 9: Deploy, Demo & Final Decks** - VPS deployment, demo data, update decks with live demo

## Phase Details

### Phase 1: Domain Research
**Goal**: Conduct multi-perspective research on {{DOMAIN}} regulatory requirements, legal framework, and stakeholder analysis using factory research skill.
**Depends on**: Nothing (first phase)
**Research**: Likely (this IS the research phase)
**Plans**: 2-3 plans

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
- [ ] 02-02: Technical deck — architecture, data model, workflow design

### Phase 3: Database Design
**Goal**: Design and create Supabase schema ({{SCHEMA_NAME}}), table migrations, RLS policies, and audit trail setup following ECOS patterns.
**Depends on**: Phase 1
**Research**: Unlikely (following ECOS patterns)
**Plans**: 2-3 plans

Plans:
- [ ] 03-01: Schema design — core tables, relationships, audit_log
- [ ] 03-02: RLS policies + role-based access rules
- [ ] 03-03: Seed data + migration verification (if needed)

### Phase 4: API Layer
**Goal**: Set up Supabase PostgREST client, data access functions, and authentication integration for {{SCHEMA_NAME}} schema.
**Depends on**: Phase 3
**Research**: Unlikely
**Plans**: 1-2 plans

Plans:
- [ ] 04-01: PostgREST client setup + CRUD data access functions
- [ ] 04-02: Authentication integration + API verification (if needed)

### Phase 5: Core UI
**Goal**: Build layout shell, navigation, and form components using React + Tailwind following vanderdev.net design system.
**Depends on**: Phase 4
**Research**: Unlikely
**Plans**: 2-3 plans

Plans:
- [ ] 05-01: Layout shell — app chrome, navigation, responsive container
- [ ] 05-02: Form components — inputs, selectors, validation UI, status badges
- [ ] 05-03: Design polish + component library (if needed)

### Phase 6: Workflow Engine
**Goal**: Implement state machine for form workflow with role-based actions, status transitions, and approval chains.
**Depends on**: Phase 5
**Research**: Unlikely
**Plans**: 2-3 plans

Plans:
- [ ] 06-01: State machine — workflow states, valid transitions, role permissions
- [ ] 06-02: Approval chain UI — pending queue, action buttons, status tracking
- [ ] 06-03: Workflow edge cases + error handling (if needed)

### Phase 7: Business Logic
**Goal**: Implement domain-specific validation rules, computed fields, compliance checks, and reporting for {{DOMAIN}}.
**Depends on**: Phase 6
**Research**: Unlikely
**Plans**: 2-3 plans

Plans:
- [ ] 07-01: Validation rules + computed fields for domain requirements
- [ ] 07-02: Compliance checks + reporting views
- [ ] 07-03: Business rule edge cases + audit integration (if needed)

### Phase 8: Containerization
**Goal**: Create Dockerfile (multi-stage), docker-compose.prod.yml, nginx.conf, and build-time env vars for {{PROJECT_NAME}} container following ECOS Docker patterns.
**Depends on**: Phase 7
**Research**: Unlikely (following ECOS Docker patterns)
**Plans**: 1-2 plans

Plans:
- [ ] 08-01: Dockerfile + docker-compose.prod.yml + nginx.conf
- [ ] 08-02: Build verification + env var configuration (if needed)

### Phase 9: Deploy, Demo & Final Decks
**Goal**: Deploy {{PROJECT_NAME}} to vanderdev.net VPS, seed demo data, configure nginx-proxy routing, regenerate both presentation decks with live demo screenshots and real metrics.
**Depends on**: Phase 8
**Research**: Unlikely
**Plans**: 2-3 plans

Plans:
- [ ] 09-01: VPS deployment + nginx-proxy config + SSL verification
- [ ] 09-02: Demo data seeding + guided demo experience
- [ ] 09-03: Final deck updates with live demo + production metrics

## Progress

**Execution Order:**
Strictly sequential (1 → 2 → 3 → ... → 9). Forms have tighter coupling between phases than bots.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Domain Research | 0/2-3 | Not started | - |
| 2. Research Presentations | 0/2 | Not started | - |
| 3. Database Design | 0/2-3 | Not started | - |
| 4. API Layer | 0/1-2 | Not started | - |
| 5. Core UI | 0/2-3 | Not started | - |
| 6. Workflow Engine | 0/2-3 | Not started | - |
| 7. Business Logic | 0/2-3 | Not started | - |
| 8. Containerization | 0/1-2 | Not started | - |
| 9. Deploy, Demo & Final Decks | 0/2-3 | Not started | - |
