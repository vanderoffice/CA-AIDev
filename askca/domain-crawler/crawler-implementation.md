# California State Government Web Crawler - Complete Implementation

This document contains all the files needed to implement a simplified, production-ready Python-based web crawler using Scrapy for discovering and cataloging California state government endpoints.

---

## File 1: README.md

```markdown
# California State Government Web Crawler

A simplified, production-ready web crawler built with Scrapy to discover and catalog all internet endpoints across California state government domains (*.ca.gov).

## Features

- **Scrapy-based**: Efficient, scalable Python web crawling framework
- **Redis Queue**: Distributed URL frontier with deduplication
- **Neo4j Graph Database**: Relationship mapping and analysis
- **PostgreSQL**: URL metadata and crawl state persistence
- **Bloom Filter**: Memory-efficient URL deduplication
- **SimHash**: Near-duplicate content detection
- **Docker Compose**: Single-command deployment
- **Cloudflare Tunnel**: Secure remote access without port forwarding
- **Politeness**: Respects robots.txt, crawl-delay, and rate limiting
- **Prioritization**: URL ranking by depth, authority, and freshness

## Architecture

```
┌─────────────────┐
│ Scrapy Spider   │──────┐
│ (Multiple       │      │
│  Workers)       │      ▼
└─────────────────┘   ┌──────────────┐
                      │ Redis Queue  │
┌─────────────────┐   │ + Bloom      │
│ Scrapy Spider   │───│ Filter       │
│ (Worker 2)      │   └──────────────┘
└─────────────────┘         │
                            ▼
                   ┌─────────────────┐
                   │ PostgreSQL      │
                   │ (Metadata)      │
                   └─────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Neo4j Graph DB  │
                   │ (Relationships) │
                   └─────────────────┘
```

## Prerequisites

- Docker and Docker Compose
- 4GB+ RAM
- 20GB+ disk space
- Cloudflare account (optional, for remote access)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd ca-gov-crawler
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file with your settings.

### 3. Start the Crawler

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f crawler

# Scale up crawler workers
docker-compose up -d --scale crawler=5
```

### 4. Seed Initial URLs

```bash
docker-compose exec crawler python /app/scripts/seed_urls.py
```

### 5. Monitor Progress

```bash
# PostgreSQL Stats
docker-compose exec postgres psql -U crawler -d crawler_db -c "SELECT COUNT(*) FROM urls;"

# Neo4j Browser: http://localhost:7474

# Redis Queue
docker-compose exec redis redis-cli LLEN ca_crawler:requests
```

## Project Structure

```
ca-gov-crawler/
├── docker-compose.yml          # Multi-container orchestration
├── Dockerfile                  # Scrapy crawler image
├── .env.example               # Environment variables template
├── requirements.txt           # Python dependencies
├── README.md                  # This file
├── scrapy.cfg                 # Scrapy project config
├── ca_crawler/               # Scrapy project directory
│   ├── __init__.py
│   ├── settings.py           # Scrapy settings
│   ├── spiders/             # Spider definitions
│   │   ├── __init__.py
│   │   └── ca_gov_spider.py # Main crawler spider
│   ├── pipelines.py         # Data processing pipelines
│   ├── middlewares.py       # Custom middlewares
│   ├── items.py             # Data models
│   └── utils/               # Utility modules
│       ├── __init__.py
│       ├── bloom_filter.py  # URL deduplication
│       ├── simhash.py       # Content deduplication
│       ├── url_utils.py     # URL normalization
│       └── db_utils.py      # Database helpers
├── scripts/                 # Management scripts
│   ├── seed_urls.py        # Bulk URL seeding
│   ├── export_graph.py     # Export Neo4j data
│   └── stats.py            # Crawl statistics
├── neo4j/                  # Neo4j configuration
│   └── init.cypher        # Initial graph schema
└── postgresql/            # PostgreSQL configuration
    └── init.sql          # Database schema
```

## Deployment

See full documentation in the implementation file.

## License

MIT License
```

---

## File 2: .env.example

```bash
# Redis Configuration
REDIS_URL=redis://redis:6379/0

# PostgreSQL Configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=crawler_db
POSTGRES_USER=crawler
POSTGRES_PASSWORD=ChangeMeToStrongPassword123!

# Neo4j Configuration
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=ChangeMeToStrongPassword456!

# Crawler Settings
CRAWLER_USER_AGENT=CaliforniaGovCrawler/1.0 (+https://crawler.example.com)
DOWNLOAD_DELAY=1.0
CONCURRENT_REQUESTS=16
CONCURRENT_REQUESTS_PER_DOMAIN=2
MAX_DEPTH=5
ROBOTSTXT_OBEY=True

# Bloom Filter Settings
BLOOM_FILTER_CAPACITY=10000000
BLOOM_FILTER_ERROR_RATE=0.001

# Cloudflare Tunnel (Optional)
TUNNEL_TOKEN=

# Logging
LOG_LEVEL=INFO
```

---

## File 3: docker-compose.yml

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: ca_crawler_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: always
    networks:
      - crawler_network

  postgres:
    image: postgres:15-alpine
    container_name: ca_crawler_postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgresql/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: always
    networks:
      - crawler_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  neo4j:
    image: neo4j:5.13-community
    container_name: ca_crawler_neo4j
    environment:
      NEO4J_AUTH: ${NEO4J_USER}/${NEO4J_PASSWORD}
      NEO4J_PLUGINS: '["apoc"]'
      NEO4J_dbms_security_procedures_unrestricted: apoc.*
      NEO4J_dbms_memory_heap_max__size: 2G
    ports:
      - "7474:7474"  # HTTP
      - "7687:7687"  # Bolt
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
      - ./neo4j/init.cypher:/var/lib/neo4j/import/init.cypher
    restart: always
    networks:
      - crawler_network
    healthcheck:
      test: ["CMD-SHELL", "cypher-shell -u ${NEO4J_USER} -p ${NEO4J_PASSWORD} 'RETURN 1'"]
      interval: 30s
      timeout: 10s
      retries: 5

  crawler:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ca_crawler_worker
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      neo4j:
        condition: service_healthy
    env_file:
      - .env
    volumes:
      - ./ca_crawler:/app/ca_crawler
      - ./scripts:/app/scripts
      - crawler_logs:/app/logs
    restart: always
    networks:
      - crawler_network
    command: scrapy crawl ca_gov

  cloudflare-tunnel:
    image: cloudflare/cloudflared:latest
    container_name: ca_crawler_tunnel
    command: tunnel --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=${TUNNEL_TOKEN}
    restart: always
    networks:
      - crawler_network
    profiles:
      - tunnel

volumes:
  redis_data:
  postgres_data:
  neo4j_data:
  neo4j_logs:
  crawler_logs:

networks:
  crawler_network:
    driver: bridge
```

---

## File 4: Dockerfile

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY scrapy.cfg .
COPY ca_crawler/ ./ca_crawler/
COPY scripts/ ./scripts/

# Create logs directory
RUN mkdir -p /app/logs

# Run as non-root user
RUN useradd -m -u 1000 crawler && chown -R crawler:crawler /app
USER crawler

# Default command
CMD ["scrapy", "crawl", "ca_gov"]
```

---

## File 5: requirements.txt

```
# Core Dependencies
scrapy==2.11.0
scrapy-redis==0.7.3
redis==5.0.1
psycopg2-binary==2.9.9
neo4j==5.14.1

# Deduplication
mmh3==4.0.1
bitarray==2.8.3
simhash-py==0.4.0

# URL Processing
w3lib==2.1.2
tldextract==5.0.1

# HTTP Client
requests==2.31.0

# Data Processing
itemadapter==0.8.0

# Utilities
python-dotenv==1.0.0
tabulate==0.9.0
```

---

*Continue to next page for Python source code files...*
