# AskCA - Digital Services Research

<p align="center">
  <img src="https://img.shields.io/badge/Status-Research-informational" alt="Research"/>
  <img src="https://img.shields.io/badge/Includes-Domain_Crawler-blue" alt="Domain Crawler"/>
</p>

**Research and documentation for California government digital services strategy.**

This project contains analysis of essential citizen services and infrastructure tools for understanding California's digital landscape.

---

## Overview

AskCA explores the question: *What digital services should California government provide to best serve its residents?*

The research examines:

- Essential digital services for modern government
- Current state of California's digital offerings
- Gaps and opportunities for improvement
- Infrastructure needed to support service delivery

---

## Contents

### Digital Services Research

Analysis of the top 20 digital services a government should provide, covering:

| Category | Examples |
|----------|----------|
| Identity & Records | Digital ID, vital records, background checks |
| Business Services | Licensing, permits, tax filing |
| Benefits & Social | Unemployment, healthcare, food assistance |
| Transportation | DMV services, transit, parking |
| Property & Housing | Assessments, permits, assistance |
| Public Safety | Emergency alerts, court records |
| Education | School enrollment, financial aid |
| Environment | Air/water quality, recreation |

### Domain Crawler

A production-ready Scrapy-based crawler for discovering and cataloging all California state government endpoints (*.ca.gov).

---

## Domain Crawler

Located in `domain-crawler/`:

### Purpose
Systematically discover and catalog every endpoint across California's state government web presence to:

- Map the complete digital landscape
- Identify services and their locations
- Understand domain relationships
- Support service consolidation efforts

### Architecture

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

### Features

| Feature | Technology | Purpose |
|---------|------------|---------|
| Crawling | Scrapy | Efficient, scalable web crawling |
| Queue | Redis | Distributed URL frontier |
| Deduplication | Bloom Filter | Memory-efficient URL tracking |
| Near-Duplicate | SimHash | Content similarity detection |
| Metadata | PostgreSQL | URL and crawl state storage |
| Relationships | Neo4j | Domain graph analysis |
| Deployment | Docker Compose | Single-command setup |
| Remote Access | Cloudflare Tunnel | Secure monitoring |

### Politeness Features

- Respects `robots.txt` directives
- Honors `crawl-delay` settings
- Per-domain rate limiting
- Configurable concurrent requests

### Quick Start

```bash
# Clone and setup
cd domain-crawler
cp .env.example .env

# Configure credentials in .env

# Start all services
docker-compose up -d

# Seed initial URLs
docker-compose exec crawler python /app/scripts/seed_urls.py

# Monitor progress
docker-compose exec redis redis-cli LLEN ca_crawler:requests
```

### Configuration

Key settings in `.env`:

```env
# Crawler behavior
DOWNLOAD_DELAY=1.0
CONCURRENT_REQUESTS=16
CONCURRENT_REQUESTS_PER_DOMAIN=2
MAX_DEPTH=5
ROBOTSTXT_OBEY=True

# Bloom filter (deduplication)
BLOOM_FILTER_CAPACITY=10000000
BLOOM_FILTER_ERROR_RATE=0.001
```

### Output

The crawler produces:

1. **PostgreSQL tables**: URL metadata, crawl status, timestamps
2. **Neo4j graph**: Domain relationships, link structure
3. **Statistics**: Coverage reports, error logs

---

## Documents

| File | Description |
|------|-------------|
| `What are the top 20 digital services...md` | Core research document |
| `domain-crawler/crawler-implementation.md` | Full crawler specification |
| `domain-crawler/python-source-code.md` | Implementation code |

---

## Folder Structure

```
askca/
├── README.md                           # This file
├── What are the top 20 digital...md    # Services research
└── domain-crawler/
    ├── crawler-implementation.md       # Architecture & setup
    └── python-source-code.md           # Source code
```

---

## Research Questions

The AskCA project explores:

1. **Service Inventory**: What services does California currently offer digitally?
2. **Gap Analysis**: What services are missing or difficult to access?
3. **User Journeys**: How do citizens navigate across agencies?
4. **Consolidation**: Where can services be unified?
5. **Accessibility**: Are services equally available to all Californians?

---

## Related Projects

| Project | Relationship |
|---------|--------------|
| [BizBot](../bizbot/) | Implements business licensing service |
| [CommentBot](../commentbot/) | Implements public engagement service |
| [ADABot](../adabot/) | Ensures accessibility compliance |
| [CA-Strategy](https://github.com/vanderoffice/CA-Strategy) | Strategic planning context |

---

## Future Development

- [ ] Complete domain crawl of all *.ca.gov sites
- [ ] Generate comprehensive service catalog
- [ ] Map user journeys across agencies
- [ ] Identify consolidation opportunities
- [ ] Build service discovery interface

---

*Understanding California's digital landscape to improve citizen services*
