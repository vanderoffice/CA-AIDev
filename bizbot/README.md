# BizBot - California Business Licensing Assistant

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production-success" alt="Production"/>
  <img src="https://img.shields.io/badge/Agents-6-blue" alt="6 Agents"/>
  <img src="https://img.shields.io/badge/Coverage-482_Cities-informational" alt="Coverage"/>
  <img src="https://img.shields.io/badge/Interface-Chat-orange" alt="Chat Interface"/>
</p>

**A multi-agent AI system providing personalized California business licensing guidance.**

**Live at:** [vanderdev.net/bizbot](https://vanderdev.net/bizbot)

## Interfaces

| Mode | Description |
|------|-------------|
| **Guided Setup** | 4-step intake form for personalized context |
| **Just Chat** | Direct conversation without intake |
| **License Finder** | Interactive calculator showing required licenses |

The chat interface supports full conversation history, business context injection, and markdown rendering with clickable links.

---

## Table of Contents

- [Interfaces](#interfaces)
- [Overview](#overview)
- [How It Works](#how-it-works)
- [Agent Architecture](#agent-architecture)
- [Version History](#version-history)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Performance](#performance)
- [Testing](#testing)
- [Folder Structure](#folder-structure)

---

## Overview

Starting a business in California requires navigating a complex web of federal, state, and local requirements that vary by:

- Business structure (LLC, Corporation, Sole Proprietor, etc.)
- Industry type (retail, food service, healthcare, cannabis, etc.)
- Location (city and county regulations)
- Size and scope of operations

BizBot automates this research by using specialized AI agents that work together to generate personalized guidance covering all four phases of business formation.

---

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Tally Form    │────▶│  Google Sheets  │────▶│      n8n        │
│   (User Input)  │     │   (Data Store)  │     │   (Trigger)     │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                        ┌────────────────────────────────────────────┐
                        │           SUPERVISOR AGENT                  │
                        │   • Analyzes business profile               │
                        │   • Orchestrates sub-agents                 │
                        │   • Synthesizes final report                │
                        └────────────────────┬───────────────────────┘
                                             │
              ┌──────────────┬───────────────┼───────────────┬──────────────┐
              │              │               │               │              │
              ▼              ▼               ▼               ▼              ▼
        ┌──────────┐  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
        │  Entity  │  │  State   │   │  Local   │   │ Industry │   │ Renewal  │
        │Formation │  │ Licensing│   │ Licensing│   │Specialist│   │Compliance│
        │  Agent   │  │  Agent   │   │  Agent   │   │  Agent   │   │  Agent   │
        └────┬─────┘  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
              │              │               │               │              │
              └──────────────┴───────────────┼───────────────┴──────────────┘
                                             │
                                             ▼
                        ┌────────────────────────────────────────────┐
                        │         PDF GENERATION & EMAIL             │
                        │   • Markdown to PDF conversion             │
                        │   • SMTP delivery to user                  │
                        │   • Database logging                       │
                        └────────────────────────────────────────────┘
```

---

## Agent Architecture

### Supervisor Agent (Main Workflow)
- **Model**: GPT-4 Turbo or Claude 3.5 Sonnet
- **Role**: Orchestrates the entire process, routes to specialists, synthesizes responses
- **Tools**: Access to all 5 sub-agent workflows

### Phase 1: Entity Formation Agent
- **Focus**: Business structure selection, registration, federal requirements
- **Outputs**:
  - Recommended entity type with pros/cons
  - Secretary of State registration steps
  - EIN application process
  - Registered agent requirements
  - Timeline: 1-2 weeks

### Phase 2: State Licensing Agent
- **Focus**: California state-level permits and certifications
- **Outputs**:
  - Required state licenses by business type
  - Professional certifications
  - State tax registrations (BOE, EDD, FTB)
  - Environmental permits
  - Timeline: 2-4 weeks

### Phase 3: Local Licensing Agent
- **Focus**: City and county requirements
- **Outputs**:
  - Business license application
  - Zoning compliance verification
  - Fire/health department permits
  - Signage permits
  - Home occupation permits (if applicable)
  - Timeline: 2-6 weeks

### Phase 4: Industry Specialist Agent
- **Focus**: Sector-specific requirements
- **Specialized Industries**:
  - Healthcare (licenses, HIPAA)
  - Food Service (health permits, handlers cards)
  - Alcohol (ABC licenses)
  - Cannabis (state and local licenses)
  - Construction (CSLB licensing)
  - Childcare (Community Care Licensing)
  - Professional Services (various boards)
  - Transportation (CPUC, DMV)

### Phase 5: Renewal & Compliance Agent
- **Focus**: Ongoing obligations
- **Outputs**:
  - Annual renewal calendar
  - Compliance deadlines
  - Record-keeping requirements
  - Penalty avoidance guidance

---

## Version History

| Version | Status | Description |
|---------|--------|-------------|
| **V1** | Archived | Initial agent prompts and knowledge base |
| **V2** | Archived | Multi-agent architecture, separate workflows |
| **V3** | **Current** | Production version with 6 workflows, vector DB |

### Current Version (V3)

Located in `BizBot_v3/`:

| File | Nodes | Description |
|------|-------|-------------|
| 01_main_workflow.json | 17 | Main orchestrator |
| 02_entity_formation_agent.json | 5 | Phase 1 specialist |
| 03_state_licensing_agent.json | 4 | Phase 2 specialist |
| 04_local_licensing_agent.json | 4 | Phase 3 specialist |
| 05_industry_specialist_agent.json | 4 | Industry expert |
| 06_renewal_compliance_agent.json | 4 | Phase 4 specialist |

---

## Quick Start

### Prerequisites

- n8n instance (self-hosted or cloud)
- PostgreSQL database
- Qdrant vector database (for knowledge base)
- OpenAI and/or Anthropic API keys
- SMTP credentials
- Tally account (for intake form)

### Installation Steps

1. **Set up database**
   ```bash
   psql -U postgres -d bizbot -f BizBot_v3/database_schema.sql
   ```

2. **Import workflows to n8n** (in order)
   - Import sub-agents first (02-06)
   - Import main workflow last (01)

3. **Configure credentials in n8n**
   - PostgreSQL connection
   - OpenAI/Anthropic API keys
   - SMTP settings
   - Tally webhook

4. **Load knowledge base**
   - Upload licensing documentation to Qdrant
   - ~60K+ characters of CA licensing requirements

5. **Create Tally form**
   - Business name, type, location
   - Owner information
   - Industry selection
   - Email for delivery

6. **Connect Google Sheets**
   - Form responses flow to Sheets
   - n8n triggers on new rows

7. **Test and deploy**
   - Submit test form
   - Verify PDF delivery
   - Check database logging

---

## Configuration

### Environment Variables

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=bizbot
POSTGRES_USER=bizbot
POSTGRES_PASSWORD=secure_password

# AI Models
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Vector Database
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION=ca_licensing

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=bizbot@example.com
SMTP_PASSWORD=secure_password
```

### Model Selection

| Agent | Recommended | Alternative |
|-------|-------------|-------------|
| Supervisor | GPT-4 Turbo | Claude 3.5 Sonnet |
| Entity Formation | Claude 3.5 Sonnet | GPT-4 |
| State Licensing | GPT-4 | Gemini 1.5 Pro |
| Local Licensing | GPT-4 | Claude 3.5 Sonnet |
| Industry Specialist | Claude 3.5 Sonnet | GPT-4 |
| Renewal/Compliance | GPT-4 | Claude 3.5 Sonnet |

---

## Performance

| Metric | Value |
|--------|-------|
| Processing Time | 2-5 minutes |
| Daily Capacity | 1,000-2,000 requests |
| Cost per Request | ~$0.36 |
| Knowledge Base | 60,000+ characters |
| Total Nodes | 38 across 6 workflows |

### Cost Breakdown (per request)

| Component | Cost |
|-----------|------|
| Supervisor (GPT-4) | ~$0.12 |
| Sub-agents (5x) | ~$0.20 |
| Vector search | ~$0.02 |
| PDF generation | ~$0.02 |
| **Total** | **~$0.36** |

---

## Testing

Test scenarios cover diverse business types, locations, and complexity levels.

| Test | Scenario | Score |
|------|----------|-------|
| B1 | Restaurant with bar (San Francisco) | 8/10 |
| B2 | Cannabis retail (Oakland) | 8/10 |
| B3 | Marketing consulting scale-up (Irvine) | 8/10 |
| B4 | General contractor (Riverside) | 9/10 |
| B5 | Out-of-state tech expansion | 8/10 |

**Average:** 8.2/10

See [BizAssessment/test-results-2025-12-31.md](BizAssessment/test-results-2025-12-31.md) for detailed analysis.

---

## Folder Structure

```
bizbot/
├── README.md                 # This file
├── BizBot_V1/               # Initial version (archived)
│   ├── AGENTS.md            # Agent prompt definitions
│   └── *.md                 # Phase-specific guidance
├── BizBot_v2/               # Second version (archived)
│   ├── ARCHITECTURE.md
│   └── *.json               # Workflow files
├── BizBot_v3/               # Current production version
│   ├── README.md            # Detailed setup guide
│   ├── ARCHITECTURE.md      # Technical architecture
│   ├── database_schema.sql  # PostgreSQL schema
│   └── *.json               # n8n workflow files
└── BizAssessment/           # Research & testing
    ├── README.md
    ├── model_comparison.md
    ├── test-results-*.md    # Chat interface test results
    └── BizInterviews_*.md   # LLM evaluation results
```

---

## Sample Output

The generated PDF includes:

1. **Executive Summary** - Business profile and key requirements
2. **Phase 1: Entity Formation** - Registration steps with links
3. **Phase 2: State Licenses** - Required permits with costs
4. **Phase 3: Local Requirements** - City/county specific needs
5. **Phase 4: Industry Requirements** - Specialized permits
6. **Phase 5: Compliance Calendar** - Ongoing obligations
7. **Quick Reference** - All links and contacts in one place

---

## Related Resources

- [CommentBot](../commentbot/) - Similar multi-agent architecture
- [CA-DevStacks](https://github.com/vanderoffice/CA-DevStacks) - Development infrastructure
- [n8n Documentation](https://docs.n8n.io/)

---

*Helping Californians start businesses with confidence*
