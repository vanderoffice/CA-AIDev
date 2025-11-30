# WiseBot Knowledge Ingestion System

A comprehensive n8n-based document ingestion and retrieval system that processes email attachments, extracts content, generates embeddings, and provides intelligent knowledge retrieval via a unified gateway.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Setup Instructions](#setup-instructions)
5. [Configuration](#configuration)
6. [Workflow Reference](#workflow-reference)
7. [Database Schema](#database-schema)
8. [Knowledge Gateway API](#knowledge-gateway-api)
9. [Operations Guide](#operations-guide)
10. [Troubleshooting](#troubleshooting)

---

## Overview

WiseBot is a knowledge ingestion pipeline that:

- **Monitors Gmail** for emails with a configurable subject line (default: `WiseBotMindMeld`)
- **Processes attachments** across multiple formats:
  - **Text:** PDF, DOCX, MD
  - **Audio:** MP3 (transcribed via Whisper)
  - **Image:** JPG, BMP (OCR + Vision AI)
  - **Tabular:** CSV, XLSX, JSON
- **Deduplicates** using file hashes and embedding similarity
- **Chunks and embeds** content for semantic search
- **Stores** everything in Supabase with pgvector
- **Provides** a unified Knowledge Gateway for retrieval
- **Monitors** system health with automated alerts

### Key Features

| Feature | Description |
|---------|-------------|
| Multi-format support | Audio, image, text, and tabular data |
| Smart deduplication | Hash-based exact + embedding-based fuzzy matching |
| Configurable chunking | Sentence-aware chunking with overlap |
| Pluggable embeddings | OpenAI (default), easily swappable |
| RAG-ready gateway | Vector search + optional LLM synthesis |
| Operational monitoring | Health checks, alerts, daily summaries |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           EMAIL INGESTION FLOW                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Gmail ──► Main Workflow ──► Dedup ──► Parse ──► Embed ──► Store        │
│    │           │                │        │         │         │           │
│    │           │                │        │         │         │           │
│    ▼           ▼                ▼        ▼         ▼         ▼           │
│  Trigger   Orchestrate      Hash +    Docling   OpenAI   Supabase       │
│            & Summary        Check     Whisper   Embed    pgvector       │
│                             Supabase  Vision                             │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                         KNOWLEDGE RETRIEVAL FLOW                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Agent/User ──► Knowledge Gateway ──► Embed Query ──► Vector Search     │
│       │              │                     │              │               │
│       │              ▼                     ▼              ▼               │
│       │         Webhook POST          OpenAI API     Supabase RPC        │
│       │              │                                   │               │
│       │              ▼                                   ▼               │
│       └────────── Response ◄─────── (Optional) ◄─── Matched Chunks      │
│                                    Anthropic                             │
│                                    Synthesis                             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Workflow Files

| File | Purpose |
|------|---------|
| `wisebot_ingest_email_n8n.json` | Main orchestrator workflow |
| `wisebot_parse_normalize_n8n.json` | Document parsing sub-workflow |
| `wisebot_dedup_hash_n8n.json` | Deduplication sub-workflow |
| `wisebot_embed_store_n8n.json` | Embedding & storage sub-workflow |
| `wisebot_knowledge_gateway_n8n.json` | Retrieval API workflow |
| `wisebot_ops_dashboard_n8n.json` | Operations monitoring workflow |

---

## Prerequisites

### Required Services

1. **n8n** (self-hosted or cloud) - v1.0+ recommended
2. **Supabase** project with:
   - PostgreSQL database
   - pgvector extension enabled
3. **OpenAI** API account (for embeddings & Whisper)
4. **Anthropic** API account (for summaries & RAG answers)
5. **Docling** service (for document parsing) - or compatible alternative

### Optional Services

- **Google Cloud Vision** (enhanced OCR)
- **Deepgram** (alternative STT)

---

## Setup Instructions

### Step 1: Supabase Database Setup

1. Log into your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `wisebot_knowledge_schema.sql`
4. Execute the entire script

**Important:** Ensure pgvector extension is enabled first:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Verify the setup:
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE '%document%';

-- Check vector extension
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Step 2: n8n Credential Setup

Create the following credentials in n8n:

#### Gmail OAuth2
1. Go to **Settings → Credentials → Add Credential**
2. Select **Gmail OAuth2**
3. Follow OAuth flow to authorize
4. Note the credential ID

#### Supabase
1. Add **Supabase** credential
2. Enter your Supabase URL: `https://[PROJECT_ID].supabase.co`
3. Enter your service role key (from Project Settings → API)

#### OpenAI
1. Add **OpenAI** credential
2. Enter your API key

#### Anthropic
1. Add **Anthropic** credential
2. Enter your API key

### Step 3: Import Workflows

1. Go to **Workflows** in n8n
2. Click **Import from File**
3. Import each workflow JSON file in this order:
   1. `wisebot_dedup_hash_n8n.json`
   2. `wisebot_parse_normalize_n8n.json`
   3. `wisebot_embed_store_n8n.json`
   4. `wisebot_ingest_email_n8n.json`
   5. `wisebot_knowledge_gateway_n8n.json`
   6. `wisebot_ops_dashboard_n8n.json`

### Step 4: Update Credential References

After importing, update each workflow's credential references:

1. Open each workflow
2. Click on nodes that use credentials (Gmail, Supabase, OpenAI, Anthropic)
3. Select your actual credentials from the dropdown
4. Save the workflow

### Step 5: Configure Environment Variables

Set these environment variables in n8n:

```bash
# Required
SUPABASE_URL=https://[PROJECT_ID].supabase.co

# Email Configuration
WISEBOT_EMAIL_SUBJECT=WiseBotMindMeld
WISEBOT_OPS_EMAIL=ops@yourcompany.com

# Embedding Configuration
WISEBOT_EMBEDDING_MODEL=text-embedding-3-small
WISEBOT_CHUNK_SIZE=1000
WISEBOT_CHUNK_OVERLAP=200
WISEBOT_SIMILARITY_THRESHOLD=0.85

# Optional: Docling Service
DOCLING_API_URL=http://localhost:8080
```

### Step 6: Activate Workflows

1. **First**, activate sub-workflows:
   - `wisebot_dedup_hash`
   - `wisebot_parse_normalize`
   - `wisebot_embed_store`

2. **Then**, activate main workflows:
   - `wisebot_ingest_email`
   - `wisebot_knowledge_gateway`
   - `wisebot_ops_dashboard`

---

## Configuration

### Email Subject Filter

Change the email subject that triggers ingestion:

**Option 1:** Environment variable
```bash
WISEBOT_EMAIL_SUBJECT=MyCustomSubject
```

**Option 2:** Database configuration
```sql
UPDATE wisebot_config
SET value = '"MyCustomSubject"'
WHERE key = 'email_subject_filter';
```

### Embedding Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `WISEBOT_EMBEDDING_MODEL` | `text-embedding-3-small` | OpenAI embedding model |
| `WISEBOT_CHUNK_SIZE` | `1000` | Characters per chunk |
| `WISEBOT_CHUNK_OVERLAP` | `200` | Overlap between chunks |
| `WISEBOT_SIMILARITY_THRESHOLD` | `0.85` | Fuzzy duplicate threshold |

### Switching Embedding Providers

To use a different embedding provider:

1. Modify `wisebot_embed_store_n8n.json`
2. Replace the OpenAI embedding node with your provider
3. Update the vector dimension in `wisebot_knowledge_schema.sql` if different
4. Re-run the schema migration

---

## Workflow Reference

### Main Ingestion Workflow

**Trigger:** Gmail poll (every 5 minutes)

**Flow:**
1. Check for unread emails with subject filter
2. Extract attachments and metadata
3. For each attachment:
   - Compute SHA-256 hash
   - Check for exact duplicates
   - If unique: parse → embed → store
   - If fuzzy duplicate: flag and continue
4. Generate Anthropic summary
5. Mark email as read

### Knowledge Gateway Workflow

**Endpoint:** `POST /webhook/wisebot/knowledge`

**Request:**
```json
{
  "query": "What are the Q3 revenue projections?",
  "agent_id": "sales-agent-001",
  "top_k": 10,
  "filters": {
    "doc_type": "tabular",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  },
  "include_answer": true,
  "context_only": false
}
```

**Response:**
```json
{
  "success": true,
  "request_id": "req_1234567890_abc",
  "query": "What are the Q3 revenue projections?",
  "matched_chunks": [
    {
      "chunk_id": "uuid",
      "document_id": "uuid",
      "text": "Q3 revenue projections show...",
      "similarity_score": 0.9234,
      "metadata": {
        "file_name": "Q3_Forecast.xlsx",
        "doc_type": "tabular",
        "uploader_email": "finance@company.com"
      }
    }
  ],
  "result_count": 10,
  "answer": "Based on the Q3 forecast document, revenue projections are..."
}
```

### Operations Dashboard

**Schedule:** Every 6 hours

**Checks:**
- Database connectivity
- Failed executions (last 6h)
- Document/chunk counts
- Duplicate detection stats

**Alerts:**
- **Critical:** Immediate email on system failure
- **Summary:** Daily email with metrics

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `documents` | Main document metadata |
| `documents_text` | Text-specific data |
| `documents_audio` | Audio transcriptions |
| `documents_image` | Image OCR/descriptions |
| `documents_tabular` | Tabular structure data |
| `document_chunks` | Embedded text chunks |

### Operational Tables

| Table | Purpose |
|-------|---------|
| `ingestion_logs` | Processing audit trail |
| `duplicate_detections` | Duplicate detection log |
| `ops_health_checks` | Health check history |
| `wisebot_config` | Runtime configuration |

### Key Functions

```sql
-- Search similar chunks
SELECT * FROM search_similar_chunks(
  query_embedding := '[0.1, 0.2, ...]'::vector,
  match_count := 10,
  filter_doc_type := 'text',
  filter_start_date := '2024-01-01'
);

-- Check for duplicates
SELECT * FROM check_file_duplicate('sha256hash...');

-- Find fuzzy duplicates
SELECT * FROM find_fuzzy_duplicates(
  p_document_id := 'uuid',
  p_threshold := 0.85
);
```

---

## Knowledge Gateway API

### Endpoint

```
POST https://[your-n8n-url]/webhook/wisebot/knowledge
```

### Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search query |
| `agent_id` | string | No | null | Calling agent identifier |
| `top_k` | integer | No | 10 | Number of results (1-50) |
| `filters.doc_type` | string | No | null | Filter by document type |
| `filters.start_date` | ISO date | No | null | Filter by date range |
| `filters.end_date` | ISO date | No | null | Filter by date range |
| `include_answer` | boolean | No | false | Generate LLM answer |
| `context_only` | boolean | No | false | Return context prompt only |

### Example: Basic Search

```bash
curl -X POST https://your-n8n/webhook/wisebot/knowledge \
  -H "Content-Type: application/json" \
  -d '{"query": "employee benefits policy"}'
```

### Example: With Answer Generation

```bash
curl -X POST https://your-n8n/webhook/wisebot/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the vacation policy?",
    "include_answer": true,
    "top_k": 5
  }'
```

### Example: From Another n8n Workflow

```javascript
// In a Code node
const response = await $http.post(
  'https://your-n8n/webhook/wisebot/knowledge',
  {
    query: $json.userQuestion,
    top_k: 5,
    include_answer: true
  }
);

return [{ json: response.data }];
```

---

## Operations Guide

### Retry Policy

All transient failures are retried up to 3 times with exponential backoff:
- 1st retry: 1 second delay
- 2nd retry: 2 seconds delay
- 3rd retry: 4 seconds delay

After 3 failures, an alert email is sent.

### Health Check Endpoint

```bash
GET https://[your-n8n-url]/webhook/wisebot/health
```

Response:
```json
{
  "status": "ok",
  "service": "WiseBot",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Use this endpoint with monitoring tools like UptimeRobot or Pingdom.

### Interpreting the Operations Dashboard

**Health Status:**
- `healthy` - All systems operational
- `degraded` - Some failures, but operational
- `unhealthy` - Critical issues, intervention required

**Key Metrics:**
- **Failed Executions:** Should be 0; investigate any failures
- **Avg Chunks/Doc:** Typically 5-20 for normal documents
- **Duplicate Rate:** High rate may indicate workflow issues

### Common Alerts

| Alert | Cause | Action |
|-------|-------|--------|
| DB Connection Failed | Supabase down or credentials invalid | Check Supabase status, verify credentials |
| High Failure Rate | Parsing/embedding service issues | Check Docling/OpenAI status |
| Duplicate Detected | Same file uploaded twice | Normal operation, verify if intentional |

---

## Troubleshooting

### Email Not Being Processed

1. **Check subject line:** Must exactly match configured filter
2. **Check email is unread:** Already-read emails are skipped
3. **Check for attachments:** Emails without attachments are skipped
4. **Verify Gmail credentials:** Test manually in n8n

### Parsing Failures

1. **Docling service down:** Check Docling container/service
2. **Unsupported format:** Verify MIME type is supported
3. **File too large:** Check n8n memory limits

### Embedding Failures

1. **OpenAI rate limit:** Wait or increase limits
2. **API key invalid:** Verify credential
3. **Model unavailable:** Check OpenAI status

### Gateway Returns Empty Results

1. **No matching content:** Try broader query
2. **Wrong embedding model:** Must match ingestion model
3. **Filter too restrictive:** Remove filters to test

### Checking Logs

```sql
-- Recent ingestion attempts
SELECT * FROM ingestion_logs
ORDER BY started_at DESC
LIMIT 20;

-- Failed ingestions
SELECT * FROM ingestion_logs
WHERE success = false
ORDER BY started_at DESC;

-- Recent health checks
SELECT * FROM ops_health_checks
ORDER BY checked_at DESC
LIMIT 10;
```

---

## File Reference

```
WiseBot/
├── README_WiseBot_Ingestion.md      # This documentation
├── wisebot_knowledge_schema.sql     # Database schema
├── wisebot_ingest_email_n8n.json    # Main ingestion workflow
├── wisebot_parse_normalize_n8n.json # Parsing sub-workflow
├── wisebot_dedup_hash_n8n.json      # Deduplication sub-workflow
├── wisebot_embed_store_n8n.json     # Embedding sub-workflow
├── wisebot_knowledge_gateway_n8n.json # Retrieval API
└── wisebot_ops_dashboard_n8n.json   # Operations monitoring
```

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review n8n execution logs
3. Query the `ingestion_logs` table for detailed error messages

---

*Generated for WiseBot Knowledge Ingestion System v1.0*
