# Phase 4: RAG Content Generation & Ingestion

**Status:** In Progress
**Prerequisite:** Phase 3 Research Complete ✅
**Deliverable:** 100+ new chunks in BizBot, updates to KiddoBot/WaterBot

---

## Step 4.1: Move Research to Permanent Location

Move from /tmp/ to project directory:
```bash
mkdir -p /Users/slate/projects/vanderdev-bots/research/2026
cp /tmp/research_*.md /Users/slate/projects/vanderdev-bots/research/2026/
```

---

## Step 4.2: Generate RAG-Ready Content

Convert each research file into chunked documents with proper metadata.

### Chunk Format
```json
{
  "content": "...",  // 500-1000 tokens
  "category": "...", // e.g., "Industry-Specific Licenses"
  "subcategory": "...", // e.g., "Contractor Licensing"
  "source_urls": ["..."], // Array of official URLs
  "last_verified": "2026-01-18",
  "metadata": {
    "topic": "...",
    "effective_date": "...",
    "fees_current_as_of": "2026"
  }
}
```

### Documents to Generate from Research

**From contractor_licensing_2026.md:**
- [ ] CSLB License Overview (A, B, B-2 classifications)
- [ ] CSLB Class C Specialty Licenses (42 types)
- [ ] CSLB Application Process & Fees
- [ ] CSLB Bonding & Workers' Comp Requirements
- [ ] CSLB 2025-2026 Legislative Changes
- [ ] Handyperson Exemption ($1,000 threshold)

**From restaurant_licensing_2026.md:**
- [ ] Restaurant Health Permit Requirements
- [ ] LA County Health Permit Fees by Size
- [ ] Food Handler Certification (SB 476)
- [ ] MEHKO Home Kitchen Licensing
- [ ] Restaurant Build-Out Cost Guide
- [ ] AB 592 Outdoor Dining & AB 671 Expedited Permitting

**From abc_liquor_licensing_2026.md:**
- [ ] ABC License Types Overview (41 vs 47)
- [ ] Type 41 Beer & Wine License Guide
- [ ] Type 47 Full Liquor License Guide
- [ ] ABC Secondary Market Pricing (LA)
- [ ] LA Restaurant Beverage Program (Streamlined)
- [ ] ABC 2025-2026 Legislative Changes (SB 395, AB 828)

**From cosmetology_barber_licensing_2026.md:**
- [ ] BBC Cosmetologist License Requirements
- [ ] BBC Barber License Requirements
- [ ] BBC Esthetician License Requirements
- [ ] BBC Manicurist License Requirements
- [ ] BBC Exam Format & Languages
- [ ] BBC Fees & Processing Times
- [ ] BBC Crossover Programs

**From real_estate_licensing_2026.md:**
- [ ] DRE Salesperson License Requirements
- [ ] DRE Broker License Requirements
- [ ] DRE Required Courses
- [ ] DRE Exam Details & Pass Rates
- [ ] DRE License Renewal & CE
- [ ] DRE 2025-2026 Legislative Changes (SB 1495)
- [ ] Digitally Altered Photos Disclosure (2026)

**Estimated Total: 30-35 new documents → ~60-100 chunks**

---

## Step 4.3: Generate Embeddings

Use existing ingest pipeline or direct API:

```python
# Using OpenAI text-embedding-3-small
import openai

def generate_embedding(text):
    response = openai.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding  # 1536 dimensions
```

---

## Step 4.4: Database Ingestion

### BizBot Insert
```sql
INSERT INTO bizbot.document_chunks (
    content,
    category,
    subcategory,
    embedding,
    source_urls,
    metadata
) VALUES (
    $1, $2, $3, $4::vector, $5, $6::jsonb
);
```

### Test First
1. Generate 5 test chunks
2. Generate embeddings
3. Insert into database
4. Query via n8n workflow
5. Verify retrieval works

---

## Step 4.5: Fix Broken URLs

Update existing chunks with broken URLs:

```sql
-- BizBot: Fix SOS PDF links
UPDATE bizbot.document_chunks
SET content = REPLACE(content,
    'bpd.cdn.sos.ca.gov/llc/forms/llc-1.pdf',
    'bizfileonline.sos.ca.gov')
WHERE content LIKE '%bpd.cdn.sos.ca.gov/llc/forms/llc-1.pdf%';

-- Similar for SI-100 and WaterBot CIWQS
```

---

## Step 4.6: Additional Research (If Time Permits)

Priority topics not yet researched:
1. Cannabis DCC licensing
2. Childcare CDC licensing
3. Healthcare licensing (medical, dental)
4. Auto repair/dealer licensing

---

## Validation Checkpoint

Before proceeding to Phase 5:
- [ ] All research files in permanent location
- [ ] 30+ new documents generated
- [ ] Embeddings generated successfully
- [ ] Test insertion works
- [ ] Broken URLs fixed in existing content
- [ ] BizBot chunk count increased from 148

---

## Next: Phase 5

After content generation, proceed to:
`/Users/slate/projects/vanderdev-bots/.planning/PLAN-phase5-validation.md`
