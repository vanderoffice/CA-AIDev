---
phase: 03-research-decks
plan: 02
subsystem: presentation
tags: [deck-templates, reveal-js, claude-skill, stakeholder, technical, placeholder-mapping]

# Dependency graph
requires:
  - phase: 03-01
    provides: research-domain skill, stakeholder-brief.md template, developer-assessment.md template
provides:
  - stakeholder-deck.md slide template (12 slides, government audience)
  - technical-deck.md slide template (14 slides, developer audience)
  - build-decks.md skill (orchestrates /deck pipeline for HTML generation)
affects: [03-research-to-knowledge, 07-factory-orchestrator]

# Tech tracking
tech-stack:
  added: []
  patterns: [deck-template-placeholder-mapping, skill-orchestrates-skill-pattern]

key-files:
  created:
    - factory/templates/decks/stakeholder-deck.md
    - factory/templates/decks/technical-deck.md
    - ~/.claude/commands/gov-factory/build-decks.md
  modified: []

key-decisions:
  - "Deck templates use same {{PLACEHOLDER}} convention as research output templates — direct mapping"
  - "build-decks skill invokes /deck --present, does NOT reimplement HTML generation"
  - "Skill file at ~/.claude/commands/gov-factory/ (outside repo) — same pattern as research-domain.md"

patterns-established:
  - "Skill-orchestrates-skill: build-decks invokes /deck --present rather than duplicating pipeline"
  - "Template layering: research outputs → deck templates → /deck HTML — each layer adds structure"

issues-created: []

# Metrics
duration: 8min
completed: 2026-02-08
---

# Phase 3 Plan 2: Deck Templates + Build-Decks Skill Summary

**Dual presentation deck templates (stakeholder 12-slide, technical 14-slide) with build-decks orchestration skill that chains research outputs through /deck pipeline to standalone HTML**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-08T05:21:25Z
- **Completed:** 2026-02-08T05:29:00Z
- **Tasks:** 2/2 (+ 1 human-verify checkpoint)
- **Files created:** 3

## Accomplishments

- Stakeholder deck template with 12 slides: exec summary, current state with collapsible pain points, opportunity with big-number metrics, approach flowchart, timeline gantt, risk bar chart, cost-benefit chart, legal/regulatory, stakeholder impact table, recommendation, next steps, Q&A with collapsible sources
- Technical deck template with 14 slides: architecture diagrams, system landscape, data sources table, integration flow, RAG pipeline fit scored chart, architecture recommendation, risk registry, complexity bar chart, implementation phases gantt, dependencies table, tech stack table, development timeline, open questions
- build-decks.md skill that reads research outputs, fills deck templates, invokes `/deck --present` for HTML generation — supports `--stakeholder-only`, `--technical-only`, and `--final` (Phase 7 post-deploy) flags

## Task Commits

Each task was committed atomically:

1. **Task 1: Create deck templates** — `f2dce2e` (feat)
2. **Task 2: Create build-decks.md skill** — (no in-repo commit; file lives at ~/.claude/commands/gov-factory/ outside repo)

**Plan metadata:** (this commit)

_Note: Task 2 produced ~/.claude/commands/gov-factory/build-decks.md which is a user-level Claude command file, not tracked in the factory repo._

## Files Created

- `factory/templates/decks/stakeholder-deck.md` — 12-slide government audience deck template (8 custom blocks: charts, diagrams, collapses)
- `factory/templates/decks/technical-deck.md` — 14-slide developer audience deck template (12 custom blocks)
- `~/.claude/commands/gov-factory/build-decks.md` — Orchestration skill (7.5 KB, 5-step pipeline, error handling, --final flag for Phase 7)

## Decisions Made

- Deck templates use same `{{PLACEHOLDER}}` convention as research output templates — enables direct field mapping without translation layer
- build-decks skill invokes `/deck --present` rather than reimplementing HTML generation — keeps pipeline DRY
- Skill file at `~/.claude/commands/gov-factory/` (outside repo) — consistent with research-domain.md pattern from 03-01

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Deck templates ready: `/gov-factory:build-decks "domain-slug"` will generate both HTML presentations
- Research → deck pipeline complete: research-domain fills briefs → build-decks fills deck templates → /deck generates HTML
- Next plan (03-03) creates research-to-knowledge conversion skill and SKILL.md index
- No blockers or concerns

---
*Phase: 03-research-decks*
*Completed: 2026-02-08*
