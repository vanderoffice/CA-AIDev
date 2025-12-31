# Research Protocol

## Multi-Model Research Methodology

This protocol ensures high-quality, verified information for the BizBot knowledge base using a multi-model approach.

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: PERPLEXITY                                              │
│ - Real-time web search with citations                           │
│ - Captures current regulatory state                             │
│ - Output: Raw findings with source URLs                         │
└─────────────────────────────────┬───────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: CLAUDE                                                  │
│ - Structure into decision trees/matrices                        │
│ - Identify gaps and inconsistencies                             │
│ - Output: Structured draft document                             │
└─────────────────────────────────┬───────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: GPT-4o                                                  │
│ - Fact-check against official sources                           │
│ - Cross-validate numbers, dates, requirements                   │
│ - Output: Verification report with corrections                  │
└─────────────────────────────────┬───────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: GEMINI                                                  │
│ - Find edge cases and exceptions                                │
│ - Pattern recognition across similar requirements               │
│ - Output: Edge case addendum                                    │
└─────────────────────────────────┬───────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: CLAUDE (Final)                                          │
│ - Synthesize all inputs                                         │
│ - Resolve conflicts                                             │
│ - Format for knowledge base                                     │
│ - Output: Final verified document                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quality Gates

| Gate | Requirement | Action if Failed |
|------|-------------|------------------|
| Quality Score | ≥4/5 to proceed | Restart from Step 1 |
| Cost Cap | $2.00 per section max | Review scope, split if needed |
| Source Verification | All claims cited | Flag for manual review |
| Consistency Check | No conflicting info | Escalate for resolution |

---

## Run Log

All research runs are tracked in [run-log.csv](run-log.csv).

### Log Schema

| Field | Description |
|-------|-------------|
| `run_id` | Unique identifier (sequential) |
| `date` | Date of run (YYYY-MM-DD) |
| `section` | Target section (e.g., "01_Entity_Formation") |
| `topic` | Specific topic within section |
| `model` | Model used (perplexity, claude, gpt4o, gemini) |
| `quality_score` | 1-5 rating of output quality |
| `tokens_in` | Input tokens |
| `tokens_out` | Output tokens |
| `cost_usd` | Estimated cost |
| `elapsed_sec` | Time taken |
| `notes` | Any relevant notes |
| `verified_by` | Model/human that verified |

---

## URL Validation

URL health is tracked in the parent directory:
- `url_validation_results.csv` - Full validation results
- `url_fixes_YYYY-MM-DD.md` - Fix logs

### Validation Schedule
- **Monthly:** Automated health check of all URLs
- **Quarterly:** Manual review of flagged URLs
- **As needed:** After major regulatory changes

---

## Document Quality Checklist

Before finalizing any document:

- [ ] All fees verified against official sources
- [ ] All timelines realistic and sourced
- [ ] All URLs tested and working
- [ ] Contact information current
- [ ] No conflicting information
- [ ] Formatted consistently with other docs
- [ ] Edge cases documented
- [ ] Last verified date included

---

## Weekly Summaries

Weekly progress summaries are stored in the `summaries/` directory using the format:
`YYYY-MM-DD-summary.md`

---

*Protocol Version: 1.0*
*Last Updated: 2025-12-31*
