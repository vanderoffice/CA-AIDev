# Research Protocol

This document describes the lightweight meta-research methodology used to build KiddoChildCareAssessment.

## Goals

1. **Track costs** — Stay within $75 total budget with stage gates
2. **Ensure quality** — Multi-model cross-validation for accuracy
3. **Learn from process** — Document what works for future projects

## Multi-Model Research Flow

### When to Use Full 5-Step Flow
- Eligibility rules and income limits (high stakes)
- Legal/regulatory requirements
- Anything parents will use to make decisions

### When to Simplify
- **Steps 1-2 only** (Perplexity → Claude): Process walkthroughs, general guides
- **Steps 1-2-4** (skip GPT-4o): County variations, pattern expansion
- **Step 1 only** (Perplexity): URL collection, link gathering

## Per-Run Tracking

After each model run, log to `run-log.csv`:

```csv
run_id,date,stage,section,model,rating,tokens_in,tokens_out,cost_usd,time_min,notes
```

### Rating Scale
| Rating | Meaning |
|--------|---------|
| 5 | Excellent — directly usable, comprehensive, accurate |
| 4 | Good — minor edits needed, solid foundation |
| 3 | Adequate — usable with significant editing |
| 2 | Poor — major gaps, factual issues |
| 1 | Unusable — wrong focus or major errors |

## Budget Controls

### Stage Budgets
| Stage | Cap | Stop Condition |
|-------|-----|----------------|
| 1. Setup & Initial | $10 | Cost/artifact > $2 |
| 2. CalWORKs | $15 | Quality avg < 3/5 |
| 3. Core Subsidies | $15 | Running total > $40 |
| 4. Provider & Costs | $10 | Running total > $50 |
| 5. Special Situations | $15 | Running total > $65 |
| Contingency | $10 | — |

### Checking Spend
```bash
# Via MCP tool
mcp__llm-gateway__llm_usage --days 7

# Manual tracking
cat run-log.csv | awk -F',' '{sum+=$9} END {print "Total: $"sum}'
```

## Files

| File | Purpose |
|------|---------|
| `run-log.csv` | Master log of all research runs |
| `prompts/` | Saved prompts for reproducibility |
| `model-runs/` | Raw outputs for comparison |
| `summaries/baseline.md` | Starting metrics |
| `summaries/weekly-*.md` | Weekly progress reports |
| `summaries/final-report.md` | End-of-project analysis |

## Research Prompts

Effective prompts for childcare research:

### Initial Landscape (Perplexity)
```
Research California's childcare assistance ecosystem. Include:
1. Major state agencies (CDSS, CDE, CDPH roles)
2. Primary subsidy programs (CalWORKs, CCDF, Regional Center)
3. Provider types and licensing tiers
4. County-level implementation variations
5. Recent legislation or policy changes (2024-2025)
Provide citations for all factual claims.
```

### Eligibility Deep-Dive (GPT-4o/Gemini)
```
Verify and expand: [paste Perplexity findings]
Cross-check income limits against official CDSS All-County Letters (ACLs).
Flag any discrepancies or outdated information.
```

### Synthesis (Claude)
```
Create a structured eligibility matrix from the following research:
[paste all model outputs]
Format as markdown table with columns:
- Program name
- Income limits by family size
- Work requirements
- Age eligibility
- Application pathway
Resolve any conflicts between sources, noting which source is authoritative.
```
