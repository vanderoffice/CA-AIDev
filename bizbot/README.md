# BizBot

**California Business Licensing Assistant**

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production-success" alt="Production"/>
  <img src="https://img.shields.io/badge/Agents-6-blue" alt="6 Agents"/>
  <img src="https://img.shields.io/badge/Coverage-482_Cities-informational" alt="Coverage"/>
  <img src="https://img.shields.io/badge/Interface-Chat-orange" alt="Chat Interface"/>
</p>

**A multi-agent AI system providing personalized California business licensing guidance.**

**Live at:** [vanderdev.net/bizbot](https://vanderdev.net/bizbot)

---

## The Problem

Starting a business in California requires navigating a complex web of requirements that vary by:

- **Business structure** — LLC, Corporation, Sole Proprietor, Partnership
- **Industry type** — Retail, food service, healthcare, cannabis, construction
- **Location** — 482 cities and 58 counties with different rules
- **Size and scope** — Home-based vs. commercial, local vs. statewide

A restaurant in San Francisco needs different permits than a construction company in Riverside. A cannabis retailer faces requirements that a marketing consultant never encounters. One-size-fits-all guidance doesn't work.

---

## What BizBot Does

BizBot provides personalized business licensing guidance through two interfaces:

| Mode | Description |
|------|-------------|
| **Guided Setup** | 4-step intake form for personalized context |
| **Just Chat** | Direct conversation without intake |
| **License Finder** | Interactive calculator showing required licenses |

The chat interface supports full conversation history, business context injection, and markdown rendering with clickable links to official sources.

---

## The Multi-Agent Architecture (Explained)

### Why Multiple Agents?

Most chatbots are single-agent: one AI tries to answer everything. This works for simple questions but fails for complex domains like business licensing.

**Think of it like a law firm:**

You wouldn't ask the tax lawyer about real estate closings. You wouldn't ask the immigration specialist about corporate formation. Each expert handles their domain, and a senior partner coordinates the team.

BizBot works the same way. Six specialized AI agents collaborate, each expert in one phase of business formation.

### How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Input    │────▶│  Context Store  │────▶│    Supervisor   │
│   (Form/Chat)   │     │  (Business Info)│     │     Agent       │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         │ Delegates to specialists
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
                        │              FINAL OUTPUT                   │
                        │   • Synthesized guidance                    │
                        │   • Source citations                        │
                        │   • Next steps                              │
                        └────────────────────────────────────────────┘
```

### The Six Specialist Agents

| Agent | Phase | What It Handles |
|-------|-------|-----------------|
| **Supervisor** | Orchestration | Analyzes business profile, routes to specialists, synthesizes responses |
| **Entity Formation** | Phase 1 | Business structure selection, Secretary of State registration, EIN, registered agent |
| **State Licensing** | Phase 2 | State-level permits, professional certifications, tax registrations (BOE, EDD, FTB) |
| **Local Licensing** | Phase 3 | City/county business licenses, zoning compliance, fire/health permits, signage |
| **Industry Specialist** | Phase 4 | Sector-specific requirements (healthcare, food, alcohol, cannabis, construction) |
| **Renewal & Compliance** | Phase 5 | Annual renewals, compliance deadlines, record-keeping, penalty avoidance |

### Why This Architecture Works

| Single Agent | Multi-Agent |
|--------------|-------------|
| One prompt tries to cover everything | Each agent has focused expertise |
| Context window fills with irrelevant info | Each agent sees only relevant context |
| Errors compound across domains | Domain isolation limits error spread |
| Hard to update one area | Update individual agents independently |
| Generic responses | Deep domain expertise in each area |

---

## Industries Covered

The Industry Specialist Agent has deep knowledge of sector-specific requirements:

| Industry | Key Requirements |
|----------|------------------|
| **Healthcare** | Licenses, HIPAA compliance, facility permits |
| **Food Service** | Health permits, food handler cards, alcohol licenses |
| **Alcohol** | ABC licenses (Type 41, 47, etc.), responsible beverage service |
| **Cannabis** | State and local licenses, track-and-trace, security requirements |
| **Construction** | CSLB licensing, contractor bonds, workers' comp |
| **Childcare** | Community Care Licensing, ratios, background checks |
| **Professional Services** | Board certifications, continuing education |
| **Transportation** | CPUC, DMV, vehicle permits |

---

## The Knowledge Base

### By the Numbers

| Metric | Value |
|--------|-------|
| **Unique Knowledge Chunks** | 425 |
| **Embedding Model** | OpenAI text-embedding-3-small (1536 dim) |
| **Source Types** | CSLB, ABC, BBC, DRE, FTB, SOS |
| **Content Date** | January 2026 |

### Content Coverage

| Category | Documents | Topics |
|----------|-----------|--------|
| **CSLB Contractor** | 4 | License classes, bonds, fees, handyman exemption |
| **ABC Liquor** | 4 | Type 41/47, secondary market, application process |
| **BBC Cosmetology/Barber** | 8 | Hour requirements, establishment licenses, CE |
| **DRE Real Estate** | 4 | Salesperson/broker paths, exam, renewal |

### What Makes This Different

- **Curated from official CA sources** — Not web scraping, actual agency documentation
- **Semantic chunking** — Documents split by meaning, not arbitrary character counts
- **Every URL verified** — 230 URLs tested, 0 broken links

---

## Quality Assurance

### Adversarial Testing

We tested with real questions from business owners—not questions we made up:

- Reddit r/smallbusiness and r/Entrepreneur
- Avvo legal Q&A forums
- SCORE mentor forums
- Secretary of State FAQ pages

| Metric | Result |
|--------|--------|
| Adversarial queries tested | 25 |
| Strong matches (≥0.40 similarity) | 25/25 (100%) |

**Top-performing queries:**
- "Restaurant licensing total costs" → 0.71 similarity
- "Cosmetology CE requirements" → 0.72 similarity
- "Contractor bond requirements" → 0.68 similarity

### Data Quality Checks

| Check | Result |
|-------|--------|
| Duplicate detection | 212 duplicates removed (33% of initial data) |
| URL verification | 230 URLs tested, 0 broken |
| Content deduplication | `COUNT(*) - COUNT(DISTINCT md5(content)) = 0` |

---

## Testing Results

Test scenarios cover diverse business types, locations, and complexity levels:

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

## Version History

BizBot evolved through multiple iterations:

| Version | Description |
|---------|-------------|
| **V1** | Initial agent prompts and knowledge base |
| **V2** | Multi-agent architecture with separate workflows |
| **V3** | Multi-agent form-to-PDF system |
| **BizBot Pro** | Current production RAG chat |
| **License Finder** | Interactive requirements calculator |

### What We Learned

Each version taught us something:

1. **V1 → V2:** Single agents can't handle complex domains. Specialization matters.
2. **V2 → V3:** Agent orchestration needs a dedicated supervisor, not ad-hoc routing.
3. **V3 → Pro:** PDF generation is valuable, but real-time chat serves more users.
4. **Pro + Finder:** Decision trees complement free-form chat for structured queries.

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
├── BizBot_v3/               # Third version (archived)
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

## What Makes BizBot Different

| Typical Chatbot | BizBot |
|-----------------|--------|
| Single AI tries to answer everything | 6 specialized agents collaborate |
| Generic business advice | California-specific, location-aware |
| "I think..." responses | Source-cited answers from official agencies |
| One-size-fits-all | Industry-specific guidance |
| No quality gates | Deduplication, URL verification, adversarial testing |

---

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

*Helping Californians start businesses with confidence*
