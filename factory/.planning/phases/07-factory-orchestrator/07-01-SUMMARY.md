---
phase: 07-factory-orchestrator
plan: 01
type: summary
---

# Summary: Orchestrator Skills + Memory Schema

## Performance

- Started: 2026-02-08T21:03:16Z
- Completed: 2026-02-08T21:09:14Z
- Duration: 6 min
- Deviation: None

## Tasks Completed

### Task 1: Create new-project.md orchestrator skill
Top-level factory entry point at `~/.claude/commands/gov-factory/new-project.md`. Orchestrates the full 8-step pipeline: parse & validate → scaffold → research → build decks → knowledge → RAG ingest (bot only) → GSD init → Memory entities. Supports `--skip-to` for failure recovery and `--dry-run` for preview. Uses Skill tool for sub-skill invocation (skill-orchestrates-skill pattern). File lives outside repo — no git commit.

### Task 2: Create status.md dashboard skill
Memory MCP-backed project dashboard at `~/.claude/commands/gov-factory/status.md`. Overview mode shows all factory projects in a table; detail mode shows per-project pipeline progress checklist. `--refresh` flag rescans filesystem to update stale Memory entities. File lives outside repo — no git commit.

### Task 3: Define Memory entity schema + update SKILL.md
- **MEMORY-SCHEMA.md** (`factory/factory/MEMORY-SCHEMA.md`): Documents 3 entity types (factory_project, factory_domain, factory_deployment), 3 relation types, pipeline stage ordering, naming conventions, and full JSON API examples.
- **SKILL.md** (`~/.claude/commands/gov-factory/SKILL.md`): Updated to reflect complete factory — all 5 skills, 8 scripts, 10+ templates, 3 n8n workflows, 10 documentation entries, and 16 established patterns across all 7 phases.

**Commit:** `3a3a568` feat(07-01): add Memory entity schema and update SKILL.md

## Decisions

| Decision | Rationale |
|----------|-----------|
| Skill files not committed to factory repo | `~/.claude/commands/` is outside the git repo; Claude Code convention for user-level commands |
| --skip-to uses step numbers 1-8 | Matches pipeline display numbering for intuitive recovery |
| Memory-backed status (not filesystem) | Lightweight queries; filesystem only on explicit --refresh |
| Entity naming: `{slug}_{type}` | Consistent, collision-free; domain slug may differ from project slug |

## Issues

None.

## Artifacts

| Artifact | Path |
|----------|------|
| new-project.md | `~/.claude/commands/gov-factory/new-project.md` |
| status.md | `~/.claude/commands/gov-factory/status.md` |
| MEMORY-SCHEMA.md | `factory/factory/MEMORY-SCHEMA.md` |
| SKILL.md (updated) | `~/.claude/commands/gov-factory/SKILL.md` |
