---
phase: 06-deploy-automation
plan: 02
subsystem: infra
tags: [docs, verification, shellcheck, dry-run, deploy]

# Dependency graph
requires:
  - phase: 06-deploy-automation
    plan: 01
    provides: setup-supabase-schema.sh, deploy-bot.sh, deploy-form.sh
provides:
  - DEPLOY-CHECKLIST.md (human reference for full deploy lifecycle)
  - Verified deploy scripts (dry-run matrix, shellcheck, chmod +x)
  - Updated README.md with deploy scripts and Deploy section
affects: [07-factory-orchestrator]

# Tech tracking
tech-stack:
  added: [shellcheck]
  patterns: [dry-run-verification-matrix]

key-files:
  created:
    - factory/DEPLOY-CHECKLIST.md
  modified:
    - factory/README.md

key-decisions:
  - "7 troubleshooting entries covering the most common deploy failures"
  - "Checklist includes manual steps scripts don't automate (n8n import, App.jsx routes, DNS)"

patterns-established:
  - "Deploy checklist as human reference — complements automated scripts"

issues-created: []

# Metrics
duration: 4min
completed: 2026-02-08
---

# Phase 6 Plan 2: Deploy Checklist & Verification Summary

**Deploy checklist created, all 3 scripts verified via dry-run matrix, shellcheck clean, README updated**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-08T20:45:11Z
- **Completed:** 2026-02-08T20:49:17Z
- **Tasks:** 2
- **Files created:** 1
- **Files modified:** 1

## Accomplishments
- DEPLOY-CHECKLIST.md covers the full deploy lifecycle for both bot and form tracks, including manual steps (n8n workflow import, App.jsx route registration, DNS config)
- 7 troubleshooting entries: 502 Bad Gateway, 404 on sub-path, Schema Not Found in PostgREST, Webhook 404, Embedding Dimension Mismatch, Container Exits, basename Double-Prefix
- All 3 deploy scripts pass full verification matrix: --help, --dry-run (bot/form), error cases (invalid input, missing flags)
- shellcheck passes on all 3 scripts (zero errors)
- All 3 scripts are chmod +x
- factory/README.md Scripts table updated from 3 entries to 6 entries
- Deploy section added to README referencing DEPLOY-CHECKLIST.md

## Task Commits

1. **Task 1: Create DEPLOY-CHECKLIST.md** - `798ad28` (feat)
2. **Task 2: Verify deploy scripts and update README** - `3db87f0` (feat)

## Verification Matrix Results

### setup-supabase-schema.sh
- --help: PASS
- --dry-run bot track: PASS (CREATE SCHEMA, CREATE TABLE, CREATE INDEX, GRANT)
- --dry-run form track: PASS (CREATE SCHEMA, GRANT, no document_chunks)
- Invalid schema (INVALID): PASS (error, exit 1)
- Missing --schema: PASS (error, exit 1)
- Missing --track: PASS (error, exit 1)

### deploy-bot.sh
- --help: PASS
- --dry-run: PASS (shows npm build, rsync, curl sequence)
- Missing --name: PASS (error, exit 1)

### deploy-form.sh
- --help: PASS
- --dry-run: PASS (shows rsync, docker-compose, health check, curl sequence)
- Missing --name: PASS (error, exit 1)
- Missing --path-prefix: PASS (error, exit 1)

### Cross-cutting
- shellcheck --severity=error: PASS (all 3 scripts, zero errors)
- chmod +x: PASS (all 3 scripts)

## Files Created/Modified
- `factory/DEPLOY-CHECKLIST.md` - Full deploy lifecycle reference for both tracks
- `factory/README.md` - Added 3 deploy scripts to Scripts table + Deploy section

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- shellcheck was not installed locally; installed via Homebrew (`brew install shellcheck`). Not a deviation -- the plan said to run shellcheck, which implies availability.

## Next Phase Readiness
- Phase 6 complete -- all deploy automation scripts created (06-01) and verified (06-02)
- Ready for Phase 7: Factory orchestrator skill

---
*Phase: 06-deploy-automation*
*Completed: 2026-02-08*
