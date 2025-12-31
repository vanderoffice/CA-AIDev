# BizBot v4 Architecture Documentation

## System Overview

BizBot v4 is a multi-agent AI system for California business licensing guidance. It replaces the v3 Qdrant-based system with PostgreSQL pgvector and adds interactive chat mode.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (vanderdev.net)                         │
│                                                                             │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐          │
│  │  Mode Selection │   │  Intake Form    │   │  Chat Interface │          │
│  │   (3 options)   │   │  (4 steps)      │   │  (context-aware)│          │
│  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘          │
│           │                     │                     │                    │
│           └─────────────────────┼─────────────────────┘                    │
│                                 │                                          │
│  ┌─────────────────┐           │           ┌─────────────────┐            │
│  │ License Finder  │───────────┼───────────│  Session State  │            │
│  │  (calculator)   │           │           │  (React state)  │            │
│  └────────┬────────┘           │           └─────────────────┘            │
└───────────┼────────────────────┼──────────────────────────────────────────┘
            │                    │
            ▼                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           n8n WORKFLOW LAYER                              │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                      00_chat_webhook.json                          │  │
│  │  Webhook → Validate → Get Session → Update Profile →              │  │
│  │  Get History → Prepare Context → Call Orchestrator → Save →       │  │
│  │  Respond                                                           │  │
│  └──────────────────────────────┬─────────────────────────────────────┘  │
│                                 │                                         │
│  ┌──────────────────────────────▼─────────────────────────────────────┐  │
│  │                    01_main_orchestrator.json                        │  │
│  │                                                                     │  │
│  │  Input → Embed Query → Vector Search (pgvector) → Build Context → │  │
│  │  Supervisor Agent ← [LLM + Sub-Agent Tools] → Format Output        │  │
│  │                                                                     │  │
│  │  Sub-Agents:                                                        │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                  │  │
│  │  │ 02_entity   │ │ 03_state    │ │ 04_local    │                  │  │
│  │  │ formation   │ │ licensing   │ │ licensing   │                  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                  │  │
│  │  ┌─────────────┐ ┌─────────────┐                                  │  │
│  │  │ 05_industry │ │ 06_renewal  │                                  │  │
│  │  │ specialist  │ │ compliance  │                                  │  │
│  │  └─────────────┘ └─────────────┘                                  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                    07_license_finder_webhook.json                   │  │
│  │  Webhook → Validate → Query License Matrix → Enrich → Respond      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────┬─────────────────────────────────┘
                                          │
                                          ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        POSTGRESQL (ServerM2P)                             │
│                                                                           │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐        │
│  │      bizbot_chunks          │  │     bizbot_sessions         │        │
│  │  (pgvector embeddings)      │  │  (user session & profile)   │        │
│  │                             │  │                             │        │
│  │  - content TEXT             │  │  - session_id VARCHAR       │        │
│  │  - embedding vector(1536)   │  │  - business_profile JSONB   │        │
│  │  - source_file VARCHAR      │  │  - licenses_discussed TEXT[]│        │
│  │  - topic VARCHAR            │  │  - created_at TIMESTAMP     │        │
│  │  - industries TEXT[]        │  │  - message_count INTEGER    │        │
│  │  - agencies TEXT[]          │  └─────────────────────────────┘        │
│  │  - cities TEXT[]            │                                         │
│  └─────────────────────────────┘  ┌─────────────────────────────┐        │
│                                    │   bizbot_session_messages   │        │
│  ┌─────────────────────────────┐  │  (conversation history)     │        │
│  │   license_requirements      │  │                             │        │
│  │  (license matrix)           │  │  - session_id VARCHAR       │        │
│  │                             │  │  - role VARCHAR             │        │
│  │  - license_name VARCHAR     │  │  - content TEXT             │        │
│  │  - agency_code VARCHAR      │  │  - agent_used VARCHAR       │        │
│  │  - industry_code VARCHAR    │  │  - retrieval_sources JSONB  │        │
│  │  - sequence_order INTEGER   │  └─────────────────────────────┘        │
│  │  - fee_min/max DECIMAL      │                                         │
│  │  - timeline_min/max INTEGER │  ┌─────────────────────────────┐        │
│  └─────────────────────────────┘  │   license_industries        │        │
│                                    │   license_agencies          │        │
│                                    │  (reference tables)         │        │
│                                    └─────────────────────────────┘        │
└───────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Chat Mode Flow

```
1. User sends message
   └─> POST /webhook/bizbot-chat
       {
         "sessionId": "uuid",
         "message": "What licenses do I need for a restaurant?",
         "businessContext": { "city": "Oakland", "industry": "food" }
       }

2. Chat Webhook (00_chat_webhook.json)
   ├─> Validate request
   ├─> Get or create session (bizbot_sessions)
   ├─> Update business profile
   ├─> Fetch last 10 messages (bizbot_session_messages)
   └─> Call Orchestrator with full context

3. Main Orchestrator (01_main_orchestrator.json)
   ├─> Embed user query (OpenAI ada-002)
   ├─> Vector search (pgvector) - filtered by topic
   ├─> Build context:
   │   ├─> Business profile (from session)
   │   ├─> Message history (last 5)
   │   └─> Retrieved chunks (top 5)
   ├─> Supervisor Agent processes with context
   │   └─> May delegate to sub-agents via tools
   └─> Format response with sources

4. Chat Webhook continues
   ├─> Save user message to history
   ├─> Save assistant response to history
   └─> Return JSON response
       {
         "success": true,
         "response": "For a restaurant in Oakland...",
         "sources": [...],
         "agentUsed": "industry"
       }
```

### License Finder Flow

```
1. User submits business profile
   └─> POST /webhook/bizbot-license-finder
       {
         "industry": "food_restaurant",
         "city": "Oakland",
         "county": "Alameda",
         "hasEmployees": true,
         "sellsTangibleGoods": true
       }

2. License Finder Webhook (07_license_finder_webhook.json)
   ├─> Validate profile
   ├─> Query license_requirements table
   │   └─> JOIN with license_agencies
   │   └─> Filter by industry + location
   ├─> Add computed licenses:
   │   ├─> Entity formation (if new)
   │   ├─> EIN (if employees or non-sole-prop)
   │   ├─> Seller's permit (if sells goods)
   │   └─> EDD registration (if employees)
   ├─> Sort by sequence_order
   ├─> Group by phase
   └─> Return structured result
       {
         "success": true,
         "summary": { "totalLicenses": 8, ... },
         "licenses": [...],
         "grouped": { "formation": [...], "state": [...], ... }
       }
```

## Vector Database Design

### pgvector vs Qdrant

| Metric | pgvector | Qdrant |
|--------|----------|--------|
| QPS (99% recall) | 471 | 41 |
| Operational overhead | None (Postgres ext) | Separate service |
| n8n integration | Native Postgres node | HTTP/REST |
| Hybrid filtering | SQL + vector | Custom filter syntax |
| Cost | Free | $25+/mo managed |

### Chunking Strategy

```
Document → Sections → Paragraphs

Level: document   │ Full guide summary (1 per file)
      ↓           │
Level: section    │ H2 sections (~500 tokens each)
      ↓           │
Level: paragraph  │ Individual paragraphs (~100-300 tokens)
```

### HNSW Index Configuration

```sql
CREATE INDEX ON bizbot_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

- **m = 16**: Connections per node (higher = better recall, more memory)
- **ef_construction = 64**: Build-time search depth (higher = better index)
- **vector_cosine_ops**: Cosine similarity (normalized embeddings)

## Agent Architecture

### Supervisor Agent

**Role**: Coordinate sub-agents, synthesize responses

**System Prompt**:
```
You are BizBot, a knowledgeable California business licensing assistant.
You help entrepreneurs understand what licenses, permits, and registrations
they need to start and operate a business in California.
```

**Tools Available**:
1. Entity Formation Agent
2. State Licensing Agent
3. Local Licensing Agent
4. Industry Specialist Agent
5. Renewal & Compliance Agent

### Sub-Agent Specializations

| Agent | Focus | Key Knowledge |
|-------|-------|---------------|
| Entity Formation | Phase 1 | SOS, DBA, EIN, entity types |
| State Licensing | Phase 2 | FTB, EDD, CDTFA, state permits |
| Local Licensing | Phase 3 | City/county licenses, zoning |
| Industry Specialist | Varies | Industry-specific (food, cannabis, etc.) |
| Renewal & Compliance | Phase 4 | Renewals, tax calendars, penalties |

## Session Management

### Session Lifecycle

```
1. First message → Create session
   └─> Generate session_id (frontend or random UUID)
   └─> Store in bizbot_sessions

2. Subsequent messages → Update session
   └─> Append to message_history
   └─> Merge business profile updates
   └─> Track licenses discussed

3. Session expiry → Cleanup (90 days inactive)
   └─> cleanup_old_sessions() function
```

### Business Profile Schema

```json
{
  "businessName": "Oakland Eats",
  "entityType": "llc",
  "industry": "food_restaurant",
  "subIndustry": "full_service",
  "city": "Oakland",
  "county": "Alameda",
  "isNew": true,
  "isHomeBased": false,
  "hasEmployees": true,
  "sellsTangibleGoods": true,
  "specialSituations": ["veteran_owned"]
}
```

## Security Considerations

### API Security

- CORS restricted to `vanderdev.net` and localhost
- Session IDs client-generated (stateless server)
- IP hashed for analytics (privacy)
- No PII in logs

### Data Privacy

- Message history retained 90 days
- Business profiles are session-scoped
- No persistent user accounts
- GDPR/CCPA: can delete session on request

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Chat response time | < 5 seconds | Including embedding + retrieval |
| License finder response | < 500ms | Database query only |
| Vector search latency | < 100ms | HNSW index |
| Concurrent sessions | 100+ | n8n queue handles backpressure |

## Deployment

### Prerequisites

1. PostgreSQL 15+ with pgvector extension
2. n8n instance with:
   - OpenAI credentials
   - PostgreSQL credentials
3. Populated bizbot_chunks table
4. Seeded license_requirements data

### Migration from v3

1. Export Qdrant vectors (optional)
2. Deploy pgvector schema
3. Run `populate_vectors.py`
4. Seed `license_requirements` table
5. Import n8n workflows
6. Update frontend API endpoints
7. Test in parallel with v3
8. Switch DNS / disable v3

---

*Version: 4.0*
*Last Updated: 2025-12-31*
