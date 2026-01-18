<p align="center">
  <img src="https://img.shields.io/badge/Platform-n8n_|_Multi--Agent_AI-FF6D5A?style=for-the-badge" alt="Platform"/>
  <img src="https://img.shields.io/badge/LLMs-GPT--4_|_Claude_|_Gemini-blueviolet?style=for-the-badge" alt="LLMs"/>
  <img src="https://img.shields.io/badge/Status-Production-success?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License"/>
</p>

# CA-AIDev

**Multi-agent AI systems and citizen-facing government services for California.**

This repository contains **production** AI-powered applications designed to streamline government services and improve citizen experiences. Each project uses multi-agent architectures with specialized AI agents that collaborate to deliver accurate, personalized guidance.

---

## Table of Contents

- [Overview](#overview)
- [Projects](#projects)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Repository Structure](#repository-structure)
- [Related Repositories](#related-repositories)
- [Contributing](#contributing)

---

## Overview

California state government serves nearly 40 million residents across hundreds of services. These AI systems aim to:

- **Reduce friction** in accessing government services
- **Provide personalized guidance** based on individual circumstances
- **Automate analysis** of complex regulatory requirements
- **Scale expertise** that would otherwise require specialized staff

Each project follows a **supervisor-subordinate agent pattern** where a main orchestrator delegates to specialized domain experts.

---

## Projects

### BizBot - Business Licensing Assistant

<img src="https://img.shields.io/badge/Status-Production-success" alt="Production"/> <img src="https://img.shields.io/badge/Agents-6-blue" alt="Agents"/>

Multi-agent system providing personalized California business licensing guidance. Users submit a form and receive a detailed PDF guide via email within 2-5 minutes.

**Coverage:**
- All 482 California cities
- All 58 counties
- 8+ specialized industries (healthcare, food service, cannabis, construction, etc.)

**Agents:**
| Agent | Role |
|-------|------|
| Supervisor | Orchestrates workflow, synthesizes responses |
| Entity Formation | Business structure, registration, EIN |
| State Licensing | State-level permits and certifications |
| Local Licensing | City/county business licenses and zoning |
| Industry Specialist | Sector-specific requirements |
| Renewal & Compliance | Ongoing obligations and deadlines |

[View BizBot Documentation](./bizbot/)

---

### KiddoBot - California Childcare Navigator

<img src="https://img.shields.io/badge/Status-Production-success" alt="Production"/> <img src="https://img.shields.io/badge/Programs-5+-blue" alt="Programs"/> <img src="https://img.shields.io/badge/Interface-Chat-orange" alt="Chat"/>

**Live at:** [vanderdev.net/kiddobot](https://vanderdev.net/kiddobot)

An AI assistant helping California families navigate childcare subsidies, find providers, and complete applications.

**Capabilities:**
- **Guided Setup** - 4-step intake form collecting family context
- **Just Chat** - Direct conversation without intake
- **Subsidy Calculator** - Interactive eligibility checker

**Programs Covered:**
| Program | Ages |
|---------|------|
| CalWORKs Childcare | 0-12 |
| CCDF | 0-12 |
| Regional Center (Early Start) | 0-3 |
| Head Start | 3-5 |
| State Preschool (CSPP) | 3-4 |

[View KiddoBot Documentation](./kiddobot/)

---

### WaterBot - Water Boards RAG Chatbot

<img src="https://img.shields.io/badge/Status-Production-success" alt="Production"/> <img src="https://img.shields.io/badge/Type-RAG_Chatbot-blue" alt="RAG"/> <img src="https://img.shields.io/badge/React-18.2-61DAFB" alt="React"/>

AI-powered assistant helping users navigate California's water regulations, permits, and funding programs. Built with React + Vite + Tailwind CSS.

**Features:**
| Feature | Status | Description |
|---------|--------|-------------|
| **Ask WaterBot** | ✅ Live | RAG-powered chat with source citations |
| **Permit Finder** | 🔜 Coming | Decision tree tool for permit requirements |
| **Funding Navigator** | 🔜 Coming | Eligibility checker for water infrastructure grants |

**Serves:**
- Small business owners needing water discharge permits
- Environmental organizations seeking restoration funding
- Agricultural operations managing compliance requirements
- Local governments pursuing infrastructure financing

[View WaterBot Documentation](./waterbot/)

---

## Architecture

All production systems follow a consistent multi-agent pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER REQUEST                              │
│                    (Form / API / Webhook)                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPERVISOR AGENT                              │
│              (Orchestration & Synthesis)                         │
│                                                                  │
│  • Analyzes request context                                      │
│  • Determines which specialists to invoke                        │
│  • Synthesizes responses into cohesive output                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
     ┌──────────┐    ┌──────────┐    ┌──────────┐
     │ Agent A  │    │ Agent B  │    │ Agent C  │
     │ (Domain  │    │ (Domain  │    │ (Domain  │
     │  Expert) │    │  Expert) │    │  Expert) │
     └──────────┘    └──────────┘    └──────────┘
            │               │               │
            └───────────────┼───────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     OUTPUT GENERATION                            │
│              (PDF / Email / Database / API)                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Workflow Engine** | n8n | Visual workflow automation, agent orchestration |
| **AI Models** | Claude Sonnet, GPT-4o | Multi-LLM support for task-specific routing |
| **Vector Database** | Supabase pgvector | Knowledge base semantic search (RAG) |
| **Relational Database** | PostgreSQL | Structured data, analytics, logging |
| **Frontend** | React + Vite + Tailwind CSS | Chat interfaces (KiddoBot, WaterBot) |
| **Forms** | Tally + Google Sheets | User input collection (BizBot) |
| **Output** | PDF generation, SMTP email | Citizen delivery |

---

## Getting Started

### Prerequisites

- n8n instance (self-hosted or cloud)
- PostgreSQL database
- API keys for LLM providers (OpenAI, Anthropic, Google)
- SMTP credentials for email delivery

### Quick Start

1. **Choose a project** from the folders above
2. **Read the project README** for specific setup instructions
3. **Import n8n workflows** in the specified order
4. **Configure credentials** in n8n settings
5. **Test with sample data** provided in each project

### Deployment Pattern

```bash
# 1. Set up infrastructure (see CA-DevStacks repo)
docker compose up -d

# 2. Import workflows to n8n
# 3. Configure API credentials
# 4. Load knowledge bases (if applicable)
# 5. Create intake forms
# 6. Test and deploy
```

---

## Repository Structure

```
CA-AIDev/
├── README.md              # This file
├── CLAUDE.md              # AI assistant context
├── bizbot/                # Business licensing multi-agent system
│   ├── README.md
│   ├── BizBot_V1/         # Initial version
│   ├── BizBot_v2/         # Second iteration
│   ├── BizBot_v3/         # Current production version
│   └── BizAssessment/     # Model comparison research
├── kiddobot/              # Childcare navigation chatbot
│   ├── README.md
│   ├── KIDDOBOT-IMPROVEMENTS.md
│   └── ChildCareAssessment/  # Assessment tools
└── waterbot/              # Water Boards RAG chatbot
    ├── README.md
    ├── src/               # React frontend
    ├── knowledge/         # RAG knowledge base
    └── permit-decision-tree.json
```

> **Archived Projects:** ADABot, AskCA, CommentBot, and WiseBot have been moved to `~/Documents/GitHub/ARCHIVE/CA-AIDev-Deprecated/` as they were planning/research artifacts that were not deployed to production.

---

## Performance Metrics

| Project | Processing Time | Interface | Cost per Request |
|---------|-----------------|-----------|------------------|
| BizBot | 2-5 minutes | Form → Email PDF | ~$0.36 |
| KiddoBot | Real-time | Chat | ~$0.05 |
| WaterBot | Real-time | Chat | ~$0.05 |

---

## Related Repositories

| Repository | Description |
|------------|-------------|
| [CA-Strategy](https://github.com/vanderoffice/CA-Strategy) | Strategic planning and governance frameworks |
| [CA-DevStacks](https://github.com/vanderoffice/CA-DevStacks) | Docker-based development environments |

---

## Contributing

Contributions welcome for:

- Improving agent prompts and accuracy
- Adding new specialized agents
- Expanding knowledge bases
- Documentation improvements
- Testing and validation

Please review individual project READMEs for specific contribution guidelines.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>AI-Powered Government Services for California</b><br/>
  <i>Making government work better for everyone</i>
</p>
