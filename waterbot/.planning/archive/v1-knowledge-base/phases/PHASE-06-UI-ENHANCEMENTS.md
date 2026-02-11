# Phase 6: UI Enhancements Post-RAG Remediation

**Created:** 2026-01-18
**Status:** ✅ COMPLETE
**Completed:** 2026-01-18
**Predecessor:** ISSUE-002 Coverage Audit (RESOLVED)
**Scope:** Frontend improvements to surface new RAG content proactively

---

## Context

After completing the RAG knowledge base remediation (ISSUE-002), all three bots achieved 100% coverage on adversarial testing. However, the new content is only accessible via chat - users must know what to ask.

This phase improves the UI to **proactively surface** the new content through:
1. Structured entry points (intake forms, FAQ cards)
2. Educational tooltips
3. Backend process automation

---

## Scope

### In Scope

| Item | Bot | Priority | Effort |
|------|-----|----------|--------|
| Index rebuild automation | All | High | Low |
| Intake questionnaire | WaterBot | High | Medium |
| Consumer FAQ quick-access | WaterBot | Medium | Low |
| Fee vs co-pay tooltip | KiddoBot | Low | Low |

### Out of Scope

- Query analytics pipeline (deferred to future phase)
- Advocacy tools mode for WaterBot (deferred)
- BizBot UI changes (not needed - no RAG content added)

---

## Technical Details

### 1. Index Rebuild Automation

**Problem:** IVFFlat indexes require rebuilding after bulk inserts for new documents to be searchable.

**Solution:** Add automatic REINDEX calls to all ingestion scripts.

**Files to Modify:**
- `/Users/slate/projects/vanderdev-bots/scripts/ingest_waterbot_content.py`
- `/Users/slate/projects/vanderdev-bots/scripts/ingest_remediation_content.py`
- Any future ingestion scripts

**Implementation:**
```python
def rebuild_indexes():
    """Rebuild IVFFlat indexes after bulk insert."""
    indexes = [
        "REINDEX INDEX public.waterbot_documents_embedding_idx;",
        "REINDEX INDEX kiddobot.document_chunks_embedding_idx;",
    ]
    for sql in indexes:
        execute_sql(sql)
        print(f"  Rebuilt: {sql}")
```

---

### 2. WaterBot Intake Questionnaire

**Problem:** WaterBot is the only bot without an intake form. Users get generic responses instead of personalized guidance.

**Solution:** Add intake form matching BizBot/KiddoBot pattern.

**File to Create:**
- `/Users/slate/Documents/GitHub/vanderdev-website/src/components/waterbot/IntakeForm.jsx`

**File to Modify:**
- `/Users/slate/Documents/GitHub/vanderdev-website/src/pages/WaterBot.jsx`

**Questions to Ask:**
1. **User Type:** Homeowner | Renter | Small System Operator | Community Advocate | Other
2. **Primary Concern:** Water quality issue | Permit/compliance question | Funding search | General information
3. **Water System:** Public (city/county) | Private well | Small community system | Don't know
4. **Location:** California county dropdown

**Context Passed to Chat:**
```json
{
  "userType": "homeowner",
  "primaryConcern": "water_quality",
  "waterSystem": "public",
  "county": "Sacramento"
}
```

---

### 3. WaterBot Consumer FAQ Quick-Access

**Problem:** Common residential questions (hard water, chlorine, CCRs) require users to know what to type.

**Solution:** Add quick-access buttons that pre-populate chat with common questions.

**Implementation:** Button grid above chat input:

```jsx
const FAQ_QUESTIONS = [
  { label: "Hard Water", query: "What causes hard water and how can I treat it?" },
  { label: "Chlorine Smell", query: "Why does my water smell like chlorine?" },
  { label: "Read My CCR", query: "How do I read and understand my water quality report?" },
  { label: "Violation Notice", query: "I got a water violation notice. What does it mean?" },
  { label: "Boiling Water", query: "When should I boil my water and what does it actually do?" },
  { label: "Lead in Water", query: "How do I test for lead in my drinking water?" },
];
```

**Visual Design:** 2x3 grid of outline buttons, matches existing UI patterns.

---

### 4. KiddoBot Fee vs Co-Pay Tooltip

**Problem:** Users confuse "family fee" (paid to subsidy program) with "co-payment" (paid to provider).

**Solution:** Add info tooltip next to co-pay display in eligibility calculator.

**File to Modify:**
- `/Users/slate/Documents/GitHub/vanderdev-website/src/components/kiddobot/EligibilityCalculator.jsx`

**Implementation:**
```jsx
<div className="flex items-center gap-2">
  <span>Estimated Co-Pay: ${copay}/month</span>
  <button
    onClick={() => handleFAQClick("What's the difference between family fees and co-payments?")}
    className="text-blue-400 hover:text-blue-300"
    title="Learn about fees vs co-payments"
  >
    <InfoIcon className="w-4 h-4" />
  </button>
</div>
```

**Tooltip Text:** "Co-payments are paid to your provider. Family fees are paid to the subsidy program. Click to learn more."

---

## Execution Checklist

### Backend (vanderdev-bots repo)

- [x] Add `rebuild_indexes()` function to `ingest_waterbot_content.py`
- [x] Add `rebuild_indexes()` function to `ingest_remediation_content.py`
- [x] Verify Python syntax with py_compile
- [x] Update ISSUES.md with automation note

### Frontend (vanderdev-website repo)

- [x] Create `src/components/waterbot/IntakeForm.jsx`
- [x] Add intake form state to `WaterBot.jsx`
- [x] Add FAQ quick-access buttons to `WaterBot.jsx`
- [x] Add waterContext persistence to sessionStorage
- [x] Add tooltip to `EligibilityCalculator.jsx`
- [x] Add `sendProgrammaticMessage` to `KiddoBot.jsx`
- [x] Build verified (`npm run build` successful)
- [x] Deploy to production (pushed to origin/main)

### Documentation

- [x] Created Phase 6 plan document
- [x] Update ISSUES.md change log
- [x] Create session handoff text

---

## Success Criteria

| Criteria | Measurement |
|----------|-------------|
| Index automation works | Run ingestion, verify similarity search finds new docs without manual REINDEX |
| WaterBot intake captures context | Chat receives userType, concern, waterSystem, county |
| FAQ buttons trigger chat | Clicking button sends pre-defined query |
| Tooltip links to content | Clicking info icon sends fee vs co-pay query |

---

## n8n Workflow Integration (Added Late in Phase)

### 5. WaterBot n8n Workflow Fix

**Problem:** IntakeForm collected `waterContext` but n8n workflow ignored it - responses were generic.

**Root Cause Analysis:**
1. **Parse Request node** wasn't extracting `waterContext` from incoming webhook body
2. **Prepare Search node** uses spread operator (`...context`) to pass data forward, but context wasn't set
3. **Build Prompt node** was referencing wrong node - `$('Parse Request').first().json` which has no data after embedding step
4. **n8n versioning issue** - Updated `workflow_entity` but n8n uses `workflow_history` table for execution

**Solution Applied:**
1. Updated **Parse Request** to extract `waterContext`:
   ```javascript
   const waterContext = body.waterContext || null;
   // Include in return json
   ```

2. Updated **Build Prompt** to reference `$('Prepare Search').first().json` instead of `$('Parse Request')`:
   - Prepare Search spreads context forward via `...context`
   - Build Prompt now receives waterContext properly

3. Updated BOTH database tables:
   - `workflow_entity` (id: MY78EVsJL00xPMMw)
   - `workflow_history` (versionId: a87d0160-f93d-469f-b17a-635ff5127673)

4. Used PostgreSQL dollar-quoting for safe JSON insertion:
   ```sql
   UPDATE workflow_entity SET nodes = $json_data$[...]$json_data$::jsonb
   ```

**Verification:**
```bash
curl -s 'https://n8n.vanderdev.net/webhook/waterbot' \
  -H 'Content-Type: application/json' \
  -d '{"message": "What county am I in?", "waterContext": {"county": "Sacramento", "userType": "operator"}}'
```
Response now includes: "you are located in **Sacramento County**" and "you are a **Water System Operator**"

---

## Execution Checklist (UPDATED)

### Backend (vanderdev-bots repo)

- [x] Add `rebuild_indexes()` function to `ingest_waterbot_content.py`
- [x] Add `rebuild_indexes()` function to `ingest_remediation_content.py`
- [x] Verify Python syntax with py_compile
- [x] Update ISSUES.md with automation note

### Frontend (vanderdev-website repo)

- [x] Create `src/components/waterbot/IntakeForm.jsx`
- [x] Add intake form state to `WaterBot.jsx`
- [x] Add FAQ quick-access buttons to `WaterBot.jsx`
- [x] Add waterContext persistence to sessionStorage
- [x] Add tooltip to `EligibilityCalculator.jsx`
- [x] Add `sendProgrammaticMessage` to `KiddoBot.jsx`
- [x] Build verified (`npm run build` successful)
- [x] Deploy to production (pushed to origin/main)

### n8n Workflow (VPS)

- [x] Update Parse Request node to extract waterContext
- [x] Update Build Prompt node to reference Prepare Search
- [x] Update workflow_entity table
- [x] Update workflow_history table
- [x] Restart n8n container
- [x] Verify personalized responses work

### Documentation

- [x] Created Phase 6 plan document
- [x] Update ISSUES.md change log
- [x] Create session handoff text
- [x] Update RESUME.md with final status

---

## Success Criteria (ALL MET ✅)

| Criteria | Measurement | Status |
|----------|-------------|--------|
| Index automation works | Run ingestion, verify similarity search finds new docs | ✅ Verified |
| WaterBot intake captures context | Chat receives userType, concern, waterSystem, county | ✅ Verified |
| FAQ buttons trigger chat | Clicking button sends pre-defined query | ✅ Verified |
| Tooltip links to content | Clicking info icon sends fee vs co-pay query | ✅ Verified |
| **n8n uses waterContext** | Responses acknowledge user's county, type, concern | ✅ Verified |

---

## Phase Complete

**All deliverables verified working and deployed to production.** Project complete.
