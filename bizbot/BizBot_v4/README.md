# BizBot v4 - California Business Licensing Assistant

Enhanced n8n multi-agent system for California business licensing guidance.

## Key Changes from v3

| Feature | v3 | v4 |
|---------|----|----|
| Vector DB | Qdrant | **PostgreSQL pgvector** |
| Chat Mode | Form-only | **Interactive chat + Form** |
| Session Mgmt | None | **Context-aware sessions** |
| License Finder | None | **Interactive calculator** |
| Source Citations | None | **Inline citations** |
| Agent Prompts | Generic | **Context-injected** |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        vanderdev.net                            │
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │ Mode Select │ → │ Intake Form │ → │ Chat/Finder │          │
│  │  (React)    │   │  (React)    │   │  (React)    │          │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘          │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     n8n Workflow Layer                          │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ 00_chat_webhook│  │ 01_orchestrator│  │ 07_license_    │   │
│  │   (Chat API)   │  │  (Supervisor)  │  │   finder       │   │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘   │
│           │                   │                   │            │
│           └───────────────────┼───────────────────┘            │
│                               ▼                                │
│           ┌───────────────────────────────────────┐            │
│           │         Specialized Agents            │            │
│           │  02_entity | 03_state | 04_local     │            │
│           │  05_industry | 06_renewal            │            │
│           └───────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PostgreSQL (ServerM2P)                        │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  bizbot_chunks  │  │ bizbot_sessions │  │ license_reqs    │ │
│  │  (pgvector)     │  │  (sessions)     │  │  (matrix)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
BizBot_v4/
├── README.md                          # This file
├── ARCHITECTURE.md                    # Detailed architecture docs
├── database/
│   ├── 00_extensions.sql             # pgvector extension
│   ├── 01_chunks_schema.sql          # Vector DB schema
│   ├── 02_sessions_schema.sql        # Session management
│   ├── 03_license_requirements.sql   # License matrix
│   └── 04_seed_data.sql              # Initial data
├── workflows/
│   ├── 00_chat_webhook.json          # Interactive chat API
│   ├── 01_main_orchestrator.json     # Enhanced supervisor
│   ├── 02_entity_formation_agent.json
│   ├── 03_state_licensing_agent.json
│   ├── 04_local_licensing_agent.json
│   ├── 05_industry_specialist_agent.json
│   ├── 06_renewal_compliance_agent.json
│   └── 07_license_finder_webhook.json # Calculator API
└── scripts/
    ├── populate_vectors.py           # Embed research docs
    ├── populate_license_matrix.py    # Import license data
    └── test_endpoints.sh             # API testing
```

## Database Setup (ServerM2P)

```bash
# 1. Install pgvector extension
sudo apt install postgresql-15-pgvector

# 2. Create database
createdb bizbot

# 3. Run schema migrations
psql -d bizbot -f database/00_extensions.sql
psql -d bizbot -f database/01_chunks_schema.sql
psql -d bizbot -f database/02_sessions_schema.sql
psql -d bizbot -f database/03_license_requirements.sql
psql -d bizbot -f database/04_seed_data.sql
```

## n8n Workflow Setup

1. Import workflows via n8n UI (Settings → Import)
2. Configure credentials:
   - PostgreSQL connection (ServerM2P)
   - OpenAI API key
   - SMTP for email delivery
3. Activate workflows

## API Endpoints

### Chat Webhook
```
POST /webhook/bizbot-chat
Content-Type: application/json

{
  "sessionId": "uuid",
  "message": "What licenses do I need for a restaurant in Oakland?",
  "businessContext": {
    "industry": "food_service",
    "city": "Oakland",
    "county": "Alameda"
  }
}
```

### License Finder
```
POST /webhook/bizbot-license-finder
Content-Type: application/json

{
  "entityType": "llc",
  "industry": "food_service",
  "subIndustry": "restaurant",
  "city": "Oakland",
  "county": "Alameda",
  "hasEmployees": true,
  "sellsTangibleGoods": true,
  "isHomeBased": false
}
```

## Migration from v3

1. Export existing Qdrant vectors (optional - fresh embed recommended)
2. Deploy v4 schemas
3. Populate pgvector from BizAssessment research docs
4. Update frontend to use new webhooks
5. Monitor parallel to v3, then deprecate

---

*Version: 4.0*
*Last Updated: 2025-12-31*
