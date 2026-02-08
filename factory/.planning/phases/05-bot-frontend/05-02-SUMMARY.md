---
phase: 05-bot-frontend
plan: 02
subsystem: ui
tags: [react, template, decision-tree, scaffold, placeholder]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: decision-tree-schema.json, factory directory structure
  - phase: 04-n8n-templates
    provides: placeholder convention ({{DOUBLE_BRACE}} tokens)
  - plan: 05-01
    provides: shared bot components (ChatMessage, DecisionTreeView, RAGButton, autoLinkUrls)
provides:
  - bot page JSX template (PageComponent.jsx.template)
  - decision tree JSON template (DecisionTree.json.template)
affects: [scaffold.sh bot track, future bot scaffolding]

# Tech tracking
tech-stack:
  added: []
  patterns: [scaffold-ready templates, sed-replaceable placeholders]

key-files:
  created:
    - factory/templates/bot/PageComponent.jsx.template
    - factory/templates/bot/DecisionTree.json.template
  modified: []

key-decisions:
  - "9 placeholders in JSX template (8 required + TOOL_NAME for decision tree title)"
  - "DecisionTree template has 7 nodes (3 question, 4 result) — exceeds minimum to show all patterns"
  - "Result nodes demonstrate 3 variations: ragQuery+links, ragQuery only, links only"
  - "IntakeForm imported but not templated — always domain-specific per bot"
  - "_comment field in JSON for template documentation (JSON has no native comments)"

patterns-established:
  - "Bot page templates use same {{PLACEHOLDER}} convention as n8n templates (Phase 4)"
  - "Decision tree templates conform to decision-tree-schema.json (Phase 1)"
  - "Templates import from ../lib/bots/ — shared component library from 05-01"

issues-created: []

# Metrics
duration: 4min
completed: 2026-02-08
---

# Phase 5 Plan 2: Bot Page & Decision Tree Templates Summary

**Created PageComponent.jsx.template and DecisionTree.json.template with {{PLACEHOLDER}} tokens for scaffold.sh bot track integration**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-08
- **Completed:** 2026-02-08
- **Tasks:** 2
- **Files created:** 2

## Accomplishments

- PageComponent.jsx.template: WaterBot-quality 280-line JSX template with 9 placeholder tokens, 4 modes (choice, intake, chat, tool), shared component imports from lib/bots/
- DecisionTree.json.template: 7-node decision tree (3 question, 4 result) conforming to decision-tree-schema.json with ragQuery and links examples
- Both templates use the established {{PLACEHOLDER}} convention matching Phase 2 (CLAUDE.md) and Phase 4 (n8n) templates
- Inline comments document each placeholder's purpose and source artifact
- No hardcoded bot-specific content in either template

## Task Commits

Each task was committed atomically:

1. **Task 1: Create PageComponent.jsx.template** - `b43e9e5` (feat)
2. **Task 2: Create DecisionTree.json.template** - `2792009` (feat)

## Files Created/Modified

- `factory/templates/bot/PageComponent.jsx.template` - Bot page component with choice screen, chat, tool mode, intake form slot
- `factory/templates/bot/DecisionTree.json.template` - Parameterized decision tree JSON with question and result node examples

## Placeholder Reference

### PageComponent.jsx.template (9 placeholders)

| Placeholder | Purpose |
|-------------|---------|
| `{{BOT_NAME}}` | Display name (e.g., "WaterBot") |
| `{{BOT_SLUG}}` | Lowercase identifier (e.g., "waterbot") |
| `{{BOT_DESCRIPTION}}` | One-line tagline |
| `{{BOT_ICON}}` | Icon component name from Icons.jsx |
| `{{SCHEMA_NAME}}` | Supabase schema name |
| `{{CHAT_WEBHOOK_URL}}` | n8n chat orchestrator endpoint |
| `{{TOOL_WEBHOOK_URL}}` | n8n tool/RAG endpoint |
| `{{PRIMARY_COLOR}}` | Tailwind accent color class |
| `{{TOOL_NAME}}` | Decision tree tool display name |

### DecisionTree.json.template (5 placeholders)

| Placeholder | Purpose |
|-------------|---------|
| `{{BOT_NAME}}` | Display name in metadata title |
| `{{BOT_SLUG}}` | Used in _comment for output filename |
| `{{BOT_DESCRIPTION}}` | Metadata description |
| `{{TOOL_NAME}}` | Metadata title suffix |
| `{{CREATED_DATE}}` | ISO date for lastUpdated field |

## Deviations from Plan

- Added `{{TOOL_NAME}}` as a 9th placeholder (plan specified 8) — needed for the decision tree title and choice screen mode label. This is consistent with the n8n tool-webhook template which also uses `{{TOOL_NAME}}`.

## Issues Encountered

None.

## Next Phase Readiness

- Both templates ready for scaffold.sh `--track bot` integration
- PageComponent.jsx.template imports shared lib/bots/ components from Plan 05-01
- DecisionTree.json.template conforms to Phase 1 JSON schema
- Plan 05-03 (refactor existing bots) can use these templates as reference patterns

---
*Phase: 05-bot-frontend*
*Completed: 2026-02-08*
