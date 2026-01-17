# Guide to Accessing California Water Data

## Quick Start: Which System to Use

| What You Need | Go To |
|---------------|-------|
| Drinking water system information | Drinking Water Watch |
| Failing/at-risk water systems | SAFER Dashboard |
| Groundwater quality data | GAMA GIS |
| Contaminated site cleanup status | GeoTracker |
| Surface water quality | SWAMP Data Dashboard or CEDEN |
| Discharge permit compliance | CIWQS Public Reports |
| Water rights information | CalWATRS (replaced eWRIMS) |
| General water datasets | California Open Data Portal |

## California Open Data Portal

### Accessing Water Data

1. Go to [data.ca.gov](https://data.ca.gov)
2. Navigate to Groups → Water or search "water"
3. Browse 494+ available water datasets
4. Filter by agency, format, or topic

### Download Options

- **Preview**: View data in browser
- **Download**: CSV, JSON, or Excel formats
- **API**: Programmatic access via Socrata API

### Data API Access

```
https://data.ca.gov/api/3/action/datastore_search?resource_id=[RESOURCE_ID]
```

## GAMA GIS: Groundwater Data

### Basic Search

1. Go to [GAMA GIS](https://gamagroundwater.waterboards.ca.gov/gama/gamamap/public/)
2. Use the map interface to navigate to area of interest
3. Click on wells to view water quality data
4. Use query tools for specific contaminants or time periods

### Advanced Queries

- Filter by contaminant type
- Set depth ranges
- Specify time periods
- Query by hydrologic region

### Data Download

- Select wells or areas of interest
- Choose download format
- Export includes standardized analytical results

### Video Tutorials

- "Querying and Downloading Groundwater Data"
- "Understanding Your Download"
- Available on GAMA website

## GeoTracker: Environmental Compliance

### Site Search

1. Go to [GeoTracker](https://geotracker.waterboards.ca.gov)
2. Select Tools → Advanced Search
3. Search by:
   - Site name or global ID
   - Address or location
   - Program type (LUST, Land Disposal, etc.)
   - County or region

### Available Information

- Site status and cleanup phase
- Regulatory history
- Environmental data (soil, vapor, groundwater)
- Remediation documents
- Compliance status

### Data Formats

| File Type | Contents |
|-----------|----------|
| GEO_XY | Latitude/longitude coordinates |
| GEO_Z | Top-of-casing elevation |
| GEO_WELL | Depth-to-water measurements |
| GEO_REPORT | Analytical reports and documents |

## Drinking Water Data

### Drinking Water Watch

1. Go to [Drinking Water Watch](https://sdwis.waterboards.ca.gov/PDWW/)
2. Search by water system number or name
3. View:
   - Violation history
   - Enforcement actions
   - Water quality test results
   - Facility details
   - Monitoring schedules

### SAFER Dashboard

1. Go to [SAFER Dashboard](https://www.waterboards.ca.gov/drinking_water/certlic/drinkingwater/saferdashboard.html)
2. View failing and at-risk systems
3. Data updated daily for failing status
4. Risk assessment refreshed quarterly

### Historical Data Downloads

For historical drinking water quality data (1974-present):

1. Go to DDW EDT Library
2. Download appropriate file:
   - SDWIS1-4.tab files (2011-present)
   - CHEMHIST, CHEMARCH, CHEMXARC (1974-2010)
3. Import into database software (Access, FoxPro)
4. Reference data dictionary for field definitions

**Note**: Large files may exceed Excel row limits. Use database software for full datasets.

## SWAMP Data Dashboard

### Exploring Surface Water Data

1. Go to [SWAMP Data Dashboard](https://gispublic.waterboards.ca.gov/swamp-data/)
2. Select monitoring program or location
3. View water quality trends over time
4. Download data for offline analysis

### Data Types Available

- Water chemistry
- Bioassessment results
- Toxicity data
- Harmful algal bloom records

**Note**: Dashboard is in beta; data is provisional.

## CEDEN Query Tool

### Advanced Queries

1. Go to [CEDEN Query Tool](https://ceden.waterboards.ca.gov/AdvancedQueryTool)
2. Set filters:
   - Project type
   - Monitoring program
   - Location
   - Date range
   - Result category (Water, Benthic, Habitat, etc.)
3. Execute query
4. Export results

### Result Categories

- **Water**: Chemistry and water quality data
- **Benthic**: Macroinvertebrate taxonomy
- **Habitat**: Physical habitat assessments
- **Tissue**: Bioaccumulation data
- **Toxicity**: Toxicity test results

## CIWQS Compliance Data

### Public Reports

1. Go to [CIWQS Public Reports](https://www.waterboards.ca.gov/ciwqs/publicreports.html)
2. Select report type:
   - Facility At-a-Glance
   - Interactive Regulated Facilities
   - Violation Reports
   - Enforcement Actions
   - eSMR Analytical Data

### eSMR Data

For large queries (>100,000 data points):
- Use the California Open Data Portal version
- Available in CSV and Parquet formats
- Spans 2006 to present

## Water Rights Data (CalWATRS)

### Transition from eWRIMS

- eWRIMS decommissioned June 9, 2025
- CalWATRS launched July 2025
- All reporting now through CalWATRS

### CalWATRS Features

- Public record search (no login required)
- Individual logins for water rights holders
- Report diversions
- Manage water rights data
- Request ownership changes

### Resources

- Training videos
- PIN letters for account linking
- Workshops available through County Farm Bureaus

## USGS Water Data APIs

### Available APIs

| API | Data Type |
|-----|-----------|
| Continuous Values | Real-time streamflow, gage height |
| Daily Values | Historical daily summaries |
| Monitoring Locations | Site metadata |
| Time Series Metadata | Collection metadata |
| Water Quality Services | Discrete water quality data |

### API Base URL

```
https://api.waterdata.usgs.gov
```

### OGC-Compliant Services

USGS offers standardized download through Open Geospatial Consortium APIs.

## Data Quality Considerations

### Quality Assurance

- Most data undergoes QA/QC before publication
- SWAMP maintains Quality Assurance Project Plans (QAPPs)
- Check data dictionaries for quality flags

### Data Limitations

- Some data is provisional
- Historical data formats may vary
- Data completeness varies by region and time period
- Update frequencies differ by system

### Best Practices

1. **Verify currency**: Check last update date
2. **Understand sources**: Review data documentation
3. **Check units**: Units may vary between systems
4. **Consider completeness**: Some areas have more monitoring than others
5. **Cross-reference**: Verify critical data across systems when possible

## Getting Help

| System | Contact |
|--------|---------|
| GeoTracker | Geotracker@waterboards.ca.gov / (866) 480-1028 |
| GAMA | gama@waterboards.ca.gov |
| SWAMP | OIMA-Helpdesk@waterboards.ca.gov |
| CEDEN | Contact Regional Data Center |
| DDW/SDWIS | Division of Drinking Water |
| CalWATRS | Division of Water Rights |
