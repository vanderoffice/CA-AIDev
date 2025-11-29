# n8n Multi-Agent Architecture Documentation

## System Architecture Overview

### 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                                                                   │
│  ┌─────────────────┐                                            │
│  │  Tally Form     │  Business details, location, industry      │
│  │  (Web Form)     │                                             │
│  └────────┬────────┘                                             │
└───────────┼──────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA COLLECTION                            │
│                                                                   │
│  ┌─────────────────┐                                            │
│  │ Google Sheets   │  Form responses stored in spreadsheet       │
│  │                 │  Acts as data pipeline and trigger          │
│  └────────┬────────┘                                             │
└───────────┼──────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    n8n AUTOMATION LAYER                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           MAIN WORKFLOW (Orchestrator)                   │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌────────────┐  ┌─────────────────┐     │   │
│  │  │ Trigger  │→ │ Validate   │→ │ Supervisor      │     │   │
│  │  │          │  │ Input      │  │ Agent (AI)      │     │   │
│  │  └──────────┘  └────────────┘  └────────┬────────┘     │   │
│  │                                          │               │   │
│  │                    ┌────────────────────┼─────────────┐ │   │
│  │                    │    Delegates to    │             │ │   │
│  │                    ▼                    ▼             ▼ │   │
│  │         ┌──────────────┐    ┌────────────────┐    ┌────────┐
│  │         │ Entity       │    │ State          │    │ Local  │
│  │         │ Formation    │    │ Licensing      │    │ License│
│  │         │ Agent        │    │ Agent          │    │ Agent  │
│  │         └──────────────┘    └────────────────┘    └────────┘
│  │                    ▼                    ▼             ▼    │   │
│  │         ┌──────────────┐    ┌────────────────┐           │   │
│  │         │ Industry     │    │ Renewal &      │           │   │
│  │         │ Specialist   │    │ Compliance     │           │   │
│  │         │ Agent        │    │ Agent          │           │   │
│  │         └──────────────┘    └────────────────┘           │   │
│  │                    │                                       │   │
│  │                    └─────────┬──────────┐                │   │
│  │                              ▼          │                │   │
│  │                    ┌──────────────┐    │                │   │
│  │                    │ Compile      │    │                │   │
│  │                    │ Response     │    │                │   │
│  │                    └──────┬───────┘    │                │   │
│  │                           ▼             │                │   │
│  │                    ┌──────────────┐    │                │   │
│  │                    │ Generate     │    │                │   │
│  │                    │ PDF          │    │                │   │
│  │                    └──────┬───────┘    │                │   │
│  └─────────────────────────┼──────────────┘                │   │
│                             ▼                                   │
└───────────────────────────┼─────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│   EMAIL DELIVERY    │         │   DATABASE LOGGING  │
│                     │         │                     │
│  User receives PDF  │         │  Track requests     │
│  guide via email    │         │  for analytics      │
└─────────────────────┘         └─────────────────────┘
```

### 2. Agent Hierarchy

```
                    ┌────────────────────┐
                    │  Supervisor Agent  │
                    │  (Orchestrator)    │
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌────────────────┐    ┌───────────────┐
│   Phase 1     │    │    Phase 2     │    │   Phase 3     │
│   Entity      │    │    State       │    │   Local       │
│   Formation   │    │    Licensing   │    │   Licensing   │
│   Agent       │    │    Agent       │    │   Agent       │
└───────────────┘    └────────────────┘    └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────┐                          ┌───────────────┐
│  Industry     │                          │   Phase 4     │
│  Specialist   │                          │   Renewal &   │
│  Agent        │                          │   Compliance  │
└───────────────┘                          └───────────────┘
```

### 3. Data Flow Diagram

```
┌──────────────┐
│ User submits │
│ Tally form   │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Form data →      │
│ Google Sheets    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ n8n detects      │
│ new row          │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Extract & validate│
│ form data        │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Supervisor Agent analyzes:       │
│ • Business type                  │
│ • Location (city, county)        │
│ • Industry                       │
│ • Request type                   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Delegate to specialized agents:  │
│ ┌────────────────────────────┐  │
│ │ 1. Entity Formation        │  │
│ │    (if new business)       │  │
│ └────────────────────────────┘  │
│ ┌────────────────────────────┐  │
│ │ 2. State Licensing         │  │
│ │    • Statement of Info     │  │
│ │    • CDTFA permit?         │  │
│ │    • SB 205?               │  │
│ └────────────────────────────┘  │
│ ┌────────────────────────────┐  │
│ │ 3. Local Licensing         │  │
│ │    • Zoning clearance      │  │
│ │    • City license          │  │
│ │    • County license?       │  │
│ └────────────────────────────┘  │
│ ┌────────────────────────────┐  │
│ │ 4. Industry Specialist     │  │
│ │    (if special industry)   │  │
│ └────────────────────────────┘  │
│ ┌────────────────────────────┐  │
│ │ 5. Renewal & Compliance    │  │
│ │    • Annual renewals       │  │
│ │    • Tax compliance        │  │
│ └────────────────────────────┘  │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Each agent queries:              │
│ • Vector database (knowledge)    │
│ • CalGold API (live data)        │
│ • Returns structured guidance    │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Supervisor compiles responses    │
│ into comprehensive guide:        │
│ • Phase 1: Entity Formation      │
│ • Phase 2: State Licensing       │
│ • Phase 3: Local Licensing       │
│ • Industry Requirements          │
│ • Phase 4: Compliance            │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Format as markdown document      │
│ with:                            │
│ • Step-by-step instructions      │
│ • Timelines and costs            │
│ • Direct links and contacts      │
│ • Strategic advice               │
│ • Compliance calendars           │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Convert markdown → PDF           │
│ with professional formatting     │
└──────┬───────────────────────────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│ Email PDF to │   │ Log request  │
│ user         │   │ to database  │
└──────────────┘   └──────────────┘
```

## Agent Responsibilities

### Supervisor Agent

**Purpose:** Main orchestrator that coordinates all sub-agents

**Responsibilities:**
- Analyze incoming business request
- Determine which phases apply
- Delegate to appropriate sub-agents in correct sequence
- Compile all agent responses
- Ensure comprehensive coverage
- Format final output

**Decision Logic:**
```
IF requestType == "new_business":
    delegate to Entity Formation Agent
    delegate to State Licensing Agent
    delegate to Local Licensing Agent
    IF industry in [medical, food, alcohol, construction, cannabis, childcare]:
        delegate to Industry Specialist Agent
    delegate to Renewal & Compliance Agent

ELSE IF requestType == "renewal":
    skip Entity Formation
    delegate to Renewal & Compliance Agent
    IF business changed:
        delegate to relevant phase agents
```

### Entity Formation Agent (Phase 1)

**Purpose:** Guide through business structure setup

**Knowledge Base:**
- Business entity types (LLC, Corp, Sole Prop, Partnership)
- Secretary of State processes
- DBA filing by county
- EIN acquisition

**Output:**
- Recommended business structure
- SOS registration steps (portal, forms, fees)
- DBA requirements (county-specific)
- EIN application process
- Timeline: 3-6 weeks
- Cost breakdown

### State Licensing Agent (Phase 2)

**Purpose:** Handle state-level requirements

**Knowledge Base:**
- Statement of Information requirements
- CDTFA seller's permit processes
- SB 205 stormwater compliance
- CalGold database
- Industry-specific state licenses

**Output:**
- SOI filing instructions
- CDTFA permit process (if applicable)
- SB 205 determination and enrollment
- State industry licenses
- Timeline: 2-3 weeks
- Forms and portals

### Local Licensing Agent (Phase 3)

**Purpose:** Navigate city and county requirements

**Knowledge Base:**
- 482 California municipalities
- 58 California counties
- Zoning processes
- Home-based business rules
- Multi-location requirements

**Output:**
- Zoning clearance process (CRITICAL)
- City-specific license requirements
- County license (if unincorporated)
- Home-based permits (if applicable)
- Timeline: 3-10 weeks
- Contact information (specific to city)

### Industry Specialist Agent

**Purpose:** Handle industry-specific licensing

**Knowledge Base:**
- Medical/Healthcare (CDPH, Medical Board)
- Food Service (health permits, inspections)
- Alcohol (ABC licensing)
- Construction (CSLB)
- Cannabis (DCC, local approval)
- Child Care (CCL)
- Personal Care (Barbering, Cosmetology, Massage)
- Professional Services (various boards)

**Output:**
- Industry licensing requirements
- Additional permits needed
- Professional qualifications
- Timeline additions (+4-12 weeks)
- Integration with standard process

### Renewal & Compliance Agent (Phase 4)

**Purpose:** Ongoing requirements and maintenance

**Knowledge Base:**
- Annual renewal processes
- Tax compliance (CDTFA, FTB)
- Statement of Information updates
- Industry-specific ongoing requirements
- Penalty structures

**Output:**
- Annual renewal process
- Tax filing requirements
- Compliance calendar
- Record keeping requirements
- Penalty avoidance strategies
- Business closure process

## Technical Components

### Vector Database (Qdrant)

**Purpose:** Store and retrieve California business licensing knowledge

**Collections:**
1. `california_business_licensing` - Main knowledge base
2. `entity_formation_knowledge` - Phase 1 specifics
3. `state_licensing_knowledge` - Phase 2 specifics
4. `local_licensing_knowledge` - Phase 3 specifics (482 cities)
5. `industry_requirements_knowledge` - Industry-specific

**Documents:**
- `entity-formation.md` (4,685 chars)
- `state-licensing.md` (6,459 chars)
- `local-licensing.md` (12,145 chars)
- `industry-requirements.md` (22,727 chars)
- `renewal-compliance.md` (11,913 chars)
- `AGENTS.md` (4,062 chars)

**Embedding Model:** OpenAI text-embedding-ada-002 (1536 dimensions)
**Similarity Search:** Cosine distance, top-k=5-10

### Chat Model (LLM)

**Recommended:** GPT-4 Turbo or Claude 3.5 Sonnet

**Configuration:**
- Temperature: 0.3 (balance accuracy and creativity)
- Max Tokens: 4000 (comprehensive responses)
- System Message: Expert California business licensing knowledge

**Usage per request:**
- Supervisor: ~8,000 tokens
- Sub-agents: ~4,000 tokens each (5 agents = 20,000)
- Total: ~28,000 tokens (~$0.30 per request with GPT-4 Turbo)

### Database (PostgreSQL)

**Schema:**
```sql
CREATE TABLE business_licensing_requests (
  id SERIAL PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  county VARCHAR(100) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  business_type VARCHAR(50),
  request_type VARCHAR(50) DEFAULT 'new_business',
  contact_email VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  is_home_based BOOLEAN DEFAULT false,
  sells_tangible_goods BOOLEAN DEFAULT false,
  has_employees BOOLEAN DEFAULT false,
  target_open_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'completed',
  execution_id VARCHAR(255),
  error_message TEXT
);

CREATE INDEX idx_city ON business_licensing_requests(city);
CREATE INDEX idx_industry ON business_licensing_requests(industry);
CREATE INDEX idx_created_at ON business_licensing_requests(created_at);
```

## Workflow Execution Timeline

**User Experience Timeline:**
1. User fills form: 3-5 minutes
2. Form submits to Google Sheets: instant
3. n8n workflow triggers: <5 seconds
4. Data extraction and validation: <5 seconds
5. Supervisor agent analysis: 10-15 seconds
6. Sub-agent execution (5 agents in parallel): 30-60 seconds
7. Document compilation: 5-10 seconds
8. PDF generation: 10-15 seconds
9. Email delivery: 5-10 seconds
10. Database logging: <2 seconds

**Total: 2-5 minutes from form submission to email delivery**

## Error Handling

### Validation Errors
- Missing required fields → Error notification to admin
- Invalid data types → Logged and admin notified
- User receives no email (fail-safe)

### Agent Errors
- Agent timeout → Fallback to generic guidance
- API rate limit → Retry with exponential backoff
- Vector store unavailable → Use LLM knowledge only

### System Errors
- PDF generation fails → Send markdown as text
- Email delivery fails → Log to database, retry 3 times
- Database unavailable → Continue workflow, skip logging

## Scalability Considerations

### Current Capacity
- **Concurrent requests:** 10-20 (limited by n8n instance)
- **Daily volume:** 1,000-2,000 requests
- **Monthly volume:** 30,000-60,000 requests

### Scaling Strategies

**Horizontal Scaling:**
- Deploy multiple n8n instances
- Load balancer distributes requests
- Shared PostgreSQL and Qdrant instances

**Optimization:**
- Cache common city/industry combinations
- Pre-compile frequently requested guides
- Implement queue system for high-volume periods

**Cost Management:**
- Use GPT-4 for complex, GPT-3.5 for simple requests
- Batch vector database queries
- Implement rate limiting per user

## Security Architecture

### API Key Management
- All credentials stored in n8n encrypted vault
- No hardcoded secrets in workflows
- Rotate keys quarterly

### Data Privacy
- No PII logged in execution logs
- Email addresses hashed before analytics
- GDPR/CCPA compliant data retention (90 days)

### Access Control
- n8n admin access restricted
- Database read-only replica for analytics
- Webhook endpoints authenticated

## Monitoring & Observability

### Key Metrics
- **Request volume:** Daily, weekly, monthly
- **Success rate:** % of completed workflows
- **Average execution time:** Target <3 minutes
- **Agent performance:** Response quality, timeouts
- **Cost per request:** Track AI API usage

### Alerts
- Workflow failure rate >5% → Alert admin
- Average execution time >5 minutes → Investigate
- Database connection errors → Critical alert
- AI API rate limit reached → Notify immediately

### Dashboards
- Real-time workflow monitoring
- Request volume by city, industry
- Cost tracking and projections
- Error rate trends

## Future Enhancements

### Phase 2 Features
- Multi-language support (Spanish priority)
- SMS notifications in addition to email
- Calendar integration for deadline reminders
- Mobile-optimized PDF guides

### Phase 3 Features
- Interactive chatbot for follow-up questions
- Document upload and review
- Application status tracking
- Integration with government APIs (auto-fill)

### Phase 4 Features
- AI-powered form filling assistance
- Automated filing (with user authorization)
- Business license renewal reminders
- Compliance dashboard

---

**Document Version:** 1.0
**Last Updated:** November 2025
**Maintained By:** California Business Licensing Assistant Project
