# n8n Multi-Agent CA Business License Architecture

## System Overview

This is a sophisticated multi-agent n8n workflow system that guides California citizens through complex business licensing processes. When a user submits their business information via Tally form → Google Sheets, specialized AI agents analyze their unique requirements and generate personalized step-by-step guidance documents via email.

## Architecture Pattern: Hierarchical Multi-Agent Orchestration

```
Google Sheets Form Input
        ↓
   Orchestrator (Main Controller)
        ↓
    Data Normalization & Routing
        ↓
    ┌────────────────────────────────────┐
    ↓              ↓              ↓       ↓
Entity Agent  State Agent  Location Agent Industry Agent
    ↓              ↓              ↓       ↓
(Phase 1)    (Phase 2)     (Phase 3)   Special Reqs
    ↓              ↓              ↓       ↓
    └────────────────────────────────────┘
              ↓
    Compliance & Renewal Agent
              ↓
    Merge & Aggregate Outputs
              ↓
    Generate Personalized PDF
              ↓
    Send via Email + Log to Sheets
```

## Key Components

### 1. Orchestrator Workflow (Main Controller)

**File:** `CA-Business-License-Orchestrator.json`

**Responsibilities:**
- Receives form submissions from Google Sheets via webhook
- Extracts and normalizes user input data
- Routes requests to specialized agents based on business stage
- Aggregates agent outputs
- Triggers document generation and email delivery
- Logs results back to Google Sheets

**Key Nodes:**
- `Google Sheets Form Trigger` - Webhook receiving form data
- `Extract Form Data` - Parse and structure input
- `Normalize Location Data` - Clean location strings, detect unincorporated areas
- `Route by Business Stage` - Conditional routing (startup vs. renewal)
- Sub-workflow calls to 5 specialized agents
- `Merge Agent Outputs` - Combine all guidance into single document
- `Generate PDF Document` - Create beautiful PDF with embedded agent guidance
- `Send Email with PDF Attachment` - Deliver to user's email
- `Log to Google Sheets` - Record submission for tracking

**Data Flow:**
```json
{
  "businessName": "ABC Consulting LLC",
  "businessLocation": "Sacramento, CA",
  "businessType": "Professional Services",
  "ownerEmail": "owner@abcconsulting.com",
  "businessStage": "startup",
  "submissionTimestamp": "2025-11-29T04:31:00Z"
}
```

### 2. Specialized Agent Workflows

Each agent is a sub-workflow that focuses on ONE specific responsibility per Single Responsibility Principle.

#### A. Entity Formation Agent

**File:** `entity-formation-agent.json`

**Responsibility:** Phase 1 guidance

**Input:** Business name, type, owner info

**Output:** 
- Recommended entity structure (LLC, Corp, etc.)
- SOS filing requirements and costs
- DBA filing if needed
- EIN process
- Timeline: 3-6 weeks
- Cost breakdown

**AI System Prompt:** Specializes in analyzing liability protection needs, tax implications, and optimal entity structure

**Tools Available:**
- Access to entity-formation.md reference
- CalGold integration (links)
- SOS portal references

#### B. State Licensing Agent

**File:** `state-licensing-agent.json`

**Responsibility:** Phase 2 guidance

**Input:** Business type, entity structure, business purpose

**Output:**
- CDTFA Seller's Permit requirements
- Statement of Information deadlines
- Industry-specific state licenses
- SB 205 Stormwater compliance
- Processing times
- Portal links and contacts

**AI System Prompt:** Expert in state-level requirements, processing times, and regulatory dependencies

#### C. Location Licensing Agent

**File:** `location-licensing-agent.json`

**Responsibility:** Phase 3 guidance (typically longest phase: 3-8 weeks)

**Input:** Business location (city or county), business type

**Output:**
- City vs. unincorporated determination
- Zoning clearance requirements (CRITICAL - must be first)
- County license requirements
- City business license requirements
- Home-based business restrictions
- Multi-location considerations
- Specific city contact info and portals
- Processing timelines
- Fee estimates

**AI System Prompt:** Comprehensive knowledge of all 58 California counties and major cities. Understands zoning as prerequisite gate.

**Critical Rule:** Zoning clearance must complete BEFORE city license application

#### D. Industry Requirements Agent

**File:** `industry-requirements-agent.json`

**Responsibility:** Industry-specific supplemental requirements

**Input:** Business type (medical, food, alcohol, construction, cannabis, etc.)

**Output:**
- Special state licenses (medical board, ABC, CSLB, etc.)
- Health department permits
- Professional licensing requirements
- Insurance requirements (GL, workers comp, bonding)
- Inspection schedules
- Compliance requirements
- Processing timelines
- Regulatory agency contacts

**AI System Prompt:** Expert in specific industries covered in industry-requirements.md section

**Industries Covered:**
1. Medical/Healthcare (CDPH, Medical Board)
2. Food Service & Restaurants (County Health)
3. Alcohol Sales (ABC License)
4. Construction & Contractors (CSLB)
5. Cannabis Businesses (DCC)
6. Child Care Facilities
7. Personal Care Services
8. Professional Services (Accountants, lawyers, etc.)
9. Home-Based Businesses
10. Nonprofits 501(c)(3)

#### E. Compliance & Renewal Agent

**File:** `compliance-advisor-agent.json`

**Responsibility:** Phase 4 ongoing management

**Input:** Entity type, location, business type

**Output:**
- Annual renewal timelines
- Renewal deadlines and late penalties
- Statement of Information schedules
- Tax filing requirements (CDTFA, FTB, payroll)
- Record-keeping requirements
- Compliance calendar
- Penalty avoidance strategies
- Business closure procedures

**AI System Prompt:** Expert in post-launch ongoing compliance, renewal deadlines, and penalty mitigation

## Data Structure & Transformations

### Input Data Schema (from Tally Form → Google Sheets)

```json
{
  "businessName": "string",           // Legal business name
  "businessLocation": "string",       // City or county designation
  "businessType": "string",           // Industry classification
  "businessTypeCategory": "string",   // Category: service, retail, medical, food, etc.
  "ownerEmail": "string",            // Email for delivery
  "businessStage": "string",         // "startup" | "renewal" | "expansion"
  "yearsInOperation": "number",      // For renewal stage
  "numberOfEmployees": "number",     // Current employee count
  "homeBasedBusiness": "boolean",    // Is business home-based?
  "sellingTangibleGoods": "boolean", // Does business sell physical products?
  "regulatedIndustry": "boolean",    // Is industry regulated?
  "submissionTimestamp": "string"    // ISO datetime of form submission
}
```

### Agent Output Schema

Each agent returns a standardized object:

```json
{
  "agentName": "Entity Formation Agent",
  "phaseNumber": 1,
  "guidance": {
    "summary": "Recommended structure and next steps",
    "actionItems": ["Step 1", "Step 2", ...],
    "timeline": "3-6 weeks",
    "estimatedCosts": {
      "filing": 70,
      "dba": 100,
      "ein": 0,
      "total": 170
    },
    "contacts": {
      "agency": "California Secretary of State",
      "portal": "https://bizfileonline.sos.ca.gov/",
      "phone": "(916) 657-5448"
    },
    "criticalDeadlines": [],
    "commonMistakes": []
  }
}
```

### Merged Output (For PDF Generation)

```json
{
  "businessProfile": {
    "name": "string",
    "location": "string",
    "type": "string",
    "stage": "string"
  },
  "phases": [
    {
      "phase": 1,
      "name": "Entity Formation",
      "agent_output": "...",
      "timeline": "3-6 weeks",
      "costs": 170
    },
    // ... phases 2-4
  ],
  "timeline": {
    "total_weeks": 14,
    "critical_path": ["Zoning clearance", "SOS filing", ...]
  },
  "costEstimate": 500,
  "nextSteps": [],
  "resources": []
}
```

## Multi-Agent Communication Patterns

### Pattern 1: Sequential Waterfall (Primary Path)

Used for startup stage (business doesn't exist yet):

```
Entity Agent → State Agent → Location Agent → Industry Agent → Compliance Agent
     ↓             ↓             ↓                ↓                  ↓
   Phase 1       Phase 2       Phase 3         Supplemental       Phase 4
 Formation      Licensing     Licensing       Requirements       Ongoing
```

**Why Sequential:** Each phase depends on outputs of prior phase:
- Can't get CDTFA permit without EIN (Phase 1 output)
- Can't get city license without state approval (Phase 2 prerequisite)
- Must complete zoning BEFORE city license (Phase 3 gate)

### Pattern 2: Conditional Branching (Renewal Path)

Used when business already exists (renewal stage):

```
↓ Skip Entity & State Agents (already have EIN, entity)
Location Agent (Renewal requirements)
     ↓
Industry Agent (New industry reqs or changes)
     ↓
Compliance Agent (Renewal calendar, deadlines)
```

### Pattern 3: Parallel Processing (Output Generation)

After all agents complete, outputs are merged in parallel:

```
Agent Outputs → Merge Outputs
                    ↓
        ┌───────────┼───────────┐
        ↓           ↓           ↓
    PDF Gen    Email Send   Log to Sheets
```

## Error Handling Strategy

### Agent-Level Error Handling

Each agent workflow includes:
1. Input validation (required fields check)
2. Try/Catch on API calls
3. Fallback responses
4. Error logging to Sheets

Example for Location Agent:
```
IF location_data_invalid
  → Return default guidance for "contact city planning"
  → Log error
  → Continue (don't fail entire workflow)
```

### Orchestrator-Level Error Handling

Main workflow includes:
1. Webhook input validation
2. Agent call error catches (IF nodes)
3. Graceful degradation (skip failed agent, continue with others)
4. Email fallback (notify owner if error)
5. All errors logged to Sheets for review

### Error Recovery

```json
{
  "errorType": "agent_timeout",
  "agent": "location-licensing-agent",
  "timestamp": "2025-11-29T04:45:00Z",
  "fallback": "Provided generic location guidance",
  "retryable": true,
  "ownerNotified": false
}
```

## Implementation Details

### Prerequisites

1. **n8n Instance:** Self-hosted or cloud (n8n.cloud)
2. **Google Sheets:** Target sheet with form responses
3. **Tally Integration:** Form submission webhook → Sheets
4. **Email Service:** Gmail, SendGrid, or SMTP
5. **LLM Provider:** OpenAI, Anthropic, or other (for AI agents)
6. **PDF Generator:** n8n's Document Builder node
7. **Vector DB (Optional):** For RAG enhancement

### Credentials Required

```
- google_sheets_api_key
- google_gmail_oauth2
- openai_api_key (for AI agents)
- webhook_signature_key
```

### Google Sheets Setup

**Source Sheet (Form Responses):**
- Columns: businessName, businessLocation, businessType, ownerEmail, businessStage, submissionTimestamp
- Trigger: New row created

**Tracking Sheet (Processed):**
- Columns: businessName, businessLocation, businessType, submissionDate, guidanceStatus, guidanceURL, errorLog
- Purpose: Track processed submissions and failures

## Scalability Considerations

### Current Capacity
- ~100 submissions/day per n8n instance
- ~2-3 minute per-user processing time
- ~2MB PDF per submission
- ~50MB monthly data storage

### Scaling Strategy

**Horizontal Scaling:**
- Deploy multiple n8n instances behind load balancer
- Use Redis for distributed caching
- Separate webhook handler from processing workers

**Vertical Scaling:**
- Increase n8n instance memory (agent processing intensive)
- Upgrade LLM tier (faster responses)
- Cache common queries (same location, same industry)

**Optimization:**
- Queue system (Bullmq) for high volume
- Agent response caching by location/industry
- Batch email sending
- Async PDF generation

## Monitoring & Observability

### Metrics to Track

```
1. Submission Volume (per day/week/month)
2. Processing Time (per phase, per agent)
3. Agent Performance (accuracy, speed, error rate)
4. Email Delivery Rate
5. User Engagement (PDF opens, click-throughs)
6. Error Rate (per agent, per phase)
7. Retry Rate (which agents fail most?)
```

### Logging

All events logged to Google Sheets tracking:
- Submission received
- Each agent started/completed
- Processing duration
- Errors/warnings
- PDF generated
- Email sent/failed
- User email opened (via pixel tracking optional)

### Alerts

Configure n8n alerts for:
- Agent timeout (>5 min)
- Email send failure
- Webhook validation error
- Storage quota exceeded
- API rate limit warning

## Testing Strategy

### Unit Tests (Per Agent)

```
Test Input: 
  businessType: "Restaurant"
  businessLocation: "San Francisco"

Expected Outputs:
  - Health permit requirement identified
  - ABC license detected (if alcohol)
  - SB 205 checked
  - Specific SF contacts provided
  - Timeline realistic (14-18 weeks)
```

### Integration Tests

1. Full workflow execution with test data
2. Verify PDF generation
3. Verify email delivery
4. Verify Sheets logging
5. Verify error handling (missing fields, invalid location, etc.)

### Load Testing

1. Simulate 100 concurrent submissions
2. Measure queue depth, memory usage
3. Verify response times
4. Check agent error rates under load

## Enhancement Roadmap

### Phase 1 (Current)
- ✅ 5-agent multi-agent architecture
- ✅ Email delivery with PDF
- ✅ Google Sheets logging
- ✅ Error handling

### Phase 2 (Next)
- [ ] Vector RAG with official documents
- [ ] Interactive chatbot (Chat Trigger)
- [ ] Real-time agency status checks
- [ ] Fee estimation calculator
- [ ] Document template generator
- [ ] Calendar integration (renewal reminders)

### Phase 3 (Future)
- [ ] Multi-language support (Spanish, Mandarin)
- [ ] Mobile app
- [ ] Community Q&A forum
- [ ] Integration with state agency APIs
- [ ] Automated document filing (Phase 1 entities)
- [ ] Compliance monitoring dashboard

## Conclusion

This multi-agent architecture represents a sophisticated, scalable solution for guiding California citizens through complex regulatory processes. By breaking the problem into specialized agents, each with focused responsibility and deep domain knowledge, the system achieves:

1. **Accuracy:** Specialized agents outperform generalist LLMs
2. **Reliability:** Error handling at multiple levels
3. **Scalability:** Horizontal and vertical scaling paths
4. **Maintainability:** Clear separation of concerns
5. **User Value:** Personalized, comprehensive, actionable guidance

The system transforms unstructured business scenarios into structured, step-by-step guidance delivered in minutes—democratizing access to complex California regulatory information.

---

**Last Updated:** November 2025
**Version:** 1.0
**Status:** Ready for Implementation
