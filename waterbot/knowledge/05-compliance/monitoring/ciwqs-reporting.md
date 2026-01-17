# CIWQS Electronic Reporting

## System Overview

### What is CIWQS?
California Integrated Water Quality System - comprehensive computer system used by State and Regional Water Boards to:
- Track places of environmental interest
- Manage permits and orders
- Track inspections
- Manage violations and enforcement
- Allow online submittal by permittees

### Access
- Public reports: www.waterboards.ca.gov/ciwqs/publicreports.html
- Help: ciwqs@waterboards.ca.gov

## CIWQS Modules

### For Dischargers
| Module | Function |
|--------|----------|
| Submit/Review SMR | Submit electronic Self-Monitoring Reports |
| Run Reports | Access CIWQS reporting options |
| Facility Registration | Register facilities and users |

### User Types
- **Legally Responsible Person (LRP)**: Can certify and submit reports
- **Authorized Users**: Can view and enter data, cannot submit
- **Consultants**: Can prepare reports for LRP certification

## eSMR (Electronic Self-Monitoring Report)

### Definition
Primary mechanism for NPDES permit holders to submit monitoring data electronically.

### Pre-Population
- eSMR tab pre-populated based on permit
- Shows monitoring locations, parameters, reporting periods
- Reduces manual entry errors

### Data Entry Features
- Dropdown menus for standard values
- Field validation
- Error checking before submission
- Save and continue later capability

### eSMR Format Requirements
For each parameter/location:
- Analytical result value
- Units of measurement
- Analytical method code
- Sample collection date
- Detection limits (ML, MDL)

## Electronic Signature

### Process
1. Complete all required data entry
2. Navigate to "Certify & Submit" screen
3. Review summary of information
4. Provide electronic signature

### Legal Effect
- Constitutes legal certification under E-SIGN Act
- Same legal weight as wet signature
- Creates personal liability for LRP

## Submission Status Tracking

| Status | Meaning |
|--------|---------|
| Submitted | Received, not yet reviewed |
| Under Review | Staff actively examining |
| Accepted | Report accepted as submitted |
| Withdrawn | Returned for revision |

### Resubmission Rules
- Only changed data points retransmitted to EPA
- Resubmittal date recorded
- May trigger violation if reveals noncompliance

## Data Validation Rules

### Automatic Error Checks
- Required fields completed
- Date sequences logical
- Results within typical ranges
- Detection limits appropriate
- Calculated values mathematically correct

### Error Check Report
- Documents errors/inconsistencies
- Must resolve before final submission
- Available for discharger review

### Common Error Conditions
- Missing required fields
- Inconsistent date sequences
- Out-of-range values (e.g., pH of 15)
- Detection limit exceeds result value
- Calculation mismatches

## NetDMR Integration

### What is NetDMR?
EPA's federal system for receiving Discharge Monitoring Reports through Central Data Exchange (CDX).

### California Integration
- CIWQS transmits data to EPA's ICIS database
- Automatic federal compliance without separate submission
- California NPDES permits generally don't require direct NetDMR use

### When NetDMR May Be Needed
- Certain federal facilities
- Special reporting requirements
- States without CIWQS-equivalent systems

## EPA Data Transmission

### ICIS (Integrated Compliance Information System)
- Federal database for all national DMR data
- Receives automatic feed from CIWQS
- Used for federal compliance tracking

### Transmitted Data
- DMR monitoring results
- Permit limit comparisons
- Violation records
- Facility information

## Public Reports Available

### Interactive Violation Reports
- Filter by county, regional board, violation type
- Drill down to facility details
- Date range selection

### Violations with Linked Enforcement
- Summary of violations with/without enforcement actions
- Search by occurrence date, program, agency

### Facility-Specific Data
- Monitoring history
- Compliance status
- Permit information

## Technical Support

### CIWQS Help Center
- Email: ciwqs@waterboards.ca.gov
- Phone support available
- User guides and documentation online

### Training Resources
- User manuals
- Webinars
- EPA DMR guidance (common mistakes)

## Bypass Reporting in CIWQS

### Effective December 1, 2025
Bypass events must be reported through eSMR module using "on-call" or notification tab.

### Requirements
- Immediate oral notice for unanticipated bypasses
- Written notice within 5 days
- Electronic submission required

## SSO Reporting

### Sanitary Sewer Overflows
- Separate online SSO database
- Required under State Board Order 2006-0003-DWQ
- Report all SSOs to state database

### Threshold Reporting
SSOs ≥50,000 gallons to surface waters require:
- Water quality monitoring
- Technical report submission
