# Project Issues Log

Enhancements discovered during execution. Not critical - address in future phases.

## Open Enhancements

### ISS-002: Cross-industry `general` licenses not auto-included in queries — RESOLVED

- **Discovered:** ISS-001 resolution (2026-02-15)
- **Type:** Enhancement
- **Status:** RESOLVED (2026-02-16, Plan 07-01)
- **Resolution:** Added `OR r.industry_code = 'general'` to n8n Postgres node WHERE clause and created `get_required_licenses()` DB function. Expanded general catalog from 2 to 5 licenses (DBA, SOI, BPP added).

### ISS-003: City/county-specific license requirements — RESOLVED

- **Discovered:** ISS-001 resolution (2026-02-15)
- **Type:** Data
- **Status:** RESOLVED (2026-02-16, Plan 07-02)
- **Resolution:** Seeded city-specific business license data for top 25 CA metros (Los Angeles through Roseville). Added 25 city agencies and 25 city-specific license rows with real fees, URLs, and processing times. Added `hasCityLicense` dedup logic to n8n Code node — city-specific data replaces generic "City Business License ($50-$500)" for seeded cities; generic fallback preserved for 457 non-seeded cities.

### ISS-004: External POST to n8n webhooks blocked by nginx WAF (403) — RESOLVED

- **Discovered:** Phase 5 Task 2 (2026-02-15)
- **Type:** Infrastructure
- **Status:** RESOLVED (2026-02-16, Plan 09-01)
- **Resolution:** Root cause was NOT a WAF or rate-limiting rule — it was the `X-Bot-Token` header requirement added during VPS production hardening (Plan 01-03). The nginx-proxy Docker container's vhost config at `/etc/nginx/vhost.d/n8n.vanderdev.net` requires an `X-Bot-Token` header on all `/webhook/` and `/webhook-test/` requests, returning 403 if missing or incorrect. Fix: Added `N8N_WEBHOOK_HEADERS` constant to `bot_registry.py` (shared SSOT) and updated `audit-webhooks.py` to pass the token header on all webhook test requests. All 3 bot registries (waterbot, bizbot, kiddobot) now include `webhook_headers`. External access confirmed working: all 3 BizBot endpoints return 200 OK.

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
