---
phase: 06-deploy-automation
plan: 01
subsystem: infra
tags: [bash, ssh, rsync, docker, docker-compose, psql, pgvector, supabase]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: RAG table schema (document_chunks standard), .env pattern
  - phase: 02-scaffolder
    provides: scaffold.sh flag parsing conventions, sed substitution patterns
  - phase: 05-bot-frontend
    provides: vanderdev-website SPA deploy pattern
provides:
  - setup-supabase-schema.sh (bot + form track schema creation)
  - deploy-bot.sh (SPA rsync deploy to vanderdev-website)
  - deploy-form.sh (Docker container deploy via docker-compose)
affects: [07-factory-orchestrator, 06-02-checklist]

# Tech tracking
tech-stack:
  added: []
  patterns: [ssh-piped-sql, rsync-deploy, docker-compose-remote-build, dry-run-safety]

key-files:
  created:
    - factory/scripts/setup-supabase-schema.sh
    - factory/scripts/deploy-bot.sh
    - factory/scripts/deploy-form.sh
  modified: []

key-decisions:
  - "Transaction-wrapped SQL (BEGIN/COMMIT) for schema setup safety"
  - "Default privileges + explicit GRANT for both anon and authenticated roles"
  - "ERR trap in deploy scripts reports which step failed"
  - "Path-prefix validation requires leading / to prevent routing bugs"

patterns-established:
  - "Deploy script pattern: flag parsing → pre-flight → execute → verify → success"
  - "Dry-run pattern: print commands without executing, usable for docs and verification"

issues-created: []

# Metrics
duration: 3min
completed: 2026-02-08
---

# Phase 6 Plan 1: Deploy Scripts Summary

**Three deploy scripts — Supabase schema setup (bot/form tracks), SPA rsync deploy, Docker container deploy — all with --dry-run safety and scaffold.sh flag conventions**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-08T20:29:40Z
- **Completed:** 2026-02-08T20:32:27Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Supabase schema script handles both tracks: bot (full document_chunks table with pgvector HNSW + dedup index) and form (schema-only with guidance)
- Bot deploy script automates the full build → rsync → verify cycle with PascalCase page detection
- Form deploy script automates rsync → docker-compose up --build → container health check → HTTP verify
- All scripts share consistent flag parsing, validation, error handling from scaffold.sh conventions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create setup-supabase-schema.sh** - `fd6d0e4` (feat)
2. **Task 2: Create deploy-bot.sh** - `3440427` (feat)
3. **Task 3: Create deploy-form.sh** - `cf2ea17` (feat)

## Files Created/Modified
- `factory/scripts/setup-supabase-schema.sh` - Schema + RAG table setup via SSH-piped SQL
- `factory/scripts/deploy-bot.sh` - Bot SPA build + rsync deploy to VPS
- `factory/scripts/deploy-form.sh` - Form Docker container deploy to VPS

## Decisions Made
- Transaction-wrapped SQL (BEGIN/COMMIT) prevents partial schema creation on error
- Default privileges set so future tables auto-inherit anon/authenticated grants
- ERR trap with CURRENT_STEP variable pinpoints exactly which deploy step failed
- Path-prefix must start with `/` — catches the common `/ecosform` vs `ecosform` mistake early

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness
- All 3 deploy scripts ready for use by factory orchestrator (Phase 7)
- Ready for 06-02: DEPLOY-CHECKLIST.md + end-to-end verification

---
*Phase: 06-deploy-automation*
*Completed: 2026-02-08*
