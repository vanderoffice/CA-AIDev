# Compliance Determination Process

## Overview

Compliance determination transforms raw monitoring data into conclusions about whether a discharger meets permit requirements. The process follows specific mathematical rules established in permits and implemented in CIWQS.

## Data Flow

```
Facility Monitoring → Laboratory Analysis → SMR Preparation → CIWQS Submission →
Validation → Limit Comparison → Violation Generation → Enforcement Decision
```

## Limit Types and Compliance Calculations

### Instantaneous Maximum
- **Definition:** Highest value permitted at any single sampling event
- **Compliance:** ANY single result exceeding limit = violation
- **Example:** pH limit 9.0, Sample result 9.2 = Violation

### Daily Maximum
- **Definition:** Highest value permitted on any single day
- **Compliance:** Any daily result exceeding limit = violation for that day
- **Frequency:** Compared each sampling day

### Weekly Average
- **Definition:** Average of samples collected during the week
- **Compliance:** Calculate average of all weekly samples, compare to limit

### Monthly Average
- **Definition:** Average of all samples during the month
- **Special Rule:** If single sample exceeds monthly limit:
  1. Collect 4 additional samples at equal intervals during month
  2. Calculate **median** of all 5 results (not average)
  3. Median determines compliance

### Handling Non-Detects in Calculations

**For Monthly Average with ND/DNQ:**
- If one or both middle values are ND or DNQ
- Median = lower of the two middle values

**For Average Calculations:**
- ND results: Use ½ of MDL
- DNQ results: Use reported estimated value

## Violation Categories in CIWQS

| Code | Violation Type |
|------|---------------|
| ATOX | Acute toxicity effluent limitation |
| CTOX | Chronic toxicity effluent limitation |
| OEV | Other constituent effluent limitation |
| Late Report | Report submitted after due date |
| CHRON | Chronic violation (4+ in 180 days) |

## Automatic Violation Generation

### CIWQS Comparison
System automatically:
1. Receives submitted monitoring data
2. Compares results against permit limits
3. Identifies exceedances
4. Generates violation records

### Violation Record Contents
- Regulatory measure (permit number)
- Facility and monitoring location
- Parameter exceeded
- Sampling date
- Result value
- Permit limit value
- Margin of exceedance (% or absolute)

## Mandatory Minimum Penalty Triggers

### Automatic MMP Violations
CIWQS identifies when violations trigger MMPs:

| Trigger | Definition |
|---------|------------|
| Serious - Group I | ≥40% exceedance |
| Serious - Group II | ≥20% exceedance |
| Chronic | 4+ violations same limit in 180 days |
| Late DMR | >30 days past due |

## Bypass and Upset Provisions

### Bypass Definition (40 CFR §122.41(m))
Intentional diversion of waste streams from any portion of treatment facility.

### Permissible Bypass (No Limit Exceedance)
Allowed if:
- For essential maintenance
- Ensures efficient operation
- No advance notice required

### Bypass Causing Exceedance
Prohibited unless discharger demonstrates:
1. Unavoidable to prevent loss of life, injury, or severe property damage
2. No feasible alternatives existed
3. Required notices submitted

### Upset Definition (40 CFR §122.41(n))
Exceptional incident causing unintentional and temporary noncompliance due to factors beyond reasonable control.

### Upset Does NOT Include:
- Operational error
- Improperly designed facilities
- Inadequate treatment facilities
- Lack of preventive maintenance
- Careless or improper operation

### Upset Affirmative Defense
Discharger must prove:
1. Upset occurred and cause identified
2. Facility was properly operated at time
3. 24-hour notice submitted
4. Complied with remedial measures

**Burden of proof remains on discharger.**

## Compliance Schedules

### Purpose
Allow time to achieve compliance with new/stringent limits when immediate compliance is infeasible.

### Structure
- Interim limits for early years
- Progressively stricter limits
- Final compliance date

### Example Schedule
| Period | Nitrogen Limit |
|--------|---------------|
| Years 1-2 | 15 mg/L (interim) |
| Years 3-4 | 10 mg/L (interim) |
| Year 5+ | 8 mg/L (final) |

### Compliance Monitoring During Schedule
- Report against applicable interim limits
- Demonstrate progress toward compliance
- Missing interim milestones = violation

## Time Schedule Orders (TSOs)

### Definition
Board-issued orders establishing compliance deadlines with potential conditional penalties.

### Relationship to Compliance
- During active TSO, may be exempt from some MMPs
- Must meet TSO milestones
- Missing milestones triggers TSO violation

## Interim Limits

### Definition
Temporary permit limits effective until final compliance achieved.

### Application
- Measured against current interim limit (not final)
- Violations still recorded
- Progress toward final limit tracked

## Staff Review Process

### After CIWQS Submission
1. Staff reviews submitted reports
2. Verifies data accuracy
3. Reviews violation records
4. Identifies patterns/trends
5. Determines enforcement response

### Additional Information Requests
- May request clarification
- May require additional sampling
- May conduct facility inspection

## Public Access to Compliance Data

### Available Information
- Facility monitoring history
- Violation records
- Enforcement actions
- Permit documents

### Transparency Purpose
- Public accountability
- Environmental justice
- Informed community participation

## Common Compliance Calculation Errors

### Averaging Period Mistakes
- Using wrong time period
- Mixing daily and monthly limits
- Incorrect sample count

### Detection Limit Errors
- Using full MDL instead of ½
- Not reporting DNQ estimates
- Wrong substitution values

### Unit Conversion Errors
- mg/L vs μg/L confusion
- Mass vs concentration mixing
- Flow unit inconsistencies

## Inspection and Verification

### Water Board Authority
- Inspect facilities
- Review monitoring equipment
- Examine calibration records
- Verify laboratory analyses
- Audit record-keeping

### Consequences of Discrepancies
- Additional violations
- Penalty enhancement
- Permit modification
- Enhanced monitoring requirements
