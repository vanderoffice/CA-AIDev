# WaterBot

**California Water Boards RAG Chatbot**

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Knowledge-1,401_Chunks-informational" alt="Knowledge"/>
  <img src="https://img.shields.io/badge/Status-Production-success" alt="Status"/>
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License"/>
</p>

---

## The Complexity Problem

California's water regulatory landscape is notoriously complex:

- **1 State Water Resources Control Board** sets statewide policy
- **9 Regional Water Quality Control Boards** implement regulations in their jurisdictions
- **Hundreds of permit types** depending on what you discharge, where, and how much
- **Multiple funding programs** with different eligibility requirements

A small business owner trying to figure out if they need a permit faces a maze of acronyms: NPDES, WDR, TMDL, 401 Certification. WaterBot cuts through this complexity with AI that understands the context.

---

## What WaterBot Does

WaterBot is an AI-powered assistant that helps users navigate California's water regulations, permits, and funding programs. It provides accurate, source-cited answers about water quality compliance, NPDES permits, and infrastructure funding opportunities.

**Live features:**

| Feature | Description |
|---------|-------------|
| **Ask WaterBot** | RAG-powered chat with source citations |
| **Permit Finder** | Interactive decision tree tool for permit requirements |
| **Funding Navigator** | Eligibility checker for water infrastructure grants |

---

## Who WaterBot Serves

| User Type | Example Questions |
|-----------|-------------------|
| **Residents** | "Is my tap water safe?" "What does my CCR report mean?" |
| **Businesses** | "Do I need an NPDES permit?" "What are the discharge requirements?" |
| **Operators** | "Am I eligible for SAFER funding?" "How does consolidation work?" |

---

## The Permit Finder: Decision Trees Instead of Search

Most chatbots just search for keywords. The Permit Finder uses **decision trees**—structured paths that mirror how a regulatory expert thinks.

**Example: Construction Site Permits**

```
Q: Are you doing construction or land disturbance?
   │
   ├─► Yes
   │     │
   │     Q: How many acres will be disturbed?
   │           │
   │           ├─► Less than 1 acre → General guidance, may not need permit
   │           │
   │           └─► 1+ acres → Construction General Permit required
   │                 │
   │                 Q: Will you discharge stormwater?
   │                       │
   │                       ├─► Yes → NPDES permit + SWPPP required
   │                       │
   │                       └─► No → Still need erosion control plan
   │
   └─► No → Check other permit categories
```

**Why this matters:** A keyword search for "construction permit" returns hundreds of results. A decision tree gets you to the right answer in 3-4 questions.

---

## The RAG Architecture (Explained)

RAG (Retrieval-Augmented Generation) is the core technology that makes WaterBot accurate. Here's how it works:

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                    React + Vite + Tailwind CSS                  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ User asks: "Do I need a permit
                                  │  for my car wash discharge?"
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Step 1: EMBED THE QUERY                    │
│                                                                 │
│  "Do I need a permit for my car wash discharge?"                │
│                           ↓                                     │
│  [0.023, -0.156, 0.089, ... 1536 dimensions]                    │
│                                                                 │
│  The question becomes a vector that captures its meaning        │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Step 2: SEARCH KNOWLEDGE BASE                │
│                                                                 │
│  pgvector finds the 8 most similar chunks:                      │
│                                                                 │
│  1. "Car wash discharge requirements" (0.82 similarity)         │
│  2. "Industrial general permit categories" (0.76 similarity)    │
│  3. "Discharge to sanitary sewer vs storm drain" (0.71)         │
│  ...                                                            │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Step 3: AUGMENT THE PROMPT                   │
│                                                                 │
│  System: "Answer using ONLY this context:"                      │
│  [Retrieved chunks inserted here]                               │
│                                                                 │
│  User: "Do I need a permit for my car wash discharge?"          │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Step 4: GENERATE RESPONSE                    │
│                                                                 │
│  Claude generates an answer GROUNDED in the retrieved context:  │
│                                                                 │
│  "Car wash discharges typically require coverage under the      │
│   Industrial General Permit if discharged to storm drains.      │
│   If your discharge goes to sanitary sewer, contact your        │
│   local sewer authority instead..."                             │
│                                                                 │
│  Sources: [Links to original documents]                         │
└─────────────────────────────────────────────────────────────────┘
```

### Why RAG Matters

| Without RAG | With RAG |
|-------------|----------|
| AI guesses from training data | AI searches curated knowledge first |
| Can't cite sources | Every answer links to official sources |
| Knowledge frozen at training date | Knowledge base updates without retraining |
| Hallucinations common | Hallucinations rare (grounded in context) |

---

## Semantic Chunking: The Secret Sauce

Most RAG systems split documents every 500-1000 characters. This creates problems:

```
❌ ARBITRARY CHUNKING (what most systems do):

Chunk 47: "...discharge requirements for car washes. The permit fee"
Chunk 48: "schedule is as follows: $500 for minor facilities, $2,500"
Chunk 49: "for major facilities. Monitoring requirements include..."

Problems:
- Information split mid-sentence
- Related content scattered across chunks
- Retrieval returns partial information
```

WaterBot uses **semantic chunking**—splitting on meaning, not character counts:

```
✅ SEMANTIC CHUNKING (what WaterBot does):

Split on H2 headers. Each ## Section becomes a chunk.

Chunk: "## Fee Schedule
The permit fee schedule is as follows:
- $500 for minor facilities
- $2,500 for major facilities

Fees are non-refundable and due at application submission."

Benefits:
- Complete thoughts stay together
- H3 subsections stay with their parent H2
- Each chunk is prefixed with document title for context
```

### Chunking Configuration

| Parameter | Value | Why |
|-----------|-------|-----|
| Split boundary | H2 headers (`##`) | Sections are natural semantic units |
| Max chunk size | 2,000 characters | Fits in context window, captures full sections |
| Min chunk size | 100 characters | Filters out empty/trivial sections |
| Large chunk handling | Split on `\n\n` | Preserves paragraph boundaries |
| Context prefix | Document title (H1) | Chunk knows what document it came from |

---

## The Knowledge Base

### By the Numbers

| Metric | Value |
|--------|-------|
| **Unique Knowledge Chunks** | 1,401 |
| **Embedding Model** | OpenAI text-embedding-3-small (1536 dim) |
| **Similarity Threshold** | 0.30 minimum |
| **Top-K Retrieved** | 8 chunks per query |
| **Content Date** | January 2026 |

### Content Coverage

| Category | Documents | Topics |
|----------|-----------|--------|
| **Pollutants** | 10 | PFAS, lead, arsenic, nitrate, chromium-6, DBPs |
| **Regional Boards** | 10 | All 9 Regional Water Boards + responsibilities |
| **Permits & Compliance** | 10 | MS4, WDRs, 401 cert, monitoring, enforcement |
| **Programs** | 10 | Recycled water, conservation, drought, TMDLs |
| **Small Systems** | 10 | Consolidation, private wells, state small systems |
| **Consumer FAQ** | 25 | Tap safety, CCRs, hard water, chlorine, testing |
| **Public Resources** | 10 | Complaints, bills, shutoff protections |

---

## Quality Assurance

### Adversarial Testing

We didn't test with questions we made up. We tested with real questions from:
- Water Board public comment letters
- Reddit and Nextdoor discussions
- Water system operator forums
- Agency FAQ pages

| Metric | Result |
|--------|--------|
| Adversarial queries tested | 25 |
| Strong matches (≥0.40 similarity) | 25/25 (100%) |

**Top-performing queries:**
- "Recycled water regulations California" → 0.79 similarity
- "TMDL pollution limits explained" → 0.76 similarity
- "SAFER funding eligibility" → 0.72 similarity

### Gap Discovery & Remediation

Initial testing revealed a structural gap—content was regulatory-focused but missing consumer FAQ topics:

| Gap Category | Issue | Fix |
|--------------|-------|-----|
| Hard water, chlorine smell | Zero content | Added consumer FAQ documents |
| How to read CCR reports | Technical only | Added consumer-friendly explainers |
| Boiling water misconceptions | Not covered | Added safety guidance |

**Before remediation:** 64% coverage
**After remediation:** 100% coverage

### Data Quality Checks

| Check | Result |
|-------|--------|
| Duplicate detection | 88 duplicates removed (6% of initial data) |
| URL verification | 194 URLs tested, 0 broken |
| Content deduplication | `COUNT(*) - COUNT(DISTINCT md5(content)) = 0` |

---

## Project Structure

```
waterbot/
├── knowledge/                    # RAG knowledge base (markdown)
│   ├── 03-permits/              # Permit documentation
│   │   ├── npdes/               # National Pollutant Discharge
│   │   ├── wdr/                 # Waste Discharge Requirements
│   │   ├── 401-certification/   # Federal water quality cert
│   │   ├── water-rights/        # Appropriative & riparian
│   │   └── habitat-restoration/ # SHRO, SRGO permits
│   ├── 04-funding/              # Funding programs
│   │   ├── srf/                 # State Revolving Funds
│   │   ├── federal/             # WIFIA, EPA grants
│   │   ├── grants/              # State grant programs
│   │   └── private/             # Private funding sources
│   ├── 05-compliance/           # Enforcement & violations
│   ├── 06-water-quality/        # Water quality standards
│   ├── 07-entities/             # Regional boards info
│   ├── 08-water-rights/         # Water rights system
│   ├── 09-climate-drought/      # Climate adaptation
│   └── 10-public-resources/     # Public tools & databases
│
├── scripts/                      # RAG pipeline scripts
│   ├── chunk-knowledge.js       # Markdown → chunks processor
│   ├── embed-chunks.py          # Chunk → vector embeddings
│   └── chunks.json              # Generated chunk data
│
├── src/
│   ├── components/              # Reusable UI components
│   ├── pages/
│   │   └── WaterBot.jsx         # Main chat interface
│   ├── App.jsx                  # Root component
│   └── main.jsx                 # Entry point
│
└── index.html                    # HTML entry point
```

---

## What Makes WaterBot Different

| Typical Chatbot | WaterBot |
|-----------------|----------|
| Searches the internet | Searches curated, verified knowledge base |
| Generic water facts | California-specific regulations |
| "I think..." responses | Source-cited answers |
| One-size-fits-all | Three user types (resident, business, operator) |
| Keyword search | Semantic similarity + decision trees |
| No quality gates | MD5 deduplication, URL verification, adversarial testing |

---

## Disclaimer

> **WaterBot provides general information about California Water Boards regulations, permits, and funding programs. This information is for educational purposes only and does not constitute official guidance or legal advice.**
>
> Permit requirements vary by project and location. Always confirm requirements with the appropriate Regional Water Quality Control Board or the State Water Resources Control Board before proceeding with any project.
>
> **For official information:**
> - State Water Board: (916) 341-5250
> - Find your Regional Board: [waterboards.ca.gov/waterboards_map.html](https://www.waterboards.ca.gov/waterboards_map.html)

---

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
