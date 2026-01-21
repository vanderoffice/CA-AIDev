# Phase 3: Deduplication & Embedding Integrity

## Goal

Ensure zero duplicate chunks and all rows have valid 1536-dimension embeddings across all three bots.

## Success Criteria

- [ ] BizBot: `COUNT(*) - COUNT(DISTINCT md5(content))` = 0
- [ ] KiddoBot: `COUNT(*) - COUNT(DISTINCT md5(chunk_text))` = 0
- [ ] WaterBot: `COUNT(*) - COUNT(DISTINCT md5(content))` = 0
- [ ] All embedding vectors are 1536 dimensions (no truncation/corruption)
- [ ] Zero NULL embeddings across all tables

## Database Reference

| Bot | Schema.Table | Rows | Content Column | Embedding Column |
|-----|--------------|------|----------------|------------------|
| BizBot | public.bizbot_documents | 425 | content | embedding |
| KiddoBot | kiddobot.document_chunks | 1,390 | chunk_text | embedding |
| WaterBot | public.waterbot_documents | 1,253 | content | embedding |

**VPS Access:**
- Host: 100.111.63.3 (Tailscale)
- PostgreSQL: Docker container at 172.18.0.3:5432
- SSH tunnel: `ssh -fN -L 5433:172.18.0.3:5432 root@100.111.63.3`

## Tasks

### Task 1: Establish Database Connection
**Goal:** Set up SSH tunnel and verify access to all three bot tables

**Actions:**
1. Start SSH tunnel to VPS
2. Verify connection to PostgreSQL
3. Confirm access to all three tables with row counts

**Verification:**
```sql
SELECT 'bizbot' as bot, COUNT(*) FROM public.bizbot_documents
UNION ALL
SELECT 'kiddobot', COUNT(*) FROM kiddobot.document_chunks
UNION ALL
SELECT 'waterbot', COUNT(*) FROM public.waterbot_documents;
```

Expected: BizBot ~425, KiddoBot ~1,390, WaterBot ~1,253

---

### Task 2: BizBot Deduplication Check
**Goal:** Verify zero duplicate content in BizBot

**Query:**
```sql
SELECT
    COUNT(*) as total_rows,
    COUNT(DISTINCT md5(content)) as unique_content,
    COUNT(*) - COUNT(DISTINCT md5(content)) as duplicates
FROM public.bizbot_documents;
```

**If duplicates > 0:**
```sql
-- Find duplicate content
SELECT md5(content) as hash, COUNT(*) as count, MIN(id) as keep_id
FROM public.bizbot_documents
GROUP BY md5(content)
HAVING COUNT(*) > 1;
```

**Success:** duplicates = 0

---

### Task 3: KiddoBot Deduplication Check
**Goal:** Verify zero duplicate content in KiddoBot

**Query:**
```sql
SELECT
    COUNT(*) as total_rows,
    COUNT(DISTINCT md5(chunk_text)) as unique_content,
    COUNT(*) - COUNT(DISTINCT md5(chunk_text)) as duplicates
FROM kiddobot.document_chunks;
```

**If duplicates > 0:**
```sql
-- Find duplicate content
SELECT md5(chunk_text) as hash, COUNT(*) as count, MIN(id) as keep_id
FROM kiddobot.document_chunks
GROUP BY md5(chunk_text)
HAVING COUNT(*) > 1;
```

**Success:** duplicates = 0

---

### Task 4: WaterBot Deduplication Check
**Goal:** Verify zero duplicate content in WaterBot

**Query:**
```sql
SELECT
    COUNT(*) as total_rows,
    COUNT(DISTINCT md5(content)) as unique_content,
    COUNT(*) - COUNT(DISTINCT md5(content)) as duplicates
FROM public.waterbot_documents;
```

**If duplicates > 0:**
```sql
-- Find duplicate content
SELECT md5(content) as hash, COUNT(*) as count, MIN(id) as keep_id
FROM public.waterbot_documents
GROUP BY md5(content)
HAVING COUNT(*) > 1;
```

**Success:** duplicates = 0

---

### Task 5: Embedding Integrity Check (All Bots)
**Goal:** Verify all embeddings are valid 1536-dimension vectors with no NULLs

**BizBot:**
```sql
SELECT
    COUNT(*) as total,
    COUNT(embedding) as has_embedding,
    COUNT(*) - COUNT(embedding) as null_embeddings,
    COUNT(CASE WHEN array_length(embedding, 1) = 1536 THEN 1 END) as correct_dimension,
    COUNT(CASE WHEN array_length(embedding, 1) != 1536 THEN 1 END) as wrong_dimension
FROM public.bizbot_documents;
```

**KiddoBot:**
```sql
SELECT
    COUNT(*) as total,
    COUNT(embedding) as has_embedding,
    COUNT(*) - COUNT(embedding) as null_embeddings,
    COUNT(CASE WHEN array_length(embedding, 1) = 1536 THEN 1 END) as correct_dimension,
    COUNT(CASE WHEN array_length(embedding, 1) != 1536 THEN 1 END) as wrong_dimension
FROM kiddobot.document_chunks;
```

**WaterBot:**
```sql
SELECT
    COUNT(*) as total,
    COUNT(embedding) as has_embedding,
    COUNT(*) - COUNT(embedding) as null_embeddings,
    COUNT(CASE WHEN array_length(embedding, 1) = 1536 THEN 1 END) as correct_dimension,
    COUNT(CASE WHEN array_length(embedding, 1) != 1536 THEN 1 END) as wrong_dimension
FROM public.waterbot_documents;
```

**Success:** All bots show null_embeddings = 0, wrong_dimension = 0

---

### Task 6: Remediation (If Needed)
**Goal:** Fix any duplicates or embedding issues discovered

**Deduplication Strategy:**
If duplicates found, delete all but one (keeping lowest ID):
```sql
-- Example for BizBot (adjust table/column for other bots)
DELETE FROM public.bizbot_documents a
USING public.bizbot_documents b
WHERE a.id > b.id
AND md5(a.content) = md5(b.content);
```

**NULL Embedding Strategy:**
If NULL embeddings found, re-embed using existing script:
```bash
python scripts/safe-incremental-embed.py --bot <botname> --ids <comma-separated-ids>
```

**Wrong Dimension Strategy:**
If wrong dimensions found, identify and re-embed those rows.

---

### Task 7: Final Verification
**Goal:** Confirm all quality gates pass

**Combined Check Query:**
```sql
SELECT
    'BizBot' as bot,
    COUNT(*) as total,
    COUNT(*) - COUNT(DISTINCT md5(content)) as duplicates,
    COUNT(*) - COUNT(embedding) as null_embeddings,
    COUNT(CASE WHEN array_length(embedding, 1) != 1536 THEN 1 END) as bad_dims
FROM public.bizbot_documents
UNION ALL
SELECT
    'KiddoBot',
    COUNT(*),
    COUNT(*) - COUNT(DISTINCT md5(chunk_text)),
    COUNT(*) - COUNT(embedding),
    COUNT(CASE WHEN array_length(embedding, 1) != 1536 THEN 1 END)
FROM kiddobot.document_chunks
UNION ALL
SELECT
    'WaterBot',
    COUNT(*),
    COUNT(*) - COUNT(DISTINCT md5(content)),
    COUNT(*) - COUNT(embedding),
    COUNT(CASE WHEN array_length(embedding, 1) != 1536 THEN 1 END)
FROM public.waterbot_documents;
```

**Success Criteria:**
| Bot | duplicates | null_embeddings | bad_dims |
|-----|------------|-----------------|----------|
| BizBot | 0 | 0 | 0 |
| KiddoBot | 0 | 0 | 0 |
| WaterBot | 0 | 0 | 0 |

---

### Task 8: Update Documentation
**Goal:** Record results and update project state

**Actions:**
1. Update STATE.md with Phase 3 results
2. Update ROADMAP.md to mark Phase 3 complete
3. Save findings to memory
4. Create 03-SUMMARY.md with dedup/integrity findings

---

## Dependencies

- SSH access to VPS (100.111.63.3)
- PostgreSQL client (psql or Python psycopg2)
- `scripts/safe-incremental-embed.py` (for remediation if needed)

## Existing Scripts Reference

| Script | Purpose |
|--------|---------|
| `scripts/safe-incremental-embed.py` | Re-embed specific chunks with verification |
| `scripts/validate-all-urls.py` | URL validation (Phase 1) |
| `scripts/content-audit.py` | Content scanning (Phase 2) |

## Notes

- Phase 1.4 already ran basic dedup checks and passed — this is comprehensive verification
- If issues found, investigate root cause before blindly deleting
- Backups exist at `.backups/2026-01-20/` if rollback needed
