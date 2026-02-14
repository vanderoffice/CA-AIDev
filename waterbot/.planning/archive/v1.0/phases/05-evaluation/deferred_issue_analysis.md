# Deferred Issue Analysis

**Date:** 2026-02-11
**Context:** Post-overhaul WaterBot DB (179 documents, clean-slate rebuild)
**Thresholds:** STRONG >= 0.40, ACCEPTABLE >= 0.30, WEAK < 0.30

---

## Issue 1: "Conservation as a Way of Life" Retrieval

**Original report:** Query doesn't retrieve doc 50 (below 0.50 similarity).

**Query tested:** "What is conservation as a way of life?"

**Top 5 results:**

| Rank | Doc ID | Similarity | Grade      | Title                                                    |
|------|--------|------------|------------|----------------------------------------------------------|
| 1    | 18     | 0.3913     | ACCEPTABLE | Water Conservation Tips for Residents                    |
| 2    | 54     | 0.3903     | ACCEPTABLE | Save Our Water: California's Conservation Campaign       |
| 3    | 50     | 0.3865     | ACCEPTABLE | Making Conservation a Way of Life: AB 1668 + SB 606     |
| 4    | 49     | 0.3857     | ACCEPTABLE | 20x2020: California's Water Conservation Foundation      |
| 5    | 55     | 0.3716     | ACCEPTABLE | Drought Restrictions vs. Permanent Conservation Rules    |

**Assessment:** ACCEPTABLE (not STRONG, not WEAK)

The target document (id=50, "Making Conservation a Way of Life: AB 1668 + SB 606") ranks 3rd with similarity 0.387. All top 5 results are in the ACCEPTABLE range (0.30-0.40) and are topically relevant -- the query retrieves conservation-related content correctly. The original concern was "below 0.50" but our STRONG threshold is 0.40, so the fact that these are below 0.40 puts them in ACCEPTABLE territory.

The query is inherently broad ("conservation as a way of life" is a policy concept, not a specific fact), which explains the lower similarity vs. more specific queries like "What is PFAS" (0.73 STRONG).

**Verdict:** Partially resolved. Content is retrieved (no gap), but similarity is ACCEPTABLE not STRONG. This is a phrasing/specificity issue, not a content gap. The bot will still surface the correct documents.

**Recommendation:** No action needed. The adversarial eval query wat-035 ("What does water use efficiency mean for California homes and businesses?") covers this same content area and scored 0.621 STRONG. The broad phrasing depresses scores but doesn't prevent retrieval.

---

## Issue 2: "File a complaint" Retrieval

**Original report:** "File complaint" query retrieves no docs -- content gap.

**Query tested:** "How do I file a complaint about my water?"

**Top 4 results:**

| Rank | Doc ID | Similarity | Grade  | Title                                        |
|------|--------|------------|--------|----------------------------------------------|
| 1    | 13     | 0.6080     | STRONG | Reporting Water Quality Problems             |
| 2    | 35     | 0.5388     | STRONG | Water Quality Hotlines and Where to Get Help |
| 3    | 29     | 0.5314     | STRONG | I Got a Water Violation Notice               |
| 4    | 16     | 0.4076     | STRONG | Home Water Testing Guide                     |

**Cross-reference:** Adversarial eval query wat-013 ("Who do I complain to if my water looks or smells bad?") scored 0.5565 STRONG.

**Assessment:** RESOLVED

The original "no docs" result was from the pre-overhaul DB. The rebuilt database now has explicit complaint/reporting content (doc 13: "Reporting Water Quality Problems" and doc 35: "Water Quality Hotlines"). Both score well above the STRONG threshold. This is a direct result of the Phase 03 content rebuild.

**Verdict:** Resolved. The content gap has been filled by the DB rebuild.

**Recommendation:** No action needed.

---

## Issue 3: `file_name` Metadata Always Null

**Original report:** `metadata->>'file_name'` is always null in waterbot_documents.

**SQL test:**
```sql
SELECT COUNT(*) as total, COUNT(metadata->>'file_name') as with_filename
FROM public.waterbot_documents;
-- Result: 179|0
```

**Actual metadata structure (sample):**
```json
{
  "topic": "SAFER Funding Amounts and Cycles",
  "category": "Funding",
  "source_urls": ["https://www.waterboards.ca.gov/safer/"],
  "subcategory": "SAFER Program",
  "last_verified": "2026-01-18"
}
```

**Assessment:** COSMETIC

The `file_name` field was never populated because the waterbot documents were ingested from structured content strings, not from individual files. The metadata instead contains `topic`, `category`, `subcategory`, `source_urls`, and `last_verified` -- which are more useful for source attribution than a filename would be. The chatbot's system prompt uses `metadata->>'topic'` for source citations, not `file_name`.

**Verdict:** Cosmetic. Not a bug -- by design.

**Recommendation:** No action needed. The metadata schema is correct for the ingestion method used. If file-based attribution is ever needed, add a `file_name` field during ingestion, but this is not blocking any functionality.
