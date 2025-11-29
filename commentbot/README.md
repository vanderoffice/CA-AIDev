# CommentBot - Public Comment Analysis System

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production-success" alt="Production"/>
  <img src="https://img.shields.io/badge/Agents-4-blue" alt="4 Agents"/>
  <img src="https://img.shields.io/badge/Models-Multi--LLM-blueviolet" alt="Multi-LLM"/>
</p>

**A multi-agent AI system for analyzing public comments submitted to California state government agencies.**

CommentBot uses specialized legal and scientific agents to evaluate public comments during regulatory proceedings, providing staff with structured analysis and response recommendations.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Agent Details](#agent-details)
- [Quick Start](#quick-start)
- [API Usage](#api-usage)
- [Database Schema](#database-schema)
- [Configuration](#configuration)
- [Files Included](#files-included)

---

## Overview

During regulatory proceedings, California state agencies receive thousands of public comments that must be reviewed and addressed. These comments often contain:

- **Legal arguments** citing statutes, regulations, or case law
- **Scientific claims** referencing studies, data, or methodologies
- **Policy concerns** about implementation impacts
- **General support or opposition** statements

CommentBot automates the initial analysis by:

1. Classifying comment content type
2. Routing to specialized agents (legal, scientific, or both)
3. Evaluating validity and merit of arguments
4. Generating response recommendations
5. Storing structured analysis for staff review

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WEBHOOK TRIGGER                              │
│                    POST /webhook/public-comment                      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MAIN AGENT (Supervisor)                         │
│                          Model: GPT-4o                               │
│                                                                      │
│  1. Analyze comment context and themes                               │
│  2. Determine if legal/scientific content present                    │
│  3. Route to appropriate sub-agents                                  │
│  4. Synthesize findings into recommendation                          │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│      LEGAL AGENT          │   │    SCIENTIFIC AGENT        │
│   Model: Claude 3.5       │   │   Model: Gemini 1.5 Pro    │
│                           │   │                            │
│  • Identify legal args    │   │  • Identify scientific     │
│  • Validate citations     │   │    claims and data         │
│  • Assess regulatory      │   │  • Evaluate evidence       │
│    compliance             │   │    quality                 │
│  • Recommend response     │   │  • Assess methodology      │
└─────────────┬─────────────┘   └─────────────┬──────────────┘
              │                               │
              └───────────────┬───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE WORKFLOW                               │
│                        PostgreSQL Storage                            │
│                                                                      │
│  • Store original comment                                            │
│  • Store agent analyses                                              │
│  • Store recommendations                                             │
│  • Track processing status                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Agent Details

### Main Agent (Supervisor)
- **Model**: GPT-4o (fast, good at routing)
- **Role**: Orchestration and synthesis
- **Routing Logic**:
  - Legal content only → Legal Agent
  - Scientific content only → Scientific Agent
  - Both types → Both agents (parallel)
  - Neither → Direct response

### Legal Agent
- **Model**: Claude 3.5 Sonnet (strong legal reasoning)
- **Specialization**: Regulatory and statutory analysis
- **Output Format**:
  ```
  - Legal Issues: [summary of arguments/citations]
  - Validity Assessment: [evaluation of claim merit]
  - Suggested Reply: [response recommendation]
  ```
- **Returns**: "No Comment" if no legal content found

### Scientific Agent
- **Model**: Gemini 1.5 Pro (strong technical analysis)
- **Specialization**: Scientific claim evaluation
- **Output Format**:
  ```
  - Scientific Claims: [summary of arguments/data]
  - Validity Assessment: [evaluation of evidence quality]
  - Suggested Reply: [evidence-based response]
  ```
- **Returns**: "No Comment" if no scientific content found

### Database Writer
- **Role**: Structured storage of all analysis results
- **Target**: PostgreSQL with conflict resolution

---

## Quick Start

### Prerequisites

- n8n instance (self-hosted or cloud)
- PostgreSQL database
- API keys: OpenAI, Anthropic, Google AI

### Installation

1. **Set up database**
   ```bash
   psql -U postgres -d public_comments -f database-schema.sql
   ```

2. **Import workflows to n8n** (in order)
   ```
   1. legal-agent-workflow.json
   2. scientific-workflow.json
   3. database-workflow.json
   4. main-agent-workflow.json
   ```

3. **Configure credentials in n8n**
   - PostgreSQL connection
   - OpenAI API key (for main agent)
   - Anthropic API key (for legal agent)
   - Google AI API key (for scientific agent)

4. **Activate all workflows**

5. **Test with sample data**
   ```bash
   curl -X POST https://your-n8n/webhook/public-comment \
     -H "Content-Type: application/json" \
     -d @sample-comments.json
   ```

---

## API Usage

### Submit a Comment

**Endpoint**: `POST /webhook/public-comment`

**Request Body**:
```json
{
  "comment_id": "COM-2024-001",
  "group_id": "GRP-ENV-001",
  "comment_text": "The proposed regulation violates the Clean Air Act Section 112(b). Studies by Smith et al. (2023) show that the emission standards are insufficient to protect public health, with particulate matter levels exceeding WHO guidelines by 40%."
}
```

**Response**:
```json
{
  "success": true,
  "comment_id": "COM-2024-001",
  "message": "Analysis complete and saved to database",
  "main_agent_summary": "Comment contains both legal and scientific arguments...",
  "main_agent_recommendation": "Recommend detailed response addressing both...",
  "legal_assessment": "Legal Issues: Cites Clean Air Act Section 112(b)...",
  "scientific_assessment": "Scientific Claims: References Smith et al. (2023)..."
}
```

---

## Database Schema

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

-- Indexes for common queries
CREATE INDEX idx_group_id ON public_comment_analysis(group_id);
CREATE INDEX idx_created_at ON public_comment_analysis(created_at);
```

---

## Configuration

### Agent System Prompts

Located in [README-n8n.md](./README-n8n.md), key sections:

- Main Agent: Routing logic and synthesis instructions
- Legal Agent: Legal analysis guidelines
- Scientific Agent: Evidence evaluation criteria

### Model Selection

| Agent | Default | Alternative | Notes |
|-------|---------|-------------|-------|
| Main | GPT-4o | Claude 3.5 | Fast routing |
| Legal | Claude 3.5 | GPT-4 | Strong reasoning |
| Scientific | Gemini 1.5 Pro | GPT-4 | Technical depth |

### Performance Tuning

```yaml
# Recommended settings
DOWNLOAD_TIMEOUT: 30s
MAX_TOKENS: 500  # Per agent response
PARALLEL_EXECUTION: true
RETRY_ON_FAILURE: 3
```

---

## Files Included

| File | Purpose |
|------|---------|
| `README.md` | This file |
| `README-n8n.md` | Detailed n8n implementation guide |
| `n8n-setup-guide.md` | Step-by-step setup instructions |
| `n8n-FILE-MANIFEST.md` | Complete file listing |
| `main-agent-workflow.json` | Main supervisor workflow |
| `legal-agent-workflow.json` | Legal analysis sub-workflow |
| `scientific-workflow.json` | Scientific analysis sub-workflow |
| `database-workflow.json` | PostgreSQL persistence workflow |
| `database-schema.sql` | PostgreSQL table definitions |
| `sample-comments.json` | Test data for validation |

---

## Test Scenarios

The `sample-comments.json` includes test cases for:

1. **Legal only**: Comments citing regulations/statutes
2. **Scientific only**: Comments with data/studies
3. **Both**: Mixed legal and scientific arguments
4. **Neither**: Simple support/opposition statements

---

## Best Practices

### Agent Design
- Use sub-workflows for each specialist (better organization)
- Set timeouts on AI Agent nodes (30-60 seconds)
- Add error handling branches for API failures

### Performance
- Enable parallel execution for sub-agents
- Implement caching for duplicate comments
- Set max token limits to control costs

### Security
- Store credentials in n8n's credential system
- Validate webhook input before processing
- Use HTTPS for webhook endpoints

### Monitoring
- Enable execution logging for all workflows
- Set up error notifications (email/Slack)
- Track API usage for cost management

---

## Cost Optimization

| Strategy | Impact |
|----------|--------|
| Use GPT-4o-mini for routing | 50% reduction on main agent |
| Cache duplicate comments | Variable savings |
| Set max_tokens limits | Predictable costs |
| Batch similar comments | Reduced API calls |

**Estimated cost per comment**: ~$0.15

---

## Related Resources

- [BizBot](../bizbot/) - Similar multi-agent architecture
- [n8n Documentation](https://docs.n8n.io/)
- [n8n AI Agent Examples](https://n8n.io/workflows)

---

*Streamlining public comment analysis for California government agencies*
