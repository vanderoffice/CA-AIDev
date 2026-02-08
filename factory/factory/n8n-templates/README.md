# n8n Workflow Templates

Parameterized n8n workflow JSON files for bot backend automation. Each template is derived from production workflows running on the vanderdev.net VPS, with hardcoded values replaced by `{{PLACEHOLDER}}` tokens.

## Overview

Three templates cover the standard bot backend patterns:

| Template | Use Case | Has AI | Has Memory | Nodes |
|----------|----------|--------|------------|-------|
| `bot-chat-orchestrator.json` | Main chat endpoint with RAG | Yes | Yes | 12 |
| `bot-tool-webhook.json` | Focused tool/expert endpoint with RAG | Yes | No | 10 |
| `bot-data-webhook.json` | Pure data lookup (no AI) | No | No | 7 |

## Template Descriptions

### bot-chat-orchestrator.json

**Purpose:** Primary chat interface for a RAG-powered bot. Handles conversation history, embeds user queries, retrieves relevant knowledge chunks via pgvector, builds a system prompt with retrieved context, and routes through a Claude agent with buffer memory.

**Pipeline:**
```
Webhook → Parse Request → Embed Query → Prepare Search → Vector Search
  → Handle Empty Results → Build Prompt → AI Agent (+ Claude + Memory)
    → Format Response → Respond to Webhook
```

**Derived from:** WaterBot v3 Chat (production)

**When to use:** Every bot needs exactly one of these. It is the main conversational endpoint that the frontend `BotChatInterface` component talks to.

---

### bot-tool-webhook.json

**Purpose:** Focused expert endpoint for a specific topic within a bot's domain. Uses RAG with a category filter to narrow retrieval to a single knowledge area, then routes through a Claude agent with a tool-specific system prompt. No conversation memory (stateless per request).

**Pipeline:**
```
Webhook → Parse Request → Embed Query → Prepare Search (with category filter)
  → Vector Search → Build Prompt → AI Agent (+ Claude) → Format Response
    → Respond to Webhook
```

**Derived from:** WaterBot v3 Decision Tree Webhook (production)

**When to use:** Add one per decision tree leaf or specialized tool. Each tool webhook gets its own category filter and system prompt. A bot with 3 decision tree branches would have 3 tool webhooks.

---

### bot-data-webhook.json

**Purpose:** Pure data lookup endpoint with no AI involved. Receives structured input, validates it, runs a parameterized SQL query, processes/transforms the results, and returns structured JSON. This is a skeleton template -- the business logic is domain-specific and must be customized.

**Pipeline:**
```
Webhook → Extract & Validate Request → IF (Validation Failed?)
  → [true] Respond with Error (400)
  → [false] Query Data → Process Results → Respond with Data
```

**Derived from:** BizBot v4 License Finder (production)

**When to use:** For structured data lookups that do not need AI -- calculators, finders, lookup tables, filtered searches against relational data. If the answer comes from a SQL query rather than semantic search, use this template.

---

## Complete Placeholder Reference

Every `{{PLACEHOLDER}}` token across all 3 templates, grouped by category.

### Identity

| Placeholder | Description | Default | Templates | Example |
|-------------|-------------|---------|-----------|---------|
| `{{BOT_NAME}}` | Display name of the bot | -- | chat, tool, data | `WaterBot` |
| `{{BOT_SLUG}}` | URL-safe lowercase identifier | -- | chat, tool, data | `waterbot` |

### Data Endpoint (data-webhook only)

| Placeholder | Description | Default | Templates | Example |
|-------------|-------------|---------|-----------|---------|
| `{{DATA_ENDPOINT_NAME}}` | Display name for this data endpoint | -- | data | `License Finder` |
| `{{DATA_SLUG}}` | URL-safe name for webhook path | -- | data | `license-finder` |
| `{{DATA_TABLE}}` | Primary table for data queries | -- | data | `license_requirements` |
| `{{DATA_TABLE_SECONDARY}}` | Secondary/reference table for JOINs | -- | data | `license_agencies` |
| `{{CORS_ORIGINS}}` | Allowed CORS origins | `*` | data | `https://vanderdev.net,http://localhost:3000` |

### Tool Endpoint (tool-webhook only)

| Placeholder | Description | Default | Templates | Example |
|-------------|-------------|---------|-----------|---------|
| `{{TOOL_NAME}}` | Display name for this tool | -- | tool | `Water Rights Expert` |
| `{{TOOL_SLUG}}` | URL-safe name for webhook path | -- | tool | `water-rights` |
| `{{TOOL_SYSTEM_PROMPT}}` | Full system prompt for the tool agent | -- | tool | `You are a water rights expert...` |
| `{{RAG_CATEGORY_FILTER}}` | Knowledge chunk category to filter on | -- | tool | `water-rights` |

### Credentials

| Placeholder | Description | Default | Templates | Example |
|-------------|-------------|---------|-----------|---------|
| `{{CREDENTIAL_POSTGRES}}` | n8n Postgres credential ID | -- | chat, tool, data | `y814aU5gt5MUe3b8` |
| `{{CREDENTIAL_OPENAI}}` | n8n OpenAI credential ID | -- | chat, tool | `abc123def456` |
| `{{CREDENTIAL_ANTHROPIC}}` | n8n Anthropic credential ID | -- | chat, tool | `xyz789ghi012` |

### LLM Configuration

| Placeholder | Description | Default | Templates | Example |
|-------------|-------------|---------|-----------|---------|
| `{{LLM_MODEL}}` | Claude model identifier | -- | chat, tool | `claude-sonnet-4-5-20250929` |
| `{{LLM_TEMPERATURE}}` | Model temperature (0-1) | -- | chat, tool | `0.3` |
| `{{LLM_MAX_TOKENS}}` | Max response tokens | -- | chat, tool | `2048` |

### RAG Configuration

| Placeholder | Description | Default | Templates | Example |
|-------------|-------------|---------|-----------|---------|
| `{{DB_SCHEMA}}` | Postgres schema name | -- | chat, tool, data | `waterbot` |
| `{{RAG_SIMILARITY_THRESHOLD}}` | Max cosine distance for vector search | -- | chat, tool | `0.8` |
| `{{RAG_TOP_K}}` | Number of chunks to retrieve | -- | chat, tool | `5` |

### Content / Prompt

| Placeholder | Description | Default | Templates | Example |
|-------------|-------------|---------|-----------|---------|
| `{{SYSTEM_PROMPT_FACTS}}` | Domain facts for the main system prompt | -- | chat | `California water rights and regulations` |
| `{{SYSTEM_PROMPT_ROLE}}` | Role description for the main agent | -- | chat | `Answer questions about water rights...` |
| `{{CITATION_DOMAIN}}` | Fallback domain for URL citations | -- | chat, tool | `waterboards.ca.gov` |
| `{{INTAKE_CONTEXT_BLOCK}}` | Code block for user context in prompt builder | -- | chat | *(see Customization Guide)* |
| `{{USER_CONTEXT_FIELD}}` | Field name for user-specific context | -- | chat | `selectedRegion` |
| `{{MEMORY_WINDOW}}` | Conversation memory window size | -- | chat | `10` |

---

## Import Instructions

### Step 1: Choose your template

Pick the template(s) your bot needs. Every bot needs `bot-chat-orchestrator.json`. Add `bot-tool-webhook.json` for each decision tree branch. Add `bot-data-webhook.json` for structured data lookup endpoints.

### Step 2: Replace placeholders

Use `sed` to batch-replace all placeholders (see script below), or open the JSON in a text editor and find-and-replace manually.

**Critical placeholders that MUST be replaced before import:**
- `{{BOT_NAME}}` and `{{BOT_SLUG}}` -- workflow naming and webhook paths
- `{{CREDENTIAL_POSTGRES}}` -- database connection (workflow will fail without this)
- `{{CREDENTIAL_OPENAI}}` -- embedding API (chat and tool templates)
- `{{CREDENTIAL_ANTHROPIC}}` -- LLM API (chat and tool templates)
- `{{DB_SCHEMA}}` -- which Postgres schema to query

### Step 3: Import into n8n

1. Open n8n at https://n8n.vanderdev.net
2. Click **Add workflow** (top right)
3. Click the **...** menu (top right of canvas) and select **Import from file**
4. Select your placeholder-replaced JSON file
5. The workflow loads with all nodes and connections intact

### Step 4: Verify credentials

After import, each credential node will show a warning if the credential ID does not match an existing credential in your n8n instance.

1. Click any node with a credential warning
2. Select the correct credential from the dropdown
3. Repeat for all credential nodes

### Step 5: Test with curl

```bash
# Test chat orchestrator
curl -X POST https://n8n.vanderdev.net/webhook/YOUR-BOT-SLUG \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "sessionId": "test-1"}'

# Test tool webhook
curl -X POST https://n8n.vanderdev.net/webhook/YOUR-BOT-SLUG-YOUR-TOOL-SLUG \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the requirements?"}'

# Test data webhook
curl -X POST https://n8n.vanderdev.net/webhook/YOUR-BOT-SLUG-YOUR-DATA-SLUG \
  -H "Content-Type: application/json" \
  -d '{"primaryField": "test-value"}'
```

### Step 6: Activate

Once testing passes, toggle the workflow to **Active** in n8n.

---

## Placeholder Replacement Script

Batch-replace all placeholders for a new bot project. Adjust the values and run from the `factory/n8n-templates/` directory.

```bash
# Example: Replace all placeholders for a new "AgBot" agriculture bot
# Chat orchestrator
sed -e 's/{{BOT_NAME}}/AgBot/g' \
    -e 's/{{BOT_SLUG}}/agbot/g' \
    -e 's/{{DB_SCHEMA}}/agbot/g' \
    -e 's/{{CREDENTIAL_POSTGRES}}/YOUR_PG_CRED_ID/g' \
    -e 's/{{CREDENTIAL_OPENAI}}/YOUR_OPENAI_CRED_ID/g' \
    -e 's/{{CREDENTIAL_ANTHROPIC}}/YOUR_ANTHROPIC_CRED_ID/g' \
    -e 's/{{LLM_MODEL}}/claude-sonnet-4-5-20250929/g' \
    -e 's/{{LLM_TEMPERATURE}}/0.3/g' \
    -e 's/{{LLM_MAX_TOKENS}}/2048/g' \
    -e 's/{{RAG_SIMILARITY_THRESHOLD}}/0.8/g' \
    -e 's/{{RAG_TOP_K}}/5/g' \
    -e 's/{{MEMORY_WINDOW}}/10/g' \
    -e 's/{{CITATION_DOMAIN}}/cdfa.ca.gov/g' \
    -e 's/{{USER_CONTEXT_FIELD}}/selectedCounty/g' \
    -e 's/{{SYSTEM_PROMPT_FACTS}}/California agriculture permits and regulations/g' \
    -e 's/{{SYSTEM_PROMPT_ROLE}}/Answer questions about agriculture permits using your knowledge base/g' \
    bot-chat-orchestrator.json > agbot-chat.json

# Tool webhook (one per decision tree branch)
sed -e 's/{{BOT_NAME}}/AgBot/g' \
    -e 's/{{BOT_SLUG}}/agbot/g' \
    -e 's/{{TOOL_NAME}}/Pesticide Permits/g' \
    -e 's/{{TOOL_SLUG}}/pesticide-permits/g' \
    -e 's/{{DB_SCHEMA}}/agbot/g' \
    -e 's/{{CREDENTIAL_POSTGRES}}/YOUR_PG_CRED_ID/g' \
    -e 's/{{CREDENTIAL_OPENAI}}/YOUR_OPENAI_CRED_ID/g' \
    -e 's/{{CREDENTIAL_ANTHROPIC}}/YOUR_ANTHROPIC_CRED_ID/g' \
    -e 's/{{LLM_MODEL}}/claude-sonnet-4-5-20250929/g' \
    -e 's/{{LLM_TEMPERATURE}}/0.3/g' \
    -e 's/{{LLM_MAX_TOKENS}}/2048/g' \
    -e 's/{{RAG_SIMILARITY_THRESHOLD}}/0.8/g' \
    -e 's/{{RAG_TOP_K}}/5/g' \
    -e 's/{{RAG_CATEGORY_FILTER}}/pesticide-permits/g' \
    -e 's/{{CITATION_DOMAIN}}/cdfa.ca.gov/g' \
    bot-tool-webhook.json > agbot-pesticide-permits.json

# Data webhook
sed -e 's/{{BOT_NAME}}/AgBot/g' \
    -e 's/{{BOT_SLUG}}/agbot/g' \
    -e 's/{{DATA_ENDPOINT_NAME}}/Crop Calendar/g' \
    -e 's/{{DATA_SLUG}}/crop-calendar/g' \
    -e 's/{{DB_SCHEMA}}/agbot/g' \
    -e 's/{{DATA_TABLE}}/crops/g' \
    -e 's/{{DATA_TABLE_SECONDARY}}/growing_regions/g' \
    -e 's/{{CREDENTIAL_POSTGRES}}/YOUR_PG_CRED_ID/g' \
    -e 's/{{CORS_ORIGINS}}/*/g' \
    bot-data-webhook.json > agbot-crop-calendar.json
```

---

## Credential Setup

### Finding credential IDs in n8n

Each template uses `{{CREDENTIAL_*}}` placeholders that must be replaced with your n8n instance's actual credential IDs.

1. Go to **Settings** > **Credentials** in n8n
2. Click the credential you want to use
3. The credential ID is in the URL: `https://n8n.vanderdev.net/credentials/YOUR_CRED_ID`
4. Copy that ID and use it to replace the corresponding placeholder

### Credentials by template

| Template | Postgres | OpenAI | Anthropic |
|----------|----------|--------|-----------|
| chat-orchestrator | Required | Required | Required |
| tool-webhook | Required | Required | Required |
| data-webhook | Required | -- | -- |

**Credential IDs are instance-specific.** They will be different on every n8n installation. Always look them up fresh when importing templates.

---

## Customization Guide

### Modifying the system prompt

The chat orchestrator's system prompt is built in the **Build Prompt** code node. Key sections to customize:

- `{{SYSTEM_PROMPT_FACTS}}` -- Insert your domain expertise description
- `{{SYSTEM_PROMPT_ROLE}}` -- Define how the bot should behave
- The `GUIDELINES` and `CRITICAL RULES` sections are generic and work across domains
- The `URL CITATION RULES` section prevents hallucinated URLs (keep this)

### Adding/removing RAG category filters

The tool webhook uses `{{RAG_CATEGORY_FILTER}}` in its SQL WHERE clause:

```sql
AND category = '{{RAG_CATEGORY_FILTER}}'
```

To support multiple categories, replace the single-value filter with an IN clause:

```sql
AND category IN ('category-a', 'category-b')
```

To remove filtering entirely (search all categories), delete the `AND category = ...` line.

### Adjusting similarity thresholds and top-K

In the **Prepare Search** code node:

- `{{RAG_SIMILARITY_THRESHOLD}}` -- Lower values = stricter matching (0.5 = very strict, 1.0 = very loose). Start with `0.8` and tune based on result quality.
- `{{RAG_TOP_K}}` -- Number of chunks to retrieve. More chunks = more context for the LLM but higher token cost. Start with `5`.

### Adding decision tree tool webhooks

For each decision tree branch in your bot:

1. Copy `bot-tool-webhook.json` and replace placeholders
2. Set a unique `{{TOOL_SLUG}}` for the webhook path
3. Set `{{RAG_CATEGORY_FILTER}}` to match the knowledge category
4. Write a `{{TOOL_SYSTEM_PROMPT}}` specific to that topic
5. Import into n8n and activate
6. Wire the frontend DecisionTreeView to call the new webhook URL

### The INTAKE_CONTEXT_BLOCK placeholder

The `{{INTAKE_CONTEXT_BLOCK}}` in the chat orchestrator is a code block that extracts user-specific context (like a selected region or intake form answers) and formats it for the system prompt. Replace it with code like:

```javascript
let userContextSection = '';
if (context.selectedRegion) {
  userContextSection = `\n## USER CONTEXT\nThe user is asking about: ${context.selectedRegion}\n`;
}
```

This is intentionally a block replacement (not a simple value) because each bot has different intake fields and formatting needs.

---

*Templates derived from production workflows (WaterBot v3, BizBot v4) running on vanderdev.net VPS.*
