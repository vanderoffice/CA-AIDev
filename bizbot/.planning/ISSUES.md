# Project Issues Log

Enhancements discovered during execution. Not critical - address in future phases.

## Open Enhancements

### ISS-002: Cross-industry `general` licenses not auto-included in queries — RESOLVED

- **Discovered:** ISS-001 resolution (2026-02-15)
- **Type:** Enhancement
- **Status:** RESOLVED (2026-02-16, Plan 07-01)
- **Resolution:** Added `OR r.industry_code = 'general'` to n8n Postgres node WHERE clause and created `get_required_licenses()` DB function. Expanded general catalog from 2 to 5 licenses (DBA, SOI, BPP added).

### ISS-003: City/county-specific license requirements

- **Discovered:** ISS-001 resolution (2026-02-15)
- **Type:** Data
- **Status:** OPEN
- **Description:** All seeded licenses are statewide (`is_statewide = true`). The schema supports `city` and `county` columns for location-specific requirements, but no location-specific data has been seeded yet.
- **Impact:** Low — CalGOLD link already directs users to local requirements
- **Effort:** High — would need per-city/county research for 400+ jurisdictions

### ISS-004: External POST to n8n webhooks blocked by nginx WAF (403)

- **Discovered:** Phase 5 Task 2 (2026-02-15)
- **Type:** Infrastructure
- **Status:** OPEN
- **Description:** POST requests from external IPs to `n8n.vanderdev.net/webhook/*` return 403 Forbidden from nginx reverse proxy. This was likely introduced during VPS production hardening (rate limiting / WAF rules). Webhooks themselves are fully functional when accessed internally via docker exec. Production traffic flows through the website frontend and is unaffected.
- **Impact:** Low — audit-webhooks.py script must use VPS-internal verification (SSH + docker exec) instead of direct HTTP. No user-facing impact.
- **Effort:** Medium — would need to allowlist the audit script's IP or add a VPS-internal execution mode to audit-webhooks.py

## Closed Enhancements

### ISS-001: Populate `license_requirements` with industry-specific data — RESOLVED

- **Discovered:** Phase 3 Task 2 checkpoint (2026-02-15)
- **Type:** Data
- **Status:** RESOLVED (2026-02-15)
- **Resolution:**
  - Tables created (`license_agencies` + `license_requirements`) with indexes
  - 17 CA agencies seeded (original 15 + CDFA + DTSC)
  - n8n workflow fixed: `alwaysOutputData: true` on Postgres node
  - 31 industry-specific licenses seeded across 9 industry categories:
    - Food & Beverage (9): health permit, ABC Types 20/41/47/58, processed food, food handler, CFPM, SB 1383
    - Construction (7): CSLB license, bond, workers comp, asbestos, ACRU, lead, hazardous substance
    - Cannabis (4): DCC retail, cultivation, manufacturing, distribution
    - Professional (1): DCA board-specific placeholder
    - Personal (2): barbering/cosmetology, massage therapy (CAMTC)
    - Retail (2): tobacco retailer, weighmaster
    - Manufacturing (2): hazardous waste EPA ID, CalOSHA PSM
    - Transportation (2): CPUC TCP, DMV motor carrier permit
    - General/cross-industry (2): workers comp, IIPP
  - Verified end-to-end: food (12 licenses), construction (9), cannabis (7), personal (5), professional (4)
  - Public webhook confirmed working with X-Bot-Token auth
