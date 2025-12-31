# URL Database

**Purpose:** Centralized repository of verified URLs for California childcare resources, enabling systematic link checking and easy reference.

---

## Database Files

| File | Contents | Records |
|------|----------|---------|
| [agency_urls.csv](agency_urls.csv) | State and federal agency links | 35+ |
| [program_urls.csv](program_urls.csv) | Program-specific resources and tools | 25+ |
| [county_welfare_urls.csv](county_welfare_urls.csv) | County-level welfare and APP contractors | 50+ |

---

## File Schemas

### agency_urls.csv

| Column | Description |
|--------|-------------|
| Agency_Name | Official agency name |
| Agency_Type | State, Federal |
| URL | Primary website URL |
| Phone | Main contact phone |
| Description | Brief agency/resource description |
| Last_Verified | Month/year URL was verified working (YYYY-MM) |

### program_urls.csv

| Column | Description |
|--------|-------------|
| Program_Name | Program or tool name |
| Program_Type | Search Tool, Resource & Referral, Head Start, etc. |
| URL | Primary URL |
| Phone | Contact phone if available |
| Description | What the resource provides |
| Coverage_Area | Statewide, National, or specific region |
| Last_Verified | Month/year URL was verified working |

### county_welfare_urls.csv

| Column | Description |
|--------|-------------|
| County | California county name |
| Agency_Name | Organization name |
| Agency_Type | County Welfare, CCR&R / APP, Regional Center, etc. |
| URL | Primary website |
| Phone | Main phone number |
| CalWORKs_Contact | Direct CalWORKs page/contact if available |
| APP_Contractor | Name of APP contractor serving county |
| Last_Verified | Month/year URL was verified working |

---

## Usage

### For Document Authors

When adding URLs to documentation:
1. Check this database first to ensure consistency
2. Use the exact URL format from the database
3. Add new URLs to the appropriate CSV file
4. Update `Last_Verified` when confirming a link works

### For Link Validation

Run periodic validation to catch broken links:

```bash
# Simple check with curl (check each URL returns 200)
while IFS=, read -r name type url rest; do
  [ "$url" = "URL" ] && continue  # Skip header
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10)
  [ "$status" != "200" ] && echo "BROKEN: $url ($status)"
done < agency_urls.csv
```

### For Chatbot Integration

The CSV format enables:
- Loading URLs into a vector database for retrieval
- Generating dynamic responses with correct links
- Validating user-provided URLs against known good sources

---

## Key URLs by Category

### Start Here (Essential)

| Resource | URL | For |
|----------|-----|-----|
| MyChildCarePlan.org | https://mychildcareplan.org | Finding childcare & subsidies |
| CCR&R Directory | https://rrnetwork.org/about/r-r-directory | Local help |
| CCLD License Search | https://www.ccld.dss.ca.gov/carefacilitysearch/ | Verify providers |
| 211 | https://211.org | All local services |

### For Subsidy Applicants

| Resource | URL | For |
|----------|-----|-----|
| CDSS Child Care | https://www.cdss.ca.gov/inforesources/child-care-and-development | Subsidy info |
| Head Start Locator | https://eclkc.ohs.acf.hhs.gov/center-locator | Find Head Start |
| TrustLine | https://trustline.org | FFN caregiver check |

### For Special Populations

| Population | URL | Resource |
|------------|-----|----------|
| Military | https://militarychildcare.csd.disa.mil | MilitaryChildCare.com |
| Special Needs | https://www.dds.ca.gov/rc/listings/ | Regional Centers |
| Homeless | https://www.cde.ca.gov/sp/hs/ | CDE Homeless Ed |
| Migrants | https://www.nmshsa.org | National MSHS |

---

## Maintenance Schedule

| Task | Frequency |
|------|-----------|
| Verify all URLs | Quarterly |
| Add new URLs from docs | When documents updated |
| Remove deprecated URLs | As discovered |
| Update agency contact info | Annually |

---

## Data Sources

URLs compiled from:
- Official state agency websites (CDSS, CDE, CDPH, DDS)
- Federal program portals (OHS, HHS, IRS)
- County welfare department sites
- APP contractor websites
- Research and interviews conducted December 2025

---

## Contributing

When adding URLs:
1. Verify the URL loads correctly
2. Confirm it's an official/authoritative source
3. Add to appropriate CSV file
4. Include all required columns
5. Set `Last_Verified` to current month

---

*Last updated: December 2025*
