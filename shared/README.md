# Shared Resources

This folder contains shared infrastructure, configuration, and documentation used across all CA-AIDev projects.

## Contents

### Infrastructure

- **`docker-compose.yml`** - Complete development environment with all required services
- **`.env.example`** - Template for environment variables (copy to `.env` and customize)
- **`scripts/`** - Initialization and utility scripts

### Documentation

- **`docs/`** - Shared documentation and guides
- **`templates/`** - Reusable n8n workflow templates and patterns

## Quick Start

### 1. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your actual API keys and passwords
```

### 2. Start Infrastructure

```bash
# Start all services
docker compose up -d

# Start only core services (without optional services)
docker compose up -d n8n postgres qdrant redis

# Start with optional services
docker compose --profile optional up -d
```

### 3. Verify Services

```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f
```

## Service Endpoints

Once running, access services at:

| Service | URL | Credentials |
|---------|-----|-------------|
| **n8n** | http://localhost:5678 | Set in `.env` (N8N_BASIC_AUTH_USER/PASSWORD) |
| **pgAdmin** | http://localhost:5050 | Set in `.env` (PGADMIN_EMAIL/PASSWORD) |
| **Qdrant UI** | http://localhost:6333/dashboard | No authentication by default |
| **Neo4j Browser** | http://localhost:7474 | Set in `.env` (NEO4J_USER/PASSWORD) |

## Database Connections

### PostgreSQL Connection Details

- **Host:** localhost
- **Port:** 5432
- **Databases:**
  - `ca_aidev` - Main database (used by n8n)
  - `bizbot` - BizBot project database
  - `commentbot` - CommentBot project database
  - `adabot` - ADABot project database
  - `wisebot` - WiseBot project database

### Connecting from n8n

When setting up n8n credentials for PostgreSQL:
- **Host:** `postgres` (use Docker service name when n8n is in Docker)
- **Port:** 5432
- **Database:** Choose the appropriate project database
- **User/Password:** Set in `.env`

### Connecting from Host Machine

Use `localhost:5432` with the credentials from your `.env` file.

## Qdrant Collections

Each project uses separate Qdrant collections:

| Project | Collection Name | Vector Dimensions |
|---------|----------------|-------------------|
| BizBot | `ca_licensing` | 1536 (OpenAI text-embedding-3-small) |
| WiseBot | `wisebot_knowledge` | 1536 (OpenAI text-embedding-3-small) |
| CommentBot | `comment_analysis` | 1536 (OpenAI text-embedding-3-small) |

## Managing Services

### Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes all data)
docker compose down -v
```

### Update Services

```bash
# Pull latest images
docker compose pull

# Recreate containers with new images
docker compose up -d
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f n8n
docker compose logs -f postgres
```

### Backup Databases

```bash
# Backup PostgreSQL databases
docker compose exec postgres pg_dumpall -U ca_aidev > backup.sql

# Backup specific database
docker compose exec postgres pg_dump -U ca_aidev bizbot > bizbot_backup.sql
```

### Restore Databases

```bash
# Restore all databases
docker compose exec -T postgres psql -U ca_aidev < backup.sql

# Restore specific database
docker compose exec -T postgres psql -U ca_aidev bizbot < bizbot_backup.sql
```

## Environment Variables Reference

See `.env.example` for a complete list of configurable environment variables.

### Required Variables

At minimum, you must set:
- `N8N_BASIC_AUTH_USER` and `N8N_BASIC_AUTH_PASSWORD`
- `POSTGRES_USER` and `POSTGRES_PASSWORD`
- At least one AI provider API key (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GOOGLE_AI_API_KEY`)
- `SMTP_*` variables if using email functionality

### Optional Variables

- `NEO4J_PASSWORD` - Only if using Domain Crawler
- `SUPABASE_*` - Only if using Supabase instead of local PostgreSQL
- `DOCLING_API_URL` - Only for WiseBot document parsing
- `PGADMIN_*` - Only if using pgAdmin UI

## Troubleshooting

### Services Won't Start

```bash
# Check for port conflicts
docker compose ps
lsof -i :5678  # Check if n8n port is in use
lsof -i :5432  # Check if PostgreSQL port is in use

# Check logs for errors
docker compose logs
```

### Database Connection Errors

1. Verify PostgreSQL is running: `docker compose ps postgres`
2. Check credentials in `.env` match n8n configuration
3. Use `postgres` as host when connecting from n8n (Docker service name)
4. Use `localhost` as host when connecting from host machine

### Volume Permissions

```bash
# If you encounter permission errors
docker compose down
sudo chown -R $USER:$USER ./volumes/
docker compose up -d
```

## Production Deployment

For production deployments:

1. **Update security settings:**
   - Change all default passwords
   - Enable HTTPS (update `N8N_PROTOCOL=https`)
   - Configure proper WEBHOOK_URL with your domain
   - Use strong JWT secrets

2. **Use managed services:**
   - Consider managed PostgreSQL (AWS RDS, Google Cloud SQL)
   - Use Qdrant Cloud for vector storage
   - Consider managed Redis (AWS ElastiCache, Google Memorystore)

3. **Enable monitoring:**
   - Set up logging aggregation
   - Configure health checks
   - Enable error tracking (Sentry)

4. **Backup strategy:**
   - Automated database backups
   - Qdrant collection snapshots
   - n8n workflow exports

## Related Resources

- [n8n Documentation](https://docs.n8n.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Neo4j Documentation](https://neo4j.com/docs/)

---

*Shared infrastructure for California AI Development projects*
