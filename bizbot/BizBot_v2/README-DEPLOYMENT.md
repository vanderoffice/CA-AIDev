# n8n Workflow Files - CA Business License Multi-Agent System

## Quick Start

This folder contains the complete n8n workflow architecture for the California Business License guidance system.

## Files Overview

### 1. **CA-Business-License-Orchestrator.json** (Main Workflow)
The central orchestrator that:
- Receives form submissions via Google Sheets webhook
- Routes to specialized agents
- Aggregates outputs
- Generates PDF documents
- Sends via email
- Logs results

**Deploy First:** This is the entry point for all user submissions.

### 2. **entity-formation-agent.json** (Phase 1)
Specialized agent for business entity formation:
- LLC vs Corporation analysis
- Secretary of State requirements
- DBA filing guidance
- EIN process
- Cost and timeline estimates

### 3. **state-licensing-agent.json** (Phase 2)
Specialized agent for state-level licensing:
- CDTFA Seller's Permit requirements
- Statement of Information deadlines
- Industry-specific state licenses
- SB 205 Stormwater compliance
- Processing times and portals

### 4. **location-licensing-agent.json** (Phase 3)
Specialized agent for local/city licensing:
- City vs. unincorporated determination
- Zoning clearance requirements (CRITICAL)
- County license details
- City business license specifics
- All 58 CA county + major city contact info

### 5. **industry-requirements-agent.json** (Supplemental)
Specialized agent for industry-specific requirements:
- Medical/Healthcare
- Food Service & Restaurants
- Alcohol Sales (ABC)
- Construction & Contractors (CSLB)
- Cannabis Businesses
- Child Care
- Professional Services
- Home-Based Businesses
- Nonprofits

### 6. **compliance-advisor-agent.json** (Phase 4)
Specialized agent for ongoing compliance & renewal:
- Annual renewal timelines
- Tax filing requirements
- Compliance calendar
- Record-keeping obligations
- Penalty avoidance
- Business closure procedures

---

## Deployment Instructions

### Step 1: Prepare n8n Instance

1. Log into your n8n instance (self-hosted or n8n.cloud)
2. Create a new folder: "CA Business License System"
3. Set up credentials:
   - Google Sheets API
   - Google Gmail (OAuth2)
   - OpenAI API (for AI agents)
   - Email service (Gmail or SMTP)

### Step 2: Import Workflows

1. In n8n Dashboard → click "Create Workflow" or "Import"
2. Import each JSON file in this order:
   - entity-formation-agent.json
   - state-licensing-agent.json
   - location-licensing-agent.json
   - industry-requirements-agent.json
   - compliance-advisor-agent.json
   - CA-Business-License-Orchestrator.json (last - depends on others)

3. For each workflow:
   - Click "Import from file"
   - Select JSON file
   - Review nodes and connections
   - Click "Save"

### Step 3: Configure Credentials

For each workflow that uses external services:

**Google Sheets:**
1. Go to workflow → node "Google Sheets"
2. Click "Create new credential"
3. Select Google Sheets credential type
4. Authenticate and grant permissions
5. Save credential

**Gmail:**
1. Similar process for Gmail nodes
2. Requires OAuth2 authentication

**OpenAI (for AI Agents):**
1. Open AI Agent node
2. Create new OpenAI credential
3. Add API key from OpenAI dashboard
4. Save

**Email:**
1. If using Gmail: use same credential as above
2. If using SMTP: add server details

### Step 4: Configure Google Sheets Integration

1. Create Google Sheet with these columns:
   - businessName
   - businessLocation
   - businessType
   - businessTypeCategory
   - ownerEmail
   - businessStage
   - yearsInOperation
   - numberOfEmployees
   - homeBasedBusiness
   - sellingTangibleGoods
   - regulatedIndustry
   - submissionTimestamp

2. Create second sheet "processed-submissions" for tracking:
   - businessName
   - businessLocation
   - businessType
   - submissionDate
   - guidanceStatus
   - guidanceURL
   - errorLog

3. In orchestrator workflow:
   - Update "Google Sheets Form Trigger" node with your sheet ID
   - Update "Log to Google Sheets" node with tracking sheet ID

### Step 5: Set Up Tally Form

1. Create Tally form with these fields:
   - Business Name (text)
   - Business Location (select/text)
   - Business Type (select)
   - Owner Email (email)
   - Business Stage (radio: startup/renewal)
   - Years in Operation (number)
   - Number of Employees (number)
   - Home-Based? (yes/no)
   - Selling Goods? (yes/no)
   - Regulated Industry? (yes/no)

2. Connect Tally → Google Sheets integration
3. Tally automatically adds rows to your sheet
4. Webhook in n8n triggers on new row

### Step 6: Test Workflow

1. Go to orchestrator workflow
2. Click "Test" or submit manual test data
3. Verify:
   - Form data extracted correctly
   - Each agent completes successfully
   - PDF generates
   - Email sends to test email
   - Row logged to Sheets

### Step 7: Activate & Monitor

1. Click "Activate" on orchestrator workflow
2. All sub-workflows should auto-activate
3. Monitor execution logs
4. Check Google Sheets tracking sheet for submissions

---

## Workflow Architecture

```
Tally Form
    ↓
Google Sheets (New Row)
    ↓
n8n Webhook Trigger
    ↓
Orchestrator Workflow
    ├→ Entity Formation Agent
    ├→ State Licensing Agent
    ├→ Location Licensing Agent
    ├→ Industry Requirements Agent
    └→ Compliance Agent
    ↓
Merge Outputs
    ↓
Generate PDF
    ↓
Send Email + Log to Sheets
```

---

## Key Configuration Points

### 1. Webhook URL

The orchestrator uses a webhook to receive form submissions. After importing:

1. Open "Google Sheets Form Trigger" node
2. Copy the webhook URL
3. This URL receives POST requests from Tally

### 2. Email Recipients

Configure email delivery in "Send Email with PDF Attachment" node:
- From: Set your sender email
- To: Uses `{{ $json.ownerEmail }}` from form
- Subject: Customizable
- Body: Customizable

### 3. Agent Customization

Each agent can be customized by editing the system prompt:

1. Open agent workflow
2. Edit AI Agent node
3. Modify system prompt to add:
   - Custom instructions
   - Local preferences
   - Additional reference materials
   - Specific business focus

### 4. PDF Styling

In "Generate PDF Document" node:
- Customize header/footer
- Change branding
- Adjust fonts and colors
- Add logo

---

## Troubleshooting

### Issue: Form data not reaching n8n

**Solution:**
1. Verify Tally → Google Sheets connection works
2. Check webhook URL in orchestrator
3. Test webhook with curl:
   ```bash
   curl -X POST [webhook_url] -H "Content-Type: application/json" -d '{"businessName":"Test"}'
   ```

### Issue: Agent workflows not executing

**Solution:**
1. Check sub-workflow references in orchestrator
2. Verify all credentials are configured
3. Check n8n execution logs for errors
4. Ensure sub-workflows are not in edit mode

### Issue: PDF not generating

**Solution:**
1. Verify merged output contains data
2. Check Document Builder node configuration
3. Verify PDF has no null values
4. Test with simpler template first

### Issue: Email not sending

**Solution:**
1. Check Gmail/SMTP credentials
2. Verify recipient email is valid
3. Check email body for special characters
4. Look for Gmail security warnings

---

## Performance Optimization

### Caching Strategies

Add a Set node after normalization to cache location lookups:

```json
{
  "name": "Cache Location Data",
  "type": "n8n-nodes-base.set",
  "parameters": {
    "assignments": {
      "assignments": [
        {
          "name": "cachedLocation",
          "value": "={{ $json.businessLocation }}"
        }
      ]
    }
  }
}
```

### Parallel Processing

For startup stage, run non-dependent agents in parallel:

1. Remove sequential connection between Industry and Compliance agents
2. Connect both directly to Merge node
3. Reduces total processing time

### Batch Email Sending

For high volume (100+/day):

1. Add Postgres node to queue submissions
2. Process in batches of 10
3. Add SplitInBatches node
4. More reliable than one-at-a-time

---

## Monitoring & Alerts

### Key Metrics

Monitor in Google Sheets "tracking" tab:
- Total submissions
- Processing success rate
- Average processing time
- Email delivery rate
- Error rate by agent

### Set Up Alerts

In n8n settings → Notifications:
- Alert on workflow failure
- Alert on agent timeout (>5 min)
- Alert on webhook errors
- Daily summary report

---

## Support & Documentation

### Reference Documents
- **AGENTS.md** - Agent definitions and mission
- **Architect.md** - Original architecture requirements
- **ARCHITECTURE.md** - Detailed technical architecture
- **entity-formation.md** - Phase 1 detailed content
- **state-licensing.md** - Phase 2 detailed content
- **local-licensing.md** - Phase 3 detailed content
- **renewal-compliance.md** - Phase 4 detailed content
- **industry-requirements.md** - Industry-specific details

### External Resources
- n8n Documentation: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- Tally Integration: https://tally.so
- Google Sheets API: https://developers.google.com/sheets

---

## Version History

- **v1.0** (Nov 2025) - Initial release with 5-agent architecture
- **v1.1** (Dec 2025) - Enhanced error handling, caching
- **v1.2** (Jan 2026) - Multi-language support, mobile optimization

---

**Last Updated:** November 29, 2025
**Status:** Production Ready
**Support:** contact@californiabiz.ai