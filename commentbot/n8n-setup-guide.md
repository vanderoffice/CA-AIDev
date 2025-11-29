# n8n Setup Guide - Public Comment Analysis Multi-Agent System

## Complete Installation & Configuration Guide

This guide walks you through setting up the entire multi-agent system in n8n from scratch.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Configuration](#database-configuration)
4. [Credentials Setup](#credentials-setup)
5. [Workflow Import](#workflow-import)
6. [Workflow Configuration](#workflow-configuration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services

✅ **n8n Instance**
- Option A: n8n Cloud (https://n8n.io) - Recommended for beginners
- Option B: Self-hosted n8n (Docker, npm, or desktop app)

✅ **PostgreSQL Database**
- Version 12 or higher
- Can be local, cloud-hosted (AWS RDS, Google Cloud SQL, etc.), or managed (ElephantSQL, Supabase)

✅ **LLM Provider API Keys** (at least one):
- OpenAI API key (https://platform.openai.com/api-keys)
- Anthropic API key (https://console.anthropic.com/)
- Google AI API key (https://makersuite.google.com/app/apikey)

### Optional but Recommended

- Postman or similar tool for testing webhooks
- pgAdmin or similar PostgreSQL GUI tool

---

## Initial Setup

### Option A: n8n Cloud Setup

1. **Sign up for n8n Cloud**
   ```
   Go to: https://n8n.io
   Click "Start for free"
   Complete registration
   ```

2. **Access your n8n instance**
   - You'll receive a unique URL: `https://your-workspace.app.n8n.cloud`
   - Bookmark this URL

### Option B: Self-Hosted Setup (Docker)

1. **Install Docker** (if not already installed)
   ```bash
   # For Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install docker.io docker-compose
   
   # For macOS
   brew install docker docker-compose
   ```

2. **Run n8n container**
   ```bash
   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -v ~/.n8n:/home/node/.n8n \
     n8nio/n8n
   ```

3. **Access n8n**
   - Open browser to: `http://localhost:5678`
   - Complete initial setup wizard

---

## Database Configuration

### Step 1: Create PostgreSQL Database

**If using cloud provider (AWS RDS, Google Cloud SQL):**
- Create a new PostgreSQL instance
- Note the connection details (host, port, database name, username, password)

**If using local PostgreSQL:**
```bash
# Create database
createdb public_comments

# Or via psql
psql -U postgres
CREATE DATABASE public_comments;
\q
```

### Step 2: Run Database Schema

1. **Download the schema file** `database_schema.sql` (provided separately)

2. **Execute the schema:**

**Option A: Command line**
```bash
psql -h your-host -U your-username -d public_comments -f database_schema.sql
```

**Option B: Using n8n (easier)**
- Create a new workflow in n8n
- Add a Postgres node
- Set operation to "Execute Query"
- Paste the entire schema SQL
- Execute manually

**Option C: pgAdmin**
- Open pgAdmin
- Connect to your database
- Open Query Tool
- Paste schema SQL
- Execute

### Step 3: Verify Database Setup

Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'public_comment_analysis';
```

You should see the table listed.

---

## Credentials Setup

### PostgreSQL Credentials

1. In n8n, click **Settings** (gear icon) → **Credentials**
2. Click **"Add Credential"**
3. Search for "Postgres"
4. Fill in details:
   ```
   Name: PostgreSQL Public Comments
   Host: your-postgres-host (e.g., localhost, db.example.com)
   Port: 5432
   Database: public_comments
   User: your-username
   Password: your-password
   SSL Mode: prefer (or require for cloud databases)
   ```
5. Click **"Test connection"** to verify
6. Click **"Save"**

### OpenAI Credentials

1. Add new credential → Search "OpenAI"
2. Fill in:
   ```
   Name: OpenAI API
   API Key: sk-proj-... (your key)
   ```
3. Save

### Anthropic Credentials (Optional)

1. Add new credential → Search "Anthropic"
2. Fill in:
   ```
   Name: Anthropic API
   API Key: sk-ant-... (your key)
   ```
3. Save

### Google AI Credentials (Optional)

1. Add new credential → Search "Google Palm" or "Google AI"
2. Fill in:
   ```
   Name: Google AI API
   API Key: AIza... (your key)
   ```
3. Save

---

## Workflow Import

### Import Order (Important!)

Import workflows in this specific order to avoid dependency issues:

1. **Legal Agent Workflow** (no dependencies)
2. **Scientific Agent Workflow** (no dependencies)
3. **Database Writer Workflow** (no dependencies)
4. **Main Agent Workflow** (depends on all above)

### Import Steps

1. **Download workflow JSON files:**
   - `legal-agent-workflow.json`
   - `scientific-workflow.json`
   - `database-workflow.json`
   - `main-agent-workflow.json`

2. **Import each workflow:**
   - In n8n, click **Workflows** tab
   - Click **"Import from File"** or **"Add workflow"** → **"Import from File"**
   - Select the JSON file
   - Click **"Import"**

3. **Repeat for all four workflows**

### After Import

You should now have 4 workflows in your n8n instance:
- Legal Agent Sub-Workflow
- Scientific Agent Sub-Workflow
- Database Writer Workflow
- Main Agent - Public Comment Analysis

---

## Workflow Configuration

### Configure Sub-Workflows First

#### 1. Legal Agent Workflow

1. Open "Legal Agent Sub-Workflow"
2. Click on the **"Anthropic Chat Model"** node
3. Select your Anthropic credentials (or change to OpenAI if preferred)
4. Verify the system prompt is correct
5. **Activate the workflow** (toggle in top right)
6. **Note the workflow ID** (in the URL or workflow settings)

#### 2. Scientific Agent Workflow

1. Open "Scientific Agent Sub-Workflow"
2. Click on the **"Google Gemini Model"** node
3. Select your Google AI credentials (or change to OpenAI if preferred)
4. Verify the system prompt is correct
5. **Activate the workflow**
6. **Note the workflow ID**

#### 3. Database Writer Workflow

1. Open "Database Writer Workflow"
2. Click on the **"Insert/Update Analysis Result"** node
3. Select your PostgreSQL credentials
4. Verify the SQL query syntax
5. **Optional**: Remove or configure the "Log Error" node
6. **Activate the workflow**
7. **Note the workflow ID**

### Configure Main Workflow

#### 1. Update Workflow References

1. Open "Main Agent - Public Comment Analysis"
2. Find the **"Call Legal Agent Workflow"** node
3. Click to edit
4. In "Workflow ID" field, enter the Legal Agent workflow ID
5. Repeat for **"Call Scientific Agent Workflow"** (use Scientific workflow ID)
6. Repeat for **"Save to Database"** (use Database Writer workflow ID)

#### 2. Configure LLM Models

**Main Agent - Routing Decision:**
1. Click on the "OpenAI Chat Model" node connected to "Main Agent - Routing Decision"
2. Select your OpenAI credentials
3. Verify model is "gpt-4o" or change to preferred model
4. Adjust temperature (0.7 recommended)

**Main Agent - Synthesis:**
1. Click on the "OpenAI Chat Model" node connected to "Main Agent - Synthesis"
2. Select your OpenAI credentials
3. Verify model is "gpt-4o"
4. Adjust max tokens if needed (1000 recommended)

#### 3. Webhook Configuration

1. Click on the **"Webhook"** node at the start
2. Note the webhook URL (e.g., `https://your-instance.app.n8n.cloud/webhook/public-comment`)
3. **Keep this URL** - you'll use it to submit comments

#### 4. Activate Main Workflow

1. Click the **Activate** toggle in the top right
2. Workflow should now show as "Active"

---

## Testing

### Test Sub-Workflows Independently

#### Test Legal Agent

1. Open Legal Agent workflow
2. Click **"Execute Workflow"** button
3. In the "Execute Workflow Trigger" node, click **"Add test data"**
4. Paste:
   ```json
   {
     "comment_id": "TEST-001",
     "comment_text": "This regulation violates the Clean Air Act Section 112(b)."
   }
   ```
5. Click **"Execute node"**
6. Verify output contains legal assessment

#### Test Scientific Agent

1. Open Scientific Agent workflow
2. Add test data:
   ```json
   {
     "comment_id": "TEST-002",
     "comment_text": "Studies show that PM2.5 levels exceed safe thresholds by 40%."
   }
   ```
3. Execute and verify scientific assessment

#### Test Database Writer

1. Open Database Writer workflow
2. Add test data:
   ```json
   {
     "comment_id": "TEST-003",
     "group_id": "TEST-GROUP",
     "original_comment_text": "Test comment",
     "main_agent_summary": "Test summary",
     "main_agent_recommendation": "Test recommendation",
     "legal_assessment": null,
     "scientific_assessment": null
   }
   ```
3. Execute and verify database insert
4. Check PostgreSQL:
   ```sql
   SELECT * FROM public_comment_analysis WHERE comment_id = 'TEST-003';
   ```

### Test Complete System via Webhook

#### Using Postman

1. Create a new POST request
2. URL: Your webhook URL (from Main Workflow)
3. Headers:
   ```
   Content-Type: application/json
   ```
4. Body (raw JSON):
   ```json
   {
     "comment_id": "COM-2024-TEST",
     "group_id": "GRP-TEST",
     "comment_text": "The proposed regulation violates the Clean Air Act Section 112(b) by failing to address hazardous air pollutants. According to EPA's 2023 data, particulate matter emissions exceed safe levels by 40%."
   }
   ```
5. Send request
6. Verify response includes analysis

#### Using curl

```bash
curl -X POST "https://your-instance.app.n8n.cloud/webhook/public-comment" \
  -H "Content-Type: application/json" \
  -d '{
    "comment_id": "COM-2024-TEST",
    "group_id": "GRP-TEST",
    "comment_text": "This regulation violates federal law and ignores scientific evidence."
  }'
```

### Verify in n8n

1. Go to **Executions** tab in n8n
2. Find your workflow execution
3. Click to view detailed execution log
4. Verify each node executed successfully
5. Check data flowing between nodes

### Verify in Database

```sql
SELECT 
  comment_id, 
  main_agent_summary, 
  legal_assessment, 
  scientific_assessment,
  created_at
FROM public_comment_analysis
ORDER BY created_at DESC
LIMIT 5;
```

---

## Troubleshooting

### Webhook Returns Error

**Problem**: 404 or webhook not found

**Solutions**:
- Verify workflow is **Activated**
- Check webhook path matches your request
- Ensure production webhook is enabled (not test mode)

### Sub-Workflow Not Executing

**Problem**: Main workflow doesn't call sub-workflows

**Solutions**:
- Verify sub-workflows are **Activated**
- Check workflow IDs are correct in "Execute Workflow" nodes
- Ensure "Wait for completion" is enabled
- Check sub-workflow permissions

### Database Write Fails

**Problem**: Error saving to PostgreSQL

**Solutions**:
- Test PostgreSQL connection in credentials
- Verify table exists: `SELECT * FROM public_comment_analysis LIMIT 1;`
- Check SQL syntax in Postgres node
- Ensure all required fields are provided
- Check for special characters in comment text (escape quotes)

### LLM API Errors

**Problem**: 401 Unauthorized or API errors

**Solutions**:
- Verify API keys are correct and active
- Check you have sufficient credits/quota
- Test credentials in n8n credential manager
- Try switching to a different model temporarily

### Agent Returns "No Comment" Incorrectly

**Problem**: Sub-agent doesn't detect content it should

**Solutions**:
- Review and refine system prompts
- Adjust temperature setting (try 0.5-0.8)
- Try a different LLM model
- Check that comment text is properly passed to agent

### Slow Execution

**Problem**: Workflow takes too long

**Solutions**:
- Use faster models (gpt-4o-mini, Claude Haiku)
- Reduce max_tokens settings
- Check database connection latency
- Consider enabling parallel execution for sub-agents

---

## Post-Setup Checklist

- [ ] All four workflows imported successfully
- [ ] PostgreSQL credentials configured and tested
- [ ] At least one LLM provider credential configured
- [ ] Database schema executed successfully
- [ ] Legal Agent workflow activated and tested
- [ ] Scientific Agent workflow activated and tested
- [ ] Database Writer workflow activated and tested
- [ ] Main workflow configured with correct sub-workflow IDs
- [ ] Main workflow activated
- [ ] Webhook URL noted and accessible
- [ ] Test comment processed successfully end-to-end
- [ ] Data verified in PostgreSQL database

---

## Next Steps

1. **Process sample comments** using provided `sample_comments.json`
2. **Monitor executions** in n8n dashboard
3. **Optimize prompts** based on results
4. **Set up error notifications** (email, Slack)
5. **Implement authentication** on webhook for production use
6. **Scale up** with rate limiting and queueing as needed

---

## Support Resources

- n8n Documentation: https://docs.n8n.io
- n8n Community Forum: https://community.n8n.io
- PostgreSQL Docs: https://www.postgresql.org/docs/
- OpenAI API Docs: https://platform.openai.com/docs
- Anthropic API Docs: https://docs.anthropic.com
- Google AI Docs: https://ai.google.dev/docs

---

**Your multi-agent public comment analysis system is now ready to use!**
