# KiddoBot - California Childcare Navigator

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production-success" alt="Production"/>
  <img src="https://img.shields.io/badge/Programs-5+-blue" alt="Programs Covered"/>
  <img src="https://img.shields.io/badge/Counties-58-informational" alt="All CA Counties"/>
  <img src="https://img.shields.io/badge/Interface-Chat-orange" alt="Chat Interface"/>
</p>

**An AI assistant helping California families navigate childcare subsidies, find providers, and complete applications.**

**Live at:** [vanderdev.net/kiddobot](https://vanderdev.net/kiddobot)

---

## Overview

Finding affordable childcare in California is overwhelming. Parents must navigate:

- **Multiple subsidy programs** (CalWORKs, CCDF, Regional Center, Head Start, State Preschool)
- **58 county R&R agencies** with different processes
- **Income eligibility thresholds** that vary by family size
- **Special situations** (foster care, special needs, shift workers, rural areas)

KiddoBot provides personalized guidance through conversational AI, helping families understand their options and take action.

---

## Interfaces

| Mode | Description |
|------|-------------|
| **Guided Setup** | 4-step intake form collecting family context |
| **Just Chat** | Direct conversation without intake |
| **Subsidy Calculator** | Interactive eligibility checker |

The chat interface supports full conversation history, family context injection, and markdown rendering with clickable links.

---

## Programs Covered

| Program | Eligibility | Ages |
|---------|-------------|------|
| **CalWORKs Childcare** | CalWORKs recipients, working/in training | 0-12 |
| **CCDF** | Income ≤85% SMI, working/in training | 0-12 |
| **Regional Center** | Children with developmental disabilities | 0-3 (Early Start) |
| **Head Start** | Income at/below poverty line | 3-5 |
| **State Preschool (CSPP)** | Income-based eligibility | 3-4 |
| **Transitional Kindergarten** | All children (age cutoff varies) | 4-5 |

---

## Testing

Test scenarios cover diverse family situations across California.

| Test | Scenario | Score |
|------|----------|-------|
| K1 | Multi-program eligibility (single mom, autism) | 9/10 |
| K2 | Foster/kinship care priority | 9/10 |
| K3 | Income cliff anxiety | 9/10 |
| K4 | Rural county (Modoc) | 8/10 |
| K5 | Immigrant family concerns | 9/10 |

**Average:** 8.8/10

See [ChildCareAssessment/test-results-2025-12-31.md](ChildCareAssessment/test-results-2025-12-31.md) for detailed analysis.

---

## Knowledge Base Quality Assurance

KiddoBot's RAG knowledge base underwent rigorous validation to ensure accurate, trustworthy guidance for California families.

### Knowledge Base Stats

| Metric | Value |
|--------|-------|
| **Unique Knowledge Chunks** | 1,402 |
| **Embedding Model** | OpenAI text-embedding-3-small (1536 dim) |
| **Database Schema** | Normalized (category, subcategory, file_name) |
| **Content Date** | January 2026 |

### Content Coverage

| Category | Documents | Topics |
|----------|-----------|--------|
| **CalWORKs Stages** | 6 | Stage 1/2/3 eligibility, transitions, applications |
| **County Deep-Dives** | 20 | LA, SD, SF, Sacramento, + 16 more counties |
| **Age-Specific Care** | 8 | Infant, toddler, preschool, school-age, teen |
| **Provider Info** | 10 | Centers, family childcare, nanny, co-ops |
| **Application Processes** | 10 | Wait lists, income verification, appeals |
| **Quality & Health** | 10 | QRIS, licensing, CACFP, emergency care |
| **Special Situations** | 12 | Foster care, special needs, summer, siblings |

### Validation Methodology

**Adversarial Testing:** We tested against real parent questions (Reddit, Facebook groups, R&R agency FAQs)—not questions derived from our own content.

| Metric | Result |
|--------|--------|
| Adversarial queries tested | 25 |
| Strong matches (≥0.40 similarity) | 25/25 (100%) |
| Acceptable coverage | 100% |

**Top-performing queries:**
- "CalWORKs Stage 1/2/3 differences" → 0.76 similarity
- "Special needs children (IEP priority)" → 0.67 similarity
- "Foster parent programs" → 0.66 similarity

### Gap Discovery & Remediation

Initial testing revealed one gap:

| Query | Issue | Fix |
|-------|-------|-----|
| "Family fees vs co-payments?" | Not covered | Added `family_fees_vs_copayments.json` |

**After remediation:** 100% coverage on adversarial test set.

### Data Quality Checks

| Check | Result |
|-------|--------|
| Duplicate detection | 80 duplicates removed (5% of initial data) |
| URL verification | 245 URLs tested, 0 broken |
| Content deduplication | `COUNT(*) - COUNT(DISTINCT md5(content)) = 0` |
| URL path corruption | Fixed `carefacilitysearch//` double-slash issues |

### Why This Matters

> Finding affordable childcare in California shouldn't require a social work degree. KiddoBot provides verified, county-specific guidance—not generic internet advice.

**What makes KiddoBot different:**
- ✅ Curated from official CA sources (CDSS, CDE, R&R Network)
- ✅ Adversarial testing against real parent questions
- ✅ County-specific information (all 58 counties)
- ✅ URL verification (every link tested)
- ✅ Deduplication for data quality
- ✅ Personalization via intake forms

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│  n8n Webhook    │
│  (vanderdev.net)│     │  /kiddobot      │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │    OpenAI GPT-4        │
                    │  + Conversation History│
                    │  + Family Context      │
                    └────────────────────────┘
```

**n8n Workflow ID:** `nNMQGXPM8tlqYSgr`
**Webhook:** `https://n8n.vanderdev.net/webhook/kiddobot`

---

## Folder Structure

```
kiddobot/
├── README.md                    # This file
└── ChildCareAssessment/         # Research repository
    ├── README.md                # Research methodology & progress
    ├── research-protocol/       # Multi-model validation process
    ├── 01_Subsidies/            # CalWORKs, CCDF, Regional Center, etc.
    ├── 02_Provider_Search/      # Provider types & discovery
    ├── 03_Costs_and_Affordability/
    ├── 04_Application_Processes/
    ├── 05_Special_Situations/   # Foster care, shift work, special needs
    ├── 06_State_Agencies/       # CDSS, CDE, CDPH coordination
    ├── 07_County_Deep_Dives/    # LA, SF Bay, San Diego, Sacramento
    ├── 08_URL_Database/         # 150+ validated URLs
    ├── 09_User_Journeys/        # Persona-based pathways
    ├── 10_Alternative_Education/
    ├── test-results-*.md        # Chat interface test results
    └── Data/                    # Structured datasets
```

---

## Key Resources

| Resource | Description |
|----------|-------------|
| [MyChildCare.ca.gov](https://mychildcare.ca.gov) | Official CA childcare provider search |
| [CDSS Childcare](https://cdss.ca.gov/inforesources/child-care-licensing) | State licensing information |
| [CDE Early Education](https://www.cde.ca.gov/sp/cd/) | State preschool & Head Start |
| [Regional Center Directory](https://www.dds.ca.gov/rc/) | 21 regional centers for special needs |

---

## Related

- [BizBot](../bizbot/) - California business licensing assistant
- [WaterBot](../waterbot/) - California Water Boards RAG chatbot
- [Research Methodology](ChildCareAssessment/research-protocol/README.md) - Multi-model validation process

---

*Helping California families find affordable childcare*
