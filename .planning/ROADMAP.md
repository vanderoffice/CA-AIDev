# Roadmap: CA-AIDev Bot Data Quality Audit

## Overview

Transform three California state AI assistant bots from "assumed quality" to "verified quality" through systematic auditing of all knowledge base content. Starting with BizBot URL remediation (313 known broken links), then full KiddoBot assessment, followed by cross-bot database integrity checks, content quality validation, and culminating in real-world query testing to ensure bots actually answer user questions correctly.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: URL Remediation (All Bots)** - Fix broken URLs across BizBot, KiddoBot, WaterBot and re-embed
- [x] **Phase 2: Content Quality Audit** - Freshness, factual accuracy, cross-reference validity
- [x] **Phase 3: Deduplication & Embedding Integrity** - Zero duplicates, valid vectors across all bots
- [x] **Phase 4: Chunk & Metadata Consistency** - Chunk sizing and metadata accuracy validation
- [ ] **Phase 5: Query Coverage Testing** - Real user questions retrieve relevant content

## Phase Details

### Phase 1: BizBot URL Remediation
**Goal**: Fix all 313 broken URLs across DIR (78), FTB (68), EDD (63), and other CA state sites; re-embed affected files
**Depends on**: Nothing (first phase)
**Research**: Unlikely (established process documented in docs/URL-VALIDATION.md)
**Plans**: TBD

Key work:
- Fix DIR.ca.gov 404s (78 links)
- Fix FTB.ca.gov 404s (68 links)
- Fix EDD.ca.gov 404s (63 links)
- Fix remaining site 404s (~104 links)
- Re-embed all modified knowledge files
- Verify embeddings in Supabase

### Phase 2: KiddoBot Assessment
**Goal**: Complete quality audit of KiddoBot knowledge base — first time this bot has been assessed
**Depends on**: Nothing (can run parallel to Phase 1 if desired)
**Research**: Unlikely (same URL validation process)
**Plans**: TBD

Key work:
- URL validation scan
- Fix any broken URLs identified
- Deduplication check
- Embedding integrity check
- Document findings

### Phase 3: Deduplication & Embedding Integrity
**Goal**: Ensure zero duplicate chunks and all rows have valid 1536-dimension embeddings across all three bots
**Depends on**: Phase 1, Phase 2 (URL fixes may add/modify chunks)
**Research**: Likely (SQL dedup patterns, pgvector verification)
**Research topics**: Supabase dedup queries, pgvector null/dimension checks, batch dedup strategies
**Plans**: TBD

Key work:
- WaterBot: `COUNT(*) - COUNT(DISTINCT md5(content))` = 0
- BizBot: Same dedup check
- KiddoBot: Same dedup check
- Embedding dimension validation (all = 1536)
- Null embedding detection and remediation

### Phase 4: Content Quality Audit
**Goal**: Verify content freshness, factual accuracy, and cross-reference validity
**Depends on**: Phase 3 (need clean database first)
**Research**: Likely (current CA regulations, program names, statistics)
**Research topics**: Current CA state program info, legislation effective dates, accurate statistics sources
**Plans**: TBD

Key work:
- Outdated date detection (pre-2025 dates that should be current)
- Legislation citation verification
- Program name accuracy (do programs still exist?)
- Statistics currency (are percentages/numbers still accurate?)
- "Related Topics" section validation

### Phase 5: Chunk & Metadata Consistency
**Goal**: Validate chunk sizes (100-3000 chars) and metadata accuracy (file_path, category, subcategory)
**Depends on**: Phase 3 (database must be clean)
**Research**: Unlikely (internal structural validation)
**Plans**: TBD

Key work:
- Chunk size distribution analysis
- Oversized chunk detection and remediation
- Undersized chunk detection (missing context)
- file_path accuracy (does file exist at path?)
- Category/subcategory consistency validation

### Phase 6: Query Coverage Testing
**Goal**: Validate that real user questions retrieve relevant, accurate content
**Depends on**: Phase 4, Phase 5 (content and structure must be validated)
**Research**: Likely (real user question patterns)
**Research topics**: Common user queries, edge cases, retrieval accuracy metrics
**Plans**: TBD

Key work:
- Compile representative user questions per bot
- Test query → retrieval → response quality
- Identify retrieval gaps (questions with no good matches)
- Document coverage metrics
- Final quality sign-off

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. URL Remediation (All Bots) | 1/1 | **COMPLETE** | 2026-01-20 |
| 2. Content Quality Audit | 1/1 | **COMPLETE** | 2026-01-21 |
| 3. Deduplication & Embedding Integrity | 1/1 | **COMPLETE** | 2026-01-21 |
| 4. Chunk & Metadata Consistency | 1/1 | **COMPLETE** | 2026-01-21 |
| 5. Query Coverage Testing | 1/1 | **PLANNED** | - |
