# Model Comparison: Business Assessment Research

This document compares the output of four different AI models (ChatGPT-5, Gemini 1.5 Pro, Perplexity Deep Research, and Sonnet 3.5) tasked with researching California State departments involved in business formation and licensing.

## Summary of Models

| Model               | File Name                      | Agencies Covered                                            | Key Strengths                                                                                                                                          | Weaknesses                                                           |
| :------------------ | :----------------------------- | :---------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| **ChatGPT-5**       | `BizInterviews_CGPT5_1.md`     | 4 Core (SOS, CDTFA, EDD, DCA)                               | Concise, focused on "sharp" interview questions. Good cross-agency context section.                                                                    | Limited scope (fewer agencies). Less detailed narratives.            |
| **Gemini 1.5 Pro**  | `BizInterviews_Gemini3P.md`    | 6 (SOS, FTB, EDD, CDTFA, DCA, GO-Biz)                       | Good balance of narrative and questions. Included GO-Biz.                                                                                              | Missed some industry-specific agencies found by others.              |
| **Perplexity Deep** | `BizInterviews_PerplexDeep.md` | **15+** (Core + many specific boards & env/safety agencies) | **Most comprehensive scope.** Excellent breakdown of specific DCA boards and environmental agencies.                                                   | Narrative per agency is slightly shorter to accommodate the breadth. |
| **Sonnet 3.5**      | `BizInterviews_Sonnet4_5.md`   | **12+** (Core + specific boards + env/ag agencies)          | **Highest depth of detail.** Very thorough narratives and well-structured questions. Good coverage of specific boards (Medical, Nursing, Accountancy). | Slightly less breadth than Perplexity, but more depth per item.      |

## Detailed Comparison

### 1. Scope of Coverage

- **Core Agencies (SOS, FTB, EDD, CDTFA):** All models identified the core agencies (SOS, EDD, CDTFA). ChatGPT missed FTB as a primary section, though mentioned it in context.
- **DCA (Consumer Affairs):**
  - **ChatGPT & Gemini:** Treated DCA mostly as a single umbrella entity.
  - **Perplexity & Sonnet:** Broke down DCA into specific boards (CSLB, Nursing, Medical, etc.), providing much more actionable detail for these high-volume licensers.
- **Industry Specifics:**
  - **Perplexity** and **Sonnet** excelled here, identifying ABC (Alcohol), DCC (Cannabis), DRE (Real Estate), and Insurance.
  - **Perplexity** uniquely covered DIR (Industrial Relations) and Pesticide Regulation.
  - **Sonnet** uniquely covered CDFA (Food & Ag) and DTSC (Toxic Substances).
- **Environmental/Safety:**
  - **Perplexity** and **Sonnet** both identified Water Boards and Air Quality Districts/CARB, which are critical for physical businesses.

### 2. Quality of Interview Questions

- **ChatGPT:** Questions were "sharp" and focused on pain points, but general to the agency level.
- **Gemini:** Solid questions, standard "pain point/magic wand" structure.
- **Perplexity:** Good questions, but the sheer volume of agencies meant fewer questions per specific sub-agency in some cases (though it maintained the requested 5).
- **Sonnet:** Excellent, nuanced questions that showed a deeper understanding of the specific agency's workflow (e.g., asking about "provisional license pathways" for Cannabis or "experience verification" for CPAs).

### 3. Focus on AI & Automation

- All models successfully incorporated the request to probe for AI/Automation opportunities.
- **Sonnet** and **Perplexity** provided more specific context in their narratives about _where_ automation might apply (e.g., document verification for medical licenses), making the questions more relevant.

## Conclusion

**Perplexity Deep Research** and **Sonnet 3.5** produced the most useful research documents for this task.

- **Perplexity** is best for a **broad landscape map** to ensure no stakeholder is missed.
- **Sonnet** is best for **deep-dive preparation** for specific high-impact interviews, offering the most detailed context and sophisticated questions.

**ChatGPT** and **Gemini** provided good high-level overviews but lacked the granularity required for a comprehensive "deep research" assessment of the entire ecosystem.
