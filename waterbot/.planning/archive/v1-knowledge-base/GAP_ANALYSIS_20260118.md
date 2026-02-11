# VanderDev Bots - Coverage Gap Analysis

**Date:** 2026-01-18
**Methodology:** Adversarial test set (75 queries) sourced from real user questions, not derived from existing content
**Evaluator:** Semantic similarity search with thresholds: Strong ≥0.40, Acceptable ≥0.30

---

## Executive Summary

| Bot | Coverage | Strong | Acceptable | Weak/None | Assessment |
|-----|----------|--------|------------|-----------|------------|
| **BizBot** | **100%** | 25/25 | 0 | 0 | ✅ Excellent |
| **KiddoBot** | **96%** | 24/25 | 0 | 1 | ✅ Excellent |
| **WaterBot** | **64%** | 10/25 | 6 | 9 | ⚠️ Needs Work |

### Key Finding

BizBot and KiddoBot content successfully answers real user questions — the adversarial test validates genuine coverage, not just circular validation.

**WaterBot has a structural gap:** Content is technical/regulatory (permits, TMDLs, enforcement) but misses **consumer FAQ topics** (common household water concerns).

---

## BizBot Results: 100% Coverage ✅

All 25 adversarial queries returned strong matches (similarity ≥0.40).

### Strongest Matches (>0.65 similarity)
- Restaurant licensing total costs: 0.71
- Cosmetology CE requirements: 0.72
- Contractor bond requirements: 0.68
- Penalty for operating without license: 0.68
- Food truck health permits: 0.65

### Edge Cases Successfully Covered
- DBA vs LLC confusion: ✅
- Multi-jurisdiction licensing: ✅
- Expired license reinstatement: ✅
- Handyman $500 exemption: ✅
- HOA vs permit conflicts: ✅

**Verdict:** BizBot content is comprehensive for real business owner questions. No remediation needed.

---

## KiddoBot Results: 96% Coverage ✅

24/25 adversarial queries returned strong matches.

### One Gap Identified

| Query | Issue | Similarity |
|-------|-------|------------|
| "What's the difference between a family fee and a co-payment?" | Content gap | 0.0 (no results) |

**Root Cause:** KiddoBot content covers family fees but doesn't explicitly distinguish family fees from co-payments (two different payment types in childcare subsidies).

### Strong Coverage Areas
- CalWORKs Stage 1/2/3 differences: 0.76 ✅
- Special needs children (IEP priority): 0.67 ✅
- Foster parent programs: 0.66 ✅
- Income eligibility thresholds: 0.62 ✅
- Parental incapacity need: 0.61 ✅

**Verdict:** KiddoBot content is excellent. One minor gap to address.

---

## WaterBot Results: 64% Coverage ⚠️

Only 10/25 queries achieved strong matches. 9 queries failed (weak or no results).

### Gap Categories

#### Category 1: Zero Content (Topics Not Covered)

| Query | Topic | Expected Coverage |
|-------|-------|-------------------|
| "Is hard water bad for my health or just annoying?" | Hard water | Not a health risk; causes scale buildup, dry skin, appliance damage |
| "My water has a chlorine smell. Is that dangerous?" | Chlorine taste/odor | Disinfection byproduct; safe at treatment levels |
| "My water looks cloudy in the morning. Is something wrong?" | Cloudy water | Usually air bubbles; if persistent, may be sediment |

**DB content check:** 0 mentions of "hard water", "chlorine smell/odor", "cloudy water"

#### Category 2: Content Exists But Doesn't Answer the Question

| Query | Similarity | Issue |
|-------|------------|-------|
| "I got a notice from my water company about a violation. What should I do?" | 0.25 | Content covers violations but not consumer response |
| "What's in my Consumer Confidence Report and how do I read it?" | 0.25 | CCR mentioned 17x but not explained for consumers |
| "Is bottled water safer than tap water?" | 0.23 | Bottled water mentioned 13x but not compared |
| "Will boiling my water make it safe if it's contaminated with nitrates?" | 0.16 | Critical safety info missing |
| "I heard my water district uses recycled water. Is that safe to drink?" | 0.27 | Recycled water covered technically, not for consumers |

#### Category 3: Scope Boundary (May Be Acceptable)

| Query | Similarity | Notes |
|-------|------------|-------|
| "I have a private well. How do I get it tested?" | 0.0 | Private wells mentioned 8x but testing guidance weak |

### Structural Problem

WaterBot content was created around:
- ✅ Water Board regulatory programs
- ✅ Permit types (401 cert, WDRs, MS4)
- ✅ Pollutant categories (PFAS, TMDL, chromium-6)
- ✅ Enforcement and compliance

WaterBot content is **missing**:
- ❌ Consumer FAQ (tap water safety, taste/odor, home testing)
- ❌ Practical guidance (what to do when you get a notice)
- ❌ Common household concerns (hard water, cloudy water)
- ❌ Comparison content (bottled vs tap, when to boil)

---

## Remediation Plan

### KiddoBot (Low Effort)

**Add 1 document:**

```
Topic: Family Fees vs Co-Payments Explained
Content needed:
- Family fee: Income-based payment TO the subsidy program based on family size/income
- Co-payment: Difference between what provider charges and max reimbursement (RMRC)
- Family fee goes to agency; co-payment goes to provider
- Some families pay both, some only one
```

**Estimated time:** 30 minutes

### WaterBot (Medium Effort)

**Create "Consumer Water Quality FAQ" batch with 10-15 documents:**

1. **Tap Water Safety Basics**
   - Is my tap water safe? How to know
   - Understanding your Consumer Confidence Report
   - When to test your own water

2. **Common Water Issues (Non-Regulatory)**
   - Hard water: What it is, health impact (none), appliance impact
   - Chlorine/chloramine taste and odor: Why it's there, safety
   - Cloudy or milky water: Causes (air bubbles, temperature)
   - Discolored water: Rust, sediment, when to worry

3. **Consumer Actions**
   - What to do when you get a violation notice
   - Bottled water vs tap water comparison
   - Home water testing options and certified labs
   - When boiling helps (bacteria) vs when it doesn't (nitrates, arsenic)

4. **Special Situations**
   - Private wells: Testing responsibility, recommended frequency
   - Recycled/reclaimed water: Safety and regulations
   - Post-wildfire water safety concerns
   - Vulnerable populations (pregnant, infants, immunocompromised)

**Estimated time:** 4-6 hours research + content generation

---

## Validation Protocol for New Content

Before adding remediation content, apply the **non-circular validation** approach:

1. ✅ Test new content against the SAME adversarial queries that failed
2. ✅ Require similarity ≥0.40 for previously failing queries
3. ❌ Do NOT create new test queries based on the content you just wrote
4. ✅ Re-run full 75-query test to ensure no regression

---

## Next Steps

| Priority | Bot | Action | Effort |
|----------|-----|--------|--------|
| 1 | KiddoBot | Add family fee vs co-payment doc | 30 min |
| 2 | WaterBot | Create consumer FAQ batch | 4-6 hours |
| 3 | All | Re-run adversarial test after remediation | 30 min |
| 4 | All | Update RESUME.md with final status | 15 min |

---

## Files Created This Session

- `/Users/slate/projects/vanderdev-bots/.planning/adversarial_test_set.json` - 75 test queries
- `/Users/slate/projects/vanderdev-bots/.planning/adversarial_evaluation_20260118_122418.json` - Full results
- `/Users/slate/projects/vanderdev-bots/.planning/coverage_gaps_20260118_122418.json` - Gap details
- `/Users/slate/projects/vanderdev-bots/.planning/GAP_ANALYSIS_20260118.md` - This document
- `/Users/slate/projects/vanderdev-bots/scripts/run_adversarial_evaluation.py` - Evaluation script
