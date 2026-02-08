---
phase: 02-scaffolder
plan: 01
subsystem: scaffolding
tags: [bash, scaffold, templates, claude-md, symlinks, sed, project-bootstrap]

# Dependency graph
requires:
  - phase: 01-01
    provides: factory directory tree with templates/ and scripts/ structure
  - phase: 01-02
    provides: RAG pipeline scripts (chunk-knowledge.js, embed-chunks.py, validate-knowledge.py)
  - phase: 01-03
    provides: knowledge authoring standard (TEMPLATE.md, 7-field YAML frontmatter)
provides:
  - scaffold.sh script for bootstrapping bot and form projects
  - bot-CLAUDE.md.template with factory standards and memory handoff
  - form-CLAUDE.md.template with Docker/PostgREST standards
affects: [02-gsd-roadmap-templates, 03-research, 07-factory-orchestrator]

# Tech tracking
tech-stack:
  added: []
  patterns: [sed-template-substitution, relative-symlinks-for-portability, track-based-scaffolding]

key-files:
  created:
    - factory/scripts/scaffold.sh
    - factory/templates/bot-CLAUDE.md.template
    - factory/templates/form-CLAUDE.md.template
  modified: []

key-decisions:
  - "Relative symlinks for default bot layout, absolute for custom --output-dir"
  - "No realpath/readlink -f usage for macOS stock bash portability"
  - "sed-based template substitution with 5 placeholders"

patterns-established:
  - "Project scaffolding: --track selects directory structure + default output location + template"
  - "CLAUDE.md template pattern: {{PLACEHOLDER}} markers + sed substitution"
  - "Symlink strategy: relative for known layouts, absolute fallback for custom paths"

issues-created: []

# Metrics
duration: 6min
completed: 2026-02-08
---

# Phase 2 Plan 1: Project Scaffolder + CLAUDE.md Templates Summary

**scaffold.sh bootstraps bot/form projects with correct directory structure, GSD config, pipeline symlinks, and track-specific CLAUDE.md in one command**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-08T04:36:20Z
- **Completed:** 2026-02-08T04:42:32Z
- **Tasks:** 3/3
- **Files created:** 3

## Accomplishments

- scaffold.sh (337 lines) handles both bot and form tracks with full flag validation, directory creation, template substitution, and symlink setup
- Bot CLAUDE.md template embeds factory RAG pipeline standards, memory handoff protocol, and knowledge doc conventions
- Form CLAUDE.md template embeds Docker/PostgREST deploy pattern, basename warning (from ECOS lessons), and schema-per-project standard
- All 34 automated checks passed across bot track (14), form track (16), and error cases (4)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create scaffold.sh** — `9296054` (feat)
2. **Task 2: Create CLAUDE.md templates** — `9e5f539` (feat)
3. **Task 3: Test scaffold for both tracks** — no commit (all tests passed, no fixes needed)

**Plan metadata:** (this commit) (docs: complete plan)

## Files Created

- `factory/scripts/scaffold.sh` — Project scaffolder script (337 lines, executable)
  - Parses --track, --name, --title, --output-dir flags
  - Bot track: knowledge/, scripts/ (3 symlinks), research/, decks/, .planning/, CLAUDE.md, README.md
  - Form track: sql/, src/, research/, decks/, .planning/, CLAUDE.md, README.md
  - 5 placeholder substitutions via sed helper function
  - Relative symlinks for default bot layout, absolute for custom output-dir

- `factory/templates/bot-CLAUDE.md.template` — Bot track CLAUDE.md (45 lines, 5 placeholders)
  - Memory handoff protocol, RAG pipeline references, knowledge doc standards

- `factory/templates/form-CLAUDE.md.template` — Form track CLAUDE.md (46 lines, 5 placeholders)
  - Docker deploy pattern, PostgREST API, basename warning from ECOS experience

## Decisions Made

- Relative symlinks (`../../factory/factory/scripts/`) for default bot layout where directory relationship is known; absolute path fallback when --output-dir overrides the default — keeps projects portable without requiring `realpath`
- sed-based template substitution with pipe delimiter (`s|...|...|g`) to avoid conflicts with path characters in placeholder values
- No shellcheck verification (not installed on this machine) — noted for future

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- scaffold.sh ready for use — Phase 7 orchestrator will call it programmatically
- CLAUDE.md templates ready — each new project gets correct standards from day one
- Ready for 02-02: GSD roadmap templates (bot-ROADMAP.md + form-ROADMAP.md)
- No blockers or concerns

---
*Phase: 02-scaffolder*
*Completed: 2026-02-08*
