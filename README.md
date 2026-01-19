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

## The Problem We're Solving

California state government serves nearly 40 million residents across hundreds of services. Navigating these services is overwhelming:

- **Starting a business?** You might need permits from 3-5 different agencies depending on your industry and location.
- **Finding childcare?** There are 6+ subsidy programs with different eligibility rules across 58 counties.
- **Water regulations?** One State Board plus 9 Regional Boards, each with different jurisdictions and requirements.

Traditional solutions—call centers, PDFs, and websites—don't scale. These AI systems do.

---

## The Three Bots

### BizBot - Business Licensing Assistant

<img src="https://img.shields.io/badge/Status-Production-success" alt="Production"/> <img src="https://img.shields.io/badge/Agents-6-blue" alt="6 Agents"/> <img src="https://img.shields.io/badge/Coverage-482_Cities-informational" alt="Coverage"/>

**Live at:** [vanderdev.net/bizbot](https://vanderdev.net/bizbot)

Multi-agent system providing personalized California business licensing guidance. Six specialized AI agents collaborate to cover entity formation, state licensing, local permits, industry requirements, and ongoing compliance.

[View BizBot Documentation →](./bizbot/)

---

### KiddoBot - Childcare Navigator

<img src="https://img.shields.io/badge/Status-Production-success" alt="Production"/> <img src="https://img.shields.io/badge/Programs-5+-blue" alt="Programs"/> <img src="https://img.shields.io/badge/Counties-58-informational" alt="Counties"/>

**Live at:** [vanderdev.net/kiddobot](https://vanderdev.net/kiddobot)

An AI assistant helping California families navigate childcare subsidies, find providers, and complete applications. Covers CalWORKs, CCDF, Regional Center, Head Start, and State Preschool programs across all 58 counties.

[View KiddoBot Documentation →](./kiddobot/)

---

### WaterBot - Water Regulations Assistant

<img src="https://img.shields.io/badge/Status-Production-success" alt="Production"/> <img src="https://img.shields.io/badge/Type-RAG_Chatbot-blue" alt="RAG"/> <img src="https://img.shields.io/badge/Knowledge-1,401_Chunks-informational" alt="Knowledge"/>

AI-powered assistant helping users navigate California's water regulations, permits, and funding programs. Features a RAG-powered chat, interactive Permit Finder decision tree, and Funding Navigator.

[View WaterBot Documentation →](./waterbot/)

---

## How We Built Production AI Systems

Building chatbots is easy. Building chatbots that give **accurate, trustworthy answers** about complex government regulations is hard. Here's how we approached it.

### 1. The Research Phase: Multi-Model Cross-Validation

We didn't just scrape websites. We used multiple AI models to cross-validate information:

```
Research Question
      │
      ▼
┌─────────────┐
│  Perplexity │ ─── Initial research with citations
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Claude    │ ─── Verify facts, identify gaps
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    GPT-4    │ ─── Cross-check discrepancies
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Gemini    │ ─── Final validation
└──────┬──────┘
       │
       ▼
  Verified Content
```

**Why this matters:** Single AI models hallucinate. When four models agree on a fact, and we can trace it to an official source, we have confidence.

### 2. The Architecture: Multi-Agent Systems

Most chatbots are single-agent: one AI tries to answer everything. Our systems use **specialized agents** that collaborate.

**Think of it like a law firm:**
- You don't ask the tax lawyer about real estate closings
- You don't ask the immigration specialist about corporate formation
- Each expert handles their domain, and a senior partner coordinates

**BizBot's agents:**
| Agent | Specialty |
|-------|-----------|
| **Supervisor** | Orchestrates workflow, synthesizes responses |
| **Entity Formation** | Business structures, registration, EIN |
| **State Licensing** | State-level permits and certifications |
| **Local Licensing** | City/county business licenses, zoning |
| **Industry Specialist** | Sector-specific requirements |
| **Renewal & Compliance** | Ongoing obligations, deadlines |

### 3. The Intelligence: RAG (Retrieval-Augmented Generation)

RAG is the difference between a chatbot that makes things up and one that cites sources.

**How traditional chatbots work:**
```
User Question → AI generates answer from training data → Hope it's right
```

**How RAG works:**
```
User Question → Search knowledge base → Find relevant content → AI generates answer WITH context → Cited sources
```

**Our implementation:**
1. **Semantic chunking** — We split documents by meaning (H2 sections), not arbitrary character counts
2. **Vector embeddings** — Each chunk becomes a 1536-dimensional vector that captures its meaning
3. **Similarity search** — User questions are matched to relevant chunks using cosine similarity
4. **Augmented generation** — The AI sees the relevant chunks before answering

**Why semantic chunking matters:**

Most systems split every 500 characters—mid-sentence if needed:

```
❌ Arbitrary chunking:
"...requirements for NPDES permits. The fee schedule is as fol"
"lows: $500 for minor permits, $2,500 for major permits..."

✅ Semantic chunking:
"## Fee Schedule
The fee schedule is as follows: $500 for minor permits,
$2,500 for major permits..."
```

### 4. The Quality: Adversarial Testing

We don't test with questions we made up—that's like writing your own exam.

**Adversarial testing methodology:**
1. Find real questions from Reddit, forums, agency FAQs, and public comment letters
2. Test if our knowledge base can answer them
3. Identify gaps where we have no relevant content
4. Fill gaps with verified information
5. Retest

**Results across all three bots:**

| Bot | Adversarial Queries | Coverage |
|-----|---------------------|----------|
| BizBot | 25 | 100% |
| KiddoBot | 25 | 100% |
| WaterBot | 25 | 100% |

### 5. The Validation: Data Quality Gates

Before any knowledge base goes to production:

| Check | What It Catches |
|-------|-----------------|
| **MD5 Deduplication** | Duplicate content that wastes tokens and confuses retrieval |
| **URL Verification** | Broken links that erode user trust |
| **Similarity Threshold Tuning** | Too-loose thresholds return irrelevant results; too-tight misses relevant content |
| **Content Audit** | Outdated information, missing topics, structural issues |

**Our numbers:**
- 669+ URLs verified across all bots
- 380 duplicate chunks removed
- 0 broken links in production

---

## Architecture Overview

All production systems follow a consistent multi-agent pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER REQUEST                              │
│                    (Form / Chat / Webhook)                       │
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
│              (Chat Response / PDF / Email)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Workflow Engine** | n8n | Visual workflow automation, agent orchestration |
| **AI Models** | Claude Sonnet, GPT-4o | Multi-LLM support for task-specific routing |
| **Vector Database** | Supabase pgvector | Knowledge base semantic search (RAG) |
| **Embeddings** | OpenAI text-embedding-3-small | 1536-dimensional vectors for similarity search |
| **Frontend** | React + Vite + Tailwind CSS | Chat interfaces |
| **Output** | PDF generation, SMTP email | Citizen delivery |

---

## Repository Structure

```
CA-AIDev/
├── README.md              # This file
├── bizbot/                # Business licensing multi-agent system
│   ├── README.md          # Architecture, agents, QA process
│   ├── BizBot_V1/         # Archived versions
│   ├── BizBot_v2/
│   ├── BizBot_v3/
│   └── BizAssessment/     # Testing and validation
├── kiddobot/              # Childcare navigation chatbot
│   ├── README.md          # Programs, coverage, QA process
│   └── ChildCareAssessment/
└── waterbot/              # Water Boards RAG chatbot
    ├── README.md          # RAG pipeline, decision trees, QA
    ├── src/               # React frontend
    ├── knowledge/         # RAG knowledge base (markdown)
    └── scripts/           # Chunking and embedding pipeline
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>AI-Powered Government Services for California</b><br/>
  <i>Making government work better for everyone</i>
</p>
