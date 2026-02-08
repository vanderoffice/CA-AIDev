# Deploy Checklist

Comprehensive deploy lifecycle for bot-track and form-track projects. This is a human reference document — not a script. It covers steps both automated and manual, including those the deploy scripts do not handle (n8n workflow import, DNS setup, App.jsx route registration).

---

## Prerequisites (Both Tracks)

- [ ] **VPS SSH access** configured (`ssh vps` works, or set `$VPS_HOST` env var)
- [ ] **`.env` file** created from `factory/.env.example` with `DB_HOST`, `DB_PASSWORD`, `OPENAI_API_KEY`
- [ ] **Project scaffolded** via `factory/scripts/scaffold.sh`
- [ ] **shellcheck / bash 4+** available locally (for script verification)

---

## Bot Track Deploy

### 1. Schema Setup

Create the Supabase schema with the standard `document_chunks` RAG table.

```bash
factory/scripts/setup-supabase-schema.sh --schema {name} --track bot
```

**Verify:**
- [ ] Schema exists: `ssh vps "docker exec -i supabase-db psql -U postgres -d postgres -c '\dn'" | grep {name}`
- [ ] `document_chunks` table created: `ssh vps "docker exec -i supabase-db psql -U postgres -d postgres -c '\dt {name}.*'"`
- [ ] HNSW index present on `embedding` column
- [ ] `anon` and `authenticated` roles have USAGE grant

**Dry-run first:**
```bash
factory/scripts/setup-supabase-schema.sh --schema {name} --track bot --dry-run
```

### 2. Knowledge Ingest

Chunk, embed, and validate knowledge documents into the RAG table.

```bash
# Chunk knowledge docs into overlapping segments
node scripts/chunk-knowledge.js --input knowledge/ --output chunks/

# Embed chunks via OpenAI text-embedding-3-small
python scripts/embed-chunks.py --schema {name} --table document_chunks

# Validate chunk quality, detect duplicates, check coverage
python scripts/validate-knowledge.py --schema {name}
```

**Verify:**
- [ ] Chunks appear in `{name}.document_chunks`: `ssh vps "docker exec -i supabase-db psql -U postgres -d postgres -c 'SELECT count(*) FROM {name}.document_chunks'"`
- [ ] No duplicate `content_hash` values
- [ ] Embeddings are 1536-dimensional (text-embedding-3-small standard)

### 3. n8n Workflow Setup

Import and configure n8n workflow templates for the bot backend.

1. Open n8n UI at **https://n8n.vanderdev.net**
2. Import `factory/n8n-templates/bot-chat-orchestrator.json`
3. Replace all 26 placeholders per `factory/n8n-templates/README.md`
   - **Critical:** `{{BOT_NAME}}`, `{{BOT_SLUG}}`, `{{DB_SCHEMA}}`, `{{CREDENTIAL_POSTGRES}}`, `{{CREDENTIAL_OPENAI}}`, `{{CREDENTIAL_ANTHROPIC}}`
4. Configure credentials (OpenAI API key, Postgres connection, Anthropic API key)
5. Import additional templates as needed:
   - `bot-tool-webhook.json` -- one per decision tree branch
   - `bot-data-webhook.json` -- for structured data lookups (no AI)
6. Activate all workflows

**Test webhook:**
```bash
curl -X POST https://n8n.vanderdev.net/webhook/{slug} \
  -H "Content-Type: application/json" \
  -d '{"message":"test","sessionId":"deploy-check-1"}'
```

**Verify:**
- [ ] Webhook returns a valid JSON response
- [ ] RAG context is included in the response (not empty)
- [ ] Citations reference real URLs (not hallucinated)

**Reference:** `factory/n8n-templates/README.md` for full placeholder list, credential setup, and customization guide.

### 4. Bot Page Registration

Register the bot page in the vanderdev-website SPA.

1. Add page component import to `vanderdev-website/src/App.jsx`:
   ```jsx
   import {PascalName} from './pages/{PascalName}'
   ```
2. Add Route inside the Router:
   ```jsx
   <Route path="/{slug}" element={<{PascalName} />} />
   ```
3. Add sidebar link in the navigation component (if desired)
4. **Important:** React Router `basename` means all `navigate()` paths are relative to the base. Do NOT double-prefix.

### 5. Deploy

Run the deploy script to build and push the SPA to the VPS.

```bash
factory/scripts/deploy-bot.sh --name {slug}
```

**Dry-run first:**
```bash
factory/scripts/deploy-bot.sh --name {slug} --dry-run
```

**What the script does:**
1. Verifies `src/pages/{PascalName}.jsx` exists in vanderdev-website
2. Runs `npm run build` in vanderdev-website
3. Rsyncs `dist/` to `vps:/root/vanderdev-website/dist/`
4. Verifies deployment via curl

**Verify:**
- [ ] https://vanderdev.net/{slug} loads
- [ ] Chat interface works (sends/receives messages)
- [ ] Decision tree renders and navigates correctly

### 6. Post-Deploy

- [ ] Update project `STATUS.md` with deployment date and URL
- [ ] Run `/gov-factory:build-decks` for final presentation decks with live screenshots
- [ ] Store Memory MCP entities for the deployed project
- [ ] Verify all webhook URLs in the JSX match the activated n8n workflows

---

## Form Track Deploy

### 1. Schema Setup

Create the Supabase schema (tables are added separately from project-specific SQL).

```bash
factory/scripts/setup-supabase-schema.sh --schema {name} --track form
```

Then run project-specific SQL:
```bash
ssh vps "docker exec -i supabase-db psql -U postgres -d postgres" < sql/001-schema.sql
```

**Dry-run first:**
```bash
factory/scripts/setup-supabase-schema.sh --schema {name} --track form --dry-run
```

**Verify:**
- [ ] Schema exists on VPS
- [ ] Project-specific tables created
- [ ] `anon` and `authenticated` roles have appropriate grants
- [ ] PostgREST can see the new schema (may need: `NOTIFY pgrst, 'reload schema'`)

### 2. Docker Setup

Ensure the project has the required Docker files for container deployment.

**Required files:**
- [ ] `Dockerfile` (multi-stage build: node build + nginx serve)
- [ ] `docker-compose.prod.yml` with correct labels:
  - `VIRTUAL_HOST` -- hostname for nginx-proxy
  - `VIRTUAL_PATH` -- URL path prefix (e.g., `/ecosform`)
  - `VIRTUAL_DEST` -- rewrite destination (usually `/`)
- [ ] `nginx.conf` inside the container with `try_files $uri $uri/ /index.html`

**VPS `.env` must have:**
- [ ] `VITE_SUPABASE_URL` -- Supabase API endpoint
- [ ] `VITE_SUPABASE_ANON_KEY` -- Supabase anonymous key

### 3. Deploy

Run the deploy script to sync files and build the container on VPS.

```bash
factory/scripts/deploy-form.sh --name {slug} --path-prefix /{slug}
```

**Dry-run first:**
```bash
factory/scripts/deploy-form.sh --name {slug} --path-prefix /{slug} --dry-run
```

**What the script does:**
1. Verifies `docker-compose.prod.yml` exists locally
2. Rsyncs project files to `vps:/root/Automation/{name}/` (excludes node_modules, .git, dist)
3. Runs `docker-compose -f docker-compose.prod.yml up --build -d` on VPS
4. Waits 5 seconds, verifies container is running
5. Verifies HTTP response via nginx-proxy

**Verify:**
- [ ] https://vanderdev.net/{slug} loads
- [ ] Form submits work (data reaches Supabase)
- [ ] Container shows healthy in `docker ps`

### 4. Post-Deploy

- [ ] Update project `STATUS.md` with deployment date and URL
- [ ] Run `/gov-factory:build-decks` for final presentation decks with live screenshots
- [ ] Store Memory MCP entities for the deployed project

---

## Troubleshooting

### 502 Bad Gateway

**Cause:** Container not on the nginx-proxy `frontend` Docker network.

**Fix:**
```bash
# Check container networks
ssh vps "docker inspect {container} --format '{{.NetworkSettings.Networks}}'"

# Connect to frontend network
ssh vps "docker network connect frontend {container}"
```

Or add the `frontend` network in `docker-compose.prod.yml`:
```yaml
networks:
  frontend:
    external: true
```

### 404 on Sub-Path

**Cause:** nginx.conf inside the container is missing the SPA fallback rule.

**Fix:** Add to the nginx `location` block:
```nginx
try_files $uri $uri/ /index.html;
```

For path-prefixed deploys, ensure the `basename` in React Router matches the `VIRTUAL_PATH`.

### Schema Not Found in PostgREST

**Cause:** PostgREST caches schema metadata at startup. New schemas are not visible until refreshed.

**Fix:**
```bash
# Reload PostgREST schema cache
ssh vps "docker exec -i supabase-db psql -U postgres -d postgres -c \"NOTIFY pgrst, 'reload schema'\""

# Or restart the container
ssh vps "docker restart supabase-rest"
```

**Note:** The PostgREST v13 container is scratch-based -- no shell, no curl, no wget. Cannot exec into it. Use `NOTIFY` or restart.

### Webhook Returns 404

**Cause:** n8n workflow not activated, or webhook path does not match the frontend URL.

**Fix:**
1. Open n8n UI and verify the workflow is toggled **Active**
2. Compare the webhook path in n8n with the hardcoded URL in the JSX component
3. Webhook URLs are hardcoded constants in JSX (no env var injection) -- double-check exact spelling

### Embedding Dimension Mismatch

**Cause:** HNSW index created with wrong dimensions or different embedding model used.

**Fix:** Ensure the HNSW index uses `vector_cosine_ops` with 1536 dimensions (text-embedding-3-small standard):
```sql
CREATE INDEX idx_{schema}_chunks_embedding
  ON {schema}.document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

If the index was created with wrong dimensions, drop and recreate it.

### Container Starts But Immediately Exits

**Cause:** Build failed silently or missing environment variables.

**Fix:**
```bash
# Check container logs
ssh vps "docker-compose -f /root/Automation/{name}/docker-compose.prod.yml logs --tail 50"

# Verify .env exists on VPS
ssh vps "ls -la /root/Automation/{name}/.env"
```

### basename Double-Prefix Bug

**Cause:** React Router `BrowserRouter basename="/ecosform"` means `navigate('/ecosform/workflow')` resolves to `/ecosform/ecosform/workflow`.

**Fix:** Always use paths relative to the base: `navigate('/workflow')`, not `navigate('/ecosform/workflow')`.

---

*Reference: factory/scripts/ for deploy automation, factory/n8n-templates/README.md for workflow setup.*
