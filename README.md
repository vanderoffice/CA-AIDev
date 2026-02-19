# 🤖 CA-AIDev

AI-powered citizen-facing services for California state government.

> **Note:** This is the development and planning repository. Production code runs on VPS at [vanderdev.net](https://vanderdev.net). See [vanderdev-website](https://github.com/vanderoffice/vanderdev-website) for the production SPA.

---

## 💧 WaterBot — Water Regulations Assistant

**Live →** [vanderdev.net/waterbot](https://vanderdev.net/waterbot)

| | Details |
|---|---------|
| **Modes** | Ask WaterBot (RAG chat) · Permit Finder (decision tree) · Funding Navigator |
| **Knowledge** | 1,401 chunks, semantic chunking on H2 boundaries |
| **Coverage** | All 9 Regional Water Boards, permits, funding, compliance, consumer FAQ |
| **Quality** | 194 URLs verified · 88 duplicates removed · 25/25 adversarial queries passed |

## 💼 BizBot — Business Licensing Assistant

**Live →** [vanderdev.net/bizbot](https://vanderdev.net/bizbot)

| | Details |
|---|---------|
| **Modes** | Guided Setup (4-step intake) · Just Chat · License Finder |
| **Knowledge** | 425 chunks across 6 specialized agents |
| **Coverage** | 482 California cities, state + local licensing |
| **Quality** | 230 URLs verified · 29S/6A/0W eval scores (100% coverage) |

## 👶 KiddoBot — Childcare Navigator

**Live →** [vanderdev.net/kiddobot](https://vanderdev.net/kiddobot)

| | Details |
|---|---------|
| **Modes** | Personalized (guided intake) · Programs · Chat · Eligibility Calculator |
| **Knowledge** | 1,402 chunks, all 58 counties |
| **Coverage** | 6+ subsidy programs, county R&R agencies, income thresholds |
| **Quality** | 245 URLs verified · 35/35 webhook tests passed (100%) |

---

## ⚡ How It Works

1. **Multi-Agent Architecture** — specialized agents handle different question types (like a law firm with specialists)
2. **RAG Pipeline** — semantic chunking → OpenAI embeddings → pgvector similarity search → augmented generation
3. **Decision Trees** — structured flows for permits, licenses, and eligibility that don't need AI inference
4. **Adversarial Testing** — real questions from Reddit, forums, and public comments (not self-generated)
5. **Quality Gates** — MD5 deduplication, URL verification, similarity threshold tuning

## 🏭 Additional Projects

### Government Automation Factory

A meta-project for scaffolding new bot or form projects. Includes templates, RAG pipeline scripts, n8n workflow templates, and deploy checklists.

Two tracks:
- **Bot Track** — chat pages deployed as routes in the vanderdev-website SPA
- **Form Track** — standalone Docker containers (like [ECOS](https://github.com/vanderoffice/Automation))

### Shared Resources

Cross-bot shared data including California locations (58 counties, 482 cities) with lookup utilities used by all three bots.

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| Workflow Engine | n8n (webhook-triggered) |
| AI Models | Claude, GPT-4o |
| Vector Database | Supabase pgvector (1536 dimensions) |
| Embeddings | OpenAI text-embedding-3-small |
| Frontend | React + Vite + Tailwind CSS |
| Production | VPS, Docker Compose, nginx |

## 📁 Repository Structure

```
CA-AIDev/
├── bizbot/              # Business licensing (planning + research)
├── kiddobot/            # Childcare navigation (planning + research)
├── waterbot/            # Water regulations (full dev environment)
├── factory/             # Government Automation Factory
│   └── factory/         # Templates, scripts, deploy checklists
├── shared/              # Cross-bot data (CA locations)
├── scripts/             # Content audit + URL validation pipeline
└── docs/                # Shared documentation
```

---

📄 **License:** MIT
