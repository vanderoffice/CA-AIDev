---
phase: 03-research-decks
plan: 01
subsystem: research
tags: [perplexity-mcp, memory-mcp, subagent-orchestration, claude-skill, templates]

# Dependency graph
requires:
  - phase: 01-03
    provides: Knowledge authoring standard (H2 boundaries, 7-field frontmatter, 500-1500 char sections)
provides:
  - research-domain.md skill (5-perspective parallel research orchestration)
  - stakeholder-brief.md template (executive-facing research output)
  - developer-assessment.md template (technical-facing research output)
affects: [03-research-to-knowledge, 03-presentation-decks, 07-factory-orchestrator]

# Tech tracking
tech-stack:
  added: []
  patterns: [parallel-subagent-dispatch, triple-output-synthesis, domain-prefixed-memory-entities]

key-files:
  created:
    - ~/.claude/commands/gov-factory/research-domain.md
    - factory/templates/decks/stakeholder-brief.md
    - factory/templates/decks/developer-assessment.md
  modified: []

key-decisions:
  - "Renamed 'Regulatory' perspective to 'Legal & Regulatory' per user request — broader coverage of laws + regulations"
  - "Skill file lives at ~/.claude/commands/ (user-level, outside repo) — auto-discovered by Claude Code"
  - "ToolSearch step required before Perplexity/Memory MCP calls — deferred tools must be loaded first"

patterns-established:
  - "Parallel subagent pattern: 5 Task calls in single message, each with perspective-specific prompt"
  - "Domain-prefixed Memory entities: {domain_slug}_ prefix prevents cross-domain collisions"
  - "Triple output: executive brief + technical assessment + machine-readable Memory entities"

issues-created: []

# Metrics
duration: 9min
completed: 2026-02-08
---

# Phase 3 Plan 1: Research Domain Skill Summary

**Multi-perspective research orchestration skill with 5 parallel subagents (Legal & Regulatory, Stakeholder, Technical, Fiscal, Existing Systems) synthesizing into stakeholder brief, developer assessment, and Memory MCP entities**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-08T05:08:36Z
- **Completed:** 2026-02-08T05:18:00Z
- **Tasks:** 2/2
- **Files created:** 3

## Accomplishments

- research-domain.md skill created as Claude Code command — dispatches 5 parallel subagents via Task tool, each using Perplexity MCP for current research, with depth flag controlling tool selection
- Two output templates (stakeholder-brief.md, developer-assessment.md) with {{PLACEHOLDER}} convention matching scaffold.sh pattern and --- slide boundaries for /deck integration
- Memory entity schema with domain-prefixed naming (GOVERNED_BY, SERVES, USES relations) to persist research across sessions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create research-domain.md skill** — (no in-repo commit; file lives at ~/.claude/commands/gov-factory/ outside repo)
2. **Task 2: Create research output templates** — `eddf415` (feat)

**Plan metadata:** (this commit)

_Note: Task 1 produced ~/.claude/commands/gov-factory/research-domain.md which is a user-level Claude command file, not tracked in the factory repo. It is auto-discovered by Claude Code._

## Files Created

- `~/.claude/commands/gov-factory/research-domain.md` — Research orchestration skill (14.5 KB, 5 subagent prompts, triple output spec, Memory entity schema, error handling)
- `factory/templates/decks/stakeholder-brief.md` — Executive-facing template (6 sections, 10 placeholders)
- `factory/templates/decks/developer-assessment.md` — Technical-facing template (8 sections, 13 placeholders, risk registry table)

## Decisions Made

- Renamed "Regulatory" to "Legal & Regulatory" — user requested broader coverage of both laws and regulations in a single perspective
- Skill file placed at `~/.claude/commands/gov-factory/` (outside repo) — follows Claude Code convention for user-level commands, auto-discovered without configuration
- Added ToolSearch step to skill — Perplexity and Memory MCP tools are deferred and must be loaded before subagents can use them

## Deviations from Plan

None — plan executed as written with one user-requested modification (perspective rename).

## Issues Encountered

None

## Next Phase Readiness

- Research skill ready for use: `/gov-factory:research-domain "domain"`
- Templates ready for synthesis step to fill
- Next plan (03-02) can build presentation deck templates and build-decks.md skill
- No blockers or concerns

---
*Phase: 03-research-decks*
*Completed: 2026-02-08*
