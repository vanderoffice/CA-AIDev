# California Business Licensing Multi-Agent n8n Architecture

## Overview

This n8n automation system provides personalized, step-by-step guidance to California citizens navigating the complex process of starting a business or renewing business licenses. The system uses a multi-agent AI architecture to analyze user requirements and generate comprehensive, actionable guides delivered as PDF email attachments.

## System Architecture

### High-Level Flow

```
Tally Form → Google Sheets → n8n Trigger → Supervisor Agent → Sub-Agents → PDF Generation → Email Delivery
```

### Components

1. **Main Workflow** (`01_main_workflow.json`)
   - Entry point triggered by Google Sheets updates from Tally forms
   - Orchestrates the entire process from data intake to email delivery
   - Contains supervisor agent that coordinates 5 specialized sub-agents

2. **Sub-Agent Workflows** (5 specialized agents)
   - Entity Formation Agent (Phase 1)
   - State Licensing Agent (Phase 2)
   - Local Licensing Agent (Phase 3)
   - Industry Specialist Agent (Industry-specific requirements)
   - Renewal & Compliance Agent (Phase 4)

### Multi-Agent Orchestration

The **Supervisor Agent** acts as the main coordinator, intelligently delegating tasks to specialized sub-agents based on:
- Business type and structure
- Geographic location (city, county)
- Industry classification
- Request type (new business vs. renewal)

Each sub-agent:
- Has deep expertise in its domain
- Accesses a knowledge base (vector store) with California licensing documentation
- Provides detailed, actionable guidance with direct links and phone numbers
- Returns structured responses to the supervisor

## Workflow Details

### 01_main_workflow.json (17 nodes)

**Flow:**
1. **Tally Form Submission Trigger** - Monitors Google Sheets for new form submissions
2. **Extract Form Data** - Structures incoming data
3. **Validate Required Fields** - Ensures critical information is present
4. **Supervisor Agent** - Coordinates sub-agent delegation
5-9. **Sub-Agent Tools** - Interfaces to specialized agents
10. **CA Licensing Knowledge Base** - Vector database with documentation
11. **CalGold Search Tool** - Web search for permit databases
12. **AI Chat Model** - Primary LLM (GPT-4 or Claude)
13. **Compile Final Document** - Assembles all agent responses
14. **Generate PDF Document** - Converts markdown to professional PDF
15. **Send Email with Guide** - Delivers personalized guide
16. **Log Request to Database** - Tracks requests for analytics
17. **Send Error Notification** - Alerts admin of failures

**Key Features:**
- Error handling with admin notifications
- Database logging for analytics
- Professional PDF generation with headers/footers
- HTML email templates with personalization

### Sub-Agent Workflows

#### 02_entity_formation_agent.json (Phase 1)
**Expertise:**
- Business structure selection (LLC, Corporation, Sole Proprietorship)
- Secretary of State registration
- DBA filing (county-specific)
- Federal EIN acquisition
- Timeline: 3-6 weeks (includes DBA publication)

#### 03_state_licensing_agent.json (Phase 2)
**Expertise:**
- Statement of Information filing
- CDTFA Seller's Permit (if selling goods)
- SB 205 Stormwater Compliance
- CalGold database research
- Industry-specific state licenses
- Timeline: 2-3 weeks

#### 04_local_licensing_agent.json (Phase 3)
**Expertise:**
- Zoning clearance (CRITICAL FIRST STEP)
- County business licenses (unincorporated areas)
- City-specific business licenses
- Home-based business permits
- Coverage: All 482 California municipalities
- Timeline: 3-10 weeks (zoning often 4-6 weeks)

#### 05_industry_specialist_agent.json (Supplemental)
**Expertise:**
- Medical/Healthcare (CDPH, Medical Board)
- Food Service/Restaurants (Health permits)
- Alcohol Sales (ABC licensing)
- Construction (CSLB)
- Cannabis (DCC)
- Child Care (CCL)
- Personal Care (Barbering & Cosmetology Board)
- Professional Services (various boards)
- Timeline: +4-12 weeks (varies by industry)

#### 06_renewal_compliance_agent.json (Phase 4)
**Expertise:**
- Annual business license renewals
- Statement of Information updates
- Tax compliance (CDTFA, FTB)
- Ongoing record keeping
- Compliance calendars
- Penalty avoidance strategies
- Timeline: Ongoing

## Form Fields (Tally → Google Sheets)

The system expects the following fields from the Tally form:

### Required Fields
- `businessName` - Legal or intended business name
- `city` - City where business will operate
- `county` - California county
- `industry` - Industry/business type
- `contactEmail` - User's email address
- `contactName` - User's full name

### Optional Fields
- `businessType` - Entity structure (LLC, Corporation, etc.)
- `businessAddress` - Physical business location
- `isHomeBased` - Boolean: Home-based business?
- `sellsTangibleGoods` - Boolean: Sells physical products?
- `hasEmployees` - Boolean: Will hire employees?
- `targetOpenDate` - Planned opening date
- `requestType` - "new_business" or "renewal"

## Setup Instructions

### Prerequisites

1. **n8n Instance** (self-hosted or cloud)
2. **Credentials Required:**
   - Google Sheets OAuth2
   - OpenAI API (or Claude API)
   - Qdrant Vector Database
   - SMTP Email Server
   - PostgreSQL Database

### Installation Steps

#### 1. Import Workflows

Import workflows in this order:
1. `02_entity_formation_agent.json`
2. `03_state_licensing_agent.json`
3. `04_local_licensing_agent.json`
4. `05_industry_specialist_agent.json`
5. `06_renewal_compliance_agent.json`
6. `01_main_workflow.json` (import last)

#### 2. Configure Credentials

**Google Sheets:**
- Create OAuth2 credentials in Google Cloud Console
- Add to n8n: Settings → Credentials → Google Sheets OAuth2 API

**OpenAI API:**
- Obtain API key from platform.openai.com
- Add to n8n: Settings → Credentials → OpenAI

**Qdrant Vector Database:**
- Set up Qdrant instance (cloud or self-hosted)
- Add credentials: URL and API key

**SMTP Email:**
- Configure your email provider (Gmail, SendGrid, etc.)
- Add SMTP credentials

**PostgreSQL:**
- Create database: `california_business_licensing`
- Create table:
```sql
CREATE TABLE business_licensing_requests (
  id SERIAL PRIMARY KEY,
  business_name VARCHAR(255),
  city VARCHAR(100),
  county VARCHAR(100),
  industry VARCHAR(100),
  request_type VARCHAR(50),
  contact_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50)
);
```

#### 3. Load Knowledge Base

**Vector Database Setup:**

Upload the following documents to Qdrant collections:
- Collection: `california_business_licensing`
  - `entity-formation.md`
  - `state-licensing.md`
  - `local-licensing.md`
  - `renewal-compliance.md`
  - `industry-requirements.md`
  - `AGENTS.md`

Use n8n's vector store nodes or Qdrant API to upload:
```python
# Example using Qdrant Python client
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

client = QdrantClient(url="your-qdrant-url", api_key="your-key")

# Create collection
client.create_collection(
    collection_name="california_business_licensing",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)

# Upload documents (implement chunking and embedding)
```

#### 4. Configure Tally Form

**Create Tally Form with these fields:**

1. **Business Information**
   - Business Name (text, required)
   - Industry/Business Type (dropdown, required)
   - Business Structure (dropdown: LLC, Corporation, Sole Proprietorship, Partnership)

2. **Location**
   - City (text, required)
   - County (dropdown of 58 CA counties, required)
   - Business Address (text)
   - Is this a home-based business? (yes/no)

3. **Business Details**
   - Will you sell tangible goods? (yes/no)
   - Will you have employees? (yes/no)
   - Target opening date (date picker)
   - Request type (dropdown: New Business, Renewal/Compliance)

4. **Contact Information**
   - Your Name (text, required)
   - Email Address (email, required)

**Configure Tally to Google Sheets:**
- In Tally: Settings → Integrations → Google Sheets
- Connect to your Google Sheet
- Map form fields to sheet columns

#### 5. Link Main Workflow to Google Sheets

1. Open `01_main_workflow.json` in n8n
2. Click "Tally Form Submission Trigger" node
3. Configure:
   - Select your Google Sheets credentials
   - Choose the connected spreadsheet
   - Select the sheet (usually "Sheet1")
4. Test the connection

#### 6. Link Sub-Agents to Main Workflow

1. Open `01_main_workflow.json`
2. For each "Agent Tool" node (5-9):
   - Click the node
   - In "Workflow ID", select the corresponding sub-agent workflow:
     - Entity Formation Agent Tool → `02_entity_formation_agent`
     - State Licensing Agent Tool → `03_state_licensing_agent`
     - Local Licensing Agent Tool → `04_local_licensing_agent`
     - Industry Specialist Agent Tool → `05_industry_specialist_agent`
     - Renewal & Compliance Agent Tool → `06_renewal_compliance_agent`

#### 7. Test the System

1. **Submit Test Form:**
   - Fill out Tally form with test data
   - Use a real California city (e.g., Sacramento)

2. **Monitor Execution:**
   - Open n8n
   - Go to "Executions" tab
   - Watch the workflow execute
   - Check each node's output

3. **Verify Email Delivery:**
   - Check test email inbox
   - Confirm PDF attachment is generated
   - Review PDF content for accuracy

4. **Check Database:**
```sql
SELECT * FROM business_licensing_requests ORDER BY created_at DESC LIMIT 5;
```

### Configuration Options

#### Email Templates

Customize the email HTML in node #15 of `01_main_workflow.json`:
- Update sender name and email
- Modify branding
- Adjust styling

#### PDF Styling

Modify PDF generation in node #14:
- Header/footer templates
- Margins
- Page formatting

#### Agent Prompts

Fine-tune agent behavior by editing prompts in each sub-agent workflow:
- Adjust level of detail
- Modify response structure
- Add city-specific knowledge

## Usage

### For End Users

1. **Access Tally Form** - Go to your published Tally form URL
2. **Fill Out Form** - Provide business details and location
3. **Submit** - Form data flows to Google Sheets
4. **Receive Guide** - Email with PDF guide arrives within 2-5 minutes
5. **Follow Steps** - Use the personalized guide to complete licensing

### For Administrators

**Monitor System:**
- n8n Executions tab shows all workflow runs
- Database tracks all requests
- Error notifications sent to admin email

**Update Documentation:**
- Add new documents to vector database
- Update agent prompts with new regulations
- Refresh city-specific information annually

**Analytics Queries:**
```sql
-- Most common industries
SELECT industry, COUNT(*) as count
FROM business_licensing_requests
GROUP BY industry
ORDER BY count DESC;

-- Requests by city
SELECT city, COUNT(*) as count
FROM business_licensing_requests
GROUP BY city
ORDER BY count DESC
LIMIT 10;

-- Request volume over time
SELECT DATE(created_at) as date, COUNT(*) as count
FROM business_licensing_requests
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Troubleshooting

### Common Issues

**Issue: Workflow not triggering**
- Check Google Sheets connection
- Verify Tally form is sending data to correct sheet
- Check webhook connectivity

**Issue: Agent responses incomplete**
- Verify vector database is loaded
- Check AI model API key and rate limits
- Increase maxTokens in chat model settings

**Issue: PDF generation fails**
- Check markdown syntax in compiled document
- Verify n8n has sufficient memory
- Test HTML to PDF conversion separately

**Issue: Email not sending**
- Verify SMTP credentials
- Check email server rate limits
- Confirm recipient email is valid

### Debug Mode

Enable detailed logging:
1. n8n Settings → Debug Mode: ON
2. Check execution logs for each node
3. Examine JSON data between nodes

## Maintenance

### Regular Tasks

**Monthly:**
- Review error logs
- Update vector database if regulations change
- Check API usage and costs

**Quarterly:**
- Verify city contact information
- Update fee schedules
- Test end-to-end workflow

**Annually:**
- Comprehensive documentation review
- Update all 58 county information
- Refresh city licensing portals (482 cities)
- Review CalGold database changes

## Performance Optimization

### Recommended Settings

**Agent Chat Model:**
- Temperature: 0.3 (balance creativity and accuracy)
- Max Tokens: 4000 (comprehensive responses)
- Model: GPT-4 Turbo or Claude 3.5 Sonnet

**Vector Store:**
- Top K: 5-10 relevant chunks
- Similarity threshold: 0.7

**Workflow:**
- Timeout: 300 seconds (5 minutes)
- Max execution time per agent: 60 seconds

## Cost Estimation

### Per Request

**AI API Costs (GPT-4 Turbo):**
- Supervisor agent: ~8,000 tokens ($0.08)
- Sub-agents (5): ~20,000 tokens total ($0.20)
- Total per request: ~$0.30

**Other Costs:**
- Vector database: $0.01
- Email: $0.001
- Database: negligible

**Total: ~$0.31 per personalized guide**

### Monthly (1000 requests)
- AI: $310
- Infrastructure: $50
- **Total: ~$360/month**

## Security & Privacy

### Data Protection

- No personally identifiable information stored in logs
- Database encrypted at rest
- HTTPS/TLS for all communications
- API keys stored securely in n8n credentials

### Compliance

- GDPR: User data minimization, right to deletion
- CCPA: California privacy standards
- Data retention: 90 days in database

## Support & Contributing

### Getting Help

- Review documentation thoroughly
- Check n8n community forums
- Review execution logs for errors

### Improving the System

**Add New Cities:**
1. Research city requirements
2. Update `local-licensing.md`
3. Reload vector database
4. Test with new city data

**Add New Industries:**
1. Research industry requirements
2. Update `industry-requirements.md`
3. Reload vector database
4. Test with new industry

## License

This automation system is provided as-is for informational purposes. Always verify current requirements with official California government sources.

## Disclaimer

**This tool provides informational guidance only and does not constitute legal advice.**

- Requirements change frequently - always verify with official .gov websites
- Not responsible for inaccuracies or outdated information
- Does not file applications on user's behalf
- Users should consult qualified professionals for complex situations

---

**Last Updated:** November 2025
**Version:** 1.0
**Documentation:** Complete multi-agent n8n architecture for California business licensing assistance
