# Regulatory Data Integration: CIWQS and Water Rights Systems

## System Relationships

CIWQS and the water rights systems (eWRIMS/CalWATRS) serve different but complementary regulatory functions:

| System | Primary Focus | Regulatory Authority |
|--------|--------------|---------------------|
| **CIWQS** | Water quality protection | Regional Water Quality Control Boards |
| **CalWATRS** | Water rights allocation | Division of Water Rights (State Water Board) |

## Why Both Systems Matter

A single water facility or operation might appear in both systems:

### Example: Water Treatment Facility

- **In CIWQS**: Tracked for NPDES permit compliance (discharge limits, monitoring)
- **In CalWATRS**: May hold water rights for raw water diversion upstream

### Example: Agricultural Operation

- **In CIWQS**: Tracked under Irrigated Lands Regulatory Program
- **In CalWATRS**: Holds appropriative or riparian water rights for irrigation

## Cross-Referencing Permits and Rights

### When to Use Both Systems

| Research Question | Start With |
|------------------|------------|
| Is this facility complying with discharge limits? | CIWQS |
| Does this entity have water rights? | CalWATRS |
| What's the full regulatory picture for this operation? | Both |
| Are there water quality violations affecting water availability? | CIWQS |
| Is this diversion authorized? | CalWATRS |

### Linking Records

Currently, there is no automatic cross-reference between CIWQS and CalWATRS. To research a facility comprehensively:

1. Search CIWQS by facility name or location
2. Search CalWATRS by owner name or location
3. Compare results to build complete picture

## Water Rights and Water Quality Intersections

### Enforcement Coordination

Water rights enforcement can intersect with water quality protection:

- Unauthorized diversions may cause water quality impacts
- Enforcement of water rights affects flows supporting water quality
- Regional boards and Division of Water Rights may coordinate on complex cases

### Drought Conditions

During drought:

- Water rights complaints increase (typically 50/year to 200+/year)
- Curtailment orders affect both water availability and quality
- Low flows concentrate pollutants, creating water quality concerns

## Using Regulatory Data for Due Diligence

### Property Transactions

Before purchasing property with water-related operations:

1. **Check CIWQS**: Any permits, violations, or enforcement history
2. **Check CalWATRS**: What water rights exist, their status, and reporting history
3. **Review compliance**: Are all reports filed? Any outstanding violations?

### Business Operations

For ongoing operations:

1. **CIWQS**: Monitor your compliance status, upcoming reporting deadlines
2. **CalWATRS**: Ensure annual reports are filed, measurement data submitted

## Data Export and Reporting

### CIWQS Exports

- Excel format for standard reports
- CSV/Parquet via California Open Data Portal for large datasets
- API access for programmatic queries

### CalWATRS Exports

- Individual water right records
- Annual report data
- Historical diversion information

## Common Research Workflows

### Workflow 1: Facility Compliance Review

1. Access CIWQS Public Reports
2. Search by facility name or location
3. Review Facility At-A-Glance report
4. Check violation history and enforcement actions
5. Review eSMR data for detailed monitoring results

### Workflow 2: Water Rights Research

1. Access CalWATRS
2. Search by owner, location, or watershed
3. Review permit/license details
4. Check statement of diversion history
5. Verify annual report filing status

### Workflow 3: Comprehensive Due Diligence

1. Define geographic area of interest
2. Search CIWQS for all regulated facilities in area
3. Search CalWATRS for all water rights in area
4. Cross-reference owners and locations
5. Identify potential conflicts or compliance issues

## Water Rights Complaints

### Filing a Complaint

Complaints about water rights violations should:

1. Be submitted through CalEPA Environmental Complaint System
2. Include source name (stream, spring, etc.)
3. Provide location (APN, address, or coordinates)
4. Describe the alleged violation

### Complaint Investigation Process

| Stage | Typical Timeline |
|-------|------------------|
| Initial Review | Weeks |
| Preliminary Investigation | Months |
| Full Investigation | Months to years |
| Report of Investigation | 30-day comment period |

### Prioritization Factors

Division of Water Rights prioritizes complaints based on:

- Amount of alleged unauthorized diversion
- Stream type affected
- Public trust and drinking water impacts
- Watershed-specific factors

## System Limitations

### What These Systems Don't Tell You

- **Groundwater rights**: Limited tracking (except subterranean streams)
- **Riparian rights**: Self-reported, not adjudicated
- **Pre-1914 rights**: Self-reported, may lack documentation
- **Water availability**: Systems track rights, not actual water availability

### Data Quality Considerations

- CIWQS data is as accurate as facility self-reporting
- CalWATRS statements are not verified water rights
- Historical records may have gaps or inconsistencies
- Recent transitions (eWRIMS to CalWATRS) may cause temporary data issues

## Related Resources

- [CIWQS Public Reports](https://www.waterboards.ca.gov/ciwqs/publicreports.html)
- [CalWATRS](https://www.waterboards.ca.gov/upward/calwatrs/)
- [Division of Water Rights Complaints](https://www.waterboards.ca.gov/waterrights/water_issues/programs/enforcement/complaints/)
- [Water Boards Compliance and Enforcement](https://www.waterboards.ca.gov/resources/data_databases/compliance_enforcement.html)
