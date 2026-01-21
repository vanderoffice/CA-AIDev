# Phase 4: Chunk & Metadata Consistency

## Goal

Validate chunk sizes (target: 100-3000 characters) and metadata accuracy across all three bots, identifying anomalies that could affect retrieval quality.

## Success Criteria

- [ ] Chunk size distribution documented for all bots
- [ ] Oversized chunks (>3000 chars) identified and remediation decided
- [ ] Undersized chunks (<100 chars) identified and remediation decided
- [ ] file_path accuracy validated (KiddoBot, WaterBot)
- [ ] category/subcategory consistency checked across all bots
- [ ] Summary report created with findings

## Schema Reference

| Bot | Table | Content Col | Size Source | file_path | category/subcategory |
|-----|-------|-------------|-------------|-----------|---------------------|
| BizBot | public.bizbot_documents | content | LENGTH(content) | N/A (no file tracking) | metadata JSONB (sparse) |
| KiddoBot | kiddobot.document_chunks | chunk_text | LENGTH(chunk_text) | file_path column | columns |
| WaterBot | public.waterbot_documents | content | metadata->>'char_count' | metadata->>'file_path' | metadata JSONB |

**VPS Access:**
- Host: 100.111.63.3 (Tailscale)
- PostgreSQL: Docker container at 172.18.0.3:5432
- SSH tunnel: `ssh -fN -L 5433:172.18.0.3:5432 root@100.111.63.3`

---

## Tasks

### Task 1: Chunk Size Distribution Analysis

**Goal:** Profile chunk sizes across all bots to understand distribution and identify outliers

**BizBot Query:**
```sql
SELECT
    COUNT(*) as total,
    MIN(LENGTH(content)) as min_chars,
    MAX(LENGTH(content)) as max_chars,
    AVG(LENGTH(content))::int as avg_chars,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY LENGTH(content))::int as median_chars,
    COUNT(CASE WHEN LENGTH(content) < 100 THEN 1 END) as undersized,
    COUNT(CASE WHEN LENGTH(content) > 3000 THEN 1 END) as oversized,
    COUNT(CASE WHEN LENGTH(content) BETWEEN 100 AND 3000 THEN 1 END) as ideal
FROM public.bizbot_documents;
```

**KiddoBot Query:**
```sql
SELECT
    COUNT(*) as total,
    MIN(LENGTH(chunk_text)) as min_chars,
    MAX(LENGTH(chunk_text)) as max_chars,
    AVG(LENGTH(chunk_text))::int as avg_chars,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY LENGTH(chunk_text))::int as median_chars,
    COUNT(CASE WHEN LENGTH(chunk_text) < 100 THEN 1 END) as undersized,
    COUNT(CASE WHEN LENGTH(chunk_text) > 3000 THEN 1 END) as oversized,
    COUNT(CASE WHEN LENGTH(chunk_text) BETWEEN 100 AND 3000 THEN 1 END) as ideal
FROM kiddobot.document_chunks;
```

**WaterBot Query:**
```sql
SELECT
    COUNT(*) as total,
    MIN((metadata->>'char_count')::int) as min_chars,
    MAX((metadata->>'char_count')::int) as max_chars,
    AVG((metadata->>'char_count')::int)::int as avg_chars,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (metadata->>'char_count')::int)::int as median_chars,
    COUNT(CASE WHEN (metadata->>'char_count')::int < 100 THEN 1 END) as undersized,
    COUNT(CASE WHEN (metadata->>'char_count')::int > 3000 THEN 1 END) as oversized,
    COUNT(CASE WHEN (metadata->>'char_count')::int BETWEEN 100 AND 3000 THEN 1 END) as ideal
FROM public.waterbot_documents;
```

**Success:** All bots profiled with distribution documented

---

### Task 2: Oversized Chunk Investigation

**Goal:** Identify chunks >3000 chars and determine if they need splitting

**BizBot - Find oversized:**
```sql
SELECT id, LENGTH(content) as chars, LEFT(content, 100) as preview
FROM public.bizbot_documents
WHERE LENGTH(content) > 3000
ORDER BY LENGTH(content) DESC
LIMIT 20;
```

**KiddoBot - Find oversized:**
```sql
SELECT id, file_name, chunk_index, LENGTH(chunk_text) as chars, LEFT(chunk_text, 100) as preview
FROM kiddobot.document_chunks
WHERE LENGTH(chunk_text) > 3000
ORDER BY LENGTH(chunk_text) DESC
LIMIT 20;
```

**WaterBot - Find oversized:**
```sql
SELECT id, metadata->>'file_name' as file_name, (metadata->>'chunk_index')::int as chunk_idx,
       (metadata->>'char_count')::int as chars, LEFT(content, 100) as preview
FROM public.waterbot_documents
WHERE (metadata->>'char_count')::int > 3000
ORDER BY (metadata->>'char_count')::int DESC
LIMIT 20;
```

**Assessment Questions:**
1. Are oversized chunks a retrieval problem? (semantic search may miss relevant content)
2. Are they natural units (complete forms, tables) that shouldn't be split?
3. What % of total chunks are oversized?

**Decision Matrix:**
| Condition | Action |
|-----------|--------|
| <5% oversized, natural units | Document, no action |
| <5% oversized, could be split | Defer to Phase 5 testing |
| >5% oversized | Remediation required |

---

### Task 3: Undersized Chunk Investigation

**Goal:** Identify chunks <100 chars and assess if they lack context for retrieval

**BizBot - Find undersized:**
```sql
SELECT id, LENGTH(content) as chars, content
FROM public.bizbot_documents
WHERE LENGTH(content) < 100
ORDER BY LENGTH(content)
LIMIT 20;
```

**KiddoBot - Find undersized:**
```sql
SELECT id, file_name, chunk_index, LENGTH(chunk_text) as chars, chunk_text
FROM kiddobot.document_chunks
WHERE LENGTH(chunk_text) < 100
ORDER BY LENGTH(chunk_text)
LIMIT 20;
```

**WaterBot - Find undersized:**
```sql
SELECT id, metadata->>'file_name' as file_name, (metadata->>'chunk_index')::int as chunk_idx,
       (metadata->>'char_count')::int as chars, content
FROM public.waterbot_documents
WHERE (metadata->>'char_count')::int < 100
ORDER BY (metadata->>'char_count')::int
LIMIT 20;
```

**Assessment Questions:**
1. Are these section headers, footnotes, or stub entries?
2. Do they contain meaningful standalone info (phone numbers, addresses)?
3. Should they be merged with adjacent chunks?

**Decision Matrix:**
| Condition | Action |
|-----------|--------|
| Headers/titles only | May need merge or removal |
| Meaningful short content | Keep (contact info, quick facts) |
| Orphaned fragments | Investigate source file |

---

### Task 4: File Path Validation (KiddoBot + WaterBot)

**Goal:** Verify file_path metadata points to actual files in the knowledge base

**Note:** BizBot has no file tracking in its schema — skipped for this task.

**KiddoBot - Extract unique file paths:**
```sql
SELECT DISTINCT file_path, file_name, COUNT(*) as chunk_count
FROM kiddobot.document_chunks
WHERE file_path IS NOT NULL
GROUP BY file_path, file_name
ORDER BY file_path;
```

**WaterBot - Extract unique file paths:**
```sql
SELECT DISTINCT metadata->>'file_path' as file_path,
       metadata->>'file_name' as file_name,
       COUNT(*) as chunk_count
FROM public.waterbot_documents
WHERE metadata->>'file_path' IS NOT NULL
GROUP BY metadata->>'file_path', metadata->>'file_name'
ORDER BY file_path;
```

**Validation Approach:**
1. Export file_path lists to JSON
2. Check each path exists in knowledge base directory:
   - KiddoBot: `kiddobot/KiddoBotKnowledgeBase/`
   - WaterBot: `waterbot/WaterBotKnowledgeBase/`
3. Flag any mismatches

**Success:** All file_path values reference existing files (or document discrepancies)

---

### Task 5: Category/Subcategory Consistency

**Goal:** Validate category/subcategory values are consistent and meaningful

**BizBot - Sparse metadata check:**
```sql
SELECT
    COUNT(*) as total,
    COUNT(metadata->>'category') as has_category,
    COUNT(metadata->>'subcategory') as has_subcategory
FROM public.bizbot_documents;

-- If categories exist, show distribution
SELECT metadata->>'category' as category, COUNT(*) as count
FROM public.bizbot_documents
WHERE metadata->>'category' IS NOT NULL
GROUP BY metadata->>'category'
ORDER BY count DESC;
```

**KiddoBot - Category distribution:**
```sql
SELECT category, subcategory, COUNT(*) as chunk_count
FROM kiddobot.document_chunks
GROUP BY category, subcategory
ORDER BY category, subcategory;

-- Check for NULLs
SELECT
    COUNT(*) as total,
    COUNT(category) as has_category,
    COUNT(subcategory) as has_subcategory,
    COUNT(*) - COUNT(category) as missing_category,
    COUNT(*) - COUNT(subcategory) as missing_subcategory
FROM kiddobot.document_chunks;
```

**WaterBot - Category distribution:**
```sql
SELECT metadata->>'category' as category,
       metadata->>'subcategory' as subcategory,
       COUNT(*) as chunk_count
FROM public.waterbot_documents
GROUP BY metadata->>'category', metadata->>'subcategory'
ORDER BY category, subcategory;

-- Check for NULLs
SELECT
    COUNT(*) as total,
    COUNT(metadata->>'category') as has_category,
    COUNT(metadata->>'subcategory') as has_subcategory
FROM public.waterbot_documents;
```

**Consistency Checks:**
1. Are category names standardized (no typos, consistent casing)?
2. Do subcategories align with parent categories?
3. Are there orphan subcategories without categories?

---

### Task 6: Create Chunk Analysis Script

**Goal:** Build reusable Python script for chunk/metadata analysis

**Script:** `scripts/chunk-analysis.py`

**Features:**
- Connect to all three bot tables
- Generate chunk size histogram data
- Export outliers (oversized/undersized) to JSON
- Validate file paths against local directories
- Output summary report

**Output:** `scripts/chunk-analysis-report.json`

---

### Task 7: Remediation (If Needed)

**Goal:** Fix any critical issues identified in Tasks 2-5

**Potential Actions:**
| Issue | Remediation |
|-------|-------------|
| Oversized chunks (>5%) | Re-chunk with smaller size |
| Undersized orphans | Merge or remove |
| Invalid file_paths | Update metadata or investigate source |
| Missing categories | Backfill from file structure |

**Criteria for Immediate Action:**
- Issue affects >5% of chunks
- Issue causes retrieval failures
- Fix is straightforward (<30 min)

**Criteria for Deferral:**
- Issue is cosmetic (metadata enrichment)
- Requires re-embedding (batch to Phase 5)
- Trade-off unclear (needs query testing first)

---

### Task 8: Update Documentation

**Goal:** Record findings and update project state

**Actions:**
1. Update STATE.md with Phase 4 results
2. Update ROADMAP.md to mark Phase 4 complete
3. Create 04-SUMMARY.md with:
   - Chunk size distributions (all bots)
   - Outlier counts and decisions
   - File path validation results
   - Category consistency findings
   - Recommendations for Phase 5
4. Save key findings to memory

---

## Dependencies

- SSH access to VPS (100.111.63.3)
- PostgreSQL client or Python psycopg2
- Access to local knowledge base directories for file_path validation:
  - `kiddobot/KiddoBotKnowledgeBase/`
  - `waterbot/WaterBotKnowledgeBase/`

## Existing Scripts Reference

| Script | Purpose |
|--------|---------|
| `scripts/validate-all-urls.py` | URL validation (Phase 1) |
| `scripts/content-audit.py` | Content scanning (Phase 2) |
| `bizbot/BizBot_v4/scripts/populate_vectors.py` | BizBot embedding script |
| `waterbot/scripts/embed-chunks.py` | WaterBot embedding script |

## Notes

- BizBot metadata is sparse (LangChain JSON loader output) — focus on chunk sizing, not metadata
- WaterBot already has `char_count` in metadata — use that instead of LENGTH()
- KiddoBot has the richest schema — most validation possible
- Phase 3 verified no duplicates — chunk counts are accurate
- Consider chunk size findings when planning Query Coverage Testing (Phase 5)

## Chunk Size Guidelines (RAG Best Practices)

| Range | Classification | Typical Content | Retrieval Impact |
|-------|----------------|-----------------|------------------|
| <100 chars | Undersized | Headers, stubs | Too little context |
| 100-500 chars | Small | Definitions, quick facts | Good for precise queries |
| 500-1500 chars | Ideal | Paragraphs, procedures | Balanced context |
| 1500-3000 chars | Large | Sections, tables | May dilute relevance |
| >3000 chars | Oversized | Full documents | Semantic search misses |

Target: 80%+ of chunks in 100-3000 char range, majority in 500-1500 "ideal" band.
