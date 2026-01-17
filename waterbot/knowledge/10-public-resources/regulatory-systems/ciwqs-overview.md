# California Integrated Water Quality System (CIWQS)

## Overview

CIWQS is a computer system used by the State and Regional Water Quality Control Boards to:

- Track information about places of environmental interest
- Manage permits and other orders
- Track inspections
- Manage violations and enforcement activities

Launched in July 2005, CIWQS enables the Water Boards to efficiently carry out regulatory functions while providing public access to information.

## Permit Tracking

### Types of Regulatory Measures

CIWQS tracks all regulatory measures issued by California's Water Boards:

- **NPDES permits**: Regulate discharges to surface water (expire up to 5 years from adoption)
- **Waste discharge requirements**: Regulate discharges to land
- **General orders**: Cover categories of similar dischargers
- **Administrative extensions**: Maintain regulatory continuity during permit renewal

### Permit Information Tracked

- Specific discharge limits
- Monitoring requirements and frequencies
- Operational constraints
- Permit modifications and history
- Temporary permits and emergency authorizations

## Electronic Self-Monitoring Reports (eSMR)

### What is eSMR?

The eSMR program enables regulated facilities to electronically submit compliance monitoring data. Currently available for:

- Individual NPDES permit holders
- Enrollees under the statewide general sanitary sewer overflow (SSO) order

### Permittee Entry Template (PET) Tool

The PET Tool is a Microsoft Excel file that:

- Configures data into CIWQS Data Format (CDF)
- Generates zip files for upload
- Can be configured based on permit requirements
- Updated April 2025 with new parameters and methods

### eSMR Data Access

| Access Method | Data Volume | Format |
|---------------|-------------|--------|
| eSMR Data Report | Up to 100,000 data points | Excel |
| eSMR Data by Year (data.ca.gov) | Unlimited | CSV, Parquet |

**Note**: For queries exceeding 100,000 data points, use the California Open Data Portal version.

## Violation Tracking

### Violation Documentation

When facilities fail to comply with permit requirements, violations are entered into CIWQS and tracked through the enforcement process.

### Violation Categories

- Exceeding pollutant discharge limits
- Missing monitoring deadlines
- Failing to implement required pollution prevention measures
- Late monitoring reports (>30 days)

### Mandatory Minimum Penalties (MMPs)

MMPs apply under Water Code sections 13385(h), (i), and 13385.1(a) when:

- **Chronic violations**: Four or more within any 180-day period
- **Acute violations**: Single exceedance of 20% or 40% of permitted limit (depending on constituent)

## Public Reports

### Facility Information

| Report | Description |
|--------|-------------|
| **Facility At-A-Glance** | Comprehensive snapshot: owner, violations, inspections, orders |
| **Interactive Regulated Facilities** | Search by city, county, region, program, permit status |

### Violation Reports

| Report | Description |
|--------|-------------|
| **Interactive Violation Reports** | View by county, regional board, or violation type |
| **Interactive Dismissed Violation Report** | Violations later dismissed by Regional Board staff |

### Enforcement Reports

| Report | Description |
|--------|-------------|
| **Counts of Enforcement Actions** | Enforcement actions by type and regional board |
| **Enforcement Orders** | Formal enforcement actions with links to Board Orders |
| **Penalty Project Report** | SEPs and Compliance Projects with monetary amounts |

## Enforcement Statistics (FY 2024-25)

| Metric | Value |
|--------|-------|
| Informal Enforcement Actions | 2,509 |
| Compliance/Penalty Actions | 1,613 |
| Total Penalties Assessed | ~$29.1 million |

### Penalties by Program

| Program | Actions | Penalties |
|---------|---------|-----------|
| NPDES Wastewater | 275 | $10,809,605 |
| NPDES Stormwater | 3,274 | $2,397,328 |
| All Other Programs | 450 | $15,811,546 |

## How to Search Facilities

### Basic Search

1. Go to [CIWQS Public Reports](https://www.waterboards.ca.gov/ciwqs/publicreports.html)
2. Select report type
3. Enter search criteria (facility name, location, permit number)
4. Drill down for detailed information

### Interactive Search Options

- Filter by city, county, or region
- Select program type (NPDES, WDR, etc.)
- Filter by agency type
- Filter by permit status
- Set date ranges for violations

## GIS Mapping

### Public Sanitary Sewer Systems Incident Map

- Interactive GIS map updated nightly
- Plots all certified sanitary sewer system spills
- Shows spill location, volume, source, and responsible agency

### Private Sewer Laterals Map

- Voluntarily reported spills from private laterals
- Updated nightly

## Data Refresh

All public reports are refreshed nightly to provide current information.

## Related Resources

- [CIWQS Homepage](https://www.waterboards.ca.gov/ciwqs/)
- [CIWQS Public Reports](https://www.waterboards.ca.gov/ciwqs/publicreports.html)
- [eSMR Data on data.ca.gov](https://data.ca.gov)
- [PET Tool and CDF Format](https://www.waterboards.ca.gov/ciwqs/chc_pet_tool.shtml)
