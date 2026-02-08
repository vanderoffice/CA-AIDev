# Government Automation Factory

A factory for California government automation projects — standardized templates, scripts, and workflows that take a new domain from research to deployed on vanderdev.net.

## The Pipeline

Every project follows the same path:

```
research → presentations → knowledge base → build → deploy → final decks
```

1. **Research** — Multi-perspective domain analysis (5 parallel subagents via Perplexity MCP)
2. **Presentations** — Dual decks: stakeholder brief + technical assessment (via /deck)
3. **Knowledge Base** — Convert research into structured knowledge documents
4. **Build** — Scaffold project from templates, ingest knowledge via RAG pipeline
5. **Deploy** — Push to VPS with standardized deploy scripts
6. **Final Decks** — Updated presentations with live demo screenshots and real metrics

## Two Tracks

### Bot Track
Chatbots deployed as pages in the vanderdev-website SPA. RAG-powered with decision trees, tool webhooks, and auto-linked citations.

**Examples:** WaterBot (water rights), BizBot (business regulations), KiddoBot (childcare licensing)

### Form Track
Workflow applications with their own Docker containers. Supabase PostgREST backend with schema-per-project isolation.

**Examples:** ECOS (employee cybersecurity onboarding)

## Directory Layout

```
factory/
├── templates/
│   ├── bot/              # Bot track boilerplate [Phase 5]
│   ├── form/             # Form track boilerplate [Phase 2]
│   ├── knowledge/        # Knowledge document templates [Phase 1, Plan 03]
│   ├── gsd/              # GSD roadmap templates (bot + form tracks) [Phase 2]
│   └── decks/            # Presentation markdown templates [Phase 3]
├── scripts/              # Shared RAG pipeline tooling [Phase 1, Plan 02]
├── n8n-templates/        # Importable workflow JSON [Phase 4]
├── MEMORY-SCHEMA.md      # Memory MCP entity model for project tracking
├── .env.example          # DB credential template
└── README.md             # This file
```

## Quick Start

```bash
# 1. Copy environment template
cp factory/.env.example factory/.env
# Fill in DB_HOST (Tailscale IP), DB_PASSWORD, OPENAI_API_KEY

# 2. Run the full pipeline for a new domain
/gov-factory:new-project "water rights permitting" --track bot

# 3. Check project status
/gov-factory:status
```

The `/gov-factory:new-project` orchestrator runs the entire pipeline: scaffold → research → decks → knowledge → RAG ingest → GSD init → Memory entities. Use `--dry-run` to preview steps, `--skip-to N` to resume from a failed step.

## Scripts

Located in `factory/scripts/`. [Phase 1, Plan 02]

| Script | Purpose | Usage |
|--------|---------|-------|
| `scaffold.sh` | Bootstrap new bot or form project directory | `scripts/scaffold.sh --track bot --name waterbot --title "WaterBot"` |
| `chunk-knowledge.js` | Split knowledge docs into overlapping chunks | `node scripts/chunk-knowledge.js --input docs/ --output chunks/` |
| `embed-chunks.py` | Generate embeddings via OpenAI text-embedding-3-small | `python scripts/embed-chunks.py --schema waterbot --table document_chunks` |
| `validate-knowledge.py` | Verify chunk quality, detect duplicates, check coverage | `python scripts/validate-knowledge.py --schema waterbot` |
| `setup-supabase-schema.sh` | Create Supabase schema + RAG table (bot) or schema-only (form) | `scripts/setup-supabase-schema.sh --schema name --track bot` |
| `deploy-bot.sh` | Build vanderdev-website SPA and rsync to VPS | `scripts/deploy-bot.sh --name waterbot` |
| `deploy-form.sh` | Rsync project + docker-compose up --build on VPS | `scripts/deploy-form.sh --name ecos --path-prefix /ecosform` |

**Embedding standard:** text-embedding-3-small, 1536 dimensions.

## Deploy

See **[DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md)** for the full deploy lifecycle covering both bot and form tracks, including steps the scripts do not automate (n8n workflow import, DNS setup, App.jsx route registration, troubleshooting).

All deploy scripts support `--dry-run` to preview commands without executing and `--help` for usage details.

## Templates

### Knowledge Documents [Phase 1, Plan 03]
YAML frontmatter + markdown body. Each document maps to a domain topic.

### GSD Roadmaps [Phase 2]
Pre-built 9-phase roadmaps for bot and form tracks, ready for `/gsd:new-project`.

### Bot Page [Phase 5]
WaterBot-quality React page template with BotModeSelector, DecisionTreeView, BotChatInterface, and RAGButton components.

### Presentation Decks [Phase 3]
Stakeholder and technical deck templates for the /deck pipeline.

### n8n Workflows [Phase 4]
Parameterized JSON for bot-chat-webhook, bot-rag-orchestrator, and bot-tool-webhook workflows.

## Infrastructure

**Target:** vanderdev.net VPS (25 containers, Docker Compose)

| Component | Details |
|-----------|---------|
| Database | PostgreSQL 15.8.1 with pgvector 0.8.0 |
| API | Supabase PostgREST (one schema per project) |
| Workflows | n8n (20 workflows, webhook-triggered) |
| Frontend | vanderdev-website SPA (bot pages) or standalone Docker containers (forms) |
| Domains | 5 public SSL subdomains via nginx-proxy |
| Monitoring | Prometheus + Grafana + node-exporter |

## Standards

### Schema Naming
Each project gets its own Supabase schema. RAG tables follow the pattern:
```sql
{schema}.document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_title text NOT NULL,
  section_title text,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
)
```

### Embedding Model
- **Model:** text-embedding-3-small
- **Dimensions:** 1536
- **Provider:** OpenAI API

### Knowledge Document Format
```yaml
---
title: "Document Title"
domain: "project-name"
category: "topic-category"
source_url: "https://..."
last_updated: "YYYY-MM-DD"
---

# Section Heading

Content follows standard markdown...
```

---

*Factory v1.0 — All phases complete*
