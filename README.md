<p align="center">
  <img src="https://img.shields.io/badge/Platform-n8n_|_Multi--Agent_AI-FF6D5A?style=for-the-badge" alt="Platform"/>
  <img src="https://img.shields.io/badge/LLMs-GPT--4_|_Claude_|_Gemini-blueviolet?style=for-the-badge" alt="LLMs"/>
  <img src="https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge" alt="Status"/>
</p>

# CA-AIDev

**Multi-agent AI systems and citizen-facing government services for California.**

This repository contains AI-powered applications designed to streamline government services and improve citizen experiences. Each project uses multi-agent architectures with specialized AI agents that collaborate to deliver accurate, personalized guidance.

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

### CommentBot - Public Comment Analyzer

<img src="https://img.shields.io/badge/Status-Production-success" alt="Production"/> <img src="https://img.shields.io/badge/Agents-4-blue" alt="Agents"/>

Multi-agent system for analyzing public comments submitted to state government agencies during regulatory proceedings.

**Capabilities:**
- Legal argument analysis and citation validation
- Scientific claim evaluation and evidence assessment
- Sentiment and urgency detection
- Automated response recommendations

**Agents:**
| Agent | Role | Model |
|-------|------|-------|
| Main Supervisor | Routes and synthesizes | GPT-4o |
| Legal Agent | Regulatory/statutory analysis | Claude 3.5 Sonnet |
| Scientific Agent | Evidence evaluation | Gemini 1.5 Pro |
| Database Writer | Structured storage | - |

[View CommentBot Documentation](./commentbot/)

---

### WiseBot - Knowledge Ingestion System

<img src="https://img.shields.io/badge/Status-Production-success" alt="Production"/> <img src="https://img.shields.io/badge/Type-RAG_Pipeline-blue" alt="RAG Pipeline"/>

Comprehensive n8n-based document ingestion and retrieval system that processes email attachments, extracts content, generates embeddings, and provides intelligent knowledge retrieval via a unified gateway.

**Capabilities:**
- Multi-format processing (PDF, DOCX, MD, MP3, images, CSV, XLSX)
- Audio transcription via Whisper
- Image OCR + Vision AI analysis
- Smart deduplication (hash + embedding similarity)
- Semantic search with pgvector
- Unified Knowledge Gateway API

**Workflows:**
| Workflow | Purpose |
|----------|---------|
| Email Ingestion | Monitors Gmail for documents |
| Parse & Normalize | Extracts content from all formats |
| Dedup & Hash | Prevents duplicate processing |
| Embed & Store | Generates and stores embeddings |
| Knowledge Gateway | RAG retrieval API |
| Ops Dashboard | Health monitoring and alerts |

[View WiseBot Documentation](./wisebot/)

---

### ADABot - Accessibility Compliance Guide

<img src="https://img.shields.io/badge/Status-Documentation-yellow" alt="Documentation"/>

Guide and assessment system for ADA (Americans with Disabilities Act) compliance, focusing on WCAG 2.2 Level AA requirements for PDF documents.

**Features:**
- WCAG 2.2 compliance checklists
- PDF-specific accessibility requirements
- Automated testing tool recommendations
- California web standards alignment

[View ADABot Documentation](./adabot/)

---

### AskCA - Digital Services Research

<img src="https://img.shields.io/badge/Status-Research-informational" alt="Research"/>

Research and documentation for California government digital services strategy, including analysis of essential citizen services.

**Includes:**
- **Domain Crawler**: Production-ready Scrapy-based crawler for discovering California state government endpoints (*.ca.gov)

[View AskCA Documentation](./askca/)

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
| **AI Models** | GPT-4/4o, Claude 3.5 Sonnet, Gemini 1.5 Pro | Multi-LLM support for task-specific routing |
| **Vector Database** | Qdrant / Supabase pgvector | Knowledge base semantic search |
| **Relational Database** | PostgreSQL | Structured data, analytics, logging |
| **Graph Database** | Neo4j | Relationship mapping (Domain Crawler) |
| **Queue** | Redis | Distributed task management |
| **Forms** | Tally + Google Sheets | User input collection |
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
├── adabot/                # ADA compliance guidance
│   ├── README.md
│   ├── wcag-checklist.md
│   ├── postgres-schema.md
│   └── n8n-workflow-guide.md
├── askca/                 # Digital services research
│   ├── README.md
│   └── domain-crawler/    # Government endpoint crawler
├── bizbot/                # Business licensing multi-agent system
│   ├── README.md
│   ├── BizBot_V1/         # Initial version
│   ├── BizBot_v2/         # Second iteration
│   ├── BizBot_v3/         # Current production version
│   └── BizAssessment/     # Model comparison research
├── commentbot/            # Public comment analysis system
│   ├── README.md
│   ├── *-workflow.json    # n8n workflow definitions
│   ├── database-schema.sql
│   └── sample-comments.json
└── wisebot/               # Knowledge ingestion system
    ├── README_WiseBot_Ingestion.md
    ├── wisebot_knowledge_schema.sql
    └── wisebot_*_n8n.json # n8n workflow definitions
```

---

## Performance Metrics

| Project | Processing Time | Daily Capacity | Cost per Request |
|---------|-----------------|----------------|------------------|
| BizBot | 2-5 minutes | 1,000-2,000 | ~$0.36 |
| CommentBot | 30-60 seconds | 5,000+ | ~$0.15 |

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

Projects developed for California state government use. Contact repository maintainers for usage guidelines.

---

<p align="center">
  <b>AI-Powered Government Services for California</b><br/>
  <i>Making government work better for everyone</i>
</p>
