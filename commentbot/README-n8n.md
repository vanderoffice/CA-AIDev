# Public Comment Analysis Multi-Agent System - n8n Implementation

A sophisticated n8n workflow implementing a multi-agent system to analyze public comments for state government agencies using AI agents with specialized legal and scientific analysis capabilities.

## Overview

This n8n implementation uses a **supervisor-subordinate agent pattern** where:
- **Main Agent Workflow**: Orchestrates the entire process, routes to specialized agents
- **Legal Agent Workflow**: Evaluates legal arguments (separate sub-workflow)
- **Scientific Agent Workflow**: Analyzes scientific claims (separate sub-workflow)
- **Database Workflow**: Formats and stores results in PostgreSQL

All agents are connected through n8n's **Workflow Tool** and **AI Agent** nodes, enabling intelligent task delegation and response synthesis.

## Architecture

```
Webhook Trigger → Main Agent (Supervisor)
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
   Legal Agent                Scientific Agent
   (Sub-Workflow)             (Sub-Workflow)
        ↓                           ↓
        └─────────────┬─────────────┘
                      ↓
              Main Agent Synthesis
                      ↓
              Database Workflow
                      ↓
              PostgreSQL Storage
```

## Key Features

✅ **Visual Workflow Design** - No coding required, drag-and-drop interface
✅ **Multi-Agent Orchestration** - Supervisor delegates to specialized sub-agents
✅ **LLM Flexibility** - Supports OpenAI, Anthropic, Google models per agent
✅ **Parallel Execution** - Sub-agents run simultaneously for efficiency
✅ **PostgreSQL Integration** - Built-in database node for structured storage
✅ **Error Handling** - Built-in retry logic and error branches
✅ **Webhook Trigger** - REST API endpoint for comment submission
✅ **Monitoring & Logging** - Built-in execution history and logs

## Prerequisites

- n8n instance (self-hosted or cloud)
- PostgreSQL database (local or cloud-hosted)
- API keys for at least one LLM provider:
  - OpenAI API key
  - Anthropic API key
  - Google AI API key

## Installation & Setup

### Step 1: Set Up n8n

**Option A: n8n Cloud**
```
1. Sign up at https://n8n.io
2. Create a new workspace
```

**Option B: Self-Hosted (Docker)**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Access n8n at `http://localhost:5678`

### Step 2: Configure Credentials

In n8n, go to **Settings → Credentials** and add:

**PostgreSQL Credentials**
- Host: Your PostgreSQL host
- Port: 5432 (default)
- Database: public_comments
- User: your_username
- Password: your_password

**OpenAI Credentials**
- API Key: Your OpenAI API key

**Anthropic Credentials** (optional)
- API Key: Your Anthropic API key

**Google AI Credentials** (optional)
- API Key: Your Google AI API key

### Step 3: Set Up PostgreSQL Database

Run the provided SQL schema in your PostgreSQL database:

```bash
psql -U your_username -d public_comments -f database_schema.sql
```

Or use n8n's Postgres node to execute the schema.

### Step 4: Import n8n Workflows

Import the provided workflow JSON files in this order:
1. `legal_agent_workflow.json` - Legal analysis sub-workflow
2. `scientific_agent_workflow.json` - Scientific analysis sub-workflow
3. `database_writer_workflow.json` - Database persistence workflow
4. `main_agent_workflow.json` - Main supervisor workflow

## Workflow Structure

### 1. Main Agent Workflow (Supervisor)

**Purpose**: Orchestrate the entire analysis process

**Nodes**:
1. **Webhook Trigger** - Receives comment data via POST request
2. **Set Variables** - Extracts comment_id, group_id, comment_text
3. **AI Agent (Main)** - Analyzes comment and determines routing
   - Model: GPT-4o or Claude 3.5 Sonnet
   - Tools: Legal Agent Tool, Scientific Agent Tool
4. **Function** - Parse routing decision
5. **Workflow Tool: Legal Agent** (conditional) - Calls legal sub-workflow
6. **Workflow Tool: Scientific Agent** (conditional) - Calls scientific sub-workflow
7. **AI Agent (Synthesis)** - Combines all findings into final assessment
8. **Workflow Tool: Database Writer** - Saves results to PostgreSQL
9. **Respond to Webhook** - Returns success/failure status

### 2. Legal Agent Workflow

**Purpose**: Analyze legal arguments and regulatory compliance

**Nodes**:
1. **Workflow Trigger** - Activated by main workflow
2. **AI Agent (Legal Specialist)**
   - Model: Claude 3.5 Sonnet (recommended for legal reasoning)
   - System Prompt: Legal analysis instructions
   - Output: Legal assessment or "No Comment"
3. **Function** - Format response
4. **Return** - Send results back to main workflow

### 3. Scientific Agent Workflow

**Purpose**: Evaluate scientific claims and evidence

**Nodes**:
1. **Workflow Trigger** - Activated by main workflow
2. **AI Agent (Scientific Specialist)**
   - Model: Gemini 1.5 Pro (recommended for scientific analysis)
   - System Prompt: Scientific evaluation instructions
   - Output: Scientific assessment or "No Comment"
3. **Function** - Format response
4. **Return** - Send results back to main workflow

### 4. Database Writer Workflow

**Purpose**: Store analysis results in PostgreSQL

**Nodes**:
1. **Workflow Trigger** - Receives complete analysis data
2. **Postgres Node**
   - Operation: Insert or Update
   - Table: public_comment_analysis
   - Conflict Resolution: Update on comment_id conflict
3. **Function** - Log success/failure
4. **Return** - Confirmation status

## Configuration Details

### Main Agent System Prompt

```
You are the main coordinator for a public comment analysis system.

Your role is to:
1. Understand the context and main themes of the public comment
2. Determine if the comment contains legal arguments or scientific claims
3. Decide which specialized agents to call (legal, scientific, both, or neither)
4. After receiving sub-agent feedback, synthesize all findings into a cohesive summary and recommendation

Be thorough but concise. Focus on actionable insights that help government staff prioritize their response efforts.

When analyzing a comment, first determine:
- Does this contain legal arguments, citations, or regulatory concerns? (Call Legal Agent)
- Does this contain scientific claims, data, or evidence? (Call Scientific Agent)

Output your routing decision clearly before calling any tools.
```

### Legal Agent System Prompt

```
You are a legal expert analyzing public comments submitted to government agencies.

Your role is to:
1. Identify any legal arguments, citations, or regulatory references in the comment
2. Assess the validity and merit of legal claims made
3. Evaluate potential regulatory compliance issues
4. Provide a concise analysis and suggested reply strategy

If the comment contains NO legal arguments, citations, or regulatory issues, respond with exactly: "No Comment"

If the comment does contain legal content, provide your response in the following format:
- Legal Issues: [1-2 sentence summary of legal arguments/citations]
- Validity Assessment: [1-2 sentence evaluation of claim merit]
- Suggested Reply: [1-2 sentence recommendation for response]

Keep your total response to 5 sentences or fewer (excluding "No Comment" responses).
Be specific and reference actual statutes, regulations, or legal principles mentioned.
```

### Scientific Agent System Prompt

```
You are a scientific expert analyzing public comments submitted to government agencies.

Your role is to:
1. Identify any scientific claims, data, or evidence presented in the comment
2. Evaluate the quality and credibility of scientific arguments
3. Assess methodologies, data sources, and scientific reasoning
4. Provide a concise analysis and suggested evidence-based reply

If the comment contains NO scientific claims, data, or evidence, respond with exactly: "No Comment"

If the comment does contain scientific content, provide your response in the following format:
- Scientific Claims: [1-2 sentence summary of scientific arguments/data]
- Validity Assessment: [1-2 sentence evaluation of evidence quality and methodology]
- Suggested Reply: [1-2 sentence recommendation for evidence-based response]

Keep your total response to 5 sentences or fewer (excluding "No Comment" responses).
Be specific and reference actual studies, data, or scientific principles mentioned.
```

## Database Schema

The PostgreSQL table structure:

```sql
CREATE TABLE public_comment_analysis (
    comment_id VARCHAR(100) PRIMARY KEY,
    group_id VARCHAR(100) NOT NULL,
    original_comment_text TEXT NOT NULL,
    main_agent_summary TEXT NOT NULL,
    main_agent_recommendation TEXT NOT NULL,
    legal_assessment TEXT,
    scientific_assessment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Usage

### Submit a Comment via Webhook

**Endpoint**: `https://your-n8n-instance.com/webhook/public-comment`

**Method**: POST

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "comment_id": "COM-2024-001",
  "group_id": "GRP-ENV-001",
  "comment_text": "The proposed regulation violates the Clean Air Act Section 112(b)..."
}
```

**Response**:
```json
{
  "success": true,
  "comment_id": "COM-2024-001",
  "message": "Analysis complete and saved to database",
  "main_agent_summary": "...",
  "main_agent_recommendation": "...",
  "legal_assessment": "...",
  "scientific_assessment": "..."
}
```

### Testing with Sample Comments

Use the provided `sample_comments.json` file to test various scenarios:
- Comments with legal content only
- Comments with scientific content only
- Comments with both legal and scientific content
- Simple support comments (no specialized analysis needed)

### Monitoring Executions

1. Go to **Executions** in n8n dashboard
2. View detailed logs for each workflow run
3. Inspect input/output data at each node
4. Debug errors with built-in error handling

## Best Practices for n8n Implementation

### Agent Design
✅ **Use Sub-Workflows** for each specialized agent (better organization and reusability)
✅ **Implement Memory Nodes** if agents need to maintain context across multiple requests
✅ **Add Error Handling** branches for failed API calls or invalid inputs
✅ **Set Timeouts** on AI Agent nodes (30-60 seconds recommended)
✅ **Use Workflow Tools** instead of HTTP requests for calling sub-workflows (more reliable)

### Performance
✅ **Enable Parallel Execution** for sub-agent calls when both are needed
✅ **Use Connection Pooling** for PostgreSQL nodes
✅ **Implement Rate Limiting** if processing high volumes
✅ **Cache Results** for duplicate comments using n8n's built-in memory

### Security
✅ **Store Credentials Securely** using n8n's credential system
✅ **Validate Webhook Input** with Function nodes before processing
✅ **Use HTTPS** for webhook endpoints in production
✅ **Implement Authentication** on webhooks (API keys or OAuth)

### Monitoring
✅ **Enable Execution Logging** for all workflows
✅ **Set Up Error Notifications** (email, Slack) for failed executions
✅ **Monitor Database Writes** to ensure data integrity
✅ **Track API Usage** for each LLM provider to manage costs

## Customization Options

### Adding New Sub-Agents

1. Create a new workflow with a Workflow Trigger
2. Add an AI Agent node with specialized instructions
3. Add the workflow as a Tool in the main agent
4. Update main agent prompt to route to the new agent

### Changing LLM Models

Edit each AI Agent node:
- **Main Agent**: GPT-4o, Claude 3.5 Sonnet, or Gemini 1.5 Pro
- **Legal Agent**: Claude 3 Opus (best reasoning) or GPT-4o
- **Scientific Agent**: Gemini 1.5 Pro (best for technical content) or GPT-4o

### Modifying Database Schema

1. Update schema in PostgreSQL
2. Modify Postgres node configurations in Database Writer workflow
3. Update data mapping in Function nodes

## Troubleshooting

### Webhook Not Receiving Requests
- Check webhook URL is correct and accessible
- Verify firewall settings allow incoming requests
- Test with curl or Postman

### Agent Not Calling Sub-Workflows
- Ensure sub-workflows are active (not in draft mode)
- Check Workflow Tool configuration has correct workflow ID
- Verify main agent has access to call sub-workflows

### Database Writes Failing
- Verify PostgreSQL credentials are correct
- Check database connection from n8n
- Ensure table exists and schema matches
- Review error logs in execution history

### LLM API Errors
- Verify API keys are valid and have sufficient credits
- Check rate limits haven't been exceeded
- Ensure model names are spelled correctly
- Try switching to a different model temporarily

## Cost Optimization

- Use **GPT-4o-mini** for the main agent to reduce costs (faster and cheaper)
- Use **Claude 3 Haiku** for simple routing decisions
- Implement **caching** to avoid re-analyzing duplicate comments
- Set **max tokens** limits on all AI Agent nodes
- Monitor usage through n8n's execution statistics

## Advanced Features

### Human-in-the-Loop Approval

Add a **Wait for Webhook** node or **Manual Approval** before database write to review high-priority comments.

### Multi-Language Support

Add a **Translation Agent** sub-workflow to handle non-English comments before analysis.

### Sentiment Analysis

Add a **Sentiment Agent** to gauge commenter emotions and urgency.

### Automated Replies

Connect a **Reply Generator Agent** that drafts responses based on the analysis.

## Support & Resources

- n8n Documentation: https://docs.n8n.io
- n8n Community Forum: https://community.n8n.io
- AI Agent Examples: https://n8n.io/workflows
- PostgreSQL Integration Guide: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/

## Files Included

1. `README_n8n.md` - This file
2. `main_agent_workflow.json` - Main supervisor workflow
3. `legal_agent_workflow.json` - Legal sub-agent workflow
4. `scientific_agent_workflow.json` - Scientific sub-agent workflow
5. `database_writer_workflow.json` - Database persistence workflow
6. `database_schema.sql` - PostgreSQL table schema
7. `sample_comments.json` - Test data
8. `n8n_setup_guide.md` - Detailed setup instructions
9. `workflow_configuration.md` - Node-by-node configuration guide

## Quick Start Checklist

- [ ] Install or access n8n instance
- [ ] Set up PostgreSQL database
- [ ] Add credentials in n8n (PostgreSQL + LLM providers)
- [ ] Run database schema SQL script
- [ ] Import sub-agent workflows (legal, scientific, database)
- [ ] Import main agent workflow
- [ ] Activate all workflows
- [ ] Test webhook with sample comment
- [ ] Verify data in PostgreSQL
- [ ] Set up error notifications

---

**Ready to process public comments efficiently with AI-powered analysis!**
