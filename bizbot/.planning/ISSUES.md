# Project Issues Log

Enhancements discovered during execution. Not critical - address in future phases.

## Open Enhancements

### ISS-001: Create `license_requirements` and `license_agencies` PostgreSQL tables

- **Discovered:** Phase 3 Task 2 checkpoint (2026-02-15)
- **Type:** Infrastructure / Data
- **Description:** The n8n workflow `BizBot v4 - License Finder` (orPmNC8zgtOENjUe) queries `license_requirements` JOIN `license_agencies` tables in PostgreSQL, but these tables don't exist. The workflow code (SQL query, enrichment logic, response formatting) is complete — only the database tables and seed data are missing. Without them, the License Finder returns empty results. STATE.md incorrectly claimed "Deterministic matching ALREADY EXISTS" — the workflow code exists but the data layer was never created.
- **Impact:** High — License Finder wizard flow works but returns no data. Frontend handles this gracefully (shows error message instead of crashing).
- **Effort:** Substantial — requires schema design, California licensing data research, and seed data for industry × entity type × location matrix
- **Suggested phase:** Future (dedicated plan or new phase — this is data infrastructure, not UI)

## Closed Enhancements

[Moved here when addressed]
